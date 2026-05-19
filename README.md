# Sistem Pakar Diagnosis Kerusakan Laptop/PC

Aplikasi web sistem pakar berbasis **Forward Chaining + Certainty Factor (CF)** untuk mendiagnosis kerusakan laptop/PC. User menjawab pertanyaan gejala secara bertahap, sistem menyimpulkan kemungkinan kerusakan beserta solusinya.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.11+), SQLAlchemy, SQLite (dev) / PostgreSQL (prod) |
| Inference | Forward Chaining + Certainty Factor |
| State | Zustand |
| Auth | JWT (python-jose + passlib) |

---

## Fitur

- **Diagnosis wizard** — user menjawab gejala per kategori, sistem menghitung CF dan menampilkan hasil beserta solusi
- **9+ kategori kerusakan** — Power, Baterai, Display, Overheating, Storage, Keyboard, Audio, Konektivitas, RAM, dst.
- **Panel Admin** — CRUD gejala, kerusakan, rules/CF, dan riwayat diagnosis
- **Certainty Factor** — kombinasi CF pakar × CF user dengan formula standar

---

## Cara Menjalankan

### 1. Backend (FastAPI)

```bash
cd backend

# Buat virtual environment (pertama kali)
python -m venv .venv

# Aktifkan venv
# Windows PowerShell:
.venv\Scripts\activate
# Git Bash / Linux / Mac:
source .venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python -m uvicorn app.main:app --reload --port 8000
```

API berjalan di `http://localhost:8000`
Dokumentasi API: `http://localhost:8000/docs`

### 2. Frontend (Next.js)

```bash
cd frontend

# Install dependencies (pertama kali)
pnpm install
pnpm approve-builds   # approve build scripts (sharp, dll)

# Jalankan dev server
pnpm dev
```

Aplikasi berjalan di `http://localhost:3000`

---

## Environment Variables

**Backend** — buat file `backend/.env`:
```env
DATABASE_URL=sqlite:///./sistem_pakar.db
SECRET_KEY=ganti-dengan-secret-key-yang-kuat
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=development
```

**Frontend** — buat file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Akun Default

| Username | Password | Role |
|---|---|---|
| `admin` | *(set saat seed)* | Admin |

Reset password admin via terminal:
```bash
cd backend
python -c "
import app.models.gejala, app.models.kerusakan, app.models.rule, app.models.diagnosis_history, app.models.user
from app.core.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext
pwd = CryptContext(schemes=['bcrypt'])
db = SessionLocal()
u = db.query(User).filter(User.username == 'admin').first()
u.hashed_password = pwd.hash('admin123')
db.commit()
print('Password direset ke: admin123')
db.close()
"
```

---

## Struktur Project

```
sistem-pakar/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── (auth)/            # Login & Register
│   │   ├── diagnosis/         # Wizard diagnosis & hasil
│   │   ├── admin/             # Panel admin (CRUD + riwayat)
│   │   └── page.tsx           # Landing page
│   ├── components/
│   ├── lib/                   # api.ts, store.ts, utils.ts
│   └── types/
│
├── backend/                   # FastAPI app
│   ├── app/
│   │   ├── api/v1/            # Endpoint REST
│   │   ├── engine/            # Forward chaining + CF
│   │   ├── models/            # SQLAlchemy ORM
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py
│   └── requirements.txt
│
├── docker-compose.yml         # PostgreSQL + pgAdmin (opsional)
└── README.md
```

---

## Inference Engine

### Nilai CF User
| Jawaban | Nilai |
|---|---|
| Ya | 1.0 |
| Mungkin | 0.6 |
| Tidak Tahu | 0.0 |
| Tidak | -1.0 |

### Formula Certainty Factor
```
CF_combined = CF_pakar × CF_user

# Kombinasi multiple gejala:
Keduanya positif  → CF = CF1 + CF2 × (1 - CF1)
Keduanya negatif  → CF = CF1 + CF2 × (1 + CF1)
Berlawanan tanda  → CF = (CF1 + CF2) / (1 - min(|CF1|, |CF2|))
```

Threshold minimum untuk tampil di hasil: **CF ≥ 0.2**
Maksimal hasil yang ditampilkan: **5 kerusakan teratas**
