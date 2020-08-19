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

  // these map tiles are walkable
  const walkable = [".", "*", "g"]

  // these map tiles should not be replaced by room edges
  const noreplace = [".", "*", "g", "M", "╔", "╗", "╚", "╝", "═", "║"];

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
    // reference to the ROT.js engine which
    // manages stuff like scheduling
    engine: null,
    // schedules events in the game for ROT.js
    scheduler: null,
    // reference to the player object
    player: null,
    // reference to the monster object
    monster: null,
    // the position of the amulet in the map
    // as `x,y` so it can be checked against
    // the map keys above
    amulet: null,
    // clean up this game instance
    // we keep a reference for live-reloading
    cleanup: cleanup,
  };

  // this gets called by the menu system
  // to launch the actual game
  function init(game) {
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
    game.scheduler.add(game.monster, true);

    // render some example items in the inventory
    renderInventory(game.player.inventory, function(which, ev) {
      // this function is called when an inventory item is clicked
      toast(which[1] + " selected");
      toggleInventory(ev, true);
    });

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
      game.engine = null;
      game.scheduler.clear();
      game.scheduler = null;
      game.player = null;
      game.monster = null;
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
    // draw the map so far on the screen
    drawWholeMap(game.display, game.map);

    // finally we put the player and the monster on their
    // starting tiles, which must be from the walkable list
    game.player = createBeing(makePlayer, freeCells);
    game.monster = createBeing(makeMonster, freeCells);

    // here we are re-scaling the background so it is
    // zoomed in and centered on the player tile
    rescale(game.player._x, game.player._y);
  }

  // here we are creating the treasure chest items
  function generateItems(game, freeCells) {
    for (let i=0; i<15; i++) {
      const index = Math.floor(
            ROT.RNG.getUniform() * freeCells.length);
      const key = freeCells.splice(index, 1)[0];
      // the first chest contains the amulet
      if (!i) {
        game.amulet = key;
        game.map[key] = "*";
      } else {
        // add either a treasure chest
        // or a piece of gold to the map
        game.map[key] = ROT.RNG.getItem(["*", "g"]);
      }
    }
  }

  // these plant tiles are purely bling
  // we're just going to place 100 plants randomly
  // in the spaces where there isn't anything already
  function generateScenery(map, freeCells) {
    for (let i=0;i<100;i++) {
      if (freeCells.length) {
        const index = Math.floor(
              ROT.RNG.getUniform() * freeCells.length);
        const key = freeCells.splice(index, 1)[0];
        map[key] = ROT.RNG.getItem("abcde");
      }
    }
  }

  // to make the map look a bit cooler we'll actually draw
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

      // the next four loops just draw each side of the room
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

  // we ask ROT.js to actually draw the map tiles via display
  function drawWholeMap(display, map) {
    for (let key in map) {
      const parts = key.split(",");
      const x = parseInt(parts[0]);
      const y = parseInt(parts[1]);
      display.draw(x, y, map[key]);
    }
  }

  // both the player and monster initial position is set
  // by choosing a random freeCell and creating the type
  // of object (`what`) on that position
  function createBeing(what, freeCells) {
    const index = Math.floor(
          ROT.RNG.getUniform() * freeCells.length);
    // remove from the freeCells array now that it's taken
    const key = freeCells.splice(index, 1)[0];
    const parts = key.split(",");
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);
    const being = what(x, y);
    being.draw();
    return being;
  }

  /******************
   *** the player ***
   ******************/


  // creates a player object with position, inventory, and stats
  function makePlayer(x, y) {
    return {
      // player's position
      _x: x,
      _y: y,
      // which tile to draw the player with
      character: "@",
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
      // and then wait for keyboard input from the user
      act: () => {
        Game.engine.lock();
        window.addEventListener("keydown", keyHandler);
      },
      // this is how the player draws itself on the map
      // using ROT.js display
      draw: drawEntity,
    }
  }

  // when keyboard input happens this even handler is called
  // and the position of the player is updated
  function keyHandler(ev) {
    const code = ev.keyCode;
    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }
    const dir = ROT.DIRS[8][keyMap[code]];
    movePlayer(dir);
  }

  // this method gets called by the `movePlayer` function
  // in order to check whether they hit an empty box
  // or The Amulet
  function checkItem(entity) {
    const key = entity._x + "," + entity._y;
    if (key == Game.amulet) {
      // the amulet is hit initiate the win flow below
      win();
    } else if (Game.map[key] == "g") {
      // if the player stepped on gold
      // increment their gold stat,
      // show a message, re-render the stats
      // then play the pickup/win sound
      Game.player.stats.gold += 1;
      renderStats(Game.player.stats);
      toast("You found gold!");
      sfx["win"].play();
    } else if (Game.map[key] == "*") {
      // if an empty box is opened
      // by replacing with a floor tile, show the user
      // a message, and play the "empty" sound effect
      toast("This chest is empty.");
      sfx["empty"].play();
    }
    // make the item disappear by replacing with floor
    Game.map[key] = ".";
  }

  // this function moves the player on the tilemap
  // it is called from the keyboard event handler above
  // `keyHandler()`
  // and also from the click/tap handler `handleTouch()` below
  function movePlayer(dir) {
    // get a reference to our global player object
    // this is needed when called from the tap/click handler
    const p = Game.player;

    // work out the new position based on direction vector
    const x = p._x + dir[0];
    const y = p._y + dir[1];

    // map lookup - if we're not moving onto a floor tile
    // or a treasure chest, then we should abort this move
    const newKey = x + "," + y;
    if (walkable.indexOf(Game.map[newKey]) == -1) { return; }

    // check if we've hit the monster
    // and if we have initiate combat
    const m = Game.monster;
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
    p.draw();
    // re-locate the game screen to center the player
    rescale(x, y);
    // hide the toast message between turns
    hideToast();
    // remove the keyboard event listener and unlock the scheduler
    window.removeEventListener("keydown", keyHandler);
    Game.engine.unlock();
    // play the "step" sound
    sfx["step"].play();
    // check if the player stepped on an item
    checkItem(p);
  }

  // draw function common to monster and player
  function drawEntity() {
    Game.display.draw(this._x, this._y, this.character);
  }


  /*******************
   *** The monster ***
   *******************/


  // basic ROT.js entity with position and stats
  function makeMonster(x, y) {
    return {
      // monster position
      _x: x,
      _y: y,
      // which tile to draw the player with
      character: "M",
      // the monster's stats
      stats: {"hp": 14},
      // called by the ROT.js scheduler
      act: monsterAct,
      // draw the monster
      draw: drawEntity,
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

    // we just want the first move on the path from monster to player
    // because this function is called once per monster turn and the
    // player will have moved on the next round
    path.shift();
    // if the distance from the monster to the player is less than one
    // square the player has lost the game
    if (path.length <= 1) {
      combat(m);
    } else {
      // draw whatever was on the last tile the monster was one
      display.draw(m._x, m._y, map[m._x + "," + m._y]);
      // the player is safe for now so update the monster position
      // and redraw
      m._x = path[0][0];
      m._y = path[0][1];
      m.draw();
    }
  }

  // if the monster is dead remove it from the game
  function checkDeath(m) {
    if (m.stats.hp < 1) {
      Game.display.draw(m._x, m._y, Game.map[m._x + "," + m._y]);
      Game.scheduler.remove(m);
      Game.monster = null;
      sfx["kill"].play();
    }
  }


  /******************************
   *** combat/win/lose events ***
   ******************************/


  // this is how the player fights a monster
  function combat(monster) {
    // a description of the combat to tell
    // the user what is happening
    let msg = [];
    // roll a dice to see if the player hits
    const roll1 = ROT.RNG.getItem([1,2,3,4,5,6]);
    // a hit is a four or more
    if (roll1 > 3) {
      // add to the combat message
      msg.push("You hit the monster.");
      // remove hitpoints from the monster
      monster.stats.hp -= roll1;
      // play the hit sound
      sfx["hit"].play();
      // check if the monster has died
      checkDeath(monster);
    } else {
      sfx["miss"].play();
      msg.push("You missed the monster.");
    }
    // if the monster is alive it hits back
    if (monster.stats.hp > 0) {
      // roll a dice to see if the monster hits
      const roll2 = ROT.RNG.getItem([1,2,3,4,5,6])
      // a hit is a four or more
      if (roll2 > 3) {
        // add to the combat message
        msg.push("The monster hit.");
        // remove hit points from the player
        Game.player.stats.hp -= roll2;
        // re-render the player's hud stats
        renderStats(Game.player.stats);
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
        msg.push("The monster missed.");
        // then play the miss sound after 1/4 second
        setTimeout(function() {
          sfx["miss"].play();
        }, 250);
      }
    }
    // if there is a message to display do so
    if (msg) {
      toast(battleMessage(msg));
    }
  }

  // this gets called when the player wins the game
  function win() {
    // play the win sound effect a bunch of times
    for (let i=0; i<5; i++) {
      setTimeout(function() {
        sfx["win"].play();
      }, 100 * i);
    }
    // tear down the game
    destroy(Game);
    // show the blingy "win" screen to the user
    showScreen("win");
  }

  // this gets called when the player loses the game
  function lose() {
    // change the player into a tombstone tile
    const p = Game.player;
    Game.display.draw(p._x, p._y, "T");
    // create an animated div element over the top of the game
    // holding a rising ghost image above the tombstone
    const ghost = createGhost();
    // we stop listening for user input while the ghost animates
    removeListeners(Game);
    // play the lose sound effect
    sfx["lose"].play();
    // wait 2 seconds for the ghost animation to finish
    setTimeout(function() {
      // remove the ghost animation
      rmel(ghost);
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
  NodeList.prototype.forEach = Array.prototype.forEach

  // this code resets the ROT.js display canvas
  // and sets up the touch and click event handlers
  // when it's called at the start of the game
  function resetCanvas(el) {
    $("#canvas").innerHTML = "";
    $("#canvas").appendChild(el);
    $("#canvas").addEventListener(clickevt, handleTouch);
    showScreen("game");
  }

  // this function uses CSS styles to reposition the
  // canvas so that the player is centered.
  // it does this using an "ease" animation which
  // gives a sort of camera follow effect.
  function rescale(x, y) {
    const c = $("canvas");
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
  function removeListeners(game) {
    if (game.engine) {
      game.engine.lock();
      game.scheduler.clear();
      window.removeEventListener("keydown", keyHandler);
      $("#canvas").removeEventListener(clickevt, handleTouch);
    }
  }

  // hides all screens and shows the requested screen
  function showScreen(which, ev) {
    ev && ev.preventDefault();
    document.querySelectorAll(".screen")
    .forEach(function(s) {
      s.classList.remove("show");
      s.classList.add("hide");
    });
    $("#" + which).classList.remove("hide");
    $("#" + which).classList.add("show");
    const action = $("#" + which + ">.action");
    if (action) { action.focus(); };
  }

  // updates the contents of the inventory UI
  // with a list of things you want in there
  // items is an array of ["C", "Words"]
  // where "C" is the character from the tileset
  // and "Words" are whatever words you want next
  // to it
  function renderInventory(items, callback) {
    const inv = $("#inventory ul");
    inv.innerHTML = "";
    items.forEach(function(i) {
      const tile = tileOptions.tileMap[i[0]];
      const words = i[1];
      attach(inv,
           el("li", {"onclick": callback.bind(null, i),
                     "className": "inventory-item",},
              [el("div", {
                "className": "sprite",
                "style": "background-position: -" +
                  tile[0] + "px -" + tile[1] + "px;"
              }), words]));
    });
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

  // creates the ghost sprite when the player dies
  function createGhost() {
    return attach($("#game"),
        el("div", {"className": "sprite ghost free float-up"}));
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
    m.classList.remove("fade-out");
    m.classList.add("show");
    if (typeof(message) == "string") {
      m.textContent = message;
    } else {
      m.innerHTML = "";
      m.appendChild(message);
    }
  }

  // hide the toast message
  function hideToast(instant) {
    const m = $("#message");
    if (instant) {
      m.classList.remove("show");
      m.classList.remove("fade-out")
    } else if (m.className.match("show")) {
      m.classList.remove("show");
      m.classList.add("fade-out");
      m.onanimationend = function() {
        m.classList.remove("fade-out");
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
  function handleTouch(ev) {
    ev.preventDefault();
    const g = $("#game");
    // where on the map the click or touch occurred
    const cx = (ev["touches"] ? ev.touches[0].clientX : ev.clientX);
    const cy = (ev["touches"] ? ev.touches[0].clientY : ev.clientY)
    const x = cx - (g.offsetWidth / 2);
    const y = cy - (g.offsetHeight / 2);
    // figure out which quadrant was clicked relative to the player
    const qs = Math.ceil((Math.floor(
              (Math.atan2(y, x) + Math.PI) /
              (Math.PI / 4.0)) % 7) / 2);
    const dir = ROT.DIRS[8][tapMap[qs]];
    // actually move the player in that direction
    movePlayer(dir);
  }

  // this function gets called from the first screen
  // when the "play" button is clicked.
  function startGame() {
    showScreen("game");
    sfx["rubber"].play();
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
  }

  w["rbb"] = Game;
  
})(window);
