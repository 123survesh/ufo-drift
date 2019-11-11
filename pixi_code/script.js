var maplings = new Mapling({
    length: 100
});

let app = new PIXI.Application({
    width: 150,
    height: 150,
    antialias: true,
    transparent: false,
    resolution: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
var target = document.getElementById('target');
target.appendChild(app.view);

var objectCotainer = new PIXI.Container();
var mapContainer = new PIXI.Container();
var pathContainer = new PIXI.Container();
var controlPointContainer = new PIXI.Container();
var assemblerConfig = {
    directions: ["v-u-l", "h-l-d", "v-d-r", "h-r-u"],
    height: 400,
    width: 400,
    mapling: maplings,
    container: mapContainer,
    controlPointContainer: controlPointContainer
}
var directionAssembler = new Assembler(assemblerConfig);

mapContainer.addChild(pathContainer);
mapContainer.addChild(controlPointContainer);

objectCotainer.addChild(createCrossHair());

app.stage.addChild(mapContainer);
app.stage.addChild(objectCotainer);

window.addEventListener("keyup", function(e) {
    switch (e.keyCode) {

        case 37: //left    
        case 38: // up    
        case 39: //right    
        case 40: //down
        case 32: // space
            {
                velocity.x = 0
                velocity.y = 0
                firstFlag = true;
                manualOverride = false;
            }
    }
});
window.addEventListener("keydown", function(e) {
    switch (e.keyCode) {

        case 37: //left
            {
                velocity.x = 5
                break;
            }

        case 38: // up
            {
                velocity.y = 5
                break;
            }

        case 39: //right
            {
                velocity.x = -5
                break;
            }

        case 40: //down
            {
                velocity.y = -5
                break;
            }

        case 32: // space
            {
                moveOnOrc();
                firstFlag = false;
            }
    }
})


var velocity = new Vector2();
var manualPosition = new Vector2()
var initialPosition = new Vector2();
var screenCenter = new Vector2();
screenCenter.set(app.view.width / 2, app.view.height / 2);


var state = play;

app.ticker.add(function(dt) {
    gameLoop(dt);
})

function addLine(start, end) {
    let line = new PIXI.Graphics();
    line.lineStyle(4, 0xFFFFFF, 1);
    line.moveTo(start.x, start.y);
    line.lineTo(start.x+1, start.y+1);
    // line.x = 32;
    // line.y = 32;
    mapContainer.addChild(line);
    // return line;
}

var angle;
var radius;
var firstFlag = true;
var manualOverride = false;



var curveMover;

function moveOnOrc() {
    if (firstFlag) {
      // console.log(screenCenter)
        var screenCenterInverse = new Vector2(-screenCenter.x, -screenCenter.y);
        initialPosition.set(mapContainer.x, mapContainer.y);
        var controlPosition = directionAssembler.que[0].controlPosition;
        angle = Math.atan2(screenCenterInverse.y - controlPosition.y, screenCenterInverse.x - controlPosition.x);
        angle = radToDeg(angle);
        radius = distanceBetween(screenCenterInverse, controlPosition);
        // radius -= 5; // value by which the control points are moved from the tracks
        var center = pointOnCircle(initialPosition, angle , radius);
        // console.log("angle = "+angle);
        // console.log("radius = ", radius);
        // console.log("center = ", center);
        var curveTranslatorConfig = {
            startingAngle: 180+angle,
            clockwiseFlag: false,
            callback: function(ang) {
                var pos = pointOnCircle(center, ang, radius);
                manualPosition.x = pos.x;
                manualPosition.y = pos.y;
            },
            step: 5
        }
        curveMover = new curveTranslator(curveTranslatorConfig);
        velocity.set(0, 0);
        manualOverride = true;

    }
    curveMover.rotate();

}

function gameLoop(dt) {
    state(dt)
}

// move the mapContainer based on the velocity
function play(dt) {
    mapContainer.x += velocity.x;
    mapContainer.y += velocity.y;
    if (manualOverride) {
        mapContainer.x = manualPosition.x;
        mapContainer.y = manualPosition.y;
    }
    updateScreenCenter();

    // console.log(screenCenter);
}

function createCrossHair() {
    var cross = new Canvaz({ height: 150, width: 150 });
    cross.ctx.beginPath();
    cross.ctx.moveTo(75, 0);
    cross.ctx.lineTo(75, 150);
    cross.ctx.moveTo(0, 75);
    cross.ctx.lineTo(150, 75);
    cross.ctx.strokeStyle = "red";
    cross.ctx.stroke();


    return canvasToSprite(cross.canvas);


}

function updateScreenCenter() {
    screenCenter.x = mapContainer.x - 75;
    screenCenter.y = mapContainer.y - 75;
}