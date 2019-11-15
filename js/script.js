var target = document.getElementById('target');

var _h = window.innerHeight * .8;
var _w = _h * .8; 

// target.style.height = _h;
// target.style.width = _w;

var targetStyles = document.createElement('style');

targetStyles.innerText = `#target{height: ${_h}px; width: ${_w}px; top: 50%; left: 50%; transform: translate(-50%, -50%)}`;
document.body.appendChild(targetStyles); 


var appConfig = {
    width: _w,
    height: _h,
    antialias: true,
    transparent: false,
    resolution: 1
}

var gameConfig = {
	target: target,
	screen: appConfig,
	// crossHair: createCrossHair() // for testing
}

var game = new Game(gameConfig);