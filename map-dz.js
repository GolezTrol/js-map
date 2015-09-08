(function($) {
"use strict";

$.TiledMapDeepZoom = function() {

  this.source = {};
  this.tiles = [];
  
  this.load = function(source, callback) {
    // Should be read from 'efteling_plattegrond.xml', which should be passed in source.
    $.setProperties(this.source,
      {
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
    var tileX = Math.floor(view.offsetX / this.source.tileSize);
    var tileOffsetX = -(view.offsetX % this.source.tileSize);
    var tileCountX = Math.ceil((view.width - tileOffsetX) / (this.source.tileSize));

    var tileY = Math.floor(view.offsetY / this.source.tileSize);
    var tileOffsetY = -(view.offsetY % this.source.tileSize);
    var tileCountY = Math.ceil((view.height - tileOffsetY) / (this.source.tileSize));
    
    // Load and return the tiles.
    for (var x = tileX; x < tileX + tileCountX; x++) {
      for (var y = tileY; y < tileY + tileCountY; y++) {
      
        // Try to find the tile in the cache.
        var tile = null;
        if (view.level in this.tiles) {
          if (x in this.tiles[view.level]) {
            if (y in this.tiles[view.level][x]) {
              tile = this.tiles[view.level][x][y];
            }
          }
        }
        if (tile == null) {
          // Tile not found in the cache. Create a new one.
          tile = {
            image: new Image(),
            x: x * (this.source.tileSize),
            y: y * (this.source.tileSize),
            level: view.level,
            loaded: false,
          }

          // Image is prepared. Pre-render it already
          callback(tile);
          
          // Load the image.
          tile.image.addEventListener('load', (function(tile) {
            tile.loaded = true;
            callback(tile); // Send to the renderer again, just in case
          }).bind(this, tile));
          tile.image.src = this.getTilePath(view.level, x, y);
          
          this.tiles[view.level] = this.tiles[view.level] || [];
          this.tiles[view.level][x] = this.tiles[view.level][x] || [];
          this.tiles[view.level][x][y] = tile; // Cache. Desirable?
        } else {
          // Nothing to do here?
          /*// Tile found in the cache. If it's loaded, draw it, otherwise, it will draw itself once the load event fires.
          if (tile.loaded) {
            callback(tile);
          }*/
        }
      }
    }
    
  }.bind(this);
  
  
}

})(BigMap);