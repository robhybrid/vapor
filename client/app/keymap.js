define(function(require){
  require('jquery-keymap');
  require('jwerty');

  jwerty.key('option+k', function(){
    $('.keymap').toggleClass('hidden');
  });

  var keymap = {};

  return keymap;
});