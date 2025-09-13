from fastapi import APIRouter, Query
import http.client
import json

router = APIRouter()

RAPIDAPI_KEY = "766df8fbc3mshb3d55482602283bp14d63ejsn2d820910ed2c"

@router.post("/crime_reports")
async def get_crime_reports(
    lat: float = Query(...),
    lon: float = Query(...),
    address: str = Query("")
):
    conn = http.client.HTTPSConnection("crimedata-by-qn.p.rapidapi.com")
    payload = json.dumps({
        "lat": str(lat),
        "lon": str(lon),
        "address": address
    })
    headers = {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': "crimedata-by-qn.p.rapidapi.com",
        'Content-Type': "application/json"
    }
    conn.request("POST", "/crimedata", payload, headers)
    res = conn.getresponse()
    data = res.read()
    try:
        result = json.loads(data.decode("utf-8"))
        # You may want to filter/format the result here
        return result
    except Exception:
        return {"error": "Failed to parse crime data"}