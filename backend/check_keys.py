import os
from dotenv import load_dotenv

# Load explicitly from .env file to be sure
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

keys = [
    "TAVILY_API_KEY", 
    "SERPAPI_API_KEY", 
    "EXA_API_KEY", 
    "BRAVE_API_KEY", 
    "GEMINI_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VITE_SUPABASE_URL"
]

print("--- ENV VAR CHECK ---")
print(f"Loading from: {dotenv_path}")
if os.path.exists(dotenv_path):
    print(".env file exists.")
else:
    print(".env file NOT FOUND.")

for k in keys:
    val = os.getenv(k)
    if val:
        # Show first 4 chars for confirmation, rest masked
        masked = val[:4] + "*" * (len(val)-4) if len(val) > 4 else "****"
        print(f"{k}: PRESENT (Length: {len(val)})")
    else:
        print(f"{k}: MISSING")
