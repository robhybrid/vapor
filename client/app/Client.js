var newClient = function() {
  // socket id
  // screens
    // videoKeyMap
  // videos
  var client = function(config) {
    console.log('config', config);
  };
  client.screens = [];
  client.screens.push(newScreen);
  client.currentScreen = 0;
  
  return Object.freeze(client);
};
/*
  clients will have screens.
    screens will have videoKeyMaps.
  clients will have patches.
    patches will contain a single videoKeyMap for each screen.
      videoKeyMaps will have a single video to play for each key.
*/