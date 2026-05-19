from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.diagnosis_history import DiagnosisHistory
from app.models.user import User
from app.schemas.diagnosis import HistoryResponse

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[HistoryResponse])
async def list_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    return (
        db.query(DiagnosisHistory)
        .order_by(DiagnosisHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
