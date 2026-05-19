from sqlalchemy import Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Rule(Base):
    __tablename__ = "rule"
    __table_args__ = (
        UniqueConstraint("gejala_id", "kerusakan_id", name="uq_rule_gejala_kerusakan"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    gejala_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gejala.id", ondelete="CASCADE"), nullable=False, index=True
    )
    kerusakan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("kerusakan.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cf_pakar: Mapped[float] = mapped_column(Float, nullable=False)

    gejala: Mapped["Gejala"] = relationship("Gejala", back_populates="rules")
    kerusakan: Mapped["Kerusakan"] = relationship("Kerusakan", back_populates="rules")
