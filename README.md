# Tasky — todo-app-mobile

React Native (CLI, TypeScript) Android client for the Tasky to-do app. Firebase Authentication
for identity, a NestJS + MongoDB backend for data, Redux Toolkit + RTK Query for state.

> Built from `PRD-MOBILE.md`. See that file for the full specification this app implements.

## Screenshots

Not included in this submission — there is no live Firebase project or emulator session in this
environment to capture them from (see "What you must do before this runs" below). Once you have
completed Firebase setup and run the app, replace this section with a row of four screenshots:
Login · Task list · Add task · Task detail.

## Features (mapped to the assignment brief)

| Requirement | Where |
|---|---|
| Register / log in | `LoginScreen`, `RegisterScreen` — Firebase email+password and Google |
| Add a task (title, description, date-time, deadline, priority) | `TaskFormScreen` |
| Mark complete | Checkbox tap or swipe-right on `TaskCard`, optimistic |
| Delete | Swipe-left, optimistic, with an undo snackbar |
| View list with status | `TaskListScreen` — status/priority/tag/search filters, four sort modes |
| **Bonus: smart sort algorithm** | `src/utils/priorityScore.ts` — see formula below |
| Bonus: tags, search, filters | `FilterSheet`, `SortChips` |
| Bonus: grouped upcoming view | `UpcomingScreen` (Today / Tomorrow / This week / Later) |
| Bonus: pull-to-refresh, skeleton loading, per-filter empty states | `TaskListScreen` |
| Bonus: light + dark theme | `src/theme/tokens.ts`, `ThemeProvider`, toggle on `ProfileScreen` |

## Tech stack

React Native 0.83 (CLI, new architecture) · TypeScript · Redux Toolkit + RTK Query ·
React Navigation (native-stack + bottom-tabs) · `@react-native-firebase/auth` (modular API) ·
`@react-native-google-signin/google-signin` · Reanimated 4 + `react-native-worklets` ·
`react-native-gesture-handler` · `react-native-linear-gradient` · `react-native-vector-icons`.

No axios, no moment, no redux-persist, no UI kit — see PRD-MOBILE.md §3.4 for why.

## Project structure

```
src/
├── app/            App.tsx, store.ts, hooks.ts
├── config/         env.ts — API base URL, web client ID
├── api/            baseApi (token injection + 401 retry), tasksApi, authApi
├── features/
│   ├── auth/       authSlice, useAuthListener, Google sign-in, screens
│   ├── tasks/       uiSlice, screens, components (TaskCard, SwipeableTaskRow, …)
│   └── profile/     ProfileScreen
├── navigation/      RootNavigator (auth stack <-> app stack), AppTabs, types
├── theme/           tokens.ts (both themes), ThemeProvider
├── components/      Button, TextField, Card, Screen, Snackbar, SplashScreen
├── types/           task.types.ts — MIRRORED from the server repo
└── utils/           priorityScore.ts (MIRRORED), date.ts, validation.ts
```

## Setup

```bash
npm install
```

### 1. Fix `JAVA_HOME` (this machine only)

`JAVA_HOME` must point at the JDK root, not its `bin` folder:

```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
```

Open a new terminal afterwards. Every Gradle command silently fails until this is corrected.

### 2. Firebase console setup — required before auth works

This repo ships a **placeholder** `android/app/google-services.json` with obviously fake values
(project id `tasky-placeholder`, fake API keys, fake OAuth client id). It lets the project build,
but no sign-in will actually succeed until you replace it. `google-services.json` is client
configuration, not a secret — committing the real one is normal practice and does not leak
credentials; the file is safe to commit.

1. **console.firebase.google.com** → Add project → disable Google Analytics.
2. **Authentication → Sign-in method** → enable **Email/Password** and **Google**.
3. **Project settings → Your apps → Add app → Android**
   - package name: `com.vinay.todoapp` (must match exactly, or the app crashes at launch with
     `Default FirebaseApp is not initialized`)
   - get the debug SHA-1: `cd android && ./gradlew signingReport` (or `.\gradlew.bat` on Windows),
     copy the SHA1 under `Variant: debug`, add it as a fingerprint on the Android app.
   - download the real `google-services.json` → replace
     `android/app/google-services.json` (same path, same filename).
4. Copy the **Web client ID** — Project settings → Your apps → the auto-created "Web client"
   OAuth entry, or `client[0].oauth_client[]` where `client_type === 3` in the downloaded
   `google-services.json`.

### 3. Fill in the two placeholder values

Both live in **`src/config/env.ts`**, clearly commented:

| Value | Line | Replace with |
|---|---|---|
| `WEB_CLIENT_ID` | `src/config/env.ts`, `export const WEB_CLIENT_ID = 'XXXX...'` | The Web client ID from step 2.4 above |
| `API_BASE_URL` (production branch) | `src/config/env.ts`, `PRODUCTION_API` | Your deployed server's URL, e.g. `https://todo-app-server-xxxx.onrender.com` |

The server is on Render's free tier, which cold-starts after inactivity — the first request after
a period of idleness can take 20–50 seconds. `REQUEST_TIMEOUT_MS` (60s) accounts for this; expect
a visible delay on the first screen that hits the network after the app has been idle.

To point at a local backend during development instead, flip the `__DEV__` branch in
`API_BASE_URL` to `LOCAL_API`, and run `adb reverse tcp:3000 tcp:3000` so the emulator can reach
`localhost:3000`.

