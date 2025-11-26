# Discount Hunter Backend - Authentication Server

## Quick Start

**Start the backend server:**
```bash
cd Discount-Hunter-app\Back-end
python run_stdlib_server.py
```

Server will run on: `http://127.0.0.1:3000`

Or use the batch launcher:
```bash
.\start_backend.bat
```

## API Endpoints

### Health Check
- **GET** `/healthz` - Server status check
- Response: `{"status": "ok", "timestamp": "2025-11-26T13:10:17.745371"}`

### Registration
- **POST** `/api/auth/register`
- Request:
  ```json
  {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "secure_password"
  }
  ```
- Response:
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Login
- **POST** `/api/auth/login`
- Request:
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```
- Response: Same as registration (includes JWT token)

### Get Current User
- **GET** `/api/auth/me?token=<jwt_token>`
- Response:
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

## Why run_stdlib_server.py?

This project uses Python's standard library HTTP server instead of FastAPI/uvicorn because:
1. **Reliability on Windows**: No event loop issues or async conflicts
2. **Simplicity**: No dependency on external ASGI servers
3. **Stability**: Processes requests without hanging or crashing
4. **Direct Integration**: Uses the same auth service logic as original FastAPI implementation

## Architecture

- **Server**: `run_stdlib_server.py` - Pure Python stdlib HTTP server
- **Auth Logic**: `app/services/auth.py` - Password hashing, JWT tokens, user management
- **Database**: SQLite (`discount_hunter.db`) - User storage
- **Frontend Communication**: Simple JSON HTTP API

## Environment

- Python 3.14
- SQLite 3 (included)
- Dependencies: bcrypt, PyJWT, python-jose, email-validator, fastapi (for schemas)

## Testing

Direct API test:
```python
import urllib.request, json

# Register
data = {"email": "test@example.com", "first_name": "Test", "last_name": "User", "password": "pass123"}
req = urllib.request.Request('http://127.0.0.1:3000/api/auth/register', 
                             data=json.dumps(data).encode(), 
                             headers={'Content-Type': 'application/json'}, method='POST')
response = urllib.request.urlopen(req)
print(json.loads(response.read()))
```

## Troubleshooting

**Port 3000 already in use?**
```powershell
# Kill existing Python processes
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Database locked?**
```powershell
# Delete and recreate
rm discount_hunter.db
python run_stdlib_server.py  # Creates new DB on startup
```
