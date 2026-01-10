import requests
import json
import uuid
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api/search"
THREAD_ID = str(uuid.uuid4())

def send_message(query):
    print(f"\n\n🔵 USER: {query}")
    print("-" * 50)
    
    start_time = time.time()
    payload = {
        "query": query,
        "thread_id": THREAD_ID,
        "contacts": []
    }
    
    try:
        response = requests.post(BASE_URL, json=payload, stream=True)
        response.raise_for_status()
        
        full_response = ""
        for line in response.iter_lines():
            if line:
                try:
                    data = json.loads(line)
                    if data.get("type") == "content":
                        print(data.get("delta", ""), end="", flush=True)
                        full_response += data.get("delta", "")
                except:
                    pass
        
        duration = time.time() - start_time
        print(f"\n\n⏱️  Latency: {duration:.2f}s")
        return full_response
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

# Simulation Script (The "Turing Test")
def run_simulation():
    print(f"🚀 Starting Ansimssi Logic Eval 2.0 (Thread: {THREAD_ID})\n")
    
    # Turn 1: Emotional / Casual
    send_message("안녕 안심씨, 나 오늘 기분이 좀 별로 안 좋아.")
    time.sleep(1)
    
    # Turn 2: Health Context Injection
    send_message("사실 머리도 좀 띵하고 몸살 기운이 있는 것 같아.")
    time.sleep(1)
    
    # Turn 3: Logic/Reasoning (Must use previous context - headache/body ache)
    send_message("이럴 때 저녁으로 뭘 먹으면 좋을까?")
    time.sleep(1)
    
    # Turn 4: Memory Check
    send_message("방금 내가 어디 가 아프다고 했는지 기억해?")

if __name__ == "__main__":
    run_simulation()
