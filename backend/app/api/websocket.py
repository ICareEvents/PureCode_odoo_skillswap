from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List
import json
import asyncio
from ..database import get_db
from ..models import User
from ..core import verify_token

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    disconnected.append(connection)
            
            for connection in disconnected:
                self.disconnect(connection, user_id)
    
    async def broadcast_message(self, message: dict):
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()

async def get_user_from_token(token: str, db: Session) -> User:
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or banned"
        )
    
    return user

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    try:
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=1008, reason="Token required")
            return
        
        db = next(get_db())
        try:
            user = await get_user_from_token(token, db)
            if user.id != user_id:
                await websocket.close(code=1008, reason="Invalid user")
                return
        finally:
            db.close()
        
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                if message_data.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
        except Exception as e:
            manager.disconnect(websocket, user_id)
    
    except Exception as e:
        try:
            await websocket.close(code=1011, reason="Internal error")
        except:
            pass

async def notify_swap_update(user_id: int, swap_data: dict):
    await manager.send_personal_message({
        "type": "swap_update",
        "data": swap_data
    }, user_id)

async def notify_new_request(user_id: int, request_data: dict):
    await manager.send_personal_message({
        "type": "new_request",
        "data": request_data
    }, user_id)

async def notify_rating_received(user_id: int, rating_data: dict):
    await manager.send_personal_message({
        "type": "rating_received",
        "data": rating_data
    }, user_id)