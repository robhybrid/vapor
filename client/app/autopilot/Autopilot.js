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
    jwerty.key('option+`', function(){
      $('.autopilot').toggleClass('hidden');
    });

    var lastTapTime,
      tapIntervals = [];
    var intervalId;
    var played = [];


    var pilot = {
      screens: [],
      interval: 5000,
      suffle: true,
      longFormat: true,
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
        if (tapIntervals.length > 1) {
          var sum = 0;
          tapIntervals.forEach(function(interval) {
            sum += interval;
          });
          var intervalRate = sum/tapIntervals.length;
          setInterval(pilot.playNext.bind(pilot), intervalRate);

          //console.log(tapTime, lastTapTime);
          $('.bpm').text(Math.round(60000/intervalRate));
          // make a little pulses there too.
        }

      },
      clearBmp: function() {
        lastTapTime = undefined;
        tapIntervals = [];
      },
      beat: function() {

      },
      go: function() {
        // first off, stop all videos except the last one for each screen.
        pilot.screens.forEach(function(screen) {
          var $videosPlaying = $('video', screen.$el)
            .filter(function(i,video){
              return ! video.paused;
            })
            .each(function(i, video) {
              if (i > 0) {
                pilot.stop($(video));
              }
            });
        });

        pilot.playNext();
      },
      stop: function() {

      },
      playNext: function() {
//        if (video.duration > 15000) {
//          // start from beginning
//          // and set an event when it ends to playNext
//        }

        if (pilot.longFormat) {

        }
      },
      play: config.play,
      stop: config.stop
    };
    pilot.go();

    return pilot;
  }

  return Object.freeze(Autopilot);
});