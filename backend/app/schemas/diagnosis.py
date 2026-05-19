from datetime import datetime

from pydantic import BaseModel, Field


class GejalaInput(BaseModel):
    gejala_id: str
    cf_user: float = Field(ge=-1.0, le=1.0)


class DiagnoseRequest(BaseModel):
    gejala_list: list[GejalaInput]
    session_id: str | None = None


class DiagnosisItem(BaseModel):
    kerusakan_id: str
    kode: str
    nama: str
    deskripsi: str
    solusi: str
    kategori: str
    cf_total: float


class DiagnoseResponse(BaseModel):
    session_id: str
    hasil: list[DiagnosisItem]
    total_gejala: int


class HistoryResponse(BaseModel):
    id: str
    session_id: str
    gejala_dipilih: list
    hasil: list
    created_at: datetime

    model_config = {"from_attributes": True}
