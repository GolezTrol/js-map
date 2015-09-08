Events = function (source) {
"use strict";

  // based on http://stackoverflow.com/questions/10978311/implementing-events-in-my-own-object
  var _this = this;
  _this.events = {};

  _this.addEventListener = function(name, handler) {
    if (_this.events.hasOwnProperty(name)) {
      _this.events[name].push(handler);
    } else {
      _this.events[name] = [handler];
    }
  };

  _this.removeEventListener = function(name, handler) {
    if (!_this.events.hasOwnProperty(name)) {
      return;
    }

    var index = _this.events[name].indexOf(handler);
    if (index != -1) {
      _this.events[name].splice(index, 1);
    }
  };

  _this.fireEvent = function(name) {
    if (!_this.events.hasOwnProperty(name)) {
      return;
    }

    var args = [];
    for (var i = 1; i < arguments.length; ++i) {
      args.push(arguments[i]);
    }
    
    if (!args || !args.length) {
      args = [];
    }

    var evs = _this.events[name], l = evs.length;
    for (var i = 0; i < l; i++) {
      evs[i].apply(null, args);
    }
  };
  
  source.addEventListener = _this.addEventListener;
  source.removeEventListener = _this.addEventListener;
}
