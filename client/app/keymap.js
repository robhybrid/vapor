define(function(require){
  require('jquery-keymap');
  require('jwerty');
  var _ = require('underscore');

  jwerty.key('option+k', function(){
    $('.keymap').toggleClass('hidden');
  });

  var $keymap = $('.keymap').keymap({
    layout: 'mac_laptop'
  });

  var keymap = {
    $el: $('.keymap').keymap({
      layout: 'mac_laptop'
    }),
    render: function(videoKeyMap) {
      keymap.$el.keymap({
        type: 'reset'
      });
      videoKeyMap.forEach(function($video, key) {
        // TODO.
      });
    },
    setVideoKey: function($video, key) {
      var _key = key;
      switch (key) {
        case 'comma':
          _key = ',';
          break;
        case 'forward-slash':
          _key = '/';
          break;
      };
      $('[data-value="' + _key + '"]', keymap.$el)
        .css('background-image', 'url("/assets/images/thumbs/' +
          encodeURI(_.last($video.attr('src').split('/')))
          + '/tn.png")');
    }
  };

  return keymap;
});