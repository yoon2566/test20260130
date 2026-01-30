const character = document.getElementById('character');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let gameInterval;
let isGameOver = false;

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !isGameOver) {
        jump();
    }
});

restartBtn.addEventListener('click', function() {
    score = 0;
    isGameOver = false;
    gameOverScreen.classList.add('hidden');
    
    // Reset animations
    obstacle.style.animation = 'none';
    obstacle.offsetHeight; /* trigger reflow */
    obstacle.style.animation = 'move 2s linear infinite';
    obstacle.style.animationPlayState = 'running';
    character.style.animationPlayState = 'running';
    character.classList.remove('jump');

    startGame();
});

function jump() {
    if (!character.classList.contains('jump')) {
        character.classList.add('jump');
        setTimeout(() => {
            character.classList.remove('jump');
        }, 600);
    }
}

function startGame() {
    function gameLoop() {
        if (isGameOver) {
            return;
        }

        score++;
        scoreDisplay.textContent = `Score: ${score}`;

        const characterRect = character.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            characterRect.bottom > obstacleRect.top &&
            characterRect.top < obstacleRect.bottom &&
            characterRect.right > obstacleRect.left &&
            characterRect.left < obstacleRect.right
        ) {
            isGameOver = true;
            obstacle.style.animationPlayState = 'paused'; // Pause CSS animation
            character.style.animationPlayState = 'paused';
            finalScoreDisplay.textContent = score;
            gameOverScreen.classList.remove('hidden');
        } else {
            requestAnimationFrame(gameLoop);
        }
    }
    requestAnimationFrame(gameLoop);
}

startGame();
