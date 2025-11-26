#!/usr/bin/env python
"""Direct uvicorn run with error handling."""
import sys
import os

sys.path.insert(0, '.')

# Minimal imports first to catch import errors
try:
    import uvicorn
    print("[OK] uvicorn imported")
except Exception as e:
    print(f"[FAIL] Failed to import uvicorn: {e}")
    sys.exit(1)

try:
    from app.main import app
    print("[OK] app.main imported")
except Exception as e:
    print(f"[FAIL] Failed to import app.main: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("[*] Starting server on http://127.0.0.1:3000...")
try:
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=3000,
        log_level="info"
    )
except Exception as e:
    print(f"[FAIL] uvicorn.run() failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
