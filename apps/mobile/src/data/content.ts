// Almost all mock content now lives on the backend (see
// apps/backend/API.md) and is fetched via src/api/*. This file only keeps
// the one thing that's genuinely client-side: the demand-response filter
// chip labels, since "which filters are checked" (an array of indices into
// this list) is UI state sent to the backend as a query param, not data
// fetched from it.

export interface DrFilter {
  label: string;
}

export const DR_FILTERS: DrFilter[] = [
  { label: 'EV owners' },
  { label: 'Smart thermostat on record' },
  { label: 'Over 1,000 kWh a month' },
  { label: 'Central AC detected' },
  { label: 'Past event participants' },
];
