NodeList.prototype.forEach = NodeList.prototype.forEach || function(callback, thisArg) {
"use strict";

  for(var i = 0; i < this.length; i++) {
    callback.call(thisArg, this[i], i, this);
  }
}

Math.range = function(a, min, max) {
  if (min > max) max = min;
  return Math.min(Math.max(a, min), max);
}