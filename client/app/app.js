// This is the main portion of the app. Sorry it's not well broken out.
// This file handles loading video, socket connections and most of the keymapping.


define(function(require) {

  var $ = require('jquery');
  var jwerty = require('jwerty');
  var io = require('socket.io');
  var Screens = require('Screens/Screens');
  var keymap = require('./keymap');
  var Autopilot = require('./autopilot/Autopilot');
  var startTimer;
  var loading = false;
  var sliders = require('./sliders');

  var networkStates = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];

  if (location.protocol == 'chrome-extension:') {
    var TL = require('./chromeApp/Transloader');
    var transLoader = TL();
  }

  require('capslockstate');

  $(function() {

    var pilot = Autopilot({
      play: play,
      stop: stop,
      screens: Screens.items
    });

    var mute = true;

    // load videos
    var videoKeyChars = ('qwertyuiopasdfghjkl;zxcvbnm'.split('')).concat(['comma','.','forward-slash']);
    var $videos = $('video');

    // SET YOUR IP HERE
    var host = (location.protocol == 'chrome-extension:') ? 'http://192.168.1.115:9000/' : '';
    var socket = io(host);
    $.ajax({
      url: host + 'api/files'
    }).done(function(files) {

      if (typeof transLoader !== 'undefined') {
        transLoader.files = files;
      }

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

    function loadVideos(bank) {
      if (hide) return;
      startTimer = new Date();

      keymap.clear();
      keymap.renderBanks();
      $('video', Screens.current.$el).each(function(){
        this.pause();
        delete(this);
      }).remove();
      $('.video-container', Screens.current.$el).remove();
      Screens.current.videoKeyMap = {};

      loadVideo(bank, 0);
    }

    // tThis function recursively loads videos one at a time.
    function loadVideo(bank, i) {
      if (hide) return;
      var keys = Object.keys(bank),
        key = keys[i],
        file = bank[key];

      if ( ! key || ! file) {
        console.log('done loading', startTimer && 'in ' + (new Date() - startTimer)+'ms' );
        loading = false;
        $('.loader').width(0);
        manualLoad($('video:not(.played)'));
        return;
      }

      var $video,
        videoConfig = {
          loop: 'loop',
          preload: 'auto',
          autoplay: 'autoplay'
        };

      $video = $('<video>', {src: file});

      $video.attr(videoConfig);
      if (mute) {
        $video.attr({muted:'muted'});
      }

      // Reload the video if there's an error.
      // This is a work-around for intermittent net::ERR_CONTENT_LENGTH_MISMATCH
      $video.on('error ', function(e) {
        var $video = $(e.currentTarget);
        console.error('video error, reloading', networkStates[$video[0].networkState]);
        $video.attr('src', $video.attr('src').split('?')[0] + '?' + ((new Date())).toISOString());
      });
      $video.on('stalled', function(e) {
        var $video = $(e.currentTarget);
        console.warn('video stalled', networkStates[$video[0].networkState]);
        if (loading) {
          blackout();
        }
      });

      // needed to detect autoplay.
      $video.on('playing', function(e){
        $(e.currentTarget).addClass('played');
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
      $video[0].load();

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

    var specialKeys = {
      'space': function(){
        blackout();
      }
    };

    var numbers = '1234567890'.split('');
    numbers.forEach(function(bankNumber) {
      var keyCombo = 'option+' + bankNumber;
      jwerty.key(keyCombo, function() {
        changeBank(bankNumber);
        socket.emit('keydown', keyCombo);
      });
      specialKeys[keyCombo] = function(bankNumber) {
        changeBank(bankNumber);
      }
    });
    function changeBank(bankNumber) {
      Screens.current.$el.trigger('changeBank', [bankNumber]);
    }

    // preview bank
    numbers.forEach(function(key) {

      jwerty.key(key, function previewBank() {
        if (keysDown[key]) return;
        keysDown[key] = true;
        keymap.clear();
        keymap.renderBanks();
        var bank = Screens.current.banks[key];
        _.each(bank, function(filename, key) {
          keymap.setVideoKey(filename, key);
        });
      });
      // change back to current bank on keyup.
      $(document).bind('keyup', jwerty.event(key, function (){
        keysDown[key] = false;
        _.each(Screens.current.bank(), function(filename, key) {
          keymap.setVideoKey(filename, key);
        });
      }));
    });


    var hide = false;

    function blackout() {
      $videos.each(function(i, el){
        stop($(el));
      });
    }

    function bindSpecialKeys() {
      // Hot-keys for interface.
      jwerty.key('option+f', function(){  // files
        $('.files').toggleClass('hidden');
      });
      jwerty.key('option+s', function(){  // sliders
        $('.adjustments').toggleClass('hidden');
      });
      jwerty.key('ctrl+H', function(){    // hide
        $videos.each(function(i, el){
          stop($(el));
        });
        hide = ! hide;
      });
      jwerty.key('option+c', function() {  // clients
        $('.clients').toggleClass('hidden');
      });
      jwerty.key('option+m', function() {  // mute
        mute = ! mute;
        if (mute) {
          $('video').attr('muted', 'muted');
        } else {
          $('video').removeAttr('muted');
        }
      });
      bindSpecialKeys();

      // These are special keys to transmit.
      var specialKeys = {
        'space': function(){
          blackout();
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

    sliders.init({
      apply3dTransform: apply3dTransform,
      socket: socket
    });

    function apply3dTransform(data) {
      if (data) {
        translate = data.translate;
        transform = data.transform;
      } else {
        transform = sliders.transform;
        translate = sliders.translate;
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
    socket.on('fadeDuration', function (val) {
      $('#fade-duration').html('.video-container { transition: opacity ' + val +'ms; }');
    });

    socket.on('transform', function(data) {
      apply3dTransform(data);
    });

    // hack to load videos on mobile
    function manualLoad($videos) {
      if ($videos.length) {
        var $btn = $('.manual-load').on('click', function(){
          $videos.each(function(i, video){
            $(video).one('playing', function(){
              video.pause();
              $(video).addClass('played');
              var count = $('video:not(.played)').length;
              if (count) {
                $('.count', $btn).text(count);
              } else {
                $btn.addClass('hidden');
              }
            });
            video.play();
          });
        })
          .removeClass('hidden');
      }
    }
  });
});