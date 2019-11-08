/*
Dependency Canvaz, degToRad, Vector2

ToDo

MapGenerator

 */

var Map = (function() {

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
        this.height = config.height;
        this.width = config.width;
        this.length = config.length;

        _init.call(this);
    }

    function _init() {
        var canvasConfig = {
            height: this.length,
            width: this.length
        };

        //left and down facing arc
        this.arc = new Canvaz(canvasConfig);
        this.arc.ctx.beginPath();
        this.arc.ctx.arc(0, this.length, this.length, degToRad(270), degToRad(360));
        this.arc.ctx.moveTo(0, 0);
        this.arc.ctx.lineTo(0, this.length);
        this.arc.ctx.lineTo(this.length, this.length);
        this.arc.ctx.lineTo(0, this.length);
        this.arc.ctx.fill();

        // vertical path
        this.path = new Canvaz(canvasConfig);
        this.path.ctx.fillRect(0, 0, this.length, this.length);

        _createMaplings();
    }

    function _createMaplings()
    {
    	var keys = Object.keys(dir2num);
    	var keyLength = keys.length;
    	for(var i=0;i<keyLength;i++)
    	{
    		_createMapling(keys[i]);
    	}
    }

    function _createMapling(direction) {
    	var dir = direction;
        direction = direction.split("-");
        var arcStart = new Vector2(); // init to (0,0)
        var pathStart = new Vector2();
        var canvasConfig = {
            height: this.height,
            width: this.width
        }
        var mapling = new Canvaz(canvasConfig); //a small map section / part
        var arcCopy = this.arc.getCopy();
        var pathCopy = this.path.getCopy();
        var startX = this.width / 4;
        var startY = this.height / 4;
        switch (direction[0]) {
            case 'v':
                {
                    var upFlag = (direction[1] === 'u') ? true : false; // arc goes up or down
                    var leftFlag = (direction[2] === 'l') ? true : false; // arc faces left or right
                    if (upFlag) {
                        arcStart.setX(startX);
                        pathStart.set(startX, this.length);

                        if (!leftFlag) {
                            arcCopy.ctx.scale(-1, 1);
                        }
                    } else {
                        arcStart.set(startX, this.length);
                        pathStart.setX(startX);

                        if (leftFlag) {
                            arcCopy.ctx.scale(1, -1);
                        } else {
                            arcCopy.ctx.scale(-1, -1);
                        }
                    }

                    mapling.ctx.drawImage(arcCopy, arcStart.x, arcStart.y);
                    mapling.ctx.drawImage(this.path, pathStart.x, pathStart.y);

                    break;
                }
            case 'h':
                {
                    pathCopy.ctx.rotate(degToRad(90));
                    var leftFlag = (direction[1] === 'l') ? true : false; // arc goes left or right
                    var upFlag = (direction[2] === 'u') ? true : false; // arc faces up or down

                    if (leftFlag) {
                        arcStart.setY(startY);
                        pathStart.set(this.length, startY);

                        if (upFlag) {
                            arcCopy.ctx.scale(-1, -1);
                        } else {
                            arcCopy.ctx.scale(-1, 1);
                        }
                    } else {
                        arcStart.set(this.length, startY);
                        pathStart.setY(startY);

                        if (upFlag) {
                            arcCopy.ctx.scale(1, -1);
                        }
                    }
                    mapling.ctx.drawImage(arcCopy, arcStart.x, arcStart.y);
                    mapling.ctx.drawImage(pathCopy, pathStart.x, pathStart.y);
                }
        }
        this.maps[dir2num[dir]] = mapling;
    }

    return map;
})()