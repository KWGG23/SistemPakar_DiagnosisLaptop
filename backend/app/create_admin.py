"""
Script untuk membuat akun admin pertama.
Jalankan: python -m app.create_admin
"""
import uuid

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.base import Base
from app.models.user import User


def create_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if existing:
            print("Akun admin sudah ada.")
            return
        admin = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@sistempakar.local",
            hashed_password=hash_password("admin123"),
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        print("Akun admin berhasil dibuat!")
        print("  Username : admin")
        print("  Password : admin123")
        print("  SEGERA GANTI PASSWORD setelah login pertama kali.")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
