# QuantFolio: AI-Powered Portfolio Risk Engine 🚀

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Material%20UI-blue)
![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Pandas%20%7C%20NumPy-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 📋 Overview
QuantFolio is a quantitative financial analysis engine designed to help investors optimize their portfolios. Unlike simple stock trackers, this system uses **Modern Portfolio Theory (MPT)** and statistical analysis to calculate risk-adjusted returns (Sharpe Ratio), volatility, and asset correlations in real-time.

It features a high-performance **FastAPI** backend for mathematical modeling and a responsive **React** dashboard with a "Glassmorphism" dark UI for data visualization.

## ✨ Key Features
* **Mathematical Engine:** Vectorized calculation of Covariance Matrix, Standard Deviation, and Annualized Returns using `NumPy` & `Pandas`.
* **Risk Analysis:** Real-time computation of **Sharpe Ratio** to evaluate risk-vs-reward efficiency.
* **Correlation Heatmap:** Interactive matrix visualizing asset dependency (Pearson correlation) to aid in diversification.
* **Growth Projection:** Time-series forecasting simulating "Growth of $10k" based on historical performance.
* **Senior-Level UI:** Professional Dark Mode dashboard using `Material UI` and `Recharts` with responsive grid layouts.

## 🛠 Tech Stack
### **Backend (The Brain)**
* **Language:** Python 3.9+
* **Framework:** FastAPI (Async/Await architecture)
* **Data Science:** NumPy (Matrix Math), Pandas (Time-series), Scikit-learn
* **Data Source:** Yahoo Finance API (`yfinance`)

### **Frontend (The Face)**
* **Library:** React.js (Hooks & Context API)
* **UI Framework:** Material UI (MUI v5)
* **Visualization:** Recharts (D3-based charting)
* **State Management:** Axios for API consumption

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/quantfolio.git](https://github.com/yourusername/quantfolio.git)
cd quantfolio