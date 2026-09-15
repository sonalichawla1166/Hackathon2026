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
        return "#D98D95"
    if risk >= 0.7:
        return "#D9B98A"
    return "#938DA6"


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


# ---------------------------------------------------------------------------
# Field sales / door-to-door
# ---------------------------------------------------------------------------

# The rep's home base for the demo — same Hell's Kitchen / Clinton pocket of
# Manhattan as ASSETS above, so the sales and ops surfaces read as the same
# service territory. Real deployment would read this from the rep's device
# GPS (see the mobile `useDeviceLocation` hook); this is the fallback.
SALES_REP_BASE = {"lat": 40.7638, "lng": -73.9918}

KNOCK_OUTCOMES = ["Sold", "Not home", "Not interested", "Callback requested", "Do not contact"]

# Manual CRM pipeline — the rep sets/advances this explicitly (independent of
# knock outcomes, which are a separate visit log). Won/Lost are terminal.
SALES_STAGES = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiating", "Won", "Lost"]


@dataclass
class VisitEntry:
    date: str
    outcome: str
    rep: str
    notes: str


@dataclass
class LeadEntry:
    id: str
    address: str
    unit: str | None
    lat: float
    lng: float
    customer_name: str
    account_status: str  # "Prospect" | "Existing customer" | "Lapsed customer"
    segment: str
    phone: str
    notes: str
    history: list[VisitEntry] = field(default_factory=list)
    stage: str = "New"


