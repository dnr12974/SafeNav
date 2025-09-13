import os
from dotenv import load_dotenv
import requests
import polyline
import googlemaps
from PIL import Image
from io import BytesIO
from ultralytics import YOLO

# Load your trained YOLO model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = YOLO(os.path.join(BASE_DIR, "best.pt")) 

load_dotenv()
# Google Maps API key
GMAPS_API_KEY = os.getenv("GMAPS_API_KEY")
gmaps = googlemaps.Client(key=GMAPS_API_KEY)

def geocode(addr):
    result = gmaps.geocode(addr)
    if not result:
        raise ValueError(f"Could not geocode: {addr}")
    loc = result[0]['geometry']['location']
    return (loc['lat'], loc['lng'])

def get_route_polyline(src, dst):
    directions = gmaps.directions(src, dst, mode='driving', alternatives=False)
    if not directions:
        raise ValueError("Could not fetch directions.")
    return directions[0]['overview_polyline']['points']

def get_streetview_image(lat, lng, heading=0, pitch=0, fov=90):
    url = (
        f"https://maps.googleapis.com/maps/api/streetview?"
        f"size=640x640&location={lat},{lng}&fov={fov}&heading={heading}"
        f"&pitch={pitch}&key={GMAPS_API_KEY}"
    )
    response = requests.get(url)
    if response.status_code == 200:
        return Image.open(BytesIO(response.content))
    return None

def get_lighting_score_for_points(points):
    well_lit_points = 0
    total_points = 0
    for lat, lng in points:
        lamps_found = 0
        for heading in [0, 90, 180, 270]:
            img = get_streetview_image(lat, lng, heading=heading)
            if img and detect_lamps(img) > 0:
                lamps_found += 1
                break
        if lamps_found > 0:
            well_lit_points += 1
        total_points += 1
    if total_points == 0:
        return 0.0
    return well_lit_points / total_points

def detect_lamps(image):
    results = model(image)
    return len(results[0].boxes)  # Number of detections

def get_lighting_score(src_addr, dst_addr, polyline_str=None):
    if polyline_str:
        coords = polyline.decode(polyline_str)
    else:
        src = geocode(src_addr)
        dst = geocode(dst_addr)
        encoded = get_route_polyline(src, dst)
        coords = polyline.decode(encoded)
    sampled_points = coords[::max(1, len(coords) // 8)]  
    total_lamps = 0
    total_images = 0

    for i, (lat, lng) in enumerate(sampled_points):
        for heading in [0, 90, 180, 270]:
            img = get_streetview_image(lat, lng, heading=heading)
            if img:
                lamps = detect_lamps(img)
                total_lamps += lamps
                total_images += 1

    if total_images == 0:
        return {"lamp_count": 0, "lighting_score": 0.0}

    lighting_score = total_lamps / total_images
    return {
        "lamp_count": total_lamps,
        "images_analyzed": total_images,
        "lighting_score": lighting_score
    }