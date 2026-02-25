# Model handling (recommended)

This folder contains helpers and a small scaffold for serving the Python pickle model outside the Node backend.

Recommended production setup

1. Upload `food_status_model.pkl` to object storage (S3, GCS, Aiven file storage) or a GitHub Release.
2. Set environment variable `MODEL_URL` to the public (or signed) URL of the model in Render and any CI.
3. On startup, the Node backend can download the model using `backend/ml/download_model.js` which will save it to `backend/ml/food_status_model.pkl`.
4. Serve model inference via a small Python FastAPI service (see `model_service.py`) that loads the pickle and exposes a `/predict` endpoint. Run it separately (Render can host it as a web service) and call it from the Node backend.

Why not commit the `.pkl` into git?

- Binary files bloat the repo and slow cloning.
- Supply-chain risk: a malicious or modified pickle could change behavior.
- Better to manage model versions in object storage and reference by URL or versioned release.

Quick commands (example):

```bash
# download model at deploy time (Render start command can run this)
node backend/ml/download_model.js

# run Python model service locally (see requirements.txt)
pip install -r backend/ml/requirements.txt
uvicorn backend.ml.model_service:app --host 0.0.0.0 --port 9000
```
