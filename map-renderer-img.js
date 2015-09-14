(function( $ ){
"use strict";

$.ImageRenderer = function() {

  var useCanvas = false;
  var canvas = null;
  var context = null;
  
  // Default behaviour for rendering a tile: add the image to the tile layer.
  this.renderTile = function(tile) {
    // Flag the image, so it is added and configured only once.
    if (tile.rendered) return;
    tile.rendered = true;
    
    // When the image is loaded, set its final properties based on the actual width and height of the file.
    tile.image.addEventListener('load', function(){
      // To do: Setting tile width and height may belong in the tiled image loaded, but make sure events are fired in the right order,
      // since this event handler relies on the tile.width and height.
      tile.width = tile.image.width * tile.scaleFactor;
      tile.height = tile.image.height * tile.scaleFactor;
      
      tile.image.classList.add('level' + tile.level);
      
      var s = tile.image.style;
      s.width = tile.width + 'px';
      s.height = tile.height + 'px';
      s.zIndex = 0 - tile.level;
      s.position = 'absolute';
      s.left = tile.x + 'px';
      s.top = tile.y + 'px';
      
      this.tileLayer.appendChild(tile.image);
    }.bind(this));
    
  }.bind(this);
  
  // Initialize with all the settings
  this.initialize = function(options) {
    this.tileLayer = options.tileLayer;
    useCanvas = !!options.useCanvas;
    
    if (!useCanvas) return;
    
    // Initialize the canvas, if support is there.
    var canvas = $.createElement('canvas', {
      width: options.mapWidth,
      height: options.mapHeight,
    }, options.tileLayer);
    
    // Check support
    useCanvas = useCanvas && !!canvas.getContext;
    
    if (useCanvas) {
      $.setProperties(canvas.style, {
        position: 'absolute',
        left: 0, top: 0,
      });
      context = canvas.getContext('2d');
    
      // Overrule the rendering of tiles.
      this.renderTile = function(tile) {
        if (tile.rendered) {
          context.drawImage(tile.image, tile.x, tile.y, tile.image.width * tile.scaleFactor, tile.height * tile.scaleFactor);
        } else {
          tile.image.addEventListener('load', function(){
            tile.rendered = true;
            context.drawImage(tile.image, tile.x, tile.y, tile.image.width * tile.scaleFactor, tile.height * tile.scaleFactor); 
          });
        }
      };
    }
  }.bind(this);

}

})(BigMap);
