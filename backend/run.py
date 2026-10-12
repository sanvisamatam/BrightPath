import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app

if __name__ == "__main__":
    print("Starting BrightPath Python Flask Backend on http://127.0.0.1:8000 ...")
    app.run(host="127.0.0.1", port=8000, debug=False)
