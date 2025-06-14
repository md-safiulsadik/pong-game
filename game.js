// Get canvas and context
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game variables
let paddleWidth = 12;
let paddleHeight = 80;
let ballSize = 12;
let playerX = 20;
let playerY = 160;
let aiX, aiY = 160;
let ballX = 350;
let ballY = 200;
let ballSpeedX = 0;
let ballSpeedY = 0;
let playerScore = 0;
let aiScore = 0;
let gameStarted = false;
let gameOver = false;
let isSpeedBoost = false;
let isTouchDevice = 'ontouchstart' in window;

// Sound effects
const hitSound = new Audio('data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YU8GAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBxRt0/r/pVEF/wASg+v9/7176+j//////9t6wo2m1c3vpJyv39ToqWlEQoXi//+7ciUQPp///+2XRA0lYNz//8BqGwk0hP//8ptCCRNr6///2H8kCxp57///0nQbBiJs////2X4iBxVs8v//8qJKDRFPuNjh3Y1LKCxQo8fQ0qN2RUhsnLi9xKuLY1dpf4yQk4t1VE5NYnN8gX9za2BYVVldYWVnZ2NcU0k/PENOWWJoaGVhX2ViYF9hZmpvcXFualllf4lzVUtogqyxd0InQYHN//+5QQAAHof//+2QMQQPWdL//8tpFQYkdv//7ZM2BgpR2///zHEcBx1u9f//5IctBQtT4P//2YQpCRJj6P7/8JtBCwo+ndXg352GcWdfaX6NlZ2ksK61sKyopZ+gnqWstLu9tquknp+lpqaoqauwt7y4saqloJ6en6Cor7e8vLu1rqaioJ+enqClrbO1traxrKaiop+enqClrbO3urm1r6mlop6eoKKnrbO3u7q3sKqkn5ybnqOosLa6urm1rqqloaCfn6KmrbO3urq4sq2no6Cdn6Kkqa+0ubm4s66ppKGfoKKlqrCztri4ta+ppKGfoKGkqK2ytLi4tLCqpaKfoKChpKitsrW3t7Swq6aioKCgoqWqr7S2t7azsKumo6CgoKKmrLG0tre1sq6opaKgoaCjp6ywtLW2trKuqaajn5+goqitsLO1tbSxrqmnpKKhoaKlq6+ys7W1s7CsqKWioqGjpqqusrO0tLKvrKmlpKKio6WprrGztLSyr6yop6SioqOlqa2xs7SzsrCsqaajpKSkpqmssLKzs7KwrKmnpaSkpKaoq6+ys7OysK2qp6akpKSlqKuusLKzs7GurKmonp2jpqywtLW1tLKuq6impKOipKapr7Gzs7OxrqypqKampqaoq66xsrOzsa+sqaemp6enqKqtsbKysrGvrKqop6enp6iqrLCxsrKwrqyqqKinp6ipq62wsLGxsK+sqqmoqKipqqyur7CxsbCurKqpqKioqaqsrrCwsbGvrqyqqainqKmqq66vsLCwr66sqqmpqampqqytr6+wsK+urKqpqamqqqutrq+vr6+urauqqampqqusra6vr6+vrqyrqqmpqaqqrK2ur6+vr66sq6qpqaqqq6ytr6+vr6+urKuqqampqqytr6+vr6+urKupqKipqqyur6+vr6+urKupqKipqqyur7CvsK+urKqpqKipqqyusLCwsK+urKqpqKipqqyusLCwsK+urKqpqKeoqayusLCwsLCurKqop6enqKqtsLCxsLCuq6mnoqKkqKywtLW1tLKuqqelpKSlpqmtsLKzsrGvrKmonp2gpKitsLKzs7KvraqopqWlpaaqra+xsrKyr62rqaenpqaoqq2vsLGxsa+tq6mop6enqKmsrrCwsbCvrKqop6WmqKqtsLGysrGvrauopaOjpKapr7K0tLSyrqunpKKio6Woq6+ys7Ozsa6rqKWjo6Slp6uusrO0s7GtqqilpKSkpaeqrrCys7OxrqyppaOipKWnq66xsrOzsa6sqKWjo6Okpqmtj6q1trexrqmmop+foKKmrLCztbW0sKyopKCfoKGjp6ywtLW2tLGtqaWioKChoqWqr7O1trayr6umnp2en6KmrbK2t7e1saynop6cnZ+jqK+0t7i3s66ppKCen6CjqK2ytbe3tbGspqKfoKChpKmtsrW2trSxrKein5+foaSnrbG0trazsK2opaCfoKCipquusrS1tLKuqqain6CgoaSorLCztLSyrqumop+foKKlqq6xs7S0sq+rp6SgoKGjpqmtsbO0s7Gvq6ikoqKio6WprbCys7OysK2ppqSjpKSlp6qusLKysrCuq6impKSkpaaoq66wsrKysK6rqaempqanqKqtsLCxsbCurKmoqKioqKmrra+wsLGwrqyrqampqampq6yur7CwsK+urKqpqampqqusrq+vr6+vrqyrqqmpqaqqrK2ur6+vr6+urKupqampqqytra+vr6+vrqyrqqmpqaqrra6vr6+vr66sq6qpqamqq6yur6+vr6+urKupqKipqqytr6+vsK+urKqpqKeoqautr6+wsK+urKqpqKeoqautr7CwsLCurKqop6enqKmsrrCwsbCvraupp6Wlpaaoq6+xsrKxr62qp6WkpKWnqq2wsrOysa+sqaekoqOlqKuusrO0s7GtqqilpKSkpaeqrrGys7KwraqnpaSjpKaoq6+xsrKyr6yrqKWkpKSlp6qtsLGysrCuq6ilopqhpq22vL27saWXlpibqsrY0sKukZCbq8bY1ce2ramqr7fCxsK7saysrbK3uru4sq2npqeqr7O2t7ayr6umo6Cenh0AAAAAAAAAAAAACf8A/wkcSLCgwYMIEypcyLAhQgAjSJhYkfBExokXIWq0KGIhx48PSIgcgbGkyZMoU6pcuRLhiI8oTZpcCdMkzJkxWaqMWbOky5s4c+rcyVOnS5EtWzR8SNLhxJ4nKYpEynJizadQo0qdSrWqVYUJFWKVKBRmSpFFHV7FytVr16gyxZ5dy7at27dw4xJkIdRmTo9KpQJNS5WuXKlweezdy7ev37+AAxMkG7IlS6dR975lPLmy5cuYM2vezJkhiaA0a9p0W7m06dOoU6tezbr1Z4sCCRoM6NDx7Nu4c+vezbu374P9KiZc6BBw8ePIkytfzry58+fQC0YAADs=');
const scoreSound = new Audio('data:audio/wav;base64,UklGRrQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YY8DAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBxRt0/r/pVEF/wASg+v9/7176+j//////9t6wo2m1c3vpJyv39ToqWlEQoXi//+7ciUQPp///+2XRA0lYNz//8BqGwk0hP//8ptCCRNr6///2H8kCxp57///0nQbBiJs////2X4iB0InQYHN//+5QQAAHof//+2QMQQPWdL//8tpFQYkdv//7ZM2BgpR2///zHEcBx1u9f//5IctBQtT4P//2YQpCRJj6P7/8JtBCwo+ndXg352GcWdfaX6NlZ2ksK61sKyopZ+gnqWstLu9tquknp+lpqaoqauwt7y4saqloJ6en6Cor7e8vLu1rqaioJ+enqClrbO3urm1r6mlop6eoKKnrbO3u7q3sKqkn5ybnqOosLa6urm1rqqloaCfn6KmrbO3urq4sq2no6Cdn6Kkqa+0ubm4s66ppKGfoKKlqrCztri4ta+ppKGfoKGkqK2ytLi4tLCqpaKfoKChpKitsrW3t7Swq6aioKCgoqWqr7S2t7azsKumo6CgoKKmrLG0tre1sq6opaKgoaCjp6ywtLW2trKuqaajn5+goqitsLO1tbSxrqmnpKKhoaKlq6+ys7W1s7CsqKWioqGjpqqusrO0tLKvrKmlpKKio6WprrGztLSyr6yop6SioqOlqa2xs7SzsrCsqaajpKSkpqmssLKzs7KwrKmnpaSkpKaoq6+ys7OysK2qp6akpKSlqKuusLKzs7GurKmonp2jpqywtLW1tLKuq6impKOipKapr7Gzs7OxrqypqKampqaoq66xsrOzsa+sqaemp6enqKqtsbKysrGvrKqop6enp6iqrLCxsrKwrqyqqKinp6ipq62wsLGxsK+sqqmoqKipqqyur7CxsbCurKqpqKioqaqsrrCwsbGvrqyqqainqKmqq66vsLCwr66sqqmpqampqqytr6+wsK+urKqpqamqqqutrq+vr6+urauqqampqqusra6vr6+vrqyrqqmpqaqqrK2ur6+vr66sq6qpqaqqq6ytr6+vr6+urKuqqampqqytr6+vr6+urKupqKipqqyur6+vr6+urKupqKipqqyur7CvsK+urKqpqKipqqyusLCwsK+urKqpqKipqqyusLCwsK+urKqpqKeoqayusLCwsLCurKqop6enqKqtsLCxsLCuq6mnoqKkqKywtLW1tLKuqqelpKSlpqmtsLKzsrGvrKmonp2gpKitsLKzs7KvraqopqWlpaaqra+xsrKyr62rqaenpqaoqq2vsLGxsa+tq6mop6enqKmsrrCwsbCvrKqop6WmqKqtsLGysrGvrauopaOjpKapr7K0tLSyrqunpKKio6Woq6+ys7Ozsa6rqKWjo6Slp6uusrO0s7GtqqilpKSkpaeqrrCys7OxrqyppaOipKWnq66xsrOzsa6sqKWjo6Okpqmtj6q1trexrqmmop+foKKmrLCztbW0sKyopKCfoKGjp6ywtLW2tLGtqaWioKChoqWqr7O1trayr6umnp2en6KmrbK2t7e1saynop6cnZ+jqK+0t7i3s66ppKCen6CjqK2ytbe3tbGspqKfoKChpKmtsrW2trSxrKein5+foaSnrbG0trazsK2opaCfoKCipquusrS1tLKuqqain6CgoaSorLCztLSyrqumop+foKKlqq6xs7S0sq+rp6SgoKGjpqmtsbO0s7Gvq6ikoqKio6WprbCys7OysK2ppqSjpKSlp6qusLKysrCuq6impKSkpaaoq66wsrKysK6rqaempqanqKqtsLCxsbCurKmoqKioqKmrra+wsLGwrqyrqampqampq6yur7CwsK+urKqpqampqqusrq+vr6+vrqyrqqmpqaqqrK2ur6+vr6+urKupqampqqytra+vr6+vrqyrqqmpqaqrra6vr6+vr66sq6qpqamqq6yur6+vr6+urKupqKipqqytr6+vsK+urKqpqKeoqautr6+wsK+urKqpqKeoqautr7CwsLCurKqop6enqKmsrrCwsbCvraupp6Wlpaaoq6+xsrKxr62qp6WkpKWnqq2wsrOysa+sqaekoqOlqKuusrO0s7GtqqilpKSkpaeqrrGys7KwraqnpaSjpKaoq6+xsrKyr6yrqKWkpKSlp6qtsLGysrCuq6ilopqhpq22vL27saWXlpibqsrY0sKukZCbq8bY1ce2ramqr7fCxsK7saysrbK3uru4sq2npqeqr7O2t7ayr6umo6Cenh0AAAAAAAAAAAAACf8A/wkcSLCgwYMIEypcyLAhQgAjSJhYkfBExokXIWq0KGIhx48PSIgcgbGkyZMoU6pcuRLhiI8oTZpcCdMkzJkxWaqMWbOky5s4c+rcyVOnS5EtWzR8SNLhxJ4nKYpEynJizadQo0qdSrWqVYUJFWKVKBRmSpFFHV7FytVr16gyxZ5dy7at27dw4xJkIdRmTo9KpQJNS5WuXKlweezdy7ev37+AAxMkG7IlS6dR975lPLmy5cuYM2vezJkhiaA0a9p0W7m06dOoU6tezbr1Z4sCCRoM6NDx7Nu4c+vezbu374P9KiZc6BBw8ePIkytfzry58+fQC0YAADs=');

