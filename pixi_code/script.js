var appConfig = {
    width: 150,
    height: 150,
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