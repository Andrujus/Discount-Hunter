import sys
sys.path.insert(0, '.')

from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/test")
async def test_endpoint():
    return {"message": "hello"}

if __name__ == "__main__":
    print("Starting simple test server on port 3000...")
    uvicorn.run(app, host="127.0.0.1", port=3000)
