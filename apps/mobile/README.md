# OneGridAI — Expo app

A concept build of **OneGridAI**, an AI Customer & Grid Intelligence Platform for
utility companies (CG Infinity, Hackathon 2026). This is a faithful React
Native / Expo port of the clickable prototype in
[`project/OneGridAI Platform.dc.html`](../../project/OneGridAI%20Platform.dc.html)
at the repo root — same copy, same numbers/formulas, same BHX design-system
colors and type, rebuilt as a real full-stack app instead of an HTML mockup.

It's one app with **four surfaces**, switchable from the top bar:

| Surface | What it is |
|---|---|
| **Customer app** | 8-screen phone app — home, chat assistant, bill explainer, solar simulator, anomaly alert, program recommendations, outage reporting, payment |
| **Public portal** | Marketing/self-service web page — rate plan comparison, solar calculator, FAQ, outage map |
| **Ops dashboard** | Internal tool — predictive maintenance queue, demand-response targeting |
| **Agent copilot** | Call-center assist tool — live transcript, suggested grounded answers, retrieved sources |

**This app talks to a real backend** — [`apps/backend`](../backend), a Python
FastAPI service that owns all the copy/numbers/formulas (same scripted data
the original prototype used, now served over HTTP). **You need that backend
running before this app will show any data.** See
[`apps/backend/README.md`](../backend/README.md) to start it — short version:

```bash
cd apps/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Prerequisites

- **Node.js 20+** (tested on Node 22) and npm
- The backend running (see above) — reachable at `http://localhost:8000` by default
- For running on a physical phone: the **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- For simulators instead: Xcode (iOS Simulator, macOS only) and/or Android
  Studio (Android Emulator)

## Setup

```bash
cd apps/mobile
npm install
```

## Run it

With the backend already running (see above):

```bash
npx expo start
```

This opens the Expo dev tools in your terminal. From there:

- Press **`i`** to open the iOS Simulator, **`a`** for the Android Emulator, or **`w`** for a web browser
- Or scan the QR code with the **Expo Go** app on your phone (fastest way to see it as a real mobile app)

Platform-specific shortcuts also work directly:

```bash
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Browser
```

Other useful scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
```

### Pointing the app at the backend

The app auto-detects where the backend is:

- **Web / iOS Simulator / Android Emulator**: defaults to `http://localhost:8000`,
  which works out of the box since they share the host machine's network.
- **A physical phone via Expo Go**: auto-detects your dev machine's LAN IP
  from the Metro connection, so it "just works" as long as the backend is
  listening on `0.0.0.0` (the command above already does this) and the phone
  is on the same Wi-Fi network as your computer.
- **Override**: set `EXPO_PUBLIC_API_BASE_URL` before starting Expo if you
  need to point at a different host, e.g.:
  ```bash
  EXPO_PUBLIC_API_BASE_URL=http://192.168.1.23:8000 npx expo start
  ```

If a screen gets stuck on a loading spinner or shows a "Couldn't reach the
backend" message, the backend usually isn't running or isn't reachable at
the URL above — check the terminal running `uvicorn` and try the URL in a
browser (`/health` should return `{"status":"ok"}`).

## What you'll see

- On a **phone or a narrow browser window**, each surface renders full-bleed,
  like a real installed app — that's the intended day-to-day experience,
  and it's what Expo Go / a simulator will show you.
- On a **wide desktop browser window** (roughly â‰¥900px), the Public portal,
  Ops dashboard and Agent copilot surfaces additionally get a decorative
  browser-chrome frame, and the Customer app gets a phone-shaped bezel â€”
  this just reproduces the side-by-side "concept canvas" look of the
  original design file for review purposes. It's cosmetic only; the
  underlying screens are identical either way.
- Everything is interactive and hits the real backend: tap through the
  customer app's tabs, ask the chat assistant a question, drag the
  solar/usage sliders, enrol in a program, submit an outage report, pay a
  bill, click through the maintenance queue and demand-response filters,
  advance the copilot's scripted call, etc. — each of those is a real HTTP
  request to `apps/backend` (see its `API.md` for the full contract).

## Project structure

