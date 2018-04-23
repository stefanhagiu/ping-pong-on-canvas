const width = 900,
    height = 600,
    pi = Math.PI,
    playerSpeed = 7;

const UpArrow = 38,
    DownArrow = 40,
    WArrow = 87,
    SArrow = 83;
    CKey = 67;
    VKey = 86;
    BKey = 66;
    NKey = 78;
    MKey = 77;
    KKey = 75;

let canvas, ctx, keystate,
    player, ai, ball, ballChange, isShaking, isScaling,
    activeBounce, activePaddle, activeWin, activeBackground;

let ballIteration = 0;

Game = {
    playerOne: null,
    playerTwo: null,
    ball: null,
    score: {
        left: 0,
        right: 0,
    },
    default: {
        player: {
            width: 20,
            height: 100,
            speed: 10,
        },
        ball: {
            width: 20,
            height: 20,
        }
    },
    onlyAi: false,
    ai: false,
    trail: false,
    particles: false,
    multipleBalls: false,
    removeFake: false,    
    ballList: [],
    maxCountBall: 20,
    particlesCount: 25,
    motionTrailLength: 25,
    eyes: true,
    shake: false,
    chaoticShake: false,
    ballScale: false,
};

player = function (option) {
    function drawEyes(x, y, elemHeight) {
        const blink = Math.random();
        const irisR = 5;
        const eyeR = 10;

        let irisOffset = 0;        
        let fillColor = "#000";
        if (blink > 0.96) {
            fillColor = "#fff";
        }
        // calc pos of ball vs current pos;
        let diff = y - Game.ball.y + (elemHeight / 2);

        irisOffset = diff < 0 ? 1 : - 1;
        irisOffset = irisOffset * (Math.abs(diff)/100) * (eyeR - irisR) / 2;

        // console.log(irisOffset);
        
        drawCircle(x + 10, y + 30 + irisOffset, irisR, true, fillColor);
        drawCircle(x + 10, y + 30, eyeR, false);

        drawCircle(x + 10, y + 70 + irisOffset, irisR, true, fillColor);
        drawCircle(x + 10, y + 70, eyeR , false);
    }
    function drawCircle(x, y, width, fill, fillColor) {

        ctx.beginPath();
        ctx.arc(x, y, width, 0, 2*pi);

        if (fill) {
            ctx.fillStyle = fillColor;  
            ctx.fill();
            // reset fill style 
            ctx.fillStyle = "#fff";
        } else {
            ctx.stroke();
        }
    }
    return {
        x: option.x,
        y: option.y,
        upArrow: option.upArrow,
        downArrow: option.downArrow,
        playerSpeed: option.playerSpeed,
        width: option.width || 20,
        height: option.height || 100,
        color: option.color || "#fff",
        update: function () {
            if (keystate[this.upArrow]) {
                this.y -= this.playerSpeed;
            }
            if (keystate[this.downArrow]) {
                this.y += this.playerSpeed;
            }
            this.y = Math.max(Math.min(this.y, height -this.height), 0);
        },
        draw: function () {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (Game.eyes) {
                drawEyes(this.x, this.y, this.height);
            }
        }, 
    };   
};

ai = function (option) {
    function drawEyes(x, y, elemHeight) {
        const blink = Math.random();
        const irisR = 5;
        const eyeR = 10;

        let irisOffset = 0;        
        let fillColor = "#000";
        if (blink > 0.96) {
            fillColor = "#fff";
        }
        // calc pos of ball vs current pos;
        let diff = y - Game.ball.y + (elemHeight / 2);

        irisOffset = diff < 0 ? 1 : - 1;
        irisOffset = irisOffset * (Math.abs(diff)/100) * (eyeR - irisR) / 2;

        // console.log(irisOffset);

        drawCircle(x + 10, y + 30 + irisOffset, irisR, true, fillColor);
        drawCircle(x + 10, y + 30, eyeR, false);

        drawCircle(x + 10, y + 70 + irisOffset, irisR, true, fillColor);
        drawCircle(x + 10, y + 70, eyeR , false);
    }
    function drawCircle(x, y, width, fill, fillColor) {

        ctx.beginPath();
        ctx.arc(x, y, width, 0, 2*pi);

        if (fill) {
            ctx.fillStyle = fillColor;  
            ctx.fill();
            // reset fill style 
            ctx.fillStyle = "#fff";
        } else {
            ctx.stroke();
        }
    }
    return {
        x: option.x,
        y: option.y,
        width: option.width || 20,
        height: option.height || 100,
        color: option.color || "#fff",
        id: option.id,
        update: function () {
            let destination = Game.ball.y - (this.height -  Game.ball.side) / 2;
            this.y += (destination - this.y) * 0.1;
            this.y = Math.max(Math.min(this.y, height -this.height), 0);
        },
        draw: function () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (Game.eyes) {
                drawEyes(this.x, this.y, this.height);
            }
        },    
    };
}

