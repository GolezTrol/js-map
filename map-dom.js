(function( $ ){
"use strict";

$.setProperties = function(obj, properties) {
  for(var p in properties) {
    if (properties.hasOwnProperty(p)) {
      obj[p] = properties[p];
    }
  }
}

$.createElement = function(tagName, properties, parent) {
  var element = document.createElement(tagName);
  if (properties) {
    $.setProperties(element, properties);
  }
  
  if (parent) {
    parent.appendChild(element);
  }
  
  return element;
}

})(BigMap);