$(function() {


  // load videos
  var videoKeyChars = 'qwertyuiopasdfghjkl;zxcvbnm,./';
  var $videos = $('video');
  var keyPointer = 0;
  $.ajax({
    url: 'assets/video'
  }).done(function(data){
      var c = 0;
      var $files = $('#files li', data);
    loadVideo($files.first());
    function loadVideo($file) {
      if ($file.length == 0) {
        return;
      }
      if ($('a', $file).attr('title')[0] === '.') {
        // skip hidden files
        return loadVideo($file.next());
      }
      if ($('.size', $file).text()) { //only files have sizes
        if ( ! videoKeyChars[keyPointer+1]) {
          return loadVideo($file.next());
        }

        var $video = $('<video>', {
          id: 'v' + keyPointer,
          src:  $('a', $file).attr('href'),
          loop: 'loop',
          preload: 'auto',
          autoplay: true
        });

        $video.on('error', function(e){
          console.error('video error, reloading', arguments);
          // TODO: find the exact error type.
          var $video = $(e.currentTarget);
          $video.attr('src', $video.attr('src').split('?')[0] + '?' + ((new Date())).toISOString())
        });

        $video.one('canplaythrough', function(e) {
          console.log('canplaythrough !', e.currentTarget.src);
          $(e.currentTarget)[0].pause();
          console.log(++c);
          loadVideo($file.next());
        });

        // todo: use a template.
        // insert video in dom.
        $el.append(
          $('<div>', {
              'class': 'video-container off',
              id: 'vc' + keyPointer
            }
          ).append($video)
        );
        // map keys to video
        mapVideo(videoKeyChars[keyPointer++], $video);
        $videos = $('video');

      } else {
        // recursively descend.
        return loadVideo($file.next());
      }
    };

    // set the stage

  });


  var keysDown = {};
  var $el = $('#main');
  function mapVideo(key, video){
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
    var $container = $video.parent()
    if ( ! $container.is(':last-child') ) {
      $el.append($container);
      $container.css('opacity');
    }
    $video[0].play();
    $container.removeClass('off');
    $video.css({
      top: ($container.height() - $video.height()) /2
    });
  }

  function stop($video) {
    $video[0].pause();
    $video.parent().addClass('off');
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

  // sliders.
  jwerty.key('option+s', function(){
    $('.adjustments').toggleClass('hidden');
  });
  $('.fade-duration').on('input', function(e){
    $('#fade-duration').html('.video-container { transition: opacity ' + $(e.currentTarget).val() +'ms; }')
  });
  var transform = {};
  var translate = [0,0,0];
  $('[data-transform]').each(function(i, el){
    var $slider = $(el),
      method = $slider.data('transform'),
      unit = $slider.data('unit');
    $slider.on('input', function(e) {
      transform[method] = $(e.currentTarget).val() + unit;
      apply3dTransform();
    });
  });

  $('[data-translate]').on('input', function(e){
    var $slider = $(e.currentTarget),
      data = $slider.data();
    translate[parseInt(data.translate)] = $slider.val() + data.unit;
    apply3dTransform();
  });
  function apply3dTransform(){

    $('video:last').css('transform',
      Object.keys(transform).map(function(method){
        return method + '(' + transform[method] + ')';
      }).join(' ')
        + ' translate3d(' + translate.join(',') + ')'
    );
  }

  $('[data-css-property]').on('input', function(e){
    var $slider = $(e.currentTarget),
      data = $('[data-css-property]').data();
    console.log($('.' + (data.target || 'video') + ':last'), data.cssProperty, $slider.val() + (data.unit || ''));
    $('.' + (data.target || 'video') + ':last').css(data.cssProperty, $slider.val() + (data.unit || 'px'));
  });
});