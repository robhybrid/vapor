define(function(require) {
  var jwerty = require('jwerty');

  var Autopilot = function(config){
    // config must be passed play and stop;

    jwerty.key('`', function() {
      pilot.tap();
    });
    jwerty.key('esc', function() {
      pilot.clearBmp();
    });

//    $('#main').on('click', function(){
//      pilot.tap();
//    });
//    $('.bpm').click(function(){
//      pilot.clearBmp();
//    });

    jwerty.key('option+`', function(){
      $('.autopilot').toggleClass('hidden');
    });

    var lastTapTime,
      tapIntervals = [];
    var intervalId;
    var played = [];


    var pilot = {
      screens: config.screens,
      interval: 5000,
      suffle: true,
      measure: 1,
      playlist: {}, // object with array for each screen.
      tap: function() {
        var tapTime = new Date().getTime();
        if (lastTapTime) {
          var interval = tapTime-lastTapTime;
          lastTapTime = tapTime;
        } else {
          lastTapTime = tapTime;
          return;
        }

        if ((interval) > 15000) {
          pilot.clearBmp();
        }
        tapIntervals.push(interval);
        if (tapIntervals.length) {
          var sum = 0;
          tapIntervals.forEach(function(interval) {
            sum += interval;
          });
          var intervalRate = sum/tapIntervals.length;

          $('.bpm').text(Math.round(60000/intervalRate));
          clearInterval(intervalId);
          intervalId = setInterval(pilot.playNext, intervalRate);
          pilot.playNext();
        }
      },
      clearBmp: function() {
        lastTapTime = undefined;
        tapIntervals = [];
        $('.bpm').text('');
        clearInterval(intervalId);
        pilot.screens.forEach(function(screen) {
          screen.$el.trigger('stopVideo', [_.last(played)]);
        });
      },
      playNext: function() {
        // TODO: make a little pulsing indicator.
        var keys = Object.keys(pilot.screens[0].videoKeyMap);
        var newKey = keys[_.random(0,keys.length-1)];
        pilot.screens.forEach(function(screen){
          screen.$el.trigger('stopVideo', [_.last(played)]);
          screen.$el.trigger('startVideo', [newKey]);
        });

        played.push(newKey);
      },
      play: config.play,
      stop: config.stop
    };

    return pilot;
  }

  return Object.freeze(Autopilot);
});