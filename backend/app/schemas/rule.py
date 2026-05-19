from pydantic import BaseModel, Field


class RuleBase(BaseModel):
    gejala_id: str
    kerusakan_id: str
    cf_pakar: float = Field(ge=0.0, le=1.0)


class RuleCreate(RuleBase):
    pass


class RuleUpdate(BaseModel):
    cf_pakar: float | None = Field(default=None, ge=0.0, le=1.0)


class RuleResponse(RuleBase):
    id: str

    model_config = {"from_attributes": True}


class RuleWithDetails(RuleResponse):
    gejala_kode: str | None = None
    gejala_pertanyaan: str | None = None
    kerusakan_kode: str | None = None
    kerusakan_nama: str | None = None
