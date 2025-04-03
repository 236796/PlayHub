// 大蜜蜂遊戲邏輯
class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲參數
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.playerWidth = 50;
        this.playerHeight = 30;
        
        // 玩家砲台
        this.player = {
            x: this.width / 2 - this.playerWidth / 2,
            y: this.height - this.playerHeight - 20,
            speed: 5,
            bullets: [],
            bulletSpeed: 8,
            bulletCooldown: 0
        };
        
        // 外星人參數
        this.invaderSize = 30;
        this.invaderRows = 5;
        this.invaderCols = 10;
        this.invaderPadding = 10;
        this.invaderSpeed = 1;
        this.invaderDropDistance = 20;
        this.invaderMoveDirection = 1; // 1: 右, -1: 左
        this.invaders = [];
        
        // 防護罩
        this.shields = [];
        
        // 遊戲狀態
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        this.invaderShootInterval = 1000; // 外星人射擊間隔 (毫秒)
        this.lastInvaderShootTime = 0;
        
        // 控制參數
        this.keyState = {};
        
        // 初始化外星人
        this.initInvaders();
        
        // 初始化防護罩
        this.initShields();
        
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
    
    // 初始化外星人
    initInvaders() {
        this.invaders = [];
        
        for (let row = 0; row < this.invaderRows; row++) {
            for (let col = 0; col < this.invaderCols; col++) {
                // 不同行的外星人有不同的顏色和分數
                let color, points;
                if (row === 0) {
                    color = '#FF0000'; // 紅色
                    points = 30;
                } else if (row === 1 || row === 2) {
                    color = '#00FF00'; // 綠色
                    points = 20;
                } else {
                    color = '#0000FF'; // 藍色
                    points = 10;
                }
                
                this.invaders.push({
                    x: col * (this.invaderSize + this.invaderPadding) + this.invaderPadding,
                    y: row * (this.invaderSize + this.invaderPadding) + this.invaderPadding + 50,
                    width: this.invaderSize,
                    height: this.invaderSize,
                    color: color,
                    points: points,
                    alive: true,
                    bullets: []
                });
            }
        }
    }
    
    // 初始化防護罩
    initShields() {
        this.shields = [];
        
        // 創建4個防護罩
        for (let i = 0; i < 4; i++) {
            const shieldX = (i + 1) * (this.width / 5) - 30;
            const shieldY = this.height - 150;
            
            // 每個防護罩由多個小方塊組成
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 6; col++) {
                    // 頂部中間留空
                    if (row === 0 && (col === 2 || col === 3)) continue;
                    
                    this.shields.push({
                        x: shieldX + col * 10,
                        y: shieldY + row * 10,
                        width: 10,
                        height: 10,
                        health: 3 // 每個方塊有3點耐久度
                    });
                }
            }
        }
    }
    
    // 按鍵按下處理
    keyDownHandler(e) {
        this.keyState[e.key] = true;
        
        // 暫停遊戲
        if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
        }
        
        // 射擊
        if ((e.key === ' ' || e.key === 'f' || e.key === 'F') && !this.gameOver && !this.paused && this.gameLoop) {
            this.shoot();
        }
    }
    
    // 按鍵釋放處理
    keyUpHandler(e) {
        this.keyState[e.key] = false;
    }
    
    // 玩家射擊
    shoot() {
        // 檢查冷卻時間
        if (this.player.bulletCooldown > 0) return;
        
        // 設置冷卻時間
        this.player.bulletCooldown = 15; // 約0.25秒
        
        // 添加子彈
        this.player.bullets.push({
            x: this.player.x + this.playerWidth / 2 - 2,
            y: this.player.y - 10,
            width: 4,
            height: 10,
            color: '#FFFFFF'
        });
    }
    
    // 外星人射擊
    invaderShoot(timestamp) {
        if (timestamp - this.lastInvaderShootTime < this.invaderShootInterval) return;
        
        this.lastInvaderShootTime = timestamp;
        
        // 隨機選擇一個活著的外星人射擊
        const aliveInvaders = this.invaders.filter(invader => invader.alive);
        if (aliveInvaders.length === 0) return;
        
        const randomInvader = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        
        // 添加子彈
        randomInvader.bullets.push({
            x: randomInvader.x + this.invaderSize / 2 - 2,
            y: randomInvader.y + this.invaderSize,
            width: 4,
            height: 10,
            color: '#FF0000'
        });
    }
    
    // 更新玩家位置
    updatePlayer() {
        // 左右移動
        if ((this.keyState['ArrowLeft'] || this.keyState['a'] || this.keyState['A']) && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if ((this.keyState['ArrowRight'] || this.keyState['d'] || this.keyState['D']) && this.player.x < this.width - this.playerWidth) {
            this.player.x += this.player.speed;
        }
        
        // 更新子彈冷卻時間
        if (this.player.bulletCooldown > 0) {
            this.player.bulletCooldown--;
        }
    }
    
    // 更新外星人位置
    updateInvaders() {
        let hitEdge = false;
        let lowestInvader = 0;
        
        // 檢查是否有外星人到達邊緣
        for (const invader of this.invaders) {
            if (!invader.alive) continue;
            
            if ((invader.x + invader.width + this.invaderSpeed * this.invaderMoveDirection > this.width) ||
                (invader.x + this.invaderSpeed * this.invaderMoveDirection < 0)) {
                hitEdge = true;
            }
            
            // 記錄最低的外星人位置
            if (invader.y + invader.height > lowestInvader) {
                lowestInvader = invader.y + invader.height;
            }
        }
        
        // 移動外星人
        for (const invader of this.invaders) {
            if (!invader.alive) continue;
            
            if (hitEdge) {
                // 如果碰到邊緣，向下移動並改變方向
                invader.y += this.invaderDropDistance;
                this.invaderMoveDirection *= -1;
            } else {
                // 否則繼續水平移動
                invader.x += this.invaderSpeed * this.invaderMoveDirection;
            }
            
            // 檢查是否到達底部（遊戲結束）
            if (invader.y + invader.height > this.player.y) {
                this.gameOver = true;
                alert(`遊戲結束！外星人入侵！最終分數: ${this.score}`);
                this.stop();
                return;
            }
        }
        
        // 隨著外星人減少，增加速度
        const aliveCount = this.invaders.filter(invader => invader.alive).length;
        const speedMultiplier = Math.max(1, (this.invaderRows * this.invaderCols - aliveCount) / 10);
        this.invaderSpeed = 1 + speedMultiplier * 0.5;
    }
    
    // 更新子彈位置
    updateBullets() {
        // 更新玩家子彈
        for (let i = this.player.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player.bullets[i];
            
            // 移動子彈
            bullet.y -= this.player.bulletSpeed;
            
            // 檢查是否超出畫面
            if (bullet.y + bullet.height < 0) {
                this.player.bullets.splice(i, 1);
                continue;
            }
            
            // 檢查是否擊中外星人
            let hitInvader = false;
            for (const invader of this.invaders) {
                if (!invader.alive) continue;
                
                if (bullet.x < invader.x + invader.width &&
                    bullet.x + bullet.width > invader.x &&
                    bullet.y < invader.y + invader.height &&
                    bullet.y + bullet.height > invader.y) {
                    
                    // 擊中外星人
                    invader.alive = false;
                    this.score += invader.points;
                    document.getElementById('score').textContent = `分數: ${this.score}`;
                    
                    // 移除子彈
                    this.player.bullets.splice(i, 1);
                    hitInvader = true;
                    
                    // 檢查是否所有外星人都被消滅
                    if (this.invaders.every(inv => !inv.alive)) {
                        this.level++;
                        this.invaderSpeed = 1;
                        this.invaderMoveDirection = 1;
                        this.initInvaders();
                        document.getElementById('level').textContent = `等級: ${this.level}`;
                    }
                    
                    break;
                }
            }
            
            if (hitInvader) continue;
            
            // 檢查是否擊中防護罩
            for (let j = this.shields.length - 1; j >= 0; j--) {
                const shield = this.shields[j];
                
                if (bullet.x < shield.x + shield.width &&
                    bullet.x + bullet.width > shield.x &&
                    bullet.y < shield.y + shield.height &&
                    bullet.y + bullet.height > shield.y) {
                    
                    // 減少防護罩耐久度
                    shield.health--;
                    
                    // 如果耐久度為0，移除防護罩
                    if (shield.health <= 0) {
                        this.shields.splice(j, 1);
                    }
                    
                    // 移除子彈
                    this.player.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // 更新外星人子彈
        for (const invader of this.invaders) {
            for (let i = invader.bullets.length - 1; i >= 0; i--) {
                const bullet = invader.bullets[i];
                
                // 移動子彈
                bullet.y += 5;
                
                // 檢查是否超出畫面
                if (bullet.y > this.height) {
                    invader.bullets.splice(i, 1);
                    continue;
                }
                
                // 檢查是否擊中玩家
                if (bullet.x < this.player.x + this.playerWidth &&
                    bullet.x + bullet.width > this.player.x &&
                    bullet.y < this.player.y + this.playerHeight &&
                    bullet.y + bullet.height > this.player.y) {
                    
                    // 玩家被擊中
                    this.lives--;
                    document.getElementById('lives').textContent = `生命: ${this.lives}`;
                    
                    // 移除子彈
                    invader.bullets.splice(i, 1);
                    
                    // 檢查遊戲結束
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        alert(`遊戲結束！最終分數: ${this.score}`);
                        this.stop();
                        return;
                    }
                    
                    break;
                }
                
                // 檢查是否擊中防護罩
                for (let j = this.shields.length - 1; j >= 0; j--) {
                    const shield = this.shields[j];
                    
                    if (bullet.x < shield.x + shield.width &&
                        bullet.x + bullet.width > shield.x &&
                        bullet.y < shield.y + shield.height &&
                        bullet.y + bullet.height > shield.y) {
                        
                        // 減少防護罩耐久度
                        shield.health--;
                        
                        // 如果耐久度為0，移除防護罩
                        if (shield.health <= 0) {
                            this.shields.splice(j, 1);
                        }
                        
                        // 移除子彈
                        invader.bullets.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
    
    // 繪製遊戲
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製玩家
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.player.x, this.player.y, this.playerWidth, this.playerHeight);
        
        // 繪製玩家砲管
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.player.x + this.playerWidth / 2 - 5, this.player.y - 10, 10, 10);
        
        // 繪製外星人
        for (const invader of this.invaders) {
            if (!invader.alive) continue;
            
            this.ctx.fillStyle = invader.color;
            this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            
            // 繪製外星人觸角
            this.ctx.beginPath();
            this.ctx.moveTo(invader.x + 5, invader.y);
            this.ctx.lineTo(invader.x + 5, invader.y - 5);
            this.ctx.moveTo(invader.x + invader.width - 5, invader.y);
            this.ctx.lineTo(invader.x + invader.width - 5, invader.y - 5);
            this.ctx.strokeStyle = invader.color;
            this.ctx.stroke();
        }
        
        // 繪製防護罩
        for (const shield of this.shields) {
            // 根據耐久度改變顏色
            switch(shield.health) {
                case 3: this.ctx.fillStyle = '#00FF00'; break; // 綠色
                case 2: this.ctx.fillStyle = '#FFFF00'; break; // 黃色
                case 1: this.ctx.fillStyle = '#FF0000'; break; // 紅色
            }
            
            this.ctx.fillRect(shield.x, shield.y, shield.width, shield.height);
        }
        
        // 繪製玩家子彈
        for (const bullet of this.player.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // 繪製外星人子彈
        for (const invader of this.invaders) {
            for (const bullet of invader.bullets) {
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
    update(timestamp) {
        if (this.gameOver || this.paused) return;
        
        // 更新玩家位置
        this.updatePlayer();
        
        // 更新外星人位置
        this.updateInvaders();
        
        // 外星人射擊
        this.invaderShoot(timestamp);
        
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
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameOver = false;
        this.paused = false;
        this.invaderSpeed = 1;
        this.invaderMoveDirection = 1;
        
        // 重置玩家位置
        this.player.x = this.width / 2 - this.playerWidth / 2;
        this.player.bullets = [];
        
        // 初始化外星人和防護罩
        this.initInvaders();
        this.initShields();
        
        // 更新顯示
        document.getElementById('score').textContent = `分數: 0`;
        document.getElementById('level').textContent = `等級: 1`;
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
window.onload = () => new SpaceInvaders();