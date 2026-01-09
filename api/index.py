import os
import sys
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/debug")
def debug_env():
    return {"status": "ok", "message": "Backend is ALIVE. Imports were the issue."}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ansimssi AI Backend (Emergency Mode)"}

# --- COMMENTED OUT FOR DIAGNOSIS ---
# try:
#     from tavily import TavilyClient
#     import google.generativeai as genai
#     from supabase import create_client, Client
# except Exception as e:
#     print(f"Import Error: {e}")

# ... (Rest of the code is effectively disabled) ...
