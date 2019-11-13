var appConfig = {
    width: 300,
    height: 400,
    antialias: true,
    transparent: false,
    resolution: 1
}

let app = new PIXI.Application(appConfig);

var target = document.getElementById('target');
target.appendChild(app.view);

var gameConfig = {
	app: app,
	screen: appConfig,
	player: createCrossHair()
}

var game = new Game(gameConfig);

var _h = window.innerHeight * .8;
var _w = _h * .8; 

target.style.height = _h;

target.style.width = _w;