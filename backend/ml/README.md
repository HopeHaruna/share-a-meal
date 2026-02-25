# Model handling (recommended)

This folder contains helpers and a small scaffold for serving the Python pickle model outside the Node backend.

## Recommended production workflow

1. **Contributor uploads model** → commits `backend/ml/food_status_model.pkl` to PR
2. **GitHub Actions (`deploy-model.yml`) automatically:**
   - Detects the `.pkl` file
   - Creates a versioned GitHub Release with the model
   - Computes SHA256 checksum
   - Updates Render environment variable `MODEL_URL` to the Release URL
   - Triggers a Render redeploy
3. **On Render startup:**
   - Node backend runs `node backend/ml/download_model.js` to fetch the model from `MODEL_URL`
   - Python FastAPI service (`model_service.py`) loads the pickle and exposes `/predict`
4. **App serves predictions** via the FastAPI model service

## Why not commit `.pkl` into git?

- Binary files bloat the repo and slow cloning.
- Supply-chain risk: a malicious or modified pickle could change behavior.
- Better to manage model versions in object storage and reference by URL.
- This workflow ensures auditable, reversible deployments and keeps repo clean.

## Setup: GitHub Actions + Render API

To enable automatic model deployments, add these GitHub repository secrets:

1. Go to **GitHub** → repo → Settings → Secrets and variables → Actions
2. Add:
   - `RENDER_API_KEY` — your Render API key (from account settings)
   - `RENDER_SERVICE_ID` — ID of your backend service (from Render dashboard)

**How to get these:**

- **RENDER_API_KEY:** Render → Account Settings → API Tokens → Create token
- **RENDER_SERVICE_ID:** Render → Your backend service → Settings → Service ID (looks like `srv-xxxxxxxx`)

Once set, anytime a `.pkl` is pushed to `main`, the workflow will:

1. Upload to a GitHub Release (versioned, free storage)
2. Update `MODEL_URL` in Render
3. Redeploy the backend so it fetches the new model

## Local commands

```bash
# Download model at deploy time
node backend/ml/download_model.js

# Run Python model service locally
pip install -r backend/ml/requirements.txt
uvicorn backend.ml.model_service:app --host 0.0.0.0 --port 9000

# Test prediction (from another terminal)
curl -X POST http://localhost:9000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [1.0, 2.0, 3.0]}'
```

## Production wiring (Render)

On your Render backend service:

1. **Environment variables:**
   - `NODE_ENV=production`
   - `MODEL_URL=https://github.com/.../releases/download/.../food_status_model.pkl` (set by CI)
   - `MODEL_LOCAL_PATH=./backend/ml/food_status_model.pkl` (optional)

2. **Start command:**

   ```
   node backend/ml/download_model.js && cd backend && npm start
   ```

   This downloads the model before starting the Node backend.

3. **Optional: Run FastAPI model service as separate Render service**
   - Create another Render Web Service pointing to this repo
   - Build: `pip install -r backend/ml/requirements.txt`
   - Start: `uvicorn backend.ml.model_service:app --host 0.0.0.0 --port $PORT`
   - Call it from Node via HTTP

## Troubleshooting

- **GitHub Actions fails to update Render:** Check that `RENDER_API_KEY` and `RENDER_SERVICE_ID` are set correctly and have permissions.
- **Model not found at startup:** Ensure `MODEL_URL` is set in Render environment and is publicly accessible.
- **FastAPI won't start:** Verify `requirements.txt` has all dependencies and Python 3.8+ is available.
