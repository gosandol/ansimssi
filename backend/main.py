import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import xml.etree.ElementTree as ET
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
    # Tavily Client is now optional for fallback
    # if not tavily_client:
    #     print("Warning: Tavily Client not initialized")
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
        # 1. Search with Tavily
        results = []
        images = []
        try:
            if tavily_client:
                print(f"Searching for: {request.query}")
                search_result = tavily_client.search(query=request.query, search_depth="basic", include_images=True)
                results = search_result.get("results", [])
                images = search_result.get("images", [])
        except Exception as e:
            print(f"Tavily Search Error (Falling back to Gemini): {e}")
            # Proceed with empty results/images
        
        # Format context (RAG + Search Results)
        search_context = "\n\n".join([
            f"Source '{r['title']}': {r['content']}" 
            for r in results[:5] 
        ])
        
        full_context = f"{rag_context}\n\n=== WEB SEARCH RESULTS ===\n{search_context}"

        # 2. Generate Answer with Gemini
        system_prompt = """You are Ansimssi (안심씨), a highly capable AI Assistant specializing in Health, Safety, and Daily Life, but also an expert in Education, Technology, and Hobbies.

        **CORE OBJECTIVE**: Provide "Gemini-level" or "Expert-level" comprehensive answers. Your responses must be structured, detailed, and visually organized.

        **CRISIS PROTOCOL (HIGHEST PRIORITY)**:
           - IF the query implies **suicide, self-harm, or immediate life-threatening emergency**:
             Output specific emergency guidance (119, 109, 1577-0199) and STOP.

        **ANSWER GUIDELINES**:
        1. **Context & Knowledge**: 
           - Use provided Context if available.
           - If Context is missing (Search failure), RELY HEAVILY on your extensive **internal knowledge**. Do not be vague. Provide specific facts, brand names (e.g., Commax, Hyundai for wallpads), methods, and numbers.
        
        2. **Structure & Formatting (MANDATORY)**:
           - Use **Markdown Headers (##, ###)** to divide sections.
           - Use **Bold text** for key terms.
           - Use **Bulleted/Numbered Lists** for readability.
           - **Introduction**: Briefly define the topic.
           - **Main Content**: Break down into logical categories (e.g., "Key Features", "Common Issues", "Pros/Cons", "How-to").
           - **Actionable Advice/Tips**: Practical steps.
        
        3. **Tone**:
           - Professional, authoritative, yet friendly and empathetic.
           - Like a knowledgeable consultant or chief physician explaining to a client.

        4. **Adaptive Closing (Crucial for User Engagement)**:
           - **DO NOT** use a fixed "Final Recommendation" footer.
           - Instead, end the answer organically based on context:
             - **Adaptive Closing / Tips (Strict Branding)**:
               - **For Korean Answers**: You MUST use the label "**💡 꿀팁:**" (do not use "Honey Tip" in Korean output).
               - **For English Answers**: You MUST use the label "**💡 Honey Tip:**" (do not use "꿀팁" in English output).
               - Offer a specific, high-value tip based on the context.
             - **For General Info**: Propose a **Follow-up Question** (e.g., "Do you know your wallpad model number? I can find the specific manual.").
             - **For Services**: Suggest connecting to a service (e.g., "Shall I connect you to the maintenance office?").
             - **For Safety**: Gently remind of caution only if relevant.
        
        5. **Disclaimer Logic**:
           - Return "medical" ONLY if the query is strictly medical/treatment related.
           - Return "none" for general, life, tech, or education topics to avoid visual clutter.
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "answer": "Your comprehensive Korean Markdown answer...",
            "disclaimer_type": "medical" | "none"
        }
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
