const width = 900,
    height = 600,
    pi = Math.PI;

let x = width / 2,
    y = height / 2;
    edge = 20,
    isGoingRight = true;

function main() {
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext('2d');

    (function loop() {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);
    })();
}

function update() {
    if (isGoingRight) {
        x++;
    } else {
        x--;
    }
    if (x == width - edge - 5) {
        isGoingRight = false;
    } else if (x == 5) {
        isGoingRight = true;
    }
}

function draw() {
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, edge, edge);
    ctx.restore();
}

main();