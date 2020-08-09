// Update this string to set the game title
var gametitle = "My Rogue";


/*****************
 *** resources ***
 *****************/


// This tileset is from kenney.nl
// It's the "microrogue" tileset

var tileSet = document.createElement("img");
tileSet.src = "colored_tilemap_packed.png";

// This is where you specify which tile
// is used to draw each "character"
// where a character can be a background tile
// or a player, monster, or item tile

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
    "g": [64, 40],
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
    "x": [56, 32],
    "p": [56, 64],
  },
  width: 25,
  height: 40
}

// These sound effects are generated using sfxr.me
//
// You can generate your own and click the "copy" button
// to get the sound code and paste it here.
// Play sounds using this code: `sfxr[soundname].play()`

var sfx = {
  "rubber": "5EoyNVaezhPnpFZjpkcJkF8FNCioPncLoztbSHU4u9wDQ8W3P7puffRWvGMnrLRdHa61kGcwhZK3RdoDRitmtwn4JjrQsZCZBmDQgkP5uGUGk863wbpRi1xdA",
  "step": "34T6PkwiBPcxMGrK7aegATo5WTMWoP17BTc6pwXbwqRvndwRjGYXx6rG758rLSU5suu35ZTkRCs1K2NAqyrTZbiJUHQmra9qvbBrSdbBbJ7JvmyBFVDo6eiVD",
  "choice": "34T6PkzXyyB6jHiwFztCFWEWsogkzrhzAH3FH2d97BCuFhqmZgfuXG3xtz8YYSKMzn95yyX8xZXJyesKmpcjpEL3dPP5h2e8mt5MmhExAksyqZyqgavBgsWMd",
  "hide": "34T6PkzXyyB6jHiwFztCFWEniygA1GJtjsQuGxcd38JLDquhRqTB28dQgigseMjQSjSY14Z3aBmAtzz9KWcJZ2o9S1oCcgqQY4dxTAXikS7qCs3QJ3KuWJUyD",
  "empty": "111112RrwhZ2Q7NGcdAP21KUHHKNQa3AhmK4Xea8mbiXfzkxr9aX41M8XYt5xYaaLeo9iZdUKUVL3u2N6XASue2wPv2wCCDy6W6TeFiUjk3dXSzFcBY7kTAM",
  "hit": "34T6Pks4nddGzchAFWpSTRAKitwuQsfX8bfzRpJx5eDR7NSqxeeLMEkLjcuwvTCDS1ve7amXBg4eipzDdgKWoYnJBsQVESZh2X1DFV2GWybY5bAihB2EdHsbd",
  "miss": "8R25jogvbp3Qy6A4GTPxRP4aT2SywwsAgoJ2pKmxUFMExgNashjgd311MnmZ2ThwrPQz71LA53QCfFmYQLHaXo6SocUv4zcfNAU5SFocZnoQSDCovnjpioNz3",
  "win": "34T6Pkv34QJsqDqEa8aV4iwF2LnASMc3683oFUPKZic6kVUHvwjUQi6rz8qNRUHRs34cu37P5iQzz2AzipW3DHMoG5h4BZgDmZnyLhsXgPKsq2r4Fb2eBFVuR",
  "lose": "7BMHBGHKKnn7bgcmGprqiBmpuRaTytcd4JS9eRNDzUTRuQy8BTBzs5g8XzS7rrp4C9cNeSaqAtWR9qdvXvtnWVTmTC8GXgDuCXD2KyHJNXzfUahbZrce8ibuy",
  "kill": "7BMHBGKMhg8NZkxKcJxNfTWXKtMPiZVNsLR4aPEAghCSpz5ZxpjS5k4j4ZQpJ65UZnHSr4R2d7ALCHJe41pAS2ZPjauM7SveudhDGAxw2dhXpiNwEhG8xUYkX",
}

// here we are turning the sfxr sound codes into
// audio objects that can be played with `sfx[name].play()`
for (var s in sfx) {
  sfx[s] = (new SoundEffect(sfx[s])).generate().getAudio();
}

// these are lookup tables mapping keycodes and
// click/tap directions to game direction vectors

var keyMap = {
  38: 0,
  33: 1,
  39: 2,
  34: 3,
  40: 4,
  35: 5,
  37: 6,
  36: 7,
};

