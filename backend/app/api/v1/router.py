from fastapi import APIRouter

from app.api.v1 import auth, diagnosis, gejala, history, kerusakan, rules

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(diagnosis.router)
api_router.include_router(gejala.router)
api_router.include_router(kerusakan.router)
api_router.include_router(rules.router)
api_router.include_router(history.router)
