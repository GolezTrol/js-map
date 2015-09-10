(function( $ ){
"use strict";

$.ImageRenderer = function() {

  var useCanvas = false;
  var canvas = null;
  var context = null;
  
  // Default behaviour for rendering a tile: add the image to the tile layer.
  this.renderTile = function(tile) {
    //if (tile.rendered) return; // Flag the image, so it is added only once.
    
    $.setProperties(tile.image.style, {
      position: 'absolute',
      left: tile.x + 'px',
      top: tile.y + 'px',
      width: tile.width + 'px',
      height: tile.height + 'px',
      zIndex: tile.level,
    });
    
    tile.image.classList.add('level' + tile.level);
    
    this.tileLayer.appendChild(tile.image);
    
    tile.rendered = true;
    
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
        context.drawImage(tile.image, tile.x, tile.y, tile.width, tile.height); 
      };
    }
  }.bind(this);

}

})(BigMap);
