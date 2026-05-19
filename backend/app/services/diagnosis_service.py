import uuid

from sqlalchemy.orm import Session

from app.engine.forward_chain import run_diagnosis
from app.models.diagnosis_history import DiagnosisHistory
from app.schemas.diagnosis import DiagnoseRequest, DiagnoseResponse


def diagnose(db: Session, request: DiagnoseRequest) -> DiagnoseResponse:
    session_id = request.session_id or str(uuid.uuid4())

    hasil = run_diagnosis(db, request.gejala_list)

    history = DiagnosisHistory(
        id=str(uuid.uuid4()),
        session_id=session_id,
        gejala_dipilih=[
            {"gejala_id": g.gejala_id, "cf_user": g.cf_user}
            for g in request.gejala_list
        ],
        hasil=[h.model_dump() for h in hasil],
    )
    db.add(history)
    db.commit()

    return DiagnoseResponse(
        session_id=session_id,
        hasil=hasil,
        total_gejala=len(request.gejala_list),
    )
