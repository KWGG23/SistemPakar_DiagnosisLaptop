def cf_combine(cf_pakar: float, cf_user: float) -> float:
    """Hitung CF gabungan dari CF pakar dan CF user."""
    return cf_pakar * cf_user


def cf_merge(cf1: float, cf2: float) -> float:
    """Gabungkan dua nilai CF menggunakan formula kombinasi."""
    if cf1 >= 0 and cf2 >= 0:
        return cf1 + cf2 * (1 - cf1)
    elif cf1 < 0 and cf2 < 0:
        return cf1 + cf2 * (1 + cf1)
    else:
        denom = 1 - min(abs(cf1), abs(cf2))
        if denom == 0:
            return 0.0
        return (cf1 + cf2) / denom


def merge_cf_list(cf_values: list[float]) -> float:
    """Gabungkan daftar nilai CF secara sekuensial."""
    if not cf_values:
        return 0.0
    result = cf_values[0]
    for cf in cf_values[1:]:
        result = cf_merge(result, cf)
    return result
