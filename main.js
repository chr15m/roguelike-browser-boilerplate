// Update this string to set the game title
var gametitle = "My Rogue";

// utilities
$ = document.querySelector.bind(document);
NodeList.prototype.forEach = Array.prototype.forEach

// this code sets the game title to the string above
document.querySelectorAll(".game-title-text").forEach(function(t) {
  t.textContent = gametitle;
})

/***
 *** resources
 ***/

// These sound effects are from sfxr.me
//
// You can generate your own and click the "copy" button
// to get the sound code.

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

// This tileset is from kenney.nl
// It's the "microrogue" tileset

var tileSet = document.createElement("img");
tileSet.src = "colored_tilemap_packed.png";

// This is where you specify which tile each character uses

var tileOptions = {
  layout: "tile",
  bg: "transparent",
  tileWidth: 8,
  tileHeight: 8,
  tileSet: tileSet,
  tileMap: {
    "@": [40, 0],
    ".": [32, 32],
    "M": [88, 0],
    "*": [72, 24],
    "a": [40, 32],
    "b": [32, 40],
    "c": [40, 40],
    "d": [48, 40],
    "e": [56, 40],
    "T": [72, 56],
    "╔": [0, 72],
    "╗": [24, 72],
    "╝": [72, 72],
    "╚": [48, 72],
    "═": [8, 72],
    "║": [32, 72],
    "o": [40, 72],
  },
  width: 25,
  height: 40
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

var tapMap = {};
tapMap[0] = 6;
tapMap[1] = 0;
tapMap[2] = 2;
tapMap[3] = 4;

/***
 *** game code
 ***/

// based on a tutorial by Ondřej Žára
// www.roguebasin.com/index.php?title=Rot.js_tutorial,_part_1

if (window["Game"]) {
  Game.destroy();
  Game.init();
}

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
    window.removeEventListener("keydown", this.player);
    $("#game").removeEventListener("touchstart", handletouch);
    $("#game").removeEventListener("click", handletouch);
    if (this.engine) {
      this.engine.lock();
      // this.display.clear();
      this.display = null;
      this.map = {};
      this.engine = null;
      this.scheduler.remove(this.player);
      this.scheduler.remove(this.monster);
      this.scheduler = null;
      this.player = null;
      this.monster = null;
      this.amulet = null;
    }
    resetcanvas();
    showtitle();
    $("#game").classList.remove("show");
  },
  
  _generateMap: function() {
    var digger = new ROT.Map.Digger(tileOptions.width, tileOptions.height);
    var freeCells = [];
    var zeroCells = [];
    
    var digCallback = function(x, y, value) {
      var key = x+","+y;
      if (value) {
        zeroCells.push(key);
      } else {
        this.map[key] = ".";
        freeCells.push(key);
      }
    }
    digger.create(digCallback.bind(this));

    this._generateBoxes(freeCells);
    this._generateShrubberies(zeroCells);
    this._drawRooms(digger);
    this._drawWholeMap();

    this.player = this._createBeing(Player, freeCells);
    this.monster = this._createBeing(Monster, freeCells);
    rescale(this.player._x, this.player._y);
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
      // add a treasure chest to the map
      this.map[key] = "*";
      // the first chest contains the amulet
      if (!i) { this.amulet = key; }
    }
  },
  
  _generateShrubberies: function(freeCells) {
    for (var i=0;i<100;i++) {
      if (freeCells.length) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = ROT.RNG.getItem("abcde");
      }
    }
  },
  
  _drawRooms: function(map) {
    var noreplace = [".", "*", "M", "╔", "╗", "╚", "╝", "═", "║"];
    var rooms = map.getRooms();
    for (var rm=0; rm<rooms.length; rm++) {
      var room = rooms[rm];
    
      var l=room.getLeft() - 1;
      var r=room.getRight() + 1;
      var t=room.getTop() - 1;
      var b=room.getBottom() + 1;

      this.map[l + "," + t] = "o";
      this.map[r + "," + t] = "o";
      this.map[l + "," + b] = "o";
      this.map[r + "," + b] = "o";

      for (var i=room.getLeft(); i<=room.getRight(); i++) {
        var k = i + "," + t;
        if (noreplace.indexOf(this.map[k]) == -1) {
          this.map[k] = "═";
        }
      }

      for (var i=room.getLeft(); i<=room.getRight(); i++) {
        var k = i + "," + b;
        if (noreplace.indexOf(this.map[k]) == -1) {
          this.map[k] = "═";
        }
      }

      for (var i=room.getTop(); i<=room.getBottom(); i++) {
        var k = l + "," + i;
        if (noreplace.indexOf(this.map[k]) == -1) {
          this.map[k] = "║";
        }
      }

      for (var i=room.getTop(); i<=room.getBottom(); i++) {
        var k = r + "," + i;
        if (noreplace.indexOf(this.map[k]) == -1) {
          this.map[k] = "║";
        }
      }

      // room.getDoors(console.log);
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

/***
 *** player code
 ***/

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
  /* one of numpad directions? */
  if (!(code in keyMap)) { return; }
  var dir = ROT.DIRS[8][keyMap[code]];
  moveplayer(dir);
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
    win();
  } else {
    Game.map[key] = ".";
    toast("This chest is empty.");
    //var empty = el("canvas", "div", {"className": "sprite empty free grow-fade"});
	//setTimeout(function() { rmel(empty); }, 1000);
    sfx["miss"].play();
  }
}

