#!/usr/bin/env python
"""Simple foreground server that stays alive."""
import sys
sys.path.insert(0, '.')

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=3000,
        log_level="info"
    )
