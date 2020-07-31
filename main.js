$ = document.querySelector.bind(document);

/*** resources ***/

// sound effects from sfxr.me
var sfx = {
  "rubber": "5EoyNVSymuxD8s7HP1ixqdaCn5uVGEgwQ3kJBR7bSoApFQzm7E4zZPW2EcXm3jmNdTtTPeDuvwjY8z4exqaXz3NGBHRKBx3igYfBBMRBxDALhBSvzkF6VE2Pv"
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
    player: null,
    pedro: null,
    ananas: null,
    
    init: function() {
        this.display = new ROT.Display(tileOptions);
        
        resetcanvas(this.display.getContainer());
        
        this._generateMap();
        
        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.pedro, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },
  
    destroy: function() {
      if (this.engine) {
        this.engine.lock();
        delete this.engine;
        delete window.Game;
      }
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
        this.pedro = this._createBeing(Pedro, freeCells);
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
            if (!i) { this.ananas = key; } /* first box contains an ananas */
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
    if (code == 13 || code == 32) {
        this._checkBox();
        return;
    }

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
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}
    
Player.prototype._checkBox = function() {
    var key = this._x + "," + this._y;
    if (Game.map[key] != "*") {
        alert("There is no box here!");
    } else if (key == Game.ananas) {
        alert("Hooray! You found a banana and won this game.");
        Game.engine.lock();
        window.removeEventListener("keydown", this);
    } else {
        alert("This box is empty :-(");
    }
}
    
var Pedro = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}
    
Pedro.prototype.getSpeed = function() { return 75; }
    
Pedro.prototype.act = function() {
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
    if (path.length == 1) {
        Game.engine.lock();
        alert("Game over - you were captured by Pedro!");
    } else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}
    
Pedro.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "P", "red");
}    

/*** graphics ***/

function resetcanvas(el) {
  show("#game");
  $("#canvas").innerHTML = "";
  $("#canvas").appendChild(el);
}

function rescale(x, y) {
  $("canvas").style.transform =
    "scale(" + (window.innerWidth < 600 ? "4" : "6") + ") " +
    "translate(" + ((x * -8) + (tileOptions.width * 8 / 2)) +
    "px," + ((y * -8) + (tileOptions.height * 8 / 2)) + "px)";
}

/*** user interface handlers ***/

$("#title").classList.add("fade-in");
function start() {
  $("#title").classList.add("hide");
  sfx["rubber"].play();
  Game.init();
}

function handlemenuchange(which) {
  var choice = which.getAttribute("value");
  show("#" + choice);
}

function show(which) {
  $(which).classList.remove("hide");  
  $(which).classList.add("fade-in");
}

function hide(which) {
  $(which).classList.remove("fade-in");
  $(which).classList.add("hide");
}

$("#canvas").innerHTML = "";