// Animation variables
let colorCycle = 0;
let particleSystem = [];
let ballTrail = [];
let scoreFlash = 0;

// Colors and effects
const PADDLE_COLOR = "#61dafb";
const BALL_COLOR = "#ffffff";
const BG_COLOR = "#282c34";

// Initialize canvas size with responsive sizing
function initCanvas() {
    const container = canvas.parentElement;
    if (!container) return; // Safety check
    
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set canvas size
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Scale game elements based on canvas size
    paddleWidth = Math.max(Math.floor(canvas.width * 0.017), 10);
    paddleHeight = Math.max(Math.floor(canvas.height * 0.2), 60);
    ballSize = Math.max(Math.floor(canvas.width * 0.017), 10);
    playerX = Math.floor(canvas.width * 0.03);
    aiX = canvas.width - playerX - paddleWidth;
    
    // Center paddles and ball vertically
    playerY = (canvas.height - paddleHeight) / 2;
    aiY = playerY;
    ballX = canvas.width / 2 - ballSize / 2;
    ballY = canvas.height / 2 - ballSize / 2;
    
    // Ensure context is available
    if (ctx) {
        ctx.imageSmoothingEnabled = false; // Crisp rendering
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    initCanvas();
});

// Particle system
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 6;
        this.speedY = (Math.random() - 0.5) * 6;
        this.life = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
        this.size = Math.max(0, this.size - 0.1);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Draw functions with modern effects
