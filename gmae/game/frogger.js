// 青蛙過河遊戲邏輯
class Frogger {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲參數
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.gridSize = 40; // 網格大小
        this.frogWidth = 30;
        this.frogHeight = 30;
        
        // 青蛙位置
        this.frogX = this.width / 2 - this.frogWidth / 2;
        this.frogY = this.height - this.frogHeight - 10;
        this.frogStartX = this.frogX;
        this.frogStartY = this.frogY;
        
        // 車輛和木頭
        this.cars = [];
        this.logs = [];
        
        // 終點區域
        this.goals = [
            {x: 40, y: 40, width: 30, height: 30, reached: false},
            {x: 160, y: 40, width: 30, height: 30, reached: false},
            {x: 280, y: 40, width: 30, height: 30, reached: false},
            {x: 400, y: 40, width: 30, height: 30, reached: false},
            {x: 520, y: 40, width: 30, height: 30, reached: false}
        ];
        
        // 遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        
        // 控制參數
        this.keyState = {};
        this.lastMove = 0;
        this.moveDelay = 100; // 移動延遲，防止連續按鍵移動過快
        
        // 初始化車輛和木頭
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
        // 清空現有障礙物
        this.cars = [];
        this.logs = [];
        
        // 初始化車輛 (在下半部分)
        // 第一行車輛 - 從右到左
        for (let i = 0; i < 3; i++) {
            this.cars.push({
                x: this.width + i * 200,
                y: this.height - 90,
                width: 80,
                height: 30,
                speed: -2 - this.level * 0.5,
                color: '#FF0000'
            });
        }
        
        // 第二行車輛 - 從左到右
        for (let i = 0; i < 2; i++) {
            this.cars.push({
                x: -100 - i * 250,
                y: this.height - 130,
                width: 60,
                height: 30,
                speed: 1.5 + this.level * 0.3,
                color: '#00FF00'
            });
        }
        
        // 第三行車輛 - 從右到左
        for (let i = 0; i < 3; i++) {
            this.cars.push({
                x: this.width + i * 150,
                y: this.height - 170,
                width: 50,
                height: 30,
                speed: -3 - this.level * 0.4,
                color: '#0000FF'
            });
        }
        
        // 初始化木頭 (在上半部分)
        // 第一行木頭 - 從左到右
        for (let i = 0; i < 3; i++) {
            this.logs.push({
                x: -200 - i * 300,
                y: this.height - 250,
                width: 120,
                height: 30,
                speed: 2 + this.level * 0.3,
                color: '#8B4513'
            });
        }
        
        // 第二行木頭 - 從右到左
        for (let i = 0; i < 2; i++) {
            this.logs.push({
                x: this.width + i * 350,
                y: this.height - 290,
                width: 180,
                height: 30,
                speed: -1.5 - this.level * 0.2,
                color: '#A0522D'
            });
        }
        
