const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const tileSize = 20;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

let pacman = {
    x: tileSize * 2,
    y: tileSize * 2,
    dx: 0,
    dy: 0,
    radius: tileSize / 2,
    angle: 0
};

let ghost = {
    x: tileSize * (cols - 3),
    y: tileSize * (rows - 3),
    dx: -tileSize / 8,
    dy: 0,
    radius: tileSize / 2
};

let dots = [];
let walls = [];
let score = 0;
let isPlaying = false;
let animationFrameId;

// 簡單的迷宮牆
const wallLayout = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,1,0,0,0,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function initGame() {
    pacman = { x: tileSize * 2, y: tileSize * 2, dx: 0, dy: 0, radius: tileSize / 2, angle: 0 };
    ghost = { x: tileSize * (cols - 3), y: tileSize * (rows - 3), dx: -tileSize / 8, dy: 0, radius: tileSize / 2 };
    dots = [];
    walls = [];
    score = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (wallLayout[i][j] === 1) {
                walls.push({ x: j * tileSize, y: i * tileSize });
            } else if (Math.random() > 0.9) {
                dots.push({ x: j * tileSize + tileSize / 2, y: i * tileSize + tileSize / 2 });
            }
        }
    }
}

function drawPacman() {
    ctx.beginPath();
    ctx.arc(pacman.x + pacman.radius, pacman.y + pacman.radius, pacman.radius, pacman.angle + 0.2, pacman.angle + 1.8 * Math.PI);
    ctx.lineTo(pacman.x + pacman.radius, pacman.y + pacman.radius);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

function drawGhost() {
    ctx.beginPath();
    ctx.arc(ghost.x + ghost.radius, ghost.y + ghost.radius, ghost.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

function drawDots() {
    ctx.fillStyle = 'white';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

function drawWalls() {
    ctx.fillStyle = 'blue';
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, tileSize, tileSize);
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function collisionCheck(obj, dx, dy) {
    const nextX = obj.x + dx;
    const nextY = obj.y + dy;
    for (let wall of walls) {
        if (nextX + obj.radius > wall.x && nextX - obj.radius < wall.x + tileSize &&
            nextY + obj.radius > wall.y && nextY - obj.radius < wall.y + tileSize) {
            return true;
        }
    }
    return false;
}

function update() {
    if (!isPlaying) return;

    // 更新Pac-Man位置
    if (!collisionCheck(pacman, pacman.dx, pacman.dy)) {
        pacman.x += pacman.dx;
        pacman.y += pacman.dy;
    }

    // 更新鬼魂位置（簡單的追逐邏輯）
    if (!collisionCheck(ghost, ghost.dx, ghost.dy)) {
        ghost.x += ghost.dx;
        ghost.y += ghost.dy;
    }
    if (Math.random() < 0.05) {
        ghost.dx = (pacman.x > ghost.x ? 1 : -1) * tileSize / 8;
        ghost.dy = (pacman.y > ghost.y ? 1 : -1) * tileSize / 8;
    }

    // 邊界檢查
    pacman.x = Math.max(0, Math.min(canvas.width - tileSize, pacman.x));
    pacman.y = Math.max(0, Math.min(canvas.height - tileSize, pacman.y));
    ghost.x = Math.max(0, Math.min(canvas.width - tileSize, ghost.x));
    ghost.y = Math.max(0, Math.min(canvas.height - tileSize, ghost.y));

    // 吃點並計分
    dots.forEach((dot, index) => {
        const dist = Math.hypot(pacman.x + pacman.radius - dot.x, pacman.y + pacman.radius - dot.y);
        if (dist < pacman.radius + 2) {
            dots.splice(index, 1);
            score += 10;
        }
    });

    // 檢查與鬼魂碰撞
    if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < pacman.radius + ghost.radius) {
        isPlaying = false;
        alert(`Game Over! Score: ${score}`);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWalls();
    drawDots();
    drawPacman();
    drawGhost();
    drawScore();
    update();
    if (isPlaying) {
        animationFrameId = requestAnimationFrame(animate);
    }
}

document.addEventListener('keydown', (e) => {
    if (!isPlaying) return;
    switch (e.key) {
        case 'ArrowUp':
            if (!collisionCheck(pacman, 0, -tileSize / 8)) pacman.dy = -tileSize / 8;
            pacman.dx = 0;
            pacman.angle = 1.5 * Math.PI;
            break;
        case 'ArrowDown':
            if (!collisionCheck(pacman, 0, tileSize / 8)) pacman.dy = tileSize / 8;
            pacman.dx = 0;
            pacman.angle = 0.5 * Math.PI;
            break;
        case 'ArrowLeft':
            if (!collisionCheck(pacman, -tileSize / 8, 0)) pacman.dx = -tileSize / 8;
            pacman.dy = 0;
            pacman.angle = Math.PI;
            break;
        case 'ArrowRight':
            if (!collisionCheck(pacman, tileSize / 8, 0)) pacman.dx = tileSize / 8;
            pacman.dy = 0;
            pacman.angle = 0;
            break;
    }
});

startBtn.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        animate();
        startBtn.textContent = 'Game Started';
        startBtn.disabled = true;
    }
});

pauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        animate();
        pauseBtn.textContent = 'Pause';
    } else {
        cancelAnimationFrame(animationFrameId);
        pauseBtn.textContent = 'Resume';
    }
});

resetBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationFrameId);
    isPlaying = false;
    initGame();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWalls();
    drawDots();
    drawPacman();
    drawGhost();
    drawScore();
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
});

// 初始化遊戲
initGame();
drawWalls();
drawDots();
drawPacman();
drawGhost();
drawScore();