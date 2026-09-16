import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { useChat, useSendChat } from '@/api/hooks';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CitationRow } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function ChatScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const draft = useUiStore((s) => s.draft);
  const setDraft = useUiStore((s) => s.setDraft);

  const { data, isPending, isError, error, refetch } = useChat();
  const sendChat = useSendChat();

  if (isPending) return <LoadingState label="Loading conversation…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const send = (text: string) => {
    if (!text.trim()) return;
    setDraft('');
    sendChat.mutate(text);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.log}>
        {data.log.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <View key={i} style={[styles.bubbleWrap, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.bubble, { backgroundColor: isUser ? colors.primary : colors.surfaceMuted }]}>
                <Text style={[styles.bubbleText, { color: isUser ? colors.textInverse : colors.textHeading }]}>{m.text}</Text>
              </View>
              {!!m.cites && <View style={{ marginTop: 7 }}><CitationRow items={m.cites} /></View>}
            </View>
          );
        })}
        {sendChat.isPending && <Text style={styles.thinking}>Searching tariff documents…</Text>}
      </View>

      <View style={styles.composer}>
        {data.suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {data.suggestions.map((q) => (
              <Pressable key={q} style={styles.suggestionBtn} onPress={() => send(q)} disabled={sendChat.isPending}>
                <Text style={styles.suggestionText}>{q}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a question"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            onSubmitEditing={() => send(draft)}
            returnKeyType="send"
            editable={!sendChat.isPending}
          />
          <Pressable style={styles.sendBtn} onPress={() => send(draft)} disabled={sendChat.isPending}>
            <Text style={styles.sendGlyph}>↑</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { flexGrow: 1, minHeight: 500 },
  log: { padding: 16, paddingTop: 16, paddingBottom: 6, gap: 13 },
  bubbleWrap: { maxWidth: '88%' },
  bubble: { borderRadius: 5.4, paddingHorizontal: 14, paddingVertical: 12 },
  bubbleText: { fontFamily: fontFamily.body, fontSize: 13.5, lineHeight: 20 },
  thinking: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, paddingHorizontal: 4, paddingVertical: 6 },
  composer: { padding: 16, paddingTop: 8, backgroundColor: t.colors.surfaceCard, gap: 10 },
  suggestions: { gap: 6 },
  suggestionBtn: { backgroundColor: t.colors.surfaceMuted, borderRadius: 3.2, paddingHorizontal: 10, paddingVertical: 8 },
  suggestionText: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textHeading },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: t.colors.surfaceMuted,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  input: { flex: 1, fontFamily: fontFamily.body, fontSize: 13.5, color: t.colors.textHeading, backgroundColor: 'transparent', minWidth: 0 },
  sendBtn: { flex: 0, width: 34, height: 34, borderRadius: 5, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center' },
  sendGlyph: { fontFamily: fontFamily.bodyBold, fontSize: 16, color: t.colors.onCta },
}));
