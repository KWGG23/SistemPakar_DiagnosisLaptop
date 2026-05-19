import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.kerusakan import Kerusakan
from app.models.user import User
from app.schemas.kerusakan import KerusakanCreate, KerusakanResponse, KerusakanUpdate

router = APIRouter(prefix="/kerusakan", tags=["kerusakan"])


@router.get("", response_model=list[KerusakanResponse])
async def list_kerusakan(kategori: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Kerusakan)
    if kategori:
        q = q.filter(Kerusakan.kategori == kategori)
    return q.order_by(Kerusakan.kode).all()


@router.get("/{id}", response_model=KerusakanResponse)
async def get_kerusakan(id: str, db: Session = Depends(get_db)):
    obj = db.query(Kerusakan).filter(Kerusakan.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Kerusakan tidak ditemukan")
    return obj


@router.post("", response_model=KerusakanResponse, status_code=status.HTTP_201_CREATED)
async def create_kerusakan(
    body: KerusakanCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    if db.query(Kerusakan).filter(Kerusakan.kode == body.kode).first():
        raise HTTPException(status_code=400, detail="Kode kerusakan sudah ada")
    obj = Kerusakan(id=str(uuid.uuid4()), **body.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id}", response_model=KerusakanResponse)
async def update_kerusakan(
    id: str,
    body: KerusakanUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    obj = db.query(Kerusakan).filter(Kerusakan.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Kerusakan tidak ditemukan")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_kerusakan(
    id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    obj = db.query(Kerusakan).filter(Kerusakan.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Kerusakan tidak ditemukan")
    db.delete(obj)
    db.commit()
