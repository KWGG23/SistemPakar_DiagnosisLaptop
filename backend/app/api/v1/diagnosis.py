from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.diagnosis import DiagnoseRequest, DiagnoseResponse
from app.services.diagnosis_service import diagnose

router = APIRouter(prefix="/diagnose", tags=["diagnosis"])


@router.post("", response_model=DiagnoseResponse)
async def run_diagnose(body: DiagnoseRequest, db: Session = Depends(get_db)):
    return diagnose(db, body)
