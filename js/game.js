/*
    Dependency
    Pixi js,
    Mapling, Assembler, utils, gameUtils, Map, Canvaz

 */

var Game = (function() {
    function game(config) {
        this.target = config.target;
        this.screen = config.screen; // screen dimensions and config for app
        // this.player = config.player;
        _preInit.call(this);
    }

    function _preInit() {
        var _this = this;
        this.app = new PIXI.Application(this.screen);
        this.app.loader.add(['assets/stars.png', 'assets/ufo.png', 'assets/ball.png']).load(_loadCallback.bind(this));
        this.target.appendChild(this.app.view);

        // this.app.ticker.autoStart = false;
        this.app.ticker.add(function(dt) {
            _gameLoop.call(_this, dt);
        });
        this.app.ticker.stop();
        _setEventListeners.call(this);
    }

    function _loadCallback() {

        this.textures = {};
        // var treeTexture = PIXI.Texture.from('assets/stars.png');

        var ufoTexture = PIXI.Texture.from('assets/ufo.png');

        // this.textures["tree"] = treeTexture;
        this.textures["ufo"] = ufoTexture;
        this.textures["ball"] = PIXI.Texture.from('assets/ball.png');
        _init.call(this);
    }

    function _solitaryState() {
        this.props.velocity.set(0, 0);
    }

    function _init() {
        this.containers = {
            map: new PIXI.Container(),
            player: new PIXI.Container(),
            controlPoint: new PIXI.Container(),
            path: new PIXI.Container(),
            text: new PIXI.Container(),
        };


        this.containers.path.sortableChildren = true;
        this.containers.controlPoint.sortableChildren = true;

        this.flags = {
            manualOverride: false,
            userInterrupt: false,
            turning: false,
            moveStart: true,
            collision: false,
            yetToStart: true,
            helpText: false,
            collision: false,
            touch: false
        }

        // props -> a place to store all the loose game state variables
        this.props = {
            velocity: new Vector2(),
            manualPosition: new Vector2(),
            screenCenter: new Vector2(),
            stepValue: 5,
            angleStep: 2,
            curve: {},
            activeMapling: null,
            direction: null,
        }



        /*create Mapling
        create Assembler with Mapling and Directions
        Move map container to init position
        start the mover*/
        this.configs = {
            "mapling": {
                minLength: this.screen.width / 2,
                maxLength: (this.screen.width / 2) * 4,
                maxPaths: 3,
            }
        }

        this.mapling = new Mapling(this.configs.mapling);

        this.configs.assembler = {
            directions: ["v-u-l"],
            height: this.configs.mapling.maxLength * 4,
            width: this.configs.mapling.maxLength * 4,
            mapling: this.mapling,
            container: this.containers.path,
            controlPointContainer: this.containers.controlPoint,
            textures: this.textures
        }

        this.assembler = new Assembler(this.configs.assembler);


        // var trees = new PIXI.TilingSprite(this.textures.tree, this.configs.assembler.width, this.configs.assembler.height);
        // this.containers.background.addChild(trees);
        this.screen.wb2 = this.screen.width / 2;
        this.screen.hb2 = this.screen.height - (this.screen.width / 2);
        this.props.screenCenter.set(this.screen.wb2, this.screen.hb2);


        var ufo = new PIXI.Sprite(this.textures.ufo);
        ufo.width = this.screen.width / 5;
        ufo.height = this.screen.width / 5;
        ufo.anchor.x = 0.5;
        ufo.anchor.y = 0.5;
        ufo.position.y = this.screen.hb2;
        ufo.position.x = this.screen.wb2;
        this.containers.player.addChild(ufo);

        // this.containers.controlPoint.zIndex = 2000;
        this.containers.map.addChild(this.containers.path);
        this.containers.map.addChild(this.containers.controlPoint);
        // this.app.stage.addChild(this.containers.background);
        this.app.stage.addChild(this.containers.map);
        this.app.stage.addChild(this.containers.player);
        this.app.stage.addChild(this.containers.text);

        this.scoreText = new PIXI.Text("Score: 0", { fontStyle: "bold", fontSize: "30px", fill: "#ffffff", align: "right", stroke: "#a4410e", strokeThickness: 7 });
        this.scoreText.position.x = this.screen.width - (this.scoreText.width + 30);
        this.scoreText.position.y = 30;

        this.startText = new PIXI.Text("Tap To Start", { fontStyle: "bold", fontSize: "60px", fill: "#AC3232", align: "center", stroke: "#FFFFFF", strokeThickness: 7 });
        this.startText.anchor.x = 0.5;
        this.startText.anchor.y = 0.5;
        this.startText.position.set(this.screen.width / 2, this.screen.height / 2);


        this.containers.text.addChild(this.scoreText);
        this.containers.text.addChild(this.startText);

        // PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
        // this.app.ticker.stop();
        _start.call(this);
    }

    function _updateScore(score) {
        this.scoreText.text = "Score: " + (score + 1);
    }



    function _updatePosition() {
        this.containers.map.x += this.props.velocity.x;
        this.containers.map.y += this.props.velocity.y;
        if (this.flags.manualOverride) {
            this.containers.map.x = this.props.manualPosition.x;
            this.containers.map.y = this.props.manualPosition.y;
        }
        this.props.screenCenter.x = this.containers.map.x - this.screen.wb2;
        this.props.screenCenter.y = this.containers.map.y - this.screen.hb2;
    }

    function _gameLoop(dt) {
        if (!this.flags.collision) {
            this.state(dt);
        } else {
            console.log("game over 8_8");
            _gameOver.call(this);
            this.app.ticker.stop();
        }
    }


    function _play(dt) {
        _track.call(this);
        _updatePosition.call(this);
    }

    function _start() {
        var _this = this;
        var firstMapling = this.assembler.getMapling(0, true);

        // move the mapContainer to the starting position
        this.props.manualPosition.x = ((this.screen.width - firstMapling.width) / 2) - firstMapling.position.x;
        this.props.manualPosition.y = this.screen.height - (firstMapling.position.y + firstMapling.height);

        // this.props.manualPosition.invert();
        this.props.velocity.set(0, 0);
        this.flags.manualOverride = true;
        _updatePosition.call(this);

        this.props.activeMapling = firstMapling;
        this.props.direction = this.props.activeMapling.direction.split("-");
        this.flags.moveStart = true;
        this.flags.manualOverride = false;
        this.flags.collision = false;

        this.props.activeMapling.sprites.path.tint = 0x94E894;

        this.state = _solitaryState.bind(this);
        this.app.ticker.start();
        // this.app.ticker.start();

    }

    function _gameOver() {
        this.flags.turning = false;

        this.gameOverText = new PIXI.Text("Game Over \n Score: " + this.props.activeMapling.id + "\n Restart ?", { fontStyle: "bold", fontSize: "60px", fill: "#AC3232", align: "center", stroke: "#FFFFFF", strokeThickness: 7 });
        this.gameOverText.anchor.x = 0.5;
        this.gameOverText.anchor.y = 0.5;

        this.gameOverText.x = this.screen.width / 2;
        this.gameOverText.y = this.screen.height / 2;

        this.containers.text.addChild(this.gameOverText);
    }

    function _cleanBeforeStart() {
        // remove containers from app stage
        // empty props
        this.app.stage.removeChild(this.containers.map);
        this.app.stage.removeChild(this.containers.player);
        this.app.stage.removeChild(this.containers.text);

        this.props = {};
        this.assembler = {};

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

        if (collisionReport.x || collisionReport.y) // collision occured
        {
            var nextMapling = _getNextMapling.call(this);
            collisionReport = _checkCollision.call(this, nextMapling.boundaryProps);
            if (collisionReport.x || collisionReport.y) {
                // collision occured stop moving
                this.flags.collision = true;
            } else { // move to next mapling
                if (!this.flags.turning) {
                    this.flags.moveStart = true;
                }
                _moveToNextMapling.call(this);
                _move.call(this); // must set this.flags.moveStart = true on space release

            }
        } else {
            _move.call(this);
        }
    }

    function _getNextMapling(popFlag) {
        return this.assembler.getMapling(this.props.activeMapling.id + 1, popFlag);
    }

    function _moveToNextMapling() {
        _updateScore.call(this, this.props.activeMapling.id);
        var nextMapling = _getNextMapling.call(this, true);

        this.props.activeMapling.zIndex = 0;

        this.props.activeMapling = nextMapling;
        this.props.direction = nextMapling.direction.split("-");

        this.props.nextFlag = true;

        this.props.activeMapling.sprites.path.tint = Math.random() * 0xFFFFFF;
    }


    /*
        on space pressDown
            -> check for distance betweenb control point and screen center
                -> if <= min length of mapling proceed, else wait

        on space release
            -> if in safeZone, this.flags.moveStart = true; and proceed
                -> if (angle > 45) safeZone = true
                -> if (angle < 135 ) safeZone = true
            -> else set diagonal flag true 

     */

    function _setEventListeners() {
        var _this = this;
        this.eventListeners = {
            onPress: _onPress.bind(this),
            onRelease: _onRelease.bind(this)
        }

        // document.addEventListener('mousedown', this.eventListeners.onPress);
        document.addEventListener('touchstart', function(e) {
            _this.flags.touch = true;
            _this.eventListeners.onPress(e);
        });
        document.addEventListener('keydown', this.eventListeners.onPress);

        // document.addEventListener('mouseup', this.eventListeners.onRelease);
        document.addEventListener('touchend', this.eventListeners.onRelease);
        document.addEventListener('keyup', this.eventListeners.onRelease);
    }

    function _onPress(event) {
        if (event.keyCode === 32 || this.flags.touch) {

            if (!this.flags.turning && !this.flags.collision) {

                var screenCenterInverse = new Vector2(-this.props.screenCenter.x, -this.props.screenCenter.y);
                var radius = distanceBetween(screenCenterInverse, this.props.activeMapling.controlPosition);
                if (radius <= this.configs.mapling.minLength + 10) {

                    this.flags.turning = true;
                    this.flags.moveStart = true;
                }
            }

            if (this.flags.yetToStart || this.flags.helpText) {
                this.flags.userInterrupt = true;
            }

        }
    }

    function _onRelease(event) {
        if (this.flags.helpText) {
            this.flags.helpText = false;
            this.containers.text.removeChild(this.helpText);
        }
        if (this.flags.turning) {

            this.flags.touch = false;
            this.flags.turning = false;
            this.flags.manualOverride = false;
            var curveProps = this.props.curve;
            var rotatedBy = Math.abs(curveProps.mover.rotatedBy);
            this.flags.moveStart = true;

            if (rotatedBy > 60 && !this.props.nextFlag) {
                _moveToNextMapling.call(this);
            }

            if (this.nextFlag) {
                this.nextFlag = false;
            }

            if (this.props.curve.controlLine) {
                this.containers.map.removeChild(this.props.curve.controlLine);
            }

            if (!(this.props.activeMapling.id % 15)) {
                this.props.stepValue += 0.5;
                this.props.angleStep += 0.1;
            }


        } else {
            if (this.flags.collision) {
                this.flags.collision = false;
                _cleanBeforeStart.call(this);
                _init.call(this);
            } else if (this.flags.yetToStart) {
                this.flags.yetToStart = false;
                this.flags.helpText = true;
                this.containers.text.removeChild(this.startText);
                this.state = _play.bind(this);

                this.helpText = new PIXI.Text("Press And Hold", { fontStyle: "bold", fontSize: "60px", fill: "#AC3232", align: "center", stroke: "#FFFFFF", strokeThickness: 7 });
                this.helpText.anchor.x = 0.5;
                this.helpText.anchor.y = 0.5;

                this.helpText.x = this.screen.width / 2;
                this.helpText.y = this.screen.height / 2;

                this.containers.text.addChild(this.helpText);
                // this.app.ticker.start();
            }

        }
    }

    function _move() {
        if (this.flags.moveStart) {
            if (!this.flags.turning) {
                var currentAxis = (this.props.direction[0] === 'v') ? 'y' : 'x';
                this.props.step = this.props.stepValue;
                if (this.props.direction[1] === 'd' || this.props.direction[1] === 'r') {
                    this.props.step *= -1;
                }
                this.flags.moveStart = false;
            } else {
                var _this = this;
                var dir = this.props.activeMapling.direction;
                var clockwiseFlag = (dir == 'v-u-r' || dir == 'v-d-l' || dir == 'h-r-d' || dir == 'h-l-u') ? true : false;
                var mapling = this.props.activeMapling;
                var screenCenterInverse = new Vector2(-this.props.screenCenter.x, -this.props.screenCenter.y);
                var initialPosition = new Vector2(this.containers.map.x, this.containers.map.y);
                var controlPosition = mapling.controlPosition;

                var angle = Math.atan2(screenCenterInverse.y - controlPosition.y, screenCenterInverse.x - controlPosition.x); // in radian
                angle = radToDeg(angle); // convert to angle
                var startingAngle = 180 + angle;
                var radius = distanceBetween(screenCenterInverse, controlPosition);
                var center = pointOnCircle(initialPosition, angle, radius); // center of the circle that the mapContainer moves in

                var controlLine = getLine(controlPosition, screenCenterInverse);
                this.containers.map.addChild(controlLine);

                var curveTranslatorConfig = {
                    startingAngle: startingAngle,
                    clockwiseFlag: clockwiseFlag,
                    callback: function(ang) {
                        var pos = pointOnCircle(center, ang, radius);
                        _this.props.manualPosition.x = pos.x;
                        _this.props.manualPosition.y = pos.y;
                        if (controlLine)
                            controlLine.angle = curveMover.rotatedBy;

                        _this.props.curve.angle = ang;
                    },
                    step: this.props.angleStep
                }
                curveMover = new curveTranslator(curveTranslatorConfig);
                this.props.curve = {
                    angle: angle,
                    radius: radius,
                    center: center,
                    mover: curveMover,
                    controlLine: controlLine
                }

                this.flags.manualOverride = true; // starts setting the position of the mapContainer directly
                this.flags.moveStart = false;


            }

            this.props.velocity.set(0, 0);
        }

        if (!this.flags.turning) {
            this.props.velocity[currentAxis] = this.props.step;
        } else {
            this.props.curve.mover.move();
        }
    }

    return game;
})()