        // 第三行木頭 - 從左到右
        for (let i = 0; i < 3; i++) {
            this.logs.push({
                x: -150 - i * 250,
                y: this.height - 330,
                width: 100,
                height: 30,
                speed: 2.5 + this.level * 0.4,
                color: '#CD853F'
            });
        }
    }
    
    // 按鍵按下處理
    keyDownHandler(e) {
        if (this.gameOver || this.paused || !this.gameLoop) return;
        
        this.keyState[e.key] = true;
        
        // 暫停遊戲
        if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
            return;
        }
        
        // 移動青蛙
        const now = Date.now();
        if (now - this.lastMove > this.moveDelay) {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.frogY -= this.gridSize;
                if (this.frogY < 0) this.frogY = 0;
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.frogY += this.gridSize;
                if (this.frogY > this.height - this.frogHeight) this.frogY = this.height - this.frogHeight;
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.frogX -= this.gridSize;
                if (this.frogX < 0) this.frogX = 0;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.frogX += this.gridSize;
                if (this.frogX > this.width - this.frogWidth) this.frogX = this.width - this.frogWidth;
            }
            this.lastMove = now;
        }
    }
    
    // 按鍵釋放處理
    keyUpHandler(e) {
        this.keyState[e.key] = false;
    }
    
    // 檢查碰撞
    checkCollisions() {
        // 檢查是否到達終點
        for (let i = 0; i < this.goals.length; i++) {
            const goal = this.goals[i];
            if (!goal.reached && 
                this.frogX < goal.x + goal.width &&
                this.frogX + this.frogWidth > goal.x &&
                this.frogY < goal.y + goal.height &&
                this.frogY + this.frogHeight > goal.y) {
                goal.reached = true;
                this.score += 100;
                this.resetFrog();
                
                // 檢查是否所有終點都已到達
                if (this.goals.every(g => g.reached)) {
                    this.level++;
                    this.score += 1000 * this.level;
                    this.resetLevel();
                }
                
                return;
            }
        }
        
        // 檢查是否在河裡
        if (this.frogY < this.height - 210 && this.frogY > this.height - 370) {
            let onLog = false;
            
            // 檢查是否在木頭上
            for (let i = 0; i < this.logs.length; i++) {
                const log = this.logs[i];
                if (this.frogX < log.x + log.width &&
                    this.frogX + this.frogWidth > log.x &&
                    this.frogY < log.y + log.height &&
                    this.frogY + this.frogHeight > log.y) {
                    // 青蛙在木頭上，跟隨木頭移動
                    this.frogX += log.speed;
                    onLog = true;
                    break;
                }
            }
            
            // 如果不在木頭上且在河裡，則失敗
            if (!onLog) {
                this.loseLife();
                return;
            }
        }
        
        // 檢查是否與車輛碰撞
        for (let i = 0; i < this.cars.length; i++) {
            const car = this.cars[i];
            if (this.frogX < car.x + car.width &&
                this.frogX + this.frogWidth > car.x &&
                this.frogY < car.y + car.height &&
                this.frogY + this.frogHeight > car.y) {
                this.loseLife();
                return;
            }
        }
        
        // 檢查是否超出畫布邊界
        if (this.frogX < 0 || this.frogX + this.frogWidth > this.width) {
            this.loseLife();
        }
    }
    
    // 失去一條生命
    loseLife() {
        this.lives--;
        document.getElementById('lives').textContent = `生命: ${this.lives}`;
        
        if (this.lives <= 0) {
            alert(`遊戲結束！最終分數: ${this.score}`);
            this.gameOver = true;
            this.stop();
        } else {
            this.resetFrog();
        }
    }
    
    // 重置青蛙位置
    resetFrog() {
        this.frogX = this.frogStartX;
        this.frogY = this.frogStartY;
    }
    
    // 重置關卡
    resetLevel() {
        // 重置終點區域
        for (let i = 0; i < this.goals.length; i++) {
            this.goals[i].reached = false;
        }
        
        // 重置青蛙位置
        this.resetFrog();
        
        // 更新障礙物速度
        this.initObstacles();
        
        // 更新顯示
        document.getElementById('level').textContent = `等級: ${this.level}`;
    }
    
    // 更新障礙物位置
    updateObstacles() {
        // 更新車輛位置
        for (let i = 0; i < this.cars.length; i++) {
            const car = this.cars[i];
            car.x += car.speed;
            
            // 如果車輛超出畫布，重置位置
            if (car.speed > 0 && car.x > this.width) {
                car.x = -car.width - Math.random() * 200;
            } else if (car.speed < 0 && car.x + car.width < 0) {
                car.x = this.width + Math.random() * 200;
            }
        }
        
        // 更新木頭位置
        for (let i = 0; i < this.logs.length; i++) {
            const log = this.logs[i];
            log.x += log.speed;
            
            // 如果木頭超出畫布，重置位置
            if (log.speed > 0 && log.x > this.width) {
                log.x = -log.width - Math.random() * 300;
            } else if (log.speed < 0 && log.x + log.width < 0) {
                log.x = this.width + Math.random() * 300;
            }
        }
    }
    
    // 繪製遊戲元素
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製安全區域
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, this.height - 210, this.width, 40); // 中間安全區
        this.ctx.fillRect(0, this.height - 50, this.width, 50); // 起始區
        
        // 繪製河流
        this.ctx.fillStyle = '#0000FF';
        this.ctx.fillRect(0, this.height - 370, this.width, 160);
        
        // 繪製馬路
        this.ctx.fillStyle = '#555555';
        this.ctx.fillRect(0, this.height - 170, this.width, 120);
        
        // 繪製終點區域
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(0, 0, this.width, 80);
        
        // 繪製終點
        for (let i = 0; i < this.goals.length; i++) {
            const goal = this.goals[i];
            if (goal.reached) {
                this.ctx.fillStyle = '#00FFFF';
            } else {
                this.ctx.fillStyle = '#008800';
            }
            this.ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
        }
        
        // 繪製木頭
        for (let i = 0; i < this.logs.length; i++) {
            const log = this.logs[i];
            this.ctx.fillStyle = log.color;
            this.ctx.fillRect(log.x, log.y, log.width, log.height);
        }
        
        // 繪製車輛
        for (let i = 0; i < this.cars.length; i++) {
            const car = this.cars[i];
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.width, car.height);
            
            // 繪製車輛細節
            this.ctx.fillStyle = '#000000';
            if (car.speed > 0) { // 向右行駛的車
                this.ctx.fillRect(car.x + car.width - 10, car.y + 5, 5, car.height - 10);
            } else { // 向左行駛的車
                this.ctx.fillRect(car.x + 5, car.y + 5, 5, car.height - 10);
            }
        }
        
        // 繪製青蛙
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.frogX, this.frogY, this.frogWidth, this.frogHeight);
        
        // 繪製青蛙眼睛
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.frogX + 8, this.frogY + 8, 3, 0, Math.PI * 2);
        this.ctx.arc(this.frogX + this.frogWidth - 8, this.frogY + 8, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 繪製分數和生命
        document.getElementById('score').textContent = `分數: ${this.score}`;
        document.getElementById('lives').textContent = `生命: ${this.lives}`;
        document.getElementById('level').textContent = `等級: ${this.level}`;
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
        
        // 更新障礙物位置
        this.updateObstacles();
        
        // 檢查碰撞
        this.checkCollisions();
        
        // 繪製遊戲
        this.draw();
        
        // 繼續遊戲循環
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }
    
    // 開始遊戲
    start() {
        if (this.gameLoop) return;
        
        // 重置遊戲狀態
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        
        // 重置青蛙位置
        this.resetFrog();
        
        // 重置終點和障礙物
        this.resetLevel();
        
        // 更新顯示
        document.getElementById('score').textContent = `分數: 0`;
        document.getElementById('lives').textContent = `生命: 3`;
        document.getElementById('level').textContent = `等級: 1`;
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
window.onload = () => new Frogger();