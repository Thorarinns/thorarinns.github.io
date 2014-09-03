/*global define */

define(function() {

  var Platform = function(rect, type, options) {
    this.rect = rect;
    this.rect.right = rect.x + rect.width;
    this.rect.width = rect.width;
    this.type = type;
    this.dead = false;
    this.current = 0;
    if(this.rect.x>360)
      this.left = true;
    else
      this.left = false;
    if(options != undefined){
      this.pos = {};
      this.start = options.start;
      this.end = options.end;
      this.duration = options.duration || 5;
    }

    if (this.type == "great")
    {
      this.el = $('<div class="platform great">');
    }
    else if (this.type == "ultra")
    {
      this.el = $('<div class="platform ultra">');
    }
    else if (this.type == "master")
    {
      this.el = $('<div class="platform master">');
    }
    else{
      this.el = $('<div class="platform">');
    }
    this.el.css({
      left: rect.x,
      bottom: rect.y,
      width: rect.width,
      height: 2
    });
  };

  Platform.prototype.onFrame = function(delta) {
    if(this.dead){
      this.el.remove();
      return;
    }


    if (this.type !== "great")
      return;
    this.current = (this.current + delta) % this.duration;

    var relPosition = Math.sin((Math.PI * 2) * (this.current / this.duration)) / 2 + 0.5;

    this.pos.x = this.start.x + (this.end.x - this.start.x) * relPosition;
    this.pos.y = this.start.y + (this.end.y - this.start.y) * relPosition;
    this.rect.x = this.pos.x;
    this.rect.right = this.rect.x + this.rect.width;
    this.rect.y = -this.pos.y;
    // Update UI
    this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');
  };

  return Platform;
});
