import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import walk from 'walk';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import * as s3 from './s3.js';

loadEnv({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('local MEDIA_ROOT', process.env.MEDIA_ROOT);
console.log('S3_WEB_ROOT', process.env.S3_WEB_ROOT);

const API_PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (client) => {
  console.log('Client connected...');
  client.on('message', (data) => {
    client.broadcast.emit('message', data);
  });
});

app.use(cors());

const mediaRoot = process.env.MEDIA_ROOT || path.join(rootDir, 'media');
app.use('/media', express.static(mediaRoot));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(rootDir, 'dist')));
}

const router = express.Router();

router.get('/media', async (_req, res) => {
  try {
    const files = process.env.S3_WEB_ROOT
      ? await s3.getFiles()
      : await walkLocalFiles();
    res.status(200).json(files);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

function walkLocalFiles() {
  const files = [];
  const validFilePattern = /^[^.].*\.(m4v|mov|webm|mp4|gif|jpg|png)$/i;
  const walker = walk.walk(mediaRoot, { followLinks: false });

  return new Promise((resolve, reject) => {
    walker.on('file', (root, stat, next) => {
      if (stat.name.match(validFilePattern)) {
        const relativeRoot = path.relative(mediaRoot, root);
        const relativePath = path.join(relativeRoot, stat.name).replace(/\\/g, '/');
        files.push(
          encodeURI(`/media/${relativePath}`)
        );
      }
      next();
    });
    walker.on('errors', reject);
    walker.on('end', () => resolve(files));
  });
}

app.use('/api', router);

if (process.env.NODE_ENV === 'production') {
  app.use((_req, res) => {
    res.sendFile(path.join(rootDir, 'dist', 'index.html'));
  });
}

server.listen(API_PORT, () => {
  console.log(`SERVER LISTENING ON PORT ${API_PORT} with web sockets`);
});
