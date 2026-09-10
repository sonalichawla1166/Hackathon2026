# CG Infinity Hackathon 2026

_Started 2026-09-09 14:00 UTC_

---

## User

Design a mobile app and web app for 
Here is the implementation plan

Here is the Idea

CG Infinity — Hackathon 2026
AI Customer & Grid Intelligence Platform
A unified AI-powered platform for utility companies — transforming customer experience, grid intelligence, and operational efficiency through a single intelligent data layer.
Team Members
Deepak Pal
Divyansh Rampal
Pankaj Singh Negi
Sonali Chawla
Sunil Tetali
 
Problem Statement

Utility companies are sitting on vast amounts of data — smart meters, asset records, tariff documents, customer history — yet continue to operate reactively and inefficiently. The problems are systemic and interconnected:

1.  High Call Center Volume
●	Routine questions (billing, outages, service start/stop) flood call centres, with no intelligent self-service alternative that understands utility-specific context.
2.  Confusing Bills & High Dispute Rates
●	Complex rate structures, tiered pricing, and solar/net metering calculations are poorly communicated, leading to high complaint and dispute rates that consume agent time.
3.  Underused Smart Meter (AMI) Data
●	Advanced Metering Infrastructure generates terabytes of 15-minute interval data. Currently, this data is barely used — anomalies go undetected; efficiency opportunities are missed, and theft/leakage goes unnoticed.
4.  Reactive Equipment Maintenance
●	Equipment failures are addressed after the fact. Without predictive signals, utilities incur 3–5× higher costs per incident compared to planned maintenance, and customer outage experiences worsen.
5.  Poor Program Targeting
●	Energy-efficiency and demand-response programs are marketed broadly instead of matched to customers whose usage patterns make them ideal candidates, resulting in low adoption rates.
6.  Rate Plan Complexity
●	Explaining rate plans, net metering credits, and solar buyback options requires specialist knowledge that call center agents often lack, resulting in inaccurate or inconsistent customer communication.

 
Proposed Solution

One AI Brain. Three Surfaces. Unified Intelligence.
Rather than building isolated tools, we propose a single AI Customer & Grid Intelligence Platform — one shared knowledge and data layer that powers three purpose-built surfaces: a customer mobile/web app, a public-facing website assistant, and an internal operations dashboard.

Core AI Layer
1.  RAG-Based Conversational Assistant
●	Trained on bills, rate plans, tariff documents, net metering/solar buyback rules, outage FAQs, and historical customer data.
●	Answers billing questions, explains rate plans in plain language, and handles service start/stop — deflecting 40–60% of routine call volume.
●	Available as chat/voice on the mobile app and website, and as an Agent-Assist Copilot for call center staff — same knowledge base, different UI.
2.  AMI Anomaly Detection
●	Applies ML models on smart meter interval data to flag unusual consumption patterns.
●	Detects potential water/gas leaks, meter tampering, appliance failures, and energy theft.
●	Proactively notifies customers before the bill arrives, and alerts ops for action.
3.  Predictive Maintenance Engine
●	Combines asset age, sensor signals, maintenance history, and outage records to score equipment failure risk.
●	Generates a prioritized inspection queue for field crews — shifting from reactive to planned maintenance.
4.  Personalized Program Recommendation Engine
●	Analyzes individual usage patterns to match customers with relevant energy-efficiency and demand-response programs.
●	Replaces blanket marketing campaigns with precision outreach, improving enrollment rates.
5.  Bill Explainer & Rate Plan Simulator
●	Plain-language breakdown of any bill component in response to a customer query.
●	'What-if' simulator: compare current rate plan vs. alternatives or model the impact of adding solar panels.
●	Covers net metering credits, solar buyback calculations, and time-of-use tariff scenarios.

Three Surfaces
Surface	Primary Users	Key Features
Customer Mobile App	Residential & Business Customers	Chat assistant, bill explainer, outage reporting, program recommendations, payment assistance, service requests
Public Website Portal	Prospects & Existing Customers	Rate plan comparison, solar simulator, outage map, FAQ chatbot, energy-saving tips
Internal Ops Dashboard	Agents, Field Teams, Managers	Agent-assist copilot, AMI anomaly alerts, predictive maintenance queue, demand-response targeting, ESG reporting
 