### 4. Run

```bash
npx react-native start
# separate terminal
npx react-native run-android
```

## Smart sort algorithm

Requested by the assignment as a bonus: *"Sort with time and deadline and priority mix
algorithm."* Implemented identically on the client (`src/utils/priorityScore.ts`) and the server,
so an optimistic toggle can re-rank the list locally without waiting for a refetch, and the two
orders never drift apart.

```
score = 0.45 × priorityWeight + 0.40 × urgency + 0.15 × overdue
```

- `priorityWeight`: urgent 1.0 · high 0.7 · medium 0.4 · low 0.15
- `urgency`: ramps from 0 to 1.0 as the deadline approaches over a 7-day horizon
- `overdue`: 0 while not overdue, ramps to 1.0 over the first 24h late, then holds — a task
  forgotten for a month cannot outrank one that just became overdue
- a task whose start time hasn't arrived yet is damped ×0.6 (can't be acted on)
- completed tasks always score `-1`, sinking below every active task

Worked example (`now = 2026-09-02T16:00:00Z`):

| Task | Priority | Deadline | Score | Rank |
|---|---|---|---|---|
| Submit assignment | urgent | +2h | 0.45(1.0) + 0.40(0.988) + 0 = **0.845** | 1 |
| Deploy backend | high | −6h (overdue) | 0.45(0.7) + 0.40(1.0) + 0.15(0.25) = **0.753** | 2 |
| Record demo | medium | +2d | 0.45(0.4) + 0.40(0.714) + 0 = **0.466** | 3 |
| Read changelog | low | +30d | 0.45(0.15) + 0 + 0 = **0.068** | 4 |
| Atlas cluster (done) | low | −1d | **−1** | last |

The point: an *overdue high* outranks a *not-yet-due medium*, but a *live urgent* still wins —
behaviour a naive "sort by priority then deadline" gets wrong.

## Release APK

Not built in this submission. Building a signed release requires a keystore only the developer
should hold — see "What you must do before this runs" below for the exact steps.

## Demo GIF

Not included — recording one requires a running app against a real Firebase project, which this
environment does not have.

## What you must do before this runs

This was built without access to a Google account, so the following is intentionally left for
you:

1. **Firebase project.** Create it, enable Email/Password and Google sign-in providers, register
   the Android app with package name `com.vinay.todoapp`, download the real
   `google-services.json`, and place it at `android/app/google-services.json` (overwriting the
   placeholder).
2. **SHA-1 fingerprints.** Add the debug keystore's SHA-1 (from `./gradlew signingReport`) to the
   Firebase Android app now; add the release keystore's SHA-1 later, before distributing a release
   APK — Google Sign-In fails with `DEVELOPER_ERROR` in a build signed by an unregistered
   keystore, silently, with no useful on-screen message.
3. **`WEB_CLIENT_ID`** in `src/config/env.ts` — see table above.
4. **`API_BASE_URL`** in `src/config/env.ts` — point at your deployed `todo-app-server`.
5. **Release keystore**, only when you're ready to build a signed APK:
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \
     -alias tasky-release -keyalg RSA -keysize 2048 -validity 10000
   ```
   Then create `android/keystore.properties` (gitignored — never commit it):
   ```properties
   storeFile=release.keystore
   storePassword=YOUR_STORE_PASSWORD
   keyAlias=tasky-release
   keyPassword=YOUR_KEY_PASSWORD
   ```
   `android/app/build.gradle` already reads this file and falls back to the debug keystore when
   it's absent, so `assembleRelease` builds out of the box for verification even before you've
   generated a real one — but do not distribute that build; it isn't really signed for release.

## Troubleshooting — build-critical workarounds

Two workarounds keep this project buildable. Do not remove either.

**`react-native-screens` patch.** `react-native-screens@4.27.0` (the current latest) does not
compile against React Native 0.83: its Fabric spec files use `React.ComponentRef<>`, but RN
0.83's codegen TypeScript parser only accepts the deprecated `React.ElementRef<>`, so the build
dies at `:react-native-screens:generateCodegenSchemaFromJavaScript`. This is upstream bug
[facebook/react-native#54272](https://github.com/facebook/react-native/issues/54272); there is
no fixed stable release. `patches/react-native-screens+4.27.0.patch` fixes it, and the
`postinstall: patch-package` script in `package.json` reapplies it on every `npm install`.
**Never delete `patches/` or the `postinstall` script** — without them a fresh `npm install`
produces a project that cannot build.

**`react-native-gesture-handler` pinned to `^2.32.0`.** v3 relocates its generated Fabric C++
so the resulting object filename exceeds Windows' 260-character `MAX_PATH`, and `ninja` fails
with `Filename longer than 260 characters`. Moving the project to a shorter path does not fix
it — the source path is embedded twice in the object path. Enabling Windows `LongPathsEnabled`
does not fix it either — the Android SDK bundles ninja 1.10.2, and long-path manifest support
only landed in ninja 1.11. **Do not upgrade `react-native-gesture-handler` to v3** on Windows.

## Testing

```bash
npm test          # Jest — priorityScore, date, validation, TaskCard
npx tsc --noEmit   # TypeScript, zero errors
```

`priorityScore.test.ts` reproduces the seven assertions from `PRD-SERVER.md` §13.2 verbatim —
the same scoring function is exercised on both repos.
