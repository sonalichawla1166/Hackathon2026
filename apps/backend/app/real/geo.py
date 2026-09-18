"""Pure geographic math shared by the sales, outages and ops surfaces — all
of them plot real (lat, lon) rows from the DB onto the mobile app's schematic
[0,1] map square and need a real-world distance for sorting/filtering."""
from __future__ import annotations

import math

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(min(1.0, math.sqrt(a)))


def distance_label(km: float) -> str:
    if km < 1:
        return f"{round(km * 1000)} m"
    return f"{km:.1f} km"


def map_xy(lat: float, lon: float, base_lat: float, base_lon: float, radius_km: float) -> tuple[float, float]:
    """Projects a (lat, lon) onto the [0,1] schematic-map square used by the
    mobile UI: the reference point sits at the centre, and the edge of the
    radius circle sits at 0.42 from centre. Illustrative, not a real
    projection — matches the convention the mock map pins used."""
    dx_km = (lon - base_lon) * 111.32 * math.cos(math.radians(base_lat))
    dy_km = (lat - base_lat) * 110.57
    scale = 0.42 / radius_km if radius_km > 0 else 0
    x = 0.5 + dx_km * scale
    y = 0.5 - dy_km * scale
    return max(0.04, min(0.96, x)), max(0.04, min(0.96, y))
