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
    player, ai, ball, ballChange,
    activeBounce, activePaddle, activeWin, activeBackground;

let ballIteration = 0;

Game = {
    playerOne: null,
    playerTwo: null,
    ball: null,
    default: {
        player: {
            width: 20,
            height: 100,
            speed: 7,
        },
        ball: {
            width: 20,
            height: 20,
        }
    },
    ai: true,
};

player = function (option) {
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
        }, 
    };   
};

ai = function (option) { return {
        x: option.x,
        y: option.y,
        width: option.width || 20,
        height: option.height || 100,
        color: option.color || "#fff",
        update: function () {
            let destination = Game.ball.y - (this.height -  Game.ball.side) / 2;
            this.y += (destination - this.y) * 0.1;
            this.y = Math.max(Math.min(this.y, height -this.height), 0);
        },
        draw: function () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },    
    };
}

ball = function (option) {
    return {
        x: option.x,
        y: option.y,
        side: option.side || 20,
        vel: option.vel,
        speed: option.speed || 10,
        color: option.color || "#fff",
        gWidth: option.gWidth,
        gHeight: option.gHeight,
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
        },
        AABBIntersect: function (ax, ay, aw, ah, bx, by, bw, bh) {
            return ax < bx + bw
                && ay < by + bh
                && bx < ax + aw 
                && by < ay + ah;
        },
        update: function () {
            let side = this.vel.x < 0 ? -1 : 1;
            
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

            if (0 > this.y || this.y + this.side > height) {
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
                this.init();
            }

        },
        draw: function () {
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
        if (evt.keyCode === VKey && !ballChange) {
            ballIteration++;
            ballChange = true;
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
        keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function (evt) {
        if (evt.keyCode === VKey && ballChange) {
            ballChange = false;
        }
        delete keystate[evt.keyCode];
    });
}

function main() {
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext('2d');
    
    hookKeyState();
    
    Game.playerOne = new player({
        width: Game.default.player.width,
        height: Game.default.player.height,
        x: Game.default.player.width,
        y:(height - Game.default.player.height) / 2,
        upArrow: UpArrow,
        downArrow: DownArrow,
        playerSpeed: Game.default.player.speed,
    });

    if (Game.ai) {
        Game.playerTwo = new ai({
            width: Game.default.player.width,
            height: Game.default.player.height,
            x: width - (Game.playerOne.width + Game.default.player.width),
            y: (height -  Game.playerOne.height) / 2,
        });
    } else {
        Game.playerTwo = new player({
            width: Game.default.player.width,
            height: Game.default.player.height,
            x: width - (Game.playerOne.width + Game.default.player.width),
            y: (height -  Game.playerOne.height) / 2,
            upArrow: WArrow,
            downArrow: SArrow,
            playerSpeed: Game.default.player.speed,
        });
    }

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
    if(keystate[BKey] && activeBounce) {
        Game.ball.bounceSound = Game.ball.bounceSound ? false : true;
        activeBounce = false;
    }
    if(keystate[NKey] && activePaddle) {
        Game.ball.paddleSound = Game.ball.paddleSound ? false : true;
        activePaddle = false;
    }
    if(keystate[MKey] && activeWin) {
        Game.ball.winSound = Game.ball.winSound ? false : true;
        activeWin = false;
    }
    if(keystate[KKey] && activeBackground) {
        console.log(Game.backgroundAudio.volume);
        Game.backgroundAudio.volume = Game.backgroundAudio.volume === 0 ? .1 : 0;
        activeBackground = false;
    }
    Game.ball.update();
    Game.playerOne.update();
    Game.playerTwo.update();
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

function draw() {
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = "#fff";
    drawNet();

    Game.ball.draw();
    Game.playerOne.draw();
    Game.playerTwo.draw();


    ctx.restore();
}

main();