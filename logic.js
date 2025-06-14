/**
 * logic.js
 * Handles all game state, rules, and update logic for Pong.
 * Exports state variables and functions for use in main.js and ui.js.
 */

// All game state variables
export let canvas, ctx;
export let paddleWidth = 12;
export let paddleHeight = 80;
export let ballSize = 12;
export let playerX = 20;
export let playerY = 160;
export let aiX = 760;  // Initialize to canvas.width - paddleWidth - 20
export let aiY = 160;
export let ballX = 390;  // Initialize to canvas.width/2 - ballSize/2
export let ballY = 290;  // Initialize to canvas.height/2 - ballSize/2
export let ballSpeedX = 0;
export let ballSpeedY = 0;
export let playerScore = 0;
export let aiScore = 0;
export let gameStarted = false;
export let gameOver = false;
export let isSpeedBoost = false;
export let isTouchDevice = 'ontouchstart' in window;
export let particleSystem = [];
export let ballTrail = [];
export let scoreFlash = 0;
export let colorCycle = 0;

// Add new game state variables for power-ups
export let powerUps = [];
export let playerPowerUp = null;
export let aiPowerUp = null;
export let powerUpDuration = 5000; // 5 seconds
export let lastPowerUpTime = 0;
export let paddleTrails = [];
export let combos = 0; // Track consecutive hits

// Power-up types
const POWER_UPS = {
    SPEED_UP: { color: '#ff0', name: 'SPEED UP', duration: 5000 },
    GROW_PADDLE: { color: '#0f0', name: 'GROW', duration: 7000 },
    SHRINK_OPPONENT: { color: '#f0f', name: 'SHRINK', duration: 4000 }
};

// Helper to set dynamic sizes based on canvas
function setDynamicSizes() {
    paddleWidth = Math.max(Math.round(canvas.width * 0.015), 8);
    paddleHeight = Math.max(Math.round(canvas.height * 0.18), 40);
    ballSize = Math.max(Math.round(canvas.width * 0.018), 8);
    playerX = Math.round(canvas.width * 0.03);
    aiX = canvas.width - paddleWidth - playerX;
}

export function initGameState(_canvas, _ctx) {
    console.log('Initializing game state');
    canvas = _canvas;
    ctx = _ctx;
    setDynamicSizes();
    
    // Initialize canvas-dependent values
    aiX = canvas.width - paddleWidth - 20;
    ballX = canvas.width/2 - ballSize/2;
    ballY = canvas.height/2 - ballSize/2;
    playerY = canvas.height/2 - paddleHeight/2;
    aiY = canvas.height/2 - paddleHeight/2;
    
    // Reset game state
    ballSpeedX = 0;
    ballSpeedY = 0;
    playerScore = 0;
    aiScore = 0;
    gameStarted = false;
    gameOver = false;
    isSpeedBoost = false;
    particleSystem = [];
    ballTrail = [];
    scoreFlash = 0;
    colorCycle = 0;
    powerUps = [];
    playerPowerUp = null;
    aiPowerUp = null;
    lastPowerUpTime = 0;
    paddleTrails = [];
    combos = 0;
    
    console.log('Game state initialized', { 
        canvasWidth: canvas.width, 
        canvasHeight: canvas.height,
        playerPos: { x: playerX, y: playerY },
        aiPos: { x: aiX, y: aiY },
        ballPos: { x: ballX, y: ballY }
    });
}

