// 坦克大戰遊戲邏輯
class TankBattle {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲參數
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.gridSize = 40; // 網格大小
        this.tankSize = 30; // 坦克大小
        
        // 玩家坦克
        this.tanks = [
            {
                x: 60,
                y: this.height - 60,
                direction: 0, // 0: 上, 1: 右, 2: 下, 3: 左
                speed: 3,
                color: '#FF0000',
                bullets: [],
                bulletSpeed: 5,
                bulletCooldown: 0,
                score: 0,
                lives: 3
            },
            {
                x: this.width - 60,
                y: 60,
                direction: 2, // 0: 上, 1: 右, 2: 下, 3: 左
                speed: 3,
                color: '#0000FF',
                bullets: [],
                bulletSpeed: 5,
                bulletCooldown: 0,
                score: 0,
                lives: 3
            }
        ];
        
        // 障礙物
        this.obstacles = [];
        
        // 遊戲狀態
        this.gameOver = false;
        this.winner = null;
        this.paused = false;
        this.gameLoop = null;
        
        // 控制參數
        this.keyState = {};
        
        // 初始化障礙物
        this.initObstacles();
        
        // 綁定按鍵事件
        document.addEventListener('keydown', this.keyDownHandler.bind(this));
        document.addEventListener('keyup', this.keyUpHandler.bind(this));
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.gameLoop) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    // 初始化障礙物
    initObstacles() {
        this.obstacles = [];
        
        // 中央障礙物
        this.obstacles.push({
            x: this.width / 2 - 20,
            y: this.height / 2 - 20,
            width: 40,
            height: 40,
            color: '#888888'
        });
        
        // 四個角落的障礙物
        this.obstacles.push({
            x: 100,
            y: 100,
            width: 40,
            height: 40,
            color: '#888888'
        });
        
        this.obstacles.push({
            x: this.width - 140,
            y: 100,
            width: 40,
            height: 40,
            color: '#888888'
        });
        
        this.obstacles.push({
            x: 100,
            y: this.height - 140,
            width: 40,
            height: 40,
            color: '#888888'
        });
        
        this.obstacles.push({
            x: this.width - 140,
            y: this.height - 140,
            width: 40,
            height: 40,
            color: '#888888'
        });
        
        // 添加一些隨機障礙物
        for (let i = 0; i < 5; i++) {
            let validPosition = false;
            let obstacleX, obstacleY;
            
            // 確保障礙物不會與坦克初始位置重疊
            while (!validPosition) {
                obstacleX = Math.floor(Math.random() * (this.width - 80)) + 40;
                obstacleY = Math.floor(Math.random() * (this.height - 80)) + 40;
                
                // 檢查是否與坦克或其他障礙物重疊
                let overlap = false;
                
                // 檢查與坦克的距離
                for (const tank of this.tanks) {
                    const dx = obstacleX - tank.x;
                    const dy = obstacleY - tank.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80) { // 保持一定距離
                        overlap = true;
                        break;
                    }
                }
                
                // 檢查與其他障礙物的距離
                if (!overlap) {
                    for (const obstacle of this.obstacles) {
                        if (obstacleX < obstacle.x + obstacle.width + 20 &&
                            obstacleX + 40 > obstacle.x - 20 &&
                            obstacleY < obstacle.y + obstacle.height + 20 &&
                            obstacleY + 40 > obstacle.y - 20) {
                            overlap = true;
                            break;
                        }
                    }
                }
                
                if (!overlap) {
                    validPosition = true;
                }
            }
            
            this.obstacles.push({
                x: obstacleX,
                y: obstacleY,
                width: 40,
                height: 40,
                color: '#888888'
            });
        }
    }
    
    // 按鍵按下處理
    keyDownHandler(e) {
        this.keyState[e.key] = true;
        
        // 暫停遊戲
        if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
        }
        
        // 射擊 - 玩家1
        if ((e.key === 'f' || e.key === 'F' || e.key === ' ') && !this.gameOver && !this.paused && this.gameLoop) {
            this.shoot(0);
        }
        
        // 射擊 - 玩家2
        if ((e.key === 'Enter' || e.key === 'l' || e.key === 'L') && !this.gameOver && !this.paused && this.gameLoop) {
            this.shoot(1);
        }
    }
    
    // 按鍵釋放處理
    keyUpHandler(e) {
        this.keyState[e.key] = false;
    }
    
    // 射擊
    shoot(playerIndex) {
        const tank = this.tanks[playerIndex];
        
        // 檢查冷卻時間
        if (tank.bulletCooldown > 0) return;
        
        // 設置冷卻時間
        tank.bulletCooldown = 30; // 約0.5秒
        
        // 計算子彈初始位置
        let bulletX = tank.x;
        let bulletY = tank.y;
        let bulletDX = 0;
        let bulletDY = 0;
        
        // 根據坦克方向設置子彈位置和速度
        switch (tank.direction) {
            case 0: // 上
                bulletX += this.tankSize / 2;
                bulletY -= 5;
                bulletDY = -tank.bulletSpeed;
                break;
            case 1: // 右
                bulletX += this.tankSize + 5;
                bulletY += this.tankSize / 2;
                bulletDX = tank.bulletSpeed;
                break;
            case 2: // 下
                bulletX += this.tankSize / 2;
                bulletY += this.tankSize + 5;
                bulletDY = tank.bulletSpeed;
                break;
            case 3: // 左
                bulletX -= 5;
                bulletY += this.tankSize / 2;
                bulletDX = -tank.bulletSpeed;
                break;
        }
        
        // 添加子彈
        tank.bullets.push({
            x: bulletX,
            y: bulletY,
            dx: bulletDX,
            dy: bulletDY,
            width: 5,
            height: 5,
            color: tank.color
        });
    }
    
    // 更新坦克位置
    updateTanks() {
        // 玩家1控制
        if (this.keyState['w'] || this.keyState['W']) {
            this.tanks[0].direction = 0;
            this.moveTank(0);
        } else if (this.keyState['d'] || this.keyState['D']) {
            this.tanks[0].direction = 1;
            this.moveTank(0);
        } else if (this.keyState['s'] || this.keyState['S']) {
            this.tanks[0].direction = 2;
            this.moveTank(0);
        } else if (this.keyState['a'] || this.keyState['A']) {
            this.tanks[0].direction = 3;
            this.moveTank(0);
        }
        
        // 玩家2控制
        if (this.keyState['ArrowUp']) {
            this.tanks[1].direction = 0;
            this.moveTank(1);
        } else if (this.keyState['ArrowRight']) {
            this.tanks[1].direction = 1;
            this.moveTank(1);
        } else if (this.keyState['ArrowDown']) {
            this.tanks[1].direction = 2;
            this.moveTank(1);
        } else if (this.keyState['ArrowLeft']) {
            this.tanks[1].direction = 3;
            this.moveTank(1);
        }
        
        // 更新子彈冷卻時間
        for (const tank of this.tanks) {
            if (tank.bulletCooldown > 0) {
                tank.bulletCooldown--;
            }
        }
    }
    
    // 移動坦克
    moveTank(playerIndex) {
        const tank = this.tanks[playerIndex];
        let newX = tank.x;
        let newY = tank.y;
        
        // 根據方向移動
        switch (tank.direction) {
            case 0: // 上
                newY -= tank.speed;
                break;
            case 1: // 右
                newX += tank.speed;
                break;
            case 2: // 下
                newY += tank.speed;
                break;
            case 3: // 左
                newX -= tank.speed;
                break;
        }
        
        // 檢查邊界碰撞
        if (newX < 0) newX = 0;
        if (newX > this.width - this.tankSize) newX = this.width - this.tankSize;
        if (newY < 0) newY = 0;
        if (newY > this.height - this.tankSize) newY = this.height - this.tankSize;
        
        // 檢查與障礙物的碰撞
        let collision = false;
        for (const obstacle of this.obstacles) {
            if (newX < obstacle.x + obstacle.width &&
                newX + this.tankSize > obstacle.x &&
                newY < obstacle.y + obstacle.height &&
                newY + this.tankSize > obstacle.y) {
                collision = true;
                break;
            }
        }
        
        // 檢查與其他坦克的碰撞
        for (let i = 0; i < this.tanks.length; i++) {
            if (i !== playerIndex) {
                const otherTank = this.tanks[i];
                if (newX < otherTank.x + this.tankSize &&
                    newX + this.tankSize > otherTank.x &&
                    newY < otherTank.y + this.tankSize &&
                    newY + this.tankSize > otherTank.y) {
                    collision = true;
                    break;
                }
            }
        }
        
        // 如果沒有碰撞，更新位置
        if (!collision) {
            tank.x = newX;
            tank.y = newY;
        }
    }
    
    // 更新子彈位置
    updateBullets() {
        for (let i = 0; i < this.tanks.length; i++) {
            const tank = this.tanks[i];
            
            for (let j = tank.bullets.length - 1; j >= 0; j--) {
                const bullet = tank.bullets[j];
                
                // 移動子彈
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;
                
                // 檢查邊界碰撞
                if (bullet.x < 0 || bullet.x > this.width || bullet.y < 0 || bullet.y > this.height) {
                    tank.bullets.splice(j, 1);
                    continue;
                }
                
                // 檢查與障礙物的碰撞
                let hitObstacle = false;
                for (const obstacle of this.obstacles) {
                    if (bullet.x < obstacle.x + obstacle.width &&
                        bullet.x + bullet.width > obstacle.x &&
                        bullet.y < obstacle.y + obstacle.height &&
                        bullet.y + bullet.height > obstacle.y) {
                        hitObstacle = true;
                        break;
                    }
                }
                
                if (hitObstacle) {
                    tank.bullets.splice(j, 1);
                    continue;
                }
                
                // 檢查與坦克的碰撞
                for (let k = 0; k < this.tanks.length; k++) {
                    if (k !== i) { // 不檢查自己的坦克
                        const targetTank = this.tanks[k];
                        if (bullet.x < targetTank.x + this.tankSize &&
                            bullet.x + bullet.width > targetTank.x &&
                            bullet.y < targetTank.y + this.tankSize &&
                            bullet.y + bullet.height > targetTank.y) {
                            
                            // 命中坦克
                            tank.score += 10;
                            targetTank.lives--;
                            
                            // 更新顯示
                            document.getElementById(`player${i+1}-score`).textContent = `分數: ${tank.score}`;
                            document.getElementById(`player${k+1}-lives`).textContent = `生命: ${targetTank.lives}`;
                            
                            // 檢查遊戲結束
                            if (targetTank.lives <= 0) {
                                this.gameOver = true;
                                this.winner = i;
                                alert(`玩家${i+1}獲勝！`);
                                this.stop();
                            }
                            
                            // 移除子彈
                            tank.bullets.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // 繪製坦克
    drawTank(tank) {
        // 坦克主體
        this.ctx.fillStyle = tank.color;
        this.ctx.fillRect(tank.x, tank.y, this.tankSize, this.tankSize);
        
        // 坦克炮管
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        const centerX = tank.x + this.tankSize / 2;
        const centerY = tank.y + this.tankSize / 2;
        
        switch (tank.direction) {
            case 0: // 上
                this.ctx.moveTo(centerX, centerY);
                this.ctx.lineTo(centerX, tank.y - 10);
                break;
            case 1: // 右
                this.ctx.moveTo(centerX, centerY);
                this.ctx.lineTo(tank.x + this.tankSize + 10, centerY);
                break;
            case 2: // 下
                this.ctx.moveTo(centerX, centerY);
                this.ctx.lineTo(centerX, tank.y + this.tankSize + 10);
                break;
            case 3: // 左
                this.ctx.moveTo(centerX, centerY);
                this.ctx.lineTo(tank.x - 10, centerY);
                break;
        }
        
        this.ctx.stroke();
    }
    
    // 繪製遊戲
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製障礙物
        for (const obstacle of this.obstacles) {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // 繪製坦克
        for (const tank of this.tanks) {
            this.drawTank(tank);
        }
        
        // 繪製子彈
        for (const tank of this.tanks) {
            for (const bullet of tank.bullets) {
                this.ctx.fillStyle = bullet.color;
                this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        }
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
        
        // 更新坦克位置
        this.updateTanks();
        
        // 更新子彈位置
        this.updateBullets();
        
        // 繪製遊戲
        this.draw();
        
        // 繼續遊戲循環
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }
    
    // 開始遊戲
    start() {
        if (this.gameLoop) return;
        
        // 重置遊戲狀態
        this.gameOver = false;
        this.winner = null;
        this.paused = false;
        
        // 重置坦克
        this.tanks[0].x = 60;
        this.tanks[0].y = this.height - 60;
        this.tanks[0].direction = 0;
        this.tanks[0].bullets = [];
        this.tanks[0].score = 0;
        this.tanks[0].lives = 3;
        
        this.tanks[1].x = this.width - 60;
        this.tanks[1].y = 60;
        this.tanks[1].direction = 2;
        this.tanks[1].bullets = [];
        this.tanks[1].score = 0;
        this.tanks[1].lives = 3;
        
        // 初始化障礙物
        this.initObstacles();
        
        // 更新顯示
        document.getElementById('player1-score').textContent = `分數: 0`;
        document.getElementById('player1-lives').textContent = `生命: 3`;
        document.getElementById('player2-score').textContent = `分數: 0`;
        document.getElementById('player2-lives').textContent = `生命: 3`;
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
window.onload = () => new TankBattle();