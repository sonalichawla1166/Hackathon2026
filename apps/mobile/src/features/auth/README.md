Written for: developers setting up this repo.

# Sign-in

The sign-in surface lives in `LoginScreen.tsx`. It supports two paths:

1. **Email + passcode** — no backend auth exists yet, so any non-empty pair is
   accepted. Picking a workspace is what actually starts the session.
2. **Continue with Google** — a real OAuth flow via `expo-auth-session`.
   Until an OAuth client ID is configured the button reads **"Continue with
   Google (demo)"** and signs in as `demo.agent@cginfinity.com`, with a note on
   screen saying no Google account is connected. That keeps the flow
   demonstrable; it is never presented as a real Google account.

Either path still requires a workspace (`Customer app`, `Public portal`,
`Ops dashboard`, `Agent copilot`, `Field sales`) before the session starts.

## Enabling Google sign-in

A client ID has to come from your own Google Cloud project — it is tied to
your account, your bundle ID and your redirect URIs, so it cannot be created
for you. Everything else is already wired up. To switch the demo button over
to real Google sign-in:

1. Open the [Google Cloud console](https://console.cloud.google.com/apis/credentials)
   and create an OAuth 2.0 **Client ID** for each platform you need:

   | Platform | Client type    | Required field                                                   |
   | -------- | -------------- | ---------------------------------------------------------------- |
   | Web      | Web application| Authorised redirect URI: `https://auth.expo.io/@<expo-username>/onegridai` and, for local web, `http://localhost:8081` |
   | iOS      | iOS            | Bundle ID from `app.json`                                        |
   | Android  | Android        | Package name from `app.json` + your signing SHA-1                |

2. Put the IDs in **either** place — `app.json` wins if both are set.

   `app.json`:

   ```json
   "extra": {
     "googleAuth": {
       "web": "xxxx.apps.googleusercontent.com",
       "ios": "xxxx.apps.googleusercontent.com",
       "android": "xxxx.apps.googleusercontent.com"
     }
   }
   ```

   or a `.env` file next to `package.json` (copy `.env.example`, which is
   git-ignored):

   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```

3. Restart the dev server (`npm start`). Config is read once at startup.

Client IDs are public in this flow — it uses PKCE and there is no client
secret, so shipping them in the bundle is expected. Do not add a client secret
to this app.

## Theming

Colours come from `src/theme/palettes.ts` (one light and one dark palette with
identical keys). Read them with `useTheme()`, or build a stylesheet with
`makeStyles((t) => ({ ... }))` declared at module scope. Never import a palette
directly inside a screen — a mode switch would not re-render it.

The user's choice is stored per browser on web and defaults to the OS setting
everywhere. The toggle is `src/components/ui/ThemeToggle.tsx`.
