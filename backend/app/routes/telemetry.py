from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.telemetry_service import store_telemetry

router = APIRouter(prefix="/rover", tags=["telemetry"])

# Uses pydantic to validate/convert fields 
class TelemetryRequest(BaseModel):
    rover_id: int
    battery: float
    gps_lat: float
    gps_lng: float
    heading: float | None = None
    timestamp: datetime | None = None


# Handles POST requests towards /rover/telemetry, calls on telemetry_service.py for logic 
@router.post("/telemetry")
def ingest_telemetry(payload: TelemetryRequest, db: Session = Depends(get_db)):
    try:
        ts = payload.timestamp or datetime.now(timezone.utc)    # either uses device provided time or server-generated time
        store_telemetry(
            db=db,
            rover_id=payload.rover_id,
            battery=payload.battery,
            gps_lat=payload.gps_lat,
            gps_lng=payload.gps_lng,
            heading=payload.heading,
            captured_at=ts,
        )
        
        return {    # only after success
            "status": "stored",
            "rover_id": payload.rover_id,
            "captured_at": ts.isoformat(),
        }
        
    # Rolls back DB session, returns HTTP 500
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store telemetry: {e}")