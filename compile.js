const readFileSync = require('fs').readFileSync;
const jsdom = require("jsdom");
const minify = require('minify');
const htmlminify = require('minify').html;
const { JSDOM } = jsdom;
const dom = new JSDOM(readFileSync("index.html"));
const document = dom.window.document;

const linkouthtmlfragment = `
<a id="link-out" href="https://chr15m.itch.io/roguelike-browser-boilerplate" target="_new">Get this boilerplate<br/>to make your own game!</a>
`;

const linkoutstylefragment = `
#link-out {
    position: absolute;
    bottom: 3em;
    border-radius: 10px;
    padding: 0px;
    font-size: .66em;
    text-decoration: underline;
    text-align: center;
}
`;

(async function() {
  const jsmin = await minify('main.js').catch(console.error);
  const stylemin = await minify('style.css') + linkoutstylefragment;
  const elementscript = document.querySelector("script#main")
  const elementstyle = document.querySelector("link#style");
  const elementtitlescreen = document.querySelector("div#title");
  elementtitlescreen.innerHTML += linkouthtmlfragment;
  const stylenode = document.createElement("style");
  stylenode.textContent = stylemin;
  elementstyle.after(stylenode);
  elementstyle.parentNode.removeChild(elementstyle);
  elementscript.removeAttribute("src");
  elementscript.textContent = jsmin;
  console.log(htmlminify(dom.serialize(), {html: {
    removeAttributeQuotes: false,
    removeOptionalTags: false
  }}));
})();