ball = function (option) {
    let position = [];
    let particles = [];
    let particlesDirection = {
        dx: 1,
        dy: 1,
    };
    let colisionPos = {
        x: 0,
        y: 0,
    };

    function removeHead() {
        while (position.length > Game.motionTrailLength) {
            position.shift();
        }
    }

    function storePosition(x,y, side) {
        position.push({x:x, y:y, side: side});
        removeHead();
    }

    function clearTrail() {
        position = [];
    }

    function drawTrail() {
        for(let i = 0; i < position.length; i++) {
            let ration = (i + 1) / position.length;
            ctx.fillStyle = "rgba(255, 255, 255, " + ration / 2 + ")";            
            ctx.fillRect(position[i].x, position[i].y, position[i].side, position[i].side);
        }
        ctx.fillStyle = "#fff";   
    }
    
    function createParticles() {
        for(let i = 0; i < Game.particlesCount; i++) {
            particles.push(new createParticle(colisionPos.x, colisionPos.y, 
                particlesDirection.dx, particlesDirection.dy));
        }
    }

    function createParticle(x, y, dx, dy) {
        this.x = x || 0;
        this.y = y || 0;

        this.radius = 3;
        this.vx = dx * Math.random() * 1.5;
        this.vy = dy * Math.random() * 1.5;
    }
    
    function drawParticles() {
        for(var j = 0; j < particles.length; j++) {
            par = particles[j];
            
            ctx.beginPath(); 
            ctx.fillStyle = 'rgb(' + Math.floor(200 - Math.random() * j) + ',' +
            Math.floor(200 - Math.random() * j) + ','+ Math.floor(200 - Math.random() * j) +')';

            if (par.radius > 0) {
                ctx.arc(par.x, par.y, par.radius, 0, pi*2, false);
            }
            ctx.fill();	 
            
            par.x += par.vx; 
            par.y += par.vy; 
            
            // Reduce radius so that the particles die after a few seconds
            par.radius = Math.max(par.radius - 0.05, 0.0);
        }
        ctx.fillStyle = "white";
        
    }
    function clearParticle() {
        particles = [];        
    }
    function shakeScreen() {
        if (Game.shake) {
            isShaking = true;
            setTimeout(() => {
                isShaking = false;
            }, 200);
        }
    }
    function buggyShakeScreen() {
        if (Game.chaoticShake) {
            preShake();
            setTimeout(() => {
                postShake();
            }, 200);
        }
    }
    function scaleBall() {
        if (Game.ballScale) {
            isScaling = true;
            setTimeout(() => {
                isScaling = false;
            }, 200);
        }
    }
    return {
        x: option.x,
        y: option.y,
        side: option.side || 20,
        vel: option.vel,
        speed: option.speed || 10,
        color: option.color || "#fff",
        gWidth: option.gWidth,
        gHeight: option.gHeight,
        fake: option.fake,
        bounceSound: false,
        paddleSound: false,
        winSound: false,
        phi: 0,
        init: function (width, height) {
            this.x = (this.gWidth - this.side) / 2;
            this.y = (this.gHeight - this.side) / 2;
            
            // serve
            let r = Math.random();
            let side = r > 0.5 ? 1 : -1;
            let phi = 0.1 * pi * ( 1 - 2 * r);

            this.phi = phi;

            this.vel = {
                x:  side * this.speed * Math.cos(phi),
                y: this.speed * Math.sin(phi)
            }

            clearTrail();
            clearParticle();
        },
        AABBIntersect: function (ax, ay, aw, ah, bx, by, bw, bh) {
            return ax < bx + bw
                && ay < by + bh
                && bx < ax + aw 
                && by < ay + ah;
        },
        update: function () {
            let colision = false;
            let side = this.vel.x < 0 ? -1 : 1;
            if(keystate[BKey] && activeBounce) {
                this.bounceSound = this.bounceSound ? false : true;
            }
            if(keystate[NKey] && activePaddle) {
                this.paddleSound = this.paddleSound ? false : true;
            }
            if(keystate[MKey] && activeWin) {
                this.winSound = this.winSound ? false : true;
            }
            switch (ballIteration) {
                case 0:
                    this.color = "#fff";
                    break;
                case 1:
                    this.color = "#5add91";
                    this.speed = 15;
                    this.vel.x = side * this.speed * Math.cos(this.phi);
                    break;
                case 2:
                    this.color = "#fff";
                    this.speed = 8;
                    this.vel.x = side * this.speed * Math.cos(this.phi);
                    break;
                case 3:
                    this.color = "#303030";
                    this.speed = 0.1;
                    // this.vel.x = side * this.speed * Math.cos(this.phi);
                    break;
                case 4:
                    this.color = "#ff9f0f";
                    this.speed = 10;
                    this.vel.x = side * this.speed * Math.cos(this.phi);
                    break;
                default:
                    break;
            }

            this.x += this.vel.x;
            this.y += this.vel.y;
            
            storePosition(this.x, this.y, this.side);

            if (0 > this.y || this.y + this.side > height) {
                colision = true;
                if ( 0 > this.y) {
                    particlesDirection.dy = 1;
                } else {
                   
                    particlesDirection.dy = -1;
                }

                colisionPos.y = this.y;
                colisionPos.x = this.x;
                let offset = this.vel.y < 0 ?
                    0 - this.y : 
                    height - (this.y + this.side);

                this.y += 2 * offset;
                this.vel.y *= -1;
                if (this.bounceSound) {
                    Game.bounceSound.get();
                }
            }

            // intersect with paddles
            let pdle = this.vel.x < 0 ? Game.playerOne : Game.playerTwo;

            if (this.AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
                    this.x, this.y, this.side, this.side)) {
                
                if (this.paddleSound) {
                    Game.paddleSound.get();
                }
                // in case we hit with the "sides" of the paddles the
                // ball should change diraction ...
                this.x = pdle === Game.playerOne ? Game.playerOne.x + Game.playerOne.width : Game.playerTwo.x - this.side;
                let n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
                let phi = 0.25 * pi * (2 * n - 1); // pi/ 4 = 45

                // particle
                colision = true;                
                if (this.vel.x < 0) {
                    particlesDirection.dx = 1;
                } else {
                    particlesDirection.dx = -1;
                }

                colisionPos.x = this.x;
                colisionPos.y = this.y;
                this.phi = phi;

                // smashing system ?
                let smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;

                this.vel.x = smash * (pdle === Game.playerOne ? 1 : -1 ) * this.speed * Math.cos(phi);
                this.vel.y = smash * this.speed * Math.sin(phi);
            }

            if (0 > this.x + this.side || this.x > width) {
                if (this.winSound) {
                    Game.winSound.get();
                }
                if (0 > this.x + this.side) {
                    Game.score.left += 1;
                } else {
                    Game.score.right += 1;
                }
                if (this.fake) {
                    colision = true;                
                    if (this.vel.x < 0) {
                        particlesDirection.dx = 1;
                    } else {
                        particlesDirection.dx = -1;
                    }
                    colisionPos.x = this.x;
                    colisionPos.y = this.y;
                    this.vel.x *= -1;
                    if (this.bounceSound) {
                        Game.bounceSound.get();
                    }
                } else {
                    this.init();
                }
            }
            if (colision) {
                shakeScreen();
                buggyShakeScreen();
                scaleBall();
                clearParticle();
                createParticles();
            }
        },
        draw: function () {
            if (Game.trail) {
                drawTrail();
            }
            if (Game.particles) {
                drawParticles();
            }
            if (isScaling) {
                this.side = this.side === 30 ? this.side : this.side + 2;
            } else {
                this.side = this.side === 20 ? this.side : this.side - 2;
            }
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.side, this.side);
            if (ballIteration === 2) {
                ctx.beginPath();
                ctx.ellipse(this.x + 1, (this.y + (this.side / 2)), (this.side / 2 - 6), (this.side / 2), 0, (1.5 * pi), (0.5 * pi));
                ctx.lineWidth = 3;
                ctx.strokeStyle = "red";
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.ellipse((this.x + this.side - 1), (this.y + (this.side / 2)), (this.side / 2 - 6), (this.side / 2), 0, (0.5 * pi), (1.5 * pi));
                ctx.lineWidth = 3;
                ctx.strokeStyle = "red";
                ctx.stroke();
                ctx.closePath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "black";
            }
        },    
    };
};

