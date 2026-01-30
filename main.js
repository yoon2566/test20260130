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
    
    // Randomly choose obstacle type
    const type = Math.random();
    let width, height, typeClass;

    if (type < 0.33) {
        typeClass = 'obstacle-spike';
        width = 30;
        height = 60;
    } else if (type < 0.66) {
        typeClass = 'obstacle-wall';
        width = 40;
        height = 70;
    } else {
        typeClass = 'obstacle-saw';
        width = 50;
        height = 50;
    }
    
    obstacle.classList.add(typeClass);
    obstacle.style.left = '100vw';
    gameArea.appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        x: window.innerWidth,
        width: width,
        height: height
    });

    // Randomize next spawn time based on speed
    const minGap = 60 + (Math.random() * 50); // Slightly reduced gap
    nextSpawnTime = frameCount + minGap; 
}

function updatePhysics() {
    // Character Physics
    if (isJumping || charY > GROUND_Y) {
        charY += jumpVelocity;
        jumpVelocity -= gravity;
        // Pause running animation while jumping
        character.style.animationName = 'none';
        // Add a slight tilt for jump
        character.style.transform = 'rotate(-15deg)'; 
    } else {
        // Resume running animation on ground
        character.style.animationName = 'run-bounce';
        character.style.transform = ''; // Clear manual transform
    }

    if (charY <= GROUND_Y) {
        charY = GROUND_Y;
        isJumping = false;
        jumpVelocity = 0;
    }

    character.style.bottom = (100 + charY) + 'px'; 
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

        // Collision Detection (Dynamic sizes)
        const charLeft = 50 + 15; // Tighten hitbox horizontally
        const charRight = 50 + 60 - 15; 
        const charBottom = charY; 
        // Note: charTop isn't strictly needed if we assume obstacle is on ground

        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;
        const obsHeight = obs.height;
        
        // Horizontal overlap
        if (charRight > obsLeft && charLeft < obsRight) {
            // Vertical overlap (Did player jump high enough?)
            if (charBottom < obsHeight - 10) { // -10 leeway for grazing
                gameOver();
            }
        }

        // Remove off-screen
        if (obs.x < -100) {
            obs.element.remove();
            obstacles.splice(i, 1);
            score += 10;
            updateScore();
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = `SCORE: ${score}`;
    
    // Difficulty Progression: Faster every 50 points
    if (score > 0 && score % 50 === 0) {
        gameSpeed += 0.5;
        levelDisplay.textContent = `SPEED: ${(gameSpeed / 5).toFixed(1)}x`;
        // Limit max speed
        if(gameSpeed > 20) gameSpeed = 20;
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