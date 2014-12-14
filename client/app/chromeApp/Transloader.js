define(function(require){

  var $ = require('jquery');


  function Transloader() {

    var loader = {
      loadAll: Transloader.loadAll
    };

    $('body').on('click', function() {
      chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(entry) {
        //console.log('arguments', arguments);
        loader['videoDirectory'] = entry;
        chrome.fileSystem.isWritableEntry(entry, function(isWritable){
          console.log('isWritable', isWritable);
          if (isWritable) {
            chrome.fileSystem.getDisplayPath(entry, function(path){
              console.log('displayPath', arguments);
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