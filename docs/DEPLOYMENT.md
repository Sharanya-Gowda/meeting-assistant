# Meeting-to-Execution Assistant: Cloud Deployment Manual

This document provides definitive, step-by-step instructions for provisioning, configuring, deploying, and maintaining the production ecosystem of the Meeting-to-Execution Assistant.

---

## 1. Production Architecture Blueprint
The application operates on a decoupled full-stack architecture running across optimized cloud infrastructure tiers:
* **Database Layer:** Serverless PostgreSQL hosted on **Neon** for dynamic storage scaling.
* **Core Logic Layer (Backend):** FastAPI application hosted on **Render (Web Service)** running Python 3.12+ and synchronized with the Google GenAI ecosystem.
* **User Interface Layer (Frontend):** React/Vite web application hosted on **Vercel** with automatic global Edge CDN routing.

---

## 2. Environment Variables Specification

Before deploying, ensure you have gathered the sensitive keys for both system layers.

### A. Backend Environment Variables (Render Container)
| Variable Name | Purpose / Description | Example Production Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Secure pooled connection string for Neon Postgres. | `postgresql://user:pass@ep-cool-node-1234.aws.neon.tech/neondb?sslmode=require` |
| `GEMINI_API_KEY` | Private authentication token for the modern Google GenAI Client. | `AIzaSyD-ExampleKeyHereXyz...` |
| `CORS_ORIGINS` | Comma-separated list of approved frontend domains allowed to bridge cross-origin requests. | `https://meeting-assistant-frontend.vercel.app` |

### B. Frontend Environment Variables (Vercel Platform)
| Variable Name | Purpose / Description | Critical Rule |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint address pointing to the production Render backend app. | **Must NOT** have a trailing slash or include `/api` (e.g., `https://meeting-assistant-backend-3frt.onrender.com`). |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Database Provisioning (Neon Postgres)
1. Log in to your **Neon Console** and initialize a new project named `meeting-assistant`.
2. Select the latest stable PostgreSQL version (v16 or v17) and pick an infrastructure region close to your target users (e.g., AWS Asia Pacific / Mumbai or Frankfurt).
3. Navigate to the **Connection String** component on the Dashboard, select **Parameters: Pooled Connection**, and copy the generated target URI string.

### Step 2: Backend Core API Deployment (Render)
1. Go to your **Render Dashboard**, click **New +**, and select **Web Service**.
2. Connect your repository and select the target workspace branch (e.g., `main`).
3. Apply the following structural parameters under the provisioning panel:
    * **Name:** `meeting-assistant-backend`
    * **Environment:** `Python`
    * **Region:** Select the same cloud region as your Neon database to minimize cross-region network latency.
    * **Build Command:** `pip install -r backend/requirements.txt`
    * **Start Command:** `cd backend && uwsgi --module app.main:app` or `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Expand **Advanced Settings**, click **Add Environment Variable**, and fill in `DATABASE_URL`, `GEMINI_API_KEY`, and `CORS_ORIGINS` as described in Section 2.
5. Click **Deploy Web Service** and monitor the live log stream until you receive the terminal notification: `Application startup complete. Uvicorn running on http://0.0.0.0:10000`.

### Step 3: Frontend Web UI Deployment (Vercel)
1. Open your **Vercel Dashboard**, select **Add New**, and click **Project**.
2. Import your GitHub repository.
3. On the configuration screen, click the **Root Directory** field and select your `frontend` subfolder.
4. Expand the **Environment Variables** tray and inject:
    * `VITE_API_URL` = `https://YOUR-RENDER-APP-DOMAIN.onrender.com`
5. Click **Deploy**. Vercel will bundle your static application assets and issue a live production URL inside of 2 minutes.

---

## 4. Post-Deployment Verification Checklist
To confirm all platform layers are talking to one another properly, run through these immediate link checks:
1.  **Infrastructure Heartbeat Check:** Open your browser and head to `https://<your-backend>.onrender.com/health`. Verify it returns a code of `200 OK` along with the JSON object: `{"status": "healthy", "database": "configuration_loaded", ...}`.
2.  **API Schema Engine Doc Trace:** Navigate to `https://<your-backend>.onrender.com/docs` to ensure your interactive Swagger endpoints load perfectly.
3.  **Cross-Origin Verification:** Open your live frontend interface, click the submit tab, and execute an ingestion operation to verify data saves onto your Neon dashboard without triggering a CORS network blockage.

---

## 5. How to Redeploy Guide
Both Render and Vercel utilize **Git Integration hooks** to execute automatic continuous deployment workflows. 

To push hot-fixes or routine updates live to production:
1. Stage and test modifications locally inside your development workspace.
2. Commit your updates to your local tracking system.
3. Push the new code upstream to GitHub:
    ```bash
    git push origin main
    ```
4. Render and Vercel will notice the new commit on the `main` branch, automatically download the delta adjustments, trigger fresh project builds, and switch container references with **zero-downtime**.

---

## 6. Common Issues and Solutions

### Issue 1: Server Lookup Returns 404 Not Found on Data Endpoints
* **Symptom:** Ingestion, search, or deletion routes fail to return matching objects, and terminal logging throws a double-prefix trace (`GET /api/api/meetings... 404`).
* **Root Cause:** The frontend environment config `VITE_API_URL` was incorrectly configured with an extra trailing slash or explicit `/api` string addition.
* **Solution:** Go to your Vercel Project Dashboard -> Settings -> Environment Variables. Modify `VITE_API_URL` to include *only* the clean primary domain prefix string (e.g., `https://meeting-assistant-backend-3frt.onrender.com`). Trigger a rebuild in Vercel.

### Issue 2: Long Processing Delay on Initial Request (Cold Starts)
* **Symptom:** Loading screens spin for up to a minute when loading the app after an extended break.
* **Root Cause:** Render’s free tier web services spin down deployment containers automatically following 15 minutes of user inactivity.
* **Solution:** This is expected hobby-tier behavior. The container wakes up immediately upon receiving the initial network fetch request. For critical industrial settings, upgrade the Render instance plan to "Starter" to disable cold sleeps.

### Issue 3: Ingestion Fails with Code 502 Bad Gateway
* **Symptom:** Submitting texts or document files instantly prints an execution core failure error.
* **Root Cause:** The `GEMINI_API_KEY` token was entered with typo errors or was omitted from Render's environment panel configuration settings.
* **Solution:** Open your Render dashboard, navigate to the Environment menu tab, confirm that the `GEMINI_API_KEY` key precisely matches your active Google AI Studio token, save your changes, and hit "Clear Cache & Redeploy".