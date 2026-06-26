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

## Controls

Press `option` (Alt) to open the control panel and help. Full keyboard shortcuts are listed in the in-app help screen.

## Stack

- React 18 + Vite
- Zustand for state
- Express + Socket.IO for media API and multi-client sync
