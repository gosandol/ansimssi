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

@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    if not model:
        print("Error: Gemini Model not initialized (Key missing?)")
        raise HTTPException(status_code=500, detail="Gemini Key missing")


    try:
        # === 0. AFFIRMATIVE INTENT INTERCEPTOR (Sero Doctor) ===
        # If the user says "Yes" or "Connect me" potentially in response to the Medical CTA
        affirmative_keywords = ["네", "응", "어", "연결해줘", "비대면진료", "새로닥터", "상담할래", "진료받을래"]
        cleaned_query = request.query.strip().replace(" ", "")
        
        # Simple Logic: exact match or containment of strong triggers
        is_affirmative = (
            cleaned_query in ["네", "예", "응", "어", "네부탁해요", "네연결해줘", "연결해줘"] or 
            any(k in cleaned_query for k in ["비대면진료연결", "새로닥터연결", "상담연결"])
        )

        if is_affirmative:
            print(f"[Intent] Sero Doctor Connection Triggered by: {request.query}")
            return SearchResponse(
                answer="""## 🏥 새로닥터 연결
                
네, 알겠습니다. **안심씨의 AI 주치의 서비스**를 통해 전문의와 상담하실 수 있도록 **새로닥터 비대면 진료**를 연결하겠습니다. 

화면의 안내에 따라 증상을 선택하시면 곧바로 진료 접수가 진행됩니다. 잠시만 기다려주세요...""",
                disclaimer="",
                sources=[],
                images=[],
                academic=[],
                related_questions=["비대면 진료는 어떻게 진행되나요?", "진료비는 얼마인가요?"]
            )

        # 0. RAG: Check Medical Knowledge Base first
        rag_context = ""
        matched_topics = []
        try:
            # Load data if not loaded (basic caching)
            json_path = os.path.join(os.path.dirname(__file__), 'data', 'medical_data.json')
            if os.path.exists(json_path):
                import json
                with open(json_path, 'r', encoding='utf-8') as f:
                    medical_knowledge = json.load(f)
                
                # Simple Keyword Matching
                for item in medical_knowledge:
                    for keyword in item.get('keywords', []):
                        if keyword in request.query:
                            rag_context += f"\n\n[OFFICIAL HEALTH GUIDELINE]\n{item['content']}"
                            matched_topics.append(item['id'])
                            break # Match once per item
        except Exception as e:
            print(f"RAG Error: {e}")

        # 1. 5-Tier Hybrid Search (SearchManager)
        
        # Date Injection for Search
        from datetime import datetime
        today_str = datetime.now().strftime("%Y-%m-%d")
        search_query = request.query
        if any(w in request.query for w in ["오늘", "날씨", "뉴스", "today", "weather", "news"]):
            search_query = f"{search_query} {today_str}"
            
        results, images, source_engine = search_manager.search(search_query)
        academic_papers = search_manager.search_academic(search_query)
        print(f"Search Completed via Engine: {source_engine}")

        # Format context (RAG + Search Results)
        search_context = "\n\n".join([
            f"Source '{r['title']}': {r['content']}" 
            for r in results[:5] 
        ])
        
        full_context = f"{rag_context}\n\n=== WEB SEARCH RESULTS (Source: {source_engine}) ===\n{search_context}"

        # 2. Generate Answer with Gemini
        # NEW: Fetch dynamic system prompt from DB
        system_prompt_content = fetch_system_prompt()
        
        # If the fetched prompt is the placeholder or fallback, we might want to ensure it has the core logic. 
        # But for now, let's assume the DB has the FULL prompt. 
        # If DB returns the "Check admin" placeholder, we should probably fallback to a hardcoded SAFETY prompt here to avoid breaking the bot.
        if "System Prompt" in system_prompt_content and len(system_prompt_content) < 100:
             # It's likely the dummy text we inserted. Let's use the hardcoded one for now until User updates it in Admin.
             system_prompt = """You are Ansimssi (안심씨), a highly capable AI Assistant.
             
             **CORE OBJECTIVE**: Provide "Gemini-level" comprehensive answers.
             
             **MEDICAL/HEALTH PROTOCOL (MANDATORY)**:
               - IF query is Health/Medical => Set `disclaimer_type`="medical".
               - Append: "안심씨는 여러분의 AI 주치의로서 **새로닥터**를 통해 비대면 진료 서비스를 제공하고 있습니다. 전문의와 상담이 필요하신가요?"
             
             **Links & References**:
               - Use natural Markdown `[Link Text](url)`.
               - Example: "You can find it at [Here](url)."
             
             **Adaptive Closing**:
               - Korean: Use "**💡 꿀팁:**".
               - English: Use "**💡 Honey Tip:**".
             """
        else:
             system_prompt = system_prompt_content


        from datetime import datetime
        today_date = datetime.now().strftime("%Y-%m-%d")
        
        prompt = f"""
        {system_prompt}

        **Current Request**:
        Query: {request.query}
        Context: {full_context}

        **Instructions**:
        - Answer the query using the context provided.
        - If NO context is relevant, use your internal knowledge but mention you are doing so.
        - Ensure "medical" disclaimer logic is followed if applicable.
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "answer": "Your comprehensive Korean Markdown answer...",
            "disclaimer_type": "medical" | "none", 
            "related_questions": ["Q1", "Q2", "Q3"]
        }}
        """
        
        prompt = f"{prompt}\n\n[SYSTEM NOTE: Today is {today_date}. If the user asks for 'today', 'weather', or 'news', use this date.]\n\nContext:\n{full_context}\n\nQuery: {request.query}"
        
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        
        import json
        
        # Hardcoded Disclaimers to prevent Hallucinations/Typos
        DISCLAIMER_MEDICAL = "본 답변은 보건복지부의 비의료 건강관리서비스 가이드라인을 준수하며, 의학적 진단, 치료, 처방을 대신할 수 없습니다. 제공되는 정보는 참고용이며, 정확한 의학적 소견은 반드시 전문의와 상의하시기 바랍니다."
        DISCLAIMER_GENERAL = "제공된 정보는 참고용이며, 정확하지 않을 수 있습니다."

        try:
            response_json = json.loads(response.text)
            answer = response_json.get("answer", "")
            dis_type = response_json.get("disclaimer_type", "general")
            
            if dis_type == "medical":
                disclaimer = DISCLAIMER_MEDICAL
            else:
                disclaimer = "" # No disclaimer for general topics to keep it clean
                
        except json.JSONDecodeError:
            print("Warning: Failed to parse JSON, falling back to raw text")
            answer = response.text
            disclaimer = "" # Fallback: no disclaimer to be safe/clean

        # 3. Related Questions (Mock for now to save latency/tokens)
        related_questions = [
            f"More details about {request.query}",
            f"Safety tips for {request.query}",
            f"Recent news on {request.query}"
        ]

        # Map sources
        sources = [
            Source(title=r['title'], url=r.get('url', r.get('link', '#')), content=r['content']) 
            for r in results[:5] 
            if 'title' in r and 'content' in r # Safety check
        ]
        
        # --- SELF IMPROVEMENT LOOP ---
        # If we used a live engine (not mock/kb), save this successful interaction
        if source_engine in ["google", "tavily", "exa", "brave"] and answer and len(sources) > 0:
             search_manager.knowledge_base.save_interaction(
                 query=request.query,
                 response_data={
                     "answer": answer,
                     "sources": results[:5],
                     "images": images,
                     "academic": academic_papers
                 }
             )

        return SearchResponse(
            answer=answer,
            disclaimer=disclaimer,
            sources=sources,
            images=images,
            academic=academic_papers,
            related_questions=related_questions
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
