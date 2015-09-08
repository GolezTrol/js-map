(function( $ ){
"use strict";

$.Viewer = function(options) {
  this.element = options.element;
  
  this.view = {
    level: 13,
    offsetX: 500,
    offsetY: 500,
    width: 0,
    height: 0
  }
  
  var canvas = $.createElement('canvas', {
    className: 'layer',
  }, this.element);
  var context = canvas.getContext('2d');
  
  this.tiledMap = new $.TiledMapDeepZoom(options.mapInfo);
  this.mouseInput = new $.MouseInput(options.element);
  
  this.mouseInput.addEventListener('drag', function(event) {
    console.log(event);
  });
  
  this.draw = function() {
    this.tiledMap.draw(this.view, function(tile) {
      context.drawImage(tile.image, tile.x, tile.y); 
    }.bind(this));
  };

  this.elementResized = (function(){
    var width = this.element.clientWidth;
    var height = this.element.clientHeight;
    this.view.width = width;
    this.view.height = height;
    canvas.width = width;
    canvas.height = height;
    this.draw();
  }).bind(this);
  
  window.addEventListener('resize', this.elementResized);
  
  // Initial call to get the right dimensions
  this.elementResized();
}


})(BigMap);