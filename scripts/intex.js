const width = 900,
    height = 600,
    pi = Math.PI,
    playerSpeed = 7;

const UpArrow = 38,
    DownArrow = 40,
    WArrow = 87,
    SArrow = 83;

let canvas, ctx, keystate,
    player, ai, ball;

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
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }, 
    };   
};

ai = function (option) { return {
        x: option.x,
        y: option.y,
        width: option.width || 20,
        height: option.height || 100,
        update: function () {
            let destination = Game.ball.y - (this.height -  Game.ball.side) / 2;
            this.y += (destination - this.y) * 0.1;
            this.y = Math.max(Math.min(this.y, height -this.height), 0);
        },
        draw: function () {
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
        gWidth: option.gWidth,
        gHeight: option.gHeight,
        init: function (width, height) {
            this.x = (this.gWidth - this.side) / 2;
            this.y = (this.gHeight - this.side) / 2;
            
            // serve
            let r = Math.random();
            let side = r > 0.5 ? 1 : -1;
            let phi = 0.1 * pi * ( 1 - 2 * r);

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
            this.x += this.vel.x;
            this.y += this.vel.y;

            if (0 > this.y || this.y + this.side > height) {
                let offset = this.vel.y < 0 ? 
                    0 - this.y : 
                    height - (this.y + this.side);

                this.y += 2 * offset;
                this.vel.y *= -1;
            }

            // intersect with paddles
            let pdle = this.vel.x < 0 ? Game.playerOne : Game.playerTwo;

            if (this.AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
                    this.x, this.y, this.side, this.side)) {
                // in case we hit with the "sides" of the paddles the
                // ball should change diraction ...
                this.x = pdle === Game.playerOne ? Game.playerOne.x + Game.playerOne.width : Game.playerTwo.x - this.side;
                let n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
                let phi = 0.25 * pi * (2 * n - 1); // pi/ 4 = 45

                // smashing system ?
                let smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;

                this.vel.x = smash * (pdle === Game.playerOne ? 1 : -1 ) * this.speed * Math.cos(phi);
                this.vel.y = smash * this.speed * Math.sin(phi);                    
            }

            if (0 > this.x + this.side || this.x > width) {
                this.init();
            }

        },
        draw: function () {
            ctx.fillRect(this.x, this.y, this.side, this.side);
        },    
    };
};

function hookKeyState () {
    keystate = {};
    document.addEventListener("keydown", function (evt) {
        keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function (evt) {
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
            y: (height -  Game.playerOne.height) / 2
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

    (function loop() {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);
    })();
}


function update() {
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

    Game.ball.draw();
    Game.playerOne.draw();
    Game.playerTwo.draw();

    drawNet();

    ctx.restore();
}

main();