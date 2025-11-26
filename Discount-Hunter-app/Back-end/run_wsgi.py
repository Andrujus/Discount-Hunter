#!/usr/bin/env python3
"""Simple WSGI server wrapper for testing."""

import sys
import os

# Add current dir to path
sys.path.insert(0, os.path.dirname(__file__))

def application(environ, start_response):
    """WSGI application for health check."""
    path = environ.get('PATH_INFO', '/')
    
    if path == '/healthz':
        status = '200 OK'
        response_headers = [('Content-Type', 'application/json')]
        start_response(status, response_headers)
        return [b'{"status": "ok"}']
    
    status = '404 Not Found'
    response_headers = [('Content-Type', 'application/json')]
    start_response(status, response_headers)
    return [b'{"error": "not found"}']

if __name__ == '__main__':
    # Use waitress as WSGI server
    from waitress import serve
    serve(application, host='127.0.0.1', port=3000, threads=4)
