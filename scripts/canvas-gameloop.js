(function() {
    const __canvas__ = document.getElementById('canvas-gameloop');
    const context = __canvas__.getContext('2d'); // Can be 3d

    context.fillStyle = '#ffff';

    let x = 175;
    let y = 0;


    let square = {
        x: x,
        y: y,
        update: function() {
            this.y += 0.5;
        },
        draw: function() {
            context.fillStyle = '#fff';
            context.fillRect(this.x, this.y, 40, 40);
        }
    }

    function main() {
        (function loop() {
            update();
            draw();

            window.requestAnimationFrame(loop, canvas);
        })();
    };

    function update () {
        square.update();
    }
    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, 400, 400);

        context.save();
        
        square.draw();

        context.restore();        
    }

    main();
}());