import sys
import subprocess
import time
import threading

sys.path.insert(0, '.')

def run_server():
    """Run the server in a subprocess to avoid shutdown issues."""
    print("Starting Uvicorn server...")
    subprocess.run([
        sys.executable, '-m', 'uvicorn',
        'app.main:app',
        '--host', '127.0.0.1',
        '--port', '3000',
        '--reload', 'False'
    ], env={'PYTHONPATH': '.'})

if __name__ == '__main__':
    try:
        run_server()
    except KeyboardInterrupt:
        print("\nServer interrupted by user")
