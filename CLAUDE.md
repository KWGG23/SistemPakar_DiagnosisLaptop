# Sistem Pakar Diagnosis Kerusakan Laptop/PC

## Project Overview

Aplikasi web sistem pakar berbasis **Forward Chaining + Certainty Factor (CF)** untuk mendiagnosis kerusakan laptop/PC. User menjawab pertanyaan gejala secara bertahap, dan sistem menyimpulkan kemungkinan kerusakan beserta solusinya.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form**: React Hook Form + Zod

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Inference Engine**: Custom Forward Chaining + Certainty Factor
- **Database ORM**: SQLAlchemy + Alembic (migrations)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Validation**: Pydantic v2
- **Testing**: Pytest

### Tooling
- **Package Manager (Frontend)**: pnpm
- **Package Manager (Backend)**: uv (or pip + venv)
- **Linter/Formatter (Frontend)**: ESLint + Prettier
- **Linter/Formatter (Backend)**: Ruff + Black
- **API Docs**: Auto-generated via FastAPI at `/docs`

---

## Project Structure

```
sistem-pakar/
├── frontend/                        # Next.js app
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── diagnosis/
│   │   │   ├── page.tsx             # Halaman utama diagnosis (wizard)
│   │   │   └── result/page.tsx      # Halaman hasil diagnosis
│   │   ├── admin/
│   │   │   ├── gejala/page.tsx      # CRUD gejala
│   │   │   ├── kerusakan/page.tsx   # CRUD kerusakan
│   │   │   ├── rules/page.tsx       # CRUD rules/CF
│   │   │   └── history/page.tsx     # Riwayat diagnosis
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── diagnosis/
│   │   │   ├── QuestionWizard.tsx
│   │   │   ├── DiagnosisResult.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── admin/
│   ├── lib/
│   │   ├── api.ts                   # Axios instance + API calls
│   │   ├── store.ts                 # Zustand stores
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                         # FastAPI app
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── diagnosis.py     # POST /diagnose
│   │   │   │   ├── gejala.py        # CRUD gejala
│   │   │   │   ├── kerusakan.py     # CRUD kerusakan
│   │   │   │   ├── rules.py         # CRUD rules
│   │   │   │   └── history.py       # Riwayat diagnosis
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py            # Settings via pydantic-settings
│   │   │   ├── database.py          # SQLAlchemy engine & session
│   │   │   └── security.py          # JWT auth helpers
│   │   ├── engine/
│   │   │   ├── forward_chain.py     # Forward chaining logic
│   │   │   └── certainty_factor.py  # CF calculation
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── gejala.py
│   │   │   ├── kerusakan.py
│   │   │   ├── rule.py
│   │   │   └── diagnosis_history.py
│   │   ├── schemas/                 # Pydantic schemas
│   │   │   ├── gejala.py
│   │   │   ├── kerusakan.py
│   │   │   ├── rule.py
│   │   │   └── diagnosis.py
│   │   ├── services/
│   │   │   └── diagnosis_service.py
│   │   └── main.py                  # FastAPI app entrypoint
│   ├── migrations/                  # Alembic migrations
│   ├── tests/
│   ├── pyproject.toml
│   └── .env.example
│
├── CLAUDE.md
└── docker-compose.yml               # PostgreSQL + pgAdmin (dev)
```

---

## Database Schema

### Tabel `gejala`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| kode | VARCHAR | e.g., "G001" |
| pertanyaan | TEXT | Pertanyaan yang ditampilkan ke user |
| kategori | VARCHAR | power, display, audio, storage, dll |

### Tabel `kerusakan`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| kode | VARCHAR | e.g., "K001" |
| nama | VARCHAR | Nama kerusakan |
| deskripsi | TEXT | Penjelasan detail kerusakan |
| solusi | TEXT | Langkah perbaikan |

### Tabel `rule`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| gejala_id | UUID | FK → gejala |
| kerusakan_id | UUID | FK → kerusakan |
| cf_pakar | FLOAT | Nilai CF dari pakar (0.0 – 1.0) |

### Tabel `diagnosis_history`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| session_id | VARCHAR | ID sesi user |
| gejala_dipilih | JSON | Array gejala yang dipilih |
| hasil | JSON | Array hasil diagnosis dengan CF |
| created_at | TIMESTAMP | Waktu diagnosis |

---

## Inference Engine

### Certainty Factor Formula

```
# Nilai CF user: 1.0 (ya), 0.6 (mungkin), 0.0 (tidak tahu), -1.0 (tidak)

CF_combined = CF_pakar × CF_user

# Kombinasi multiple gejala untuk satu kerusakan:
CF_total = CF1 + CF2 × (1 - CF1)   # keduanya positif
CF_total = CF1 + CF2 × (1 + CF1)   # keduanya negatif
CF_total = (CF1 + CF2) / (1 - min(|CF1|, |CF2|))  # berlawanan
```

