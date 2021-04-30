(function(w) {

  // Update this string to set the game title
  const gametitle = "My Rogue";


  /*****************
   *** resources ***
   *****************/


  // This tileset is from kenney.nl
  // It's the "microrogue" tileset

  const tileSet = document.createElement("img");
  tileSet.src = "colored_tilemap_packed.png";

  // This is where you specify which tile
  // is used to draw each "character"
  // where a character can be a background tile
  // or a player, monster, or item tile

  const tileOptions = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 8,
    tileHeight: 8,
    tileSet: tileSet,
    tileMap: {
      "@": [40, 0],  // player
      ".": [32, 32], // floor
      "M": [88, 0],  // monster
      "*": [72, 24], // treasure chest
      "g": [64, 40], // gold
      "x": [56, 32], // axe
      "p": [56, 64], // potion
      "a": [40, 32], // tree 1
      "b": [32, 40], // tree 2
      "c": [40, 40], // tree 3
      "d": [48, 40], // tree 4
      "e": [56, 40], // tree 5
      "T": [72, 56], // tombstone
      "╔": [0, 72],  // room corner
      "╗": [24, 72], // room corner
      "╝": [72, 72], // room corner
      "╚": [48, 72], // room corner
      "═": [8, 72],  // room edge
      "║": [32, 72], // room edge
      "o": [40, 72], // room corner
    },
    width: 25,
    height: 40
  }

  // should we pay attention to click/touch events on the map
  // and should we show arrow buttons on touch screens?
  const usePointer = true;
  const useArrows = true;
  const touchOffsetY = -20; // move the center by this much
  const scaleMobile = 4; // scale mobile screens by this much
  const scaleMonitor = 6; // scale computer screens by this much
  const turnLengthMS = 200; // shortest time between turns

  // these map tiles are walkable
  const walkable = [".", "*", "g"]

  // these map tiles should not be replaced by room edges
  const noreplace = walkable.concat(["M", "╔", "╗", "╚", "╝", "═", "║"]);

  // These sound effects are generated using sfxr.me
  //
  // You can generate your own and click the "copy" button
  // to get the sound code and paste it here.
  // Play sounds using this code: `sfxr[soundname].play()`

  const sfx = {
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
  for (let s in sfx) {
    sfx[s] = (new SoundEffect(sfx[s])).generate().getAudio();
  }

  // these are lookup tables mapping keycodes and
  // click/tap directions to game direction vectors

  const keyMap = {
    38: 0,
    33: 1,
    39: 2,
    34: 3,
    40: 4,
    35: 5,
    37: 6,
    36: 7,
  };

  const tapMap = {
    0: 6,
    1: 0,
    2: 2,
    3: 4,
  };

  const arrowMap = {
    "btn-left": 6,
    "btn-right": 2,
    "btn-up": 0,
    "btn-down": 4,
  };

  const gamepadState = {}; // last known state of gamepad buttons
  var gamepadPoller = null; // poller checking for gamepad events

  /*****************
   *** game code ***
   *****************/


  // based on the original tutorial by Ondřej Žára
  // www.roguebasin.com/index.php?title=Rot.js_tutorial,_part_1

  // this Game object holds all of the game state
  // including the map, engine, entites, and items, etc.
  const Game = {
    // this is the ROT.js display handler
    display: null,
    // this is our map data
    // it's a lookup of `x,y` to "character"
    // where "character" can any one of:
    // background, item, player, or monster
    map: {},
    // map of all items
    items: {},
    // reference to the ROT.js engine which
    // manages stuff like scheduling
    engine: null,
    // schedules events in the game for ROT.js
    scheduler: null,
    // reference to the player object
    player: null,
    // reference to the game monsters array
    monsters: null,
    // the position of the amulet in the map
    // as `x,y` so it can be checked against
    // the map keys above
    amulet: null,
    // arrow handler
    lastArrow: null, // arrow keys held
    arrowInterval: null, // arrow key repeat
    arrowListener: null, // registered listener for arrow event
    // clean up this game instance
    // we keep a reference for live-reloading
    cleanup: cleanup,
  };

  // this gets called by the menu system
  // to launch the actual game
  function init(game) {
    game.map = {};
    game.items = {};
    // first create a ROT.js display manager
    game.display = new ROT.Display(tileOptions);
    resetCanvas(game.display.getContainer());

    // this is where we populate the map data structure
    // with all of the background tiles, items,
    // player and the monster positions
    generateMap(game);

    // let ROT.js schedule the player and monster entities
    game.scheduler = new ROT.Scheduler.Simple();
    game.scheduler.add(game.player, true);
    game.monsters.map((m) => game.scheduler.add(m, true));

    // render some example items in the inventory
    renderInventory(game.player.inventory);

    // render the stats hud at the bottom of the screen
    renderStats(game.player.stats);

    // kick everything off
    game.engine = new ROT.Engine(game.scheduler);
    game.engine.start();
  }

  // this gets called at the end of the game when we want
  // to exit back out and clean everything up to display
  // the menu and get ready for next round
  function destroy(game) {
    // remove all listening event handlers
    removeListeners(game);

    // tear everything down and
    // reset all our variables back
    // to null as before init()
    if (game.engine) {
      game.engine.lock();
      game.display = null;
      game.map = {};
      game.items = {};
      game.engine = null;
      game.scheduler.clear();
      game.scheduler = null;
      game.player = null;
      game.monsters = null;
      game.amulet = null;
    }

    // hide the toast message
    hideToast(true);
    // close out the game screen and show the title
    showScreen("title");
  }

  // guess what, this generates the game map
  function generateMap(game) {
    // we're using the ROT.js Digger tilemap
    // there are lots of interesting dungeon
    // generation algorithms here:
    // http://ondras.github.io/rot.js/manual/#map
    // http://ondras.github.io/rot.js/manual/#map/maze
    // http://ondras.github.io/rot.js/manual/#map/cellular
    // http://ondras.github.io/rot.js/manual/#map/dungeon
    const digger = new ROT.Map.Digger(
          tileOptions.width,
          tileOptions.height);
    // list of floor tiles that can be walked on
    // but don't have anything on them yet
    const freeCells = [];
    // list of non-floor tiles that can't be traversed
    // which we'll put scenery on
    const zeroCells = [];

    // the way the ROT.js map generators work is they
    // call this callback for every tile generated with
    // the `value` set to the type of space at that point
    const digCallback = function(x, y, value) {
      const key = x + "," + y;
      if (value) {
        // store this in the non-walkable cells list
        zeroCells.push(key);
      } else {
        // on our map we want to draw a "walkable" tile
        // here which is represented by a dot
        game.map[key] = ".";
        // store this in the walkable cells list
        freeCells.push(key);
      }
    }
    // kick off the map creation algorithm to build
    // the basic map shape with rooms and corridors
    digger.create(digCallback.bind(game));

    // now we spawn generators for populating other stuff
    // in the map - you can read each of these below
    generateItems(game, freeCells);
    generateScenery(game.map, zeroCells);
    generateRooms(game.map, digger);

    // finally we put the player and one monster on their
    // starting tiles, which must be from the walkable list
    game.player = makePlayer(takeFreeCell(freeCells));
    game.monsters = [makeMonster(takeFreeCell(freeCells))];

    // draw the map and items
    for (let key in game.map) {
      drawTile(game, key);
    }

    // here we are re-scaling the background so it is
    // zoomed in and centered on the player tile
    rescale(game.player._x, game.player._y, game);
  }

  // here we are creating the treasure chest items
  function generateItems(game, freeCells) {
    for (let i=0; i<15; i++) {
      const key = takeFreeCell(freeCells);
      // the first chest contains the amulet
      if (!i) {
        game.amulet = key;
        game.items[key] = "*";
      } else {
        // add either a treasure chest
        // or a piece of gold to the map
        game.items[key] = ROT.RNG.getItem(["*", "g"]);
      }
    }
  }

  // randomly choose one cell from the freeCells array
  // remove it from the array and return it
  function takeFreeCell(freeCells, subset) {
    const freeCellsSubset = subset || freeCells;
    const key = ROT.RNG.getItem(freeCellsSubset);
    return freeCells.splice(freeCells.indexOf(key), 1)[0];
  }

  // parse a string "x,y" key and return the
  // actual x, y values
  function posFromKey(key) {
    const parts = key.split(",");
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);
    return [x, y];
  }

  // these plant tiles are purely bling
  // we're just going to place 100 plants randomly
  // in the spaces where there isn't anything already
  function generateScenery(map, freeCells) {
    for (let i=0;i<100;i++) {
      if (freeCells.length) {
        const key = takeFreeCell(freeCells);
        map[key] = ROT.RNG.getItem("abcde");
      }
    }
  }

  // to make the map look a bit cooler we'll generate
  // walls around the rooms
  function generateRooms(map, mapgen) {
    const rooms = mapgen.getRooms();
    for (let rm=0; rm<rooms.length; rm++) {
      const room = rooms[rm];
    
      const l=room.getLeft() - 1;
      const r=room.getRight() + 1;
      const t=room.getTop() - 1;
      const b=room.getBottom() + 1;

      // place the room corner tiles
      map[l + "," + t] = "╔";
      map[r + "," + t] = "╗";
      map[l + "," + b] = "╚";
      map[r + "," + b] = "╝";

      // you can also use a single corner tile for every
      // corner if you prefer that look
      /*map[l + "," + t] = "o";
      map[r + "," + t] = "o";
      map[l + "," + b] = "o";
      map[r + "," + b] = "o";*/

      // the next four loops just generate each side of the room
      for (let i=room.getLeft(); i<=room.getRight(); i++) {
        const j = i + "," + t;
        const k = i + "," + b;
        if (noreplace.indexOf(map[j]) == -1) {
          map[j] = "═";
        }
        if (noreplace.indexOf(map[k]) == -1) {
          map[k] = "═";
        }
      }

      for (let i=room.getTop(); i<=room.getBottom(); i++) {
        const j = l + "," + i;
        const k = r + "," + i;
        if (noreplace.indexOf(map[j]) == -1) {
          map[j] = "║";
        }
        if (noreplace.indexOf(map[k]) == -1) {
          map[k] = "║";
        }
      }

      // you can also do something more interesting with
      // the doors of the room if you want
      // room.getDoors(console.log);
    }
  }

  function drawTile(game, key, ignore) {
    const map = game.map;
    if (map[key]) {
      const parts = posFromKey(key);
      const monster = monsterAt(parts[0], parts[1]);
      const player = playerAt(parts[0], parts[1]);
      const display = game.display;
      const items = game.items;
      const draw = [map[key], items[key]];
      draw.push(monster && monster != ignore ? monster.character : null);
      draw.push(player && player != ignore ? player.character : null);
      display.draw(parts[0], parts[1], draw.filter(i=>i));
    }
  }

  /******************
   *** the player ***
   ******************/


  // creates a player object with position, inventory, and stats
  function makePlayer(key) {
    const pos = posFromKey(key);
    return {
      // player's position
      _x: pos[0],
      _y: pos[1],
      // which tile to draw the player with
      character: "@",
      // the name to display in combat
      name: "you",
      // what the player is carrying
      inventory: [
        ["x", "Axe (+5)"],
        ["p", "Potion"]
      ],
      // the player's stats
      stats: {"hp": 10, "xp": 1, "gold": 0},
      // the ROT.js scheduler calls this method when it is time
      // for the player to act
      // what this does is lock the engine to take control
      // and then wait for input from the user
      act: () => {
        Game.engine.lock();
        if (!Game["arrowListener"]) {
          document.addEventListener("arrow", arrowEventHandler);
          Game.arrowListener = true;
        }
      },
    }
  }

  // this method gets called by the `movePlayer` function
  // in order to check whether they hit an empty box
  // or The Amulet
  function checkItem(entity) {
    const key = entity._x + "," + entity._y;
    if (key == Game.amulet) {
      // the amulet is hit initiate the win flow below
      win();
    } else if (Game.items[key] == "g") {
      // if the player stepped on gold
      // increment their gold stat,
      // show a message, re-render the stats
      // then play the pickup/win sound
      Game.player.stats.gold += 1;
      renderStats(Game.player.stats);
      toast("You found gold!");
      sfx["win"].play();
      delete Game.items[key];
    } else if (Game.items[key] == "*") {
      // if an empty box is opened
      // by replacing with a floor tile, show the user
      // a message, and play the "empty" sound effect
      toast("This chest is empty.");
      sfx["empty"].play();
      delete Game.items[key];
    }
    drawTile(Game, key);
  }

  // move the player according to a direction vector
  // called from the keyboard event handler below
  // `keyHandler()`
  // and also from the click/tap handler `handlePointing()` below
  function movePlayer(dir) {
    const p = Game.player;
    return movePlayerTo(p._x + dir[0], p._y + dir[1]);
  }

  // move the player on the tilemap to a particular position
  function movePlayerTo(x, y) {
    // get a reference to our global player object
    // this is needed when called from the tap/click handler
    const p = Game.player;

    // map lookup - if we're not moving onto a floor tile
    // or a treasure chest, then we should abort this move
    const newKey = x + "," + y;
    if (walkable.indexOf(Game.map[newKey]) == -1) { return; }

    // check if we've hit the monster
    // and if we have initiate combat
    const hitMonster = monsterAt(x, y);
    if (hitMonster) {
      // we enter a combat situation
      combat(p, hitMonster);
      // pass the turn on to the next entity
      setTimeout(function() {
        Game.engine.unlock();
      }, 250);
    } else {
      // we're taking a step

      // hide the toast message when the player moves
      hideToast();

      // update the old tile to whatever was there before
      // (e.g. "." floor tile)
      drawTile(Game, p._x + "," + p._y, p);

      // update the player's coordinates
      p._x = x;
      p._y = y;

      // re-draw the player
      for (let key in Game.map) {
        drawTile(Game, key);
      }
      // re-locate the game screen to center the player
      rescale(x, y, Game);
      // remove the arrow event listener
      window.removeEventListener("arrow", arrowEventHandler);
      Game.engine.unlock();
      // play the "step" sound
      sfx["step"].play();
      // check if the player stepped on an item
      checkItem(p);
    }
  }


  /*******************
   *** The monster ***
   *******************/


  // basic ROT.js entity with position and stats
  function makeMonster(key) {
    const pos = posFromKey(key);
    return {
      // monster position
      _x: pos[0],
      _y: pos[1],
      // which tile to draw the player with
      character: "M",
      // the name to display in combat
      name: "the monster",
      // the monster's stats
      stats: {"hp": 14},
      // called by the ROT.js scheduler
      act: monsterAct,
    }
  }

  // the ROT.js scheduler calls this method when it is time
  // for the monster to act
  function monsterAct() {
    // reference to the monster itself
    const m = this;
    // the monster wants to know where the player is
    const p = Game.player;
    // reference to the game map
    const map = Game.map;
    // reference to ROT.js display
    const display = Game.display;

    // in this whole code block we use the ROT.js "astar" path finding
    // algorithm to help the monster figure out the fastest way to get
    // to the player - for implementation details check out the doc:
    // http://ondras.github.io/rot.js/manual/#path
    const passableCallback = function(x, y) {
      return (walkable.indexOf(map[x + "," + y]) != -1);
    }
    const astar = new ROT.Path.AStar(p._x, p._y, passableCallback, {topology:4});
    const path = [];
    const pathCallback = function(x, y) {
      path.push([x, y]);
    }
    astar.compute(m._x, m._y, pathCallback);

    // ignore the first move on the path as it is the starting point
    path.shift();
    // if the distance from the monster to the player is less than one
    // square then initiate combat
    if (path.length <= 1) {
      combat(m, p);
    } else {
      // draw whatever was on the last tile the monster was one
      drawTile(Game, m._x + "," + m._y, m);
      // the player is safe for now so update the monster position
      // to the first step on the path and redraw
      m._x = path[0][0];
      m._y = path[0][1];
      drawTile(Game, m._x + "," + m._y);
    }
  }

  function monsterAt(x, y) {
    if (Game.monsters && Game.monsters.length) {
      for (let mi=0; mi<Game.monsters.length; mi++) {
        const m = Game.monsters[mi];
        if (m && m._x == x && m._y == y) {
          return m;
        }
      }
    }
  }

  function playerAt(x, y) {
    return Game.player && Game.player._x == x && Game.player._y == y ? Game.player : null;
  }

  // if the monster is dead remove it from the game
  function checkDeath(m) {
    if (m.stats.hp < 1) {
      if (m == Game.player) {
        toast("You died!");
        lose();
      } else {
        const key = m._x + "," + m._y;
        removeMonster(m);
        sfx["kill"].play();
        return true;
      }
    }
  }

  // remove a monster from the game
  function removeMonster(m) {
    const key = m._x + "," + m._y;
    Game.scheduler.remove(m);
    Game.monsters = Game.monsters.filter(mx=>mx!=m);
    drawTile(Game, key);
  }


  /******************************
   *** combat/win/lose events ***
   ******************************/


  // this is how the player fights a monster
  function combat(hitter, receiver) {
    const names = ["you", "the monster"];
    // a description of the combat to tell
    // the user what is happening
    let msg = [];
    // roll a dice to see if the player hits
    const roll1 = ROT.RNG.getItem([1,2,3,4,5,6]);
    // a hit is a four or more
    if (roll1 > 3) {
      // add to the combat message
      msg.push(hitter.name + " hit " + receiver.name + ".");
      // remove hitpoints from the receiver
      receiver.stats.hp -= roll1;
      // play the hit sound
      sfx["hit"].play();
    } else {
      sfx["miss"].play();
      msg.push(hitter.name + " missed " + receiver.name + ".");
    }
    // if there is a message to display do so
    if (msg) {
      toast(battleMessage(msg));
    }
    // update the player's stats
    renderStats(Game.player.stats);
    // check if the receiver has died
    checkDeath(receiver);
  }

  // this gets called when the player wins the game
  function win() {
    Game.engine.lock();
    // play the win sound effect a bunch of times
    for (let i=0; i<5; i++) {
      setTimeout(function() {
        sfx["win"].play();
      }, 100 * i);
    }
    // set our stats for the end screen
    setEndScreenValues(Game.player.stats.xp, Game.player.stats.gold);
    // tear down the game
    destroy(Game);
    // show the blingy "win" screen to the user
    showScreen("win");
  }

  // this gets called when the player loses the game
  function lose() {
    Game.engine.lock();
    // change the player into a tombstone tile
    const p = Game.player;
    p.character = "T";
    drawTile(Game, p._x + "," + p._y);
    // create an animated div element over the top of the game
    // holding a rising ghost image above the tombstone
    const ghost = createJuiceSprite([p._x, p._y], "T", "float-up");
    // we stop listening for user input while the ghost animates
    removeListeners(Game);
    // play the lose sound effect
    sfx["lose"].play();
    // wait 2 seconds for the ghost animation to finish
    setTimeout(function() {
      // set our stats for the end screen
      setEndScreenValues(Game.player.stats.xp, Game.player.stats.gold);
      // tear down the game
      destroy(Game);
      // show the "lose" screen to the user
      showScreen("lose");
    }, 2000);
  }


  /************************************
   *** graphics, UI & browser utils ***
   ************************************/


  const clickevt = !!('ontouchstart' in window) ? "touchstart" : "click";

  // handy shortcuts and shims for manipulating the dom
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);
  NodeList.prototype.forEach = Array.prototype.forEach

  // this code resets the ROT.js display canvas
  // and sets up the touch and click event handlers
  // when it's called at the start of the game
  function resetCanvas(el) {
    $("#canvas").innerHTML = "";
    $("#canvas").appendChild(el);
    window.onkeydown = keyHandler;
    window.onkeyup = arrowStop;
    if (usePointer) { $("#canvas").addEventListener(clickevt, handlePointing); };
    if (useArrows) {
      document.ontouchstart = handleArrowTouch;
      document.ontouchend = arrowStop;
    };
    clearInterval(gamepadPoller);
    gamepadPoller = setInterval(pollGamepads, 25);
    showScreen("game");
  }

  // this function uses CSS styles to reposition the
  // canvas so that the player is centered.
  // it does this using an "ease" animation which
  // gives a sort of camera follow effect.
  function rescale(x, y, game) {
    const c = $("#canvas");
    const scale = (window.innerWidth < 600 ? scaleMobile : scaleMonitor);
    const offset = (game.touchScreen ? touchOffsetY : 0);
    const tw = ((x * -tileOptions.tileWidth) +
                (tileOptions.width * tileOptions.tileWidth / 2) + -4);
    const th = ((y * -tileOptions.tileHeight) +
                (tileOptions.height * tileOptions.tileHeight / 2) + offset);
    if (canvas) {
      // this applies the animation effect
      canvas.style.transition = "transform 0.5s ease-out 0s";
      if (game.display) {
        game.display.getContainer().getContext('2d').imageSmoothingEnabled = false;
      }
      // this sets the scale and position to focus on the player
      canvas.style.transform =
        "scale(" + scale + ") " + "translate3d(" + Math.floor(tw) +
        "px," + Math.floor(th) + "px,0px)";
    }
  }

  // while showing the lose animation we don't want
  // any event handlers to fire so we remove them
  // and lock the game
  function removeListeners(game) {
    if (game.engine) {
      game.lastArrow = null;
      clearInterval(game.arrowInterval);
      game.arrowInterval = null;
      game.engine.lock();
      game.scheduler.clear();
      window.removeEventListener("arrow", arrowEventHandler);
      game.arrowListener = false;
      window.onkeydown = null;
      window.onkeyup = null;
      if (usePointer) { $("#canvas").removeEventListener(clickevt, handlePointing); };
      if (useArrows) {
        document.ontouchstart = null;
        document.ontouchend = null;
      };
      clearInterval(gamepadPoller);
    }
  }

  // hides all screens and shows the requested screen
  function showScreen(which, ev) {
    ev && ev.preventDefault();
    history.pushState(null, which, "#" + which);
    const el = $("#" + which);
    const actionbutton = $("#" + which + ">.action");
    document.querySelectorAll(".screen")
    .forEach(function(s) {
      s.classList.remove("show");
      s.classList.add("hide");
    });
    el.classList.remove("hide");
    el.classList.remove("show");
    void(el.offsetHeight); // trigger CSS reflow
    el.classList.add("show");
    if (actionbutton) { actionbutton.focus(); };
  }

  // set the end-screen message to show
  // how well the player did
  function setEndScreenValues(xp, gold) {
    $$(".xp-stat").forEach(el=>el.textContent = Math.floor(xp));
    $$(".gold-stat").forEach(el=>el.textContent = gold);
  }

  // updates the contents of the inventory UI
  // with a list of things you want in there
  // items is an array of ["C", "Words"]
  // where "C" is the character from the tileset
  // and "Words" are whatever words you want next
  // to it
  function renderInventory(items) {
    const inv = $("#inventory ul");
    inv.innerHTML = "";
    items.forEach(function(i, idx) {
      const tile = tileOptions.tileMap[i[0]];
      const words = i[1];
      attach(inv,
           el("li", {"onclick": selectedInventory.bind(null, i, idx, items),
                     "className": "inventory-item",},
              [el("div", {
                "className": "sprite",
                "style": "background-position: -" +
                  tile[0] + "px -" + tile[1] + "px;"
              }), words]));
    });
  }

  // called when an inventory item is selected
  function selectedInventory(which, index, items, ev) {
    // this function is called when an inventory item is clicked
    toast(which[1] + " selected");
    toggleInventory(ev, true);
    // if you want to remove an item from the inventory
    // inventoryRemove(items, which);
  }

  // call this to remove an item from the inventory
  function inventoryRemove(items, which) {
    const idx = items.indexOf(which);
    items.splice(idx, 1);
    renderInventory(items);
  }

  // updates the stats listed at the bottom of the screen
  // pass in an object containing key value pairs where
  // the key is the name of the stat and the value is the
  // number
  function renderStats(stats) {
    const st = $("#hud");
    st.innerHTML = "";
    for (let s in stats) {
      attach(st, el("span", {}, [s.toUpperCase() + ": " + stats[s]]));
    }
  }

  // toggles the inventory UI open or closed
  function toggleInventory(ev, force) {
    const c = ev.target.className;
    if (c != "sprite" && c != "inventory-item" || force) {
      ev.preventDefault();
      // toggle the inventory to visible/invisible
      const b = $("#inventory>span");
      const d = $("#inventory>div");
      if (b.style.display == "none") {
        b.style.display = "block";
        d.style.display = "none";
      } else {
        b.style.display = "none";
        d.style.display = "block";
      }
      return false;
    }
  }

  // creates a sprite overlaying the screen
  function createSprite(pos, character) {
    const tile = tileOptions.tileMap[character];
    const tw = tileOptions.tileWidth;
    const th = tileOptions.tileHeight;
    const left = "left:" + ((pos[0]) * tw) + "px;";
    const top = "top:" + ((pos[1] - 1.25) * th) + "px;";
    const tileoffset = "background-position: -" + tile[0] + "px -" + tile[1] + "px;";
    const sprite = el("div", {
      "className": "sprite free " + character + "-sprite",
      "style": tileoffset + left + top,
    });
    sprite.style.width = tileOptions.tileWidth + "px";
    sprite.style.height = tileOptions.tileHeight + "px";
    return attach($("#canvas"), sprite);
  }

  // create a sprite for some juice animation that
  // disappears once the animation is done
  function createJuiceSprite(pos, character, animation) {
    const sprite = createSprite(pos, character);
    sprite.onanimationend = function() { rmel(sprite); };
    sprite.classList.add(animation);
    return sprite;
  }

  // creates a battle message with highlighted outcomes
  // pass it an array of strings like:
  // ["Something missed something.", "Something hit something."]
  // it will highlight the word "miss" and "hit"
  // by giving them a CSS class
  function battleMessage(messages) {
    const components = messages.reduce(function(msgs, m) {
      return msgs.concat(m.split(" ").map(function(p) {
        const match = p.match(/hit|miss/);
        return el("span", {"className": match ? match[0] : ""}, [p, " "]);
      })).concat(el("br", {}));
    }, []);
    return el("span", {}, components);
  }

  // this function displays a message at the top
  // of the game screen for the player such as
  // "You have found a sneaky wurzel."
  function toast(message) {
    const m = $("#message");
    // if current scheduler act is player
    // then clear our messages first
    // or if we're hiding the messages anyway
    if (Game.scheduler._current == Game.player ||
        m.className.indexOf("show") == -1) {
      m.innerHTML = "";
    }
    m.classList.remove("fade-out");
    m.classList.add("show");
    if (typeof(message) == "string") {
      m.appendChild(el("span", {}, [message]));
    } else {
      m.appendChild(message);
    }
  }

  // hide the toast message
  function hideToast(instant) {
    const m = $("#message");
    if (instant) {
      m.classList.remove("show");
      m.classList.remove("fade-out")
      m.innerHTML = "";
    } else if (m.className.match("show")) {
      m.classList.remove("show");
      m.classList.add("fade-out");
      m.onanimationend = function() {
        m.classList.remove("fade-out");
        m.innerHTML = "";
      };
    }
  }

  // create an HTML element
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
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
  function handlePointing(ev) {
    ev.preventDefault();
    if (Game.touchScreen) { return; }
    const g = $("#game");
    // where on the map the click or touch occurred
    const cx = (ev["touches"] ? ev.touches[0].clientX : ev.clientX);
    const cy = (ev["touches"] ? ev.touches[0].clientY : ev.clientY)
    const x = cx - (g.offsetWidth / 2);
    const y = cy - (g.offsetHeight / 2) -
          (game.touchScreen ? touchOffsetY : 0) * window.devicePixelRatio;
    // figure out which quadrant was clicked relative to the player
    const qs = Math.ceil((Math.floor(
              (Math.atan2(y, x) + Math.PI) /
              (Math.PI / 4.0)) % 7) / 2);
    const dir = ROT.DIRS[8][tapMap[qs]];
    // actually move the player in that direction
    movePlayer(dir);
  }

  // when keyboard input happens this even handler is called
  // and the position of the player is updated
  function keyHandler(ev) {
    const code = ev.keyCode;
    // prevent zoom
    if (code == 187 || code == 189) {
      ev.preventDefault();
      return;
    }
    // full screen
    if (code == 70 && ev.altKey && ev.ctrlKey && ev.shiftKey) {
      document.body.requestFullscreen();
      console.log("Full screen pressed.");
      return;
    }
    if (code == 81) { destroy(Game); return; }
    if (code == 73) { toggleInventory(ev, true); return; }
    // if (code == 27) { toggleInventory(ev, true, true); return; } ; escape button should only close
    if (code == 190) { Game.engine.unlock(); return; } // skip turn
    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }
    const dir = ROT.DIRS[8][keyMap[code]];
    if (Game.display) {
      ev.preventDefault();
    }
    arrowStart(dir);
  }


  // when the on-screen arrow buttons are clicked
  function handleArrowTouch(ev) {
    ev.preventDefault();
    if (ev.target["id"] == "btn-skip") {
      Game.engine.unlock(); return;
    }
    // translate the button to the direction
    const dir = ROT.DIRS[8][arrowMap[ev.target["id"]]];
    // actually move the player in that direction
    arrowStart(dir);
  }

  // handle an on-screen or keyboard arrow
  function arrowStart(dir) {
    const last = Game.lastArrow;
    Game.lastArrow = dir;
    if (!last) {
      document.dispatchEvent(new Event("arrow"));
      if (Game.arrowInterval) { clearInterval(Game.arrowInterval); };
      Game.arrowInterval = setInterval(function() {
        document.dispatchEvent(new Event("arrow"));
      }, turnLengthMS);
    }
  }

  // when the fingers have been lifted
  function arrowStop(ev) {
    clearInterval(Game.arrowInterval);
    Game.arrowInterval = null;
    Game.lastArrow = null;
  }

  // actually move the player when an arrow is pressed
  function arrowEventHandler() {
    if (Game.lastArrow) {
      movePlayer(Game.lastArrow);
    } else {
      arrowStop();
    }
  }

  // trigger arrow events from gamepad changes
  function pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
      var gp = gamepads[i];
      if (gp) {
        const newstate = {
          "h": Math.round(gp.axes[6]),
          "v": Math.round(gp.axes[7]),
          "b": [0,1,3,4].map(i=>gp.buttons[i].pressed),
        }
        const oldstate = gamepadState[gp.id];
        if (oldstate) {
          [["btn-left", "h", "btn-right"], ["btn-up", "v", "btn-down"]].map(tr => {
            if (newstate[tr[1]] != oldstate[tr[1]]) {
              if (newstate[tr[1]] == 0) {
                arrowStop();
              } else {
                arrowStart(ROT.DIRS[8][arrowMap[tr[newstate[tr[1]] + 1]]]);
              }
            }
          });
        }
        gamepadState[gp.id] = newstate;
        //console.log(newstate);
        //console.log(gp.index, gp.id, gp.buttons, gp.axes);
        //console.log("Gamepad connected at index " + gp.index + ": " + gp.id +
        //  ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
        //gameLoop();
        //clearInterval(interval);
      }
    }
  }

  // this function gets called from the first screen
  // when the "play" button is clicked.
  function startGame(ev) {
    showScreen("game");
    sfx["rubber"].play();
    // if this was a touch event show the arrows buttons
    if (ev["touches"]) {
      $("#arrows").style.display = "block";
      Game.touchScreen = true;
    }
    init(Game);
  }

  // this function gets called when the user selects
  // a menu item on the front page and shows the 
  // relevant screen
  function handleMenuChange(which, ev) {
    ev.preventDefault();
    const choice = which.getAttribute("value");
    showScreen(choice);
    sfx["choice"].play();
  }

  // this helper function hides any of the menu
  // screens above, shows the title screen again,
  // and plays a sound as it does so
  function hideModal(ev) {
    ev.preventDefault();
    showScreen("title");
    sfx['hide'].play();
  }

  function cleanup() {
    destroy(Game);
    $("#play").removeEventListener(clickevt, startGame);
  }


  /***************
   *** Startup ***
   ***************/


  // this code is called at load time and sets the game title
  // to the `gametitle` variable at the top
  document.querySelectorAll(".game-title-text")
  .forEach(function(t) {
    t.textContent = gametitle;
  })

  // listen for the start game button
  $("#play").addEventListener(clickevt, startGame);

  // listen for gamepads to make them readable
  window.addEventListener("gamepadconnected", function(e) {
    console.log("Gamepad connected:", e);
  });

  // allow live reloading of the game code
  if (w["rbb"]) {
    w["rbb"].cleanup();
  } else {
    // listen for the end of the title
    // animation to show the first screen
    $("#plate").addEventListener(
        "animationend", showScreen.bind(null, 'title'));
    // listen for clicks on the front screen menu options
    document.querySelectorAll("#options #menu input")
    .forEach(function(el) {
      el.addEventListener("touchstart",
          handleMenuChange.bind(null, el));
      el.addEventListener("click",
          handleMenuChange.bind(null, el));
    });
    // listen for inventory interactions
    $("#inventory").addEventListener(clickevt, toggleInventory);
    // listen for "close modal" ok buttons
    document.querySelectorAll(".modal button.action")
    .forEach(function(el) {
      el.addEventListener(clickevt, hideModal);
    });
    // listen for back button navigation
    window.onpopstate = function(ev) {
      //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
      if (Game.engine) {
        destroy(Game);
      } else {
        hideModal(ev);
      }
    };
  }

  w["rbb"] = Game;
  
})(window);
