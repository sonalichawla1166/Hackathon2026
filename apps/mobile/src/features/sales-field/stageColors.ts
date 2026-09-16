import { ThemeColors } from '@/theme';

/**
 * Colour for a pipeline stage. Takes the active palette rather than reading a
 * module-level one, so the same stage stays legible in light and dark mode
 * (see `outcomeColors.ts`, which works the same way).
 */
export function stageColor(stage: string, colors: ThemeColors): string {
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
      return colors.brandInk;
    case 'Lost':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}