soundPool = function(maxSize) {
    return {
        size: maxSize || 10,
        pool: [],
        currSound: 0,
        init: function(object) {
            if (object == "bounce") {
                for (var i = 0; i < this.size; i++) {
                    // Initalize the sound
                    bounce = new Audio("sounds/bounce.wav");
                    bounce.volume = .3;
                    bounce.load();
                    this.pool[i] = bounce;
                }
            } else if (object == "win") {
                for (var i = 0; i < this.size; i++) {
                    var win = new Audio("sounds/win.wav");
                    win.volume = .3;
                    win.load();
                    this.pool[i] = win;
                }
            } else if (object == "paddle") {
                for (var i = 0; i < this.size; i++) {
                    var paddle = new Audio("sounds/paddle.wav");
                    paddle.volume = .3;
                    paddle.load();
                    this.pool[i] = paddle;
                }
            }
        },
        get: function() {
            if(this.pool[this.currSound].currentTime == 0 || this.pool[this.currSound].ended) {
                this.pool[this.currSound].play();
            }
            this.currSound = (this.currSound + 1) % this.size;
        }
    }
}

function hookKeyState () {
    keystate = {};
    document.addEventListener("keydown", function (evt) {
        // console.log(evt.keyCode);
        if (evt.keyCode === VKey && !ballChange) {
            ballIteration++;
            ballChange = true;
            if (ballIteration > 4) {
                ballIteration = 0;
            }            
        }
        if (evt.keyCode === BKey && !activeBounce) {
            activeBounce = true;
        }
        if (evt.keyCode === NKey && !activePaddle) {
            activePaddle = true;
        }
        if (evt.keyCode === MKey && !activeWin) {
            activeWin = true;
        }
        if (evt.keyCode === KKey && !activeBackground) {
            activeBackground = true;
        }
        if (evt.keyCode === 49) {
            Game.trail = !Game.trail;
        }
        if (evt.keyCode === 50) {
            Game.particles = !Game.particles;
        }
        if (evt.keyCode === 80) { // p
            Game.particlesCount += 50;
            // console.log(`${Game.particlesCount}: Game.particlesCount`);
        }
        if (evt.keyCode === 79) { // o
            Game.particlesCount -= 50
            if (Game.particlesCount < 25) {
                Game.particlesCount = 25;
            }
            // console.log(`${Game.particlesCount}: Game.particlesCount`);            
        }
        if (evt.keyCode === 84) { // t
            Game.motionTrailLength += 50;
            // console.log(`${Game.motionTrailLength}: Game.motionTrailLength`);
        }
        if (evt.keyCode === 82) { // r
            Game.motionTrailLength -= 50;
            if (Game.motionTrailLength < 25) {
                Game.motionTrailLength = 25;
            }
            // console.log(`${Game.motionTrailLength}: Game.motionTrailLength`);
        }
        if (evt.keyCode === 48 || evt.keyCode === 57){
            if (evt.keyCode === 48) {
                Game.removeFake = true;
                Game.multipleBalls = false;
            }
            if (evt.keyCode === 57) {
                Game.removeFake = false;
                Game.multipleBalls = true;
            }
            maddness();
        }
        if (evt.keyCode === 187) { // + key -> makes screen go away when 9 key is active
            Game.chaoticShake = !Game.chaoticShake;
        }
        if (evt.keyCode === 51) {// add Ai
            Game.ai = !Game.ai;
            if (Game.ai) {
                Game.playerTwo = Game.ai2;
            } else {
                Game.playerTwo = Game.p2;
            }
        }

        if (evt.keyCode === 52) {// add Ai
            Game.onlyAi = !Game.onlyAi;
            if (Game.onlyAi) {
                Game.playerOne = Game.ai1;
                Game.playerTwo = Game.ai2;
            } else {
                if (!Game.ai) {
                    Game.playerTwo = Game.p2;
                }
                Game.playerOne = Game.p1;                
            }
        }

        if (evt.keyCode === 189) { //- to pause maddness
            Game.multipleBalls = !Game.multipleBalls;
        }

        if (evt.keyCode === 88) { // x - shake
            Game.shake = !Game.shake;
        }
        if (evt.keyCode === 90) { // x - shake
            Game.ballScale = !Game.ballScale;
        }
        keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function (evt) {
        if (evt.keyCode === VKey && ballChange) {
            ballChange = false;
        }
        delete keystate[evt.keyCode];
    });
}
function maddness(shake) {
    let r = 1000;
    function ThrowBall(timmer) {
        if (Game.removeFake) {
            Game.ballList = [];
            return;
        }
        setTimeout(() => {
                let _ball = new ball({
                    x: (width - Game.default.ball.width) / 2,
                    y: (height - Game.default.ball.height) / 2,
                    side: Game.default.ball.width,
                    speed: 10,
                    gWidth: width,
                    gHeight: height,
                    fake: true,
                });
                _ball.init();
                Game.ballList.push(_ball);

                if (Game.multipleBalls) {
                    r -= 50;
                    if (r < 0) {
                        r = 0;
                    }
                    ThrowBall(r);
                }
            }, timmer);
        }
    ThrowBall(r);
}

function preShake() {
    ctx.save();
    var dx = Math.random() * 10;
    var dy = Math.random() * 10;
    ctx.translate(dx, dy);
}

function postShake() {
    ctx.restore();
}

function main() {
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext('2d');
    
    hookKeyState();
    Game.p1 = new player({
        width: Game.default.player.width,
        height: Game.default.player.height,
        x: Game.default.player.width,
        y:(height - Game.default.player.height) / 2,
        upArrow: UpArrow,
        downArrow: DownArrow,
        playerSpeed: Game.default.player.speed,
    });
    Game.playerOne = Game.p1;
    
    Game.p2 = new player({
        width: Game.default.player.width,
        height: Game.default.player.height,
        x: width - (Game.playerOne.width + Game.default.player.width),
        y: (height -  Game.playerOne.height) / 2,
        upArrow: WArrow,
        downArrow: SArrow,
        playerSpeed: Game.default.player.speed,
    });
    Game.playerTwo = Game.p2;

    Game.ai1 = new ai({
        width: Game.default.player.width,
        height: Game.default.player.height,
        x: Game.default.player.width,
        y:(height - Game.default.player.height) / 2,
        upArrow: UpArrow,
        downArrow: DownArrow,
        playerSpeed: Game.default.player.speed,
    });
    Game.ai2 = new ai({
        width: Game.default.player.width,
        height: Game.default.player.height,
        x: width - (Game.playerOne.width + Game.default.player.width),
        y: (height -  Game.playerOne.height) / 2,
    });
    Game.ball = new ball({
        x: (width - Game.default.ball.width) / 2,
        y: (height - Game.default.ball.height) / 2,
        side: Game.default.ball.width,
        speed: 10,
        gWidth: width,
        gHeight: height,
    });
    Game.ball.init();

    Game.bounceSound = new soundPool(10);
    Game.bounceSound.init("bounce");
    Game.winSound = new soundPool(10);
    Game.winSound.init("win");
    Game.paddleSound = new soundPool(10);
    Game.paddleSound.init("paddle");
    Game.backgroundAudio = new Audio("sounds/epic.wav");
    Game.backgroundAudio.loop = true;
    Game.backgroundAudio.volume = 0;
    Game.backgroundAudio.load();

    (function loop() {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);
    })();
}

