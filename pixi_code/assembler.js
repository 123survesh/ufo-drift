/*

The Assembler determines where the maplings has to go one the screen and it populates them.

if the assembler sees two consecutive directions in the same axis, it will add a -o flag to the second one and reverse its boundaryProps

Assembler is dumb about the directions other than that, the mapper is the one that creates the directions based on rules

The Assembler will ask the mapper for directions once its directions are used up
 */

var Assembler = (function() {

    function assembler(config) {
        this.directions = config.directions;
        this.height = config.height; // must be four times the max height of a mapling
        this.width = config.width; // must be four times the max width of a mapling
        this.mapling = config.mapling;
        this.pathContainer = config.container;
        this.controlPointContainer = config.controlPointContainer;

        _init.call(this);
    }

    function _init() {
        this.que = []; // holds unpopulated maplings
        this.populated = {}; // holds currently populated maplings
        this.popped = []; // holds the popped mapplings and removes them from containers after some time

        this.counter = 0; // used to id the maplings in order of their creation, used for getting a specific mapling from the populated[]

        this.controlPointDistance = 15;
        
        var firstDirection = this.directions[0];
        _calculatePosition.call(this);


        var mapperConfig = {
            mapArea: { height: this.height, width: this.width },
            maplingSize: {max: this.mapling.maxLength, min: this.mapling.length},
            seed: {dir: firstDirection, pos: this.que[0].position}
        }
        this.mapper = new Mapper(mapperConfig);

        Array.prototype.push.apply(this.que, this.mapper.set);

        _calculatePosition.call(this);
        _populateContainer.call(this);
        /*
        ToDo:
        write code to make the direction getting, container clearing and container populating
         */

    }

    // dumb position calculator
    function _calculatePosition() {
        var firstFlag = true;
        while (this.directions.length) {
            var direction = this.directions.shift(); // pops the first element out / FIFO
            var mapling = this.mapling.get(direction);
            this.directionCodes = direction.split("-");

            var position;
            if (firstFlag) { // first direction position
                firstFlag = false;
                this.unitLength = Math.abs(mapling.width - mapling.height);

                position = new Vector2();
                if (this.directionCodes[2] === 'l') {
                    position.setX(this.width - this.unitLength);
                }
            } else {
                var prevMapling = this.que[this.que.length - 1];
                var prevCodes = this.previousDirectionCodes;
                position = _calculatePathPosition.call(this, mapling, prevMapling, prevCodes);

            }

            var controlPosition = _calculateControlPosition.call(this, position, mapling, this.directionCodes);

            mapling.position = position;
            mapling.controlPosition = controlPosition;
            mapling.direction = direction;

            mapling.boundaryProps = _calculateBoundaryProps(this.directionCodes, mapling); // used by tracker
            mapling.id = this.counter++;
            this.que.push(mapling);
            this.previousDirectionCodes = this.directionCodes;

        }
    }

    function _circleSprite() { // used for control points
        var canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(5, 5, 5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fill();
        var circle = canvasToSprite(canvas);
        circle.anchor.x = 0.5;
        circle.anchor.y = 0.5;
        return circle;
    }

    function _calculateBoundaryProps(direction, mapling) {
        var axis = (direction[0] === 'h') ? 'x' : 'y';
        var condition = {
            x: (direction[1] === 'u' || direction[1] === 'l') ? '>' : '<',
            y: (direction[2] === 'u' || direction[2] === 'l') ? '>' : '<'
        }
        var boundary = new Vector2();
        boundary.x = mapling.position.x;
        boundary.y = mapling.position.y;
        if (direction[0] === 'h') {
            if (direction[1] === 'r') {
                boundary.x += mapling.width;
            }

            if (direction[2] === 'd') {
                boundary.y += mapling.height;
            }
        } else {
            if (direction[1] === 'd') {
                boundary.y += mapling.height;
            }
            if (direction[2] === 'r') {
                boundary.x += mapling.width;
            }
        }

        return {
            axis: axis,
            condition: condition,
            boundary: boundary // these coords are +ve, but the mapContainer coords will be negative. So must convert mapContainer values
        }
    }

    function _calculatePathPosition(mapling, prevMapling, prevCodes) {
        var position = new Vector2();
        var prevPosition = prevMapling.position;
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
                    position.y = prevPosition.y + this.unitLength;
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
        return position;
    }

    function _calculateControlPosition(maplingPosition, mapling, directionCodes, distance) {
        var controlPosition = new Vector2();
        var distance = this.controlPointDistance;
        switch (directionCodes[1]) {
            case 'l':
                {
                    controlPosition.x = maplingPosition.x + this.mapling.length + distance;
                    break;
                }
            case 'r':
                {
                    controlPosition.x = maplingPosition.x + this.unitLength - distance;
                    break;
                }
            case 'u':
                {
                    controlPosition.y = maplingPosition.y + this.mapling.length + distance;
                    break;
                }
            case 'd':
                {
                    controlPosition.y = maplingPosition.y + this.unitLength - distance;
                }
        }

        switch (directionCodes[2]) {
            case 'l':
                {
                    controlPosition.x = maplingPosition.x - distance;
                    break;
                }
            case 'r':
                {
                    controlPosition.x = maplingPosition.x + mapling.width + distance;
                    break;
                }
            case 'u':
                {
                    controlPosition.y = maplingPosition.y - distance;
                    break;
                }
            case 'd':
                {
                    controlPosition.y = maplingPosition.y + mapling.height + distance;
                }
        }

        return controlPosition;
    }

    function _populateContainer() {
        while (this.que.length) {
            _populateNext.call(this);
        }
    }

    function _populateNext() {
        var mapling = this.que.shift(); // pop the first element / FIFO
        var position = mapling.position;
        var controlPosition = mapling.controlPosition;

        var path = canvasToSprite(mapling.canvas);
        path.position.set(position.x, position.y);

        var controlPoint = _circleSprite();
        controlPoint.position.set(controlPosition.x, controlPosition.y);

        console.log("path - ", path.position);
        console.log("control - ", controlPoint.position);


        this.pathContainer.addChild(path);
        this.controlPointContainer.addChild(controlPoint);

        mapling.sprites = { path: path, control: controlPoint };

        this.populated[mapling.id] = mapling;
    }



    function _addDirections() {
        this.mapper.updateSet();
        Array.prototype.push.apply(this.directions, this.mapper.set);
        _calculatePosition.call(this);
        _populateContainer.call(this);
    }

    function _getMapling(id, popFlag) {
        var mapling = this.populated[id];
        if (popFlag) {
            this.popped.push(this.populated[id]);
            delete this.populated[id];
            _cleanPopped.call(this);
            if(this.populated.length < (this.mapper.setSize / 2))
            {
                _addDirections.call(this);
            }
        }
        return mapling;
    }

    function _cleanPopped()
    {
        while(this.popped.length > 3)
        {
            var mapling = this.popped.shift(); // FIFO
            this.pathContainer.removeChild(mapling.sprites.path);
            this.controlPointContainer.removeChild(mapling.sprites.control);
        }
    }

    assembler.prototype.getMapling = function(id, popFlag) {
        return _getMapling.call(this, id, popFlag);
    }


    return assembler;
})()