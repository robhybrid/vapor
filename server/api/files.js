'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var walk    = require('walk');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');

router.get('/', function(req, res) {

  console.log('get files');
  var files   = [];

// Walker options
  var walker  = walk.walk('client/assets/video', { followLinks: false });

  walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    if (stat.name[0] !== '.') {
      files.push(root.replace(/^client\//, '') + '/' + stat.name);

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
