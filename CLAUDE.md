# Remember US v3.0 — Development Rules

## Project Overview
Premium closed digital memorial. Light cream aesthetic, Apple-style design.
No public access. QR-only entry. Read-only for guests.

## Structure
- `frontend/` — Next.js (landing + app)
- `backend/` — Django + DRF + PostgreSQL
- `infra/` — Docker, AWS configs

## Commands

### Frontend
```bash
cd frontend && npm run dev       # dev server (port 3000)
cd frontend && npm run build     # production build
cd frontend && npm run lint      # ESLint
cd frontend && npm test          # Jest tests
```

### Backend
```bash
cd backend && python manage.py runserver    # dev server (port 8000)
cd backend && python manage.py migrate      # apply migrations
cd backend && python manage.py makemigrations  # create migrations
cd backend && pytest                        # run all tests
cd backend && ruff check .                  # lint
```

## Core Rules (ALWAYS follow)
- Light cream theme only — one theme across all pages, no dark mode, no mixed themes
- No public indexing — noindex on all pages except landing
- No social features — no comments, likes, reactions
- Admin approval required before any page goes live

## API Response Format
```json
{ "success": true, "data": {} }
{ "success": false, "error": "message", "code": "ERROR_CODE" }
```

## Git
- Branches: `feature/name` or `fix/name`
- Commits: `[scope] action: description`
  - e.g. `[frontend] feat: hero section animation`
  - e.g. `[backend] fix: qr hash collision`
- Run tests before push

## See Also
- @.claude/rules/frontend.md — Next.js/Tailwind/GSAP rules
- @.claude/rules/backend.md — Django/DRF rules
- @.claude/rules/design.md — design system & aesthetics
