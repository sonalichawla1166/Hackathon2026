import { API_BASE_URL, getSessionId } from './client';
import type { VoiceAskResult } from './types';

/**
 * Upload a recorded audio file to POST /voice/ask. Not currently called from
 * any screen — native audio recording isn't available in this Expo Go
 * build (see ChatScreen.tsx), so there's no in-app way to produce the
 * audioUri this expects. The backend endpoint itself still works; wire this
 * back up if a dev build with native recording becomes available.
 */
export async function postVoiceAsk(audioUri: string): Promise<VoiceAskResult> {
  const formData = new FormData();
  formData.append('audio', { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' } as any);
  const resp = await fetch(`${API_BASE_URL}/voice/ask`, {
    method: 'POST',
    headers: { 'X-Session-Id': getSessionId() },
    body: formData,
  });
  if (!resp.ok) throw new Error(`Voice ask failed: ${resp.status}`);
  return resp.json();
}
