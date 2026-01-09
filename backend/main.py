import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import List, Optional
from tavily import TavilyClient
import google.generativeai as genai
# from kdca_service import KdcaService 

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
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

from services.search_manager import SearchManager

from supabase import create_client, Client

# Initialize Clients
tavily_api_key = os.getenv("TAVILY_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Supabase Setup (Service Role favoured for backend, but Anon works if RLS allows or we use Service Key)
# Using SUPABASE_SERVICE_ROLE_KEY if available for full access, else SUPABASE_KEY
supabase_url = os.getenv("VITE_SUPABASE_URL") # Re-using frontend env var if backend .env doesn't have specific
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

supabase: Client = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Supabase Init Failed: {e}")

# Initialize Services
# kdca_service = KdcaService()
search_manager = SearchManager()

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None

# --- Helper: Fetch System Prompt Dynamic ---
def fetch_system_prompt():
    default_prompt = """You are Ansimssi (안심씨), a highly capable AI Assistant specializing in Health, Safety, and Daily Life...""" # Fallback (Shortened for brevity in code, but full prompt logic below)
    
    if not supabase:
        return default_prompt

    try:
        response = supabase.table('prompt_config').select('content').eq('key', 'main_system_prompt').execute()
        if response.data and len(response.data) > 0:
            print("loaded system prompt from DB")
            return response.data[0]['content']
    except Exception as e:
        print(f"DB Prompt Fetch Error: {e}")
    
    return default_prompt # Fallback if DB update fails or empty

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
import json

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
                # Immediate Response for Doctor Connection (No LLM needed)
                # Yield Meta
                yield json.dumps({"type": "meta", "sources": [], "images": [], "disclaimer": ""}) + "\n"
                # Yield Content
                answer = """## 🏥 새로닥터 연결\n\n네, 알겠습니다. **안심씨의 AI 주치의 서비스**를 통해 전문의와 상담하실 수 있도록 **새로닥터 비대면 진료**를 연결하겠습니다.\n\n화면의 안내에 따라 증상을 선택하시면 곧바로 진료 접수가 진행됩니다. 잠시만 기다려주세요..."""
                yield json.dumps({"type": "content", "delta": answer}) + "\n"
                # Yield Done
                yield json.dumps({"type": "done", "related_questions": ["비대면 진료는 어떻게 진행되나요?", "진료비는 얼마인가요?"]}) + "\n"
                return

            # 0. RAG: Check Medical Knowledge Base first
            rag_context = ""
            try:
                json_path = os.path.join(os.path.dirname(__file__), 'data', 'medical_data.json')
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
            # Disclaimer logic is now handled implicitly or via explicit key if needed (we removed forced disclaimer)
            yield json.dumps({
                "type": "meta",
                "sources": frontend_sources,
                "images": images, 
                "disclaimer": "", # No forced disclaimer
                "academic": academic_papers
            }) + "\n"

            # Format context
            search_context = "\n\n".join([f"Source '{r['title']}': {r['content']}" for r in results[:5]])
            full_context = f"{rag_context}\n\n=== WEB SEARCH RESULTS (Source: {source_engine}) ===\n{search_context}"

            # 2. Generate Answer with Gemini (Streaming)
            system_prompt_content = fetch_system_prompt()
            # Fallback logic handled in fetch_system_prompt or if empty string
            if "System Prompt" in system_prompt_content and len(system_prompt_content) < 100:
                 system_prompt = """You are Ansimssi (안심씨)... (Fallback shortened)""" 
            else:
                 system_prompt = system_prompt_content

            today_date = datetime.now().strftime("%Y-%m-%d")
            
            prompt = f"""
            {system_prompt}

            **Current Request**:
            Query: {request.query}
            Context: {full_context}

            **STRICT Format Instruction (3-Part Structure)**:

            **Part 1: The Answer (Main Body)**
            - Summary: Start directly with the answer (1-2 lines).
            - **Structure**: YOU MUST USE NUMBERED HEADERS for main points (e.g., **1. Step One**, **2. Step Two**).
            - **Details**: Use beaded bullets inside the numbered sections.
            - Tone: Professional but friendly (Gemini Persona).

            **Part 2: "⚠️ 이럴 때는..." (Conditional Caution)**
            - IF AND ONLY IF medical/safety/troubleshooting context:
            - Add a section titled: **"⚠️ 이럴 때는 반드시 전문가와 상담하세요"** (or similar context-appropriate header).
            - List 2-3 critical warning signs.
            - Use a bulleted list for this section.
            - If not applicable, OMIT this part.

            **Part 3: Conversational Closing (Interactive)**
            - END with a specific, empathetic question/prompt to continue the dialogue.
            - Example: "지금 어떤 증상이 가장 심하신가요?", "어떤 부분이 가장 궁금하신가요?", "또 다른 궁금한 점이 있으신가요?"
            - Do NOT use generic closings. Be context-specific.

            **Prohibitions**:
            - NO "Based on the search results..." start.
            - NO JSON output.
            - NO "Related Questions" list (handled by UI).
            - NO Markdown code blocks for the answer text itself.

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

            # 3. Related Questions (Optional: Separate call or heuristic)
            # For speed, we can assume them or do a quick separate call.
            # Or parse them if we forced JSON. But Streaming is better with raw text.
            # Let's use a heuristic or a quick default for now to save latency.
            related_questions = [
                f"{request.query}에 대해 더 자세히 알려줘",
                f"{request.query} 관련 최신 정보는?",
                "다른 추천 사항이 있나요?"
            ]
            
            # [STREAM END] Yield Completion Event
            yield json.dumps({
                "type": "done", 
                "related_questions": related_questions
            }) + "\n"
            
            # --- SELF IMPROVEMENT LOOP (Async) ---
            if source_engine in ["google", "tavily", "exa", "brave"] and full_answer_text and len(frontend_sources) > 0:
                 # Background save (Fire and forget logic ideally, here synchronous for simplicity)
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

# --- Admin API: User Management (CRM) ---
@app.get("/api/admin/users")
async def get_admin_users():
    """
    Fetch all users from Supabase Auth (Requires Service Role Key).
    Ideally protected by Admin Middleware.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    # Check for Service Role Key (Security Check)
    # In a real app, we must verify the requestor is an admin via JWT.
    # For this MVP, we rely on the fact that this endpoint is only called by our Admin Frontend
    # and maybe add a simple secret header check later if needed.
    
    try:
        # Supabase Python Client 'auth.admin' method to list users
        # Note: The 'supabase' client initialized with SERVICE_ROLE_KEY has admin privileges.
        response = supabase.auth.admin.list_users()
        # response is usually a UserList object or list of User objects
        
        # Serialize for frontend
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
             
        # Sort by latest joined
        users_data.sort(key=lambda x: x['created_at'], reverse=True)
        
        return {"users": users_data}
        
    except Exception as e:
        print(f"Admin User Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health-data")
async def get_health_data():
    # Placeholder for KDCA service
    return {"status": "ok", "data": "Health data placeholder"}

@app.get("/api/suggest")
async def get_suggestions(q: str):
    """
    Proxies Google Suggest API and classifies intents.
    """
    if not q:
        return []
    
    try:
        # 1. Fetch from Google Suggest
        url = f"http://suggestqueries.google.com/complete/search?client=firefox&q={q}"
        response = requests.get(url, timeout=2)
        if response.status_code == 200:
            data = response.json()
            suggestions = data[1] # List of strings
            
            # 2. Smart Classification
            results = []
            for text in suggestions[:6]: # Limit to 6
                # Determine Type/Icon
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
                
                results.append({
                    "query": text,
                    "label": text,
                    "type": type_
                })
            return results
    except Exception as e:
        print(f"Suggestion Error: {e}")
        return []
    
    return []

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ansimssi AI Backend (Gemini) is running"}
