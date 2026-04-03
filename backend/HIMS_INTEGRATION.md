# HIMS Integration Guide

This document explains how to configure and test HIMS integrations (e.g., Doctor 24/7) safely.

Required environment variables (set these in Vercel as encrypted secrets for production):

- `ENCRYPTION_KEY` — 32-byte Fernet key (required). Generate with Python: `Fernet.generate_key().decode()`.
- `DATABASE_URL` — SQLAlchemy-compatible database URL used by the backend.
- Optional test variables (local only): `HIMS_TEST_URL`, `HIMS_TEST_USERNAME`, `HIMS_TEST_PASSWORD`, `HIMS_TEST_API_KEY` for REST testing; `HIMS_TEST_HOST`, `HIMS_TEST_DB_USERNAME`, `HIMS_TEST_DB_PASSWORD`, `HIMS_TEST_DB_NAME` for DB testing.

How to test locally before saving secrets to production:

1. Create a virtual environment and install backend requirements:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Run the HIMS test runner (set env vars first):

REST example:
```bash
export HIMS_TEST_MODE=rest
export HIMS_TEST_URL=https://staging-doctor247.example.com
export HIMS_TEST_USERNAME=you@example.com
export HIMS_TEST_PASSWORD=yourpassword
python backend/hims/test_runner.py
```

DB example:
```bash
export HIMS_TEST_MODE=db
export HIMS_TEST_HOST=10.0.0.5
export HIMS_TEST_DB_USERNAME=dbuser
export HIMS_TEST_DB_PASSWORD=dbpass
export HIMS_TEST_DB_NAME=doctor247
python backend/hims/test_runner.py
```

3. If tests succeed, use the app `POST /hims/connect` endpoint or the UI to connect the hospital. The backend will encrypt credentials and store them in the database.

Production (Vercel) setup summary:

1. Add `ENCRYPTION_KEY` to Vercel environment variables (use the Vercel Dashboard or `vercel env add`).
2. Add `DATABASE_URL` to Vercel environment variables.
3. For long-lived API keys you may add them as project-level encrypted vars or prefer using the app UI to connect and store per-hospital credentials.
4. After deployment, use the UI: login → Connect HIMS → provide credentials via the secure form.

Security notes:

- The backend encrypts any stored HIMS credentials using `ENCRYPTION_KEY`.
- The `GET /hims/connection-details/{hospital_id}` endpoint does NOT return secrets or tokens.
- Remove any test tokens from environment after verification.
