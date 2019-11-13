var Mapper = (function() {

    function mapper(config) {
        this.mapArea = config.mapArea; // cotnains width and height
        this.maplingSize = config.maplingSize; // mapling min, max
        this.seed = config.seed; // contains direction and position in the mapArea
        _init.call(this);
    }

    function _init() {
        this.setSize = (this.mapArea.width / this.maplingSize.max) + (this.mapArea.height / this.maplingSize.max);
        this.set = [];
        if(typeof this.seed.dir === 'string')
        {
        	this.seed.dir = this.seed.dir.split("-");
        }
        _createSet.call(this);

    }

    function _isFeasible(direction, prevPosition) {
        var verticalFlag = (direction[0] === 'v') ? true : false;
        var newSize;
        var newPos = { x: 0, y: 0 };
        var nextPossible = true;	
        if (verticalFlag) {
            newPos.x = prevPosition.x;
            if (direction[1] === 'd') {
                newSize = prevPosition.y + this.maplingSize.min + this.maplingSize.max;
                newPos.y = prevPosition.y + this.maplingSize.min;
            } else {
                newSize = prevPosition.y - this.maplingSize.max;
                newPos.y = prevPosition.y - this.maplingSize.max;
            }

            if(direction[2] === 'l')
            {
            	if(!(newPos.x - this.maplingSize.max))
            	{
            		nextPossible = false;
            	}
            }
            else
            {
            	if((newPos.x + this.maplingSize.max + this.maplingSize.min) > this.mapArea.width)
            	{
            		nextPossible = false;
            	}
            }

            if (!(newSize > 0 && newSize < this.mapArea.height)) {
                newPos = false;
            }
        } else {
            newPos.y = prevPosition.y;
            if (direction[1] === 'r') {
                newSize = prevPosition.x + this.maplingSize.min + this.maplingSize.max;
                newPos.x = prevPosition.x + this.maplingSize.min;
            } else {
                newSize = prevPosition.x - this.maplingSize.max;
                newPos.x = prevPosition.x - this.maplingSize.max;
            }

            if(direction[2] === 'u')
            {
            	if(!(newPos.y - this.maplingSize.max))
            	{
            		nextPossible = false;
            	}
            }
            else
            {
            	if((newPos.y + this.maplingSize.max + this.maplingSize.min) > this.mapArea.height)
            	{
            		nextPossible = false;
            	}
            }

            if (!(newSize > 0 && newSize < this.mapArea.width)) {
                newPos = false;
            }
        }
        if(newPos && nextPossible)
        {
        	return newPos;
        }
        else
        {
        	return false;
        }
    }

    function _createSet() {
        for (var i = 0; i <= this.setSize; i++) {
            this.seed = _createDirection.call(this, this.seed);
            this.set[i] = this.seed.dir.join("-");
        }
    }

    function _createDirection(seed) {
    	var dir = seed.dir;
    	var pos = seed.pos;
        var newDir = [];
        var newPos;

        newDir[0] = _opposite(dir[0]); // either h or v
        newDir[1] = dir[2];

        if (dir[0] === 'h') {
            newDir[2] = (Math.floor(2 * Math.random())) ? 'l' : 'r';
        } else {
            newDir[2] = (Math.floor(2 * Math.random())) ? 'u' : 'd';
        }

        newPos = _isFeasible.call(this, newDir, pos);

        if (!newPos) {
            newDir[2] = _opposite(newDir[2]);
            newPos = _isFeasible.call(this, newDir, pos);
            // dont know what to do if even this direction is not feasible, so just going to wing it for now
        }
        return {dir: newDir, pos: newPos};
    }

    function _opposite(dir) {
        switch (dir) {
            case 'l':
                return 'r';

            case 'r':
                return 'l';

            case 'u':
                return 'd';

            case 'd':
                return 'u';

            case 'v':
                return 'h';

            case 'h':
                return 'v';

        }
    }

    mapper.prototype.updateSet = function()
    {
    	_createSet.call(this);
    	return this.set.slice(); // return a new array to avoid referrencing
    }

    return mapper;
})()