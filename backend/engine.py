import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression # <--- THE AI COMPONENT

class PortfolioEngine:
    def __init__(self, tickers, weights):
        self.tickers = tickers
        self.weights = np.array(weights)
        self.start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        self.data = None

    def fetch_data(self):
        try:
            print(f"Downloading data for: {self.tickers}...")
            raw_data = yf.download(self.tickers, start=self.start_date, progress=False)

            if raw_data.empty:
                return False

            # Handle different yfinance return structures
            if 'Adj Close' in raw_data.columns:
                stock_data = raw_data['Adj Close']
            elif 'Close' in raw_data.columns:
                stock_data = raw_data['Close']
            else:
                return False
                
            if isinstance(stock_data, pd.Series):
                stock_data = stock_data.to_frame()
                
            self.data = stock_data
            return True

        except Exception as e:
            print(f"Error fetching data: {e}")
            return False

    def get_correlation_matrix(self):
        if self.data is None:
            self.fetch_data()
        
        returns = self.data.pct_change().dropna()
        corr_matrix = returns.corr()
        
        return {
            "labels": corr_matrix.columns.tolist(),
            "matrix": corr_matrix.values.tolist()
        }

    def calculate_performance(self):
        if self.data is None:
            success = self.fetch_data()
            if not success:
                return {"error": "Could not fetch stock data."}

        # 1. Daily Returns
        daily_returns = self.data.pct_change().dropna()

        # 2. Portfolio Value History (The "Growth" Chart)
        portfolio_daily_returns = daily_returns.dot(self.weights)
        cumulative_returns = (1 + portfolio_daily_returns).cumprod()
        portfolio_value = 10000 * cumulative_returns

        # ---------------------------------------------------------
        # THE AI SECTION: PREDICT FUTURE PRICES
        # ---------------------------------------------------------
        
        # Prepare Data for ML (X = Day Number, Y = Portfolio Value)
        # We convert dates to simple integers (Day 1, Day 2, etc.)
        df_ml = portfolio_value.reset_index()
        df_ml.columns = ['Date', 'Value']
        df_ml['Day_Index'] = np.arange(len(df_ml)).reshape(-1, 1)

        X = df_ml[['Day_Index']]
        y = df_ml['Value']

        # Train the Model (Linear Regression)
        model = LinearRegression()
        model.fit(X, y) # AI learns the trend here

        # Predict Next 30 Days
        last_day_index = df_ml['Day_Index'].iloc[-1]
        future_days = np.arange(last_day_index + 1, last_day_index + 31).reshape(-1, 1)
        future_predictions = model.predict(future_days)

        # Format Predictions for Frontend
        last_date = df_ml['Date'].iloc[-1]
        prediction_data = []
        for i, val in enumerate(future_predictions):
            future_date = last_date + timedelta(days=i+1)
            prediction_data.append({
                "date": future_date.strftime('%Y-%m-%d'),
                "value": round(val, 2),
                "type": "Predicted" # Tag it so we can color it differently
            })

        # Format Historical Data
        historical_data = [
            {"date": row['Date'].strftime('%Y-%m-%d'), "value": round(row['Value'], 2), "type": "Historical"}
            for _, row in df_ml.iterrows()
        ]

        # Combine Both
        full_chart_data = historical_data + prediction_data

        # ---------------------------------------------------------

        # 3. Standard Metrics
        cov_matrix = daily_returns.cov() * 252
        port_variance = np.dot(self.weights.T, np.dot(cov_matrix, self.weights))
        port_volatility = np.sqrt(port_variance)
        port_return = np.sum(daily_returns.mean() * self.weights) * 252
        
        risk_free_rate = 0.02
        sharpe_ratio = (port_return - risk_free_rate) / port_volatility

        return {
            "expected_annual_return": round(port_return * 100, 2),
            "volatility_risk": round(port_volatility * 100, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "portfolio_allocation": dict(zip(self.tickers, self.weights)),
            "growth_chart": full_chart_data # Returns History + AI Prediction
        }