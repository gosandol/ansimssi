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

class Contact(BaseModel):
    name: str
    number: str

class SearchRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None
    contacts: Optional[List[Contact]] = []

class Source(BaseModel):
    title: str
    url: str
    content: str
# ... (existing Source model definition if duplicated, but I am replacing the block containing SearchRequest)

# ...

# Inside search function: 
            # 1. 5-Tier Hybrid Search (Async)
            from datetime import datetime
            today_str = datetime.now().strftime("%Y-%m-%d")
            search_query = request.query
            if any(w in request.query for w in ["오늘", "날씨", "뉴스", "today", "weather", "news"]):
                search_query = f"{search_query} {today_str}"
                
            results, images, source_engine = await search_manager.search(search_query, contacts=request.contacts)
            academic_papers = search_manager.search_academic(search_query)
            academic_papers = search_manager.search_academic(search_query)

            # [PERSONA LOGIC] Dynamic Disclaimer Detection
            # Triggers if query contains medical keywords
            medical_keywords = ["약", "질병", "치료", "증상", "복용", "수술", "병원", "진료", "부작용", "효능", "통증", "혈압", "당뇨", "건강", "검진", "예방", "섭취", "영양제"]
            has_medical_intent = any(k in request.query for k in medical_keywords)

            # Triggers if query contains legal keywords
            legal_keywords = ["층간소음", "분쟁", "규약", "법률", "법적", "책임", "손해배상", "고소", "판례", "변호사", "소송", "합의", "민사", "형사", "위자료"]
            has_legal_intent = any(k in request.query for k in legal_keywords)
            
            disclaimer_text = ""
            if has_medical_intent:
                disclaimer_text = "참고용으로만 사용하시기 바랍니다. 의학적인 자문이나 진단이 필요한 경우 전문가에게 문의하세요."
            elif has_legal_intent:
                disclaimer_text = "참고용으로만 사용하시기 바랍니다. 법률적인 자문이나 도움이 필요한 경우 전문가에게 문의하세요."

            # Map sources for Frontend
            frontend_sources = [
                {"title": r['title'], "url": r.get('url', r.get('link', '#')), "content": r['content']}
                for r in results[:8] 
                if 'title' in r and 'content' in r
            ]

            # [STREAM START] Yield Metadata Event
            # Disclaimer logic is now handled implicitly or via explicit key if needed (we removed forced disclaimer)
            yield json.dumps({
                "type": "meta",
                "sources": frontend_sources,
                "images": images, 
                "disclaimer": disclaimer_text, 
                "academic": academic_papers
            }) + "\n"

            # Format context
            search_context = "\n\n".join([f"Source '{r['title']}': {r['content']}" for r in results[:12]])
            full_context = f"{rag_context}\n\n=== WEB SEARCH RESULTS (Source: {source_engine}) ===\n{search_context}"

            # 1.5 Fetch Thread History (Context Injection)
            chat_history_text = ""
            if request.thread_id and supabase:
                try:
                    # Fetch last 6 messages for context (3 turns)
                    history_response = supabase.table('messages')\
                        .select('role, content')\
                        .eq('thread_id', request.thread_id)\
                        .order('created_at', desc=True)\
                        .limit(6)\
                        .execute()
                    
                    if history_response.data:
                        # Re-order to chronological
                        history_msgs = history_response.data[::-1]
                        history_lines = [f"{m['role'].upper()}: {m['content']}" for m in history_msgs]
                        chat_history_text = "\n".join(history_lines)
                        print(f"📖 Loaded {len(history_msgs)} history messages for context.")
                except Exception as e:
                    print(f"History Fetch Error: {e}")

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
            
            **Conversation History (Previous Context)**:
            {chat_history_text}

            **STRICT Format Instruction (Gemini Visual Blueprint)**:
            Use `---` separators between sections.

            **1. The Intro (Summary)**
            - Start directly with a brief, empathetic summary (1-2 lines).
            - **IMMEDIATELY FOLLOW with a horizontal rule (`---`).**

            **2. The Body (Main Advice)**
            - Use **Numbered Headers** (e.g., **1. Header Name**) for main points.
            - Use beaded bullets inside sections.
            - Max 5 sections.

            **3. The Caution (⚠️)**
            - IF AND ONLY IF medical/safety context:
            - **Title**: "⚠️ 이럴 때는 반드시 전문가와 상담하세요" (Exact string, NO Markdown)
            - List critical warning signs.
            - If not medical/safety, OMIT this entire section.

            **4. The Closing (Interactive)**
            - A specific, empathetic question to continue the dialogue.
            - Example: "지금 어떤 증상이 가장 심하신가요?"

            **Output Logic**:
            [Summary]
            
            ---
            
            [Numbered Body 1...5]
            
            [Caution if applicable]
            [Closing Question]

            **Tone & Style (Gemini's Smart Sibling)**:
            - **Voice**: Professional but friendly ('해요' style). Avoid stiff '다/까' endings unless defining terms. Use '대신', '하지만' for smooth flow.
            - **Closing Phrases**: ALWAYS end with one of these patterns:
              - "...알려드릴 수 있습니다."
              - "...연결해드릴까요?"
              - "...도와드릴까요?"
            - **Professional & Deep**: Synthesize logic/cause-effect. Use specific numbers/stats.
            - **Zero Fluff**: Start immediately. No "Here is the answer".

            **Safety & Medical**:
            - If medical/safety context, use the "3. The Caution" section strictly.
            - **Never** say "I am not a doctor" repetitively in the body. Use the disclaimer section.
            
            **Handling Follow-ups**:
            - If the query is "buy link" or similar short follow-up, USE THE HISTORY to understand what product is being discussed.

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
