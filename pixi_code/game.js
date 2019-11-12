/*
    Dependency
    Pixi js,
    Mapling, Assembler, utils, gameUtils, Map, Canvaz

 */

var Game = (function() {
    function game(config) {
        this.app = config.app; // Pixi Application
        this.screen = config.screen; // screen dimensions
        this.player = config.player;
        _init.call(this);
    }

    function _init() {
        this.mapContainer = new PIXI.Container();
        this.playerContainer = new PIXI.Container();
        this.pathContainer = new PIXI.Container();
        this.controlPointContainer = new PIXI.Container();

        this.playerContainer.addChild(this.player);

        // props -> a place to store all the loose game state variables
        this.props = {
            velocity: new Vector2(),
            manualPosition: new Vector2(),
            screenCenter: new Vector2(),
            flags: {
            },
            step: 3,
            curve: {},
            activeMapling: null,
            direction: null,
            manualOverride: false, // overrides the update of mapContainer position
            spaceFlag: false, // space bar is pressed, curve is in motion
            firstFlag: true, // firest move in a mapling / direction
            diagonalFlag: false, // must be reset on game restart
        }
        this.props.screenCenter.set(this.screen.width / 2, this.screen.height / 2);


        // create Mapling
        // create Assembler with Mapling and Directions
        // Move map container to init position
        // start the mover
        this.configs = {
            "mapling": {
                minLength: 100,
                maxLength: 300,
                pathLength: 2,
            }
        }

        this.mapling = new Mapling(this.configs.mapling);

        this.configs.assembler = {
            directions: ["v-u-l", "h-l-d", "v-d-r", "h-r-u"], // hard coded for now, but needs to be generated procedurally-
            height: this.configs.mapling.maxLength * 4,
            width: this.configs.mapling.maxLength * 4,
            mapling: this.mapling,
            container: this.mapContainer,
            controlPointContainer: this.controlPointContainer

        }

        this.assembler = new Assembler(this.configs.assembler);
        _start.call(this);
    }

    function _gameLoop(dt) {
        if(!this.props.collision)
        {
            this.state(dt);
        }
        else
        {
            console.log("game over 8_8");
        }
    }

    function _start() {
        var firstMapling = this.assembler.que[0];

        // move the mapContainer to the starting position
        this.props.manualPosition.x = 15 - firstMapling.position.x;
        this.props.manualPosition.y = (firstMapling.position.y + firstMapling.height) - this.screen.height;

        this.props.velocity.set(0, 0);
        _updatePosition.call(this);

        this.props.activeMapling = this.assembler.que[0];
        this.props.direction = this.props.activeMapling.direction.split("-");
        this.props.firstFlag = true;
        this.props.diagonalFlag = false;
        this.props.manualOverride = false;
        this.props.collision = false;

        this.state = _track.bind(this);

        this.app.ticker.add(function(dt) {
            _gameLoop.call(this, dt);
        });

        // add the tracker to ticker list
        // add the mover to ticker list



    }

    function _checkCollision(boundaryProps) {
        var report = {
            x: false,
            y: false
        };
        if (boundaryProps.condition === '>') {
            //converting screenCemter coords to +ve and compare with boundaryProps
            if ((-this.props.screenCenter.x) < boundaryProps.x) {
                report.x = true;
            }
            if ((-this.props.screenCenter.y) < boundaryProps.y) {
                report.y = true;
            }


        } else {
            if ((-this.props.screenCenter.x) > boundaryProps.x) {
                report.x = true;
            }
            if ((-this.props.screenCenter.y) > boundaryProps.y) {
                report.x = true;
            }
        }
        return report;
    }

    function _track() {
        /*
            check if firstFlag is true
                if spaceFlag is false
                    -> calculate the current axis, and boundary condition (can be done by assembler itself)
                else
                    nothing for now
            Next:
            check if spaceFlag is true
                    -> check current mapling boundary for collision in both axis
                        if exceeded
                            -> check for boundary condition of the next mapling
                            if not exceeded
                                -> update current mapling and boundary condition with the next one
                            else
                                -> collision detected
            else
                -> check for boundary condition
                if boundary condition exceeded
                    -> check if the direction of next mapling is same the current one
                        if yes
                            -> update current mapling with next mapling
                        else
                            -> collision detected

            if no collision detected call move()

         */

        var collisionReport = _checkCollision.call(this, this.activeMapling.boundaryProps);
        var axis = this.activeMapling.boundaryProps.axis;

        if (this.props.spaceFlag) {
            if (collisionReport.x || collisionReport.y) // collision occured
            {
                if (!collisionReport[axis]) // if the collision is not in the current axis check the next mapling, it could just be a transfer of maplings
                {
                    var index = this.activeMapling.index;
                    if (index + 1 < this.assembler.que.length) {
                        index++;
                    } else {
                        index = 0;
                    }
                    var nextMapling = this.assembler.que[index];
                    collisionReport = _checkCollision.call(this, nextMapling.boundaryProps);
                    if (collisionReport.x || collisionReport.y) {
                        // collision occured stop moving
                        this.props.collision = true;
                    } else { // move to next mapling
                        this.props.activeMapling = nextMapling;
                        this.props.direction = nextMapling.direction.split("-");
                        this.props.nextFlag = true;
                        _move.call(this); // must set this.props.firstFlag = true on space release

                    }

                } else {
                    // collision occured stop moving
                    this.props.collision = true;
                }
            } else {
                _move.call(this);
            }
        } else {
            // regular path movement
            if (collisionReport[axis]) {
                var index = this.activeMapling.index;
                if (index + 1 < this.assembler.que.length) {
                    index++;
                } else {
                    index = 0;
                }
                var nextMapling = this.assembler.que[index];
                var nextDirection = nextMapling.direction.split("-");
                if (nextDirection[0] === this.props.direction[0]) // moved on to next platform
                {
                    this.props.firstFlag = true;
                    this.props.nextFlag = true;
                    _move.call(this);
                } else {
                    // collision occurred stop moving
                    this.props.collision = true;
                }
            } else {
                _move.call(this);
            }
        }
    }


    /*
        on space pressDown
            -> check for distance betweenb control point and screen center
                -> if <= min length of mapling proceed, else wait

        on space release
            -> if in safeZone, this.props.firstFlag = true; and proceed
                -> if (angle > 45) safeZone = true
                -> if (angle < 135 ) safeZone = true
            -> else set diagonal flag true 

     */
    
    function _setEventListeners()
    {
        this.eventListeners = {
            onPress : _onPress.bind(this),
            onRelease: _onRelease.bind(this)
        }

        document.addEventListener('mousedown', this.eventListeners.onPress);
        document.addEventListener('touchstart', this.eventListeners.onPress);
        document.addEventListener('keydown', this.eventListeners.onPress);

        document.addEventListener('mouseup', this.eventListeners.onRelease);
        document.addEventListener('touchend', this.eventListeners.onRelease);
        document.addEventListener('keyup', this.eventListeners.onRelease);
    }
    function _onPress(event)
    {
        if(event.keyCode === 32)
        {

            if(!this.props.spaceFlag)
            {
                this.props.spaceFlag = true;
                this.props.firstFlag = true;
            }

        }
    }

    function _onRelease(event)
    {
        this.props.spaceFlag = false;
        var curveProps = this.props.curve;
        var roatedBy = curveProps.mover.rotatedBy;
        if(rotatedBy < 45 || rotatedBy > 135)
        {
             
            var pos = pointOnCircle(curveProps.center, curveProps.angle, curveProps.radius);
            this.props.velocity.x = pos.x - this.manualPosition.x;
            this.props.velocity.y = pos.y - this.manualPosition.y;
            this.props.diagonalFlag = true;
        }
        else if(rotatedBy > 90)
        {
            this.props.firstFlag = true;
        }
    }

    function _move() {
        if (this.props.firstFlag) {
            if (!this.props.spaceFlag) {
                var currentAxis = (this.props.direction[0] === 'v') ? 'y' : 'x';
                this.props.step = this.props.stepValue;
                if (this.props.direction[1] === 'u' || this.props.direction[1] === 'r') {
                    this.props.step *= -1;
                }
                this.props.firstFlag = false;
            } else {
                var _this = this;

                var mapling = this.props.activeMapling;
                var screenCenterInverse = new Vector2(-this.props.screenCenter.x, -this.props.screenCenter.y);
                var initialPosition = new Vector2(this.mapContainer.x, this.mapContainer.y);
                var controlPosition = this.assembler.que[mapling.index].controlPosition;

                var angle = Math.atan2(screenCenterInverse.y - controlPosition.y, screenCenterInverse.x - controlPosition.x); // in radian
                angle = radToDeg(angle); // convert to angle
                var radius = distanceBetween(screenCenterInverse, controlPosition);
                if(radius <= this.configs.mapling.minLength)
                {
                    var center = pointOnCircle(initialPosition, angle, radius); // center of the circle that the mapContainer moves in

                    var curveTranslatorConfig = {
                        startingAngle: 180 + angle,
                        clockwiseFlag: false,
                        callback: function(ang) {
                            var pos = pointOnCircle(center, ang, radius);
                            _this.props.manualPosition.x = pos.x;
                            _this.props.manualPosition.y = pos.y;

                            _this.props.curve.angle = ang;
                        },
                        step: 5
                    }
                    curveMover = new curveTranslator(curveTranslatorConfig);

                    this.props.curve = {
                        angle: angle,
                        radius: radius,
                        center: center,
                        mover: curveMover
                    }

                    this.props.manualOverride = true; // starts setting the position of the mapContainer directly
                    this.props.firstFlag = false;

                }
            }

            this.props.velocity.set(0, 0);
            this.props.nextFlag = false;
        }

        if(!this.props.diagonalFlag)
        {
            if (!this.props.spaceFlag) {
                this.props.velocity[currentAxis] = this.props.step;
            } else {
                this.props.curve.mover.move();
            }
        }
    }

    return game;
})()