# Addresses scattered around SALES_REP_BASE, mostly within ~10km (Manhattan,
# western Queens, inner Brooklyn) with a few deliberately further out
# (Yonkers, JFK-area Queens) to prove the radius filter actually excludes
# something rather than just decorating every lead with a distance.
LEADS: list[LeadEntry] = [
    LeadEntry(
        "LD-101", "412 W 47th St", "Apt 6B", 40.7614, -73.9908, "Priya Nair", "Existing customer",
        "High bill dispute risk — called twice about September charges", "(917) 555-0142",
        "Already an OneGridAI customer account (see Ops asset TX-4471 nearby). Good candidate for the EV Time-of-Use switch.",
        [
            VisitEntry("2026-08-14", "Not home", "J. Ortiz", "Tried early evening, no answer."),
            VisitEntry("2026-08-28", "Callback requested", "J. Ortiz", "Spoke to husband, asked for a call after 6pm."),
        ],
        stage="Contacted",
    ),
    LeadEntry(
        "LD-102", "455 W 51st St", None, 40.7659, -73.9903, "Marcus Webb", "Prospect",
        "No account on file — new-construction lease-up, 3 months old", "(646) 555-0118",
        "Building manager confirmed 40 units, none enrolled yet. Ask for the leasing office contact.",
        [],
    ),
    LeadEntry(
        "LD-103", "530 W 45th St", "Apt 12", 40.7607, -73.9944, "Dana Kowalski", "Existing customer",
        "Rate plan mismatch — flagged by the program engine, could save ~$180/yr", "(212) 555-0176",
        "On SC 1 tiered but usage pattern matches EV Time-of-Use. Bring the side-by-side simulator.",
        [
            VisitEntry("2026-07-30", "Not interested", "S. Boone", "Said she was busy, did not want to talk rates."),
        ],
        stage="Lost",
    ),
    LeadEntry(
        "LD-104", "601 W 57th St", None, 40.7712, -73.9884, "Con Edison West Yard", "Existing customer",
        "Commercial account, high demand charge — solar/battery pitch candidate", "(212) 555-0199",
        "Facilities office is on-site weekdays 8-4. Ask for facilities manager, not the front desk.",
        [],
        stage="Qualified",
    ),
    LeadEntry(
        "LD-105", "340 W 43rd St", "Apt 4F", 40.7581, -73.9908, "Renata Alves", "Lapsed customer",
        "Service stopped 2025, unit re-listed — win-back opportunity", "(347) 555-0163",
        "New tenant moved in per super. Confirm name before pitching — may not be Renata anymore.",
        [
            VisitEntry("2026-06-02", "Not home", "S. Boone", "Building door locked, buzzed no answer."),
        ],
    ),
    LeadEntry(
        "LD-106", "225 W 39th St", "Apt 9", 40.7551, -73.9899, "Tomas Reyes", "Prospect",
        "High Con Ed spend history, no smart thermostat on record", "(718) 555-0187",
        "Good fit for the demand-response program pitch, not just OneGridAI enrollment.",
        [],
    ),
    LeadEntry(
        "LD-107", "150 W 46th St", "Apt 21C", 40.7592, -73.9840, "Grace Lindqvist", "Existing customer",
        "Solar-curious — asked the chat assistant about net metering twice", "(929) 555-0121",
        "Chat log shows real interest. Bring the solar what-if printout.",
        [
            VisitEntry("2026-09-01", "Sold", "J. Ortiz", "Enrolled in rooftop solar assessment."),
        ],
        stage="Won",
    ),
    LeadEntry(
        "LD-108", "88 W 40th St", None, 40.7524, -73.9843, "Bryant Park Tower Mgmt", "Prospect",
        "Large multi-family, master-metered common areas only so far", "(212) 555-0155",
        "Pitch is the building's common-area account, not individual units.",
        [
            VisitEntry("2026-08-20", "Callback requested", "S. Boone", "Property manager wants a written proposal first."),
        ],
        stage="Proposal Sent",
    ),
    LeadEntry(
        "LD-109", "10 Columbus Cir", "Apt 34A", 40.7685, -73.9822, "Helen Zhao", "Existing customer",
        "Anomaly flagged last month — possible appliance fault, good rapport already", "(646) 555-0134",
        "Already got the proactive anomaly alert in-app. Ask if the fridge issue got fixed.",
        [],
        stage="Qualified",
    ),
    LeadEntry(
        "LD-110", "500 W 30th St", "Apt 7", 40.7514, -74.0031, "Owen Fitzgerald", "Prospect",
        "Hudson Yards new build, referred by a neighbor who enrolled", "(917) 555-0109",
        "Warm referral from LD-107's building. Lead with that.",
        [],
        stage="Qualified",
    ),
    LeadEntry(
        "LD-111", "700 Columbus Ave", "Apt 15B", 40.7902, -73.9686, "Imani Carter", "Lapsed customer",
        "Payment plan defaulted 2025, since paid off — eligible to re-enroll", "(347) 555-0198",
        "Confirm the old balance shows $0 in account lookup before pitching re-enrollment.",
        [
            VisitEntry("2026-05-11", "Not interested", "J. Ortiz", "Still upset about the 2025 collections call."),
            VisitEntry("2026-07-19", "Not home", "J. Ortiz", "Second attempt, no answer."),
        ],
        stage="Contacted",
    ),
    LeadEntry(
        "LD-112", "2109 Broadway", "Apt 3", 40.7799, -73.9814, "Felix Grant", "Prospect",
        "Corner brownstone unit, no account on file", "(212) 555-0167",
        "Doorman building — check in at the desk first, do not walk up.",
        [],
    ),
    LeadEntry(
        "LD-113", "31-10 Queens Blvd", "Apt 6", 40.7477, -73.9367, "Wei Cheng", "Existing customer",
        "High usage, flagged for the demand-response cohort", "(718) 555-0144",
        "Queens side of the territory — bundle with LD-114 on the same walk.",
        [],
    ),
    LeadEntry(
        "LD-114", "45-18 Court Sq", "Apt 11", 40.7473, -73.9445, "Sasha Petrov", "Prospect",
        "New LIC high-rise, leasing office says 60% occupied so far", "(929) 555-0177",
        "Ask leasing office for a lobby table slot rather than door-knocking every unit.",
        [],
    ),
    LeadEntry(
        "LD-115", "88 Schermerhorn St", "Apt 4", 40.6903, -73.9903, "Nadia Hassan", "Existing customer",
        "Downtown Brooklyn, rate plan mismatch flagged", "(718) 555-0155",
        "Brooklyn leg of the territory. Usually a longer walk from base — check the radius before routing here.",
        [
            VisitEntry("2026-08-05", "Callback requested", "S. Boone", "Asked for evening visit, works from home."),
        ],
        stage="Negotiating",
    ),
    LeadEntry(
        "LD-116", "1 Fordham Plaza", "Apt 2", 40.8610, -73.8901, "Carlos Mendez", "Prospect",
        "Bronx territory edge — likely outside the default 10km radius", "(347) 555-0122",
        "Far edge of the assigned territory. Confirm the radius filter before driving out.",
        [],
    ),
    LeadEntry(
        "LD-117", "40 S Broadway", "Apt 8", 40.9312, -73.8987, "Julia Byrne", "Prospect",
        "Yonkers — outside the standard territory radius, reassign if it shows up", "(914) 555-0133",
        "Should not normally appear in a 10km pull from the Manhattan base.",
        [],
    ),
    LeadEntry(
        "LD-118", "144-33 Jamaica Ave", None, 40.7014, -73.7936, "Deshawn Price", "Prospect",
        "Southeast Queens, well outside the default radius", "(718) 555-0111",
        "Only relevant if the rep widens the radius past ~20km.",
        [],
    ),
]

LEADS_BY_ID: dict[str, LeadEntry] = {l.id: l for l in LEADS}
