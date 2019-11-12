/*
    Dependency
    Pixi js,
    Mapling, Assembler, utils, gameUtils, Map, Canvaz

 */

var Game = (function() {
    function game(config) {
        this.stage = config.stage; // Pixi app.stage
        this.screen = config.screen; // screen dimensions

        _init.call(this);
    }

    function _init() {
        this.mapContainer = new PIXI.Container();
        this.playerContainer = new PIXI.Container();
        this.pathContainer = new PIXI.Container();
        this.controlPointContainer = new PIXI.Container();

        // props -> a place to store all the loose game state variables
        this.props = {
            velocity: new Vector2(),
            manualPosition: new Vector2(),
            screenCenter: new Vector2(),
            flags: {
                manualOverride: false; // overrides the update of mapContainer position
            },
            step: 3,
            curve: {},
            path: {}

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
                pathLength: 2
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
        this.state = _play.bind(this);

    }

    function _gameLoop(dt) {
        this.state(dt);
    }

    function _play(dt) {
        _updatePosition.call(this);
    }

    function _updatePosition() {
        this.mapContainer.x += this.props.velocity.x;
        this.mapContainer.y += this.props.velocity.y;
        if (this.manualOverride) {
            this.mapContainer.x = this.props.manualPosition.x;
            this.mapContainer.y = this.props.manualPosition.y;
        }
        this.props.screenCenter.x = this.mapContainer.x - 75;
        this.props.screenCenter.y = this.mapContainer.y - 75;

    }

    function _checkCollision() {

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

        // add the tracker to ticker list
        // add the mover to ticker list



    }

    function _track()
    {
        /*
            check if firstflag is true
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

         */
    }


    /*
        on space pressDown
            -> check for distance betweenb control point and screen center
                -> if <= min length of mapling proceed, else wait

        on space release
            -> if in safeZone, this.path.firstFlag = true; and proceed
                -> if (angle > 45) safeZone = true
                -> if (angle < 135 ) safeZone = true
            -> else set diagonal flag true 

     */
    
    function _move() {
        if (this.path.firstFlag) {
            if (!this.path.spaceFlag) {
                var currentAxis = (this.props.direction[0] === 'v') ? 'y' : 'x';
                this.props.step = this.props.stepValue;
                if (this.props.direction[1] === 'u' || this.props.direction[1] === 'r') {
                    this.props.step *= -1;
                }

            } else {
                var _this = this;

                var mapling = this.props.activeMapling;
                var screenCenterInverse = new Vector2(-this.props.screenCenter.x, -this.props.screenCenter.y);
                var initialPosition = new Vector2(this.mapContainer.x, this.mapContainer.y);
                var controlPosition = this.assembler.que[mapling.index].controlPosition;

                var angle = Math.atan2(screenCenterInverse.y - controlPosition.y, screenCenterInverse.x - controlPosition.x); // in radian
                angle = radToDeg(angle); // convert to angle
                var radius = distanceBetween(screenCenterInverse, controlPosition);
                var center = pointOnCircle(initialPosition, angle, radius); // center of the circle that the mapContainer moves in

                var curveTranslatorConfig = {
                    startingAngle: 180 + angle,
                    clockwiseFlag: false,
                    callback: function(ang) {
                        var pos = pointOnCircle(center, ang, radius);
                        _this.manualPosition.x = pos.x;
                        _this.manualPosition.y = pos.y;

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
            }

            this.props.velocity.set(0, 0);
            this.props.path.firstFlag = false;
        }


        if (!this.path.spaceFlag) {
            this.props.velocity[currentAxis] = this.props.step;
        } else {
            this.props.curve.mover.move();
        }
    }

    return game();
})()