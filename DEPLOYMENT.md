# 🚀 Insovant.ai Production Deployment Guide

This guide provides clear, step-by-step instructions to deploy the **Insovant.ai** full-stack application (Next.js 16 Frontend + Python FastAPI Backend).

---

## 🎯 Recommended Architecture (Easiest & Free Tier Available)

- **Frontend:** [Vercel](https://vercel.com) (Next.js native host)
- **Backend:** [Render](https://render.com) or [Railway](https://railway.app) (Python FastAPI Web Service)

---

## Option 1: Deploy Backend on Render + Frontend on Vercel

### Step 1: Deploy the Python Backend on Render
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Set the following configuration:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `ALLOWED_ORIGINS`: `*` (or your frontend Vercel URL once generated)
   - `GOOGLE_API_KEY`: *(Optional - for Gemini AI model in Q&A)*
7. Click **Create Web Service**.
8. Copy your live backend URL (e.g. `https://insovant-backend.onrender.com`).

---

### Step 2: Deploy the Next.js Frontend on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Select the `frontend` directory as the **Root Directory**.
5. In **Environment Variables**, add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://insovant-backend.onrender.com` (your Render backend URL from Step 1)
6. Click **Deploy**.
7. Vercel will build and launch your application at a domain like `https://insovant.vercel.app`.

---

## Option 2: Full-Stack Deployment with Docker Compose (VPS / AWS EC2 / DigitalOcean)

If you are hosting on a Linux server (Ubuntu/Debian) with Docker installed:

1. Clone your repo onto the server:
   ```bash
   git clone https://github.com/your-username/razor_agent.git
   cd razor_agent
   ```
2. Run Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
3. Your app will be live at:
   - **Frontend:** `http://<your-server-ip>:3000`
   - **Backend API:** `http://<your-server-ip>:8000`

---

## Option 3: Deploy Backend on Railway

1. Install Railway CLI or connect via [Railway.app](https://railway.app).
2. Create a new service from GitHub repo pointing to the `/backend` folder.
3. Railway automatically detects `requirements.txt` and `Procfile`.
4. Generate a public domain in Railway settings and update `NEXT_PUBLIC_API_URL` in Vercel.

---

## 🛠️ Verification & Health Check

After deploying both services:
1. Open your backend root URL in browser: `https://your-backend-url/`
   - Should return: `{"status": "ok", "service": "Insovant.ai Finance Controller Agent API", "docs_url": "/docs"}`
2. Open Swagger API documentation: `https://your-backend-url/docs`
3. Test your live Frontend UI to ensure file uploads, reconciliation, Q&A, tax matching, and cash forecasting trigger smoothly!
