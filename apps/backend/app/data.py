"""Mock content and constants, ported verbatim (copy, numbers, formulas) from
the approved `project/OneGridAI Platform.dc.html` prototype and from
`apps/mobile/src/data/content.ts`, so the backend is the single source of
truth the Expo app now calls over HTTP instead of computing locally.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field


def usd(n: float) -> str:
    return "$" + f"{n:,.2f}"


def usd0(n: float) -> str:
    return "$" + f"{round(n):,}"


FIXED = 19.62
DELIV = 0.1214
SUPPLY = 0.1128
TAXRATE = 0.0605
RETAIL = DELIV + SUPPLY
USAGE = 1240


def bill_for(kwh: float) -> float:
    sub = FIXED + kwh * RETAIL
    return sub * (1 + TAXRATE)


@dataclass
class KbEntry:
    q: str
    a: str
    cites: list[str]


KB: list[KbEntry] = [
    KbEntry(
        q="Why is my bill higher this month?",
        a="September use was 1,240 kWh, 90 more than August. Two drivers: cooling ran 14% longer during the Sept 3–9 heat, and the extra use crossed into the higher delivery tier. Your rate did not change.",
        cites=["Con Edison SC 1 tariff · leaf 42", "Your September interval data"],
    ),
    KbEntry(
        q="How do net metering credits work?",
        a="Exported kWh are credited at your full retail rate for that month, then carried forward as a bill credit. Credits roll over for up to 12 months and are not paid out in cash.",
        cites=["NY PSC net metering order 15-E-0751", "Con Edison SC 1 Rider R · p. 18"],
    ),
    KbEntry(
        q="What is the basic service charge?",
        a="$19.62 a month. It covers the meter, the service line to your building and billing. It does not move with usage, so a low-usage month still carries it.",
        cites=["Con Edison electric tariff · leaf 105"],
    ),
    KbEntry(
        q="Am I on the cheapest rate plan?",
        a="Not quite. On your pattern the EV Time-of-Use rate is about $184 a year cheaper, because 61% of your use lands after 11pm. I can show the side-by-side.",
        cites=["Con Edison SC 1 Rate III", "Your 90-day interval features"],
    ),
    KbEntry(
        q="How do I stop service when I move?",
        a="I can schedule it now. We take a final read on your move-out date and send the closing bill within three business days to a forwarding address.",
        cites=["Customer rights and service FAQ · p. 4"],
    ),
]


def find_kb_hit(question: str) -> KbEntry:
    for k in KB:
        if k.q == question:
            return k
    return KB[0]


def free_ask_hit(message: str) -> KbEntry | None:
    words = [w for w in re.split(r"\s+", message.lower()) if len(w) > 4]
    for k in KB:
        ql = k.q.lower()
        if any(w in ql for w in words):
            return k
    return None


@dataclass
class AssetDriver:
    k: str
    v: str
    w: str


@dataclass
class AssetEntry:
    id: str
    type: str
    loc: str
    age: str
    risk: float
    installed: str
    customers: int
    drivers: list[AssetDriver]
    action: str


ASSETS: list[AssetEntry] = [
    AssetEntry(
        id="TX-4471", type="Pad-mount transformer, 500 kVA", loc="W 47th & 9th", age="31 yrs",
        risk=0.87, installed="1995", customers=214,
        drivers=[
            AssetDriver("Load factor vs rating", "1.34×", "88%"),
            AssetDriver("Oil temp trend, 90 d", "+11 °C", "74%"),
            AssetDriver("Age percentile", "96th", "69%"),
            AssetDriver("Outages, 24 mo", "4", "52%"),
        ],
        action="Inspect within 7 days. Thermal scan plus oil sample. Crew 14 has capacity Thursday.",
    ),
    AssetEntry(
        id="FD-1180", type="Primary feeder section", loc="Hell's Kitchen loop", age="27 yrs",
        risk=0.81, installed="1999", customers=1420,
        drivers=[
            AssetDriver("Splice count per mile", "19", "82%"),
            AssetDriver("Fault current events", "7", "71%"),
            AssetDriver("Soil moisture exposure", "High", "58%"),
            AssetDriver("Age percentile", "91st", "61%"),
        ],
        action="Schedule partial-discharge survey inside 14 days. Sectionalise before summer peak.",
    ),
    AssetEntry(
        id="TX-2209", type="Pad-mount transformer, 300 kVA", loc="W 52nd & 10th", age="24 yrs",
        risk=0.74, installed="2002", customers=168,
        drivers=[
            AssetDriver("Load factor vs rating", "1.11×", "66%"),
            AssetDriver("Harmonic distortion", "6.2%", "59%"),
            AssetDriver("Age percentile", "84th", "51%"),
            AssetDriver("Outages, 24 mo", "2", "33%"),
        ],
        action="Add to the next planned window. No emergency truck roll warranted.",
    ),
    AssetEntry(
        id="SW-0342", type="Network switchgear", loc="Clinton substation", age="19 yrs",
        risk=0.69, installed="2007", customers=3100,
        drivers=[
            AssetDriver("Operations since service", "8,410", "72%"),
            AssetDriver("Contact wear estimate", "0.61", "63%"),
            AssetDriver("Enclosure humidity", "High", "47%"),
            AssetDriver("Age percentile", "70th", "41%"),
        ],
        action="Bundle with the substation outage already booked for Nov 4.",
    ),
    AssetEntry(
        id="TX-6612", type="Pole-mount transformer, 100 kVA", loc="W 44th & 11th", age="36 yrs",
        risk=0.66, installed="1990", customers=41,
        drivers=[
            AssetDriver("Age percentile", "99th", "80%"),
            AssetDriver("Load factor vs rating", "0.78×", "34%"),
            AssetDriver("Corrosion inspection", "Overdue", "56%"),
            AssetDriver("Outages, 24 mo", "1", "22%"),
        ],
        action="Replace on the pole-programme cycle. Low customer count, low urgency.",
    ),
    AssetEntry(
        id="RG-0088", type="Voltage regulator", loc="W 39th & 8th", age="22 yrs",
        risk=0.62, installed="2004", customers=620,
        drivers=[
            AssetDriver("Tap changes per day", "62", "70%"),
            AssetDriver("Counter vs maintenance", "Overdue", "58%"),
            AssetDriver("Age percentile", "78th", "44%"),
            AssetDriver("Outages, 24 mo", "0", "12%"),
        ],
        action="Service the tap changer at the next planned de-energisation.",
    ),
]


def risk_color(risk: float) -> str:
    if risk >= 0.8:
        return "#E61E2E"
    if risk >= 0.7:
        return "#1E5B71"
    return "#4D6F84"


@dataclass
class ProgramEntry:
    name: str
    match: int
    why: str
    value: str


PROGRAMS: list[ProgramEntry] = [
    ProgramEntry("EV Time-of-Use rate", 94, "You charge between 11pm and 3am on 22 of the last 30 nights, and 61% of your load sits off-peak.", "Saves about $184 a year"),
    ProgramEntry("Rooftop solar with net metering", 81, "South-facing roof, 1,240 kWh a month and no shading flags in the LiDAR layer for your block.", "Offsets up to 66% of your bill"),
    ProgramEntry("Summer demand-response events", 76, "Your 4pm to 7pm load is 2.1 kW above the block average, and you have a smart thermostat on record.", "Earns $25 per event, 8 events"),
    ProgramEntry("Home weatherisation assessment", 58, "Winter baseload rises 34% when outdoor temperature drops below 30 °F, which points at envelope loss.", "Free assessment, $1,200 rebate"),
]


@dataclass
class CallLine:
    who: str
    text: str


CALL: list[CallLine] = [
    CallLine("Maria", "Hi, my bill went up almost thirty dollars and I did not change anything."),
    CallLine("Agent", "Let me pull up your September read while we talk."),
    CallLine("Maria", "And what is this basic service charge? I was away for two weeks."),
    CallLine("Agent", "Good question, that one is fixed. One moment."),
    CallLine("Maria", "Okay. And if I put solar on the roof, does the credit come back as a cheque?"),
]


@dataclass
class RetrievedChunk:
    src: str
    score: str
    text: str


@dataclass
class Suggestion:
    text: str
    cites: list[str]
    chunks: list[RetrievedChunk]


SUGGESTIONS: list[Suggestion] = [
    Suggestion(
        text="The increase is 90 kWh of extra use, not a rate change. Cooling ran 14% longer during the Sept 3–9 heat wave and the extra use crossed into the second delivery tier at 12.14¢. Offer the bill breakdown in the app.",
        cites=["Con Edison SC 1 tariff · leaf 42", "Interval data, Sept 3–9"],
        chunks=[
            RetrievedChunk("SC 1 tariff · leaf 42", "0.91", "Delivery charges are applied in two blocks; usage above the first 250 kWh per month is billed at the higher rate."),
            RetrievedChunk("Rate change notices 2026", "0.74", "No delivery or supply rate adjustment took effect for SC 1 residential customers in September 2026."),
        ],
    ),
    Suggestion(
        text="The basic service charge is $19.62 a month and does not vary with usage or with time away. It covers the meter, the service line and billing. It is the only charge that stays flat on a zero-usage month.",
        cites=["Con Edison electric tariff · leaf 105"],
        chunks=[
            RetrievedChunk("Electric tariff · leaf 105", "0.94", "A basic service charge of $19.62 per month shall apply to each residential account regardless of consumption."),
            RetrievedChunk("Customer rights FAQ · p. 4", "0.62", "Accounts remain subject to the basic service charge during periods of vacancy unless service is formally stopped."),
        ],
    ),
    Suggestion(
        text="No cheque. Exported kWh are credited at the full retail rate on the next bill and roll forward for up to 12 months. Offer the in-app simulator so she can see the offset for a 6 kW array on her own usage.",
        cites=["NY PSC order 15-E-0751", "SC 1 Rider R · p. 18"],
        chunks=[
            RetrievedChunk("SC 1 Rider R · p. 18", "0.89", "Net exported energy shall be credited to the customer's account at the applicable retail rate and carried forward as a monetary credit."),
            RetrievedChunk("PSC order 15-E-0751", "0.71", "Credits may be carried forward for a period not to exceed twelve consecutive billing periods."),
        ],
    ),
]


@dataclass
class DrFilter:
    label: str
    n: int
    kw: float


DR_FILTERS: list[DrFilter] = [
    DrFilter("EV owners", 3120, 4.1),
    DrFilter("Smart thermostat on record", 5240, 1.9),
    DrFilter("Over 1,000 kWh a month", 4410, 2.4),
    DrFilter("Central AC detected", 6180, 3.2),
    DrFilter("Past event participants", 1870, 2.8),
]

FAQ_DATA = [
    {"q": "How is my delivery charge calculated?", "a": "Delivery is billed in two blocks. The first 250 kWh each month are cheaper; everything above that is charged at the higher tier rate. Reducing usage below the tier break has an outsized effect on the bill.", "cite": "Con Edison SC 1 tariff · leaf 42"},
    {"q": "Can I switch supply to an ESCO?", "a": "Yes. Delivery stays with the utility and appears on the same bill, while supply is billed at the ESCO's contracted rate. Compare the total, not the supply rate alone.", "cite": "Retail choice enrollment guide · p. 7"},
    {"q": "What happens to solar credits I do not use?", "a": "They carry forward as a monetary credit for up to twelve consecutive billing periods, then expire. Credits are never paid out in cash.", "cite": "NY PSC order 15-E-0751"},
    {"q": "How do I start service at a new address?", "a": "Provide the address, a move-in date and identification. Service is normally energised the same business day if the meter is already installed.", "cite": "Customer rights and service FAQ · p. 2"},
]

OUTAGE_OPTIONS = ["No power at all", "Flickering lights", "Partial outage", "Downed line nearby", "Damaged meter"]

APP_ENDPOINTS = [
    {"screen": "Home", "path": "GET /account/summary"},
    {"screen": "Ask OneGridAI", "path": "POST /chat"},
    {"screen": "September bill", "path": "GET /bill/explain"},
    {"screen": "Solar what-if", "path": "POST /simulate"},
    {"screen": "Meter alert", "path": "GET /anomalies"},
    {"screen": "For you", "path": "GET /programs/recommend"},
    {"screen": "Report a problem", "path": "POST /outages/report"},
]

KWH_HISTORY = [
    {"m": "Apr", "v": 860}, {"m": "May", "v": 940}, {"m": "Jun", "v": 1080},
    {"m": "Jul", "v": 1310}, {"m": "Aug", "v": 1150}, {"m": "Sep", "v": 1240},
]

PORTAL_NAV = ["Rates", "Solar", "Outages", "Support"]

OUTAGE_PINS = [
    {"x": 0.18, "y": 0.24, "d": 16, "danger": True}, {"x": 0.62, "y": 0.3, "d": 22, "danger": True},
    {"x": 0.72, "y": 0.68, "d": 13, "danger": False}, {"x": 0.31, "y": 0.72, "d": 18, "danger": False},
]

PAY_OPTIONS = [
    {"label": "Visa ending 4417", "detail": "Default card"},
    {"label": "Bank account ending 8820", "detail": "No processing fee"},
    {"label": "Split into 3 payments", "detail": "Payment arrangement, no interest"},
]
