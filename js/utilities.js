var Vector2 = (function() {

    function vec2(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    function _set(x, y) {
        this.x = x;
        this.y = y;
    }

    function _setX(x) {
        this.x = x;
    }

    function _setY(y) {
        this.y = y;
    }

    function _invert() {
        this.x *= -1;
        this.y *= -1;
    }

    function _getCopy() {
        return new vec2(this.x, this.y);
    }

    vec2.prototype.set = function(x, y) {
        _set.call(this, x, y);
    };

    vec2.prototype.setX = function(x) {
        _setX.call(this, x);
    };

    vec2.prototype.setY = function(y) {
        _setY.call(this, y);
    };

    vec2.prototype.invert = function() {
        _invert.call(this);
    }

    vec2.prototype.getCopy = function(){
        return _getCopy.call(this);
    }

    return vec2;
})();

function distanceBetween(a, b) {
    var x = a.x - b.x;
    var y = a.y - b.y;
    return Math.sqrt((x * x) + (y * y));
}

function addAttributes(element, attributes) {
    var keys = Object.keys(attributes);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
        element.setAttribute(keys[i], attributes[keys[i]]);
    }
}

function radToDeg(rad) {
    return (rad * (180 / Math.PI));
}

function degToRad(deg) {
    return (deg * (Math.PI / 180));
}

function addClasses(element, classes) {
    if (typeof(classes) == 'string') {
        classes = classes.split(" ");
    }
    var length = classes.length;
    for (var i = 0; i < length; i++) {
        element.classList.add(classes[i]);
    }

}

function updateObject(source, destination, keyList) {
    var keys = Object.keys(source);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
        if (keyList.indexOf(keys[i]) > -1) {
            destination[keys[i]] = source[keys[i]]; // parameter sent as reference hence updates in the memory location
        }
    }
}

function mirrorImage(ctx, image, horizontal = false, vertical = false) {
    var x = 0,
        y = 0;
    ctx.save(); // save the current canvas state
    ctx.setTransform(
        horizontal ? -1 : 1, 0, // set the direction of x axis
        0, vertical ? -1 : 1, // set the direction of y axis
        x + horizontal ? image.width : 0, // set the x origin
        y + vertical ? image.height : 0 // set the y origin
    );
    ctx.drawImage(image, 0, 0);
    ctx.restore(); // restore the state as it was when this function was called
}

function canvasToSprite(canvas) {
    return new PIXI.Sprite.from(canvas);
}

var curveTranslator = (function() {
    function translate(config) {
        _init.call(this, config);
    }

    function _init(config) {
        this.angle = this.startingAngle = config.startingAngle;
        this.rotatedBy = 0;
        this.clockwiseFlag = config.clockwiseFlag;
        this.callback = config.callback;
        this.stepValue = config.step || 1;
        if (!this.clockwiseFlag) {
            this.step = this.stepValue * -1;
        }
        else
        {
            this.step = this.stepValue;
        }
    }

    function _move() {
        this.angle += this.step;
        this.rotatedBy += this.step;
        if (this.angle < 360) {
            this.callback(this.angle);
        } else {
            this.angle = 0;
        }
    }

    translate.prototype.move = function() {
        _move.call(this);
    }

    translate.prototype.reset = function() {
        _init.call(this, config);
    }

    return translate
})()

function pointOnCircle(center, degree, radius, radian) {
    var angle = (typeof radian === 'number') ? radian : degToRad(degree);
    var coords = new Vector2();
    coords.x = radius * Math.cos(angle) + center.x;
    coords.y = radius * Math.sin(angle) + center.y;
    return coords;
}

function textureToSprite(texture)
{
    var sprite = new PIXI.Sprite(texture);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    return sprite;
}