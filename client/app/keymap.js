define(function(require){
  require('jquery-keymap');
  require('jwerty');
  var _ = require('underscore');
  var Screens = require('Screens');

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
    render: function(options) {
      keymap.$el.keymap({
        type: 'reset'
      });
      var videoKeyMap = options.videoKeyMap || {};
      var banks = options.banks || [];
      keymap.renderBanks(banks);
      Object.keys(videoKeyMap).forEach(function(key) {
        keymap.setVideoKey(videoKeyMap[key], key);
      });
    },
    clear: function() {
      $('.keymap-key').css('background-image', '')
        .removeClass('populated');
    },
    renderBanks: function() {
      var banks = Screens.current.banks
      $('.keymap-key').removeClass('populated selected');
      Object.keys(banks).forEach(function(key) {
        if (Object.keys(banks[key]).length) {
          $('[data-value="' + key + '"]', keymap.$el).addClass('populated');
        }
      });
      $('[data-value="' + Screens.current.currentBankIndex + '"]', keymap.$el).addClass('selected');
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