//require(['jquery', 'socket.io', 'jwerty', 'capslockstate'], function($, io, jwerty) {
define(function(require) {

  var $ = require('jquery');
  var jwerty = require('jwerty');
  var io = require('socket.io');
  require('capslockstate');

  $(function() {
    // load videos
    var videoKeyChars = 'qwertyuiopasdfghjkl;zxcvbnm';
    var $videos = $('video');
    var keyPointer = 0;
    var socket = io();
    $.ajax({
      url: 'api/files'
    }).done(function(files){
        loadVideos(files, videoKeyChars, 0);

        // list in file browser
        $('.files').html(function(){
          return files.map(function(file){
            var _filename = file.replace(/^assets\/video\//, '');
            return $('<div>', {
              text: _filename,
              'class': 'file'
            });
          });
        });
        $('.file').click(function(e){
          loadVideos(files.slice($(e.currentTarget).index()), videoKeyChars);
        });
      });

    // TODO: implement require, because key-press events aren't getting - memory leak.
    bindSpecialKeys();
    function loadVideos(files, keys) {
      //$(document).unbind('keydown.jwerty');
      $('video').remove();
      $('.video-container').remove();
      videoKeyMap = {};
      //bindSpecialKeys();

      loadVideo(files, keys, 0);
    };

    function loadVideo(files, keys, i) {
      // called recursively

      if ( ! videoKeyChars[i] || ! files[i]) {
        console.log('done loading');
        $('.loader').width(0);
        return;
      }

      var $video = $('<video>', {
        src:  files[i],
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
        loadVideo(files, keys, ++i);

        var max = Math.min(files.length, keys.length);
        $('.loader').css('width',
          i == max ?
            0 :
            (i / max * 100) + '%'
        );
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
      mapVideo(videoKeyChars[i], $video);
      $videos = $('video');
    }


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

    var hide = false;
    function bindSpecialKeys() {
      // Hot-keys for interface.
      jwerty.key('option+f', function(){
        $('.files').toggleClass('hidden');
      });
      jwerty.key('option+s', function(){
        $('.adjustments').toggleClass('hidden');
      });
      jwerty.key('ctrl+H', function(){
        $videos.each(function(i, el){
          stop($(el));
        });
        hide = ! hide;
      });
      jwerty.key('option+c', function() {
        $('.clients').toggleClass('hidden');
      });

      // These are special keys to transmit.
      var specialKeys = {
        'space': function(){
          // blackout
          $videos.each(function(i, el){
            stop($(el));
          });
        }
      };
      $.each(specialKeys, function(key, action) {
        jwerty.key(key, function() {
          action();
          socket.emit('keydown', key);
        });
      });
    }


    var $lastVideo = $('video:last');
    function play($video) {
      if (hide) return;
      var $container = $video.parent();
      if ( ! $container.is(':last-child') ) {
        $container.parent().append($container);
        $container.css('opacity');
      }
      $video[0].play();
      $container.removeClass('off');
      $video.css({
        top: ($container.height() - $video.height()) /2
      });
      $lastVideo = $video;
    }

    function stop($video) {
      $video[0].pause();
      $video.parent().addClass('off');
    }

    // track caps lock (doesn't use jwerty.)
    var capsOn;
    $(window).bind("capsOn", function() {
      capsOn = true;
    });
    $(window).bind("capsOff", function() {
      capsOn = false;
    });
    $(window).capslockstate();


    // sliders.
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
      // if client == self
      apply3dTransform();
    });
    function apply3dTransform(data) {
      if (data) {
        translate = data.translate;
        transform = data.transform;
      }
      if ( data && data.client || client == 'self' ) {
        $lastVideo.css('transform',
          'translate3d(' + translate.join(',') + ') '
            + Object.keys(transform).map(function(method) {
            return method + '(' + transform[method] + ')';
          }).join(' ')
        );
      } else {
        socket.emit('transform', JSON.stringify({
          clientID: client,
          transform: transform,
          translate: translate
        }));
      }
    }

    $('[data-css-property]').on('input', function(e){
      var $slider = $(e.currentTarget),
        data = $slider.data(),
        $el = data.target ? $lastVideo.closest(data.target) : $lastVideo;
      $el.css(
        data.cssProperty,
        ((parseInt($slider.val()) + parseInt(data.offset || 0) ) * (data.ratio || 1) ) + (data.unit || ''));
    });


    // Use websocket to connect to other outs.


    socket.on('keydown', function (key) {
      $el.trigger('startVideo', [key]);
      specialKeys[key] && specialKeys[key]();
    });
    socket.on('keyup', function (key) {
      $el.trigger('stopVideo', [key]);
    });

    // client selector
    var client = 'self',
      clients = {};


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
      if ( ! clients[client]) {
        client = 'self';
      }
      renderClientList();
    });

    socket.on('transform', function(data){
      apply3dTransform(data);
    });
  });
});
