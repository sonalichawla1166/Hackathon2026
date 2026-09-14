import { apiGet, apiPost } from './client';
import type { ProgramsResult } from './types';

export function getPrograms(): Promise<ProgramsResult> {
  return apiGet<ProgramsResult>('/programs/recommend');
}

export function toggleEnroll(index: number): Promise<ProgramsResult> {
  return apiPost<ProgramsResult>(`/programs/${index}/enroll`);
}
