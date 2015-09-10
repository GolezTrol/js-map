(function( $ ){
"use strict";

$.Viewer = function(options) {
  this.element = options.element;
  
  this.view = {
    level: 13,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
    zoom: 100,
  }
  
  // Get the various elements to work with.  
  var layers = this.element.querySelector('.layers');
  var tileLayer = layers; // for now.
  options.tileLayer = tileLayer;
  
  // Give them at least the style required to make it work well
  options.element.style.overflow = 'hidden';
  layers.style.transformOrigin = '0 0';

  
  var renderer = new $.ImageRenderer();
  var tiledMap = new $.TiledMapDeepZoom();
  
  // Initialize the tile source
  tiledMap.load(options.mapInfo, function(mapSource){
    $.setProperties(layers.style, {
      width: mapSource.width + 'px',
      height: mapSource.height + 'px',
      position: 'absolute',
    });
    
    // Initilize the renderer
    options.mapWidth = mapSource.width;
    options.mapHeight = mapSource.height;
    renderer.initialize(options);
  });
  
  // Initialize the mouse event handler
  this.mouseInput = new $.MouseInput(options.element);
  
  this.mouseInput.addEventListener('drag', function(event) {
    
    this.view.offsetX -= event.delta.x;
    this.view.offsetY -= event.delta.y;
    
    // Keep the position within the ranges, so the map doesn't get lost.
    this.view.offsetX = Math.range(this.view.offsetX, 0, tiledMap.source.width - this.view.width);
    this.view.offsetY = Math.range(this.view.offsetY, 0, tiledMap.source.height - this.view.height);

    // Position the layers container.
    layers.style.left = '-' + this.view.offsetX + 'px';
    layers.style.top = '-' + this.view.offsetY + 'px';
    
    this.render();
    
  }.bind(this));
  
  this.mouseInput.addEventListener('zoom', function(event) {
    
    var delta = event.direction * 10;
    
    this.view.zoom = this.view.zoom + delta;
    this.view.zoom = Math.range(this.view.zoom, 10, 200);
    
    this.view.level = Math.ceil(14 - (100 / this.view.zoom));
    this.view.level = Math.range(this.view.level, 8, 13);

    layers.style.transform = "scale(" + (this.view.zoom / 100) + ")";
    
    console.log(this.view.zoom);
    
    this.render();
    
  }.bind(this));
  
  this.render = function() {
    for (var i = 0; i <= this.view.level; i++) {
      this.element.querySelectorAll('.level' + i).forEach(function(element, index, list){
        element.style.display = 'block';
      });
    }
    for (var i = this.view.level + 1; i <= 13; i++) {
      this.element.querySelectorAll('.level' + i).forEach(function(element, index, list){
        element.style.display = 'none';
      });
    }
    tiledMap.getTiles(this.view, renderer.renderTile);
  };

  this.elementResized = (function(){
    var width = this.element.clientWidth;
    var height = this.element.clientHeight;
    this.view.width = width;
    this.view.height = height;

    this.render();
    
  }).bind(this);
  
  window.addEventListener('resize', this.elementResized);
  
  // Initial call to get the right dimensions
  this.elementResized();
}


})(BigMap);