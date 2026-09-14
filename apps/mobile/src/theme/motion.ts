// Shared animation timing so press/entrance motion feels consistent across
// the redesigned components rather than each screen picking its own numbers.
export const motion = {
  press: { duration: 120 },
  entrance: { duration: 260 },
  spring: { damping: 14, stiffness: 180, mass: 0.6 },
} as const;
