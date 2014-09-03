/*global define, $ */

define([], function() {
  /**
   * Controls singleton class.
   * @constructor
   */

     var KEYS = {
      37: 'left',
      39: 'right',
      80: 'p',
      65: 'a',
      68: 'd',
      77: 'm'
  };

  var FULL_ANGLE = 20;

  var Controls = function() {
    this.left = true;
    this.keys = {};
    this.inputVec = { x: 0, y: 0 };
    this.tilt = 0;

    $(window)
      .on('keydown', this.onKeyDown.bind(this))
      .on('keyup', this.onKeyUp.bind(this))
      .on('deviceorientation', this.onOrientation.bind(this))
      .on('touchstart', this.onTouch.bind(this));
  };

  Controls.prototype = new EventEmitter2();

  Controls.prototype.onOrientation = function(e) {
    e = e.originalEvent;
    if (e.gamma == null) {
      return;
    }

    var degree = e.gamma;

    if (window.orientation) {
      var dir = window.orientation / 90;
      degree = e.beta * dir;
    }

    var speed = degree / FULL_ANGLE;
    this.tilt = Math.max(Math.min(speed, 1), -1);
  };

  Controls.prototype.onTouch = function(e) {
    this.emit('pause');
  };


  Controls.prototype.onKeyDown = function(e) {
    if (e.keyCode in KEYS) {
      var keyName = KEYS[e.keyCode];
      this.keys[keyName] = true;

      if (keyName === 'm')
        this.emit('mute'); 
      if (keyName === 'p')
        this.emit('pause');
      return false;
    }
  };

  Controls.prototype.onKeyUp = function(e) {
    if (e.keyCode in KEYS) {
      var keyName = KEYS[e.keyCode];
      this.keys[keyName] = false;
    }
  };

  Controls.prototype.onFrame = function() {
    var that = this;
    if (this.keys.right || this.keys.d) {
      if(this.keys.left || this.keys.a)
        this.inputVec.x = 0
      else
      {
        this.inputVec.x = 1;
        if(this.left)
        {
          this.left = false;
        }
      }
    } else if (this.keys.left || this.keys.a) {
      this.inputVec.x = -1;
      if(!this.left)
        {
          this.left = true;
        }
    } else {
      this.inputVec.x = 0;
    }


    if (this.inputVec.x === 0) {
      this.inputVec.x = this.tilt;
      if (this.inputVec < 0)
        this.left = true;
      else
        this.right = false;
    }
  };
  
  // Export singleton.
  return new Controls();
});
