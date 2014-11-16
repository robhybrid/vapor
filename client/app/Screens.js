define(function(require){
  var _ = require('underscore'),
      $ = require('jquery');
  require('jwerty');

  Screens = {
    items: []
  };

  // global controls
  jwerty.key('ctrl+s', function() {
    $('#main').trigger('toggleScreens');
  });
  $('#main').on('toggleScreens', function() {
    $('#main').toggleClass('show-screens');
    // display white on all screens, or test pattern.
  });

  for (var i=0; i<10; i++) {
    (function(index) {
      jwerty.key('ctrl+' + index, function() {
        // select the screen, or transmit screen-change.
        if (Screens[index]) {
          Screens.current = Screens[index];
        } else if ( Screens.current.$el.attr('style') ) {
          // If the current screen is un-modified return
          // to avoid creating a bunch of duplicate screens on top of each other.
          Screens.current = Screens.add(index);
        }
      });
    })(i);
  }

  Screens.add = function(index) {
    var screen = {
      $el: $('<div>', {
        'class': 'screen'
      }),
      patches: [],
      videoKeyMap: {}
    };
    // add new screen element to main.
    $('#main').append(screen.$el);

    Screens.items[index] = screen;
    if ( ! Screens.current) {
      Screens.current = screen;
    }

    return screen;
  };

  Screens.remove = function(index) {
    if (Screens.length > 1 && typeof index === 'number') {
      delete Screens.items[index];
    }
    Screens.current = _.last(Screens.items);
  }

  // initialize
  Screens.add(0);

  return Screens;
});
