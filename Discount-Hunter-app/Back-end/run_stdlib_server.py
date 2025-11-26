#!/usr/bin/env python3
"""Test server using pure stdlib http.server."""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

class AuthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/healthz':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        from app.services.auth import register_user, login_user
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            if self.path == '/api/auth/register':
                result = register_user(
                    data['email'],
                    data['first_name'],
                    data['last_name'],
                    data['password']
                )
                status = 200
            elif self.path == '/api/auth/login':
                result = login_user(data['email'], data['password'])
                status = 200
            else:
                status = 404
                result = {"error": "not found"}
        except Exception as e:
            status = 400
            result = {"error": str(e)}
        
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.client_address[0]}] {format % args}")

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 3000), AuthHandler)
    print("Auth server running on http://127.0.0.1:3000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()
