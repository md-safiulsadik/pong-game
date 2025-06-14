// Get the canvas element and set dimensions
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 700;
canvas.height = 400;

// Game constants
const PADDLE_WIDTH = 12, PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PLAYER_X = 20, AI_X = canvas.width - 20 - PADDLE_WIDTH;
const PADDLE_COLOR = "#61dafb", BALL_COLOR = "#fff";
const PADDLE_SPEED = 5, AI_SPEED = 4;
const INITIAL_BALL_SPEED = 5;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballSpeedX = 0;
let ballSpeedY = 0;
let gameOver = false;
let gameStarted = false;
let playerScore = 0;
let aiScore = 0;
let countdownTimer = 0;
let isCountingDown = false;

// Keyboard state
const keys = {
    up: false,
    down: false
};

// Add event listeners only once
function initializeEventListeners() {
    // Mouse control
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        playerY = Math.min(Math.max(mouseY - PADDLE_HEIGHT / 2, 0), canvas.height - PADDLE_HEIGHT);
    });

    // Keyboard controls
    window.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                keys.down = true;
                break;
        }
    });

    window.addEventListener('keyup', function(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                keys.down = false;
                break;
        }
    });

    canvas.addEventListener('click', function(e) {
        if (gameOver || !gameStarted) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Check if button area was clicked
            if (mouseX >= canvas.width / 2 - 50 && 
                mouseX <= canvas.width / 2 + 50 && 
                mouseY >= canvas.height / 2 + 25 && 
                mouseY <= canvas.height / 2 + 75) {
                
                gameOver = false;
                gameStarted = true;
                playerScore = 0;
                aiScore = 0;
                // Pass true as second parameter for immediate start on first game
                resetBall(true, true);
            }
        }
    });
}

// Update player position based on keyboard input
function updatePlayerPosition() {
    if (keys.up) {
        playerY = Math.max(playerY - PADDLE_SPEED, 0);
    }
    if (keys.down) {
        playerY = Math.min(playerY + PADDLE_SPEED, canvas.height - PADDLE_HEIGHT);
    }
}

// AI paddle movement with imperfect tracking and reaction delay
function updateAIPaddle() {
    const paddleCenter = aiY + PADDLE_HEIGHT / 2;
    const ballCenter = ballY + BALL_SIZE / 2;
    
    // Only move if ball is moving towards AI
    if (ballSpeedX > 0) {
        // Add random reaction delay
        if (Math.random() > 0.1) {  // 10% chance to "miss" the ball movement
            // Add some randomness to the prediction
            const predictedBallY = ballCenter + (Math.random() - 0.5) * 30;  // +/- 15px random error
            
            // Move slower when far from the ball
            const distanceFromBall = Math.abs(paddleCenter - predictedBallY);
            const currentSpeed = Math.min(AI_SPEED, 2 + (distanceFromBall / 100));
            
            if (paddleCenter < predictedBallY - 10) {
                aiY += currentSpeed;
            } else if (paddleCenter > predictedBallY + 10) {
                aiY -= currentSpeed;
            }
        }
    } else {
        // When ball is moving away, return to center with some randomness
        const centerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
        if (Math.abs(aiY - centerY) > PADDLE_HEIGHT) {
            aiY += aiY > centerY ? -2 : 2;
        }
    }
    
    // Keep AI paddle within bounds
    aiY = Math.min(Math.max(aiY, 0), canvas.height - PADDLE_HEIGHT);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Main update function
function update() {
    if (gameStarted && !gameOver) {
        // Update player position based on keyboard input
        updatePlayerPosition();
        
        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Update AI
        updateAIPaddle();

        // Paddle collision - Player
        if (ballX < PLAYER_X + PADDLE_WIDTH &&
            ballX + BALL_SIZE > PLAYER_X &&
            ballY + BALL_SIZE > playerY &&
            ballY < playerY + PADDLE_HEIGHT) {
            
            ballX = PLAYER_X + PADDLE_WIDTH;
            ballSpeedX = Math.abs(ballSpeedX) * 1.1; // Increase speed slightly
            
            // Add effect based on where it hit the paddle
            let collidePoint = (ballY + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2);
            collidePoint = collidePoint / (PADDLE_HEIGHT/2);
            ballSpeedY = collidePoint * 5;
        }

        // Paddle collision - AI
        if (ballX + BALL_SIZE > AI_X &&
            ballX < AI_X + PADDLE_WIDTH &&
            ballY + BALL_SIZE > aiY &&
            ballY < aiY + PADDLE_HEIGHT) {
            
            ballX = AI_X - BALL_SIZE;
            ballSpeedX = -Math.abs(ballSpeedX) * 1.1; // Increase speed slightly
            
            let collidePoint = (ballY + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2);
            collidePoint = collidePoint / (PADDLE_HEIGHT/2);
            ballSpeedY = collidePoint * 5;
        }

        // Wall collision
        if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
            ballSpeedY *= -1;
            ballY = ballY <= 0 ? 0 : canvas.height - BALL_SIZE;
        }

        // Score detection
        if (ballX + BALL_SIZE < 0) {
            // AI scores
            aiScore++;
            if (aiScore >= 10) {
                gameOver = true;
            } else {
                resetBall(true, false); // Use delay between points
            }
        } else if (ballX > canvas.width) {
            // Player scores
            playerScore++;
            if (playerScore >= 10) {
                gameOver = true;
            } else {
                resetBall(true, false); // Use delay between points
            }
        }
    }
}

