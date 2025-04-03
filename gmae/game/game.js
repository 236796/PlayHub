class Snake {
    constructor() {
        this.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    move() {
        this.direction = this.nextDirection;
        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        this.body.unshift(head);
        return this.body.pop();
    }

    grow() {
        const tail = this.body[this.body.length - 1];
        this.body.push({ ...tail });
    }

    setDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        if (opposites[this.direction] !== direction) {
            this.nextDirection = direction;
        }
    }

    checkCollision() {
        const head = this.body[0];
        // 檢查是否撞牆
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            return true;
        }
        // 檢查是否撞到自己
        return this.body.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.snake = new Snake();
        this.food = this.createFood();
        this.score = 0;
        this.gameLoop = null;
        this.gridSize = 20;
        this.cellSize = this.canvas.width / this.gridSize;

        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.gameLoop) {
                this.stop();
            } else {
                this.start();
            }
        });
    }

    createFood() {
        const food = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };

        // 确保食物不会出现在蛇身上
        while (this.snake.body.some(segment => 
            segment.x === food.x && segment.y === food.y
        )) {
            food.x = Math.floor(Math.random() * this.gridSize);
            food.y = Math.floor(Math.random() * this.gridSize);
        }

        return food;
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right',
            'W': 'up',
            'S': 'down',
            'A': 'left',
            'D': 'right'
        };

        if (keyMap[event.key]) {
            event.preventDefault();
            this.snake.setDirection(keyMap[event.key]);
        }
    }

    update() {
        const tail = this.snake.move();

        // 检查是否吃到食物
        if (this.snake.body[0].x === this.food.x && 
            this.snake.body[0].y === this.food.y) {
            this.snake.grow();
            this.food = this.createFood();
            this.score += 10;
            document.getElementById('score').textContent = `Score: ${this.score}`;
        }

        // 检查碰撞
        if (this.snake.checkCollision()) {
            this.stop();
            alert(`Game Over! Final Score: ${this.score}`);
            return;
        }

        this.draw();
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = '#4CAF50';
        this.snake.body.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });

        // 绘制食物
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(
            this.food.x * this.cellSize,
            this.food.y * this.cellSize,
            this.cellSize - 1,
            this.cellSize - 1
        );
    }

    start() {
        if (!this.gameLoop) {
            this.score = 0;
            document.getElementById('score').textContent = 'Score: 0';
            this.snake = new Snake();
            this.food = this.createFood();
            document.getElementById('start-btn').textContent = 'Stop';
            this.gameLoop = setInterval(() => this.update(), 150);
        }
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            document.getElementById('start-btn').textContent = 'Start Game';
        }
    }
}

// 初始化游戏
window.onload = () => new Game();