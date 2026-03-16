from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import agent, token
from routes import session
import os
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Agora ConvoAI Python Server",
    description="Python implementation of Agora ConvoAI server",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# Register routes
app.include_router(agent.router)
app.include_router(token.router)
app.include_router(session.router)

# Main entry point
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
