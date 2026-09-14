import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useChat, useSendChat } from '@/api/hooks';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CitationRow } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function AskPanel() {
  const { data, isPending, isError, error, refetch } = useChat();
  const sendChat = useSendChat();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.headerTitle}>Ask OneGridAI</Text>
      </View>

      {isPending && <LoadingState label="Loading conversation…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && (
        <>
          <View style={styles.log}>
            {data.log.map((m, i) => {
              const isUser = m.role === 'user';
              return (
                <View key={i} style={[styles.bubbleWrap, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
                  <View style={[styles.bubble, { backgroundColor: isUser ? 'rgba(255,255,255,0.12)' : colors.accent }]}>
                    <Text style={styles.bubbleText}>{m.text}</Text>
                  </View>
                  {!isUser && !!m.cites && (
                    <View style={{ marginTop: 6 }}>
                      <CitationRow items={m.cites} onInverse />
                    </View>
                  )}
                </View>
              );
            })}
            {sendChat.isPending && <Text style={styles.thinking}>Searching tariff documents…</Text>}
          </View>

          {data.suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {data.suggestions.map((s) => (
                <Pressable
                  key={s}
                  style={styles.suggestionBtn}
                  onPress={() => sendChat.mutate(s)}
                  disabled={sendChat.isPending}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: radius.md, overflow: 'hidden' },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.ctaHover },
  headerTitle: { fontFamily: fontFamily.heading, fontSize: 13.5, color: '#fff' },
  log: { paddingHorizontal: 18, paddingVertical: 16, gap: 11 },
  bubbleWrap: { maxWidth: '92%' },
  bubble: { borderRadius: radius.md, paddingHorizontal: 13, paddingVertical: 11 },
  bubbleText: { fontFamily: fontFamily.body, fontSize: 12.5, lineHeight: 19, color: '#fff' },
  thinking: { fontFamily: fontFamily.body, fontSize: 12, color: 'rgba(255,255,255,0.73)', paddingHorizontal: 4 },
  suggestions: { paddingHorizontal: 18, paddingBottom: 18, gap: 6 },
  suggestionBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  suggestionText: { fontFamily: fontFamily.body, fontSize: 11.5, lineHeight: 16, color: '#fff' },
});
