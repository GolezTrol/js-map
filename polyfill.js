NodeList.prototype.forEach = NodeList.prototype.forEach || function(callback, thisArg) {
"use strict";

  for(var i = 0; i < this.length; i++) {
    callback.call(thisArg, this[i], i, this);
  }
}