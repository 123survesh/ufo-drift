/*
Dependency Canvaz, degToRad, Vector2, mirrorImage

ToDo

MapGenerator

 */

var Mapling = (function() {

    // v - vertical, h - horizontal, l - left, r - right, u - up, d - down
    var num2dir = {
        0: "v-u-r",
        1: "v-d-r",
        2: "v-u-l",
        3: "v-d-l",
        4: "h-r-u",
        5: "h-r-d",
        6: "h-l-u",
        7: "h-l-d",
    }
    var dir2num = {
        "v-u-r": 0,
        "v-d-r": 1,
        "v-u-l": 2,
        "v-d-l": 3,
        "h-r-u": 4,
        "h-r-d": 5,
        "h-l-u": 6,
        "h-l-d": 7,
    }

    function map(config) {
        this.maps = {};
        this.length = config.length|| config.minLength;

        _init.call(this);
    }

    function _init() {



        var arcConfig = {
            height: this.length,
            width: this.length
        };

        var pathConfig = {
            height: this.length * 3,
            width: this.length
        }

        var pathHConfig = {
            width: this.length * 3,
            height: this.length
        }

        //left and down facing arc
        this.arc = new Canvaz(arcConfig);
        this.arc.ctx.beginPath();
        this.arc.ctx.arc(0, this.length, this.length, degToRad(270), degToRad(360));
        this.arc.ctx.moveTo(0, 0);
        this.arc.ctx.lineTo(0, this.length);
        this.arc.ctx.lineTo(this.length, this.length);
        this.arc.ctx.lineTo(0, 0);
        this.arc.ctx.fillStyle = "blue";
        this.arc.ctx.fill();

        // vertical path
        this.path = new Canvaz(pathConfig);
        this.path.ctx.fillStyle = "blue";
        this.path.ctx.fillRect(0, 0, this.length, this.length*3);


        this.pathH = new Canvaz(pathHConfig);
        this.pathH.ctx.fillStyle = "blue";
        this.pathH.ctx.fillRect(0, 0, this.length*3, this.length);

        _createMaplings.call(this);
    }

    function _createMaplings()
    {
    	var keys = Object.keys(dir2num);
    	var keyLength = keys.length;
    	for(var i=0;i<keyLength;i++)
    	{
    		_createMapling.call(this, keys[i]);
    	}
    }

    function _createMapling(direction) {
    	var dir = direction;
        direction = direction.split("-");
        var arcStart = new Vector2(); // init to (0,0)
        var pathStart = new Vector2(); // init to (0,0)

        var verticalFlag = (direction[0] === 'v')? true : false;

        var mainCanvasConfig = {
            height: (verticalFlag)? 4*this.length : this.length,
            width: (verticalFlag)? this.length : 4*this.length
        }
        var mapling = new Canvaz(mainCanvasConfig); //a small map section / part


        var partCanvasConfig = {
            height: this.length,
            width: this.length
        }
        var arcCopy = new Canvaz(partCanvasConfig);
        var pathCopy = this.path.getCopy();

        var startX = 0;
        var startY = 0;

        if(verticalFlag)
        {
            var upFlag = (direction[1] === 'u') ? true : false; // arc goes up or down
            var leftFlag = (direction[2] === 'l') ? true : false; // arc faces left or right
            if (upFlag) {
                arcStart.setX(startX);
                pathStart.set(startX, this.length);

                if (leftFlag) {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, false, false);
                }
                else
                {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, true, false);
                }
            } else {
                arcStart.set(startX, this.length *3);
                pathStart.setX(startX);

                if (leftFlag) {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, false, true);
                } else {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, true, true);
                }
            }

            mapling.ctx.drawImage(arcCopy.canvas, arcStart.x, arcStart.y);
            mapling.ctx.drawImage(this.path.canvas, pathStart.x, pathStart.y);

        }
        else
        {
            var pathHCopy = this.pathH.getCopy();
            mirrorImage(pathCopy.ctx, pathCopy.canvas, true, false);
            var leftFlag = (direction[1] === 'l') ? true : false; // arc goes left or right
            var upFlag = (direction[2] === 'u') ? true : false; // arc faces up or down

            if (leftFlag) {
                arcStart.setY(startY);
                pathStart.set(this.length, startY);

                if (upFlag) {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, true, true);
                } else {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, true, false);
                }
            } else {
                arcStart.set(this.length*3, startY);
                pathStart.setY(startY);

                if (upFlag) {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, false, true);
                }
                else
                {
                    mirrorImage(arcCopy.ctx, this.arc.canvas, false, false);
                }
            }
            mapling.ctx.drawImage(arcCopy.canvas, arcStart.x, arcStart.y);
            mapling.ctx.drawImage(pathHCopy.canvas, pathStart.x, pathStart.y);

        }
        this.maps[dir2num[dir]] = mapling;
    }

    function _get(direction)
    {
    	return this.maps[dir2num[direction]].getCopy();
    }

    map.prototype.get = function(direction)
    {
    	return _get.call(this, direction);
    }

    return map;
})()