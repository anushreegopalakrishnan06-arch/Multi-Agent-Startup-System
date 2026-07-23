"""
chart_parser.py — Hybrid regex extraction for AI agent markdown outputs.

Each function attempts to extract known numeric fields from the raw markdown.
Returns None for any field it can't confidently extract — never raises, never guesses.
The frontend falls back to raw markdown rendering for any null field.
"""

import re
import json
from typing import Optional


def _extract_json(raw_text: str) -> dict:
    """Finds and parses a JSON block within the raw markdown text."""
    if not raw_text:
        return {}
    
    # Try to find a json code block first
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw_text, re.DOTALL | re.IGNORECASE)
    if match:
        json_str = match.group(1)
    else:
        # Fallback to finding the first { ... } structure
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            json_str = match.group(0)
        else:
            return {}

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {}


# ============================================================
# Per-agent parsers
# ============================================================

def parse_trend_data(raw_markdown: str) -> dict:
    """
    Extract trend analysis fields:
    - cagr
    - top_region
    - market_size
    - keywords
    - historical_growth
    """
    return _extract_json(raw_markdown)


def parse_discovery_data(raw_markdown: str) -> dict:
    """
    Extract business discovery fields:
    - opportunity_score
    - strengths
    - weaknesses
    - opportunities
    - threats
    - competition_level
    """
    return _extract_json(raw_markdown)


def parse_financial_data(raw_markdown: str) -> dict:
    """
    Extract financial analysis fields:
    - initial_investment
    - projected_roi
    - break_even_month
    - first_year_revenue
    - burn_rate
    """
    return _extract_json(raw_markdown)


def parse_validation_data(raw_markdown: str) -> dict:
    """
    Extract validation fields:
    - market_demand
    - success_probability
    - risk_percentage
    - competition_level
    - growth_potential
    - final_recommendation
    - demand_score
    - growth_score
    - investment_score
    - risk_score
    """
    data = _extract_json(raw_markdown)
    
    # Ensure recommendation is properly formatted if present
    if "final_recommendation" in data and isinstance(data["final_recommendation"], str):
        rec = data["final_recommendation"].upper()
        if "GOOD" in rec:
            data["final_recommendation"] = "GOOD"
        elif "MODERATE" in rec:
            data["final_recommendation"] = "MODERATE"
        else:
            data["final_recommendation"] = "NOT RECOMMENDED"
            
    return data


def parse_all(trend_raw: str, discovery_raw: str, financial_raw: str, validation_raw: str) -> dict:
    """Parse all agent outputs and return a combined parsed data dict."""
    return {
        "trend": parse_trend_data(trend_raw or ""),
        "discovery": parse_discovery_data(discovery_raw or ""),
        "financial": parse_financial_data(financial_raw or ""),
        "validation": parse_validation_data(validation_raw or ""),
    }
