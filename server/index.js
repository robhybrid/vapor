require('dotenv').config();
require('dotenv').config({ path: './.env.local' });
const walk    = require('walk');
const express = require('express');
const cors = require('cors');
const getIpAddress = require('./getIpAddress');
const sockets = require('./sockets');
const socketIo = require('socket.io');
const s3 = require('./s3');

console.log('local MEDIA_ROOT', process.env.MEDIA_ROOT);
console.log('S3_WEB_ROOT', process.env.S3_WEB_ROOT)

const http = require('http');

const API_PORT = process.env.PORT || 3001;
const app = express();

const server =  http.Server(app);
const io = socketIo(server);
sockets(io);

app.use(cors());
const router = express.Router();

const mediaRoot = process.env.MEDIA_ROOT || './media';
app.use(express.static('./build'));
app.use('/media', express.static(mediaRoot));

router.get('/media', async (req, res) => {
  let files = [];
  console.log('media');
  try {
    if (process.env.S3_WEB_ROOT) {
      console.log('getFiles');
      files = await s3.getFiles();
    } else {
      files = await walkLocalFiles();
    }
    res.status(200).json(files);
  } catch(e) {
    console.error(e);
    res.status(500).json({error: e})
  }

});

function walkLocalFiles() {
  console.log('walkLocalFiles');
  const files   = [];
  const validFilePattern = /^[^.].*\.(m4v|mov|webm|mp4|gif|jpg|png)$/i;
  const staticServer = 'http://' + ( getIpAddress() || 'localhost' )  + `:${API_PORT}/media`;

  // Walker options
  const walker  = walk.walk(mediaRoot, { followLinks: false });
  return new Promise((resolve, reject) => {
    walker.on('file', function(root, stat, next) {
      // Add this file to the list of files
      if (stat.name.match(validFilePattern)) {
        files.push(encodeURI(
          root.replace(mediaRoot, staticServer) + '/' + stat.name)
        );
        // generate a thumbnail.
        
        // fs.exists(thubsDir + stat.name + '/tn.png', function(exists){
        //   if (! exists) {
        //     generateThumbnail({
        //       name: stat.name, 
        //       root: root
        //     });
        //   }
        // });
      }
      next();
    });

    walker.on('end', function() {
      resolve(files);
    });
  });
}

app.use('/api', router);
server.listen(API_PORT, () => console.log(`SERVER LISTENING ON PORT ${API_PORT} with web sockets`));