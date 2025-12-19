const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

let gameState = 'start';
let score = 0;
let frameCount = 0;

const santa = {
    x: 80,
    y: 250,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.5,
    jump: -8,

    draw() {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 5, this.y - 10, this.width - 10, 10);

        ctx.fillStyle = '#FFE4C4';
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, 15);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 35, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 12, this.y + 12, 4, 4);
        ctx.fillRect(this.x + 24, this.y + 12, 4, 4);
    },

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            gameOver();
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap() {
        this.velocity = this.jump;
    },

    reset() {
        this.y = 250;
        this.velocity = 0;
    }
};

class Chimney {
    constructor(x) {
        this.x = x;
        this.width = 60;
        this.gap = 150;
        this.minHeight = 50;
        this.maxHeight = canvas.height - this.gap - this.minHeight;
        this.topHeight = Math.random() * (this.maxHeight - this.minHeight) + this.minHeight;
        this.bottomY = this.topHeight + this.gap;
        this.speed = 2;
        this.scored = false;
    }

    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);

        ctx.fillStyle = '#A0522D';
        ctx.fillRect(this.x - 5, this.topHeight - 20, this.width + 10, 20);
        ctx.fillRect(this.x - 5, this.bottomY, this.width + 10, 20);

        const brickSize = 10;
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;

        for (let y = 0; y < this.topHeight - 20; y += brickSize) {
            for (let x = this.x; x < this.x + this.width; x += brickSize * 2) {
                ctx.strokeRect(x + (y % (brickSize * 2)), y, brickSize * 2, brickSize);
            }
        }

        for (let y = this.bottomY + 20; y < canvas.height; y += brickSize) {
            for (let x = this.x; x < this.x + this.width; x += brickSize * 2) {
                ctx.strokeRect(x + (y % (brickSize * 2)), y, brickSize * 2, brickSize);
            }
        }
    }

    update() {
        this.x -= this.speed;
    }

    offScreen() {
        return this.x + this.width < 0;
    }

    collidesWith(santa) {
        if (santa.x + santa.width > this.x && santa.x < this.x + this.width) {
            if (santa.y < this.topHeight || santa.y + santa.height > this.bottomY) {
                return true;
            }
        }
        return false;
    }

    passedSanta(santa) {
        if (!this.scored && this.x + this.width < santa.x) {
            this.scored = true;
            return true;
        }
        return false;
    }
}

const chimneys = [];

function spawnChimney() {
    chimneys.push(new Chimney(canvas.width));
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#E0F6FF');
    gradient.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
        const x = (frameCount * 0.5 + i * 50) % canvas.width;
        const y = (i * 37) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    ctx.fillStyle = '#E0E0E0';
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.fillRect(x + (frameCount % 20), canvas.height - 50, 10, 50);
    }
}

function updateGame() {
    frameCount++;

    drawBackground();

    santa.update();

    if (frameCount % 150 === 0) {
        spawnChimney();
    }

    for (let i = chimneys.length - 1; i >= 0; i--) {
        chimneys[i].update();
        chimneys[i].draw();

        if (chimneys[i].collidesWith(santa)) {
            gameOver();
        }

        if (chimneys[i].passedSanta(santa)) {
            score++;
            scoreDisplay.textContent = score;
        }

        if (chimneys[i].offScreen()) {
            chimneys.splice(i, 1);
        }
    }

    drawGround();
    santa.draw();
}

function gameLoop() {
    if (gameState === 'playing') {
        updateGame();
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    frameCount = 0;
    chimneys.length = 0;
    santa.reset();
    scoreDisplay.textContent = score;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    scoreDisplay.classList.remove('hidden');

    gameLoop();
}

function gameOver() {
    if (gameState !== 'playing') return;

    gameState = 'gameOver';
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
    scoreDisplay.classList.add('hidden');
}

canvas.addEventListener('click', () => {
    if (gameState === 'playing') {
        santa.flap();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        santa.flap();
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

drawBackground();
drawGround();
santa.draw();
