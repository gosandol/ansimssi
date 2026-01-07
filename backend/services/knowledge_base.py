import os
import json
import difflib
import uuid
from datetime import datetime

class KnowledgeBase:
    def __init__(self, data_file='data/knowledge_base.json'):
        self.data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), data_file)
        self.data = self._load_data()

    def _load_data(self):
        if not os.path.exists(self.data_file):
            # Create empty file if not exists
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            return []
        
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading knowledge base: {e}")
            return []

    def _extract_keywords(self, text):
        """Simple keyword extraction (split by space)"""
        if not text:
            return []
        # Basic tokenization: split by space and filter short words
        return [w for w in text.split() if len(w) > 1]

    def save_interaction(self, query, response_data):
        """
        Save a successful interaction to the knowledge base.
        response_data should contain 'answer', 'sources', 'images'.
        """
        # Check if similar query already exists to avoid duplicates
        for item in self.data:
            if item['query'] == query:
                return # Already exists

        entry = {
            "id": str(uuid.uuid4()),
            "category": "general", # Default, can be refined later
            "keywords": self._extract_keywords(query),
            "query": query,
            "answer": response_data.get('answer', ''),
            "sources": response_data.get('sources', []),
            "images": response_data.get('images', []),
            "related_questions": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "timestamp": datetime.now().strftime("%Y-%m-%d") # Keep for backward compatibility
        }
        
        self.data.append(entry)
        
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            print(f"[KnowledgeBase] Learned new information for: {query}")
        except Exception as e:
            print(f"Error saving to knowledge base: {e}")

    def find_match(self, query):
        """
        Find a matching result in the knowledge base using a scoring system.
        Returns the best matching data object or None.
        """
        # Reload data to ensure freshness (Dev Mode optimization)
        self.data = self._load_data()
        
        if not self.data:
            return None

        query_keywords = set(self._extract_keywords(query))
        best_score = 0
        best_match = None

        print(f"[KnowledgeBase] Searching for: {query}")

        for item in self.data:
            score = 0
            item_query = item['query']
            
            # 1. Exact Match (Highest Priority)
            if item_query == query:
                print(f"[KnowledgeBase] Exact match found for: {query}")
                return item
            
            # 2. Keyword Intersection (Significant weight)
            item_keywords = set(item.get('keywords', []))
            # If keywords are missing in legacy data, extract on the fly
            if not item_keywords:
                item_keywords = set(self._extract_keywords(item_query))
            
            common_keywords = query_keywords.intersection(item_keywords)
            score += len(common_keywords) * 10 
            
            # 3. Fuzzy Similarity (Tie-breaker and nuance)
            ratio = difflib.SequenceMatcher(None, query, item_query).ratio()
            score += ratio * 20 # Max 20 points for perfect string match
            
            # Thresholding
            if score > best_score:
                best_score = score
                best_match = item

        # Determine if the best match is good enough
        # Minimum score requirement: e.g., at least one keyword match (10) or very high fuzzy (0.5 * 20 = 10)
        THRESHOLD = 15 
        
        if best_match and best_score >= THRESHOLD:
            print(f"[KnowledgeBase] Best match found (Score: {best_score:.2f}): {best_match['query']}")
            return best_match
        
        print(f"[KnowledgeBase] No suitable match found. Best score was {best_score:.2f}")
        return None
