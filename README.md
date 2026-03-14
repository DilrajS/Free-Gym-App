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
