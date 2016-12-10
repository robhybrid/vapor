// preloads video onto local filesystem in chromeApp.

define(function(require){
  var $ = require('jquery');
  function Transloader() {

    var loader = {
      loadAll: Transloader.loadAll
    };

    $('body').on('click', function() {
      chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(entry) {
        loader['videoDirectory'] = entry;
        chrome.fileSystem.isWritableEntry(entry, function(isWritable){
          if (isWritable) {
            chrome.fileSystem.getDisplayPath(entry, function(path){
              localStorage['localVideoDirectoryPath'] = path;
            });
            if (loader.files) {
              loader.loadAll(entry, files);
            }
          } else {
            alert('directory is not writable.');
          }
        });
      });
    });

    return loader;
  };

  Transloader.loadAll = function(directory, files){

  };


  return Object.freeze(Transloader);
});