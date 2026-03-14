# Free-Gym-App

Minimal local workout tracker built with React + Vite.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## What changed in v2

- simplified home screen with one question
- template-based workout start flow
- set-by-set logging
- inline last-time history for each exercise
- automatic rest timer after completed set entry
- history, charts, and JSON backup tabs
- local-only storage using `localStorage`

## Notes

- Data is stored entirely in the browser.
- Export a backup JSON regularly if you care about preserving entries across devices.
- Exercise reorder in this version uses simple up/down controls for stability on mobile. A full touch drag system can be added next.

## Save On iPhone

To use Free-Gym-App like an app on iPhone:

1. Open the site in Safari.
2. Tap the Share button.
3. Scroll down and tap `Add to Home Screen`.
4. Rename it if you want, then tap `Add`.

After that, the app icon will appear on your home screen and open in its own window like a regular app.