var tapMap = {
  0: 6,
  1: 0,
  2: 2,
  3: 4,
};

/***
 *** game code
 ***/

// based on the original tutorial by Ondřej Žára
// www.roguebasin.com/index.php?title=Rot.js_tutorial,_part_1

// allow live reloading of the game code
if (window["Game"]) { Game.destroy(); }

// this object is a namespace holding all of the
// bits of our game together in one place for easy
// reference

var Game = {
  // this is the ROT.js display handler
  display: null,
  // this is our map data
  // it's a lookup of `x,y` to "character"
  // where "character" can any one of:
  // background, item, player, or monster
  map: {},
  // reference to the ROT.js engine which
  // manages stuff like scheduling
  engine: null,
  // schedules events in the game for ROT.js
  scheduler: null,
  // reference to the `Player` class below
  player: null,
  // reference to the `Monster` class below
  monster: null,
  // the position of the amulet in the map
  // as `x,y` so it can be checked against
  // the map keys above
  amulet: null,

  // this gets called by the menu system
  // to launch the actual game
  init: function() {
    // first create a ROT.js display manager
    this.display = new ROT.Display(tileOptions);
    resetcanvas(this.display.getContainer());

    // this is where we populate the map data structure
    // with all of the background tiles, items,
    // player and the monster positions
    this._generateMap();

    // let ROT.js schedule the Player and Monster objects
    this.scheduler = new ROT.Scheduler.Simple();
    this.scheduler.add(this.player, true);
    this.scheduler.add(this.monster, true);

    // render some example items in the inventory
    renderinventory(this.player.inventory);

    // render the stats hud at the bottom of the screen
    renderstats(this.player.stats);

    // kick everything off
    this.engine = new ROT.Engine(this.scheduler);
    this.engine.start();
  },

  // this gets called at the end of the game when we want
  // to exit back out and clean everything up to display
  // the menu and get ready for next round
  destroy: function() {
    // remove all listening event handlers
    window.removeEventListener("keydown", this.player);
    $("#game").removeEventListener("touchstart", handletouch);
    $("#game").removeEventListener("click", handletouch);

    // tear everything down and 
    // reset all our variables back
    // to null as before init()
    if (this.engine) {
      this.engine.lock();
      this.display = null;
      this.map = {};
      this.engine = null;
      this.scheduler.clear();
      this.scheduler = null;
      this.player = null;
      this.monster = null;
      this.amulet = null;
    }

    // close out the game screen and show the title
    showscreen("title");
  },

  // guess what, this generates the game map
  _generateMap: function() {
    // we're using the ROT.js Digger tilemap
    // there are lots of interesting dungeon
    // generation algorithms here:
    // http://ondras.github.io/rot.js/manual/#map
    // http://ondras.github.io/rot.js/manual/#map/maze
    // http://ondras.github.io/rot.js/manual/#map/cellular
    // http://ondras.github.io/rot.js/manual/#map/dungeon
    var digger = new ROT.Map.Digger(
        tileOptions.width,
        tileOptions.height);
    // list of floor tiles that can be walked on
    // but don't have anything on them yet
    var freeCells = [];
    // list of non-floor tiles that can't be traversed
    // which we'll put scenery on
    var zeroCells = [];

    // the way the ROT.js map generators work is they
    // call this callback for every tile generated with
    // the `value` set to the type of space at that point
    var digCallback = function(x, y, value) {
      var key = x+","+y;
      if (value) {
        // store this in the non-walkable cells list
        zeroCells.push(key);
      } else {
        // on our map we want to draw a "walkable" tile
        // here which is represented by a dot
        this.map[key] = ".";
        // store this in the walkable cells list
        freeCells.push(key);
      }
    }
    // kick off the map creation algorithm to build
    // the basic map shape with rooms and corridors
    digger.create(digCallback.bind(this));

    // now we spawn generators for populating other stuff
    // in the map - you can read each of these below
    this._generateItems(freeCells);
    this._generateShrubberies(zeroCells);
    this._drawRooms(digger);
    // draw the map so far on the screen
    this._drawWholeMap();

    // finally we put the player and the monster on their
    // starting tiles, which must be from the walkable list
    this.player = this._createBeing(Player, freeCells);
    this.monster = this._createBeing(Monster, freeCells);

    // here we are re-scaling the background so it is
    // zoomed in and centered on the player tile
    rescale(this.player._x, this.player._y);
  },

  // both the player and monster initial position is set
  // by choosing a random freeCell and creating the type
  // of object (`what`) on that position
  _createBeing: function(what, freeCells) {
    var index = Math.floor(
        ROT.RNG.getUniform() * freeCells.length);
    // remove from the freeCells array now that it's taken
    var key = freeCells.splice(index, 1)[0];
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    return new what(x, y);
  },

  // here we are creating the treasure chest items
  _generateItems: function(freeCells) {
    for (var i=0; i<15; i++) {
      var index = Math.floor(
          ROT.RNG.getUniform() * freeCells.length);
      var key = freeCells.splice(index, 1)[0];
      // the first chest contains the amulet
      if (!i) {
        this.amulet = key;
        this.map[key] = "*";
      } else {
        // add either a treasure chest
        // or a piece of gold to the map
        this.map[key] = ROT.RNG.getItem(["*", "g"]);
      }
    }
  },

  // these plant tiles are purely bling
  // we're just going to play 100 plants randomly
  // in the spaces where there isn't anything already
  _generateShrubberies: function(freeCells) {
    for (var i=0;i<100;i++) {
      if (freeCells.length) {
        var index = Math.floor(
            ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = ROT.RNG.getItem("abcde");
      }
    }
  },

  // to make the map look a bit cooler we'll actually draw
  // walls around the rooms
  _drawRooms: function(map) {
    // these map tiles should not be replaced by room edges
    var noreplace = [".", "*", "g", "M", "╔", "╗", "╚", "╝", "═", "║"];
    var rooms = map.getRooms();
    for (var rm=0; rm<rooms.length; rm++) {
      var room = rooms[rm];
    
      var l=room.getLeft() - 1;
      var r=room.getRight() + 1;
      var t=room.getTop() - 1;
      var b=room.getBottom() + 1;

      // place the room corner tiles
      this.map[l + "," + t] = "╔";
      this.map[r + "," + t] = "╗";
      this.map[l + "," + b] = "╚";
      this.map[r + "," + b] = "╝";

      // you can also use a single corner tile for every
      // corner if you prefer that look
      /*this.map[l + "," + t] = "o";
      this.map[r + "," + t] = "o";
      this.map[l + "," + b] = "o";
      this.map[r + "," + b] = "o";*/

      // the next four loops just draw each side of the room
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

      // you can also do something more interesting with
      // the doors of the room if you want
      // room.getDoors(console.log);
    }
  },

  // we ask ROT.js to actually draw the map tiles via display
  _drawWholeMap: function() {
    for (var key in this.map) {
      var parts = key.split(",");
      var x = parseInt(parts[0]);
      var y = parseInt(parts[1]);
      this.display.draw(x, y, this.map[key]);
    }
  }
};

/*************************
 *** the player object ***
 *************************/

// basic ROT.js entity with position, inventory, stats
var Player = function(x, y) {
  this._x = x;
  this._y = y;
  this.inventory = [
    ["x", "Axe (+5)"],
    ["p", "Potion"]
  ];
  this.stats = {"hp": 10, "xp": 1, "gold": 0};
  this._draw();
}

// basic ROT.js entity properties
Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

// the ROT.js scheduler calls this method when it is time
// for the player to act
// what this does is lock the engine to take control
// and then wait for keyboard input from the user
Player.prototype.act = function() {
  Game.engine.lock();
  window.addEventListener("keydown", this);
}

// when keyboard input happens this even handler is called
// and the position of the player is updated
Player.prototype.handleEvent = function(e) {
  var code = e.keyCode;
  /* one of numpad directions? */
  if (!(code in keyMap)) { return; }
  var dir = ROT.DIRS[8][keyMap[code]];
  moveplayer(dir);
}

// this is how the Player draws itself on the map
// using ROT.js display
Player.prototype._draw = function() {
  Game.display.draw(this._x, this._y, "@", "#ff0");
}

// this method gets called by the `moveplayer` function
// in order to check whether they hit an empty box
// or The Amulet
Player.prototype._checkBox = function() {
  var key = this._x + "," + this._y;
  if (key == Game.amulet) {
    // the amulet is hit initiate the win flow below
    win();
  } else if (Game.map[key] == "g") {
    // if the player stepped on gold
    // increment their gold stat,
    // show a message, re-render the stats
    // then play the pickup/win sound
    Game.player.stats.gold += 1;
    renderstats(Game.player.stats);
    toast("You found gold!");
    sfx["win"].play();
  } else if (Game.map[key] == "*") {
    // if an empty box is opened
    // by replacing with a floor tile, show the user
    // a message, and play the "empty" sound effect
    toast("This chest is empty.");
    sfx["empty"].play();
  }
  // make the item disappear by drawing floor
  Game.map[key] = ".";
}

// this function moves the player on the tilemap
// it is called from the keyboard event handler above
// `Player.prototype.handleEvent()`
// and also from the click/tap handler `handletouch()` below
function moveplayer(dir) {
  // get a reference to our global player object
  // this is needed when called from the tap/click handler
  var p = Game.player;

  // work out the new position based on direction vector
  var x = p._x + dir[0];
  var y = p._y + dir[1];

  // map lookup - if we're not moving onto a floor tile
  // or a treasure chest, then we should abort this move
  var newKey = x + "," + y;
  if ([".", "*", "g"].indexOf(Game.map[newKey]) == -1) { return; }

  // check if we've hit the monster
  // and if we have initiate combat
  var m = Game.monster;
  if (m && m._x == x && m._y == y) {
    combat(m);
    return;
  }

  // update the old tile to whatever was there before
  // (e.g. "." floor tile)
  Game.display.draw(p._x, p._y, Game.map[p._x + "," + p._y]);

  // update the player's coordinates
  p._x = x;
  p._y = y;

  // re-draw the player
  p._draw();
  // re-locate the game screen to center the player
  rescale(x, y);
  // remove the keyboard event listener and unlock the scheduler
  window.removeEventListener("keydown", p);
  Game.engine.unlock();
  // play the "step" sound
  sfx["step"].play();
  // check if the player stepped on a treasure chest
  p._checkBox();
}

/********************
 *** monster code ***
 ********************/

// basic ROT.js entity with position and stats
var Monster = function(x, y) {
  this._x = x;
  this._y = y;
  this.stats = {"hp": 10};
  this._draw();
}
  
// basic ROT.js entity properties
Monster.prototype.getSpeed = function() { return 100; }

// the ROT.js scheduler calls this method when it is time
// for the player to act
Monster.prototype.act = function() {
  // the monster wants to know where the player is
  var x = Game.player.getX();
  var y = Game.player.getY();

  // in this whole code block we use the ROT.js "astar" path finding
  // algorithm to help the monster figure out the fastest way to get
  // to the player - for implementation details check out the doc:
  // http://ondras.github.io/rot.js/manual/#path
  var passableCallback = function(x, y) {
    return ([".", "*", "g"].indexOf(Game.map[x + "," + y]) != -1);
  }
  var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});
  var path = [];
  var pathCallback = function(x, y) {
    path.push([x, y]);
  }
  astar.compute(this._x, this._y, pathCallback);

  // we just want the first move on the path from monster to player
  // because this function is called once per monster turn and the
  // player will have moved on the next round
  path.shift();
  // if the distance from the monster to the player is less than one
  // square the player has lost the game
  if (path.length <= 1) {
    combat(this);
  } else {
    // the player is safe for now so update the monster position
    x = path[0][0];
    y = path[0][1];
    // draw whatever was on the last tile the monster was one
    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    // update the monster's position and redraw
    this._x = x;
    this._y = y;
    this._draw();
  }
}

