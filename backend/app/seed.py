"""
Seed script: load knowledge base dari knowledge_base.json ke database.
Jalankan: python -m app.seed
"""

import json
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

# Sesuaikan import ini dengan struktur ORM project kamu
from app.core.database import SessionLocal, engine
from app.models.gejala import Gejala
from app.models.kerusakan import Kerusakan
from app.models.rule import Rule
from app.models.base import Base

KB_PATH = Path(__file__).parent / "data" / "knowledge_base.json"


def load_knowledge_base() -> dict:
    with open(KB_PATH, encoding="utf-8") as f:
        return json.load(f)


def seed_gejala(db: Session, gejala_list: list[dict]) -> dict[str, str]:
    """Insert gejala, return mapping kode -> id."""
    kode_to_id: dict[str, str] = {}
    for item in gejala_list:
        existing = db.query(Gejala).filter(Gejala.kode == item["kode"]).first()
        if existing:
            kode_to_id[item["kode"]] = str(existing.id)
            continue
        obj = Gejala(
            id=str(uuid.uuid4()),
            kode=item["kode"],
            pertanyaan=item["pertanyaan"],
            kategori=item["kategori"],
        )
        db.add(obj)
        kode_to_id[item["kode"]] = obj.id
    db.flush()
    return kode_to_id


def seed_kerusakan(db: Session, kerusakan_list: list[dict]) -> dict[str, str]:
    """Insert kerusakan, return mapping kode -> id."""
    kode_to_id: dict[str, str] = {}
    for item in kerusakan_list:
        existing = db.query(Kerusakan).filter(Kerusakan.kode == item["kode"]).first()
        if existing:
            kode_to_id[item["kode"]] = str(existing.id)
            continue
        obj = Kerusakan(
            id=str(uuid.uuid4()),
            kode=item["kode"],
            nama=item["nama"],
            deskripsi=item["deskripsi"],
            solusi=item["solusi"],
            kategori=item["kategori"],
        )
        db.add(obj)
        kode_to_id[item["kode"]] = obj.id
    db.flush()
    return kode_to_id


def seed_rules(
    db: Session,
    rules_list: list[dict],
    gejala_map: dict[str, str],
    kerusakan_map: dict[str, str],
) -> None:
    """Insert rules jika belum ada (idempotent berdasarkan pasangan gejala+kerusakan)."""
    for item in rules_list:
        gejala_id = gejala_map.get(item["gejala_kode"])
        kerusakan_id = kerusakan_map.get(item["kerusakan_kode"])
        if not gejala_id or not kerusakan_id:
            print(
                f"  [SKIP] Rule {item['gejala_kode']} -> {item['kerusakan_kode']}: ID tidak ditemukan"
            )
            continue
        existing = (
            db.query(Rule)
            .filter(Rule.gejala_id == gejala_id, Rule.kerusakan_id == kerusakan_id)
            .first()
        )
        if existing:
            continue
        obj = Rule(
            id=str(uuid.uuid4()),
            gejala_id=gejala_id,
            kerusakan_id=kerusakan_id,
            cf_pakar=item["cf_pakar"],
        )
        db.add(obj)
    db.flush()


def run_seed() -> None:
    print("=== Memulai seeding knowledge base ===")
    Base.metadata.create_all(bind=engine)

    data = load_knowledge_base()
    db: Session = SessionLocal()

    try:
        print(f"  Seeding {len(data['gejala'])} gejala...")
        gejala_map = seed_gejala(db, data["gejala"])

        print(f"  Seeding {len(data['kerusakan'])} kerusakan...")
        kerusakan_map = seed_kerusakan(db, data["kerusakan"])

        print(f"  Seeding {len(data['rules'])} rules...")
        seed_rules(db, data["rules"], gejala_map, kerusakan_map)

        db.commit()
        print("=== Seeding selesai! ===")
        print(f"  Total gejala  : {len(gejala_map)}")
        print(f"  Total kerusakan: {len(kerusakan_map)}")
        print(f"  Total rules   : {len(data['rules'])}")

    except Exception as exc:
        db.rollback()
        print(f"[ERROR] Seeding gagal: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
