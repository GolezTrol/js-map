(function( $ ){
"use strict";

$.MouseInput = function(element) {
  
  var _this = this;
  
  this.events = new Events(this);
  
  // Dragging/moving
  var drag = null;
  
  function dragEvent(event) {
    event.totalDelta = drag.totalDelta;
    event.delta = drag.eventDelta;
    
    return event;
  }
  
  element.addEventListener('mousedown', function(event){
    drag = {
      // The current (screen) x and y of the event.
      mousePos: {x: event.screenX, y: event.screenY},
      // The total delta since the start of dragging.
      totalDelta: {x: 0, y: 0},
      // The relative delta since the previous event.
      eventDelta: {x: 0, y: 0},
    };
  }, true);
      
  document.addEventListener('mousemove', function(event) {
    if (drag === null)
      return;
      
    var newDelta = {
      x: event.screenX - drag.mousePos.x,
      y: event.screenY - drag.mousePos.y,
    }
    
    drag.eventDelta.x = newDelta.x - drag.totalDelta.x;
    drag.eventDelta.y = newDelta.y - drag.totalDelta.y;
    
    drag.totalDelta = newDelta;
    
    event.preventDefault();
    _this.events.fireEvent('drag', dragEvent(event));  
  }, true);

  document.addEventListener('mouseup', function(event) {
    if (drag != null) {
      _this.events.fireEvent('dragend', dragEvent(event));  
      drag = null;
    } else {
      _this.events.fireEvent('click', event);  
    }
  }, true);
  
  element.addEventListener('wheel', function(event){
    var delta = event.wheelDelta || event.wheelDeltaY;
    if (delta == 0) return;
    
    delta = delta > 0 ? 1 : -1;
    
    event.direction = delta;
    
    _this.events.fireEvent('zoom', event);
    
  }, true);
      
}

})(BigMap);