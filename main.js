$ = document.querySelector.bind(document);

/*** resources ***/

// sound effects from sfxr.me
var sfx = {
  "rubber": "5EoyNVaezhPnpFZjpkcJkF8FNCioPncLoztbSHU4u9wDQ8W3P7puffRWvGMnrLRdHa61kGcwhZK3RdoDRitmtwn4JjrQsZCZBmDQgkP5uGUGk863wbpRi1xdA",
  "step1": "34T6PkwiBPcxMGrK7aegATo5WTMWoP17BTc6pwXbwqRvndwRjGYXx6rG758rLSU5suu35ZTkRCs1K2NAqyrTZbiJUHQmra9qvbBrSdbBbJ7JvmyBFVDo6eiVD",
  "option": "34T6PkzXyyB6jHiwFztCFWCTX5oxdNq2D1HnxL9evKJV5eYK2ESUG8QUB2QvmqTdMmFHVjKLwJRYZR4QgenUUmG2AfG3rrieQTXbsM6ZYz52LHRu74TuRpnQX",
  "choice": "34T6PkzXyyB6jHiwFztCFWEWsogkzrhzAH3FH2d97BCuFhqmZgfuXG3xtz8YYSKMzn95yyX8xZXJyesKmpcjpEL3dPP5h2e8mt5MmhExAksyqZyqgavBgsWMd",
  "hide": "34T6PkzXyyB6jHiwFztCFWEniygA1GJtjsQuGxcd38JLDquhRqTB28dQgigseMjQSjSY14Z3aBmAtzz9KWcJZ2o9S1oCcgqQY4dxTAXikS7qCs3QJ3KuWJUyD",
  "miss": "111112RrwhZ2Q7NGcdAP21KUHHKNQa3AhmK4Xea8mbiXfzkxr9aX41M8XYt5xYaaLeo9iZdUKUVL3u2N6XASue2wPv2wCCDy6W6TeFiUjk3dXSzFcBY7kTAM",
  "win": "34T6Pkv34QJsqDqEa8aV4iwF2LnASMc3683oFUPKZic6kVUHvwjUQi6rz8qNRUHRs34cu37P5iQzz2AzipW3DHMoG5h4BZgDmZnyLhsXgPKsq2r4Fb2eBFVuR",
  "lose": "7BMHBGHKKnn7bgcmGprqiBmpuRaTytcd4JS9eRNDzUTRuQy8BTBzs5g8XzS7rrp4C9cNeSaqAtWR9qdvXvtnWVTmTC8GXgDuCXD2KyHJNXzfUahbZrce8ibuy",
}

for (var s in sfx) {
  sfx[s] = (new SoundEffect(sfx[s])).generate().getAudio();
}

// tileset from kenney.nl

var tileSet = document.createElement("img");
tileSet.src = "colored_tilemap_packed.png";

var tileOptions = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 8,
    tileHeight: 8,
    tileSet: tileSet,
    tileMap: {
        "@": [40, 0],
        ".": [32, 32],
        "P": [88, 0],
        "*": [72, 24]
    },
    width: 25,
    height: 40
}

/*** game code ***/

// based on a tutorial by Ondřej Žára
// www.roguebasin.com/index.php?title=Rot.js_tutorial,_part_1

var Game = {
    display: null,
    map: {},
    engine: null,
    scheduler: null,
    player: null,
    monster: null,
    amulet: null,
    
    init: function() {
        this.display = new ROT.Display(tileOptions);
        resetcanvas(this.display.getContainer());

        this._generateMap();

        this.scheduler = new ROT.Scheduler.Simple();
        this.scheduler.add(this.player, true);
        this.scheduler.add(this.monster, true);

        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    },
  
    destroy: function() {
      if (this.engine) {
        this.engine.lock();
        this.display = null;
        this.map = {};
        this.engine = null;
        this.scheduler.add(this.player, true);
        this.scheduler.add(this.monster, true);
        this.scheduler = null;
        this.player = null;
        this.monster = null;
        this.amulet = null;
      }
      window.removeEventListener("keydown", this.player);
      resetcanvas();
      $("#title").classList.remove("hide");
      $("#game").classList.remove("show");
    },
    
    _generateMap: function() {
        var digger = new ROT.Map.Digger(tileOptions.width, tileOptions.height);
        var freeCells = [];
        
        var digCallback = function(x, y, value) {
            if (value) { return; }
            
            var key = x+","+y;
            this.map[key] = ".";
            freeCells.push(key);
        }
        digger.create(digCallback.bind(this));
        
        this._generateBoxes(freeCells);
        this._drawWholeMap();
        
        this.player = this._createBeing(Player, freeCells);
        rescale(this.player._x, this.player._y);
        this.monster = this._createBeing(Monster, freeCells);
    },
    
    _createBeing: function(what, freeCells) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new what(x, y);
    },
    
    _generateBoxes: function(freeCells) {
        for (var i=0;i<10;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "*";
            if (!i) { this.amulet = key; } /* first box contains the amulet */
        }
    },
    
    _drawWholeMap: function() {
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    }
};

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;

    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    var newKey = newX + "," + newY;
    if (!(newKey in Game.map)) { return; }

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    this._draw();
    rescale(newX, newY);
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
    sfx["step1"].play();
    this._checkBox();
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

Player.prototype._checkBox = function() {
    var key = this._x + "," + this._y;
    if (Game.map[key] != "*") {
        //sfx["miss"].play();
        //console.log("There is no box here!");
    } else if (key == Game.amulet) {
        console.log("Hooray! You found a banana and won this game.");
        for (var i=0; i<5; i++) {
          setTimeout(function() {
            sfx["win"].play();
          }, 100 * i);
        }
        Game.destroy();
    } else {
        console.log("This box is empty :-(");
        sfx["miss"].play();
    }
}
    
var Monster = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}
    
Monster.prototype.getSpeed = function() { return 75; }
    
Monster.prototype.act = function() {
    var x = Game.player.getX();
    var y = Game.player.getY();

    var passableCallback = function(x, y) {
        return (x+","+y in Game.map);
    }
    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length <= 1) {
        Game.engine.lock();
        console.log("Game over - you were captured by The Monster!");
        sfx["lose"].play();
        Game.destroy();
    } else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}
    
Monster.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "P", "red");
}    

/*** graphics ***/

function resetcanvas(el) {
  show("#game");
  $("#canvas").innerHTML = "";
  if (el) {
    $("#canvas").appendChild(el);
  }
}

function rescale(x, y) {
  var c = $("canvas");
  if (canvas) {
    canvas.style.transform =
      "scale(" + (window.innerWidth < 600 ? "4" : "6") + ") " +
      "translate(" + ((x * -8) + (tileOptions.width * 8 / 2)) +
      "px," + ((y * -8) + (tileOptions.height * 8 / 2)) + "px)";
  }
}

/*** user interface handlers ***/

function start() {
  $("#title").classList.add("hide");
  sfx["rubber"].play();
  Game.init();
}

function handlemenuchange(which) {
  var choice = which.getAttribute("value");
  show("#" + choice);
  sfx["choice"].play();
}

function show(which) {
  $(which).classList.remove("hide");  
  $(which).classList.add("show");
}

function hide(which) {
  $(which).classList.remove("show");
  $(which).classList.add("hide");
}
