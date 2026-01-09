import os
import sys
import json
import asyncio
from datetime import datetime
from typing import List, Optional

# Vercel Build Trigger
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests

# --- DIAGNOSTIC IMPORT BLOCK ---
import_status = {}
TavilyClient = None
genai = None
create_client = None
supabase = None
model = None

# 1. Tavily
try:
    from tavily import TavilyClient
    import_status['tavily'] = "OK"
except Exception as e:
    import_status['tavily'] = f"FAIL: {e}"

# 2. Supabase
try:
    from supabase import create_client, Client
    import_status['supabase'] = "OK"
except Exception as e:
    import_status['supabase'] = f"FAIL: {e}"

# 3. Google GenAI (Most likely culprit)
try:
    import google.generativeai as genai
    import_status['google-genai'] = "OK"
except Exception as e:
    import_status['google-genai'] = f"FAIL: {e}"


# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '../backend/.env')
load_dotenv(dotenv_path)

app = FastAPI()

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
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if import_status.get('supabase') == "OK":
    if supabase_url and supabase_key:
        try:
            supabase = create_client(supabase_url, supabase_key)
        except Exception as e:
            print(f"Supabase Init Failed: {e}")

if import_status.get('google-genai') == "OK" and gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
else:
    model = None

# --- INLINE SEARCH MANAGER (5-TIER SYSTEM) ---
class InlineSearchManager:
    def __init__(self):
        # Tier 1: Google (SerpApi)
        self.serpapi_key = os.getenv("SERPAPI_API_KEY")
        
        # Tier 2: Tavily (AI Search)
        self.tavily_key = os.getenv("TAVILY_API_KEY")
        if import_status.get('tavily') == "OK" and TavilyClient and self.tavily_key:
            self.tavily_client = TavilyClient(api_key=self.tavily_key)
        else:
            self.tavily_client = None

        # Tier 3: Exa (Neural Search)
        self.exa_key = os.getenv("EXA_API_KEY")

        # Tier 4: Brave (Backup)
        self.brave_key = os.getenv("BRAVE_API_KEY")

    def search_academic(self, query):
        papers = []
        if not papers:
            papers = [
                {"title": f"2023 당뇨병 진료지침 (제8판)", "link": "https://www.diabetes.or.kr/pro/news/admin/assets/standard_2023.pdf", "snippet": f"대한당뇨병학회 2023 진료지침 요약본.", "publication_info": "대한당뇨병학회 (KDA) - 2023", "year": "2023"},
                {"title": "국가 건강검진 및 만성질환 관리 통계 연보", "link": "https://www.nhis.or.kr/nhis/healthin/wbdc/wbdc0600.do?mode=download&articleNo=108398&attachNo=323719", "snippet": "국민건강보험공단 만성질환 통계.", "publication_info": "국민건강보험공단 - 2024", "year": "2024"},
                {"title": "고혈압 진료지침 2022", "link": "https://koreanhypertension.org/assets/guideline/2022_Hypertension_Guideline_K.pdf", "snippet": "일차 의료기관용 고혈압 가이드라인.", "publication_info": "대한고혈압학회 - 2022", "year": "2022"}
            ]
        return papers

    def _rank_serpapi_result(self, result):
        # Basic heuristic for medical sources
        score = 0
        url = result.get('link', '')
        snippet = result.get('snippet', '')
        title = result.get('title', '')
        
        if any(d in url for d in ['.go.kr', '.or.kr', 'hospital', 'clinic', 'health']): score += 3
        if 'naver.com' in url or 'daum.net' in url: score += 1
        if len(snippet) > 50: score += 1
        return score

    async def _search_serpapi(self, query):
        if not self.serpapi_key: return None
        print(f"🥇 Tier 1: Trying Google (SerpApi)...")
        try:
            params = {
                "engine": "google",
                "q": query,
                "api_key": self.serpapi_key,
                "hl": "ko",
                "gl": "kr"
            }
            res = await asyncio.to_thread(requests.get, "https://serpapi.com/search", params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                organic = data.get('organic_results', [])
                # Normalize to common format
                results = []
                for item in organic[:5]:
                    results.append({
                        "title": item.get('title'),
                        "url": item.get('link'),
                        "content": item.get('snippet'),
                        "score": self._rank_serpapi_result(item)
                    })
                # images
                images = []
                if 'inline_images' in data:
                    images = [img.get('original') or img.get('thumbnail') for img in data['inline_images'][:3]]
                elif 'images_results' in data:
                    images = [img.get('original') or img.get('thumbnail') for img in data['images_results'][:3]]
                
                return {"results": results, "images": images}
        except Exception as e:
            print(f"SerpApi Failed: {e}")
        return None

    async def _search_tavily(self, query):
        if not self.tavily_client: return None
        print(f"⚡️ Tier 2: Trying Tavily...")
        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, lambda: self.tavily_client.search(query=query, search_depth="basic", include_images=True))
        except Exception as e:
            print(f"Tavily Async Failed: {e}")
            return None

    async def _search_exa(self, query):
        if not self.exa_key: return None
        print(f"🧠 Tier 3: Trying Exa...")
        try:
            headers = {"x-api-key": self.exa_key, "Content-Type": "application/json"}
            payload = {
                "query": query,
                "useAutoprompt": True,
                "numResults": 5,
                "contents": {"text": True}
            }
            res = await asyncio.to_thread(requests.post, "https://api.exa.ai/search", headers=headers, json=payload, timeout=5)
            if res.status_code == 200:
                data = res.json()
                results = []
                for item in data.get('results', []):
                    results.append({
                        "title": item.get('title') or "제목 없음",
                        "url": item.get('url'),
                        "content": item.get('text', '')[:300]
                    })
                return {"results": results, "images": []} # Exa usually doesn't return images directly in basic search
        except Exception as e:
            print(f"Exa Failed: {e}")
        return None

    async def _search_brave(self, query):
        if not self.brave_key: return None
        print(f"🛡️ Tier 4: Trying Brave...")
        try:
            headers = {"Accept": "application/json", "Accept-Encoding": "gzip", "X-Subscription-Token": self.brave_key}
            params = {"q": query, "count": 5}
            res = await asyncio.to_thread(requests.get, "https://api.search.brave.com/res/v1/web/search", headers=headers, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                web = data.get('web', {}).get('results', [])
                results = []
                for item in web:
                    results.append({
                        "title": item.get('title'),
                        "url": item.get('url'),
                        "content": item.get('description')
                    })
                return {"results": results, "images": []}
        except Exception as e:
            print(f"Brave Failed: {e}")
        return None

    async def search(self, query):
        print(f"🚀 Starting 5-Tier Parallel Search (Race) for: {query}")
        
        # Define tasks for parallel execution
        tasks = [
            self._search_serpapi(query),
            self._search_tavily(query),
            self._search_exa(query),
            self._search_brave(query)
        ]

        # Execute all searches concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        tier1_res, tier2_res, tier3_res, tier4_res = results

        # Selection Logic: Priority 1 -> 4
        # 1. Google (SerpApi)
        if not isinstance(tier1_res, Exception) and tier1_res and tier1_res.get('results'):
            print("🏆 Winner: Tier 1 (Google)")
            return tier1_res['results'], tier1_res['images'], "serpapi"

        # 2. Tavily
        if not isinstance(tier2_res, Exception) and tier2_res and tier2_res.get('results'):
            print("🏆 Winner: Tier 2 (Tavily)")
            return tier2_res['results'], tier2_res.get('images', []), "tavily"

        # 3. Exa
        if not isinstance(tier3_res, Exception) and tier3_res and tier3_res.get('results'):
             print("🏆 Winner: Tier 3 (Exa)")
             return tier3_res['results'], tier3_res.get('images', []), "exa"

        # 4. Brave
        if not isinstance(tier4_res, Exception) and tier4_res and tier4_res.get('results'):
             print("🏆 Winner: Tier 4 (Brave)")
             return tier4_res['results'], tier4_res.get('images', []), "brave"

        # 5. Fallback (Mock)
        print("🚑 All tiers failed. Entering Emergency Mock Fallback...")
        source_engine = "mock"
        aggregated_results = [
                {"title": f"'{query}' 관련 정보 (Google Scholar)", "url": f"https://scholar.google.co.kr/scholar?q={query}", "content": "전문적인 논문과 연구 자료를 확인하세요."},
                {"title": f"'{query}' 지식백과 (Naver)", "url": f"https://terms.naver.com/search.naver?query={query}", "content": "검증된 건강 정보를 찾아보세요."},
                {"title": "질병관리청 국가건강정보포털", "url": "https://health.kdca.go.kr", "content": "국가 검증 의학 정보를 제공합니다."}
        ]
        images = ["https://ssl.pstatic.net/static/terms/terms_logo.png"]

        return aggregated_results, images, source_engine

search_manager = InlineSearchManager()

def fetch_system_prompt():
    default_prompt = """You are Ansimssi (안심씨), a highly capable AI Assistant specializing in Health, Safety, and Daily Life. Use Korean."""
    if not supabase: return default_prompt
    try:
        response = supabase.table('prompt_config').select('content').eq('key', 'main_system_prompt').execute()
        if response.data: return response.data[0]['content']
    except: pass
    return default_prompt

class SearchRequest(BaseModel):
    query: Optional[str] = ""
    thread_id: Optional[str] = None
    messages: Optional[List[dict]] = None
    class Config:
        extra = "ignore"

@app.post("/api/search")
async def search(request: SearchRequest):
    if not model:
        # Check why model is missing
        error_msg = "Gemini Model Failed."
        if import_status.get('google-genai') != "OK":
             error_msg = f"Import Error: {import_status.get('google-genai')}"
        elif not gemini_api_key:
             error_msg = "Missing GEMINI_API_KEY env var."
        
        async def error_generator():
            yield json.dumps({"type": "error", "message": error_msg}) + "\n"
        return StreamingResponse(error_generator(), media_type="application/x-ndjson")

    async def event_generator():
        try:
            if any(k in request.query.replace(" ", "") for k in ["네연결해줘", "비대면진료", "새로닥터"]):
                yield json.dumps({"type": "content", "delta": "네, 새로닥터 비대면 진료를 연결해드리겠습니다."}) + "\n"
                yield json.dumps({"type": "done", "related_questions": []}) + "\n"
                return

            clean_query = request.query
            for tag in ["[병원검색]", "[약국검색]", "[건강백과]"]:
                clean_query = clean_query.replace(tag, "").strip()

            results, images, source_engine = await search_manager.search(clean_query)
            academic_papers = search_manager.search_academic(clean_query)

            frontend_sources = [{"title": r['title'], "url": r.get('url', r.get('link', '#')), "content": r.get('content', '')[:200]} for r in results[:5] if 'title' in r]

            yield json.dumps({"type": "meta", "sources": frontend_sources, "images": images, "disclaimer": "", "academic": academic_papers}) + "\n"

            search_context = "\n\n".join([f"Source '{r['title']}': {r.get('content','')}" for r in results[:5]])
            system_prompt = fetch_system_prompt()
            today_date = datetime.now().strftime("%Y-%m-%d")
            
            prompt = f"{system_prompt}\n\nQuery: {request.query}\nContext: {search_context}\nToday: {today_date}\n\nSTRICT: 1. Intro(Summary) 2. Body(Numbered) 3. Caution 4. Closing."

            response_stream = model.generate_content(prompt, stream=True)
            for chunk in response_stream:
                if chunk.text:
                    yield json.dumps({"type": "content", "delta": chunk.text}) + "\n"

            yield json.dumps({"type": "done", "related_questions": ["더 자세히 알려줘", "다른 정보는?"]}) + "\n"

        except Exception as e:
            yield json.dumps({"type": "error", "message": str(e)}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

@app.get("/api/suggest")
async def get_suggestions(q: str):
    if not q: return []
    try:
        url = f"http://suggestqueries.google.com/complete/search?client=firefox&q={q}"
        res = requests.get(url, timeout=2)
        if res.status_code == 200:
            data = res.json()
            return [{"query": t, "label": t, "type": "search"} for t in data[1][:6]]
    except: pass
    return []

@app.get("/api/debug")
def debug_env():
    return {
        "status": "ok",
        "message": "Backend is ALIVE (5-Tier Search System)",
        "imports": import_status,
        "env_check": {
            "TAVILY": "OK" if tavily_api_key else "MISSING",
            "GEMINI": "OK" if gemini_api_key else "MISSING",
            "SUPABASE_URL": "OK" if supabase_url else "MISSING",
            "SERPAPI": "OK" if os.getenv("SERPAPI_API_KEY") else "MISSING (Tier 1)",
            "EXA": "OK" if os.getenv("EXA_API_KEY") else "MISSING (Tier 3)",
            "BRAVE": "OK" if os.getenv("BRAVE_API_KEY") else "MISSING (Tier 4)"
        }
    }

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ansimssi AI Backend (Diagnostic)"}