function moveplayer(dir) {
  var p = Game.player;

  var x = p._x + dir[0];
  var y = p._y + dir[1];

  var newKey = x + "," + y;
  if ([".", "*"].indexOf(Game.map[newKey]) == -1) { return; }

  Game.display.draw(p._x, p._y, Game.map[p._x + "," + p._y]);
  p._x = x;
  p._y = y;

  p._draw();
  rescale(x, y);
  window.removeEventListener("keydown", p);
  Game.engine.unlock();
  sfx["step1"].play();
  p._checkBox();
}

function removelisteners() {
  Game.engine.lock();
  window.removeEventListener("keydown", Game.player);
  $("#game").removeEventListener("touchstart", handletouch);
  $("#game").removeEventListener("click", handletouch);
  Game.scheduler.clear();
}

/***
 *** monster code
 ***/

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
    return ([".", "*"].indexOf(Game.map[x + "," + y]) != -1);
  }
  var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

  var path = [];
  var pathCallback = function(x, y) {
    path.push([x, y]);
  }
  astar.compute(this._x, this._y, pathCallback);

  path.shift();
  if (path.length <= 1) {
    lose();
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
  Game.display.draw(this._x, this._y, "M");
}

/***
 *** win/lose events
 ***/

function win() {
  removelisteners();
  for (var i=0; i<5; i++) {
    setTimeout(function() {
      sfx["win"].play();
    }, 100 * i);
  }
  Game.destroy();
  show("#win");
}

function lose() {
  var p = Game.player;
  Game.display.draw(p._x, p._y, "T");
  var ghost = el("#game", "div", {"className": "sprite ghost free float-up"});
  removelisteners();
  sfx["lose"].play();
  setTimeout(function() {
    rmel(ghost);
    Game.destroy();
    show("#lose");
  }, 2000);
}

/***
 *** graphics utils
 ***/

function resetcanvas(el) {
  show("#game");
  if (el) {
    $("#canvas").innerHTML = "";
    $("#canvas").appendChild(el);
    $("#game").addEventListener("touchstart", handletouch);
    $("#game").addEventListener("click", handletouch);
  } else {
    $("#game").removeEventListener("touchstart", handletouch);
    $("#game").removeEventListener("click", handletouch);
    $("#canvas").innerHTML = "";
  }
}

function rescale(x, y) {
  var c = $("canvas");
  if (canvas) {
    canvas.style.transition = "all 0.5s ease";
    canvas.style.transform =
      "scale(" + (window.innerWidth < 600 ? "4" : "6") + ") " +
      "translate(" + ((x * -8) + (tileOptions.width * 8 / 2) + -4) +
      "px," + ((y * -8) + (tileOptions.height * 8 / 2)) + "px)";
  }
}

function hidemodal(which) {
  hide("#" + which);
  showtitle();
  sfx['hide'].play();
}

function show(which) {
  $(which).classList.remove("hide");  
  $(which).classList.add("show");
}

function hide(which) {
  $(which).classList.remove("show");
  $(which).classList.add("hide");
}

function toast(message) {
  var m = $("#message");
  m.classList.remove("hide");
  m.classList.remove("fade-out");
  m.textContent = message;
  void m.offsetWidth; // trigger CSS reflow
  m.classList.add("fade-out");
}

// add an element to the dom
function el(where, tag, attrs) {
  var node = document.createElement(tag);
  //var textnode = document.createTextNode("Hello");
  //node.appendChild(textnode);
  for (a in attrs) { node[a] = attrs[a]; }
  $(where).appendChild(node);
  return node;
}

// remove an element from the dom
function rmel(node) {
  node.parentNode.removeChild(node);
}

/***
 *** user interface handlers
 ***/

function handletouch(ev) {
  ev.preventDefault();
  if ($("#inventory").contains(ev.target)) {
    var b = $("#inventory>span");
    var d = $("#inventory>div");
    console.log(b.style.display, d.style.display);
    if (b.style.display == "none") {
      b.style.display = "block";
      d.style.display = "none";
    } else {
      b.style.display = "none";
      d.style.display = "block";
    }

  } else {
    var g = $("#game");
    var x = (ev["touches"] ? ev.touches[0].clientX : ev.clientX) - (g.offsetWidth / 2);
    var y = (ev["touches"] ? ev.touches[0].clientY : ev.clientY) - (g.offsetHeight / 2);
    var qs = Math.ceil((Math.floor((Math.atan2(y, x) + Math.PI) / (Math.PI / 4.0)) % 7) / 2);
    var dir = ROT.DIRS[8][tapMap[qs]];
    moveplayer(dir);
  }
}

function start() {
  hide("#title");
  sfx["rubber"].play();
  Game.init();
}

function handlemenuchange(which) {
  console.log("handlemenuchange", which);
  var choice = which.getAttribute("value");
  show("#" + choice);
  sfx["choice"].play();
}

function showtitle() {
  hide("#plate");
  show("#title");
}
