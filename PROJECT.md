# Spry — Project Structure

## Repository Layout

```
spry/
├── backend/            # FastAPI application
├── frontend/           # React + Vite application
├── docker-compose.yml  # Local development orchestration
└── PROJECT.md          # Project specification document
```

---

## backend/

Python 3.12 service that exposes a REST API over HTTP.

### Tech Stack
* **Runtime:** `python:3.12-slim`
* **Framework:** FastAPI `0.111.0`
* **ORM:** SQLAlchemy `2.0.30`
* **Migrations:** Alembic `1.13.1`
* **Server:** Uvicorn `0.29.0`
* **DB Driver:** psycopg2-binary `2.9.9`

### Directory Structure
```
backend/
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── alembic/
│   └── versions/         # One migration file per schema change
└── app/
    ├── main.py           # FastAPI app entry point, mounts routers
    ├── database.py       # SQLAlchemy engine + session factory
    ├── models.py         # ORM table definitions
    ├── schemas.py        # Pydantic request/response models
    └── routers/
        └── meetings.py   # GET /api/meetings, POST /api/meetings
```

### API Contract

#### 1. Fetch Meetings
* **Endpoint:** `GET /api/meetings`
* **Response Status:** `200 OK`
* **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Weekly sync",
    "starts_at": "2026-10-01T10:00:00Z",
    "ends_at": "2026-10-01T10:30:00Z",
    "attendee_count": 5
  }
]
```
* **Notes:** All timestamps in ISO 8601 UTC. Returns an empty list `[]` if no meetings exist.

#### 2. Create Meeting
* **Endpoint:** `POST /api/meetings`
* **Request Body:**
```json
{
  "title": "Weekly sync",
  "starts_at": "2026-10-01T10:00:00Z",
  "ends_at": "2026-10-01T10:30:00Z",
  "attendee_count": 5
}
```
* **Response Status:** `201 Created` with the created object including `id`.

### Configuration
* **Port:** `8000`
* **Migrations:** Alembic runs at container startup (`alembic upgrade head`), before Uvicorn starts.

---

## frontend/

Static single-page application.

### Tech Stack
* **Runtime:** `node:20-slim` (build stage only)
* **Framework:** React `18.3.1` + Vite `5.3.1`
* **Styling:** Tailwind CSS `3.4.4`
* **Components:** shadcn/ui (installed via CLI at init, no version pinning)

### Directory Structure
```
frontend/
├── Dockerfile
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
└── src/
    ├── main.tsx          # React entry point
    ├── App.tsx           # Root component, renders MeetingList
    └── components/
        ├── MeetingList.tsx   # Fetches GET /api/meetings, renders cards
        └── MeetingForm.tsx   # Form → POST /api/meetings → refreshes list
```

### Configuration
* **Port:** `5173` (Vite dev server in local development)
* **API Calls:** Frontend calls the backend at `VITE_API_URL` (env var). In local dev: `http://localhost:8000`.

---

## docker-compose.yml

Orchestrates local development for all three services. Run with: `docker compose up --build`.

### Service Matrix

| Service | Image / Build | Port | Depends On |
| :--- | :--- | :--- | :--- |
| `postgres` | `postgres:16` | `5432` | — |
| `backend` | build `./backend` | `8000` | `postgres` (healthy) |
| `frontend` | build `./frontend` | `5173` | `backend` |

### Startup Order
1. `postgres` starts and exposes port `5432`.
2. A `healthcheck` pings `pg_isready` every 5 seconds (up to 30 seconds). Until it passes, the service status is `unhealthy`.
3. `backend` uses `depends_on: postgres: condition: service_healthy` — it will not start until Postgres answers.
4. `backend` entrypoint runs `alembic upgrade head`, then `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
5. `frontend` starts after `backend` (soft dependency — Vite starts regardless, but the API must be reachable for data to load).

### Environment Variables

**Backend:**
```env
DATABASE_URL=postgresql://spry:spry@postgres:5432/spry
```

**Frontend:**
```env
VITE_API_URL=http://localhost:8000
```

---

## What is NOT in this Repository

* No Redis, no Celery, no message queue
* No Nginx reverse proxy
* No Kubernetes manifests
* No second database
* No authentication (added in a later lab)

