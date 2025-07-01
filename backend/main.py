from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TOKUTEI Learning API",
    description="API for TOKUTEI Learning - 特定技能試験学習支援アプリ",
    version="1.0.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TOKUTEI Learning API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tokutei-learning-api"}

@app.get("/api/v1/hello")
async def hello():
    return {"message": "Hello from TOKUTEI Learning API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)