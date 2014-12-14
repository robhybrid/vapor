/**
 * Represents a remote image.
 * @param {object} options The configuration options.
 */
RAL.RemoteVideo = function(options) {

  // make sure to override the prototype
  // refs with the ones for this instance
  RAL.RemoteFile.call(this);

  options = options || {};

  this.element = options.element || document.createElement('video');
  this.src = this.element.dataset.src || options.src;
  this.width = this.element.width || options.width || null;
  this.height = this.element.height || options.height || null;
  this.placeholder = this.element.dataset.placeholder || null;
  this.priority = options.priority || 0;

  // attach on specific events for images
  this.addEventListener('remoteloadstart', this.showPlaceholder.bind(this));
  this.addEventListener('loaded', this.showVideo.bind(this));

  if(typeof options.autoLoad !== "undefined") {
    this.autoLoad = options.autoLoad;
  }

  if(typeof options.ignoreCacheHeaders !== "undefined") {
    this.ignoreCacheHeaders = options.ignoreCacheHeaders;
  }

  // if there is a TTL use that instead of the default
  if(this.ignoreCacheHeaders && typeof this.timeToLive !== "undefined") {
    this.timeToLive = options.timeToLive;
  }

  if(this.autoLoad) {
    this.load();
  } else {
    this.showPlaceholder();
  }

};

RAL.RemoteVideo.prototype = new RAL.RemoteFile();

/**
 * Shows a placeholder image while we load in the main image
 */
RAL.RemoteVideo.prototype.showPlaceholder = function() {

  if(this.placeholder !== null) {

    // add in transitions
    //this.element.style['-webkit-transition'] = "background-image 0.5s ease-out";
    this.showVideo({data:this.placeholder});
  }
};

/**
 * Shows the image.
 * @param {event} evt The loaded event for the asset.
 */
RAL.RemoteVideo.prototype.showVideo = function(evt) {

  var videoSrc = evt.data;
  var video = this.element || document.createElement('video');
  var revoke = (function(videoSrc) {
    this.wURL.revokeObjectURL(videoSrc);
  }).bind(this, videoSrc);

  var videoLoaded = function() {

    // infer the size from the video
//    var width = this.width || video.naturalWidth;
//    var height = this.height || video.naturalHeight;

    //this.element.src = 'data:video/mp4;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
//    this.element.style.width = width + 'px';
//    this.element.style.height = height + 'px';
//    this.element.style.backgroundImage = 'url(' + imageSrc + ')';
//    this.element.style.backgroundSize = width + 'px ' + height + 'px';

    // if it's a blob make sure we go ahead
    // and revoke it properly after a short timeout
    if(/blob:/.test(videoSrc)) {
      setTimeout(revoke, 100);
    }
  };

  video.addEventListener('load', videoLoaded.bind(this));
  video.src = videoSrc;
};
