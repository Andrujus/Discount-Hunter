#!/usr/bin/env python
"""Simple foreground server that stays alive."""
import sys
sys.path.insert(0, '.')

from app.main import app
import uvicorn

if __name__ == "__main__":
    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=3000,
        log_level="info",
        lifespan="on"
    )
    server = uvicorn.Server(config)
    
    # This will block until server is manually stopped
    import asyncio
    try:
        asyncio.run(server.serve())
    except KeyboardInterrupt:
        pass
