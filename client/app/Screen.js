// global controls
jwerty.key('ctrl+s', function() {
  $('#main').toggleClass('show-screens');
  // display white on all screens, or test pattern.
});

for (var i=0; i<10; i++) {
  jwerty.key('ctrl+' + i, function() {
    // if the current screen is un-modified return
    // if there is not screen for this index, create it
    // select the screen, or transmit screen-change.
  });
}

var newScreen = function() {

  var screen = function(config){
    console.log('config', config);
  };

  return Object.freeze(screen);
};