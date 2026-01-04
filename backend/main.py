import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from tavily import TavilyClient
import google.generativeai as genai
from kdca_service import KdcaService

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

# Initialize Clients
tavily_api_key = os.getenv("TAVILY_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Initialize Services
tavily_client = TavilyClient(api_key=tavily_api_key) if tavily_api_key else None
kdca_service = KdcaService()

if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None

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
    related_questions: List[str]

@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    if not tavily_client:
        print("Error: Tavily Client not initialized (Key missing?)")
        raise HTTPException(status_code=500, detail="Tavily Key missing")
    if not model:
        print("Error: Gemini Model not initialized (Key missing?)")
        raise HTTPException(status_code=500, detail="Gemini Key missing")

    try:
        # 0. RAG: Check Medical Knowledge Base first
        rag_context = ""
        matched_topics = []
        try:
            # Load data if not loaded (basic caching)
            # In production, load this once at startup
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

        # 1. Search with Tavily
        print(f"Searching for: {request.query}")
        search_result = tavily_client.search(query=request.query, search_depth="basic", include_images=True)
        results = search_result.get("results", [])
        images = search_result.get("images", [])
        
        # Format context (RAG + Search Results)
        search_context = "\n\n".join([
            f"Source '{r['title']}': {r['content']}" 
            for r in results[:5] 
        ])
        
        full_context = f"{rag_context}\n\n=== WEB SEARCH RESULTS ===\n{search_context}"

        # 2. Generate Answer with Gemini
        system_prompt = """You are Ansimssi (안심씨), a professional "AI Principal Doctor" (AI 주치의) and safety caregiver for Korean users.
        
        TASK:
        0. **CRISIS PROTOCOL (HIGHEST PRIORITY)**:
           - IF the query implies **suicide, self-harm, or immediate life-threatening emergency** (e.g., "죽고 싶어", "자살", "숨을 못 쉬겠어", "살려줘"):
             Output specific emergency guidance:
             "생명의 소중함을 잊지 마세요. 지금 즉시 도움이 필요하다면 아래 번호로 연락하세요.
             * 🆘 **119** (응급상황)
             * 📞 **109** (24시간 자살예방 상담전화)
             * ☎️ **1577-0199** (정신건강 상담전화)
             당신은 혼자가 아닙니다. 전문가의 도움을 받으세요."
             (Skip the rest of the logic)

        1. Answer the user's query **based ONLY on the provided context**. **Do NOT hallucinate** or invent medical treatments not present in the sources.
        2. PRIORITIZE information labeled [OFFICIAL HEALTH GUIDELINE] over web search results.
        3. Identity: If asked "Who are you?", answer: "네, 저는 당신의 AI 주치의 겸 안전돌봄이 안심씨입니다. 무엇을 도와드릴까요?"
        4. STRUCTURE:
           - Provide a comprehensive, empathetic answer first.
           - **MANDATORY**: End every health/medical/safety advice with a specific section:
             
             **안심씨의 최종 권고:**
             - [Clear, actionable advice 1]
             - [Clear, actionable advice 2]
             - (Optional) "전문 의료진과의 상담을 권장합니다."
        
        5. Disclaimer Logic (Return 'disclaimer_type' field):
           - If the query implies medical/health advice -> "medical"
           - Otherwise -> "general"
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "answer": "Your answer in Korean Markdown...",
            "disclaimer_type": "medical" | "general"
        }
        
        Be authoritative yet kind. Use medical terminology correctly but explain it simply.
        ALWAYS answer in KOREAN.
        """
        
        prompt = f"{system_prompt}\n\nContext:\n{full_context}\n\nQuery: {request.query}"
        
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
                disclaimer = DISCLAIMER_GENERAL
                
        except json.JSONDecodeError:
            print("Warning: Failed to parse JSON, falling back to raw text")
            answer = response.text
            disclaimer = DISCLAIMER_GENERAL

        # 3. Related Questions (Mock for now to save latency/tokens)
        related_questions = [
            f"More details about {request.query}",
            f"Safety tips for {request.query}",
            f"Recent news on {request.query}"
        ]

        # Map sources
        sources = [
            Source(title=r['title'], url=r['url'], content=r['content']) 
            for r in results[:5]
        ]

        return SearchResponse(
            answer=answer,
            disclaimer=disclaimer,
            sources=sources,
            images=images,
            related_questions=related_questions
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health-data")
async def get_health_data():
    try:
        data = kdca_service.get_health_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ansimssi AI Backend (Gemini) is running"}
