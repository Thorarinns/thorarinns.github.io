/*global define, $ */

define(['player', 'platform', 'enemy', 'controls'], function(Player, Platform, Enemy, controls) {
  /**
   * Main game class.
   * @param {Element} el DOM element containig the game.
   * @constructor
   */
  var VIEWPORT_PADDING = 700;


  var Game = function(el) {
    this.el = el;
    this.controls = controls;
    this.player = new Player(this.el.find('.player'), this);
    this.entities = [];
    this.platformsEl = el.find('.platforms');
    this.entitiesEl = el.find('.entities');
    this.worldEl = el.find('.world');
    this.backgroundEl = el.find('.background');
    this.pauseEl = el.find('.pause');
    this.scoreEl = el.find('.score');
    this.deathscreenEl = el.find('.deathscreen');
    this.deathscoreEl = el.find('.deathscore');
    this.deadbutton = el.find('.deadbutton');
    this.menuEl = el.find('.menu');
    this.isPlaying = false;
    this.audio = el.find('.loop').get(0);
    this.nextPlatform = 10;
    this.nextEnemy = 1000;
    this.backgroundChange = 4000;
    this.mutedsound = false;

    // Cache a bound onFrame since we need it each frame.
    this.onFrame = this.onFrame.bind(this);


    var game = this;
    $( ".deadbutton" ).click(function() {
      game.deathscreenEl.css('transform', 'translate3d(-740px,0,0)');
      game.start();
    });

    $( ".startgame" ).click(function() {
      game.menuEl.css('transform', 'translate3d(-750px,0,0)');
      game.start();
    });
    $( ".mutemusic" ).click(function() {
      if(game.audio.paused)
        game.audio.play();
      else
        game.audio.pause();
    });
    $( ".mutesounds" ).click(function() {
      if(game.mutesounds){
        game.mutesounds = false;
      }
      else{
        game.mutesounds = true;
      }
    });
  };






  Game.prototype.freezeGame = function() {
    this.isPlaying = false;
  };

  Game.prototype.unFreezeGame = function() {
    if (!this.isPlaying) {
      this.isPlaying = true;

      // Restart the onFrame loop
      this.lastFrame = +new Date() / 1000;
      requestAnimFrame(this.onFrame);
    }
  };

  Game.prototype.gameOver = function() {
    var score = Math.floor((this.player.killscore-this.player.highest)/10);
    var highscore = this.getCookie("highscore");
    if (highscore == null || highscore < score){
      highscore = score;
      this.setCookie("highscore", highscore, 9999);
    }

    this.deathscoreEl.html('<p>Score: ' + score +'<br> Highscore: ' +highscore +  '</p>');
    this.deathscreenEl.css('transform', 'translate3d(740px,0,0)');
    this.freezeGame();
    
  };

  /**
   * Starts the game.
   */
  Game.prototype.start = function() {
    // Cleanup last game.
    this.entities.forEach(function(e) { e.el.remove(); });
    this.entities = [];



    this.createWorld();
    this.player.reset();

    this.viewport = {x: 0, y: 0, width: 720, height: 1280};

    // Then start.
    this.unFreezeGame();
  };

  Game.prototype.addEnemy = function(enemy) {
    this.entities.push(enemy);
    this.entitiesEl.append(enemy.el);
  };

 //adds starting platforms 
  Game.prototype.createWorld = function() {

    var great = "great";
    var ultra = "ultra";
    var master = "master";
    // Ground
    this.addPlatform(new Platform({
      x: 100,
      y: 250,
      width: 100
    }));

    this.addPlatform(new Platform({
      x: 400,
      y: 500,
      width: 100
    }));

    this.addPlatform(new Platform({
      x: 300,
      y: 750,
      width: 100
    }, ultra));

    this.addPlatform(new Platform({
      x: 125,
      y: 900,
      width: 100
    }));
    this.addPlatform(new Platform({
      x: 500,
      y: 1200,
      width: 100
    }));
    this.addPlatform(new Platform({
      x: 100,
      y: 1450,
      width: 100
    }));

    this.addPlatform(new Platform({
      x: 0,
      y: 0,
      width: 720
    }));

     this.addPlatform(new Platform({
      x: 600,
      y: 250,
      width: 16
    },master));

     this.addEnemy(new Enemy({
      start: {x: 50, y: -500},
      end: {x: 400, y: -500}
    }));
  };


  Game.prototype.addPlatform = function(platform) {
    this.entities.push(platform);
    this.platformsEl.append(platform.el);
  };

  Game.prototype.forEachPlatform = function(handler) {
    for (var i = 0, e; e = this.entities[i]; i++) {
      if (e instanceof Platform) {
        handler(e);
      }
    }
  };

  Game.prototype.forEachEnemy = function(handler) {
    for (var i = 0, e; e = this.entities[i]; i++) {
      if (e instanceof Enemy) {
        handler(e);
      }
    }
  };

  /**
   * Cross browser RequestAnimationFrame
   */
  var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();




  /**
   * Runs every frame. Calculates a delta and allows each game entity to update itself.
   */
  Game.prototype.onFrame = function() {
    this.pauseEl.toggleClass('nat',!this.isPlaying);
    if (!this.isPlaying) {
      return;
    }

    var now = +new Date() / 1000,
        delta = now - this.lastFrame;
    this.lastFrame = now;

    controls.onFrame(delta);
    this.player.onFrame(delta);



    this.updateViewport();
    for (var i = 0, e; e = this.entities[i]; i++) {
      e.onFrame(delta);

      if (e.dead) {
        this.entities.splice(i--, 1);
      }
    }

    // Request next frame.
    requestAnimFrame(this.onFrame);
  };



  Game.prototype.updateViewport = function() {
    var maxY = this.viewport.y - this.viewport.height + VIEWPORT_PADDING;
    var playerY = this.player.pos.y;
    var oldportY = this.viewport.y;
    var enemyY;
    if (playerY < maxY){
      
      
      this.viewport.y = playerY + this.viewport.height - VIEWPORT_PADDING;



      //Time to create a new platform yo
      this.nextPlatform += (this.viewport.y - oldportY);
      if (this.nextPlatform <= 0){
        this.nextPlatform = 65;
        this.createPlatforms();     
      }
      
      this.nextEnemy += (this.viewport.y - oldportY);
      if (this.nextEnemy <= 0){
        this.nextEnemy = (Math.random()*(2000-Math.sqrt(-this.viewport.y))+200);
        this.createEnemies();
      }
    }
      this.worldEl.css('transform', 'translate3d(' + 0 + 'px,' + (-this.viewport.y) + 'px,0)');

  };

  Game.prototype.createPlatforms = function() {
        var randoom = Math.random()*100;
        var that = this;
        var type = undefined;
        var chance = (Math.sqrt(-that.viewport.y)/10);
        if (randoom > 99.5){
          type = "master";
          that.addPlatform(new Platform({
          x: Math.floor(Math.random()*600+15),
          y: -Math.floor((this.viewport.y-Math.random()*400-1280)),
          width: 16},type));
        return;
        }
        else if (chance+randoom > 90)
          type = "ultra";
        else if (chance+randoom > 80-chance){
          type = "great";
          if (Math.random()*100 > 50){
              platformY = Math.floor(this.viewport.y - Math.random() * 200 - 1280);
              this.addPlatform(new Platform({
              x: 0,
              y: 0,
              width: 100
              },type,{
              start: {x: Math.random() * 620, y: platformY},
              end: {x: Math.random() * 620, y: platformY}
            }));
          }
          else{
              platformX = Math.floor(Math.random() * 620);
              this.addPlatform(new Platform({
              x: 0,
              y: 0,
              width: 100
              },type,{
              start: {x: platformX, y: (this.viewport.y-Math.random()*700-1280)},
              end: {x: platformX, y: (this.viewport.y-Math.random()*700-1280)}
            }));
          }
          return;
        }
        this.addPlatform(new Platform({
          x: Math.floor(Math.random()*600+15),
          y: -Math.floor((this.viewport.y-Math.random()*200-1280)),
          width: 100
        },type));
  };
  Game.prototype.createEnemies = function() {
        enemyY = Math.floor(this.viewport.y - Math.random() * 300 - 1280);
        this.addEnemy(new Enemy({
          start: {x: Math.random() * 720, y: enemyY},
          end: {x: Math.random() * 720, y: enemyY}
        }));
  };

  Game.prototype.setCookie = function(c_name,value,exdays){
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  };

  Game.prototype.getCookie = function(c_name){
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1)
      {
      c_start = c_value.indexOf(c_name + "=");
      }
    if (c_start == -1)
      {
      c_value = null;
      }
    else
      {
      c_start = c_value.indexOf("=", c_start) + 1;
      var c_end = c_value.indexOf(";", c_start);
      if (c_end == -1)
      {
        c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
      }
    return c_value;
};

  return Game;
});