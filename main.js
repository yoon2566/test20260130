const character = document.getElementById('character');
const gameArea = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Game State
let isGameOver = false;
let score = 0;
let gameSpeed = 5; // Initial movement speed (pixels per frame)
let frameCount = 0;
let gravity = 0.9;
let isJumping = false;
let jumpVelocity = 0;
let charY = 0; // Relative to bottom offset
const GROUND_Y = 0; // Defines the ground level logic

// Obstacle Management
let obstacles = [];
let nextSpawnTime = 0;

// Inputs
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (isGameOver) {
            resetGame();
        } else {
            jump();
        }
    }
});
restartBtn.addEventListener('click', resetGame);

function jump() {
    if (charY === GROUND_Y) { // Only jump if on ground
        jumpVelocity = 15; // Initial jump strength
        isJumping = true;
    }
}

function spawnObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.left = '100vw'; // Start off-screen right
    gameArea.appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        x: window.innerWidth
    });

    // Randomize next spawn time based on speed
    // Higher speed = obstacles come faster, but we need gap control
    const minGap = 60 + (Math.random() * 60); // Frames
    nextSpawnTime = frameCount + minGap; 
}

function updatePhysics() {
    // Character Physics
    if (isJumping || charY > GROUND_Y) {
        charY += jumpVelocity;
        jumpVelocity -= gravity;
    }

    if (charY <= GROUND_Y) {
        charY = GROUND_Y;
        isJumping = false;
        jumpVelocity = 0;
    }

    character.style.bottom = (100 + charY) + 'px'; // 100px is the visual floor offset
}

function updateObstacles() {
    // Spawn Logic
    if (frameCount >= nextSpawnTime) {
        spawnObstacle();
    }

    // Move & Collision
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;
        obs.element.style.left = obs.x + 'px';

        // Collision Detection
        // Character Hitbox: Left 50, Width 40 -> Right 90. Bottom 100 + charY.
        // Obstacle Hitbox: Left obs.x, Width 30. Bottom 100. Height 60.
        
        // Simple AABB collision
        const charLeft = 50;
        const charRight = 50 + 40;
        const charBottom = charY; // Relative to ground (0)
        const charTop = charY + 40;

        const obsLeft = obs.x;
        const obsRight = obs.x + 30;
        const obsHeight = 60;
        
        // Check horizontal overlap
        if (charRight > obsLeft && charLeft < obsRight) {
            // Check vertical overlap (Character is low enough to hit)
            if (charBottom < obsHeight) {
                gameOver();
            }
        }

        // Remove off-screen
        if (obs.x < -50) {
            obs.element.remove();
            obstacles.splice(i, 1);
            score += 10;
            updateScore();
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = `SCORE: ${score}`;
    
    // Difficulty Progression
    if (score > 0 && score % 100 === 0) {
        gameSpeed += 0.5;
        levelDisplay.textContent = `SPEED: ${(gameSpeed / 5).toFixed(1)}x`;
        // Limit max speed
        if(gameSpeed > 15) gameSpeed = 15;
    }
}

function gameOver() {
    isGameOver = true;
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    if (!isGameOver && obstacles.length > 0) return; // Prevent double restart if running

    isGameOver = false;
    score = 0;
    gameSpeed = 5;
    charY = 0;
    frameCount = 0;
    nextSpawnTime = 0;
    
    scoreDisplay.textContent = `SCORE: 0`;
    levelDisplay.textContent = `SPEED: 1x`;
    gameOverScreen.classList.add('hidden');

    // Remove all obstacles
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];

    // Restart Loop
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (isGameOver) return;

    frameCount++;
    
    updatePhysics();
    updateObstacles();

    requestAnimationFrame(gameLoop);
}

// Start
resetGame();