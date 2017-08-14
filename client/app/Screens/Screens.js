'use strict';

define(function(require){
  var _ = require('underscore'),
      $ = require('jquery');
  var jwerty = require('jwerty');
  var matrixTransform = require('./matrixTransform');

  var Screens = {
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
        if ( Screens.current.$el.attr('style') ) {
          // If the current screen is un-modified return
          // to avoid creating a bunch of duplicate screens on top of each other.
          Screens.current = Screens.add(index);
        }
        // select the screen, or transmit screen-change.
        if (Screens.items[index]) {
          Screens.select(index);
        }
      });
    })(i);
  }

  Screens.add = function(index) {
    if (Screens.items[index]) {
      return Screens.items[index];
    }

    var screen = {
      $el: $('<div>', {
        'class': 'screen'
      }).append($('<label>', {
          text: index
        })),
      banks: [],
      currentBankIndex: 0,
      bank: function(index){
        if (typeof index === 'number' || ! isNaN(parseInt(index)) ) {
          screen.currentBankIndex = index;
        }
        screen.banks[screen.currentBankIndex] = screen.banks[screen.currentBankIndex] || {};
        return screen.banks[screen.currentBankIndex];
      },
      videoKeyMap: {}
    };
    // add new screen element to main.
    $('#main').append(screen.$el);

    Screens.items[index] = screen;
    if ( ! Screens.current) {
      Screens.select(index);
    }

    // matrixTransform.makeTransformable(screen.$el);

    return screen;
  };

  Screens.select = function(index) {
    $('.screen').removeClass('selected');
    Screens.items[index].$el
      .addClass('selected')
      .trigger('selected');
    Screens.current = Screens.items[index];
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
