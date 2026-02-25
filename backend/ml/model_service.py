from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os

MODEL_PATH = os.environ.get('MODEL_LOCAL_PATH', 'backend/ml/food_status_model.pkl')

app = FastAPI(title='ShareAMeal Model Service')


class PredictRequest(BaseModel):
    features: list


@app.on_event('startup')
def load_model():
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f'Model file not found at {MODEL_PATH}')
    with open(MODEL_PATH, 'rb') as f:
        app.state.model = pickle.load(f)


@app.post('/predict')
def predict(req: PredictRequest):
    model = app.state.model
    try:
        preds = model.predict([req.features])
        return {'predictions': preds.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
