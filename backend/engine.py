import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class PortfolioEngine:
    def __init__(self, tickers, weights):
        """
        Initializes the portfolio engine.
        :param tickers: List of stock symbols (e.g., ['AAPL', 'TSLA'])
        :param weights: List of weights summing to 1.0 (e.g., [0.6, 0.4])
        """
        self.tickers = tickers
        self.weights = np.array(weights)
        # Fetch 1 year of historical data
        self.start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        self.data = None

    def fetch_data(self):
        """
        Fetches historical data. Handles 'Adj Close' vs 'Close' discrepancies.
        """
        try:
            print(f"Downloading data for: {self.tickers}...")
            # progress=False hides the progress bar to keep logs clean
            raw_data = yf.download(self.tickers, start=self.start_date, progress=False)

            if raw_data.empty:
                print("Error: Downloaded data is empty.")
                return False

            # YFinance Update Fix: Check for 'Adj Close' or 'Close'
            if 'Adj Close' in raw_data.columns:
                stock_data = raw_data['Adj Close']
            elif 'Close' in raw_data.columns:
                stock_data = raw_data['Close']
            else:
                return False
                
            # If only one stock is fetched, convert Series to DataFrame
            if isinstance(stock_data, pd.Series):
                stock_data = stock_data.to_frame()
                
            self.data = stock_data
            return True

        except Exception as e:
            print(f"Error fetching data: {e}")
            return False

    def calculate_performance(self):
        if self.data is None:
            success = self.fetch_data()
            if not success:
                return {"error": "Could not fetch stock data."}

        # 1. Daily Returns
        daily_returns = self.data.pct_change().dropna()

        # 2. Portfolio Logic (Senior Level Vector Math)
        # Calculate weighted daily returns for the whole portfolio
        portfolio_daily_returns = daily_returns.dot(self.weights)
        
        # Calculate "Growth of $10,000" (Cumulative Product)
        # (1 + r1) * (1 + r2) * ...
        cumulative_returns = (1 + portfolio_daily_returns).cumprod()
        portfolio_value = 10000 * cumulative_returns

        # Format data for Recharts (List of dicts: [{'date': '2023-01-01', 'value': 10500}, ...])
        chart_data = [
            {"date": index.strftime('%Y-%m-%d'), "value": round(val, 2)}
            for index, val in portfolio_value.items()
        ]

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
            "growth_chart": chart_data # <--- NEW DATA FIELD
        }
    
    def get_correlation_matrix(self):
        """
        Calculates the correlation matrix of the assets.
        Returns:
            - labels: List of tickers
            - values: 2D list of correlation coefficients
        """
        if self.data is None:
            self.fetch_data()
            
        # 1. Calculate Daily Returns
        returns = self.data.pct_change().dropna()
        
        # 2. Calculate Correlation (-1 to 1)
        corr_matrix = returns.corr()
        
        # 3. Format for Frontend
        return {
            "labels": corr_matrix.columns.tolist(),
            "matrix": corr_matrix.values.tolist()
        }

# Quick Test to ensure this file works alone
if __name__ == "__main__":
    print("Testing Engine...")
    eng = PortfolioEngine(['AAPL', 'MSFT'], [0.5, 0.5])
    print(eng.calculate_performance())