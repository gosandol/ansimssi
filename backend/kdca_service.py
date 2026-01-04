import os
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from dotenv import load_dotenv

# Load env to ensure we can access keys inside the service if needed
load_dotenv()

class KdcaService:
    def __init__(self):
        # Service Key for Public Data Portal (data.go.kr)
        self.api_key = os.getenv("KDCA_API_KEY")
        self.base_url = "http://apis.data.go.kr/1352000/ODMS_COVID_04" # Standard COVID/Infectious Disease Endpoint Base

    def get_health_data(self):
        """
        Aggregates data from real KDCA API if key is present, otherwise returns mock.
        """
        if self.api_key:
            try:
                real_alerts = self._fetch_real_alerts()
                if real_alerts:
                    return {
                        "alerts": real_alerts,
                        "news": self._get_mock_news(), # Keeping mock news for now as no specific API was found for news
                        "summary": self._generate_briefing(real_alerts)
                    }
            except Exception as e:
                print(f"KDCA API Error: {e}")
                # Fallback to mock on error
        
        return {
            "alerts": self._get_mock_alerts(),
            "news": self._get_mock_news(),
            "summary": "현재 KDCA 데이터 연동 상태를 확인 중입니다. (Mock Data 제공됨)"
        }

    def _fetch_real_alerts(self):
        """
        Fetches real-time infectious disease data from KDCA/Open Data Portal.
        Currently targeting COVID-19/Flu trends.
        """
        # Example Endpoint: Covid-19 Infection Status
        # Note: Depending on the specific 'Infectious Disease' service, the URL differs.
        # We use a generic 'Infectious Disease' structure here.
        
        # NOTE: Since the exact endpoint might vary, we implement a robust catch.
        # Ideally, we call: http://apis.data.go.kr/1352000/ODMS_COVID_04/callCovid04Api
        # params: serviceKey=..., pageNo=1, numOfRows=10, apiType=JSON
        
        params = {
            "serviceKey": self.api_key,
            "pageNo": "1",
            "numOfRows": "5",
            "apiType": "JSON"  # Attempt JSON first
        }
        
        # Using a reliable endpoint for testing (Covid Inf State)
        url = f"{self.base_url}/callCovid04Api" 
        
        try:
            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            items = data.get("response", {}).get("body", {}).get("items", [])
            
            # Transform to our alert format
            alerts = []
            for item in items:
                alerts.append({
                    "id": item.get("seq", 0),
                    "disease": "코로나19 (COVID-19)",
                    "level": "발생",
                    "level_color": "red" if int(item.get("incDec", 0) or 0) > 1000 else "orange",
                    "date": item.get("stateDt", datetime.now().strftime("%Y-%m-%d")),
                    "message": f"일일 확진자: {item.get('incDec', '0')}명 / 누적: {item.get('defCnt', '0')}명"
                })
            
            if not alerts:
                # If JSON empty or structured differently (XML), might fail silently
                return None
                
            return alerts
            
        except Exception:
            # Silent fail to trigger fallback
            return None

    def _get_mock_alerts(self):
        return [
            {
                "id": 1,
                "disease": "인플루엔자(독감)",
                "level": "주의",
                "level_color": "orange",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "message": "환절기 인플루엔자 유행 주의보 발령. 예방접종 권장."
            },
            {
                "id": 2,
                "disease": "코로나19",
                "level": "관심",
                "level_color": "blue",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "message": "신규 변이 확산 모니터링 중. 개인 위생 철저."
            },
            {
                "id": 3,
                "disease": "노로바이러스",
                "level": "경계",
                "level_color": "red",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "message": "겨울철 식중독 노로바이러스 감염 주의. 익혀먹기 생활화."
            }
        ]

    def _get_mock_news(self):
        return [
            {
                "id": 101,
                "title": "2024년 국가예방접종 지원사업 안내",
                "source": "질병관리청",
                "date": "2024-01-02",
                "url": "#"
            },
            {
                "id": 102,
                "title": "해외여행 시 뎅기열 주의 당부",
                "source": "국립보건연구원",
                "date": "2023-12-28",
                "url": "#"
            },
            {
                "id": 103,
                "title": "심뇌혈관질환 예방을 위한 9대 생활수칙",
                "source": "보건복지부",
                "date": "2023-12-20",
                "url": "#"
            }
        ]

    def _generate_briefing(self, alerts=None):
        if alerts and len(alerts) > 0:
            top_alert = alerts[0]
            return f"현재 {top_alert['disease']} 관련 데이터가 업데이트 되었습니다. {top_alert['message']}"
        return "현재 인플루엔자 유행주의보가 발령 중입니다. 외출 후 손 씻기와 기침 예절을 준수해 주세요."
