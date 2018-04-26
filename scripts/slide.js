let count = 0;
let simple = document.getElementById('simple');
let gameLoop = document.getElementById('game-loop');
let fullGame = document.getElementById('game');

document.body.addEventListener('keydown', function me(evt) {
    if(evt.keyCode === 39) {
        count++;
    }

    if (count === 1) {
        simple.style.display = 'none';
        gameLoop.style.display = 'inline-block';
        fullGame.style.display = 'none';
    }
    if (count === 2) {
        simple.style.display = 'none';
        gameLoop.style.display = 'none';
        fullGame.style.display = 'inline-block';
        document.body.removeEventListener('keydown', me);   
    }
    console.log(evt.keyCode)
});