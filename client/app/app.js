define(function(require) {

  var $ = require('jquery');
  var jwerty = require('jwerty');
  var io = require('socket.io');
  var Screens = require('Screens/Screens');
  var keymap = require('keymap');
  var Autopilot = require('autopilot/Autopilot');

  require('capslockstate');

  $(function() {

    var pilot = Autopilot({
      play: play,
      stop: stop,
      screens: Screens.items
    });

    // load videos
    var videoKeyChars = ('qwertyuiopasdfghjkl;zxcvbnm'.split('')).concat(['comma','.','forward-slash']);
    var $videos = $('video');
    var keyPointer = 0;
    var socket = io();
    $.ajax({
      url: 'api/files'
    }).done(function(files) {

      // load up banks
      files.forEach(function(file, index){
        if (Screens.current.bank()[videoKeyChars[index % videoKeyChars.length]]) {
          Screens.current.bank(Screens.current.currentBankIndex + 1);
        }
        Screens.current.bank()[videoKeyChars[index % videoKeyChars.length]] = file;
      });

      loadVideos(Screens.current.bank(0));

      // list in file browser
      $('.files .list').html(function(){
        return files.map(function(file){
          var _filename = file.replace(/^.*assets\/video\//, '');
          return $('<div>', {
            text: _filename,
            'class': 'file',
            style: 'background-image: url("assets/images/thumbs/' + encodeURI(_.last(_filename.split('/'))) + '/tn.png")'
          });
        });
      });
      $('.file').click(function(e) {
        var theseVideos = files.slice($(e.currentTarget).index());
        theseVideos.forEach(function(file, index){
          if (Screens.current.bank()[videoKeyChars[index % videoKeyChars.length]]) {
            Screens.current.bank(Screens.current.currentBankIndex + 1);
          }
          Screens.current.bank()[videoKeyChars[index % videoKeyChars.length]] = file;
        });
        loadVideos(Screens.current.bank(0));
      });
    });

    bindSpecialKeys();

    function loadVideos(bank) {
      keymap.clear();
      keymap.renderBanks();
      $('video', Screens.current.$el).remove();
      $('.video-container', Screens.current.$el).remove();
      //bindSpecialKeys();
      Screens.current.videoKeyMap = {};

      loadVideo(bank, 0);
    }

    function loadVideo(bank, i) {
      // called recursively
      var keys = Object.keys(bank),
        key = keys[i],
        file = bank[key];

      if ( ! key || ! file) {
        console.log('done loading');
        $('.loader').width(0);
        return;
      }

      var $video = $('<video>', {
        src: file,
        loop: 'loop',
        preload: 'auto',
        autoplay: true
      });

      // Reload the video if there's an error.
      // This is a work-around for intermittent CONTENT LENGTH ERROR
      $video.on('error', function(e) {
        console.error('video error, reloading', arguments);
        var $video = $(e.currentTarget);
        $video.attr('src', $video.attr('src').split('?')[0] + '?' + ((new Date())).toISOString());
      });

      $video.on('ended', function(e){
        $(e.currentTarget).addClass('ended');
        console.log('ended');
      });

      $video.on('waiting', function(e){
        console.error('video waiting, reloading', arguments);
        var $video = $(e.currentTarget);
        $video.attr('src', $video.attr('src').split('?')[0] + '?' + ((new Date())).toISOString());
      });

      // Once the video is ready to play, stop it and start loading the next one.
      $video.one('canplaythrough', function(e) {
        $(e.currentTarget)[0].pause();
        loadVideo(bank, ++i);

        $('.loader').css('width',
          i == keys.length ?
            0 :
            (i / keys.length * 100) + '%'
        );
      });

      // Insert video in dom.
      Screens.current.$el.append(
        $('<div>', {
            'class': 'video-container off'
          }
        ).append($video)
      );

      // Map the video onto a key.
      mapVideo(key, $video);
      $videos = $('video');
    }

    function mapVideo(key, video) {
      var $video = $(video);
      Screens.current.videoKeyMap[key] = $video;
      keymap.setVideoKey($video, key);
    }

    // Main Controller
    var $main = $('#main');
    $main.on('startVideo', function(e, key) {
      for (var i in Screens.items) {
        Screens.items[i].videoKeyMap[key] && play(Screens.items[i].videoKeyMap[key]);
      }
    });
    $main.on('stopVideo', function(e, key) {
      for (var i in Screens.items) {
        Screens.items[i].videoKeyMap[key] && stop(Screens.items[i].videoKeyMap[key]);
      }
    });
    $main.on('changeBank', function(e, key){
      console.log(Screens.current.bank(key));
      loadVideos(Screens.current.bank(key));
    });



    // bind keyboard events
    var keysDown = {};
    videoKeyChars.forEach(function(key){
      jwerty.key(key, function(e){
        if (keysDown[key]) return;
        keysDown[key] = true;
        $main.trigger('startVideo', [key]);

        socket.emit('keydown', key);
      });
      $(document).bind('keyup', jwerty.event(key, function (){
        keysDown[key] = false;
        if ( ! capsOn) {
          $main.trigger('stopVideo', [key]);
          socket.emit('keyup', key);
        }
      }));
    });

    var bankKeys = '1234567890'.split('');
    bankKeys.forEach(function(key) {
      jwerty.key(key, function() {
        Screens.current.$el.trigger('changeBank', [key]);
        socket.emit('keydown', key);
      });
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
      // it client == self
      apply3dTransform();
    });
    function apply3dTransform(data) {
      if (data) {
        translate = data.translate;
        transform = data.transform;
      }
      if ( data && data.client || client == 'self' ) {
        Screens.current.$el.css('transform',
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
        $el = data.target ? Screens.current.$el.closest(data.target) : Screens.current.$el;
      $el.css(
        data.cssProperty,
        ((parseInt($slider.val()) + parseInt(data.offset || 0) ) * (data.ratio || 1) ) + (data.unit || ''));
    });


    // Use websocket to connect to other outs.

    socket.on('keydown', function (key) {
      $('.screen').trigger('startVideo', [key]);
      specialKeys[key] && specialKeys[key]();
    });
    socket.on('keyup', function (key) {
      $('.screen').trigger('stopVideo', [key]);
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

    socket.on('transform', function(data) {
      apply3dTransform(data);
    });
  });
});