function update() {
    if(keystate[CKey]) {
        Game.playerOne.color = "#f77979";
        Game.playerTwo.color = "#7fb6ff";
    }
    
    if(keystate[KKey] && activeBackground) {
        // console.log(Game.backgroundAudio.volume);
        Game.backgroundAudio.volume = Game.backgroundAudio.volume === 0 ? .1 : 0;
        activeBackground = false;
    }
    Game.ball.update();
    Game.playerOne.update();
    Game.playerTwo.update();
    if (Game.multipleBalls) {
        Game.ballList.forEach(_ball => _ball.update())
    }  
}

function drawNet() {
    const w = 4;
    const x = (width - w) / 2;
    const step = height / 20;
    let y = 0;
    
    while (y < height) {
        ctx.fillRect(x, y + step / 4, w, step / 2);
        y += step;
    }
}

function drawScore() {
    ctx.font="30px Arial";
    ctx.fillText(Game.score.right, width/4, 40);
    ctx.fillText(Game.score.left,width*3/4,40);
}

function draw() {
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    if (isShaking) {
        preShake();
    }

    ctx.fillStyle = "#fff";
    drawNet();

    Game.ball.draw();
    Game.playerOne.draw();
    Game.playerTwo.draw();

    if (Game.multipleBalls) {
        Game.ballList.forEach(_ball => _ball.draw())
    }  

    drawNet();
    drawScore();

    if (isShaking) {
        postShake();
    }

    ctx.restore();
}

main();