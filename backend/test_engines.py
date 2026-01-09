
import os
import sys
import asyncio
from dotenv import load_dotenv

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.search_manager import SearchManager

# Load env freshly
load_dotenv('.env') 
load_dotenv('backend/.env')

async def test_all_engines():
    print("--- 🔍 Testing Individual Search Engines ---")
    sm = SearchManager()
    query = "비타민C 효능"
    
    # 1. Google (SerpApi)
    print(f"\n1. Testing Google (SerpApi)... (Key: {sm.serpapi_key[:5]}...)")
    try:
        if not sm.serpapi_key:
            print("❌ Google: Missing API Key")
        else:
            res = sm._search_google_sync(query)
            if res and res.get('results'):
                print(f"✅ Google: Success ({len(res['results'])} results)")
            else:
                print("⚠️ Google: No results or failure")
    except Exception as e:
        print(f"❌ Google Error: {e}")

    # 2. Tavily
    print(f"\n2. Testing Tavily... (Key: {sm.tavily_key[:5]}...)")
    try:
        if not sm.tavily_key:
            print("❌ Tavily: Missing API Key")
        else:
            res = sm._search_tavily_sync(query)
            if res and res.get('results'):
                print(f"✅ Tavily: Success ({len(res['results'])} results)")
            else:
                print("⚠️ Tavily: No results or failure")
    except Exception as e:
        print(f"❌ Tavily Error: {e}")

    # 3. Exa
    print(f"\n3. Testing Exa... (Key: {sm.exa_key[:5]}...)")
    try:
        if not sm.exa_key:
            print("❌ Exa: Missing API Key")
        else:
            res = sm._search_exa_sync(query)
            if res and res.get('results'):
                print(f"✅ Exa: Success ({len(res['results'])} results)")
            else:
                print("⚠️ Exa: No results or failure")
    except Exception as e:
        print(f"❌ Exa Error: {e}")

    # 4. Brave
    print(f"\n4. Testing Brave... (Key: {sm.brave_key[:5]}...)")
    try:
        if not sm.brave_key:
            print("❌ Brave: Missing API Key")
        else:
            res = sm._search_brave_sync(query)
            # Brave might return None if quota exceeded or 403, caught in internal method usually returns None
            if res and res.get('results'):
                print(f"✅ Brave: Success ({len(res['results'])} results)")
            else:
                print("⚠️ Brave: Returned None (Check Quota or Key Validity)")
    except Exception as e:
        print(f"❌ Brave Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_all_engines())
