import os
import sys

# Add the parent directory to sys.path so we can import from backend/
# But wait, on Vercel, the root is the project root.
# For simplicity and reliability in Serverless, let's duplicate the main.py logic here
# OR import it if the structure allows.
# Given Vercel function isolation, it's safer to have the app instance here.

# Let's try to import the app from backend.main
# If we simply do:
# from backend.main import app
# It might fail if sys.path isn't right.

# Let's inspect what's currently there.
# (I will overwrite it with the full content of backend/main.py to be 100% sure).

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import List, Optional
from tavily import TavilyClient
import google.generativeai as genai
import json
from datetime import datetime

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '../backend/.env') # Point to backend .env if local
load_dotenv(dotenv_path)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Service Imports (Adjusted for Vercel Root) ---
# We need to make sure 'backend' folder is importable, or we move services to root?
# On Vercel, 'api' is usually standalone.
# To be safe, I will include the critical classes INLINE or try to adjust sys.path.

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..')) # Add root to path

try:
    from backend.services.search_manager import SearchManager
except ImportError:
    # If import fails (Vercel pathing), we might need to redefine or fix structure.
    # Let's assume the relative import works if we added parent to path.
    # Fallback: Copy SearchManager? No, that's too big.
    # Let's hope Vercel deploys the whole repo (it usually does).
    from backend.services.search_manager import SearchManager

from supabase import create_client, Client