export function updateGame() {
    if (gameStarted && !gameOver) {
        // Update power-ups
        updatePowerUps();
        
        // Spawn new power-up every 10 seconds if none exist
        if (Date.now() - lastPowerUpTime > 10000 && powerUps.length === 0) {
            spawnPowerUp();
        }
        
        // Update paddle trails
        updatePaddleTrails();
        
        // Update ball position
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        // AI movement with improved prediction
        const aiCenter = aiY + paddleHeight / 2;
        const ballCenter = ballY + ballSize / 2;
        let predictedY = ballY;
        
        if (ballSpeedX > 0) {
            // Calculate where ball will intersect with AI paddle
            const timeToIntercept = (aiX - ballX) / ballSpeedX;
            predictedY = ballY + ballSpeedY * timeToIntercept;
            
            // Account for bounces
            while (predictedY < 0 || predictedY > canvas.height - ballSize) {
                if (predictedY < 0) {
                    predictedY = -predictedY;
                }
                if (predictedY > canvas.height - ballSize) {
                    predictedY = 2 * (canvas.height - ballSize) - predictedY;
                }
            }
            
            // Move AI paddle towards predicted position
            const targetY = predictedY - paddleHeight / 2;
            aiY += (targetY - aiY) * 0.1; // Smoothing factor
        } else {
            // Return to center when ball is moving away
            aiY += (canvas.height / 2 - paddleHeight / 2 - aiY) * 0.05;
        }
        
        // Constrain AI paddle to canvas
        aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));
        
        // Ball collision with top and bottom
        if (ballY <= 0 || ballY + ballSize >= canvas.height) {
            ballSpeedY = -ballSpeedY;
            createParticles(ballX + ballSize/2, ballY + ballSize/2, '#fff', 5);
        }
        
        // Ball collision with paddles
        if (ballX <= playerX + paddleWidth && 
            ballY + ballSize >= playerY && 
            ballY <= playerY + paddleHeight &&
            ballSpeedX < 0) {
            
            // Calculate bounce angle based on where ball hits paddle
            const hitPos = (ballY + ballSize/2 - playerY) / paddleHeight;
            const bounceAngle = (hitPos - 0.5) * Math.PI / 3; // -60 to +60 degrees
            
            const speed = isSpeedBoost ? 12 : 8;
            ballSpeedX = Math.cos(bounceAngle) * speed;
            ballSpeedY = Math.sin(bounceAngle) * speed;
            
            createParticles(ballX, ballY + ballSize/2, '#61dafb', 10);
            window.hitSound?.play();
        }
        
        if (ballX + ballSize >= aiX && 
            ballY + ballSize >= aiY && 
            ballY <= aiY + paddleHeight &&
            ballSpeedX > 0) {
            
            const hitPos = (ballY + ballSize/2 - aiY) / paddleHeight;
            const bounceAngle = (hitPos - 0.5) * Math.PI / 3;
            
            const speed = 8;
            ballSpeedX = -Math.cos(bounceAngle) * speed;
            ballSpeedY = Math.sin(bounceAngle) * speed;
            
            createParticles(ballX + ballSize, ballY + ballSize/2, '#ff6b6b', 10);
            window.hitSound?.play();
        }
        
        // Scoring
        if (ballX < -ballSize) {
            aiScore++;
            window.scoreSound?.play();
            scoreFlash = 1;
            createParticles(0, ballY, '#ff6b6b', 20);
            if (aiScore >= 11) {
                gameOver = true;
            } else {
                resetBall();
            }
        } else if (ballX > canvas.width + ballSize) {
            playerScore++;
            window.scoreSound?.play();
            scoreFlash = 1;
            createParticles(canvas.width, ballY, '#61dafb', 20);
            if (playerScore >= 11) {
                gameOver = true;
            } else {
                resetBall();
            }
        }
        
        // Check for power-up collection
        powerUps.forEach((powerUp, index) => {
            if (ballX < powerUp.x + 20 && ballX + ballSize > powerUp.x &&
                ballY < powerUp.y + 20 && ballY + ballSize > powerUp.y) {
                
                if (ballSpeedX < 0) {
                    applyPowerUp(powerUp, 'player');
                } else {
                    applyPowerUp(powerUp, 'ai');
                }
                powerUps.splice(index, 1);
                createParticles(powerUp.x, powerUp.y, powerUp.color, 20);
            }
        });
        
        // Update combo system
        if (ballX <= playerX + paddleWidth && 
            ballX + ballSize > playerX &&
            ballY + ballSize > playerY && 
            ballY < playerY + paddleHeight &&
            ballSpeedX < 0) {
            combos++;
            // Increase ball speed with combos
            const comboSpeedBonus = Math.min(combos * 0.5, 4); // Max 4 speed bonus
            ballSpeedX *= (1 + comboSpeedBonus * 0.1);
        }
        
        // Reset combo on score
        if (ballX < -ballSize || ballX > canvas.width + ballSize) {
            combos = 0;
        }
        
        // Update particles
        particleSystem = particleSystem.filter(p => p.life > 0);
        particleSystem.forEach(p => p.update());
        
        // Update score flash
        if (scoreFlash > 0) {
            scoreFlash -= 0.02;
        }
    }
}

export function resetBall() {
    console.log('Resetting ball');
    // Center the ball
    ballX = canvas.width/2 - ballSize/2;
    ballY = canvas.height/2 - ballSize/2;
    ballSpeedX = 0;
    ballSpeedY = 0;
    ballTrail = [];
    
    // Start ball after a delay
    setTimeout(() => {
        if (!gameOver) {
            const angle = (Math.random() - 0.5) * Math.PI / 3; // -60 to +60 degrees
            const speed = 4; // Lowered from 8 to 4.5 for a smoother start
            ballSpeedX = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
            ballSpeedY = Math.sin(angle) * speed;
        }
    }, 1000);
}

export function createParticles(x, y, color, amount = 10) {
    for (let i = 0; i < amount; i++) {
        particleSystem.push({
            x,
            y,
            color,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 6,
            speedY: (Math.random() - 0.5) * 6,
            life: 1,
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= 0.02;
                this.size = Math.max(0, this.size - 0.1);
            }
        });
    }
}

