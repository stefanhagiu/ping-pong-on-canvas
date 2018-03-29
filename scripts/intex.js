const width = 700,
    height = 600,
    pi = Math.PI,
    playerSpeed = 7;

const UpArrow = 38,
    DownArrow = 40;

let canvas, ctx, keystate,
    player, ai, ball;


player = {
    x: null,
    y: null,
    width: 20,
    height: 100,
    update: function () {
        if (keystate[UpArrow]) {
            this.y -= playerSpeed;
        }
        if (keystate[DownArrow]) {
            this.y += playerSpeed;
        }
        this.y = Math.max(Math.min(this.y, height -this.height), 0);
    },
    draw: function () {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },    
};
ai = {
    x: null,
    y: null,
    width: 20,
    height: 100,
    update: function () {
        let destination = ball.y - (this.height - ball.side) / 2;
        this.y += (destination - this.y) * 0.1;
        this.y = Math.max(Math.min(this.y, height -this.height), 0);
    },
    draw: function () {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },    
};
ball = {
    x: null,
    y: null,
    side: 20,
    vel: null,
    speed: 10,
    init: function () {
        this.x = (width - this.side) / 2;
        this.y = (height - this.side) / 2;
        
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
        let pdle = this.vel.x < 0 ? player : ai;

        if (this.AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
                this.x, this.y, this.side, this.side)) {
            // in case we hit with the "sides" of the paddles the
            // ball should change diraction ...
            this.x = pdle === player ? player.x + player.width : ai.x - this.side;
            let n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
            let phi = 0.25 * pi * (2 * n - 1); // pi/ 4 = 45

            // smashing system ?
            let smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;

            this.vel.x = smash * (pdle === player ? 1 : -1 ) * this.speed * Math.cos(phi);
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
    init();

    (function loop() {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);
    })();
}

function init() {
    player.x = player.width;
    player.y = (height - player.height) / 2;

    ai.x = width - (player.width + ai.width);
    ai.y = (height - player.height) / 2;

    ball.init();
}

function update() {
    ball.update();
    player.update();
    ai.update();    
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

    ball.draw();
    player.draw();
    ai.draw();

    drawNet();

    ctx.restore();
}

main();