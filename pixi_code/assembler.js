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
        this.que = [];
        this.queIndex = 0;
        this.assembleIndex = 0;

        this.controlPointDistance = 15;

        _calculatePosition.call(this);
        _populateContainer.call(this);
        /*
        ToDo:
        write code to make the direction getting, container clearing and container populating
         */

    }

    // dumb position calculator
    function _calculatePosition() {
        var dirCount = this.directions.length;

        for (var i = this.queIndex; i < dirCount; i++) {

            var mapling = this.mapling.get(this.directions[i]);
            this.directionCodes = this.directions[i].split("-");

            var position;
            if (!i) { // first direction position
                this.unitLength = Math.abs(mapling.width - mapling.height);

                position = new Vector2();
                if (this.directionCodes[2] === 'l') {
                    position.setX(this.width - this.unitLength);
                }
            } else { 
                var prevMapling = this.que[this.queIndex - 1];
                var prevCodes = this.previousDirectionCodes;
                position = _calculatePathPosition.call(this, mapling, prevMapling, prevCodes);

            }

            var controlPosition = _calculateControlPosition.call(this, position, mapling, this.directionCodes);

            mapling.position = position;
            mapling.controlPosition = controlPosition;
            mapling.direction = this.directions[i];
            mapling.index = i;

            mapling.boundaryProps = _calculateBoundaryProps(this.directionCodes, mapling); // used by tracker

            this.que[this.queIndex] = mapling;
            this.queIndex++;
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

    function _calculateBoundaryProps(direction, mapling)
    {
        var axis = (direction[0] === 'h') ? 'x' : 'y';
        var condition = (direction[1] === 'u' || direction[1] === 'l') ? '>' : '<';
        var boundary = new Vector2();
        if(direction[0] === 'h')
        {
            if(direction[1] === 'l')
            {
                boundary.x = mapling.position.x;
            }
            else
            {
                boundary.x = mapling.width + mapling.position.x;
            }
            boundary.y = mapling.position.y;
        }
        else
        {
            if(direction[1] === 'u')
            {
                boundary.y = mapling.position.y;
            }
            else
            {
                boundary.y = mapling.height + mapling.position.y;
            }
            boundary.x = mapling.position.x;
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
                    controlPosition.x = maplingPosition.x + this.unitLength + distance;
                    break;
                }
            case 'r':
                {
                    controlPosition.x = maplingPosition.x + this.unitLength - distance;
                    break;
                }
            case 'u':
                {
                    controlPosition.y = maplingPosition.y + this.unitLength + distance;
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
        var dirCount = this.directions.length;
        for (var i = this.assembleIndex; i < dirCount; i++) {
            _populateNext.call(this);
        }
    }

    function _populateNext() {
        var i = this.assembleIndex;
        if (i < this.queIndex) {

            var mapling = this.que[i];
            var position = mapling.position;
            var controlPosition = mapling.controlPosition;

            var sprite = canvasToSprite(mapling.canvas);
            sprite.position.set(position.x, position.y);

            var controlPoint = _circleSprite();
            controlPoint.position.set(controlPosition.x, controlPosition.y);

            console.log("path - ", sprite.position);
            console.log("control - ", controlPoint.position);


            this.pathContainer.addChild(sprite);
            this.controlPointContainer.addChild(controlPoint);

            this.que[i].sprite = { path: sprite, control: controlPoint };

            this.assembleIndex++;
        }
    }



    function _addDirections(directions) {

    }

    function _popDirection() {

    }

    assembler.prototype.populateNext = function() {
        _populateNext.call(this);
    }


    return assembler;
})()