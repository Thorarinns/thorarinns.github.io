/*global define */

define(['controls'], function(controls) {

  var PLAYER_SPEED = 600;
  var JUMP_VELOCITY = 1500;
  var GRAVITY = 3000;
  var PLAYER_HALF_WIDTH = 45;
  var PLAYER_RADIUS = 30;
  var PLAYER_HALF_FOOT = 30;


  var Player = function(el, game) {
    this.pause = false;
    this.el = el;
    this.game = game;
    this.highest = 0;
    this.killscore = 0;
    this.lastscore = 0;
    this.left = true;

    controls.on('pause', this.onPause.bind(this));
    controls.on('mute', this.onMute.bind(this));
  };

  Player.prototype.reset = function() {
    this.pos = { x: 300, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.highest = 0;
    this.killscore = 0;
  }
  Player.prototype.onPause = function(){
    if (!this.pause){
      this.game.freezeGame();
      this.pause = true;
    }
    else{
      this.game.unFreezeGame();
      this.pause = false;
    }
  };
  Player.prototype.onMute = function(){
    if(this.game.audio.paused)
        this.game.audio.play();
      else
        this.game.audio.pause();
  }

  Player.prototype.onFrame = function(delta) {
    this.vel.x = controls.inputVec.x * PLAYER_SPEED;
    var score = Math.floor((this.killscore-this.highest)/10);
    if (this.lastscore !== score)
      this.game.scoreEl.html('<p>Score: ' + score + '</p>');
    this.lastscore = score;




    //Gravity
    this.vel.y += GRAVITY * delta;

    var oldY = this.pos.y;
    this.pos.x += delta * this.vel.x;
    this.pos.y += delta * this.vel.y;

    if (this.pos.y >= 0)
    {
      this.vel.y = -JUMP_VELOCITY;
      this.pos.y = 0;
    }
    this.checkPlatforms(oldY);
    this.checkGameOver();
    this.checkEnemies();

    //Off screen magic
    if (this.pos.x + PLAYER_HALF_WIDTH < 0)
    {
      this.pos.x = 720 - PLAYER_HALF_WIDTH;
    }
    else if (this.pos.x+PLAYER_HALF_WIDTH > 720)
    {
      this.pos.x = 0 - PLAYER_HALF_WIDTH;
    }

    // Update UI
    this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');

    if (this.game.controls.left && !this.left){
      this.el.toggleClass('Right');
      this.left = true;
    }
    else if(!this.game.controls.left && this.left){
      this.el.toggleClass('Right');
      this.left = false;
    }


    if (this.pos.y < this.highest)
      this.highest = this.pos.y;
  };

  Player.prototype.checkGameOver = function() {
    if (this.pos.y > this.game.viewport.y) {
      this.game.gameOver();
    }
  };

  Player.prototype.checkPlatforms = function(oldY) {
    var that = this;

    that.game.forEachPlatform(function(p) {
      // Are we crossing Y.
      if (p.rect.y <= oldY*(-1) && p.rect.y > that.pos.y*(-1)) {

        // Are inside X bounds.
        if (that.pos.x+PLAYER_HALF_FOOT + PLAYER_HALF_WIDTH >= p.rect.x && that.pos.x - PLAYER_HALF_FOOT + PLAYER_HALF_WIDTH <= p.rect.right) {
          // COLLISION. Let's stop gravity.
          that.pos.y = -p.rect.y-16;
          that.vel.y = -JUMP_VELOCITY;
          if(p.type === "master")
          {
            that.game.forEachEnemy(function(e) {
              e.dead = true;
              that.killscore+=500;
            });
            that.vel.y = -JUMP_VELOCITY*5;
            that.game.nextEnemy = 9001;
          }
          if(p.type === "ultra")
          {
            if (p.left){
              if(p.rect.x < 220){
                p.left = false;
                p.current += 50;
                p.rect.x += 50;
                p.rect.right += 50;
              }
              else
              {
                p.current -= 50;
                p.rect.x -= 50;
                p.rect.right -= 50; 
              }

              p.el.css('transform', 'translate3d(' + p.current + 'px,' + 0 + 'px,0)');
            }
            else{
              if(p.rect.x > 500){
                p.left = true;
                p.current -= 50;
                p.rect.x -= 50;
                p.rect.right -= 50;  
              }
              else{
                p.current += 50;
                p.rect.x += 50;
                p.rect.right += 50;
              }
            
              p.el.css('transform', 'translate3d(' + p.current + 'px,' + 0 + 'px,0)');
            }
          }
        }
      }
      if (-p.rect.y>that.game.viewport.y)
        p.dead = true;
    });
  };


  Player.prototype.checkEnemies = function() {
    var centerX = this.pos.x+40;
    var centerY = this.pos.y - 40;
    var that = this;
    this.game.forEachEnemy(function(enemy) {
      // Distance squared
      var distanceX = enemy.pos.x - centerX;
      var distanceY = enemy.pos.y-44 - centerY;

      // Minimum distance squared
      var distanceSq = distanceX * distanceX + distanceY * distanceY;
      var minDistanceSq = (enemy.radius + PLAYER_RADIUS) * (enemy.radius + PLAYER_RADIUS);

      // What up?
      if (distanceSq < minDistanceSq) {
        //Mario 1 mechanics
        if(that.vel.y > 0){
          //that.game.entities.splice(that.game.entities.indexOf(enemy),1);
          enemy.dead = true;
          that.killscore += 500;
          that.vel.y = -(JUMP_VELOCITY);
        }
        else
          that.game.gameOver();
      }

      //check if off screen
      if (enemy.pos.y>that.game.viewport.y)
        enemy.dead = true;
    });
  };

  return Player;
});
