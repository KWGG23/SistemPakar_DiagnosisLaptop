from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Kerusakan(Base):
    __tablename__ = "kerusakan"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    kode: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    nama: Mapped[str] = mapped_column(String(200), nullable=False)
    deskripsi: Mapped[str] = mapped_column(Text, nullable=False)
    solusi: Mapped[str] = mapped_column(Text, nullable=False)
    kategori: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    rules: Mapped[list["Rule"]] = relationship(
        "Rule", back_populates="kerusakan", cascade="all, delete-orphan"
    )
