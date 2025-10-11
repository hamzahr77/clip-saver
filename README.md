# Clip Saver

A lightweight notes & bookmark manager for quick captures. Built with a Flask + SQLAlchemy backend and a React (Vite) frontend. Includes JSON/CSV export and server-side PDF export.

## Features

* Create, update, delete notes & bookmarks
* Tag-based organization and search
* Export: JSON, CSV, PDF
* Minimal, responsive UI for fast capture

## Tech

* Backend: Python, Flask, SQLAlchemy, SQLite (dev)
* Frontend: React (Vite)
* PDF export: WeasyPrint (or pdfkit + wkhtmltopdf fallback)

---

## Quick start (Windows — PowerShell)

**Backend**

```powershell
cd backend
.venv\Scripts\Activate.ps1          # activate virtualenv (create if needed)
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

**Frontend**

```powershell
cd ../frontend
npm install
npm run dev
# Open the Vite dev URL (e.g. http://localhost:5173)
```

---

## Quick start (macOS / Linux)

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

**Frontend**

```bash
cd ../frontend
npm install
npm run dev
```

---

## Environment

Do not commit `.env`. Example backend `.env`:

```
DATABASE_URL=sqlite:///quickclip.db
FLASK_APP=app.py
FLASK_ENV=development
```

Frontend `.env` (Vite):

```
VITE_API=http://localhost:5000/api
```

---

## Seed data

Use the provided `clips.json` and the PowerShell or curl scripts to seed demo data, or run a `seed.py` if present.

---

## PDF export

* Server-side: `GET /api/export/pdf` (WeasyPrint or pdfkit + wkhtmltopdf)
* Client-side: Export controls in the UI for JSON / CSV / PDF

If using WeasyPrint on Windows, follow WeasyPrint install docs for native dependencies. For an easier Windows setup use wkhtmltopdf + pdfkit.

---

## Tests

Add tests with `pytest` in `backend/` and use React Testing Library for frontend tests.

---

## Production notes

* Do not run Flask with `debug=True` in production.
* Updated for Render deployment fix.
* Use a WSGI server (gunicorn on Linux or waitress on Windows).
* Use Postgres or another production-ready DB and set `DATABASE_URL` accordingly.

---