// We draw the monster with an "M" tile
Monster.prototype._draw = function() {
  Game.display.draw(this._x, this._y, "M");
}

// if the monster is dead remove it from the game
Monster.prototype._checkDeath = function() {
  if (this.stats.hp < 1) {
    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    Game.scheduler.remove(this);
    Game.monster = null;
    sfx["kill"].play();
  }
}

/******************************
 *** win/lose/combat events ***
 ******************************/

// this is how the player fights a monster
function combat(monster) {
  // a description of the combat to tell
  // the user what is happening
  var msg = "";
  // roll a dice to see if the player hits
  var roll = ROT.RNG.getItem([1,2,3,4,5,6])
  // a hit is a four or more
  if (roll > 3) {
    // add to the combat message
    msg += "You hit the monster. ";
    // remove hitpoints from the monster
    monster.stats.hp -= roll;
    // play the hit sound
    sfx["hit"].play();
    // check if the monster has died
    monster._checkDeath();
  } else {
    sfx["miss"].play();
    msg += "You missed the monster. ";
  }
  // if the monster is alive it hits back
  if (monster.stats.hp > 0) {
    // roll a dice to see if the monster hits
    var roll = ROT.RNG.getItem([1,2,3,4,5,6])
    // a hit is a four or more
    if (roll > 3) {
      // add to the combat message
      msg += "The monster hit.";
      // remove hit points from the player
      Game.player.stats.hp -= roll;
      // re-render the player's hud stats
      renderstats(Game.player.stats);
      // play the hit sound after 1/4 second
      setTimeout(function() {
        sfx["hit"].play();
      }, 250);
      // check if the player has died
      if (Game.player.stats.hp < 1) {
        // player hitpoints are completely expended
        // trigger the `lose()` UI flow below
        lose();
      }
    } else {
      // if the monster missed add to message
      msg += "The monster missed.";
      // then play the miss sound after 1/4 second
      setTimeout(function() {
        sfx["miss"].play();
      }, 250);
    }
  }
  // if there is a message to display do so
  if (msg) {
    toast(msg);
  }
}

