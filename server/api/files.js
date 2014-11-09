'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');
var walk    = require('walk');


router.get('/', function(req, res) {

  console.log('get files');
  var files   = [];

// Walker options
  var walker  = walk.walk('client/assets/video', { followLinks: false });

  walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    if (stat.name[0] !== '.') {
      files.push(root.replace(/^client\//, '') + '/' + stat.name);
    }
    next();
  });

  walker.on('end', function() {
    res.json(200, files);
  });
});


module.exports = router;

// TODO: hash all the files and store their thumbnail.
