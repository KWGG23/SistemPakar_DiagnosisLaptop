from pydantic import BaseModel


class KerusakanBase(BaseModel):
    kode: str
    nama: str
    deskripsi: str
    solusi: str
    kategori: str


class KerusakanCreate(KerusakanBase):
    pass


class KerusakanUpdate(BaseModel):
    kode: str | None = None
    nama: str | None = None
    deskripsi: str | None = None
    solusi: str | None = None
    kategori: str | None = None


class KerusakanResponse(KerusakanBase):
    id: str

    model_config = {"from_attributes": True}
