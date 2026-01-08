
import os
import sys

# Add backend directory to sys.path so that absolute imports within backend/main.py work
# (e.g. "from services import ...")
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(os.path.dirname(current_dir), 'backend')
sys.path.append(backend_dir)

from backend.main import app
