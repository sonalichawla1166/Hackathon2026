import { ThemeColors } from '@/theme';

export type LeadOutcome = string | null;

/**
 * Colour for a door-knock outcome. Takes the active palette rather than
 * reading a module-level one, so the same outcome stays legible in light and
 * dark mode.
 */
export function outcomeColor(outcome: LeadOutcome, colors: ThemeColors): string {
  switch (outcome) {
    case 'Sold':
      return colors.success;
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
