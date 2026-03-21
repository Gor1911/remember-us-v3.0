# Remember US v3.0

Premium closed digital memorial platform. Dark aesthetic, Apple-style design.
Access is QR-only — no public indexing, no social features.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Animation | GSAP 3, Framer Motion, Three.js (3D awards) |
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL (dev: SQLite) |
| Cache / Queue | Redis, Celery |
| Storage | AWS S3 (media files) |
| Auth | JWT (SimpleJWT) |
| AI | LivePortrait API (animated portrait) |

---

## Project Structure

```
remember-us-v3.0/
├── frontend/               # Next.js app
│   ├── app/                # Pages (App Router)
│   │   ├── [hash]/         # Memorial page (QR entry point)
│   │   ├── dashboard/      # Owner dashboard
│   │   └── memorial/new/   # Create memorial
│   └── components/
│       ├── landing/        # Public landing page
│       └── memorial/       # Memorial page blocks
└── backend/                # Django project
    ├── apps/
    │   ├── pages/          # Memorial pages, state machine, timeline, awards
    │   ├── users/          # Custom user model (OWNER / ADMIN roles)
    │   ├── media/          # Photo/video uploads
    │   ├── qr/             # QR code generation
    │   └── api/            # DRF serializers, views, routing
    └── config/             # Django settings (base / dev / prod)
```

---

## Memorial Page Lifecycle

```
DRAFT  →  MODERATION  →  ACTIVE
  ↑             |
  └─── reject ──┘

- Owner edits an ACTIVE page → automatically returns to MODERATION
- Admin approval required before any page goes live
```

Page types: `civilian` | `military`
Military pages include rank, branch, service dates, and 3D medal rendering.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL (or use SQLite for dev)
- Redis

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                         # http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # fill in secrets
python manage.py migrate
python manage.py runserver          # http://localhost:8000
```

`.env` key variables:
```
SECRET_KEY=...
DATABASE_URL=postgres://user:pass@localhost:5432/remember_us
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=remember-us-media
LIVEPORTRAIT_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

---

## Development Commands

```bash
# Frontend
npm run dev       # dev server
npm run build     # production build
npm run lint      # ESLint

# Backend
python manage.py runserver
python manage.py migrate
pytest                    # all tests
pytest --cov              # with coverage
ruff check .              # lint
```

---

## API

All responses follow a unified format:

```json
{ "success": true, "data": {} }
{ "success": false, "error": "message", "code": "ERROR_CODE" }
```

Base URL: `/api/v1/`

---

## Git Conventions

Branches: `feature/name` or `fix/name`

Commit format:
```
[scope] action: description

[frontend] feat: hero section scroll animation
[backend] fix: qr hash collision on create
[backend] test: state machine transitions
```

---

## Design Rules

- Dark mode only — no light theme
- No public indexing — `noindex` on all pages except landing
- No social features — no comments, likes, reactions
- Admin approval required before any page goes live
