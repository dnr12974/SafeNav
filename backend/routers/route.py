from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
import polyline
from utils.auth import get_current_user
from crime_model.crime import fetch_routes, get_route_crime_score
from streetlight_model.street import get_lighting_score_for_points

router = APIRouter()

class RouteRequest(BaseModel):
    start: str
    end: str

class Hotspot(BaseModel):
    lat: float
    lng: float
    risk: float
    cid: int
    top_crimes: list

class RouteOption(BaseModel):
    id: int
    name: str
    distance: str
    estimatedTime: str
    safetyRating: float
    wellLit: str
    crimeRisk: float
    lightingScore: float
    risk_level: str
    overall_risk: float
    hotspots: List[Hotspot]
    polyline: str

def sample_polyline(encoded, num_points=5):
    """
    Decodes a polyline and samples up to num_points evenly along the route.
    """
    coords = polyline.decode(encoded)
    if len(coords) <= num_points:
        return coords
    step = max(1, len(coords) // num_points)
    return coords[::step]

@router.post("/plan", response_model=List[RouteOption])
async def plan_route(req: RouteRequest, current_user: dict = Depends(get_current_user)):
    # 1. Fetch all available routes
    routes = fetch_routes(req.start, req.end)  # returns list of dicts with polyline, distance, eta

    route_results = []
    for idx, route in enumerate(routes):
        # 2. Sample points along the route
        points = sample_polyline(route['polyline'])  # list of (lat, lng)

        # 3. Crime score for route
        crime_score, hotspots = get_route_crime_score(points)

        # 4. Streetlight score for route
        lighting_score = get_lighting_score_for_points(points)

        # 5. Combine scores (custom logic)
        # Example: Higher lighting_score and lower crime_score = safer
        combined_score = (1 - crime_score) * 0.6 + lighting_score * 0.4

        route_results.append({
            "id": idx + 1,
            "name": f"Route {idx+1}",
            "distance": f"{route['distance_km']:.2f} km",
            "estimatedTime": f"{route['duration_min']:.1f} mins",
            "safetyRating": round(combined_score * 5, 1),
            "wellLit": f"{int(lighting_score * 100)}%",
            "crimeRisk": crime_score,
            "lightingScore": lighting_score,
            "risk_level": None,  
            "overall_risk": crime_score,
            "hotspots": hotspots,
            "polyline": route['polyline']
        })

    # 6. Label routes as Low/Medium/High risk based on combined_score
    scores = [r['safetyRating'] for r in route_results]
    min_score, max_score = min(scores), max(scores)
    for r in route_results:
        norm = (r['safetyRating'] - min_score) / (max_score - min_score + 1e-6)
        if norm > 0.66:
            r['risk_level'] = "Low"
        elif norm > 0.33:
            r['risk_level'] = "Medium"
        else:
            r['risk_level'] = "High"

    # 7. Sort and return
    route_results.sort(key=lambda r: -r['safetyRating'])
    return route_results