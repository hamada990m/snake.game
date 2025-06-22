import {
    Snake_speed as BASE_SNAKE_SPEED,
    update as updateSnake,
    getSnakeHead,
    snakeIntersection,
    getSnakeBody
} from "./snake.js";
import { update as updateFood, getFoodPosition, getScore, resetScore } from "./food.js";
import { outsideGrid } from "./grid.js";

let lastRenderTime = 0;
let gameOver = false;
let gameStarted = false;
let paused = false;
let level = 1;
let mission = { apples: 5, description: "Eat 5 apples!", completed: false };
let applesEatenThisLevel = 0;
let snakeSpeed = BASE_SNAKE_SPEED;

const scoreDisplay = document.getElementById("score-display");
const levelDisplay = document.getElementById("level-display");
const missionDisplay = document.getElementById("mission-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const mobileControls = document.querySelector('.mobile-controls');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 21;
let boardPx = 0;
let cellPx = 0;

const eatSound = document.getElementById('eat-sound');
const levelupSound = document.getElementById('levelup-sound');
const gameoverSound = document.getElementById('gameover-sound');

function resizeCanvas() {
    // Responsive square canvas
    const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.7, 600);
    canvas.width = size;
    canvas.height = size;
    boardPx = size;
    cellPx = size / GRID_SIZE;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function main(currentTime) {
    if (!gameStarted || paused) return;
    if (gameOver) {
        if (gameoverSound) gameoverSound.currentTime = 0, gameoverSound.play();
        Swal.fire({
            title: 'Game Over',
            text: `Your score: ${getScore()}`,
            icon: 'error',
            confirmButtonText: 'Restart',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            restartGame();
        });
        return;
    }
    window.requestAnimationFrame(main);
    const secondsSincelastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSincelastRender < 1 / snakeSpeed) {
        draw();
        return;
    }
    lastRenderTime = currentTime;
    update();
    draw();
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    paused = false;
    resetScore && resetScore();
    lastRenderTime = 0;
    applesEatenThisLevel = 0;
    level = 1;
    mission = { apples: 5, description: "Eat 5 apples!", completed: false };
    snakeSpeed = BASE_SNAKE_SPEED;
    updateLevelMissionUI();
    window.requestAnimationFrame(main);
    startBtn.style.display = 'none';
}

function restartGame() {
    window.location.reload();
}

function update() {
    const prevScore = getScore();
    updateSnake();
    updateFood();
    checkDeath();
    updateScoreDisplay();
    // Check if apple was eaten
    if (getScore() > prevScore) {
        applesEatenThisLevel++;
        if (eatSound) eatSound.currentTime = 0, eatSound.play();
        checkMission();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawSnake();
    drawFood();
}

function drawBoard() {
    // Optional: draw faint grid lines for realism
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellPx, 0);
        ctx.lineTo(i * cellPx, boardPx);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellPx);
        ctx.lineTo(boardPx, i * cellPx);
        ctx.stroke();
    }
    ctx.restore();
}

function drawSnake() {
    const snake = getSnakeBody();
    ctx.save();
    for (let i = snake.length - 1; i >= 0; i--) {
        const seg = snake[i];
        const px = (seg.x - 0.5) * cellPx;
        const py = (seg.y - 0.5) * cellPx;
        let radius = cellPx * 0.45;
        if (i === 0) {
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            let grad = ctx.createRadialGradient(px, py, radius * 0.3, px, py, radius);
            grad.addColorStop(0, '#fffbe2');
            grad.addColorStop(1, '#fab95b');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px - radius * 0.3, py - radius * 0.2, radius * 0.18, 0, Math.PI * 2);
            ctx.arc(px + radius * 0.3, py - radius * 0.2, radius * 0.18, 0, Math.PI * 2);
            ctx.fillStyle = '#222';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px, py + radius * 0.7);
            ctx.lineTo(px, py + radius * 1.2);
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            let grad = ctx.createRadialGradient(px, py, radius * 0.3, px, py, radius);
            grad.addColorStop(0, '#fab95b');
            grad.addColorStop(1, '#e8e2db');
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawFood() {
    const food = getFoodPosition && getFoodPosition();
    if (!food) return;
    const px = (food.x - 0.5) * cellPx;
    const py = (food.y - 0.5) * cellPx;
    const radius = cellPx * 0.38;
    ctx.save();
    // Apple
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    let grad = ctx.createRadialGradient(px, py, radius * 0.3, px, py, radius);
    grad.addColorStop(0, '#fffbe2');
    grad.addColorStop(1, '#e74c3c');
    ctx.fillStyle = grad;
    ctx.fill();
    // Apple shine
    ctx.beginPath();
    ctx.arc(px - radius * 0.3, py - radius * 0.3, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
    ctx.restore();
}

function checkDeath() {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
}

function updateScoreDisplay() {
    if (getScore) {
        scoreDisplay.textContent = `Score: ${getScore()}`;
    }
}

function updateLevelMissionUI() {
    levelDisplay.textContent = `Level: ${level}`;
    missionDisplay.textContent = `Mission: ${mission.description}`;
}

function checkMission() {
    if (!mission.completed && applesEatenThisLevel >= mission.apples) {
        mission.completed = true;
        if (levelupSound) levelupSound.currentTime = 0, levelupSound.play();
        Swal.fire({
            title: `Level ${level} Complete!`,
            text: 'Get ready for the next challenge!',
            icon: 'success',
            confirmButtonText: 'Next Level',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            nextLevel();
        });
    }
}

function nextLevel() {
    level++;
    applesEatenThisLevel = 0;
    mission = {
        apples: 5 + level * 2,
        description: `Eat ${5 + level * 2} apples!`,
        completed: false
    };
    snakeSpeed += 1; // Increase speed for challenge
    updateLevelMissionUI();
}

// Pause/Resume logic
function togglePause() {
    if (!gameStarted || gameOver) return;
    paused = !paused;
    if (!paused) {
        window.requestAnimationFrame(main);
    }
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
}

pauseBtn.addEventListener('click', togglePause);

// Mobile controls
function setMobileControls() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    if (!upBtn || !downBtn || !leftBtn || !rightBtn) return;
    upBtn.addEventListener('click', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })));
    downBtn.addEventListener('click', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })));
    leftBtn.addEventListener('click', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })));
    rightBtn.addEventListener('click', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })));
}

// Hide mobile controls on desktop
function handleMobileControlsVisibility() {
    if (window.innerWidth <= 600) {
        mobileControls.style.display = 'flex';
    } else {
        mobileControls.style.display = 'none';
    }
}

window.addEventListener('resize', handleMobileControlsVisibility);
document.addEventListener('DOMContentLoaded', () => {
    handleMobileControlsVisibility();
    setMobileControls();
    startBtn.addEventListener('click', startGame);
    pauseBtn.textContent = 'Pause';
    // Show SweetAlert2 start modal on load
    Swal.fire({
        title: 'Snake Game',
        text: 'Press Start to play! Use arrow keys or on-screen controls.',
        icon: 'info',
        confirmButtonText: 'Start',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        startBtn.style.display = 'inline-block';
    });
    updateLevelMissionUI();
});


