// Improved mouse/touch handling for smoother paddle movement
export function handleMouse(e) {
    if (!isTouchDevice) {
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.height / rect.height;
        const mouseY = (e.clientY - rect.top) * scale;
        const targetY = mouseY - paddleHeight/2;
        playerY += (targetY - playerY) * 0.2; // Smooth movement
        playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
    }
}

export function handleTouch(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.height / rect.height;
        const touchY = (e.touches[0].clientY - rect.top) * scale;
        const targetY = touchY - paddleHeight/2;
        playerY = Math.max(0, Math.min(canvas.height - paddleHeight, targetY));
    }
}

export function handleKeydown(e) {
    const speed = 15;
    if (e.key === 'ArrowUp' || e.key === 'w') {
        playerY = Math.max(playerY - speed, 0);
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        playerY = Math.min(playerY + speed, canvas.height - paddleHeight);
    } else if (e.key === ' ') {
        isSpeedBoost = true;
        if (!gameStarted) handleClick();
    }
}

export function handleKeyup(e) {
    if (e.key === ' ') {
        isSpeedBoost = false;
    }
}

export function handleClick() {
    console.log('Click handled', { gameStarted, gameOver });
    
    if (!gameStarted) {
        gameStarted = true;
        // Start with a random direction
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        const speed = 8;
        ballSpeedX = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
        ballSpeedY = Math.sin(angle) * speed;
    } else if (gameOver) {
        // Reset game state
        gameOver = false;
        playerScore = 0;
        aiScore = 0;
        resetBall();
        // Reset paddle positions
        playerY = canvas.height/2 - paddleHeight/2;
        aiY = canvas.height/2 - paddleHeight/2;
    }
}

function spawnPowerUp() {
    const types = Object.keys(POWER_UPS);
    const type = types[Math.floor(Math.random() * types.length)];
    const powerUp = {
        x: canvas.width/2 - 10,
        y: Math.random() * (canvas.height - 40) + 20,
        type: type,
        color: POWER_UPS[type].color
    };
    powerUps.push(powerUp);
    lastPowerUpTime = Date.now();
}

function applyPowerUp(powerUp, target) {
    const powerUpEffect = {
        type: powerUp.type,
        startTime: Date.now(),
        duration: POWER_UPS[powerUp.type].duration
    };
    
    if (target === 'player') {
        playerPowerUp = powerUpEffect;
        if (powerUp.type === 'GROW_PADDLE') {
            paddleHeight *= 1.5;
        } else if (powerUp.type === 'SHRINK_OPPONENT') {
            // Store original height for restoration
            powerUpEffect.originalHeight = paddleHeight;
            aiY += paddleHeight * 0.25; // Adjust position when shrinking
            paddleHeight *= 0.5;
        }
    } else {
        aiPowerUp = powerUpEffect;
        // Similar effects for AI
    }
}

function updatePowerUps() {
    const currentTime = Date.now();
    
    // Update player power-up
    if (playerPowerUp && currentTime - playerPowerUp.startTime > playerPowerUp.duration) {
        // Reset effects
        if (playerPowerUp.type === 'GROW_PADDLE') {
            paddleHeight = 80; // Reset to original size
        } else if (playerPowerUp.type === 'SHRINK_OPPONENT') {
            paddleHeight = playerPowerUp.originalHeight;
        }
        playerPowerUp = null;
    }
    
    // Update AI power-up
    if (aiPowerUp && currentTime - aiPowerUp.startTime > aiPowerUp.duration) {
        // Reset effects
        aiPowerUp = null;
    }
}

function updatePaddleTrails() {
    // Add new trail positions
    paddleTrails.unshift({ x: playerX, y: playerY, time: Date.now() });
    if (paddleTrails.length > 5) paddleTrails.pop();
    
    // Remove old trails
    paddleTrails = paddleTrails.filter(trail => Date.now() - trail.time < 100);
}

/**
 * Grouped game state object for easier management and future refactoring.
 * (All original exports remain for compatibility.)
 */
export const gameState = {
    paddleWidth,
    paddleHeight,
    ballSize,
    playerX,
    playerY,
    aiX,
    aiY,
    ballX,
    ballY,
    ballSpeedX,
    ballSpeedY,
    playerScore,
    aiScore,
    gameStarted,
    gameOver,
    isSpeedBoost,
    isTouchDevice,
    particleSystem,
    ballTrail,
    scoreFlash,
    colorCycle,
    powerUps,
    playerPowerUp,
    aiPowerUp,
    powerUpDuration,
    lastPowerUpTime,
    paddleTrails,
    combos
};
