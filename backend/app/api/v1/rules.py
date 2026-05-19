import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.gejala import Gejala
from app.models.kerusakan import Kerusakan
from app.models.rule import Rule
from app.models.user import User
from app.schemas.rule import RuleCreate, RuleResponse, RuleUpdate, RuleWithDetails

router = APIRouter(prefix="/rules", tags=["rules"])


@router.get("", response_model=list[RuleWithDetails])
async def list_rules(db: Session = Depends(get_db)):
    rules = db.query(Rule).all()
    result = []
    for rule in rules:
        gejala = db.query(Gejala).filter(Gejala.id == rule.gejala_id).first()
        kerusakan = db.query(Kerusakan).filter(Kerusakan.id == rule.kerusakan_id).first()
        result.append(
            RuleWithDetails(
                id=rule.id,
                gejala_id=rule.gejala_id,
                kerusakan_id=rule.kerusakan_id,
                cf_pakar=rule.cf_pakar,
                gejala_kode=gejala.kode if gejala else None,
                gejala_pertanyaan=gejala.pertanyaan if gejala else None,
                kerusakan_kode=kerusakan.kode if kerusakan else None,
                kerusakan_nama=kerusakan.nama if kerusakan else None,
            )
        )
    return result


@router.post("", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    body: RuleCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    existing = (
        db.query(Rule)
        .filter(Rule.gejala_id == body.gejala_id, Rule.kerusakan_id == body.kerusakan_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Rule untuk pasangan gejala-kerusakan ini sudah ada")
    obj = Rule(id=str(uuid.uuid4()), **body.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id}", response_model=RuleResponse)
async def update_rule(
    id: str,
    body: RuleUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    obj = db.query(Rule).filter(Rule.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Rule tidak ditemukan")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(
    id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    obj = db.query(Rule).filter(Rule.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Rule tidak ditemukan")
    db.delete(obj)
    db.commit()
