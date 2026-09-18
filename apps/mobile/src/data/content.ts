// Almost all mock content now lives on the backend (see
// apps/backend/API.md) and is fetched via src/api/*. This file only keeps
// the one thing that's genuinely client-side: the demand-response filter
// chip labels, since "which filters are checked" (an array of indices into
// this list) is UI state sent to the backend as a query param, not data
// fetched from it.

export interface DrFilter {
  label: string;
}

// Order must match apps/backend/app/real/dr_engine.py's FILTER_LABELS — each
// is a real boolean computed from a customer's actual AMI-derived usage
// features (program-eligibility fit), not an invented segment.
export const DR_FILTERS: DrFilter[] = [
  { label: 'EV / overnight charging' },
  { label: 'High peak-hour usage' },
  { label: 'Over 1,000 kWh a month' },
  { label: 'Summer-peaking load' },
  { label: 'High seasonal swing (AC/heat)' },
];
