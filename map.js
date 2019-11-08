/*
Dependency Canvaz, deg2Rad, Vector2

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

        var startX = this.width / 4;
        //left and down facing turn
        this.turn = new Canvaz(canvasConfig);
        this.turn.ctx.beginPath();
        this.turn.ctx.arc(0, this.length, this.length, degToRad(270), degToRad(360));
        this.turn.ctx.moveTo(0, 0);
        this.turn.ctx.lineTo(0, this.length);
        this.turn.ctx.lineTo(this.length, this.length);
        this.turn.ctx.lineTo(0, this.length);
        this.turn.ctx.fill();

        // vertical path
        this.path = new Canvaz(canvasConfig);
        this.path.ctx.fillRect(0, 0, this.length, this.length);

    }

    function _createMap(direction)
    {
    	direction = direction.split("-");
    	var arcStart = new Vector2();
    	switch(direction[0])
    	{
    		case 'v':
    		{
    			var upFlag = (direction[1] === 'u')? true : false;

    			break;
    		}
    		case 'h':
    		{
    			var leftFlag = (direction[1] === 'l')? true : false;
    		}
    	}
    }

    return map;
})()