```
src/
  app/                    expo-router routes (single screen: the surface switcher)
  theme/                  design tokens + the runtime theme
    palettes.ts           the light (cream + CG Infinity amber) and dark
                          (night + dusty pastel) palettes, same keys in both
    ThemeProvider.tsx     <ThemeProvider>, useTheme(), makeStyles()
  api/                    typed client for the backend
    client.ts             base URL resolution + fetch wrapper + session header
    hooks.ts              react-query hooks — screens use these, not fetch() directly
    *.ts                  one module per backend resource, response types in types.ts
  state/store.ts          Zustand store — now UI/navigation state ONLY (which
                          surface/screen, slider positions, checkbox picks,
                          which row is selected). All *data* lives on the
                          backend and is fetched via api/hooks.ts.
  data/content.ts         the one remaining bit of client-side data: demand-
                          response filter chip labels (an index into this
                          list is sent to the backend as a query param)
  components/ui/          shared primitives: Button, Card, Citation, Badge,
                          Chip, RangeSlider, Text styles, ThemeToggle,
                          AppLoader (the one Lottie spinner), PageWash (the
                          page ground), ProfileMenu (account + appearance +
                          sign out), LoadingState/ErrorState
  components/brand/       the CG Infinity logo mark + wordmark
  components/icons/       one 24x24 stroke icon set for the tab bars, plus
                          Google/sun/moon/eye/bell/logout glyphs
  components/navigation/  SurfaceHeader (the top bar every surface shares)
                          and BoldTabBar (the floating bottom tabs)
  components/chrome/      PhoneFrame / BrowserFrame — the adaptive device-chrome
                          wrapper described above
  features/
    auth/                 sign-in screen, Google OAuth — see its README.md
    customer-app/         the 8 phone screens + bottom tab bar
    public-portal/        the marketing/rates page
    ops-dashboard/         predictive maintenance + demand response
    agent-copilot/         call-assist tool
```

If you're changing copy, numbers, or formulas, that all now lives in
`apps/backend` (`app/data.py` + `app/formulas.py`) — see its README/API.md.
The frontend should only need changes when the shape of a response changes
(update the type in `src/api/types.ts` and the relevant screen).

## Theming

The app ships a **light** and a **dark** palette and follows the OS setting
until the user flips the toggle on the sign-in screen (the choice is
remembered per browser on web). Both palettes live in
`src/theme/palettes.ts` and expose identical keys.

Every screen in the app goes through it — there are no literal colours left in
`src/features` or `src/components`. Panels that are plum in *both* modes (the
customer-app header, the ops sidebar, the portal hero) use the shared
`textInverse` / `inverseFill*` / `borderInverse*` tokens rather than raw white,
so one edit re-tints all of them.

In a screen, read the active palette — never import a palette directly, or a
mode switch will not re-render it:

```tsx
import { makeStyles, useTheme } from '@/theme';

// Declare the factory at module scope so the memo holds.
const useStyles = makeStyles((t) => ({ root: { backgroundColor: t.colors.page } }));

export function Screen() {
  const styles = useStyles();
  const { colors } = useTheme();
  ...
}
```

## App chrome

Every surface shares the same three pieces, so they look like one product:

- **`SurfaceHeader`** — CG Infinity's mark, the product name, the screen title
  and the account avatar. Surface-specific buttons (the customer app's alert
  bell) go in via `actions`.
- **`ProfileMenu`** — the avatar opens the one place that holds who you are,
  what workspace you're in, how you signed in, the light/dark switch and sign
  out. A dropdown on a wide screen, a bottom sheet under 620px. Surfaces add
  their own rows with `details`.
- **`BoldTabBar`** — a floating, rounded bottom bar with a fixed-width amber
  capsule on the active tab (fixed width on purpose: a capsule stretched
  across a wide slot reads as a banner, not a selection).

`PageWash` sits behind each shell and paints the same graded ground plus soft
brand haloes as the sign-in screen, so the inside of the app matches the door.

Waiting on the backend always looks the same: `AppLoader` plays
`assets/lottie/loading.json`, and falls back to a plain spinner if the Lottie
runtime cannot mount.

## Signing in

Email + passcode accepts anything (there is no backend auth yet); the
workspace you pick is what starts the session.

**Continue with Google** is a real `expo-auth-session` OAuth flow. It needs an
OAuth client ID from your own Google Cloud project, so out of the box the
button runs a clearly-labelled **demo** sign-in instead. Copy `.env.example`
to `.env` and fill in the IDs to switch it to the real thing —
see [`src/features/auth/README.md`](src/features/auth/README.md).

## Known limitations

- The backend's state is in-memory and resets on restart — there's no
  database. See `apps/backend/README.md`.
- No automated test suite yet — verification so far has been `tsc --noEmit`,
  an `expo export --platform web` build check, and a scripted end-to-end
  browser pass (Playwright) against a live backend, plus manual/visual
  review against the original design.
