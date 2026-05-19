from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Gejala(Base):
    __tablename__ = "gejala"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    kode: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    pertanyaan: Mapped[str] = mapped_column(Text, nullable=False)
    kategori: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    rules: Mapped[list["Rule"]] = relationship(
        "Rule", back_populates="gejala", cascade="all, delete-orphan"
    )
