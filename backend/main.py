from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from engine import PortfolioEngine

app = FastAPI(title="QuantFolio API")

# Allow React (Frontend) to talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input Validation Model
class PortfolioRequest(BaseModel):
    tickers: List[str]
    weights: List[float]

@app.get("/")
def home():
    return {"message": "QuantFolio System Active"}

@app.post("/analyze")
def analyze_portfolio(request: PortfolioRequest):
    # Validation: Weights must sum to approx 1.0
    if not (0.99 <= sum(request.weights) <= 1.01):
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
    
    if len(request.tickers) != len(request.weights):
        raise HTTPException(status_code=400, detail="Ticker count and Weight count must match")

    try:
        engine = PortfolioEngine(request.tickers, request.weights)
        results = engine.calculate_performance()
        
        if "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
            
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/correlation")
def get_correlation(request: PortfolioRequest):
    try:
        engine = PortfolioEngine(request.tickers, request.weights)
        data = engine.get_correlation_matrix()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))