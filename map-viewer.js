(function( $ ){
"use strict";

$.Viewer = function(options) {
  this.element = options.element;
  
  this.view = {
    maxLevel: 0,
    level: 0,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
    zoom: 100,
  }
  
  // Get the various elements to work with.  
  var viewport = this.element.querySelector('.map');
  var layers = viewport.querySelector('.layers');
  var tileLayer = layers; // for now.
  options.tileLayer = tileLayer;
  
  // Give them at least the style required to make it work well
  options.element.style.overflow = 'hidden';
  layers.style.transformOrigin = '0 0';
  
  var geo = null;
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
    
    geo = new $.Geo(options);
    
    // Set the view parameters
    this.view.level = mapSource.minLevel;
    this.view.maxLevel = mapSource.maxLevel;
    this.view.minLevel = mapSource.minLevel;
    
    // Initial call to get the right dimensions
    this.elementResized();
  }.bind(this));
  
  // Initialize the mouse event handler
  this.mouseInput = new $.MouseInput(options.element);
  
  this.mouseInput.addEventListener('drag', function(event) {
    
    this.view.offsetX -= event.delta.x;
    this.view.offsetY -= event.delta.y;
    
    this.changed();
  }.bind(this));
  
  this.mouseInput.addEventListener('zoom', function(event) {
    // Get the current position based on the event properties.
    var rect = viewport.getBoundingClientRect();
    var offsetX = event.clientX ? (event.clientX - rect.left) : rect.width / 2;
    var offsetY = event.clientY ? (event.clientY - rect.top) : rect.height / 2;
    
    // Calculate actual pixel coordinates of the map.
    var mapX = (offsetX + this.view.offsetX) * 100 / this.view.zoom;
    var mapY = (offsetY + this.view.offsetY) * 100 / this.view.zoom;

    // Do the zooming
    var delta = event.direction * 10;
    
    this.view.zoom = this.view.zoom + delta;
    this.view.zoom = Math.range(this.view.zoom, 10, 200);
    
    var zoomFactor = 100 / this.view.zoom;
    // Translate to a zoom level (0 = 100%, 1 = 50%, etc.
    this.view.level = Math.round(Math.log(zoomFactor) / Math.log(2));
    
    this.view.level = Math.range(this.view.level, this.view.minLevel, this.view.maxLevel);

    layers.style.transform = "scale(" + (this.view.zoom / 100) + ")";

    // Reposition the map
    mapX = mapX / 100 * this.view.zoom;
    this.view.offsetX = mapX - offsetX;

    mapY = mapY / 100 * this.view.zoom;
    this.view.offsetY = mapY - offsetY;
     
    // Redraw
    this.changed();
    
  }.bind(this));
  
  this.constrainPosition = function() {
    // Keep the position within the ranges, so the map doesn't get lost.
    var zoomFactor = 100 / this.view.zoom;
    var maxX = (tiledMap.source.width) / zoomFactor;
    var maxY = (tiledMap.source.height) / zoomFactor;
    this.view.offsetX = Math.range(this.view.offsetX, 0, maxX - this.view.width);
    this.view.offsetY = Math.range(this.view.offsetY, 0, maxY - this.view.height);

    // Position the layers container.
    layers.style.left = '-' + this.view.offsetX + 'px';
    layers.style.top = '-' + this.view.offsetY + 'px';
  }
  
  this.changed = function() {
    this.constrainPosition();
    
    this.render();
  }
  
  this.render = function() {
    for (var i = 0; i < this.view.level; i++) {
      this.element.querySelectorAll('.level' + i).forEach(function(element, index, list){
        element.style.display = 'none';
      });
    }
    for (var i = this.view.level; i <= this.view.maxLevel; i++) {
      this.element.querySelectorAll('.level' + i).forEach(function(element, index, list){
        element.style.display = 'block';
      });
    }
    tiledMap.getTiles(this.view, renderer.renderTile);
  };

  this.elementResized = (function(){
    var width = this.element.clientWidth;
    var height = this.element.clientHeight;
    this.view.width = width;
    this.view.height = height;

    this.changed();
    
  }).bind(this);
  
  window.addEventListener('resize', this.elementResized);
}


})(BigMap);