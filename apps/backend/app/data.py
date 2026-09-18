"""What's left of the original prototype's scripted content, after each
surface was migrated onto real DB/tariff/RAG data (see README.md's
real-vs-mock table). Everything remaining here is either UI chrome with no
factual claims (nav labels, report-reason checkboxes, payment instrument
labels) or the agent-copilot call transcript — a scripted phone conversation
has no DB row to source it from; only the facts quoted *within* it come
from the real engine (see routers/copilot.py's _real_facts()).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class CallLine:
    who: str
    text: str


CALL: list[CallLine] = [
    CallLine("Maria", "Hi, my bill went up almost thirty dollars and I did not change anything."),
    CallLine("Agent", "Let me pull up your latest read while we talk."),
    CallLine("Maria", "And what is this basic service charge? I was away for two weeks."),
    CallLine("Agent", "Good question, that one is fixed. One moment."),
    CallLine("Maria", "Okay. And if I put solar on the roof, does the credit come back as a cheque?"),
]

OUTAGE_OPTIONS = ["No power at all", "Flickering lights", "Partial outage", "Downed line nearby", "Damaged meter"]

# Support desk, for the portal's Support section — general contact chrome
# with no factual claims about the customer's own account, same category as
# PAY_OPTIONS below. Numbers are in the 555-01xx range reserved for fiction;
# area codes are real Nassau/Suffolk codes to match the rest of the demo.
SUPPORT_CHANNELS = [
    {
        "id": "emergency", "name": "Emergency and gas leaks", "kind": "phone", "urgent": True,
        "detail": "Open 24 hours, every day. Leave the building first, then call.",
        "action": "1-800-490-0025",
    },
    {
        "id": "outage", "name": "Report a power outage", "kind": "phone", "urgent": False,
        "detail": "Automated line, no hold time. Have your account number ready.",
        "action": "1-800-490-0075",
    },
    {
        "id": "billing", "name": "Billing and account help", "kind": "phone", "urgent": False,
        "detail": "Monday to Friday, 8am to 6pm Eastern.",
        "action": "(516) 555-0144",
    },
    {
        "id": "email", "name": "Email support", "kind": "email", "urgent": False,
        "detail": "We reply within two business days.",
        "action": "support@pseg-li.example",
    },
    {
        "id": "office", "name": "Walk-in service centre", "kind": "office", "urgent": False,
        "detail": "Monday to Friday, 9am to 4pm. Bring photo ID and a recent bill.",
        "action": "Hicksville, NY",
    },
]

SUPPORT_TOPICS = [
    {
        "id": "start-stop", "title": "Start, stop or move service",
        "body": "Three business days' notice for a start, two for a stop. You need the service address, a move date and one form of ID. Nothing is prorated on the day itself.",
    },
    {
        "id": "budget", "title": "Level out an uneven bill",
        "body": "Budget billing averages the last twelve months and re-trues every quarter. It changes what you pay each month, not what you owe over the year.",
    },
    {
        "id": "arrears", "title": "Trouble paying a bill",
        "body": "A payment arrangement splits a balance over up to twelve months with no interest. Setting one up stops collection activity while it is kept.",
    },
    {
        "id": "meter", "title": "Question a meter reading",
        "body": "Interval data is available for the last 24 months. If a read looks wrong we will send a technician; there is no charge when the meter is at fault.",
    },
]

PAY_OPTIONS = [
    {"label": "Visa ending 4417", "detail": "Default card"},
    {"label": "Bank account ending 8820", "detail": "No processing fee"},
    {"label": "Split into 3 payments", "detail": "Payment arrangement, no interest"},
]

PORTAL_NAV = ["Rates", "Solar", "Outages", "Support"]