// this gets called when the player wins the game
function win() {
  // play the win sound effect a bunch of times
  for (var i=0; i<5; i++) {
    setTimeout(function() {
      sfx["win"].play();
    }, 100 * i);
  }
  // tear down the game
  Game.destroy();
  // show the blingy "win" screen to the user
  showscreen("win");
}

// this gets called when the player loses the game
function lose() {
  // change the player into a tombstone tile
  var p = Game.player;
  Game.display.draw(p._x, p._y, "T");
  // create an animated div element over the top of the game
  // holding a rising ghost image above the tombstone
  var ghost = attach($("#game"), el("div", {"className": "sprite ghost free float-up"}));
  // we stop listening for user input while the ghost animates
  removelisteners();
  // play the lose sound effect
  sfx["lose"].play();
  // wait 2 seconds for the ghost animation to finish
  setTimeout(function() {
    // remove the ghost animation
    rmel(ghost);
    // tear down the game
    Game.destroy();
    // show the "lose" screen to the user
    showscreen("lose");
  }, 2000);
}

/************************************
 *** graphics, UI & browser utils ***
 ************************************/

// handy shortcuts and shims for manipulating the dom
$ = document.querySelector.bind(document);
NodeList.prototype.forEach = Array.prototype.forEach

// this code is called at load time and sets the game title
// to the `gametitle` variable at the top
document.querySelectorAll(".game-title-text")
.forEach(function(t) {
  t.textContent = gametitle;
})

