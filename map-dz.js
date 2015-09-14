(function($) {
"use strict";

$.TiledMapDeepZoom = function() {

  this.source = {};
  this.tiles = [];
  
  this.loadFromXML = function(doc) {
    var source = this.source;
    
    var image = doc.documentElement;
    source.tileSize = parseInt(image.getAttribute('TileSize'));
    source.overlap = parseInt(image.getAttribute('Overlap'));
    source.format = image.getAttribute('Format');
    
    var size = image.querySelector('Size');
    source.width = parseInt(size.getAttribute('Width'));
    source.height = parseInt(size.getAttribute('Height'));
    
    var dimension = Math.max(source.width, source.height);


    source.internalLevels = Math.ceil(Math.log(dimension) / Math.log(2));
    source.minLevel = 0;
    source.maxLevel = 5; //source.internalLevels;
    
    source.imageSize = source.tileSize + source.overlap;
  }
  
  this.load = function(url, callback) {
    var request = new XMLHttpRequest();
    this.source.folder = url.slice(0, -4) + '_files';
    request.onreadystatechange = function() {
      if (request.readyState == 4 /* DONE */) {
        if (request.responseXML != null) {
          this.loadFromXML(request.responseXML);
          if (callback) {
            callback(this.source);
          }
        } else {
          console.log('No valid response');
        }
      }
    }.bind(this);
    request.open("GET", url, true);
    request.send();
  };
  
  this.getTilePath = function(source, level, x, y) {
    var levelFolder = source.internalLevels - level;
    return source.folder + '/' + levelFolder + '/' + x + '_' + y + '.' + source.format;
  }.bind(this, this.source);
  
  this.getTiles = function(view, callback) {
  
    // Determine the range of tiles to load.
    var factor =  100.0 / view.zoom;
    var level = view.level;
    
    var scaleFactor = Math.pow(2, view.level);
    
    var tileSize = this.source.tileSize * scaleFactor;
    var imageSize = this.source.imageSize * scaleFactor;
    var viewWidth = view.width * factor;
    var viewHeight = view.height * factor;
    
    var tileX = Math.floor(view.offsetX / tileSize);
    var tileOffsetX = -(view.offsetX % tileSize);
    var tileCountX = Math.ceil((view.width - tileOffsetX) / (this.source.tileSize) * factor);
    
    var tileY = Math.floor(view.offsetY / tileSize);
    var tileOffsetY = -(view.offsetY % tileSize);
    var tileCountY = Math.ceil((view.height - tileOffsetY) / (this.source.tileSize) * factor) ;
    
    // Load and return the tiles.
    for (var x = tileX; x < tileX + tileCountX; x++) {
      for (var y = tileY; y < tileY + tileCountY; y++) {
      
        // Try to find the tile in the cache.
        var tile = null;
        if (level in this.tiles) {
          if (x in this.tiles[level]) {
            if (y in this.tiles[level][x]) {
              tile = this.tiles[level][x][y];
            }
          }
        }
        
        // To do: Make a better estimation of what the image size will be based on the level to load and the full dimensions of the image.
        if (tile == null) {
          // Tile not found in the cache. Create a new one.
          tile = {
            image: new Image(),
            x: x * tileSize,
            y: y * tileSize,
            level: level,
            loaded: false,
            width: imageSize,
            height: imageSize,
            scaleFactor: scaleFactor,
          }
          
          // Image is prepared. Pre-render it already
          callback(tile);
          
          // Load the image.
          tile.image.addEventListener('load', (function(tile) {
            tile.loaded = true;
            tile.width = tile.image.width;
            tile.height = tile.image.height;
            callback(tile); // Send to the renderer again.
          }).bind(this, tile));
          tile.image.src = this.getTilePath(level, x, y);
          
          this.tiles[level] = this.tiles[level] || [];
          this.tiles[level][x] = this.tiles[level][x] || [];
          this.tiles[level][x][y] = tile; // Cache. Desirable? Or let browser cache handle this?
        } else {
          // Tile found in the cache. If it's loaded, draw it, otherwise, it will draw itself once the load event fires.
          if (tile.loaded) {
            callback(tile);
          }
        }
      }
    }
    
  }.bind(this);
  
  
}

})(BigMap);