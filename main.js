/**
 * Main entry point for Pong game.
 * Handles initialization, event listeners, and the game loop.
 * Imports game logic and rendering from separate modules.
 */

// Handles all rendering and UI updates for the Pong game
import { 
    updateGame, playerX, playerY, aiX, aiY, gameStarted, gameOver, 
    initGameState, handleMouse, handleTouch, handleKeydown, handleKeyup, 
    handleClick 
} from './logic.js';
import { initializeRendering, drawGame } from './ui.js';

// Initialize game when window loads
window.addEventListener('load', () => {
    // Get canvas and context
    const canvas = document.getElementById('pong');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context!');
        return;
    }

    // Set canvas size if not already set
    if (!canvas.width) canvas.width = 800;
    if (!canvas.height) canvas.height = 600;

    console.log('Initializing game...', { width: canvas.width, height: canvas.height });

    // Initialize game state and rendering
    initGameState(canvas, ctx);
    initializeRendering(canvas, ctx);

    // Named event handler wrappers for clarity
    function onMouseMove(e) { handleMouse(e); }
    function onTouchStart(e) { handleTouch(e); }
    function onTouchMove(e) { handleTouch(e); }
    function onKeyDown(e) { handleKeydown(e); }
    function onKeyUp(e) { handleKeyup(e); }
    function onClick(e) { handleClick(e); }

    // Add event listeners
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onClick);

    // Responsive resizing
    function resizeCanvas() {
        // Set canvas size to fit parent or window
        const container = canvas.parentElement || document.body;
        const width = Math.min(window.innerWidth, 900);
        const height = Math.round(width * 0.75); // 4:3 aspect ratio
        canvas.width = width;
        canvas.height = height;
        initGameState(canvas, ctx);
        initializeRendering(canvas, ctx);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    // Start game loop
    function gameLoop() {
        // Update game state
        updateGame();
        
        // Clear canvas and draw game
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGame();
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    console.log('Starting game loop...');
    gameLoop();
});