// this code resets the ROT.js display canvas
// and sets up the touch and click event handlers
// when it's called at the start of the game
function resetcanvas(el) {
  $("#canvas").innerHTML = "";
  $("#canvas").appendChild(el);
  $("#game").addEventListener("touchstart", handletouch);
  $("#game").addEventListener("click", handletouch);
  showscreen("game");
}

// this function uses CSS styles to reposition the
// canvas so that the player is centered.
// it does this using an "ease" animation which
// gives a sort of camera follow effect.
function rescale(x, y) {
  var c = $("canvas");
  if (canvas) {
    // this applies the animation effect
    canvas.style.transition = "all 0.5s ease";
    // this sets the scale and position to focus on the player
    canvas.style.transform =
      "scale(" + (window.innerWidth < 600 ? "4" : "6") + ") " +
      "translate(" + ((x * -8) + (tileOptions.width * 8 / 2) + -4) +
      "px," + ((y * -8) + (tileOptions.height * 8 / 2)) + "px)";
  }
}

// while showing the lose animation we don't want
// any event handlers to fire so we remove them
// and lock the game
function removelisteners() {
  Game.engine.lock();
  window.removeEventListener("keydown", Game.player);
  $("#game").removeEventListener("touchstart", handletouch);
  $("#game").removeEventListener("click", handletouch);
  Game.scheduler.clear();
}

