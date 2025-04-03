// 打磚塊遊戲邏輯
class Breakout {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲參數
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.paddleX = (this.width - this.paddleWidth) / 2;
        this.ballRadius = 10;
        this.ballX = this.width / 2;
        this.ballY = this.height - 30;
        this.ballDX = 4;
        this.ballDY = -4;
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 60;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 30;
        
        // 控制參數
        this.rightPressed = false;
        this.leftPressed = false;
        
        // 遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        
        // 初始化磚塊
        this.bricks = [];
        this.initBricks();
        
        // 綁定按鍵事件
        document.addEventListener('keydown', this.keyDownHandler.bind(this));
        document.addEventListener('keyup', this.keyUpHandler.bind(this));
        document.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.gameLoop) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    // 初始化磚塊
    initBricks() {
        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                // 設置不同顏色的磚塊
                let color;
                switch(r) {
                    case 0: color = '#FF0000'; break; // 紅色
                    case 1: color = '#FF7F00'; break; // 橙色
                    case 2: color = '#FFFF00'; break; // 黃色
                    case 3: color = '#00FF00'; break; // 綠色
                    case 4: color = '#0000FF'; break; // 藍色
                    default: color = '#FFFFFF'; // 白色
                }
                
                this.bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: 1, // 1=存在，0=被擊中
                    color: color
                };
            }
        }
    }
    
    // 按鍵按下處理
    keyDownHandler(e) {
        if (this.gameOver || this.paused || !this.gameLoop) return;
        
        if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.leftPressed = true;
        } else if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
        }
    }
    
    // 按鍵釋放處理
    keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.leftPressed = false;
        }
    }
    
    // 滑鼠移動處理
    mouseMoveHandler(e) {
        if (this.gameOver || this.paused || !this.gameLoop) return;
        
        const relativeX = e.clientX - this.canvas.offsetLeft;
        if (relativeX > 0 && relativeX < this.width) {
            this.paddleX = relativeX - this.paddleWidth / 2;
            
            // 確保平台不超出畫布
            if (this.paddleX < 0) {
                this.paddleX = 0;
            } else if (this.paddleX + this.paddleWidth > this.width) {
                this.paddleX = this.width - this.paddleWidth;
            }
        }
    }
    
    // 碰撞檢測
    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    if (this.ballX > brick.x && 
                        this.ballX < brick.x + this.brickWidth && 
                        this.ballY > brick.y && 
                        this.ballY < brick.y + this.brickHeight) {
                        this.ballDY = -this.ballDY;
                        brick.status = 0;
                        this.score++;
                        document.getElementById('score').textContent = `分數: ${this.score}`;
                        
                        // 檢查是否所有磚塊都被擊中
                        if (this.score === this.brickRowCount * this.brickColumnCount) {
                            alert('恭喜你贏了！');
                            this.stop();
                            this.gameOver = true;
                        }
                    }
                }
            }
        }
    }
    
    // 繪製球
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    // 繪製平台
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddleX, this.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
        this.ctx.fillStyle = '#0095DD';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    // 繪製磚塊
    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    
                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = this.bricks[c][r].color;
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.closePath();
                }
            }
        }
    }
    
    // 繪製分數
    drawScore() {
        document.getElementById('score').textContent = `分數: ${this.score}`;
    }
    
    // 繪製生命值
    drawLives() {
        document.getElementById('lives').textContent = `生命: ${this.lives}`;
    }
    
    // 切換暫停
    togglePause() {
        if (this.paused) {
            this.paused = false;
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
            document.getElementById('start-btn').textContent = '暫停遊戲';
        } else {
            this.paused = true;
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
            document.getElementById('start-btn').textContent = '繼續遊戲';
        }
    }
    
    // 更新遊戲狀態
    update() {
        if (this.gameOver || this.paused) return;
        
        // 清空畫布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 繪製遊戲元素
        this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        
        // 碰撞檢測
        this.collisionDetection();
        
        // 球碰到左右邊界
        if (this.ballX + this.ballDX > this.width - this.ballRadius || this.ballX + this.ballDX < this.ballRadius) {
            this.ballDX = -this.ballDX;
        }
        
        // 球碰到上邊界
        if (this.ballY + this.ballDY < this.ballRadius) {
            this.ballDY = -this.ballDY;
        } 
        // 球碰到下邊界
        else if (this.ballY + this.ballDY > this.height - this.ballRadius) {
            // 球碰到平台
            if (this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) {
                // 根據球擊中平台的位置改變反彈角度
                const hitPos = (this.ballX - this.paddleX) / this.paddleWidth; // 0-1之間的值
                const angle = hitPos * Math.PI - Math.PI/2; // -π/2到π/2之間的角度
                const speed = Math.sqrt(this.ballDX * this.ballDX + this.ballDY * this.ballDY);
                
                this.ballDX = speed * Math.cos(angle);
                this.ballDY = -speed * Math.sin(angle);
            } else {
                // 失去一條生命
                this.lives--;
                document.getElementById('lives').textContent = `生命: ${this.lives}`;
                
                if (this.lives <= 0) {
                    alert('遊戲結束！');
                    this.gameOver = true;
                    this.stop();
                    return;
                } else {
                    // 重置球和平台位置
                    this.ballX = this.width / 2;
                    this.ballY = this.height - 30;
                    this.ballDX = 4;
                    this.ballDY = -4;
                    this.paddleX = (this.width - this.paddleWidth) / 2;
                }
            }
        }
        
        // 移動平台
        if (this.rightPressed && this.paddleX < this.width - this.paddleWidth) {
            this.paddleX += 7;
        } else if (this.leftPressed && this.paddleX > 0) {
            this.paddleX -= 7;
        }
        
        // 移動球
        this.ballX += this.ballDX;
        this.ballY += this.ballDY;
        
        // 繼續遊戲循環
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }
    
    // 開始遊戲
    start() {
        if (this.gameLoop) return;
        
        // 重置遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.paused = false;
        this.ballX = this.width / 2;
        this.ballY = this.height - 30;
        this.ballDX = 4;
        this.ballDY = -4;
        this.paddleX = (this.width - this.paddleWidth) / 2;
        
        // 初始化磚塊
        this.initBricks();
        
        // 更新顯示
        document.getElementById('score').textContent = `分數: 0`;
        document.getElementById('lives').textContent = `生命: 3`;
        document.getElementById('start-btn').textContent = '暫停遊戲';
        
        // 開始遊戲循環
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }
    
    // 停止遊戲
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
            document.getElementById('start-btn').textContent = '開始遊戲';
        }
    }
}

// 初始化遊戲
window.onload = () => new Breakout();