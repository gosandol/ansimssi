import os
import json
import difflib

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

    def save_interaction(self, query, response_data):
        """
        Save a successful interaction to the knowledge base.
        response_data should contain 'answer', 'sources', 'images'.
        """
        # Check if similar query already exists to avoid duplicates
        # Simple exact match check for now, can be improved
        for item in self.data:
            if item['query'] == query:
                return # Already exists, maybe update timestamp in future

        entry = {
            "query": query,
            "answer": response_data.get('answer', ''),
            "sources": response_data.get('sources', []),
            "images": response_data.get('images', []),
            "timestamp": "2026-01-07" # In real app, use datetime
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
        Find a matching result in the knowledge base.
        Returns the data object or None.
        """
        # Reload data to ensure freshness (Dev Mode optimization)
        self.data = self._load_data()

        # 1. Exact Match
        for item in self.data:
            if item['query'] == query:
                print(f"[KnowledgeBase] Exact match found for: {query}")
                return item
        
        # 2. Fuzzy Match (Simple inclusion or strict similarity)
        # Using difflib for similarity
        best_ratio = 0.0
        best_match = None
        
        for item in self.data:
            ratio = difflib.SequenceMatcher(None, query, item['query']).ratio()
            if ratio > 0.8: # High similarity threshold
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = item
        
        if best_match:
            print(f"[KnowledgeBase] Fuzzy match ({best_ratio:.2f}) found: {best_match['query']}")
            return best_match

        return None
