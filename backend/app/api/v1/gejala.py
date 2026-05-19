import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.gejala import Gejala
from app.models.user import User
from app.schemas.gejala import GejalaCreate, GejalaResponse, GejalaUpdate

router = APIRouter(prefix="/gejala", tags=["gejala"])


@router.get("", response_model=list[GejalaResponse])
async def list_gejala(kategori: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Gejala)
    if kategori:
        q = q.filter(Gejala.kategori == kategori)
    return q.order_by(Gejala.kode).all()


@router.get("/{id}", response_model=GejalaResponse)
async def get_gejala(id: str, db: Session = Depends(get_db)):
    obj = db.query(Gejala).filter(Gejala.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gejala tidak ditemukan")
    return obj


@router.post("", response_model=GejalaResponse, status_code=status.HTTP_201_CREATED)
async def create_gejala(
    body: GejalaCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    if db.query(Gejala).filter(Gejala.kode == body.kode).first():
        raise HTTPException(status_code=400, detail="Kode gejala sudah ada")
    obj = Gejala(id=str(uuid.uuid4()), **body.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id}", response_model=GejalaResponse)
async def update_gejala(
    id: str,
    body: GejalaUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    obj = db.query(Gejala).filter(Gejala.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gejala tidak ditemukan")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gejala(
    id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    obj = db.query(Gejala).filter(Gejala.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Gejala tidak ditemukan")
    db.delete(obj)
    db.commit()
