"""
report_routes.py — FastAPI router for report CRUD and dashboard stats.

POST   /api/reports      — Save a completed analysis
GET    /api/reports      — List user's reports (summary)
GET    /api/reports/{id} — Full report, ownership-checked
DELETE /api/reports/{id} — Delete report, ownership-checked
GET    /api/stats        — Aggregated dashboard stats
"""

import os
import sys
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.db import reports_collection, activities_collection
from security.auth_routes import get_current_user
from backend.chart_parser import parse_all, clean_markdown_report

router = APIRouter(tags=["reports"])

# High-risk threshold: reports with risk_percentage > this are flagged
HIGH_RISK_THRESHOLD = 60


def _fmt_date(val):
    if not val:
        return None
    return val.isoformat() if hasattr(val, "isoformat") else str(val)


# --- Pydantic Models ---

class SaveReportRequest(BaseModel):
    industry: str
    budget: str
    trend_data: Optional[str] = None
    discovery_data: Optional[str] = None
    financial_data: Optional[str] = None
    validation_data: Optional[str] = None
    projectName: Optional[str] = None
    ideaTitle: Optional[str] = None
    category: Optional[str] = None
    processingTime: Optional[float] = 24.5


# --- Routes ---

@router.post("/api/reports")
async def save_report(req: SaveReportRequest, current_user: dict = Depends(get_current_user)):
    """Save a completed multi-agent analysis to MongoDB."""
    reports = reports_collection()

    # Run hybrid chart parser on save so the report page doesn't need to re-parse
    parsed = parse_all(
        trend_raw=req.trend_data or "",
        discovery_raw=req.discovery_data or "",
        financial_raw=req.financial_data or "",
        validation_raw=req.validation_data or "",
    )

    # Determine a viability score from validation parsed data
    validation_parsed = parsed.get("validation", {})
    score = validation_parsed.get("success_probability")
    if score is None:
        score = validation_parsed.get("demand_score")
    risk = validation_parsed.get("risk_percentage")
    recommendation = validation_parsed.get("final_recommendation")

    import uuid
    project_id = f"PRJ-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc)
    
    discovery_parsed = parsed.get("discovery", {})
    trend_parsed = parsed.get("trend", {})
    
    overall_score = score or 0
    market_score = validation_parsed.get("demand_score") or validation_parsed.get("market_demand") or 0
    financial_score = validation_parsed.get("investment_score") or 0
    risk_score = risk or 0
    innovation_score = discovery_parsed.get("opportunity_score") or 0
    
    verdict = "HOLD"
    if recommendation == "GOOD":
        verdict = "GO"
    elif recommendation == "NOT RECOMMENDED":
        verdict = "NO GO"
        
    tags = trend_parsed.get("keywords") or [req.industry, "AI", "Startup Validation"]

    report_doc = {
        "userId": current_user["_id"],
        "projectId": project_id,
        "projectName": req.projectName or f"{req.industry} Startup",
        "ideaTitle": req.ideaTitle or f"AI-Based {req.industry} Solution",
        "industry": req.industry,
        "category": req.category or req.industry,
        
        "overallScore": overall_score,
        "marketScore": market_score,
        "financialScore": financial_score,
        "riskScore": risk_score,
        "innovationScore": innovation_score,
        
        "verdict": verdict,
        "confidenceScore": 95,
        
        "reportSummary": "Comprehensive multi-agent analysis report covering market trends, business discovery, financial projections, and final validation.",
        "recommendation": recommendation or "Proceed with caution and validate further.",
        
        "processingTime": req.processingTime,
        "llmModel": "Gemini 3.1 Pro (High)",
        "reportVersion": "1.0",
        "reportLanguage": "English",
        
        "generatedBy": "NotAFlop AI",
        "generatedAt": now,
        
        "status": "Completed",
        
        "downloadCount": 0,
        "isDownloaded": False,
        "lastDownloadedAt": None,
        
        "pdf": {
            "fileName": f"{req.industry.replace(' ', '_')}_Report.pdf",
            "contentType": "application/pdf",
            "fileSize": 0,
            "gridFsId": None,
            "downloadUrl": f"/api/reports/{project_id}/download"
        },
        
        "tags": tags,
        
        "createdAt": now,
        "updatedAt": now,
        
        # Legacy fields for backward compatibility
        "user_id": current_user["_id"],
        "budget": req.budget,
        "created_at": now,
        "raw": {
            "trend": req.trend_data,
            "discovery": req.discovery_data,
            "financial": req.financial_data,
            "validation": req.validation_data,
        },
        "parsed": parsed,
        "score": score,
        "risk": risk,
    }

    result = await reports.insert_one(report_doc)
    report_id = str(result.inserted_id)

    # Log activity
    try:
        activities = activities_collection()
        await activities.insert_one({
            "user_id": current_user["_id"],
            "type": "analysis_completed",
            "title": f"Analysis completed: {req.industry}",
            "description": f"Budget: {req.budget}",
            "report_id": report_id,
            "created_at": datetime.now(timezone.utc),
        })
    except Exception:
        pass  # Non-critical; don't fail the save

    return {
        "status": "success",
        "report_id": report_id,
        "message": "Report saved successfully"
    }


