import { apiGet } from './client';
import type { PortalFaqs, PortalNav, PortalRates, PortalSolar, PortalSupport } from './types';

export function getPortalNav(): Promise<PortalNav> {
  return apiGet<PortalNav>('/portal/nav');
}

export function getPortalRates(usage: number): Promise<PortalRates> {
  return apiGet<PortalRates>(`/portal/rates?usage=${encodeURIComponent(usage)}`);
}

export function getPortalSolar(kw: number): Promise<PortalSolar> {
  return apiGet<PortalSolar>(`/portal/solar?kw=${encodeURIComponent(kw)}`);
}

export function getPortalFaqs(): Promise<PortalFaqs> {
  return apiGet<PortalFaqs>('/portal/faqs');
}

export function getPortalSupport(): Promise<PortalSupport> {
  return apiGet<PortalSupport>('/portal/support');
}