// Main render function
function render() {
    // Clear canvas
    ctx.fillStyle = "#282c34";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawNet();
    drawPaddle(PLAYER_X, playerY);
    drawPaddle(AI_X, aiY);
    drawBall(ballX, ballY);
    drawScore();

    if (gameOver) {
        drawGameOver();
    } else if (!gameStarted) {
        drawStartScreen();
    }
}

// Draw score
function drawScore() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(playerScore, canvas.width / 4, 60);
    ctx.fillText(aiScore, 3 * canvas.width / 4, 60);
}

// Draw game over screen
function drawGameOver() {
    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Main game over message
    ctx.font = "48px Arial";
    ctx.fillStyle = "#61dafb";  // Using the paddle color for emphasis
    
    if (playerScore > aiScore) {
        ctx.fillText("Congratulations!", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = "#fff";
        ctx.font = "36px Arial";
        ctx.fillText("You Beat the AI!", canvas.width / 2, canvas.height / 2);
    } else {
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillStyle = "#fff";
        ctx.font = "36px Arial";
        ctx.fillText("AI Wins This Time!", canvas.width / 2, canvas.height / 2);
    }
    
    // Final score
    ctx.font = "28px Arial";
    ctx.fillText(`Final Score: ${playerScore} - ${aiScore}`, canvas.width / 2, canvas.height / 2 + 50);
    
    // Restart message
    ctx.font = "24px Arial";
    ctx.fillStyle = "#61dafb";
    ctx.fillText("Click to Play Again", canvas.width / 2, canvas.height / 2 + 100);
}

// Draw start screen
function drawStartScreen() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Pong Game", canvas.width / 2, canvas.height / 2);
    
    ctx.font = "24px Arial";
    ctx.fillText("Click to Start", canvas.width / 2, canvas.height / 2 + 50);
}

// Draw net function
function drawNet() {
    const netSegments = 20;
    const segmentHeight = canvas.height / netSegments;
    ctx.fillStyle = "#fff";
    
    for(let i = 0; i < netSegments; i++) {
        if(i % 2 === 0) {
            ctx.fillRect(canvas.width / 2 - 1, i * segmentHeight, 2, segmentHeight);
        }
    }
}

// Draw paddle function
function drawPaddle(x, y) {
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

// Draw ball function
function drawBall(x, y) {
    ctx.fillStyle = BALL_COLOR;
    ctx.beginPath();
    ctx.arc(x + BALL_SIZE/2, y + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
}

// Reset ball function
function resetBall(startMoving = false, isFirstStart = false) {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballSpeedX = 0;
    ballSpeedY = 0;
    
    if (startMoving) {
        if (isFirstStart) {
            // Immediate start for first game
            startBallMovement();
        } else {
            // 1 second delay between points
            setTimeout(startBallMovement, 1000);
        }
    }
}

// Function to start ball movement
function startBallMovement() {
    if (!gameOver) {
        // Random initial direction
        ballSpeedX = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = INITIAL_BALL_SPEED * (Math.random() * 2 - 1); // Random Y velocity
    }
}

// Initialize event listeners and start game loop
initializeEventListeners();
gameLoop();