Benefits

For Customers
●	Instant, accurate answers to billing and rate plan questions — 24/7, no hold time.
●	Proactive alerts before anomalies become expensive problems (leaks, inefficient appliances).
●	Clear, plain-language bill breakdowns and "what-if" solar/rate plan simulations.
●	Relevant program recommendations matched to their actual usage — not generic marketing.

For Customer Service Agents
●	Agent-Assist Copilot surfaces the right answer from thousands of tariff pages in seconds.
●	Handles routine calls autonomously — agents focus on complex, high-value interactions.
●	Consistent, accurate information regardless of which agent handles the call.

For Operations & Management
●	AMI anomaly dashboard enables proactive intervention before outages or revenue loss.
●	Predictive maintenance queue reduces reactive truck rolls by prioritizing at-risk assets.
●	Demand-response campaign targeting improves grid stability at lower marketing cost.
●	AI-generated ESG and compliance reports reduce manual reporting burden.

For the Business
●	Cost reduction: 40–60% call deflection rate translates directly to headcount efficiency.
●	Revenue protection: anomaly detection reduces unbilled consumption and meter tampering losses.
●	Customer satisfaction: faster resolution, proactive communication, and self-service drive NPS improvement.
●	Competitive differentiation: positions the utility as a modern, data-driven energy partner.

"Utilities have the data. We give it a voice."
One AI layer. Three surfaces.

## Assistant



## User

Answered — surfaces: Customer mobile app, Public website portal, Internal ops dashboard, Agent-assist copilot panel; purpose: Both; screens: Home / account overview, Chat assistant, Bill explainer breakdown, Rate & solar simulator, Anomaly alert (leak detected), Program recommendations, Outage reporting / map, Payments; ops: Predictive maintenance queue, Agent-assist copilot, Demand-response targeting; fidelity: Clickable prototype; data: Real utility names (Con Ed, PSEG-LI); anything: OneGridAI this is the product name

## Assistant

Before I build: a few scope calls.

_[tool: ask_user]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: read_file]_

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

Building the prototype now — customer app + ops dashboard in one DC.

_[tool: dc_write]_

Answers received — building all four surfaces as OneGridAI.

_[tool: dc_write]_

_[tool: delete_file]_

_[tool: ready_for_verification]_

**OneGridAI Platform.dc.html** — four surfaces behind the switcher at top right.

- **Customer app** (iPhone, 8 screens, 5 tabs): home with projected bill and usage bars, chat with citations, bill explainer with plain-language lines, solar simulator, anomaly alert with interval chart, program matches, outage report, payment.
- **Public portal**: usage slider prices all three rate plans live, solar block from a PVWatts-style yield, FAQ accordion with citations, chat panel and outage map.
- **Ops dashboard**: predictive maintenance queue with per-asset risk drivers, plus demand-response targeting where filters resize the cohort, curtailment and incentive cost.
- **Agent copilot**: live transcript, suggested grounded answer, retrieved chunks with scores. "Advance call" steps the call.

Bill, solar and cohort maths are real formulas; chat answers are scripted to the RAG response shape. Not designed yet: ESG reporting, AMI anomaly fleet queue (you didn't pick it, though the mobile alert covers the customer half). Say the word and I'll add either.

## User

Save as standalone HTML: `OneGridAI Platform.dc.html`

## Assistant

_[tool: read_file]_

_[tool: run_script]_

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: present_fs_item_for_download]_

Standalone file is ready — 2.0 MB, fully offline, all four surfaces interactive.

## User

Make the UI/UX more interactive with bottom tab bar icons too

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: copy_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Bottom tab bar now uses the real Brinks Home brand icons (app, chat, document, award, alarm) with a green active indicator that slides in, icon opacity and label color shifting on selection, and an inset press state.

Also added, per the system's motion rules (200ms ease-out, 2px lift, no springs): hover lift and press states on the tappable home cards, hover highlight on the ops asset rows and payment methods, and a 200ms entrance on chat bubbles.

The standalone HTML still reflects the previous version — say the word and I'll rebuild it.

## User

Found issues — fixing…

## Assistant

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Restored the missing header block — eyebrow, "OneGridAI" h1, and the framing line.

