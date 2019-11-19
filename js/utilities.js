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
        this.center = config.center;
        this.radius = config.radius;
        this.prevPosition = config.prevPosition;

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
        _init.call(this, config);
    }

    function _init(config) {

        this.oscillating = false;
        this.oscillatedBy = 0;
        this.degradingFactor = 5;
    }

    function _updateTranslation(conf)
    {
        var type = conf.type;
        var arg = conf.arg;
        var vel;
        if(type)// 1 for move and 0 for oscillate 
        {   
            _move.call(this);
            vel = _getVelocity.call(this, this.angle);
        }
        else
        {
            _oscillate.call(this, arg);
            vel = _getVelocity.call(this, this.angle);
        }
        this.callback(vel);
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

    function _getVelocity(angle)
    {
        var pos = pointOnCircle(this.center, angle, this.radius);
        var velocity = new Vector2();
        velocity.x = pos.x - this.prevPosition.x;
        velocity.y = pos.y - this.prevPosition.y;
        this.prevPosition = pos;
        return velocity;
    }

    function _updateProperties(props)
    {
        this.prevPosition = props.prevPosition || this.prevPosition;
        this.center = props.center || this.center;
        this.radius = props.radius || this.radius;
        if(typeof props.radius === 'number')
        {
            this.radius = props.radius;   
        }
        if(typeof props.startingAngle === 'number')
        {
            this.startingAngle = props.startingAngle;
        }

        if(typeof props.clockwiseFlag === 'boolean')
        {
            this.clockwiseFlag = props.clockwiseFlag;
        }
        

    }

    function _oscillate(movedBy)
    {
        if(!this.oscillating)
        {
            movedBy = movedBy - 45;
            this.moveBy = Math.abs(movedBy) / 2;
            this.oscillating = true;
        }
        if(Math.abs(this.oscillatedBy) < this.moveBy)
        {
            this.angle -= this.step;
            this.rotatedBy -= this.step; 
            this.oscillatedBy -= this.step;
            this.callback(this.angle);
        }
        else
        {
            if(this.moveBy > 0)
            {
                this.moveBy -= this.degradingFactor;
                this.step *= -1; 
                this.oscillatedBy = 0;
            }
            else
            {
                return 1; // to denote oscillation end
            }
        }
        return 0; // to denote oscillation in progress
    }

    translate.prototype.move = function() {
        _updateTranslation.call(this, {type: 1});
    }

    translate.prototype.oscillate = function(oscillateBy) {
        _updateTranslation.call(this, {type:0, arg: oscillateBy});
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