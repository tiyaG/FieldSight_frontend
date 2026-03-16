from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime

# Service function for writing telemetry data into DB
def store_telemetry(
    db: Session,
    rover_id: int,
    battery: float,
    gps_lat: float,
    gps_lng: float,
    heading: float | None,
    captured_at: datetime,
) -> None:
    
    # Creates telemetry row
    db.execute(  
        text(
            """
            INSERT INTO Telemetry (rover_id, battery, gps_lat, gps_lng, heading, captured_at)
            VALUES (:rover_id, :battery, :gps_lat, :gps_lng, :heading, :captured_at)
            """
        ),
        {
            "rover_id": rover_id,
            "battery": battery,
            "gps_lat": gps_lat,
            "gps_lng": gps_lng,
            "heading": heading,
            "captured_at": captured_at,
        },
    )
    
    # Permanently saves the row to the DB
    db.commit()