import os
import sys

# Critical Fix for "Two Brains" Issue
# This file (api/index.py) is the entry point for Vercel Serverless Functions.
# Previously, it contained a stale, duplicate copy of the backend logic.
# Now, we simply bridge it to use the source-of-truth: backend/main.py

# Add the 'backend' directory to Python path so we can import 'main' and its dependencies (services, etc.)
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, '..', 'backend')
sys.path.append(backend_dir)

# Import the FastAPI app from backend/main.py
# This ensures verified fixes (Search Timeouts, 5-Tier Logic) are applied in production.
try:
    from main import app
except ImportError as e:
    # Fallback for debugging path issues in Vercel logs
    print(f"Import Error: {e}")
    print(f"Sys Path: {sys.path}")
    raise e
