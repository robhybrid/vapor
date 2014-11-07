$(function() {

  // load videos
  var videoKeyChars = 'qwertyuiopasdfghjkl;zxcvbnm<.?';
  var $videos = $('video');
  var keyPointer = 0;
  $.ajax({
    url: 'assets/video'
  }).done(function(data){
      var c = 0;
      // todo: create and API instead of using screenscraping.
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

        // Reload the video if there's an error.
        // This is a work-around for intermittent CONTENT LENGTH ERROR
        $video.on('error', function(e) {
          console.error('video error, reloading', arguments);
          var $video = $(e.currentTarget);
          $video.attr('src', $video.attr('src').split('?')[0] + '?' + ((new Date())).toISOString())
        });

        // Once the video is ready to play, stop it and start loading the next one.
        $video.one('canplaythrough', function(e) {
          $(e.currentTarget)[0].pause();
          console.log('loaded video', ++c);
          loadVideo($file.next());
        });

        // Insert video in dom.
        $el.append(
          $('<div>', {
              'class': 'video-container off',
              id: 'vc' + keyPointer
            }
          ).append($video)
        );

        // Map the video onto a key.
        mapVideo(videoKeyChars[keyPointer++], $video);
        $videos = $('video');

      } else {
        // Must be a directory
        // todo: recursively descend.
        return loadVideo($file.next());
      }
    };
  });



  var $el = $('#main');
  var videoKeyMap = {};
  function mapVideo(key, video) {
    var $video = $(video);
    videoKeyMap[key] = $video;
  }

  $el.on('startVideo', function(e, key) {
    videoKeyMap[key] && play(videoKeyMap[key]);
  });
  $el.on('stopVideo', function(e, key) {
    videoKeyMap[key] && stop(videoKeyMap[key]);
  });

  // bind keyboard events
  var keysDown = {};
  videoKeyChars.split('').forEach(function(key){
    jwerty.key(key, function(e){
      if (keysDown[key]) return;
      keysDown[key] = true;
      $el.trigger('startVideo', key);
      socket.emit('keydown', key);
    });
    $('html').bind('keyup', jwerty.event(key, function (){
      keysDown[key] = false;
      if ( ! capsOn) {
        $el.trigger('stopVideo', key);
        socket.emit('keyup', key);
      }
    }));
  });


  function play($video) {
    if (hide) return;
    var $container = $video.parent();
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
      if (client == 'self') {
        apply3dTransform();
      } else {
        socket.emit('transform', JSON.stringify({
          clientID: client,
          transform: transform,
          translate: translate
        }));
      }
    });
  });

  $('[data-translate]').on('input', function(e){
    var $slider = $(e.currentTarget),
      data = $slider.data();
    translate[parseInt(data.translate)] = $slider.val() + data.unit;
    // it client == self
    apply3dTransform();
  });
  function apply3dTransform(data) {
    if (data) {
      translate = data.translate;
      transform = data.transform;
    }
    $('video:last').css('transform',
      'translate3d(' + translate.join(',') + ') '
      + Object.keys(transform).map(function(method) {
        return method + '(' + transform[method] + ')';
      }).join(' ')
    );
  }

  $('[data-css-property]').on('input', function(e){
    var $slider = $(e.currentTarget),
      data = $slider.data();
    //TODO: Save the last played video instead to using :last.
    $((data.target || 'video') + ':last').css(
      data.cssProperty,
      ((parseInt($slider.val()) + parseInt(data.offset || 0) ) * (data.ratio || 1) ) + (data.unit || ''));
  });


  // Use websocket to connect to other outs.
  var hide = false;
  jwerty.key('ctrl+H', function(){
    hide = ! hide;
  });
  var socket = io();
  socket.on('keydown', function (key) {
    // my msg
    $el.trigger('startVideo', [key]);
  });
  socket.on('keyup', function (key) {
    $el.trigger('stopVideo', [key]);
  });

  // client selector
  var client = 'self',
    clients = {};
  jwerty.key('option+c', function() {
    $('.clients').toggleClass('hidden');
  });

  function renderClientList() {
    var $clients = $('.clients').html('');
    $.each(clients, function(id) {
      var _id = (id == socket.io.engine.id) ? 'self' : id;
      var $client = $('<div>', {
        'class' : 'client' + (client == _id ? ' selected' : ''),
        id: _id,
        text: _id
      }).on('click', clientClick);

      $clients.append($client);
    });
  }
  var clientClick = function(e) {
    client = $(e.currentTarget).attr('id');
    renderClientList();
  };
  socket.on('clients', function(socketClients) {
    clients = JSON.parse(socketClients);
    renderClientList();
  });

  socket.on('transform', function(data){
    apply3dTransform(data);
  });
});