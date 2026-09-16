// Colour tokens now live in `palettes.ts`, which defines a full light and a
// full dark palette behind one shape. Nothing should import a palette
// directly — read the active one with `useTheme()` from `ThemeProvider.tsx`
// so a mode switch actually re-renders.
export * from './palettes';
