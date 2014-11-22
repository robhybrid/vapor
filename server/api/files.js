'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var walk    = require('walk');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');

// get IP address
var os=require('os');
var ifaces=os.networkInterfaces();
var ip;
Object.keys(ifaces).forEach(function(dev) {
  var alias=0;
  ifaces[dev].forEach(function(details) {
    if (details.family=='IPv4') {
      ip = details.address;
      ++alias;
    }
  });
});

router.get('/', function(req, res) {

  var files   = [];

// Walker options
  var walker  = walk.walk('client/assets/video', { followLinks: false });

  walker.on('file', function(root, stat, next) {

    var staticServer = '';
    staticServer = 'http://' + ip + ':8080/';

    // Add this file to the list of files
    if (stat.name[0] !== '.') {
      files.push(root.replace(/^client\//, staticServer) + '/' + stat.name);

      // generate a thumbnail.
      fs.exists('client/assets/images/thumbs/' + stat.name + '/tn.png', function(exists){
        if (! exists) {
          var proc = new ffmpeg(path.join(root, stat.name))
            .screenshots({
              count: 1,
              size: '100x?',
              timemarks: [ '33%' ]
            }, 'client/assets/images/thumbs/' + stat.name, function(err) {
              if (err) {
                console.error(err);
              }
            });
        }
      });
    }
    next();
  });

  walker.on('end', function() {
    res.json(200, files);
  });
});


module.exports = router;

// TODO: hash all the files and store their thumbnail.
