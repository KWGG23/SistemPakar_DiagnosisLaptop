from pydantic import BaseModel


class GejalaBase(BaseModel):
    kode: str
    pertanyaan: str
    kategori: str


class GejalaCreate(GejalaBase):
    pass


class GejalaUpdate(BaseModel):
    kode: str | None = None
    pertanyaan: str | None = None
    kategori: str | None = None


class GejalaResponse(GejalaBase):
    id: str

    model_config = {"from_attributes": True}