function drawBackground() {
    colorCycle = (colorCycle + 0.5) % 360;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${colorCycle}, 50%, 15%)`);
    gradient.addColorStop(1, `hsl(${(colorCycle + 60) % 360}, 50%, 20%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle(x, y, color) {
    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    
    // Main paddle
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
    
    // Highlight effect
    const gradient = ctx.createLinearGradient(x, y, x + paddleWidth, y);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
    
    ctx.shadowBlur = 0;
}

function drawBall() {
    // Enhanced ball trail with color cycling and speed-based length
    const trailLength = isSpeedBoost ? 8 : 5;
    ballTrail.unshift({ x: ballX, y: ballY });
    if (ballTrail.length > trailLength) ballTrail.pop();
    
    ballTrail.forEach((pos, i) => {
        const ratio = i / trailLength;
        const hue = (colorCycle + i * 30) % 360;
        const alpha = isSpeedBoost ? 0.4 - ratio * 0.4 : 0.3 - ratio * 0.3;
        
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
        const size = ballSize * (1 - ratio * 0.3);
        ctx.arc(pos.x + ballSize/2, pos.y + ballSize/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        if (i === 0) {
            ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Main ball with glow
    ctx.shadowColor = BALL_COLOR;
    ctx.shadowBlur = 15;
    ctx.fillStyle = BALL_COLOR;
    ctx.beginPath();
    ctx.arc(ballX + ballSize/2, ballY + ballSize/2, ballSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function createParticles(x, y, color, amount = 10) {
    for (let i = 0; i < amount; i++) {
        particleSystem.push(new Particle(x, y, color));
    }
}

// Update and draw
function update() {
    if (gameStarted && !gameOver) {
        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        // AI movement with smoothing
        const aiSpeed = 5;
        const aiTarget = ballY - paddleHeight/2 + ballSize/2;
        aiY += (aiTarget - aiY) * 0.1;
        aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));
        
        // Ball collision with top and bottom
        if (ballY < 0 || ballY > canvas.height - ballSize) {
            ballSpeedY = -ballSpeedY;
            createParticles(ballX + ballSize/2, ballY + ballSize/2, BALL_COLOR);
        }
        
        // Ball collision with paddles
        if (ballX < playerX + paddleWidth && 
            ballY + ballSize > playerY && 
            ballY < playerY + paddleHeight) {
            hitSound.play();
            // Speed boost when spacebar is held
            const speedMultiplier = isSpeedBoost ? 1.3 : 1.1;
            ballSpeedX = Math.abs(ballSpeedX) * speedMultiplier;
            ballSpeedY += (ballY - (playerY + paddleHeight/2)) * 0.03;
            
            // More particles during speed boost
            const particleCount = isSpeedBoost ? 15 : 10;
            createParticles(ballX + ballSize, ballY + ballSize/2, PADDLE_COLOR, particleCount);
            
            // Flash effect during speed boost
            if (isSpeedBoost) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        if (ballX + ballSize > aiX && 
            ballY + ballSize > aiY && 
            ballY < aiY + paddleHeight) {
            hitSound.play();
            ballSpeedX = -Math.abs(ballSpeedX) * 1.1;
            ballSpeedY += (ballY - (aiY + paddleHeight/2)) * 0.03;
            createParticles(ballX, ballY + ballSize/2, PADDLE_COLOR);
        }
        
        // Scoring
        if (ballX < 0) {
            aiScore++;
            scoreSound.play();
            scoreFlash = 1;
            // Create a burst of particles
            for(let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createParticles(0, ballY, '#ff6b6b', 10);
                }, i * 100);
            }
            resetBall();
            if (aiScore >= 10) gameOver = true;
        } else if (ballX > canvas.width) {
            playerScore++;
            scoreSound.play();
            scoreFlash = 1;
            // Create a burst of particles
            for(let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createParticles(canvas.width, ballY, '#61dafb', 10);
                }, i * 100);
            }
            resetBall();
            if (playerScore >= 10) gameOver = true;
        }
    }
    
    // Update particles
    particleSystem = particleSystem.filter(p => p.life > 0);
    particleSystem.forEach(p => p.update());
    
    // Update score flash
    if (scoreFlash > 0) scoreFlash -= 0.02;
}

function draw() {
    // Background with color cycling
    drawBackground();
    
    // Draw net
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw game elements
    drawPaddle(playerX, playerY, PADDLE_COLOR);
    drawPaddle(aiX, aiY, '#ff6b6b');
    drawBall();
    
    // Draw particles
    particleSystem.forEach(p => p.draw());
    
    // Draw scores with glow
    ctx.textAlign = 'center';
    ctx.font = '48px Orbitron';
    ctx.shadowColor = PADDLE_COLOR;
    ctx.shadowBlur = 10;
    ctx.fillStyle = scoreFlash > 0 ? `rgba(255, 255, 255, ${scoreFlash})` : PADDLE_COLOR;
    ctx.fillText(playerScore, canvas.width/4, 60);
    ctx.fillStyle = scoreFlash > 0 ? `rgba(255, 255, 255, ${scoreFlash})` : '#ff6b6b';
    ctx.fillText(aiScore, 3*canvas.width/4, 60);
    ctx.shadowBlur = 0;
    
    // Draw start or game over screen
    if (!gameStarted) {
        drawStartScreen();
    } else if (gameOver) {
        drawGameOverScreen();
    }
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title with glow
    ctx.textAlign = 'center';
    ctx.font = '64px Orbitron';
    ctx.shadowColor = PADDLE_COLOR;
    ctx.shadowBlur = 20;
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillText('NEON PONG', canvas.width/2, canvas.height/2 - 40);
    
    // Start text with animation
    ctx.font = '24px Orbitron';
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(Date.now() / 500) * 0.4})`;
    ctx.fillText('Click to Start', canvas.width/2, canvas.height/2 + 40);
    ctx.shadowBlur = 0;
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.textAlign = 'center';
    ctx.font = '64px Orbitron';
    ctx.shadowColor = PADDLE_COLOR;
    ctx.shadowBlur = 20;
    ctx.fillStyle = playerScore > aiScore ? '#61dafb' : '#ff6b6b';
    ctx.fillText(playerScore > aiScore ? 'YOU WIN!' : 'GAME OVER', canvas.width/2, canvas.height/2 - 40);
    
    ctx.font = '24px Orbitron';
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(Date.now() / 500) * 0.4})`;
    ctx.fillText('Click to Restart', canvas.width/2, canvas.height/2 + 40);
    ctx.shadowBlur = 0;
}

