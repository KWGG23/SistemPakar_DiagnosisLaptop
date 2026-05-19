from sqlalchemy.orm import Session

from app.engine.certainty_factor import cf_combine, merge_cf_list
from app.models.kerusakan import Kerusakan
from app.models.rule import Rule
from app.schemas.diagnosis import DiagnosisItem, GejalaInput

CF_THRESHOLD = 0.2
MAX_RESULTS = 5


def run_diagnosis(db: Session, gejala_inputs: list[GejalaInput]) -> list[DiagnosisItem]:
    if not gejala_inputs:
        return []

    gejala_ids = [g.gejala_id for g in gejala_inputs]
    cf_user_map = {g.gejala_id: g.cf_user for g in gejala_inputs}

    rules = db.query(Rule).filter(Rule.gejala_id.in_(gejala_ids)).all()

    kerusakan_cf_map: dict[str, list[float]] = {}
    for rule in rules:
        cf_user = cf_user_map.get(rule.gejala_id, 0.0)
        cf_combined = cf_combine(rule.cf_pakar, cf_user)
        if cf_combined == 0.0:
            continue
        kerusakan_cf_map.setdefault(rule.kerusakan_id, []).append(cf_combined)

    results: list[DiagnosisItem] = []
    for kerusakan_id, cf_list in kerusakan_cf_map.items():
        cf_total = merge_cf_list(cf_list)
        if cf_total < CF_THRESHOLD:
            continue
        kerusakan = db.query(Kerusakan).filter(Kerusakan.id == kerusakan_id).first()
        if not kerusakan:
            continue
        results.append(
            DiagnosisItem(
                kerusakan_id=kerusakan_id,
                kode=kerusakan.kode,
                nama=kerusakan.nama,
                deskripsi=kerusakan.deskripsi,
                solusi=kerusakan.solusi,
                kategori=kerusakan.kategori,
                cf_total=round(cf_total, 4),
            )
        )

    results.sort(key=lambda x: x.cf_total, reverse=True)
    return results[:MAX_RESULTS]
