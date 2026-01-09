import os

def check_env_file(path, label):
    print(f"--- Checking {label} at {path} ---")
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    current_keys = {}
    with open(path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                current_keys[k.strip()] = v.strip().strip("'").strip('"')

    target_keys = {
        "VITE_SUPABASE_URL": "https://mpscnhrjzfwefnyzhsfz.supabase.com",
        "VITE_SUPABASE_ANON_KEY": "sb_publishable_5RNY_xlfYeHCdA08wo7zpA_JnkFJ8KC",
        # Note: User provided 'VAIT_' likely typo for VITE_
        
        "SUPABASE_SERVICE_ROLE_KEY": "sb_secret_cNrug2sv3j7H1-DH0lp2TQ_0kMz0YmB",
        "GEMINI_API_KEY": "AIzaSyCIpjvjOpLs4asnyqpgs-N0V2O8FV6dOpA",
        "TAVILY_API_KEY": "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",
        "BRAVE_API_KEY": "BSAUYZb8zl5vianCA44waGpdIU3VjSg",
        "EXA_API_KEY": "cb7bb9f3-9089-4226-b031-035c5ec216f8",
        "SERPAPI_API_KEY": "d17dde4ac81f6ab3ec87f49e65c1fde625f6cf05e877e4be3b13bb6d3d4e107c"
    }

    for k, v in target_keys.items():
        if k not in current_keys:
            print(f"[MISSING] {k}")
        elif current_keys[k] != v:
            print(f"[MISMATCH] {k}")
            # print(f"  Target: {v}") # Security: Try not to print full keys if possible, but user provided them.
        else:
            print(f"[MATCH] {k}")

# Check Backend .env
check_env_file('backend/.env', 'Backend .env')

# Check Root .env (if it affects frontend/vite)
check_env_file('.env', 'Root .env')
