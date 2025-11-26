#!/usr/bin/env python3
"""Run the FastAPI server."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=3000,
        reload=False,
        log_level="info",
        access_log=True,
        loop="none",  # Don't create a new event loop
    )
