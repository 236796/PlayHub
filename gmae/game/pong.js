// Pong 遊戲邏輯
class PongGame {
    constructor() {
        // 獲取DOM元素
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.player1ScoreDisplay = document.getElementById('player1-score');
        this.player2ScoreDisplay = document.getElementById('player2-score');
        
        // 遊戲狀態
        this.isPlaying = false;
        this.player1Score = 0;
        this.player2Score = 0;
        this.winningScore = 10;
        
        // 球拍設置
        this.paddleWidth = 10;
        this.paddleHeight = 80;
        this.paddleSpeed = 8;
        
        this.player1 = {
            x: 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed,
            upPressed: false,
            downPressed: false
        };
        
        this.player2 = {
            x: this.canvas.width - 20 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed,
            upPressed: false,
            downPressed: false
        };
        
        // 球設置
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            speedX: 5,
            speedY: 5,
            maxSpeed: 15
        };
        
        // 中線設置
        this.centerLine = {
            width: 4,
            dashLength: 10,
            gapLength: 10
        };
        
        // 綁定事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.homeBtn.addEventListener('click', () => this.goHome());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 初始化遊戲
        this.draw();
    }
    
    // 開始遊戲
    startGame() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.startBtn.textContent = '暫停遊戲';
            this.gameLoop();
        } else {
            this.isPlaying = false;
            this.startBtn.textContent = '繼續遊戲';
        }
    }
    
    // 重置遊戲
    resetGame() {
        this.isPlaying = false;
        this.startBtn.textContent = '開始遊戲';
        this.player1Score = 0;
        this.player2Score = 0;
        
        // 重置球拍位置
        this.player1.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2.y = this.canvas.height / 2 - this.paddleHeight / 2;
        
        // 重置球位置和速度
        this.resetBall();
        
        // 更新分數顯示
        this.updateScore();
        
        // 繪製初始狀態
        this.draw();
    }
    
    // 重置球
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        // 隨機決定球的初始方向
        this.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
        this.ball.speedY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2);
    }
    
    // 返回主頁
    goHome() {
        window.location.href = 'index.html';
    }
    
    // 處理鍵盤按下
    handleKeyDown(e) {
        switch(e.key) {
            case 'w':
            case 'W':
                this.player1.upPressed = true;
                break;
            case 's':
            case 'S':
                this.player1.downPressed = true;
                break;
            case 'ArrowUp':
                this.player2.upPressed = true;
                break;
            case 'ArrowDown':
                this.player2.downPressed = true;
                break;
        }
    }
    
    // 處理鍵盤釋放
    handleKeyUp(e) {
        switch(e.key) {
            case 'w':
            case 'W':
                this.player1.upPressed = false;
                break;
            case 's':
            case 'S':
                this.player1.downPressed = false;
                break;
            case 'ArrowUp':
                this.player2.upPressed = false;
                break;
            case 'ArrowDown':
                this.player2.downPressed = false;
                break;
        }
    }
    
    // 遊戲主循環
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新遊戲狀態
    update() {
        // 更新球拍位置
        this.updatePaddles();
        
        // 更新球位置
        this.updateBall();
        
        // 檢查碰撞
        this.checkCollisions();
        
        // 檢查得分
        this.checkScore();
    }
    
    // 更新球拍位置
    updatePaddles() {
        // 玩家1球拍
        if (this.player1.upPressed && this.player1.y > 0) {
            this.player1.y -= this.player1.speed;
        }
        if (this.player1.downPressed && this.player1.y + this.player1.height < this.canvas.height) {
            this.player1.y += this.player1.speed;
        }
        
        // 玩家2球拍
        if (this.player2.upPressed && this.player2.y > 0) {
            this.player2.y -= this.player2.speed;
        }
        if (this.player2.downPressed && this.player2.y + this.player2.height < this.canvas.height) {
            this.player2.y += this.player2.speed;
        }
    }
    
    // 更新球位置
    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
    }
    
    // 檢查碰撞
    checkCollisions() {
        // 球與上下邊界碰撞
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.speedY = -this.ball.speedY;
            
            // 確保球不會卡在邊界
            if (this.ball.y - this.ball.radius < 0) {
                this.ball.y = this.ball.radius;
            } else {
                this.ball.y = this.canvas.height - this.ball.radius;
            }
        }
        
        // 球與玩家1球拍碰撞
        if (this.ball.x - this.ball.radius < this.player1.x + this.player1.width &&
            this.ball.x + this.ball.radius > this.player1.x &&
            this.ball.y + this.ball.radius > this.player1.y &&
            this.ball.y - this.ball.radius < this.player1.y + this.player1.height) {
            
            // 計算碰撞點相對於球拍中心的位置（-1到1之間）
            const collidePoint = (this.ball.y - (this.player1.y + this.player1.height / 2)) / (this.player1.height / 2);
            
            // 計算反彈角度（-π/4到π/4之間）
            const angleRad = collidePoint * (Math.PI / 4);
            
            // 計算球的新速度
            const direction = 1; // 向右
            const speed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
            const newSpeed = Math.min(speed + 0.5, this.ball.maxSpeed); // 每次碰撞增加速度
            
            this.ball.speedX = direction * newSpeed * Math.cos(angleRad);
            this.ball.speedY = newSpeed * Math.sin(angleRad);
            
            // 確保球不會卡在球拍內
            this.ball.x = this.player1.x + this.player1.width + this.ball.radius;
        }
        
        // 球與玩家2球拍碰撞
        if (this.ball.x + this.ball.radius > this.player2.x &&
            this.ball.x - this.ball.radius < this.player2.x + this.player2.width &&
            this.ball.y + this.ball.radius > this.player2.y &&
            this.ball.y - this.ball.radius < this.player2.y + this.player2.height) {
            
            // 計算碰撞點相對於球拍中心的位置（-1到1之間）
            const collidePoint = (this.ball.y - (this.player2.y + this.player2.height / 2)) / (this.player2.height / 2);
            
            // 計算反彈角度（-π/4到π/4之間）
            const angleRad = collidePoint * (Math.PI / 4);
            
            // 計算球的新速度
            const direction = -1; // 向左
            const speed = Math.sqrt(this.ball.speedX * this.ball.speedX + this.ball.speedY * this.ball.speedY);
            const newSpeed = Math.min(speed + 0.5, this.ball.maxSpeed); // 每次碰撞增加速度
            
            this.ball.speedX = direction * newSpeed * Math.cos(angleRad);
            this.ball.speedY = newSpeed * Math.sin(angleRad);
            
            // 確保球不會卡在球拍內
            this.ball.x = this.player2.x - this.ball.radius;
        }
    }
    
    // 檢查得分
    checkScore() {
        // 球出左邊界，玩家2得分
        if (this.ball.x - this.ball.radius < 0) {
            this.player2Score++;
            this.updateScore();
            this.resetBall();
            
            // 檢查是否有玩家獲勝
            if (this.player2Score >= this.winningScore) {
                this.gameOver(2);
            }
        }
        
        // 球出右邊界，玩家1得分
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.player1Score++;
            this.updateScore();
            this.resetBall();
            
            // 檢查是否有玩家獲勝
            if (this.player1Score >= this.winningScore) {
                this.gameOver(1);
            }
        }
    }
    
    // 遊戲結束
    gameOver(winner) {
        this.isPlaying = false;
        this.startBtn.textContent = '開始遊戲';
        
        setTimeout(() => {
            alert(`遊戲結束！玩家 ${winner} 獲勝！`);
        }, 100);
    }
    
    // 更新分數顯示
    updateScore() {
        this.player1ScoreDisplay.textContent = `玩家 1: ${this.player1Score}`;
        this.player2ScoreDisplay.textContent = `玩家 2: ${this.player2Score}`;
    }
    
    // 繪製遊戲
    draw() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製背景
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製中線
        this.drawCenterLine();
        
        // 繪製球拍
        this.drawPaddle(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        this.drawPaddle(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
        
        // 繪製球
        this.drawBall();
    }
    
    // 繪製中線
    drawCenterLine() {
        const centerX = this.canvas.width / 2 - this.centerLine.width / 2;
        let y = 0;
        
        this.ctx.fillStyle = '#FFFFFF';
        
        while (y < this.canvas.height) {
            this.ctx.fillRect(centerX, y, this.centerLine.width, this.centerLine.dashLength);
            y += this.centerLine.dashLength + this.centerLine.gapLength;
        }
    }
    
    // 繪製球拍
    drawPaddle(x, y, width, height) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x, y, width, height);
    }
    
    // 繪製球
    drawBall() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});