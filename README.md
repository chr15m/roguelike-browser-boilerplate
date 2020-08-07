![](header.png)

# Hello!

Hello and thanks for purchasing the Roguelike Browser Boilerplate. Are you ready to make your roguelike? Let's get started!

[Roguelike Browser Boilerplate on itch.io >](https://chr15m.itch.io/roguelike-browser-boilerplate)

## Setup

If you're reading this you have already figured out how to unpack the zip file. Congratulations, acheivement unlocked!

The next step is to open `index.html` in your browser. You can do that however you like but the easiest thing is probably just to double-click it.

Once you've done that you're going to want to open `index.html`, `main.js`, and `style.css` in your text editor so you can change the code.

If you don't have a text editor you can use the one at [slingcode.net](https://slingcode.net/), just upload the zip file there and you can start editing.

## The Boilerplate

Let's take a look at the files in the boilerplate.

 * `index.html` is the standard web app front page. When you load this in your browser you will see the game start up. There are sections in this HTML file for each of the major screens the user sees: splash screen, title screen and menu, settings screen, credits screen, instructions screen, win and lose screens, and of course the in-game screen with hud, inventory, messages, and play area. You can modify this file to change the different screens.
 * `main.js` is where the actual Javascript game code goes. This is what drives the map generation, player and monster behaviour, and item pickups etc. You can modify this file to change the behaviour of the game itself.
 * `style.css` is a stylesheet specifying how things should be laid out on each screen, colors, fonts, and animations. You can modify this to change the appearance of menus and user interface elements.
 * `colored_tilemap_packed.png` is the tilemap containing both sprites and background tiles used in the boilerplate game. You can modify or replace this to use your own game tiles.
 * `icon.png`, `bg.png`, and `01coin.gif` are graphical assets used for the browser icon of the game, the background image on the first menu, and a rotating coin animation for the win screen.

Take a look around at each of these files to familiarize yourself.
Next up we'll look at changing stuff in these files to make the game look and work the way you want it to.

### Changing the title, icon, and font

The first thing you can do is change the game title. There are two places to change the title.

First there is the title tag at the top of the `index.html` file. This is the standard page title attribute from HTML.

``` {.html .numberLines startFrom="4"}
<title>Roguelike Browser Boilerplate</title>
```

Next there is the title that appears at the start of the game:

![](./doc/title.png)

You can change the text of this title right at the top of the `main.js`:

``` {.javascript .numberLines startFrom="1"}
// Update this string to set the game title
var gametitle = "My Rogue";
```

If your game has a longer title you might find that some letters disappear off the screen.
You can accomodate more letters by changing the size of the letters in `style.css`:

``` {.css .numberLines startFrom="150"}
.game-title-text {
  font-size: 64px;
}
```

### Changing the tileset graphics



### Changing the sound effects

### Changing the monster code

### Changing the items code

### Changing the inventory

### Where to find library documentation

### Publishing your game

A great place to publish your game is on Itch.

> Pro tip: post frequent updates and screenshots of your progress as you make your game.
> This will increase engagement when it's time to release.

### Bonus: making an app

With a few extra steps, it is possible to distribute your game as a Windows, Mac, iOS, or Android binary.

This is generally a requirement of distributing through channels like Steam.

### Final note

If you have any feedback or improvement suggestions please share them with me at [mailto:chris@mccormick.cx](chris@mccormick.cx)!

## Resources

 * [Roguelike Radio podcast](http://www.roguelikeradio.com/)
 * [/r/roguelikedev on Reddit](https://www.reddit.com/r/roguelikedev/)
 * [Roguelike tag on Itch.io]() 
 * [Roguebasin Wiki](http://www.roguebasin.com/index.php?title=Main_Page)
 * [7 Day Roguelike challenge](https://7drl.com/)
 * [BSD Rogue v5.4.4 source code](https://github.com/Davidslv/rogue)

## Credits

 * [ROT.js](https://ondras.github.io/rot.js/hp/) (BSD license)
 * [kenney.nl](https://kenney.nl/assets/micro-roguelike) (CC0 1.0 Universal license)
 * [NES.css](https://nostalgic-css.github.io/NES.css/) (MIT License)
 * [sfxr.me](https://sfxr.me) (Public domain)
 * [Pixel coin image](https://opengameart.org/content/spinning-pixel-coin-0) (CC-BY 3.0 license)

Roguelike Browser Boilerplate is Copyright Chris McCormick 2020.

## License

If you have purchased this boilerplate you're free to use it as the basis of any project, personal or commercial.

There's no need to ask permission before using it.

Giving attribution is not required, but is greatly appreciated! Please include a link to the Itch page.

If a third party wants to use the boilerplate please ask them to purchase a copy.

Thanks you very much & enjoy!
