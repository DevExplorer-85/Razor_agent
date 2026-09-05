"""
Module 3: Forward Cash Forecaster

Trains/predicts ONLY on the "clean" (non-exception, non-flagged) subset
of reconciled historical data. Excludes anything in the exceptions list
so fraud-tainted records don't skew the forecast.

Uses Holt-Winters exponential smoothing for 7-day forecast with
80% confidence intervals.

Fraud vector defended: Contaminated forecast from fraud-tainted historical data.
"""
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import math

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if backend_dir.name != "backend":
    backend_dir = backend_dir.parent
project_root = backend_dir.parent
for p in (str(project_root), str(backend_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.config import OUTPUT_DIR, RECONCILIATION_OUTPUT
except ImportError:
    from config import OUTPUT_DIR, RECONCILIATION_OUTPUT


# Try statsmodels; provide a simple fallback if unavailable
try:
    import numpy as np
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False


class CashForecaster:
    """
    7-day cash position forecaster using clean reconciled data only.
    
    Pipeline:
    1. Load reconciliation report
    2. Filter to EXACT-match-only records (exclude exceptions)
    3. Aggregate daily settlement amounts
    4. Fit Holt-Winters model (or simple moving average fallback)
    5. Forecast next 7 days with confidence intervals
    """

    def __init__(self, report_path: Path = RECONCILIATION_OUTPUT):
        self.report_path = report_path
        self.forecast_result: dict | None = None

    def run(self) -> dict:
        """Run the cash forecasting pipeline."""
        # ------------------------------------------------------------------
        # Step 1: Load and filter clean data
        # ------------------------------------------------------------------
        with open(self.report_path, "r") as f:
            report = json.load(f)

        # Get exception record IDs to exclude
        exception_ids = set()
        for exc in report.get("exceptions", []):
            exception_ids.add(exc.get("record_id", ""))
            exception_ids.add(exc.get("related_record_id", ""))
        exception_ids.discard("")

        # Filter to only EXACT matches not in exceptions
        clean_matches = []
        excluded_count = 0
        for match in report.get("matched", []):
            if match["match_type"] != "EXACT":
                excluded_count += 1
                continue
            if (match["record_a_id"] in exception_ids
                    or match["record_b_id"] in exception_ids):
                excluded_count += 1
                continue
            clean_matches.append(match)

        # ------------------------------------------------------------------
        # Step 2: Build daily time series
        # ------------------------------------------------------------------
        # We need the settlement data to get amounts and dates
        # Load settlement data to cross-reference
        settlements_path = Path(self.report_path).parent.parent / "data" / "razorpay_settlements.json"
        settlements_lookup = {}
        if settlements_path.exists():
            with open(settlements_path, "r") as f:
                for s in json.load(f):
                    settlements_lookup[s["id"]] = s

        # Build daily aggregates
        daily_amounts: dict[str, int] = {}
        for match in clean_matches:
            sid = match["record_a_id"]
            setl = settlements_lookup.get(sid)
            if setl:
                dt = datetime.fromtimestamp(setl["created_at"])
                day_key = dt.strftime("%Y-%m-%d")
                net = setl["amount"] - setl.get("fees", 0) - setl.get("tax", 0)
                daily_amounts[day_key] = daily_amounts.get(day_key, 0) + net

        if not daily_amounts:
            self.forecast_result = {
                "status": "insufficient_data",
                "message": "Not enough clean data points for forecasting",
                "historical": [],
                "forecast": [],
                "excluded_records": excluded_count,
                "clean_records": len(clean_matches),
            }
            return self.forecast_result

        # Sort by date and fill gaps
        sorted_dates = sorted(daily_amounts.keys())
        start_date = datetime.strptime(sorted_dates[0], "%Y-%m-%d")
        end_date = datetime.strptime(sorted_dates[-1], "%Y-%m-%d")

        all_dates = []
        all_values = []
        current = start_date
        while current <= end_date:
            day_key = current.strftime("%Y-%m-%d")
            all_dates.append(day_key)
            all_values.append(daily_amounts.get(day_key, 0))
            current += timedelta(days=1)

        # ------------------------------------------------------------------
        # Step 3: Forecast
        # ------------------------------------------------------------------
        forecast_days = 7

        if HAS_STATSMODELS and len(all_values) >= 7:
            forecast_dates, forecast_values, lower_bound, upper_bound = (
                self._statsmodels_forecast(all_dates, all_values, forecast_days)
            )
        else:
            forecast_dates, forecast_values, lower_bound, upper_bound = (
                self._simple_forecast(all_dates, all_values, forecast_days)
            )

        # ------------------------------------------------------------------
        # Step 4: Build result
        # ------------------------------------------------------------------
        historical = [
            {"date": d, "amount": v, "amount_rupees": round(v / 100, 2)}
            for d, v in zip(all_dates, all_values)
        ]

        forecast = [
            {
                "date": d,
                "predicted": v,
                "predicted_rupees": round(v / 100, 2),
                "lower_80": lo,
                "upper_80": hi,
                "lower_80_rupees": round(lo / 100, 2),
                "upper_80_rupees": round(hi / 100, 2),
            }
            for d, v, lo, hi in zip(
                forecast_dates, forecast_values, lower_bound, upper_bound
            )
        ]

        self.forecast_result = {
            "status": "complete",
            "historical": historical,
            "forecast": forecast,
            "clean_records": len(clean_matches),
            "excluded_records": excluded_count,
            "total_historical_days": len(all_dates),
            "forecast_days": forecast_days,
            "model": "HoltWinters" if HAS_STATSMODELS and len(all_values) >= 7 else "SimpleMovingAverage",
        }

        # Save
        output_path = OUTPUT_DIR / "forecast_report.json"
        OUTPUT_DIR.mkdir(exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(self.forecast_result, f, indent=2)

        return self.forecast_result

    def _statsmodels_forecast(self, dates, values, n_days):
        """Holt-Winters exponential smoothing forecast."""
        series = np.array(values, dtype=float)
        # Replace zeros with small values to avoid issues
        series[series == 0] = np.mean(series[series > 0]) * 0.1 if np.any(series > 0) else 1.0

        try:
            # Try with trend; seasonal requires more data points
            model = ExponentialSmoothing(
                series,
                trend="add",
                seasonal=None,
                initialization_method="estimated",
            ).fit(optimized=True)

            forecast = model.forecast(n_days)
            # Approximate 80% confidence interval
            residuals = series - model.fittedvalues
            std_resid = float(np.std(residuals))

            last_date = datetime.strptime(dates[-1], "%Y-%m-%d")
            forecast_dates = [
                (last_date + timedelta(days=i+1)).strftime("%Y-%m-%d")
                for i in range(n_days)
            ]

            z_80 = 1.28  # z-score for 80% CI
            forecast_values = [max(0, int(v)) for v in forecast]
            lower = [max(0, int(v - z_80 * std_resid * math.sqrt(i+1))) for i, v in enumerate(forecast)]
            upper = [int(v + z_80 * std_resid * math.sqrt(i+1)) for i, v in enumerate(forecast)]

            return forecast_dates, forecast_values, lower, upper
        except Exception:
            return self._simple_forecast(dates, values, n_days)

    def _simple_forecast(self, dates, values, n_days):
        """Simple moving average fallback forecast."""
        window = min(7, len(values))
        recent = values[-window:]
        avg = sum(recent) / len(recent) if recent else 0
        std = (sum((v - avg) ** 2 for v in recent) / max(len(recent) - 1, 1)) ** 0.5

        last_date = datetime.strptime(dates[-1], "%Y-%m-%d")
        forecast_dates = [
            (last_date + timedelta(days=i+1)).strftime("%Y-%m-%d")
            for i in range(n_days)
        ]

        z_80 = 1.28
        forecast_values = [max(0, int(avg)) for _ in range(n_days)]
        lower = [max(0, int(avg - z_80 * std * math.sqrt(i+1))) for i in range(n_days)]
        upper = [int(avg + z_80 * std * math.sqrt(i+1)) for i in range(n_days)]

        return forecast_dates, forecast_values, lower, upper


def run_forecast() -> dict:
    """Convenience function to run the cash forecaster."""
    forecaster = CashForecaster()
    result = forecaster.run()

    print("=" * 60)
    print("CASH FORECAST REPORT")
    print("=" * 60)
    print(f"Status: {result['status']}")
    print(f"Clean records used: {result['clean_records']}")
    print(f"Excluded (tainted) records: {result['excluded_records']}")

    if result["status"] == "complete":
        print(f"Model: {result['model']}")
        print(f"Historical days: {result['total_historical_days']}")
        print(f"\n7-Day Forecast:")
        for f in result["forecast"]:
            print(
                f"  {f['date']}: ₹{f['predicted_rupees']:,.2f} "
                f"(80% CI: ₹{f['lower_80_rupees']:,.2f} — ₹{f['upper_80_rupees']:,.2f})"
            )
    else:
        print(f"Message: {result.get('message', 'N/A')}")

    return result


if __name__ == "__main__":
    run_forecast()
