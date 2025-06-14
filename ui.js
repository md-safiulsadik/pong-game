/**
 * ui.js
 * Handles all rendering and UI drawing for Pong.
 * Imports game state from logic.js and exposes rendering functions for main.js.
 */

// Import game state
import { 
    paddleWidth, paddleHeight, ballSize, playerX, playerY, aiX, aiY, 
    ballX, ballY, playerScore, aiScore, gameStarted, gameOver, 
    isSpeedBoost, particleSystem, ballTrail, scoreFlash, powerUps, 
    playerPowerUp, aiPowerUp, paddleTrails, combos 
} from './logic.js';

let canvas, ctx;

export function initializeRendering(_canvas, _ctx) {
    canvas = _canvas;
    ctx = _ctx;
    console.log('Rendering initialized');
}

// Colors and effects
const COLORS = {
    PADDLE_PLAYER: "#61dafb",
    PADDLE_AI: "#ff6b6b",
    BALL: "#ffffff",
    BACKGROUND: "#282c34"
};

export function drawGame() {
    try {
        if (!ctx) {
            console.error('Context not initialized!');
            return;
        }
        drawBackground();
        drawPowerUps();
        drawPaddles();
        drawBall();
        drawParticles();
        drawScores();
        drawComboCounter();

        if (!gameStarted) {
            drawStartScreen();
        } else if (gameOver) {
            drawGameOverScreen();
        }
    } catch (err) {
        console.error('Error in drawGame:', err);
    }
}

function drawBackground() {
    // Fill background
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPaddles() {
    // Draw player paddle
    ctx.save();
    ctx.shadowColor = COLORS.PADDLE_PLAYER;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.PADDLE_PLAYER;
    ctx.fillRect(playerX, playerY, paddleWidth, paddleHeight);
    ctx.restore();

    // Draw AI paddle
    ctx.save();
    ctx.shadowColor = COLORS.PADDLE_AI;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.PADDLE_AI;
    ctx.fillRect(aiX, aiY, paddleWidth, paddleHeight);
    ctx.restore();
}

function drawBall() {
    ctx.save();
    ctx.shadowColor = COLORS.BALL;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.BALL;
    ctx.beginPath();
    ctx.arc(ballX + ballSize/2, ballY + ballSize/2, ballSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.save();
        ctx.shadowColor = powerUp.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x + 10, powerUp.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawParticles() {
    particleSystem.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawScores() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '48px Orbitron, sans-serif';
    ctx.fillStyle = COLORS.PADDLE_PLAYER;
    ctx.fillText(playerScore.toString(), canvas.width/4, 60);
    ctx.fillStyle = COLORS.PADDLE_AI;
    ctx.fillText(aiScore.toString(), 3*canvas.width/4, 60);
    ctx.restore();
}

function drawComboCounter() {
    if (combos > 1) {
        ctx.save();
        ctx.font = '24px Orbitron, sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(Date.now() / 200) * 0.5})`;
        ctx.textAlign = 'center';
        ctx.fillText(`${combos}x COMBO!`, canvas.width/2, 30);
        ctx.restore();
    }
}

function drawStartScreen() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '64px Orbitron, sans-serif';
    ctx.fillStyle = COLORS.PADDLE_PLAYER;
    ctx.textAlign = 'center';
    ctx.fillText('NEON PONG', canvas.width/2, canvas.height/2 - 40);
    ctx.font = '24px Orbitron, sans-serif';
    ctx.fillText('Click to Start', canvas.width/2, canvas.height/2 + 40);
    ctx.restore();
}

function drawGameOverScreen() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '64px Orbitron, sans-serif';
    ctx.fillStyle = playerScore > aiScore ? COLORS.PADDLE_PLAYER : COLORS.PADDLE_AI;
    ctx.textAlign = 'center';
    ctx.fillText(playerScore > aiScore ? 'YOU WIN!' : 'GAME OVER', canvas.width/2, canvas.height/2 - 40);
    ctx.font = '24px Orbitron, sans-serif';
    ctx.fillText('Click to Restart', canvas.width/2, canvas.height/2 + 40);
    ctx.restore();
}