### Forward Chaining Flow
1. User memilih gejala yang dialami
2. Engine mengambil semua rule yang cocok dengan gejala yang dipilih
3. Hitung CF gabungan per kerusakan
4. Filter kerusakan dengan CF ≥ 0.2 (threshold minimum)
5. Urutkan hasil berdasarkan CF tertinggi
6. Kembalikan top-N hasil beserta solusi

---

## API Endpoints

```
POST /api/v1/diagnose              # Submit gejala, terima hasil diagnosis
GET  /api/v1/gejala                # List semua gejala (dengan filter kategori)
GET  /api/v1/kerusakan             # List semua kerusakan
GET  /api/v1/history               # Riwayat diagnosis (admin)

# Admin CRUD (protected)
POST   /api/v1/gejala
PUT    /api/v1/gejala/{id}
DELETE /api/v1/gejala/{id}

POST   /api/v1/kerusakan
PUT    /api/v1/kerusakan/{id}
DELETE /api/v1/kerusakan/{id}

POST   /api/v1/rules
PUT    /api/v1/rules/{id}
DELETE /api/v1/rules/{id}
```

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/sistem_pakar
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=development
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Development Setup

### 1. Clone & Setup Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
alembic upgrade head             # Jalankan migrations
python -m app.seed               # Seed knowledge base awal
uvicorn app.main:app --reload --port 8000
```

### 2. Setup Frontend
```bash
cd frontend
pnpm install
pnpm dev                         # Jalan di http://localhost:3000
```

### 3. Database (Docker)
```bash
docker-compose up -d             # Jalankan PostgreSQL + pgAdmin
```

---

## Coding Conventions

### TypeScript / Next.js
- Gunakan App Router (bukan Pages Router)
- Semua komponen UI pakai `shadcn/ui` terlebih dahulu sebelum buat custom
- API calls hanya di dalam `lib/api.ts`, tidak inline di komponen
- Tipe data shared didefinisikan di `types/index.ts`
- Gunakan `"use client"` hanya bila perlu (interaktivitas, hooks)
- Nama file komponen: PascalCase (`DiagnosisResult.tsx`)
- Nama file utils/lib: camelCase (`api.ts`, `store.ts`)

### Python / FastAPI
- Semua endpoint menggunakan async/await
- Schema Pydantic terpisah dari ORM model
- Dependency injection via `Depends()` untuk DB session dan auth
- Response selalu menggunakan schema Pydantic, bukan raw dict
- Error menggunakan `HTTPException` dengan status code yang tepat
- Nama file: snake_case (`forward_chain.py`)

---

## Key Domain Terms (Gunakan Konsisten)

| Term | Meaning |
|---|---|
| `gejala` | Symptom yang dipilih user saat diagnosis |
| `kerusakan` | Jenis kerusakan/penyakit yang didiagnosis |
| `rule` | Relasi gejala ↔ kerusakan beserta nilai CF pakar |
| `cf_pakar` | Certainty Factor dari pakar (0.0–1.0) |
| `cf_user` | Certainty Factor dari jawaban user |
| `cf_combined` | Hasil perkalian cf_pakar × cf_user |
| `diagnosis` | Proses inferensi + hasil akhirnya |
| `solusi` | Rekomendasi perbaikan untuk kerusakan tertentu |

---

## Kategori Kerusakan

1. **Power** — laptop tidak menyala, mati mendadak, tidak ada daya
2. **Display** — layar blank, flicker, retak, backlight mati
3. **Overheating** — panas berlebihan, kipas berisik, throttling
4. **Storage** — tidak bisa booting, bad sector, SSD/HDD tidak terdeteksi
5. **Keyboard/Touchpad** — tombol tidak respon, pointer melompat
6. **Audio** — tidak ada suara, speaker pecah, mic tidak terdeteksi
7. **Konektivitas** — WiFi, Bluetooth, LAN tidak berfungsi
8. **Baterai** — tidak mengisi, drop cepat, tidak terdeteksi
9. **RAM** — BSOD, sering crash, POST gagal

---

## Testing

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
pnpm test
pnpm type-check
```

---

## Known Constraints

- CF threshold minimum untuk tampil di hasil: **0.2**
- Maksimal gejala yang bisa dipilih per sesi: **20**
- Tampilkan maksimal **5 hasil diagnosis** teratas ke user
- Knowledge base awal mencakup minimal **9 kategori** kerusakan
