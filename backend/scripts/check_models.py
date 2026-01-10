import os
from google import genai
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env') # Adjusted path
load_dotenv(dotenv_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment")
    # For local script, maybe try checking the .env in current dir too if the above failed and it's run from scripts dir
    if not api_key:
        load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
        api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    exit(1)

client = genai.Client(api_key=api_key)

print("Listing available models...")
try:
    # models.list() returns an iterator of models
    for m in client.models.list():
        # New SDK model object attributes may differ slightly, but usually has .name
        print(f"Name: {m.name}")
        # print(f"Supported methods: {m.supported_generation_methods}") # Might not be directly available or named differently
        print("-" * 20)
except Exception as e:
    print(f"Error listing models: {e}")
