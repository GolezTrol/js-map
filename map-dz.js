(function($) {
"use strict";

$.TiledMapDeepZoom = function() {

  this.source = {};
  this.tiles = [];
  
  this.load = function(source, callback) {
    // Should be read from 'efteling_plattegrond.xml', which should be passed in source.
    $.setProperties(this.source,
      {
        maxLevel: 13,
        minLevel: 8,
        folder: 'efteling_plattegrond_files',
        tileSize: 255,
        overlap: 1,
        imageSize: 256, // size + overlap
        width: 4795,
        height: 3374,
        format: 'jpg',
      });
    
    if (callback) {
      callback(this.source);
    }
    
  };
  
  this.getTilePath = function(source, level, x, y) {
    return source.folder + '/' + level + '/' + x + '_' + y + '.' + source.format;
  }.bind(this, this.source);
  
  this.getTiles = function(view, callback) {
    // Determine the range of tiles to load.
    var factor =  100.0 / view.zoom;
    var level = view.level;
    
    var scaleFactor = Math.pow(2, this.source.maxLevel - view.level);
    
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