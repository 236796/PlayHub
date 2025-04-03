// 賽車遊戲邏輯
class RacingGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲參數
        this.roadWidth = 400;
        this.roadHeight = 600;
        this.laneWidth = this.roadWidth / 3;
        this.carWidth = 40;
        this.carHeight = 80;
        this.obstacleWidth = 40;
        this.obstacleHeight = 40;
        
        // 玩家車輛
        this.car = {
            x: this.roadWidth / 2 - this.carWidth / 2,
            y: this.roadHeight - this.carHeight - 20,
            lane: 1 // 0: 左, 1: 中, 2: 右
        };
        
        // 障礙物
        this.obstacles = [];
        this.obstacleSpeed = 5;
        this.obstacleInterval = 1000; // 障礙物生成間隔 (毫秒)
        this.lastObstacleTime = 0;
        
        // 遊戲狀態
        this.score = 0;
        this.speed = 1;
        this.gameOver = false;
        this.gameLoop = null;
        this.animationFrame = null;
        
        // 綁定按鍵事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.gameLoop) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    // 處理按鍵事件
    handleKeyPress(event) {
        if (this.gameOver || !this.gameLoop) return;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.car.lane > 0) {
                    this.car.lane--;
                    this.car.x = (this.car.lane * this.laneWidth) + (this.laneWidth / 2) - (this.carWidth / 2);
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.car.lane < 2) {
                    this.car.lane++;
                    this.car.x = (this.car.lane * this.laneWidth) + (this.laneWidth / 2) - (this.carWidth / 2);
                }
                break;
        }
    }
    
    // 創建障礙物
    createObstacle() {
        const lane = Math.floor(Math.random() * 3); // 隨機車道
        const obstacle = {
            x: (lane * this.laneWidth) + (this.laneWidth / 2) - (this.obstacleWidth / 2),
            y: -this.obstacleHeight,
            lane: lane
        };
        this.obstacles.push(obstacle);
    }
    
    // 更新遊戲狀態
    update(timestamp) {
        if (this.gameOver) return;
        if (!this.gameLoop) return; // 確保遊戲循環存在才更新
        
        // 增加分數
        this.score += this.speed;
        document.getElementById('score').textContent = `分數: ${Math.floor(this.score)}`;
        
        // 每1000分增加速度
        if (Math.floor(this.score / 1000) > this.speed - 1) {
            this.speed = Math.floor(this.score / 1000) + 1;
            this.obstacleSpeed = 5 + (this.speed - 1) * 2;
            document.getElementById('speed').textContent = `速度: ${this.speed}`;
        }
        
        // 創建新障礙物
        if (timestamp - this.lastObstacleTime > this.obstacleInterval / this.speed) {
            this.createObstacle();
            this.lastObstacleTime = timestamp;
        }
        
        // 更新障礙物位置
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].y += this.obstacleSpeed;
            
            // 移除超出畫面的障礙物
            if (this.obstacles[i].y > this.roadHeight) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // 檢查碰撞
            if (this.checkCollision(this.car, this.obstacles[i])) {
                this.gameOver = true;
                this.stop();
                alert(`遊戲結束！最終分數: ${Math.floor(this.score)}`);
                return;
            }
        }
        
        this.draw();
        this.animationFrame = requestAnimationFrame(this.update.bind(this));
    }
    
    // 檢查碰撞
    checkCollision(car, obstacle) {
        return car.x < obstacle.x + this.obstacleWidth &&
               car.x + this.carWidth > obstacle.x &&
               car.y < obstacle.y + this.obstacleHeight &&
               car.y + this.carHeight > obstacle.y;
    }
    
    // 繪製遊戲畫面
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.roadWidth, this.roadHeight);
        
        // 繪製道路標記
        this.ctx.strokeStyle = '#FFF';
        this.ctx.setLineDash([20, 20]); // 虛線
        this.ctx.lineWidth = 2;
        
        // 左車道線
        this.ctx.beginPath();
        this.ctx.moveTo(this.laneWidth, 0);
        this.ctx.lineTo(this.laneWidth, this.roadHeight);
        this.ctx.stroke();
        
        // 右車道線
        this.ctx.beginPath();
        this.ctx.moveTo(this.laneWidth * 2, 0);
        this.ctx.lineTo(this.laneWidth * 2, this.roadHeight);
        this.ctx.stroke();
        
        // 繪製玩家車輛
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.car.x, this.car.y, this.carWidth, this.carHeight);
        
        // 繪製車輛細節
        this.ctx.fillStyle = '#333';
        // 車窗
        this.ctx.fillRect(this.car.x + 5, this.car.y + 5, this.carWidth - 10, this.carHeight / 3);
        // 車輪
        this.ctx.fillRect(this.car.x - 5, this.car.y + 10, 5, 15);
        this.ctx.fillRect(this.car.x - 5, this.car.y + this.carHeight - 25, 5, 15);
        this.ctx.fillRect(this.car.x + this.carWidth, this.car.y + 10, 5, 15);
        this.ctx.fillRect(this.car.x + this.carWidth, this.car.y + this.carHeight - 25, 5, 15);
        
        // 繪製障礙物
        this.ctx.fillStyle = '#FF4444';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, this.obstacleWidth, this.obstacleHeight);
        });
    }
    
    // 開始遊戲
    start() {
        if (this.gameLoop) return;
        
        // 重置遊戲狀態
        this.obstacles = [];
        this.score = 0;
        this.speed = 1;
        this.obstacleSpeed = 5;
        this.gameOver = false;
        this.lastObstacleTime = 0;
        this.car.lane = 1;
        this.car.x = this.roadWidth / 2 - this.carWidth / 2;
        
        // 更新顯示
        document.getElementById('score').textContent = `分數: 0`;
        document.getElementById('speed').textContent = `速度: 1`;
        document.getElementById('start-btn').textContent = '暫停遊戲';
        
        // 開始遊戲循環
        this.animationFrame = requestAnimationFrame(this.update.bind(this));
        this.gameLoop = true;
    }
    
    // 停止遊戲
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.animationFrame);
            this.gameLoop = null;
            document.getElementById('start-btn').textContent = '開始遊戲';
        }
    }
}

// 初始化遊戲
window.onload = () => new RacingGame();