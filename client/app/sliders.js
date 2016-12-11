define(['jquery', './Screens/Screens'], function($, Screens) {


  var transform = {};
  var translate = [0,0,0];
  var $main = $('#main');

  function initSliders(interface) {
    // sliders.
    $('.fade-duration').on('input', function(e){
      var val = $(e.currentTarget).val();
      $('#fade-duration').html('.video-container { transition: opacity ' + val +'ms; }')
      $main.trigger('fadeDuration', $(e.currentTarget).val());
      interface.socket.emit('fadeDuration', val);
    });


    $('[data-transform]').each(function(i, el){
      var $slider = $(el),
        method = $slider.data('transform'),
        unit = $slider.data('unit');
      $slider.on('input', function(e) {
        transform[method] = $(e.currentTarget).val() + unit;
        interface.apply3dTransform();
      });
    });

    $('[data-translate]').on('input', function(e){
      var $slider = $(e.currentTarget),
        data = $slider.data();
      translate[parseInt(data.translate)] = $slider.val() + data.unit;
      // it client == self
      interface.apply3dTransform();
    });


    $('[data-css-property]').on('input', function(e){
      var $slider = $(e.currentTarget),
        data = $slider.data(),
        $el = data.target ? Screens.current.$el.closest(data.target) : Screens.current.$el;
      $el.css(
        data.cssProperty,
        ((parseInt($slider.val()) + parseInt(data.offset || 0) ) * (data.ratio || 1) ) + (data.unit || ''));
    });
  }


  return {
    init: initSliders,
    transform: transform,
    translate: translate
  };
});