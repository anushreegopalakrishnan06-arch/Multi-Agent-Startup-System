"""
api.py — Main FastAPI application.

Mounts auth and report routers, configures CORS, WebSocket live logs,
MongoDB lifecycle events, and the CrewAI agent execution endpoints.
"""

import os
import sys
import queue
import asyncio
import traceback
from contextlib import asynccontextmanager

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dotenv import load_dotenv
load_dotenv()

# Add src/ to path so we can import startup_advisor
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from startup_advisor.crew import StartupAdvisor  # noqa: E402
from db import connect_db, close_db, agent_outputs_collection  # noqa: E402
from auth_routes import router as auth_router, get_current_user  # noqa: E402
from report_routes import router as report_router  # noqa: E402


# --- Real-time WebSocket Logging ---
log_queue = queue.Queue()
connected_websockets = []


class WSStreamLogger:
    """Intercepts stdout/stderr and pushes output to a shared queue for WebSocket broadcast."""
    def __init__(self, original_stream):
        self.original_stream = original_stream
        self.encoding = 'utf-8'

    def write(self, buf):
        try:
            self.original_stream.write(buf)
        except UnicodeEncodeError:
            pass  # ignore emoji errors on Windows console
        if buf:
            log_queue.put(buf)

    def flush(self):
        self.original_stream.flush()

    def isatty(self):
        return False

    def __getattr__(self, name):
        return getattr(self.original_stream, name)


# Redirect stdout and stderr
sys.stdout = WSStreamLogger(sys.stdout)
sys.stderr = WSStreamLogger(sys.stderr)


# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect to MongoDB, start log broadcaster. Shutdown: close MongoDB."""
    await connect_db()
    broadcaster_task = asyncio.create_task(log_broadcaster())
    yield
    broadcaster_task.cancel()
    await close_db()


async def log_broadcaster():
    """Background task: drains the log_queue and broadcasts to all WebSocket clients."""
    while True:
        try:
            while not log_queue.empty():
                buf = log_queue.get_nowait()
                disconnected = []
                for ws in connected_websockets:
                    try:
                        await ws.send_text(buf)
                    except Exception:
                        disconnected.append(ws)
                for ws in disconnected:
                    if ws in connected_websockets:
                        connected_websockets.remove(ws)
            await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            break
        except Exception:
            await asyncio.sleep(0.05)


# --- FastAPI App ---
app = FastAPI(
    title="Startup Intelligence Multi-Agent API",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router)
app.include_router(report_router)

# Mount static files for uploads (e.g. profile pictures)
import os
os.makedirs("uploads", exist_ok=True)
from fastapi.staticfiles import StaticFiles
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")



from fastapi import Query
# --- WebSocket endpoint ---
@app.websocket("/api/ws/logs")
async def websocket_logs(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return
        
    try:
        from auth_routes import decode_jwt, is_admin_check
        payload = decode_jwt(token)
        email = payload.get("email")
        if not email or not is_admin_check(email):
            await websocket.close(code=1008, reason="Unauthorized")
            return
    except Exception as e:
        await websocket.close(code=1008, reason="Invalid token")
        return

    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)



# --- CrewAI Agent Execution Endpoints ---

class TrendRequest(BaseModel):
    pass

class DiscoveryRequest(BaseModel):
    field: str
    budget: str

class FinancialRequest(BaseModel):
    business_report: str

class ValidationRequest(BaseModel):
    financial_report: str


@app.post("/api/trend")
async def run_trend_agent(req: TrendRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = await asyncio.to_thread(StartupAdvisor().trend_crew().kickoff, inputs={})
        result_str = str(result)
        
        # Save directly to MongoDB
        agent_outputs = agent_outputs_collection()
        await agent_outputs.insert_one({
            "user_id": current_user["_id"],
            "agent_type": "trend",
            "output_data": result_str,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"status": "success", "data": result_str}
    except Exception:
        error_details = traceback.format_exc()
        print(error_details)
        raise HTTPException(status_code=500, detail=error_details)


@app.post("/api/discovery")
async def run_discovery_agent(req: DiscoveryRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = await asyncio.to_thread(
            StartupAdvisor().business_crew().kickoff,
            inputs={"field": req.field, "budget": req.budget}
        )
        result_str = str(result)
        
        # Save directly to MongoDB
        agent_outputs = agent_outputs_collection()
        await agent_outputs.insert_one({
            "user_id": current_user["_id"],
            "agent_type": "discovery",
            "inputs": {"field": req.field, "budget": req.budget},
            "output_data": result_str,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"status": "success", "data": result_str}
    except Exception:
        error_details = traceback.format_exc()
        print(error_details)
        raise HTTPException(status_code=500, detail=error_details)


@app.post("/api/financial")
async def run_financial_agent(req: FinancialRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = await asyncio.to_thread(
            StartupAdvisor().financial_crew().kickoff,
            inputs={"business_report": req.business_report}
        )
        result_str = str(result)
        
        # Save directly to MongoDB
        agent_outputs = agent_outputs_collection()
        await agent_outputs.insert_one({
            "user_id": current_user["_id"],
            "agent_type": "financial",
            "output_data": result_str,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"status": "success", "data": result_str}
    except Exception:
        error_details = traceback.format_exc()
        print(error_details)
        raise HTTPException(status_code=500, detail=error_details)


@app.post("/api/validation")
async def run_validation_agent(req: ValidationRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = await asyncio.to_thread(
            StartupAdvisor().validation_crew().kickoff,
            inputs={"financial_report": req.financial_report}
        )
        result_str = str(result)
        
        # Save directly to MongoDB
        agent_outputs = agent_outputs_collection()
        await agent_outputs.insert_one({
            "user_id": current_user["_id"],
            "agent_type": "validation",
            "output_data": result_str,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"status": "success", "data": result_str}
    except Exception:
        error_details = traceback.format_exc()
        print(error_details)
        raise HTTPException(status_code=500, detail=error_details)



@app.get("/api/models")
def get_models():
    """Fetch available LLM models from LM Studio (if running locally)."""
    import urllib.request
    import json
    api_base = os.getenv("OPENAI_API_BASE", "http://localhost:1234/v1")
    try:
        req = urllib.request.Request(f"{api_base}/models")
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {"status": "success", "data": data.get("data", [])}
    except Exception as e:
        print(f"Error fetching models from LM Studio: {e}")
        return {"status": "error", "error": str(e), "data": []}


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
