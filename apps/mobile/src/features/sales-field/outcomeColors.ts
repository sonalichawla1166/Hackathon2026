import { colors } from '@/theme';

export function outcomeColor(outcome: string | null): string {
  switch (outcome) {
    case 'Sold':
      return colors.cta;
    case 'Callback requested':
      return colors.accent;
    case 'Not interested':
    case 'Do not contact':
      return colors.danger;
    case 'Not home':
      return colors.textMuted;
    default:
      return colors.textMuted;
  }
}
