$(function() {


  // load videos
  var videoKeyChars = 'qwertyuiopasdfghjkl;zxcvbnm,';
  var $videos = $('video');
  var keyPointer = 0;
  $.ajax({
    url: 'assets/video'
  }).done(function(data){
    $('#files li', data).each(function(i) {

      if ($('a', this).attr('title')[0] === '.') {
        // skip hidden files
        return;
      }
      if ($('.size', this).text()) { //only files have sizes
        if ( ! videoKeyChars[keyPointer+1]) {
          return;
        }

        // todo: use a template.
        // insert video in dom.
        $el.append(
          $('<video>', {
            id: 'v' + i,
            src:  $('a', this).attr('href'), //'file:///Users/robertwilliams/Sites/vjapp/client' +
            loop: 'loop',
            //preload: 'auto',
            'class': 'off'
          })
        );
        // map keys to video
        mapVideo(videoKeyChars[keyPointer++], '#v' + i);
      } else {
        // recursively descend.
      }
    });

    // set the stage
    $videos = $('video');
  });


  var keysDown = {};
  var $el = $('#main');
  function mapVideo(key, video){
    console.log(key);
    var $video = $(video);
    jwerty.key(key, function(){
      if (keysDown[key]) return;
      keysDown[key] = true;
      play($video);
    });

    $('html').bind('keyup', jwerty.event(key, function (){
      keysDown[key] = false;
      if ( ! capsOn) {
        stop($video);
      }
    }));
  }

  function play($video) {
    if ( ! $video.is(':last-child') ) {
      $el.append($video);
    }
    $video[0].play();
    $video.removeClass('off');
    var $parent = $video.parent();
    $video.css({
      top: ($parent.height() - $video.height()) /2
    });
  }

  function stop($video) {
    $video[0].pause();
    $video.addClass('off');
  }

  // track caps lock
  var capsOn;
  $(window).bind("capsOn", function(event) {
    capsOn = true;
  });
  $(window).bind("capsOff", function(event) {
    capsOn = false;
  });
  $(window).capslockstate();

  // track special keys for mouse interaction

  // fade
  var key = 'tab';
  jwerty.key(key, function(){

    if (keysDown[key]) return;
    keysDown[key] = true;

    var $video
    $videos.mousedown(function(e) {
      var startPosition = {
        x: screenX,
        y: screenY
      };
      $video = $(e.currentTarget);

      $(window).mousemove(function(e) {
        $video.css('opacity', (e.screenY) / 400);
      });
      $video.one('pause', function(){
        setTimeout(function(){
          $video.css('opacity', '');
        }, 100);
      });
    })
      .mouseup(function() {
        $(window).unbind("mousemove");
      });

  });
  $('html').bind('keyup', jwerty.event(key, function (){
    keysDown[key] = false;
    if ( ! capsOn) {
      $videos.unbind('mousedown');
    }
  }));

  // black out (spacebar)
  jwerty.key('space', function(){
    $videos.each(function(i, el){
      stop($(el));
    });
  });

});