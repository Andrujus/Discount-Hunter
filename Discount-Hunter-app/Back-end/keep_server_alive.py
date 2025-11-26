#!/usr/bin/env python
"""Wrapper script to keep uvicorn running with proper subprocess handling."""
import subprocess
import sys
import os

# Change to the Back-end directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Set environment
env = os.environ.copy()
env['PYTHONUNBUFFERED'] = '1'

print("[*] Starting Discount Hunter Backend Server...")
print("[*] Listening on http://127.0.0.1:3000")
print("[*] Press Ctrl+C to stop\n")

# Start uvicorn as a subprocess
proc = subprocess.Popen(
    [sys.executable, '-m', 'uvicorn', 'app.main:app', 
     '--host', '127.0.0.1', '--port', '3000', 
     '--log-level', 'info'],
    env=env
)

try:
    proc.wait()
except KeyboardInterrupt:
    print('\n[*] Shutting down...')
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
