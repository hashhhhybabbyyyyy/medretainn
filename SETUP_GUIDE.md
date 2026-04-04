# Complete MedRetain CRM Setup & Deployment Guide

## Quick Start (Local Development)

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend (Port 8000)
```bash
# From repository root
./start_backend.sh

# Or manually:
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend (Port 3000)
```bash
cd frontend
npm install  # First time only
npm run dev
```

### 4. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 5. Default Credentials
- **Username**: `admin`
- **Password**: `medretain@admin123`

---

## Production Deployment (Vercel + Render)

### Frontend Deployment (Vercel)
✅ Already deployed at: https://medretainn.vercel.app

### Backend Deployment (Render)

#### Option A: Auto-Deploy via render.yaml (Recommended)
1. Go to https://render.com/dashboard
2. Click **"New +" → "Web Service"**
3. Select **"Deploy existing repository"**
4. Connect your GitHub repo: `hashhhhybabbyyyyy/medretainn`
5. Render will automatically detect `render.yaml`
6. Set environment variables if needed:
   - `JWT_SECRET_KEY`: Generate a secure random key
   - `ENCRYPTION_KEY`: Generate a 32-byte key
7. Click **"Deploy"**
8. Wait for build to complete (~5 minutes)
9. Copy the deployment URL and update frontend `.env.production`

#### Option B: Manual Render Setup
If render.yaml doesn't auto-detect:
1. Create new Web Service manually
2. Set to Python environment
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from render.yaml
6. Deploy

### Environment Variables for Production

**Backend (Render):**
```
DATABASE_URL=sqlite:///./medretain.db
JWT_SECRET_KEY=<generate-secure-key>
JWT_EXPIRE_MINUTES=480
ENCRYPTION_KEY=<32-byte-key>
ENVIRONMENT=production
```

**Frontend (Vercel):**
```
VITE_API_URL=https://medretain-crm-backend.onrender.com
VITE_MESSAGING_API_URL=https://medretain-messaging-backend.onrender.com
```

---

## Troubleshooting

### Frontend shows login but can't authenticate
**Solution**: Backend is not running or API URL is incorrect
- Check `frontend/.env.production`
- Verify backend is deployed and responding: `curl https://medretain-crm-backend.onrender.com/health`

### Backend deployment fails
**Reasons**:
- Missing Python packages in requirements.txt
- Incorrect import paths
- Database initialization error

**Solution**:
1. Check Render build logs
2. Run locally first: `./start_backend.sh`
3. Fix any errors, commit, and redeploy

### "Default admin user created" message in logs
This is normal. Backend auto-creates the default admin user on first run.

---

## Full Architecture

```
┌─────────────────────────────────────────┐
│     User Browser                        │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────┐  ┌──────▼─────────────┐
│  Vercel Frontend │  │ (Optional) GitHub  │
│ medretainn.vercel│  │ OAuth Sign-in      │
│      .app        │  │                    │
└───┬──────────────┘  └────────────────────┘
    │
    │ VITE_API_URL
    │ (https://medretain-crm-backend.onrender.com)
    │
┌───▼──────────────────────────┐
│  Render Backend (Python/FastAPI)
│  - JWT Auth                  │
│  - Patient Data Management   │
│  - HIMS Integration          │
│  - ML Churn Prediction       │
└──────────────────────────────┘
    │
    └──► SQLite Database (local)
```

---

## Next Steps

1. ✅ Push all changes to GitHub
2. ✅ Verify frontend works at https://medretainn.vercel.app/login
3. ⏳ Deploy backend to Render (auto or manual)
4. ⏳ Test login flow end-to-end
5. ⏳ Connect HIMS after successful login

For support, check the build logs:
- **Vercel**: https://vercel.com/dashboard → Deployments
- **Render**: https://render.com/dashboard → Services → medretain-crm-backend