// hides all screens and shows the requested screen
function showscreen(which) {
  document.querySelectorAll(".screen")
  .forEach(function(s) {
    s.classList.remove("show");
    s.classList.add("hide");
  });
  $("#" + which).classList.remove("hide");
  $("#" + which).classList.add("show");
  var action = $("#" + which + ">.action");
  if (action) { action.focus(); };
}

// updates the contents of the inventory UI
// with a list of things you want in there
// items is an array of ["C", "Words"]
// where "C" is the character from the tileset
// and "Words" are whatever words you want next
// to it
function renderinventory(items) {
  var inv = $("#inventory ul");
  inv.innerHTML = "";
  items.forEach(function(i) {
    var tile = tileOptions.tileMap[i[0]];
    var words = i[1];
    attach(inv,
         el("li", {},
            [el("div", {
              "className": "sprite",
              "style": "background-position: -" + tile[0] + "px -" + tile[1] + "px;"
            }), words]));
  });
}

// updates the stats listed at the bottom of the screen
// pass in an object containing key value pairs where
// the key is the name of the stat and the value is the
// number
function renderstats(stats) {
  var st = $("#hud");
  st.innerHTML = "";
  for (var s in stats) {
    attach(st, el("span", {}, [s.toUpperCase() + ": " + stats[s]]));
  }
}

// this function displays a message at the top
// of the game screen for the player such as
// "You have found a sneaky wurzel."
function toast(message) {
  var m = $("#message");
  m.classList.remove("fade-out");
  m.textContent = message;
  void m.offsetWidth; // trigger CSS reflow
  m.classList.add("fade-out");
  m.onanimationend = function() {
    m.classList.remove("fade-out");
  };
}

// create an HTML element
function el(tag, attrs, children) {
  var node = document.createElement(tag);
  for (a in attrs) { node[a] = attrs[a]; }
  (children || []).forEach(function(c) {
    if (typeof(c) == "string") {
      node.appendChild(document.createTextNode(c));
    } else {
      attach(node, c);
    }
  });
  return node;
}

// add an HTML element to a parent node
function attach(node, el) {
    node.appendChild(el);
    return el;
}

// remove an element from the dom
function rmel(node) {
  node.parentNode.removeChild(node);
}

/*************************
 *** UI event handlers ***
 *************************/

// when a touch event happens
// this is where it is caught
function handletouch(ev) {
  ev.preventDefault();
  // if the inventory div was clicked
  if ($("#inventory").contains(ev.target)) {
    // toggle the inventory to visible/invisible
    var b = $("#inventory>span");
    var d = $("#inventory>div");
    if (b.style.display == "none") {
      b.style.display = "block";
      d.style.display = "none";
    } else {
      b.style.display = "none";
      d.style.display = "block";
    }
  // otherwise the map itself was clicked
  } else {
    var g = $("#game");
    // where on the map the click or touch occurred
    var cx = (ev["touches"] ? ev.touches[0].clientX : ev.clientX);
    var cy = (ev["touches"] ? ev.touches[0].clientY : ev.clientY)
    var x = cx - (g.offsetWidth / 2);
    var y = cy - (g.offsetHeight / 2);
    // figure out which quadrant was clicked relative to the player
    var qs = Math.ceil((Math.floor((Math.atan2(y, x) + Math.PI) / (Math.PI / 4.0)) % 7) / 2);
    var dir = ROT.DIRS[8][tapMap[qs]];
    // actually move the player in that direction
    moveplayer(dir);
  }
}

// this function gets called from the first screen
// when the "play" button is clicked.
function start() {
  showscreen("game");
  sfx["rubber"].play();
  Game.init();
}

// this function gets called when the user selects
// a menu item on the front page and shows the 
// relevant screen
function handlemenuchange(which) {
  var choice = which.getAttribute("value");
  showscreen(choice);
  sfx["choice"].play();
}

// this helper function hides any of the menu
// screens above, shows the title screen again,
// and plays a sound as it does so
function hidemodal(which) {
  showscreen("title");
  sfx['hide'].play();
}