@router.get("/api/reports")
async def list_reports(current_user: dict = Depends(get_current_user)):
    """List all reports for the authenticated user, sorted newest first."""
    reports = reports_collection()

    cursor = reports.find(
        {"user_id": current_user["_id"]},
        {
            "_id": 1,
            "industry": 1,
            "budget": 1,
            "score": 1,
            "risk": 1,
            "recommendation": 1,
            "created_at": 1,
        }
    ).sort("created_at", -1)

    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "industry": doc.get("industry", "Unknown"),
            "budget": doc.get("budget", "N/A"),
            "score": doc.get("score"),
            "risk": doc.get("risk"),
            "recommendation": doc.get("recommendation"),
            "date": _fmt_date(doc.get("created_at")),
        })

    return {"status": "success", "data": results}


@router.get("/api/reports/{report_id}")
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Get a full report by ID. Ownership-checked."""
    reports = reports_collection()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    doc = await reports.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")

    # Ownership check
    if doc.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")

    raw = doc.get("raw", {})
    parsed = doc.get("parsed") or {}

    # Guarantee all 4 tabs have parsed metric data
    tabs = ["trend", "discovery", "financial", "validation"]
    needs_update = False
    fresh_all = None
    for t in tabs:
        t_data = parsed.get(t)
        if not t_data or not isinstance(t_data, dict) or not any(t_data.values()):
            if fresh_all is None:
                fresh_all = parse_all(
                    trend_raw=raw.get("trend") or "",
                    discovery_raw=raw.get("discovery") or "",
                    financial_raw=raw.get("financial") or "",
                    validation_raw=raw.get("validation") or "",
                )
            parsed[t] = fresh_all.get(t, {})
            needs_update = True

    # Check if trend data needs 5-year enrichment or sector breakdown
    trend_p = parsed.get("trend", {})
    if not trend_p.get("sectors") or not trend_p.get("five_year_summary") or len(trend_p.get("historical_growth", [])) < 6:
        from backend.chart_parser import parse_trend_data
        parsed["trend"] = parse_trend_data(raw.get("trend") or "")
        needs_update = True

    if needs_update:
        try:
            await reports.update_one({"_id": oid}, {"$set": {"parsed": parsed}})
        except Exception:
            pass

    # Provide clean markdown without machine JSON blocks
    clean_raw = {
        k: clean_markdown_report(v) if isinstance(v, str) else v
        for k, v in raw.items()
    }

    validation_p = parsed.get("validation", {})
    score = doc.get("score") or validation_p.get("success_probability") or validation_p.get("demand_score") or 75
    risk = doc.get("risk") or validation_p.get("risk_percentage") or 25
    recommendation = doc.get("recommendation") or validation_p.get("final_recommendation") or "GOOD"

    return {
        "status": "success",
        "data": {
            "id": str(doc["_id"]),
            "industry": doc.get("industry"),
            "budget": doc.get("budget"),
            "score": score,
            "risk": risk,
            "recommendation": recommendation,
            "created_at": _fmt_date(doc.get("created_at")),
            "raw": raw,
            "clean_raw": clean_raw,
            "parsed": parsed,
        }
    }


@router.delete("/api/reports/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a report. Ownership-checked."""
    reports = reports_collection()

    try:
        oid = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    doc = await reports.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")

    if doc.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")

    await reports.delete_one({"_id": oid})

    return {"status": "success", "message": "Report deleted"}


@router.get("/api/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """
    Aggregated dashboard stats for the authenticated user:
    - total_analyses: count of reports
    - avg_score: average success_probability/score
    - high_risk_count: reports where risk > HIGH_RISK_THRESHOLD
    - recent_activities: last 5 activities
    """
    reports = reports_collection()
    activities = activities_collection()

    user_id = current_user["_id"]

    # Total analyses
    total = await reports.count_documents({"user_id": user_id})

    # Aggregation for avg score and high risk count
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": None,
            "avg_score": {"$avg": "$score"},
            "high_risk": {
                "$sum": {
                    "$cond": [
                        {"$gt": [{"$ifNull": ["$risk", 0]}, HIGH_RISK_THRESHOLD]},
                        1,
                        0
                    ]
                }
            }
        }}
    ]

    agg_result = None
    async for doc in reports.aggregate(pipeline):
        agg_result = doc
        break

    avg_score = round(agg_result["avg_score"], 1) if agg_result and agg_result.get("avg_score") else None
    high_risk = agg_result["high_risk"] if agg_result else 0

    # Recent activities
    recent = []
    cursor = activities.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    async for act in cursor:
        recent.append({
            "title": act.get("title", "Activity"),
            "description": act.get("description", ""),
            "time": _fmt_date(act.get("created_at")),
        })

    return {
        "status": "success",
        "data": {
            "total_analyses": total,
            "avg_score": avg_score,
            "high_risk_count": high_risk,
            "recent_activities": recent,
        }
    }
