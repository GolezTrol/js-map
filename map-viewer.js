(function( $ ){
"use strict";

$.Viewer = function(options) {
  this.element = options.element;
  
  this.view = {
    maxLevel: 13,
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
    
    // Set the view parameters
    this.view.maxLevel = mapSource.maxLevel;
    this.view.minLevel = mapSource.minLevel;
  }.bind(this));
  
  // Initialize the mouse event handler
  this.mouseInput = new $.MouseInput(options.element);
  
  this.mouseInput.addEventListener('drag', function(event) {
    
    this.view.offsetX -= event.delta.x;
    this.view.offsetY -= event.delta.y;
    
    this.changed();
  }.bind(this));
  
  this.mouseInput.addEventListener('zoom', function(event) {
    
    var delta = event.direction * 10;
    
    this.view.zoom = this.view.zoom + delta;
    this.view.zoom = Math.range(this.view.zoom, 10, 200);
    
    // To do: Let the TiledMap loader handle the translation from 0..x to 13..8
    var zoomFactor = 100 / this.view.zoom;
    // Translate to a zoom level (0 = 100%, 1 = 50%, etc.
    var scaleFactor = Math.log(zoomFactor) / Math.log(2);
    // Translate that to the ranges of the DZ.
    this.view.level = Math.round(this.view.maxLevel - scaleFactor);
    
    this.view.level = Math.range(this.view.level, this.view.minLevel, this.view.maxLevel);

    layers.style.transform = "scale(" + (this.view.zoom / 100) + ")";
    
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

    this.changed();
    
  }).bind(this);
  
  window.addEventListener('resize', this.elementResized);
  
  // Initial call to get the right dimensions
  this.elementResized();
}


})(BigMap);