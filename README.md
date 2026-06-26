# Vapor 2

Live visual media player for VJ performance. Press letter keys to trigger clips, tap to beat for autopilot, and sync across multiple screens via WebSockets.

Demo: https://vjapp.io

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API server runs on port 3001.

## Media

Supported formats: `m4v`, `mov`, `webm`, `mp4`, `gif`, `jpg`, `png`

Place clips in a `media/` folder at the project root, or set a custom path:

```bash
MEDIA_ROOT=/path/to/my/folder
```

For S3/CloudFront, set `S3_WEB_ROOT` to your bucket index URL. Files must live under a `video/` prefix.

## Production

```bash
npm run build
npm start
```

Serves the built React app and API from port 3001.

## Low-cost deployment (Render free tier)

This repo includes a `render.yaml` blueprint for cheap hosting.

1. Push this repo to GitHub.
2. In Render, create a **Blueprint** service from the repo.
3. Use `plan: free` (already set in `render.yaml`).
4. Add/update env vars (or use defaults from `.env.example`):
   - `S3_WEB_ROOT=https://dk1ug69h7ixee.cloudfront.net/`
   - `MEDIA_ROOT` (optional; only if you want local media files)

Notes:
- Render free services sleep after inactivity, so the first load after idle is slow.
- Socket sync works once the service wakes up.
- Cost is $0 for low-traffic/demo use.

## Controls

Press `option` (Alt) to open the control panel and help. Full keyboard shortcuts are listed in the in-app help screen.

## Stack

- React 18 + Vite
- Zustand for state
- Express + Socket.IO for media API and multi-client sync
