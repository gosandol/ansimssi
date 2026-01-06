import os
from tavily import TavilyClient
from .knowledge_base import KnowledgeBase

class SearchManager:
    def __init__(self):
        # API Keys
        self.tavily_key = os.getenv("TAVILY_API_KEY")
        self.serpapi_key = os.getenv("SERPAPI_API_KEY")
        self.exa_key = os.getenv("EXA_API_KEY")
        self.brave_key = os.getenv("BRAVE_API_KEY")
        
        # Clients
        self.tavily_client = TavilyClient(api_key=self.tavily_key) if self.tavily_key else None
        self.knowledge_base = KnowledgeBase()

    def search_academic(self, query):
        """
        Search for academic papers using SerpApi (Google Scholar)
        """
        papers = []
        
        if self.serpapi_key:
            try:
                print(f"Attempting Academic Search (Scholar) for: {query}")
                import requests
                params = {
                    "engine": "google_scholar",
                    "q": query,
                    "api_key": self.serpapi_key,
                    "num": 5,
                    "hl": "ko" 
                }
                response = requests.get("https://serpapi.com/search", params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    organic_results = data.get("organic_results", [])
                    
                    papers = [
                        {
                            "title": item.get("title"),
                            "link": item.get("link"),
                            "snippet": item.get("snippet", ""),
                            "publication_info": item.get("publication_info", {}).get("summary", ""),
                            "year": pd.get("publication_info", {}).get("summary", "").split(" - ")[-1] if (pd := item) else ""
                        } for item in organic_results
                    ]
            except Exception as e:
                print(f"Academic Search Failed: {e}")
                
        # Mock Fallback if no results
        if not papers:
            print("Using Mock Academic Data")
            papers = [
                {
                    "title": f"A Study on {query} and its Clinical Implications",
                    "link": "#",
                    "snippet": f"This paper discusses the recent advancements in treating {query}...",
                    "publication_info": "Nature Medicine - 2025",
                    "year": "2025"
                },
                {
                    "title": f"analysis of {query} in Korean Population", 
                    "link": "#",
                    "snippet": "Comprehensive survey data regarding patient outcomes...",
                    "publication_info": "Journal of Korean Medical Science - 2024",
                    "year": "2024"  
                }
            ]
            
        return papers

    def search(self, query):
        """
        Execute 5-Tier Search Strategy
        """
        results = []
        images = []
        source_engine = "none"

        # Tier 1: Google (SerpApi) - The Gold Standard
        # (Placeholder for future implementation)
        # Tier 1: Google (SerpApi) - The Gold Standard
        if not results and self.serpapi_key:
            try:
                print(f"Attempting Tier 1 (Google) for: {query}")
                import requests
                params = {
                    "engine": "google",
                    "q": query,
                    "api_key": self.serpapi_key,
                    "num": 5,
                    "hl": "ko", # Korean interface
                    "gl": "kr"  # Geolocation Korea
                }
                response = requests.get("https://serpapi.com/search", params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    organic_results = data.get("organic_results", [])
                    
                    results = [
                        {
                            "title": item.get("title"),
                            "url": item.get("link"),
                            "content": item.get("snippet", "")
                        } for item in organic_results
                    ]
                    
                    if results:
                        source_engine = "google"
                        # SerpApi often provides better images in 'images_results' or 'inline_images'
                        # For now, we rely on the generic image handling or subsequent tiers if images are critical
            except Exception as e:
                print(f"Tier 1 Failed: {e}")

        # Tier 2: Tavily - LLM Optimized (Current Main)
        # Tier 2: Tavily - LLM Optimized (Current Main)
        if not results and self.tavily_client:
            try:
                print(f"Attempting Tier 2 (Tavily) for: {query}")
                search_result = self.tavily_client.search(query=query, search_depth="basic", include_images=True)
                results = search_result.get("results", [])
                images = search_result.get("images", [])
                if results:
                    source_engine = "tavily"
            except Exception as e:
                print(f"Tier 2 Failed: {e}")

        # Tier 3: Exa (Metaphor) - Deep Meaning
        if not results and self.exa_key:
            try:
                print(f"Attempting Tier 3 (Exa) for: {query}")
                import requests
                headers = {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "x-api-key": self.exa_key
                }
                # Exa /contents endpoint (formerly /search)
                response = requests.post(
                    "https://api.exa.ai/search",
                    json={
                        "query": query,
                        "numResults": 5,
                        "useAutoprompt": True, # Exa feature to improve queries
                        "contents": {"text": True}
                    },
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    exa_results = data.get("results", [])
                    
                    results = [
                        {
                            "title": item.get("title") or "Exa Result",
                            "url": item.get("url"),
                            "content": item.get("text", "")[:300] + "..." # Truncate for display
                        } for item in exa_results
                    ]
                    
                    if results:
                        source_engine = "exa"
            except Exception as e:
                print(f"Tier 3 Failed: {e}")

        # Tier 4: Brave - Cost Effective Backup
        if not results and self.brave_key:
            try:
                print(f"Attempting Tier 4 (Brave) for: {query}")
                import requests
                headers = {
                    "Accept": "application/json",
                    "X-Subscription-Token": self.brave_key
                }
                response = requests.get(
                    "https://api.search.brave.com/res/v1/web/search",
                    params={"q": query, "count": 5},
                    headers=headers
                )
                if response.status_code == 200:
                    data = response.json()
                    web_results = data.get("web", {}).get("results", [])
                    
                    results = [
                        {
                            "title": item.get("title"),
                            "url": item.get("url"),
                            "content": item.get("description")
                        } for item in web_results
                    ]
                    
                    if results:
                        source_engine = "brave"
                        # Brave doesn't always return images in standard search, 
                        # implemented mock images or separate call if needed.
                        # For now, empty images list is acceptable fallback.
            except Exception as e:
                print(f"Tier 4 Failed: {e}")

        # Tier 5: Emergency Fallback
        if not results:
            print("All External tiers failed. Entering Tier 5 (Emergency)...")
            
            # Layer 5-A: Knowledge Base (Self-Learning)
            kb_match = self.knowledge_base.find_match(query)
            if kb_match:
                print("Tier 5-A Success: Retrieved from Knowledge Base")
                results_raw = kb_match.get('sources', [])
                # Convert dict back to object structure if needed by caller, or keep as dict
                # For consistency with current main.py which expects dicts in the list
                results = results_raw 
                images = kb_match.get('images', [])
                source_engine = "knowledge_base"

            # Layer 5-B: Hardcoded Mock (Core Safety Net)
            if not results:
                print("Tier 5-A Failed. Triggering Tier 5-B (Hardcoded Mock)")
                results, images = self._get_mock_data(query)
                if results:
                    source_engine = "mock"

        # Auto-Learning: If we got results from external API (Tiers 1-4), save to KB
        if source_engine in ["google", "tavily", "exa", "brave"]:
            # We need the final answer to save a complete record, 
            # but search() only returns raw data. 
            # Saving will be handled in the main flow after answer generation.
            pass

        return results, images, source_engine

    def _get_mock_data(self, query):
        """
        Hardcoded mock data for core scenarios (copied from previous main.py logic)
        """
        results = []
        images = []
        
        q_lower = query.lower()
        
        if "보건소" in query or "health center" in q_lower:
            results = [
                {"title": "보건소 이용안내 - G-Health 공공보건포털", "url": "https://www.g-health.kr/portal/index.do", "content": "전국 보건소 찾기 및 진료 시간 안내. 내과, 치과, 한방 진료 등 보건소에서 제공하는 다양한 의료 서비스를 확인하세요."},
                {"title": "보건소 - 찾기/안내/예약 - 서울특별시", "url": "https://health.seoul.go.kr", "content": "서울시 내 25개 자치구 보건소 위치 및 연락처 정보. 예방접종, 대사증후군 관리 등 시민 건강 서비스 안내."},
                {"title": "동네 의원과 보건소, 무엇이 다를까? - 헬스조선", "url": "https://m.health.chosun.com", "content": "보건소는 국가에서 운영하는 공공 의료기관으로, 일반 병의원보다 저렴한 비용으로 진료 및 예방접종이 가능합니다."},
                {"title": "보건소 모바일 헬스케어 - 한국건강증진개발원", "url": "https://www.khealth.or.kr", "content": "스마트폰을 활용한 맞춤형 건강관리 서비스. 보건소 전문가가 비대면으로 건강상담 및 정보를 제공합니다."}
            ]
            images = [
                "https://news.seoul.go.kr/welfare/files/2020/02/602ff579e0a01.jpg",
                "https://www.korea.kr/newsWeb/resources/attaches/2021.05/20/094e9f735870ad46b412953258849646.jpg",
                "https://t1.daumcdn.net/cfile/tistory/99857B3359D8878D32",
                "https://www.yongin.go.kr/resources/images/hist/content/img_hist_2020_04_01.jpg"
            ]

        elif "당뇨" in query or "diabetes" in q_lower:
             results = [
                {"title": "당뇨병의 증상과 진단 - 대한당뇨병학회", "url": "https://www.diabetes.or.kr", "content": "대표적인 증상은 다뇨, 다음, 다식입니다. 이유 없는 체중 감소나 피로감도 나타날 수 있습니다."},
                {"title": "당뇨병 초기증상 5가지 - 서울아산병원", "url": "https://www.amc.seoul.kr", "content": "1. 잦은 소변 2. 심한 갈증 3. 배고픔 4. 체중 감소 5. 시야 흐림. 조기 발견이 합병증 예방의 핵심입니다."},
                {"title": "당뇨병 관리 가이드 - 질병관리청", "url": "https://health.kdca.go.kr", "content": "약물 요법 뿐만 아니라 식이요법과 운동요법이 병행되어야 혈당을 효과적으로 관리할 수 있습니다."}
             ]
             images = [
                 "https://www.amc.seoul.kr/asan/images/healthinfo/disease/disease_img_01.jpg",
                 "https://health.kdca.go.kr/healthinfo/biz/health/file/fileDownload.do?atchFileId=FILE_000000000000123&fileSn=1",
                 "https://i.ytimg.com/vi/example_diabetes/maxresdefault.jpg",
                 "https://post-phinf.pstatic.net/MjAyMTEyMTZfMjQ5/MDAxNjM5NjM4ODQ5MjQ5.example.jpg"
             ]
        
        elif "고혈압" in query or "hypertension" in q_lower:
            results = [
                {"title": "고혈압의 진단과 치료 - 질병관리청 국가건강정보포털", "url": "https://health.kdca.go.kr", "content": "고혈압은 침묵의 살인자로 불리며, 뇌졸중 및 심혈관 질환의 주요 원인입니다. 정기적인 혈압 측정과 생활 습관 개선이 필수적입니다."},
                {"title": "대한고혈압학회 - 일반인/환자를 위한 정보", "url": "https://www.koreanhypertension.org", "content": "올바른 혈압 측정법, 고혈압 약물 복용 가이드, 식단 관리 등 고혈압 환자를 위한 전문적인 정보를 제공합니다."},
                {"title": "고혈압 낮추는 방법 5가지 - 삼성서울병원 건강칼럼", "url": "http://www.samsunghospital.com", "content": "1. 체중 감량 2. 식단 조절(저염식) 3. 규칙적인 운동 4. 금연 5. 스트레스 관리"},
                {"title": "고혈압, 약 평생 먹어야 하나요?", "url": "https://www.hidoc.co.kr", "content": "고혈압 약은 한 번 먹으면 평생 먹어야 한다는 오해와 진실. 생활 습관 개선으로 혈압이 조절되면 약을 줄이거나 끊을 수 있습니다."}
            ]
            images = [
                "https://health.kdca.go.kr/healthinfo/biz/health/file/fileDownload.do?atchFileId=FILE_000000000000345&fileSn=1", 
                "https://i.ytimg.com/vi/Ofg98y0d_E4/maxresdefault.jpg", 
                "https://post-phinf.pstatic.net/MjAyMTAzMTZfMTQy/MDAxNjE1ODczMzE4MjU4.Kj-YlWfWlM_Zz3yW.jpg",
                "http://www.samsunghospital.com/upload/editor/20200518_1.jpg"
            ]
        
        elif "감기" in query or "cold" in q_lower:
            results = [
                 {"title": "감기와 독감의 차이점 - 질병관리청", "url": "https://kdca.go.kr", "content": "감기는 바이러스 감염에 의한 상기도 감염이며, 독감은 인플루엔자 바이러스에 의한 급성 호흡기 질환입니다."},
                 {"title": "감기 빨리 낫는 법 10가지", "url": "https://www.healthline.com", "content": "충분한 수분 섭취, 휴식, 가습기 사용, 따뜻한 차 마시기 등이 도움이 됩니다."},
                 {"title": "약 먹어도 감기가 안 낫는 이유", "url": "https://www.youtube.com/watch?v=example", "content": "감기약은 증상을 완화할 뿐 바이러스를 치료하지 않습니다. 면역력이 중요합니다."}
            ]
            images = [
                "https://img.freepik.com/free-photo/sick-woman-blowing-her-nose_23-2147743128.jpg",
                "https://i.ytimg.com/vi/example/maxresdefault.jpg",
                "https://images.unsplash.com/photo-1513201099718-4ed89549448f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
                "https://post-phinf.pstatic.net/MjAxOTEwMjlfMjQ4/MDAxNTcyMzE1MjE4MjQ4.example.jpg"
            ]

        return results, images