# Initialize Clients
tavily_api_key = os.getenv("TAVILY_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Supabase Setup
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

supabase: Client = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Supabase Init Failed: {e}")

# Initialize Services
search_manager = SearchManager()

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None

# --- Helper: Fetch System Prompt Dynamic ---
def fetch_system_prompt():
    default_prompt = """You are Ansimssi (안심씨), a highly capable AI Assistant specializing in Health, Safety, and Daily Life..."""
    
    if not supabase:
        return default_prompt

    try:
        response = supabase.table('prompt_config').select('content').eq('key', 'main_system_prompt').execute()
        if response.data and len(response.data) > 0:
            print("loaded system prompt from DB")
            return response.data[0]['content']
    except Exception as e:
        print(f"DB Prompt Fetch Error: {e}")
    
    return default_prompt

class SearchRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None

class Source(BaseModel):
    title: str
    url: str
    content: str

class SearchResponse(BaseModel):
    answer: str
    disclaimer: str
    sources: List[Source]
    images: List[str]
    academic: List[dict]
    related_questions: List[str]

from fastapi.responses import StreamingResponse

@app.post("/api/search")
async def search(request: SearchRequest):
    if not model:
        print("Error: Gemini Model not initialized (Key missing?)")
        raise HTTPException(status_code=500, detail="Gemini Key missing")

    async def event_generator():
        try:
            # === 0. AFFIRMATIVE INTENT INTERCEPTOR (Sero Doctor) ===
            affirmative_keywords = ["네", "응", "어", "연결해줘", "비대면진료", "새로닥터", "상담할래", "진료받을래"]
            cleaned_query = request.query.strip().replace(" ", "")
            is_affirmative = (
                cleaned_query in ["네", "예", "응", "어", "네부탁해요", "네연결해줘", "연결해줘"] or 
                any(k in cleaned_query for k in ["비대면진료연결", "새로닥터연결", "상담연결"])
            )

            if is_affirmative:
                yield json.dumps({"type": "meta", "sources": [], "images": [], "disclaimer": ""}) + "\n"
                answer = """## 🏥 새로닥터 연결\n\n네, 알겠습니다. **안심씨의 AI 주치의 서비스**를 통해 전문의와 상담하실 수 있도록 **새로닥터 비대면 진료**를 연결하겠습니다.\n\n화면의 안내에 따라 증상을 선택하시면 곧바로 진료 접수가 진행됩니다. 잠시만 기다려주세요..."""
                yield json.dumps({"type": "content", "delta": answer}) + "\n"
                yield json.dumps({"type": "done", "related_questions": ["비대면 진료는 어떻게 진행되나요?", "진료비는 얼마인가요?"]}) + "\n"
                return

            # 0. RAG: Check Medical Knowledge Base first
            rag_context = ""
            try:
                # Path adjustment for Vercel
                # backend/data/medical_data.json
                json_path = os.path.join(os.path.dirname(__file__), '../backend/data', 'medical_data.json')
                if os.path.exists(json_path):
                    with open(json_path, 'r', encoding='utf-8') as f:
                        medical_knowledge = json.load(f)
                    
                    for item in medical_knowledge:
                        for keyword in item.get('keywords', []):
                            if keyword in request.query:
                                rag_context += f"\n\n[OFFICIAL HEALTH GUIDELINE]\n{item['content']}"
                                break
            except Exception as e:
                print(f"RAG Error: {e}")

            # 1. 5-Tier Hybrid Search (Async)
            from datetime import datetime
            today_str = datetime.now().strftime("%Y-%m-%d")
            search_query = request.query
            if any(w in request.query for w in ["오늘", "날씨", "뉴스", "today", "weather", "news"]):
                search_query = f"{search_query} {today_str}"
                
            results, images, source_engine = await search_manager.search(search_query)
            academic_papers = search_manager.search_academic(search_query)

            # Map sources for Frontend
            frontend_sources = [
                {"title": r['title'], "url": r.get('url', r.get('link', '#')), "content": r['content']}
                for r in results[:5] 
                if 'title' in r and 'content' in r
            ]

            # [STREAM START] Yield Metadata Event
            yield json.dumps({
                "type": "meta",
                "sources": frontend_sources,
                "images": images, 
                "disclaimer": "",
                "academic": academic_papers
            }) + "\n"

            # Format context
            search_context = "\n\n".join([f"Source '{r['title']}': {r['content']}" for r in results[:5]])
            full_context = f"{rag_context}\n\n=== WEB SEARCH RESULTS (Source: {source_engine}) ===\n{search_context}"

            # 2. Generate Answer with Gemini (Streaming)
            system_prompt_content = fetch_system_prompt()
            if "System Prompt" in system_prompt_content and len(system_prompt_content) < 100:
                 system_prompt = """You are Ansimssi (안심씨)...""" # Default
            else:
                 system_prompt = system_prompt_content

            today_date = datetime.now().strftime("%Y-%m-%d")
            
            prompt = f"""
            {system_prompt}

            **Current Request**:
            Query: {request.query}
            Context: {full_context}

            **STRICT Format Instruction (Gemini Visual Blueprint)**:
            Use `---` separators between sections.

            **1. The Intro (Summary)**
            - Start directly with a brief, empathetic summary (1-2 lines).
            - **IMMEDIATELY FOLLOW with a horizontal rule (`---`).**

            **2. The Body (Main Advice)**
            - Use **Numbered Headers** (e.g., **1. Header Name**) for main points.
            - Use beaded bullets inside sections.
            - Max 5 sections.
            - **IMMEDIATELY FOLLOW with a horizontal rule (`---`).**

            **3. The Caution (⚠️)**
            - IF AND ONLY IF medical/safety context:
            - **Title**: **"⚠️ 이럴 때는 반드시 전문가와 상담하세요"**
            - List critical warning signs.
            - If not medical/safety, OMIT this entire section (including the divider above).

            **4. The Closing (Interactive)**
            - A specific, empathetic question to continue the dialogue.
            - Example: "지금 어떤 증상이 가장 심하신가요?"

            **Output Logic**:
            [Summary]
            
            ---
            
            [Numbered Body 1...5]
            
            ---
            
            [Caution if applicable]
            [Closing Question]

            **Prohibitions**:
            - NO "Based on..." intro.
            - NO JSON.
            - NO "Related Questions" text list (UI handles it).
            - NO code blocks.
            - **NO "Go search on Google/Naver"**: YOU are the search engine. Use the provided Context to answer. Do NOT tell the user to manually search.
            - **NO Lazy Redirection**: Synthesize the answer yourself.

            OUTPUT FORMAT: Raw Markdown text only.
            """
            
            prompt = f"{prompt}\n\n[SYSTEM NOTE: Today is {today_date}.]\n\nContext:\n{full_context}\n\nQuery: {request.query}"

            # Stream Content
            response_stream = model.generate_content(prompt, stream=True)
            
            full_answer_text = ""
            for chunk in response_stream:
                if chunk.text:
                    full_answer_text += chunk.text
                    yield json.dumps({"type": "content", "delta": chunk.text}) + "\n"

            related_questions = [
                f"{request.query}에 대해 더 자세히 알려줘",
                f"{request.query} 관련 최신 정보는?",
                "다른 추천 사항이 있나요?"
            ]
            
            yield json.dumps({
                "type": "done", 
                "related_questions": related_questions
            }) + "\n"
            
            # --- SELF IMPROVEMENT LOOP (Async) ---
            if source_engine in ["google", "tavily", "exa", "brave"] and full_answer_text and len(frontend_sources) > 0:
                 try:
                     search_manager.knowledge_base.save_interaction(
                         query=request.query,
                         response_data={
                             "answer": full_answer_text,
                             "sources": results[:5],
                             "images": images,
                             "academic": academic_papers
                         }
                     )
                 except:
                     pass

        except Exception as e:
            print(f"Stream Error: {e}")
            yield json.dumps({"type": "error", "message": str(e)}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

@app.get("/api/admin/users")
async def get_admin_users():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    try:
        response = supabase.auth.admin.list_users()
        users_data = []
        for user in response:
             users_data.append({
                 "id": user.id,
                 "email": user.email,
                 "created_at": user.created_at,
                 "last_sign_in_at": user.last_sign_in_at,
                 "user_metadata": user.user_metadata,
                 "app_metadata": user.app_metadata # Contains provider info
             })
        users_data.sort(key=lambda x: x['created_at'], reverse=True)
        return {"users": users_data}
    except Exception as e:
        print(f"Admin User Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health-data")
async def get_health_data():
    return {"status": "ok", "data": "Health data placeholder"}

@app.get("/api/suggest")
async def get_suggestions(q: str):
    if not q:
        return []
    try:
        url = f"http://suggestqueries.google.com/complete/search?client=firefox&q={q}"
        response = requests.get(url, timeout=2)
        if response.status_code == 200:
            data = response.json()
            suggestions = data[1]
            results = []
            for text in suggestions[:6]:
                type_ = "search"
                if any(x in text for x in ["방법", "법", "how to", "guide", "tip"]):
                    type_ = "tips"
                elif any(x in text for x in ["병원", "근처", "near", "위치", "장소", "맛집"]):
                    type_ = "map"
                elif any(x in text for x in ["가격", "비용", "price", "cost", "요금"]):
                    type_ = "info"
                elif any(x in text for x in ["추천", "recommend", "best", "top"]):
                    type_ = "reco"
                elif any(x in text for x in ["오류", "고장", "error", "fix", "안돼"]):
                    type_ = "troubleshoot"
                results.append({"query": text, "label": text, "type": type_})
            return results
    except Exception as e:
        print(f"Suggestion Error: {e}")
        return []
    return []

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ansimssi AI Backend (Gemini) - Sync Vercel"}
