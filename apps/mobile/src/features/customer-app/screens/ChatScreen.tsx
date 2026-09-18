import React from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useUiStore } from '@/state/store';
import { useChat, useSendChat } from '@/api/hooks';
import { makeStyles, useTheme, useIsDesktop } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { CitationRow } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { MicIcon } from '@/components/icons/TabIcons';
import { hiddenScrollbar } from '@/components/ui/scroll';
import { useVoiceInput } from './useVoiceInput';

export function ChatScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const desktop = useIsDesktop();
  const draft = useUiStore((s) => s.draft);
  const setDraft = useUiStore((s) => s.setDraft);

  const { data, isPending, isError, error, refetch } = useChat();
  const sendChat = useSendChat();

  // Voice is web-only: the browser's built-in SpeechRecognition. Native
  // recording (expo-av, then expo-audio) both hit "Cannot find native
  // module" in this Expo Go build — that native module simply isn't bundled
  // for this SDK, so there's no JS-only fix. Dictates straight into a sent
  // message; `voice.supported` is only ever true on web (see useVoiceInput),
  // so this is a no-op everywhere else and the button explains why.
  const voice = useVoiceInput((transcript) => send(transcript));

  const send = (text: string) => {
    if (!text.trim()) return;
    setDraft('');
    sendChat.mutate(text);
  };

  const handleMicPress = () => {
    if (!voice.supported) {
      Alert.alert(
        'Voice input unavailable',
        'Voice input works in a web browser — run the app with `npm run web`. Native recording isn\'t available in this build.'
      );
      return;
    }
    if (voice.listening) voice.stop();
    else voice.start();
  };

  if (isPending) return <LoadingState label="Loading conversation…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const bubbles = (
    <>
      {data.log.map((m, i) => {
        const isUser = m.role === 'user';
        return (
          <View
            style={[styles.bubbleWrap, desktop && styles.bubbleWrapDesktop, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}
            key={i}
          >
            <View style={[styles.bubble, { backgroundColor: isUser ? colors.primary : colors.surfaceMuted }]}>
              <Text style={[styles.bubbleText, { color: isUser ? colors.textInverse : colors.textHeading }]}>{m.text}</Text>
            </View>
            {!!m.cites && <View style={{ marginTop: 7 }}><CitationRow items={m.cites} /></View>}
          </View>
        );
      })}
      {sendChat.isPending && <Text style={styles.thinking}>Searching tariff documents…</Text>}
    </>
  );

  const mic = (
    <Pressable
      style={[styles.micBtn, voice.listening && styles.micBtnActive]}
      onPress={handleMicPress}
      disabled={sendChat.isPending}
      accessibilityRole="button"
      accessibilityLabel={voice.listening ? 'Stop listening' : 'Speak your question'}
    >
      <MicIcon size={16} color={voice.listening ? colors.onCta : colors.textMuted} />
    </Pressable>
  );

  const field = (
    <>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={voice.listening ? 'Listening…' : 'Type a question'}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        onSubmitEditing={() => send(draft)}
        returnKeyType="send"
        editable={!sendChat.isPending}
      />
      <Pressable style={styles.sendBtn} onPress={() => send(draft)} disabled={sendChat.isPending}>
        <Text style={styles.sendGlyph}>↑</Text>
      </Pressable>
    </>
  );

  const suggestions =
    data.suggestions.length > 0 ? (
      <View style={[styles.suggestions, desktop && styles.suggestionsDesktop]}>
        {data.suggestions.map((q) => (
          <Pressable key={q} style={styles.suggestionBtn} onPress={() => send(q)} disabled={sendChat.isPending}>
            <Text style={styles.suggestionText}>{q}</Text>
          </Pressable>
        ))}
      </View>
    ) : null;

  // Desktop: the conversation owns a scroller of its own and the composer is
  // welded to the floor of the pane, so typing never chases the last reply
  // down the page. The mic sits outside the field at the far left, clear of
  // the text, with send at the opposite end.
  if (desktop) {
    return (
      <View style={styles.wrapDesktop}>
        <ScrollView style={styles.logScroll} contentContainerStyle={styles.logContent} {...hiddenScrollbar}>
          {bubbles}
        </ScrollView>

        <View style={styles.composerDesktop}>
          <View style={styles.composerInner}>
            {suggestions}
            <View style={styles.composerRow}>
              {mic}
              <View style={[styles.inputRow, styles.inputRowFill]}>{field}</View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.log}>{bubbles}</View>

      <View style={styles.composer}>
        {suggestions}
        <View style={styles.inputRow}>
          {mic}
          {field}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { flexGrow: 1, minHeight: 500 },
  wrapDesktop: { flex: 1, minHeight: 0 },
  log: { padding: 16, paddingTop: 16, paddingBottom: 6, gap: 13 },
  // `minHeight: 0` lets the scroller shrink inside the flex column instead of
  // being sized by its content and pushing the composer off the bottom.
  logScroll: { flex: 1, minHeight: 0 },
  logContent: { width: '100%', maxWidth: 860, alignSelf: 'center', paddingTop: 4, paddingBottom: 16, gap: 13 },
  bubbleWrap: { maxWidth: '88%' },
  bubbleWrapDesktop: { maxWidth: 620 },
  bubble: { borderRadius: 5.4, paddingHorizontal: 14, paddingVertical: 12 },
  bubbleText: { fontFamily: fontFamily.body, fontSize: 13.5, lineHeight: 20 },
  thinking: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, paddingHorizontal: 4, paddingVertical: 6 },
  composer: { padding: 16, paddingTop: 8, backgroundColor: t.colors.surfaceCard, gap: 10 },
  composerDesktop: {
    padding: 18,
    backgroundColor: t.colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    marginTop: 14,
  },
  composerInner: { width: '100%', maxWidth: 860, alignSelf: 'center', gap: 10 },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  suggestions: { gap: 6 },
  // Stacked prompts waste a wide composer; a wrapping row reads as chips.
  suggestionsDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  inputRowFill: { flex: 1 },
  input: { flex: 1, fontFamily: fontFamily.body, fontSize: 13.5, color: t.colors.textHeading, backgroundColor: 'transparent', minWidth: 0 },
  micBtn: { flex: 0, width: 34, height: 34, borderRadius: 5, backgroundColor: t.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { backgroundColor: t.colors.danger },
  sendBtn: { flex: 0, width: 34, height: 34, borderRadius: 5, backgroundColor: t.colors.cta, alignItems: 'center', justifyContent: 'center' },
  sendGlyph: { fontFamily: fontFamily.bodyBold, fontSize: 16, color: t.colors.onCta },
}));
