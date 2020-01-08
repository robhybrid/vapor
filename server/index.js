require('dotenv').config();
const walk    = require('walk');
const express = require('express');
const cors = require('cors');
const getIpAddress = require('./getIpAddress');
const sockets = require('./sockets');
const socketIo = require('socket.io');

const http = require('http');

const API_PORT = process.env.PORT || 3001;
const app = express();

const server =  http.Server(app);
const io = socketIo(server);
sockets(io);

app.use(cors());
const router = express.Router();

const mediaRoot = process.env.MEDIA_ROOT || './media';

app.use('/media', express.static(mediaRoot));

router.get('/media', walkLocalFiles);
function walkLocalFiles(req, res) {
  const files   = [];
  const validFilePattern = /\.(m4v|mov|webm|mp4|gif|jpg|png)$/i;
  const staticServer = 'http://' + ( getIpAddress() || 'localhost' )  + `:${API_PORT}/media`;

  // Walker options
  const walker  = walk.walk(mediaRoot, { followLinks: false });

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
    res.status(200).json(files);
  });
}


app.use('/api', router);

// app.listen(API_PORT, () => console.log(`SERVER LISTENING ON PORT ${API_PORT}`));
server.listen(API_PORT, () => console.log(`SERVER LISTENING ON PORT ${API_PORT} with websockets`));