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
        // this.pathContainer = new PIXI.Container();
        this.controlPointContainer = new PIXI.Container();

        this.playerContainer.addChild(this.player);

        // props -> a place to store all the loose game state variables
        this.props = {
            velocity: new Vector2(),
            manualPosition: new Vector2(),
            screenCenter: new Vector2(),
            flags: {},
            stepValue: 2,
            curve: {},
            activeMapling: null,
            direction: null,
            manualOverride: false, // overrides the update of mapContainer position
            spaceFlag: false, // space bar is pressed, curve is in motion
            firstFlag: true, // firest move in a mapling / direction
            diagonalFlag: false, // must be reset on game restart
        }
        this.screen.wb2 = this.screen.width / 2;
        this.screen.hb2 = (this.screen.height - this.screen.width) + this.screen.wb2;
        this.player.position.y = this.screen.height - this.screen.width;

        this.props.screenCenter.set(this.screen.wb2, this.screen.hb2);

        // create Mapling
        // create Assembler with Mapling and Directions
        // Move map container to init position
        // start the mover
        this.configs = {
            "mapling": {
                minLength: 100,
                maxLength: 400,
                maxPaths: 3,
            }
        }

        this.mapling = new Mapling(this.configs.mapling);

        this.configs.assembler = {
            // directions: ["v-u-l", "h-l-d", "v-d-r", "h-r-u"], // hard coded for now, but needs to be generated procedurally-
            directions: ["v-u-l"],
            height: this.configs.mapling.maxLength * 4,
            width: this.configs.mapling.maxLength * 4,
            mapling: this.mapling,
            container: this.mapContainer,
            controlPointContainer: this.controlPointContainer
        }

        this.assembler = new Assembler(this.configs.assembler);

        this.mapContainer.addChild(this.controlPointContainer);
        this.app.stage.addChild(this.mapContainer);
        this.app.stage.addChild(this.playerContainer);
        _start.call(this);
    }

    function _updatePosition() {
        this.mapContainer.x += this.props.velocity.x;
        this.mapContainer.y += this.props.velocity.y;
        if (this.props.manualOverride) {
            this.mapContainer.x = this.props.manualPosition.x;
            this.mapContainer.y = this.props.manualPosition.y;
        }
        this.props.screenCenter.x = this.mapContainer.x - this.screen.wb2;
        this.props.screenCenter.y = this.mapContainer.y - this.screen.hb2;
    }

    function _gameLoop(dt) {
        if (!this.props.collision) {
            this.state(dt);
        } else {
            console.log("game over 8_8");
            this.app.ticker.stop();
        }
    }

    function _play(dt) {
        _track.call(this);
        _updatePosition.call(this);
    }

    function _start() {
        var _this = this;
        var firstMapling = this.assembler.getMapling(0);

        // move the mapContainer to the starting position
        this.props.manualPosition.x = ((this.screen.width - firstMapling.width) / 2) - firstMapling.position.x;
        this.props.manualPosition.y = this.screen.height - (firstMapling.position.y + firstMapling.height);

        // this.props.manualPosition.invert();
        this.props.velocity.set(0, 0);
        this.props.manualOverride = true;
        _updatePosition.call(this);

        this.props.activeMapling = firstMapling;
        this.props.direction = this.props.activeMapling.direction.split("-");
        this.props.firstFlag = true;
        this.props.diagonalFlag = false;
        this.props.manualOverride = false;
        this.props.collision = false;

        this.state = _play.bind(this);
        _setEventListeners.call(this);

        this.app.ticker.add(function(dt) {
            _gameLoop.call(_this, dt);
        });

        // add the tracker to ticker list
        // add the mover to ticker list



    }

    function _checkCollision(boundaryProps) {
        var report = {
            x: false,
            y: false
        };
        var boundary = boundaryProps.boundary;
        var screenCenter = this.props.screenCenter;
        //converting screenCemter coords to +ve and compare with boundaryProps

        if ((-screenCenter.x) < boundary.x.min || (-screenCenter.x) > boundary.x.max) {
            report.x = true;
        }

        if ((-screenCenter.y) < boundary.y.min || (-screenCenter.y) > boundary.y.max) {
            report.y = true;
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

        var collisionReport = _checkCollision.call(this, this.props.activeMapling.boundaryProps);
        var axis = this.props.activeMapling.boundaryProps.axis;

        if (this.props.spaceFlag) {
            if (collisionReport.x || collisionReport.y) // collision occured
            {
                var nextMapling = _getNextMapling.call(this);
                collisionReport = _checkCollision.call(this, nextMapling.boundaryProps);
                if (collisionReport.x || collisionReport.y) {
                    // collision occured stop moving
                    this.props.collision = true;
                } else { // move to next mapling
                    _moveToNextMapling.call(this);
                    _move.call(this); // must set this.props.firstFlag = true on space release

                }
            } else {
                _move.call(this);
            }
        } else {
            // regular path movement
            if (collisionReport[axis]) {
                var nextMapling = _getNextMapling.call(this);
                var nextDirection = nextMapling.direction.split("-");
                if (nextDirection[0] === this.props.direction[0]) // moved on to next platform
                {
                    this.props.firstFlag = true;
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

    function _getNextMapling(popFlag) {
        return this.assembler.getMapling(this.props.activeMapling.id + 1, popFlag);
    }

    function _moveToNextMapling() {
        var nextMapling = _getNextMapling.call(this, true);
        this.props.activeMapling = nextMapling;
        this.props.direction = nextMapling.direction.split("-");
        this.props.nextFlag = true;
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

    function _setEventListeners() {
        this.eventListeners = {
            onPress: _onPress.bind(this),
            onRelease: _onRelease.bind(this)
        }

        // document.addEventListener('mousedown', this.eventListeners.onPress);
        document.addEventListener('touchstart', this.eventListeners.onPress);
        document.addEventListener('keydown', this.eventListeners.onPress);

        // document.addEventListener('mouseup', this.eventListeners.onRelease);
        document.addEventListener('touchend', this.eventListeners.onRelease);
        document.addEventListener('keyup', this.eventListeners.onRelease);
    }

    function _onPress(event) {
        if (event.keyCode === 32) {

            if (!this.props.spaceFlag) {
                var screenCenterInverse = new Vector2(-this.props.screenCenter.x, -this.props.screenCenter.y);
                var radius = distanceBetween(screenCenterInverse, this.props.activeMapling.controlPosition);
                if (radius <= this.configs.mapling.minLength - 10) {
                    this.props.spaceFlag = true;
                    this.props.firstFlag = true;
                }
            }

        }
    }

    function _onRelease(event) {
        if (this.props.spaceFlag) {
            this.props.spaceFlag = false;
            this.props.manualOverride = false;
            var curveProps = this.props.curve;
            var rotatedBy = Math.abs(curveProps.mover.rotatedBy);
            this.props.firstFlag = true;
            if (rotatedBy > 60 && !this.props.nextFlag) {
                _moveToNextMapling.call(this);
            }
            if (this.nextFlag) {
                this.nextFlag = false;
            }
        }
    }

    function _move() {
        if (this.props.firstFlag) {
            if (!this.props.spaceFlag) {
                var currentAxis = (this.props.direction[0] === 'v') ? 'y' : 'x';
                this.props.step = this.props.stepValue;
                if (this.props.direction[1] === 'd' || this.props.direction[1] === 'r') {
                    this.props.step *= -1;
                }
                this.props.firstFlag = false;
            } else {
                var _this = this;
                var dir = this.props.activeMapling.direction;
                var clockwiseFlag = (dir == 'v-u-r' || dir == 'v-d-l' || dir == 'h-r-d' || dir == 'h-l-u') ? true : false;
                var mapling = this.props.activeMapling;
                var screenCenterInverse = new Vector2(-this.props.screenCenter.x, -this.props.screenCenter.y);
                var initialPosition = new Vector2(this.mapContainer.x, this.mapContainer.y);
                var controlPosition = mapling.controlPosition;

                var angle = Math.atan2(screenCenterInverse.y - controlPosition.y, screenCenterInverse.x - controlPosition.x); // in radian
                angle = radToDeg(angle); // convert to angle
                var startingAngle = 180+angle; 
                var radius = distanceBetween(screenCenterInverse, controlPosition);
                var center = pointOnCircle(initialPosition, angle, radius); // center of the circle that the mapContainer moves in

                var curveTranslatorConfig = {
                    startingAngle: startingAngle,
                    clockwiseFlag: clockwiseFlag,
                    callback: function(ang) {
                        var pos = pointOnCircle(center, ang, radius);
                        _this.props.manualPosition.x = pos.x;
                        _this.props.manualPosition.y = pos.y;

                        _this.props.curve.angle = ang;
                    },
                    step: this.props.stepValue
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

            this.props.velocity.set(0, 0);
        }

        if (!this.props.diagonalFlag) {
            if (!this.props.spaceFlag) {
                this.props.velocity[currentAxis] = this.props.step;
            } else {
                this.props.curve.mover.move();
            }
        }
    }

    return game;
})()