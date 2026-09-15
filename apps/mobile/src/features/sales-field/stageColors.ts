import { colors } from '@/theme';

export function stageColor(stage: string): string {
  switch (stage) {
    case 'New':
      return colors.textMuted;
    case 'Contacted':
      return colors.accent;
    case 'Qualified':
      return colors.surfaceAccent;
    case 'Proposal Sent':
      return colors.warning;
    case 'Negotiating':
      return colors.primary;
    case 'Won':
      return colors.cta;
    case 'Lost':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}
