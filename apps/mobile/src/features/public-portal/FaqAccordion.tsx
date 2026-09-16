import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { usePortalFaqs } from '@/api/hooks';
import { makeStyles, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Citation } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function FaqAccordion() {
  const styles = useStyles();
  const faqOpen = useUiStore((s) => s.faqOpen);
  const toggleFaq = useUiStore((s) => s.toggleFaq);
  const { data, isPending, isError, error, refetch } = usePortalFaqs();

  return (
    <View>
      <Text style={styles.heading}>Common Questions</Text>
      {isPending && <LoadingState label="Loading FAQs…" />}
      {isError && <ErrorState error={error} onRetry={refetch} />}
      {data && (
        <View style={styles.list}>
          {data.faqs.map((f, i) => {
            const open = faqOpen === i;
            return (
              <View key={f.q} style={styles.item}>
                <Pressable style={styles.row} onPress={() => toggleFaq(i)}>
                  <Text style={styles.question}>{f.q}</Text>
                  <Text style={[styles.chevron, open && styles.chevronOpen]}>{'›'}</Text>
                </Pressable>
                {open && (
                  <View style={styles.answerWrap}>
                    <Text style={styles.answer}>{f.a}</Text>
                    <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                      <Citation label={f.cite} />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  heading: { fontFamily: fontFamily.heading, fontSize: 20, lineHeight: 25, color: t.colors.textHeading, marginBottom: 14 },
  list: { gap: 1, backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, overflow: 'hidden' },
  item: { backgroundColor: t.colors.surfaceCard },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  question: { flex: 1, fontFamily: fontFamily.heading, fontSize: 14.5, lineHeight: 19, color: t.colors.textHeading },
  chevron: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: t.colors.accent },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  answerWrap: { paddingHorizontal: 20, paddingBottom: 18 },
  answer: { fontFamily: fontFamily.body, fontSize: 13.5, lineHeight: 20, color: t.colors.textMuted },
}));
