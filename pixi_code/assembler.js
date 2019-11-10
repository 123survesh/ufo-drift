var Assembler = (function() {

    function assembler(config) {
        this.directions = config.directions;
        this.height = config.height; // must be four times the max height of a mapling
        this.width = config.width; // must be four times the max width of a mapling

        this.mapling = config.mapling;
        this.container = config.container;

        _init.call(this);
    }

    function _init() {
        this.que = [];
        this.queIndex = 0;
        this.assembleIndex = 0;

        // initializing the que with the first direction mapling
        var mapling = this.mapling.get(this.directions[0]);
        mapling.position = new Vector2();

        this.directionCodes = this.directions[0].split("-"); // must always be a v-u-l or v-u-r

        if (this.directionCodes[2] === 'l') {
            mapling.position.setX(this.width - this.mapling.length);
        }

        this.previousDirectionCodes = this.directionCodes;
        this.que[this.queIndex] = mapling;

        this.queIndex++;
        _calculatePosition.call(this);
        // _populateContainer.call(this);

    }

    // dumb position calculator
    function _calculatePosition() {
        var dirCount = this.directions.length;

        for (var i = this.queIndex; i < dirCount; i++) {
            var mapling = this.mapling.get(this.directions[i]);
            var position = new Vector2();
            var prevCodes = this.previousDirectionCodes;
            var prevMapling = this.que[this.queIndex - 1];
            var prevPosition = prevMapling.position;
            this.directionCodes = this.directions[i].split("-");
            switch (prevCodes[1]) {
                case 'l':
                    {
                        position.x = prevPosition.x;
                        break;
                    }
                case 'r':
                    {
                        position.x = prevPosition.x + prevMapling.width;
                        break;
                    }
                case 'u':
                    {
                        position.y = prevPosition.y;
                        break;
                    }
                case 'd':
                    {
                        position.y = prevPosition.y + prevMapling.height - mapling.height;
                    }
            }

            switch (prevCodes[2]) {
                case 'l':
                    {
                        position.x = prevPosition.x - mapling.width;
                        break;
                    }
                case 'r':
                    {
                        position.x = prevPosition.x + prevMapling.width;
                        break;
                    }
                case 'u':
                    {
                        position.y = prevPosition.y - mapling.height;
                        break;
                    }
                case 'd':
                    {
                        position.y = prevPosition.y + prevMapling.height
                    }
            }
            mapling.position = position;
            this.que[this.queIndex] = mapling;
            this.queIndex++;
            this.previousDirectionCodes = this.directionCodes;
        }
    }

    function _populateContainer() {
        var dirCount = this.directions.length;
        for (var i = this.assembleIndex; i < dirCount; i++)
        {
        	this.que[i].sprite = _canvasToSprite(this.que[i].canvas);
        	this.que[i].sprite.position.set(this.que[i].position.x, this.que[i].position.y)
        	this.container.addChild(this.que[i].sprite);
        	this.assembleIndex++;
        }
    }

    function _populateNext()
    {
    	var i = this.assembleIndex;
    	if(i < this.queIndex)
    	{
	    	this.que[i].sprite = _canvasToSprite(this.que[i].canvas);
	    	this.que[i].sprite.position.set(this.que[i].position.x, this.que[i].position.y)
	    	this.container.addChild(this.que[i].sprite);
	    	this.assembleIndex++;
    	}
    }

    function _canvasToSprite(canvas) {
        return new PIXI.Sprite.from(canvas);
    }

    function _addDirections(directions) {

    }

    function _popDirection() {

    }

    assembler.prototype.populateNext = function()
    {
    	_populateNext.call(this);
    }


    return assembler;
})()