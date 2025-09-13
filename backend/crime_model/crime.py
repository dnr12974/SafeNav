import os
from dotenv import load_dotenv
import joblib
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import QuantileTransformer
import polyline
import googlemaps

# Load models and data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
kmeans = joblib.load(os.path.join(BASE_DIR, 'kmeans_model.pkl'))
cluster_risk = joblib.load(os.path.join(BASE_DIR, 'cluster_risk_lookup.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, 'risk_scaler.pkl'))
HIGH_RISK_THRESH = 0.53

df = pd.read_csv(os.path.join(BASE_DIR,'cleaned_crime_data_pruned_with_clusters.csv'))

load_dotenv()
# Google Maps API key (replace with your actual key)
GMAPS_API_KEY = os.getenv("GMAPS_API_KEY")
gmaps = googlemaps.Client(key=GMAPS_API_KEY)

def geocode_addr(addr):
    result = gmaps.geocode(addr)
    if result:
        loc = result[0]['geometry']['location']
        return (loc['lat'], loc['lng'])
    else:
        raise ValueError(f"Could not geocode address: {addr}")

def fetch_routes(src_addr, dst_addr):
    """
    Fetch alternative routes between src and dst using Google Maps Directions API.
    Returns a list of dicts: {polyline, distance_km, duration_min}
    """
    src = geocode_addr(src_addr)
    dst = geocode_addr(dst_addr)
    directions = gmaps.directions(src, dst, alternatives=True, mode="driving")
    routes = []
    for leg in directions:
        routes.append({
            "polyline": leg['overview_polyline']['points'],
            "distance_km": leg['legs'][0]['distance']['value'] / 1000.0,
            "duration_min": leg['legs'][0]['duration']['value'] / 60.0
        })
    return routes

def get_route_crime_score(points):
    """
    For a list of (lat, lng) points, compute the average risk score and collect hotspots.
    Returns (mean_risk, hotspots_list)
    """
    risks = []
    hotspots = []
    for lat, lng in points:
        cid = kmeans.predict(pd.DataFrame([[lat, lng]], columns=['latitude', 'longitude']))[0]
        risk = cluster_risk.get(cid, 0)
        risks.append(risk)
        if risk > HIGH_RISK_THRESH:
            # Optionally enrich with top crimes here if needed
            hotspots.append({"lat": lat, "lng": lng, "risk": float(risk), "cid": int(cid), "top_crimes": []})
    mean_risk = float(np.mean(risks)) if risks else 0.0
    return mean_risk, hotspots

def sample_polyline(encoded, step_m=200):
    return polyline.decode(encoded)

def categorize_relative(sorted_risks, score):
    min_r = sorted_risks[0]
    max_r = sorted_risks[-1]
    if np.isclose(max_r, min_r):
        return "Low"
    norm_score = (score - min_r) / (max_r - min_r)
    if norm_score < 0.33:
        return "Low"
    elif norm_score < 0.66:
        return "Medium"
    else:
        return "High"

def get_safe_route(src_input, dst_input):
    if isinstance(src_input, str):
        src = geocode_addr(src_input)
    else:
        src = src_input
    if isinstance(dst_input, str):
        dst = geocode_addr(dst_input)
    else:
        dst = dst_input

    routes = fetch_routes(src, dst)
    results = []

    for r in routes:
        waypoints = sample_polyline(r['polyline'])
        risks = []
        for lat, lng in waypoints:
            cid = kmeans.predict(pd.DataFrame([[lat, lng]], columns=['latitude', 'longitude']))[0]
            risk = cluster_risk.get(cid, 0)
            risks.append(risk)
        overall = float(np.mean(risks))
        hotspots = [
            {'lat': lat, 'lng': lng, 'risk': float(risk)}
            for (lat, lng), risk in zip(waypoints, risks) if risk > HIGH_RISK_THRESH
        ]
        results.append({
            "polyline": r['polyline'],
            "eta": r['duration_min'],
            "distance": r['distance_km'],
            "overall_risk": overall,
            "hotspots": hotspots
        })

    risk_values = sorted([r['overall_risk'] for r in results])
    for route in results:
        route['risk_level'] = categorize_relative(risk_values, route['overall_risk'])

    from collections import defaultdict
    routes_by_level = defaultdict(list)
    for route in results:
        routes_by_level[route['risk_level']].append(route)
    selected_routes = []
    for level in ['Low', 'Medium', 'High']:
        if level in routes_by_level:
            best_route = min(routes_by_level[level], key=lambda r: r['overall_risk'])
            selected_routes.append(best_route)
    if len(selected_routes) < 3:
        remaining = [r for r in results if r not in selected_routes]
        remaining_sorted = sorted(remaining, key=lambda r: r['overall_risk'])
        for r in remaining_sorted:
            selected_routes.append(r)
            if len(selected_routes) == 3:
                break
    for route in selected_routes:
        waypoints = sample_polyline(route['polyline'])
        hotspots = [
            {'lat': lat, 'lng': lng, 'risk': float(cluster_risk.get(
                kmeans.predict(pd.DataFrame([[lat, lng]], columns=['latitude', 'longitude']))[0], 0))}
            for lat, lng in waypoints if cluster_risk.get(
                kmeans.predict(pd.DataFrame([[lat, lng]], columns=['latitude', 'longitude']))[0], 0) > HIGH_RISK_THRESH
        ]
        route['hotspots'] = hotspots

    recommended_route = selected_routes[0] if selected_routes else None
    alternative_routes = selected_routes[1:]

    return {
        "recommended_route": recommended_route,
        "alternative_routes": alternative_routes,
        "hotspots": recommended_route['hotspots'] if recommended_route else []
    }