function resetBall() {
    ballX = canvas.width/2 - ballSize/2;
    ballY = canvas.height/2 - ballSize/2;
    ballSpeedX = 0;
    ballSpeedY = 0;
    ballTrail = [];
    
    // Immediate start for first game
    if (!gameStarted) {
        ballSpeedX = (Math.random() > 0.5 ? 6 : -6);
        ballSpeedY = (Math.random() * 8 - 4);
        return;
    }
    
    // Short delay for subsequent points
    setTimeout(() => {
        if (!gameOver) {
            ballSpeedX = (Math.random() > 0.5 ? 6 : -6);
            ballSpeedY = (Math.random() * 8 - 4);
        }
    }, 1000);
}

// Controls
function handleMouse(e) {
    if (!isTouchDevice) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const targetY = mouseY - paddleHeight/2;
        playerY += (targetY - playerY) * 0.15; // Smooth movement
        playerY = Math.min(Math.max(playerY, 0), canvas.height - paddleHeight);
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touchY = e.touches[0].clientY - rect.top;
        const targetY = touchY - paddleHeight/2;
        playerY += (targetY - playerY) * 0.2; // Slightly faster for touch
        playerY = Math.min(Math.max(playerY, 0), canvas.height - paddleHeight);
    }
}

function handleKeydown(e) {
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

function handleKeyup(e) {
    if (e.key === ' ') {
        isSpeedBoost = false;
    }
}

function handleClick() {
    if (!gameStarted) {
        gameStarted = true;
        resetBall();
    } else if (gameOver) {
        gameOver = false;
        playerScore = 0;
        aiScore = 0;
        resetBall();
    }
}

// Initialize event listeners
canvas.addEventListener('mousemove', handleMouse);
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);
canvas.addEventListener('click', handleClick);

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
window.addEventListener('load', () => {
    initCanvas();
    // Start game loop
    requestAnimationFrame(gameLoop);
});

// Make sure canvas is initialized if assets take time to load
if (document.readyState === 'complete') {
    initCanvas();
    requestAnimationFrame(gameLoop);
}