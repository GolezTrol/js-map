(function( $ ){
"use strict";

$.Geo = function(source) {
  var g = source.geoPoints;

  this.geoFromPixel = function(pixel1, pixel2, pixelRange, geo1, geo2)
  {
    var reverse = false;
    var pixelDiff = pixel2 - pixel1;
    
    var geoDiff = geo2 - geo1;

    if (geoDiff < 0) {
      geoDiff = -geoDiff;
      var swap = geo2; geo2 = geo1; geo1 = swap;
      reverse = true;
    }

    var pixelFactor = pixelRange / pixelDiff;

    var geoDist = geoDiff * pixelFactor;
    var pixelMinFactor = pixel1 / pixelRange;
    var geoMin = geo1 - geoDist * pixelMinFactor;
    var geoMax = geo1 + geoDist;
    
    return {
      geoMin: geoMin,
      geoMax: geoMax,
      reverse: reverse
    }
  }
  
  this.geoToPixel(lat, lon) {
    
  }
  
  var topLon = this.geoFromPixel(g.topLeft.x, g.topRight.x, source.mapWidth, g.topLeft.lon, g.topRight.lon);
  var bottomLon = this.geoFromPixel(g.bottomLeft.x, g.bottomRight.x, source.mapWidth, g.bottomLeft.lon, g.bottomRight.lon);

  var leftLat = this.geoFromPixel(g.topLeft.y, g.bottomLeft.y, source.mapHeight, g.topLeft.lat, g.bottomLeft.lat);
  var rightLat = this.geoFromPixel(g.topRight.y, g.bottomRight.y, source.mapHeight, g.topRight.lat, g.bottomRight.lat);
  
  this.mapDimensions = {
    topLeft: { 
      x: 0, y: 0, 
      lat: leftLat.geoMin, lon: topLon.geoMin,},
    bottomLeft: { 
      x: 0, y: source.mapHeight, 
      lat: leftLat.geoMax, lon: bottomLon.geoMin,},
    topRight: { 
      x: source.mapWidth, y: 0, 
      lat: rightLat.geoMin, lon: topLon.geoMax,},
    bottomRight: { 
      x: source.mapWidth, y: source.mapHeight, 
      lat: rightLat.geoMax, lon: bottomLon.geoMax,},
  }

}

})(BigMap);