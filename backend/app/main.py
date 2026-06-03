from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.models.base import Base
import app.models.gejala  # noqa: F401
import app.models.kerusakan  # noqa: F401
import app.models.rule  # noqa: F401
import app.models.diagnosis_history  # noqa: F401
import app.models.user  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistem Pakar Diagnosis Kerusakan Laptop/PC",
    description="API untuk diagnosis kerusakan hardware laptop/PC menggunakan Forward Chaining + Certainty Factor",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
