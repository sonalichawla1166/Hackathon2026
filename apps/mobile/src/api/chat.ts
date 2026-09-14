import { apiGet, apiPost } from './client';
import type { ChatResponse } from './types';

export function getChat(): Promise<ChatResponse> {
  return apiGet<ChatResponse>('/chat');
}

export function postChat(text: string): Promise<ChatResponse> {
  return apiPost<ChatResponse>('/chat', { text });
}
