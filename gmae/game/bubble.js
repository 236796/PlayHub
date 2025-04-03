// 泡泡龍遊戲邏輯
class BubbleShooter {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 遊戲參數
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.bubbleRadius = 20;
        this.bubbleColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        this.rows = 10;
        this.cols = 15;
        this.grid = [];
        this.shooter = {
            x: this.width / 2,
            y: this.height - 50,
            angle: Math.PI / 2, // 向上
            bubble: null
        };
        this.nextBubble = null;
        this.activeBubble = null;
        
        // 遊戲狀態
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        
        // 初始化網格
        this.initGrid();
        
        // 準備發射的泡泡
        this.prepareNextBubble();
        
        // 綁定事件
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.getElementById('start-btn').addEventListener('click', () => {
            if (this.gameLoop) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    // 初始化泡泡網格
    initGrid() {
        this.grid = [];
        
        // 根據等級決定初始行數
        const initialRows = Math.min(5, 2 + Math.floor(this.level / 2));
        
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                if (row < initialRows) {
                    // 偶數行偏移半個泡泡
                    const offset = row % 2 === 0 ? 0 : this.bubbleRadius;
                    const x = col * this.bubbleRadius * 2 + this.bubbleRadius + offset;
                    const y = row * this.bubbleRadius * 1.8 + this.bubbleRadius;
                    
                    // 隨機顏色
                    const colorIndex = Math.floor(Math.random() * this.bubbleColors.length);
                    
                    this.grid[row][col] = {
                        x: x,
                        y: y,
                        color: this.bubbleColors[colorIndex],
                        row: row,
                        col: col
                    };
                } else {
                    this.grid[row][col] = null;
                }
            }
        }
    }
    
    // 準備下一個泡泡
    prepareNextBubble() {
        const colorIndex = Math.floor(Math.random() * this.bubbleColors.length);
        this.nextBubble = {
            color: this.bubbleColors[colorIndex]
        };
        
        if (!this.shooter.bubble) {
            this.shooter.bubble = {
                color: this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)]
            };
        }
    }
    
    // 處理滑鼠移動
    handleMouseMove(e) {
        if (this.gameOver || this.paused || !this.gameLoop) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 計算角度
        const dx = mouseX - this.shooter.x;
        const dy = mouseY - this.shooter.y;
        let angle = Math.atan2(dy, dx);
        
        // 限制角度在上半部分 (0到π)
        if (angle > 0) {
            angle = Math.min(angle, Math.PI - 0.1);
        } else {
            angle = Math.max(angle, -Math.PI + 0.1);
        }
        
        this.shooter.angle = angle;
    }
    
    // 處理點擊事件
    handleClick(e) {
        if (this.gameOver || this.paused || !this.gameLoop || this.activeBubble) return;
        
        this.shootBubble();
    }
    
    // 處理按鍵事件
    handleKeyDown(e) {
        if (this.gameOver || !this.gameLoop) return;
        
        if (e.key === 'p' || e.key === 'P') {
            this.togglePause();
        } else if (e.key === ' ' && !this.activeBubble && !this.paused) {
            this.shootBubble();
        }
    }
    
    // 發射泡泡
    shootBubble() {
        const speed = 10;
        const angle = this.shooter.angle;
        
        this.activeBubble = {
            x: this.shooter.x,
            y: this.shooter.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: this.shooter.bubble.color,
            radius: this.bubbleRadius
        };
        
        // 更新發射器的泡泡
        this.shooter.bubble = this.nextBubble;
        this.prepareNextBubble();
    }
    
    // 更新活動泡泡位置
    updateActiveBubble() {
        if (!this.activeBubble) return;
        
        // 移動泡泡
        this.activeBubble.x += this.activeBubble.dx;
        this.activeBubble.y += this.activeBubble.dy;
        
        // 檢查邊界碰撞
        if (this.activeBubble.x - this.bubbleRadius < 0 || 
            this.activeBubble.x + this.bubbleRadius > this.width) {
            this.activeBubble.dx = -this.activeBubble.dx;
        }
        
        // 檢查頂部碰撞
        if (this.activeBubble.y - this.bubbleRadius < 0) {
            this.snapBubble();
            return;
        }
        
        // 檢查與其他泡泡的碰撞
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const bubble = this.grid[row][col];
                if (bubble) {
                    const dx = this.activeBubble.x - bubble.x;
                    const dy = this.activeBubble.y - bubble.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.bubbleRadius * 2) {
                        this.snapBubble();
                        return;
                    }
                }
            }
        }
    }
    
    // 將活動泡泡貼到網格上
    snapBubble() {
        // 找到最近的網格位置
        let closestRow = 0;
        let closestCol = 0;
        let minDistance = Number.MAX_VALUE;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.grid[row][col]) {
                    // 計算網格位置
                    const offset = row % 2 === 0 ? 0 : this.bubbleRadius;
                    const x = col * this.bubbleRadius * 2 + this.bubbleRadius + offset;
                    const y = row * this.bubbleRadius * 1.8 + this.bubbleRadius;
                    
                    const dx = this.activeBubble.x - x;
                    const dy = this.activeBubble.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestRow = row;
                        closestCol = col;
                    }
                }
            }
        }
        
        // 將泡泡放到網格上
        const offset = closestRow % 2 === 0 ? 0 : this.bubbleRadius;
        const x = closestCol * this.bubbleRadius * 2 + this.bubbleRadius + offset;
        const y = closestRow * this.bubbleRadius * 1.8 + this.bubbleRadius;
        
        this.grid[closestRow][closestCol] = {
            x: x,
            y: y,
            color: this.activeBubble.color,
            row: closestRow,
            col: closestCol
        };
        
        // 檢查是否有相同顏色的泡泡連在一起
        const matches = this.findMatches(closestRow, closestCol, this.activeBubble.color);
        
        if (matches.length >= 3) {
            // 移除匹配的泡泡
            for (const match of matches) {
                this.grid[match.row][match.col] = null;
            }
            
            // 增加分數
            this.score += matches.length * 10;
            document.getElementById('score').textContent = `分數: ${this.score}`;
            
            // 檢查懸掛的泡泡
            this.checkFloatingBubbles();
            
            // 檢查是否過關
            if (this.checkLevelComplete()) {
                this.level++;
                this.initGrid();
                document.getElementById('level').textContent = `等級: ${this.level}`;
            }
        }
        
        // 檢查是否遊戲結束 (泡泡到達底部)
        if (closestRow >= this.rows - 1) {
            this.gameOver = true;
            alert(`遊戲結束！最終分數: ${this.score}`);
            this.stop();
        }
        
        // 重置活動泡泡
        this.activeBubble = null;
    }
    
    // 找到相同顏色的連接泡泡
    findMatches(row, col, color) {
        const visited = new Set();
        const matches = [];
        const key = `${row},${col}`;
        
        const dfs = (r, c) => {
            const k = `${r},${c}`;
            if (visited.has(k)) return;
            
            visited.add(k);
            
            const bubble = this.grid[r][c];
            if (!bubble || bubble.color !== color) return;
            
            matches.push({row: r, col: c});
            
            // 檢查六個方向的相鄰泡泡
            const directions = [
                [-1, 0], // 上
                [1, 0],  // 下
                [0, -1], // 左
                [0, 1],  // 右
                // 對於奇數行和偶數行，斜向的鄰居不同
                ...(r % 2 === 0 ? [[-1, -1], [-1, 0]] : [[-1, 0], [-1, 1]]),
                ...(r % 2 === 0 ? [[1, -1], [1, 0]] : [[1, 0], [1, 1]])
            ];
            
            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;
                
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    dfs(nr, nc);
                }
            }
        };
        
        dfs(row, col);
        return matches;
    }
    
    // 檢查並移除懸掛的泡泡
    checkFloatingBubbles() {
        // 標記所有連接到頂部的泡泡
        const connected = new Set();
        
        // 從頂行開始DFS
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[0][col]) {
                this.markConnected(0, col, connected);
            }
        }
        
        // 移除所有未連接的泡泡
        let removedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const key = `${row},${col}`;
                if (this.grid[row][col] && !connected.has(key)) {
                    this.grid[row][col] = null;
                    removedCount++;
                }
            }
        }
        
        // 增加分數
        if (removedCount > 0) {
            this.score += removedCount * 20; // 懸掛泡泡給更多分數
            document.getElementById('score').textContent = `分數: ${this.score}`;
        }
    }
    
    // 標記連接到頂部的泡泡
    markConnected(row, col, connected) {
        const key = `${row},${col}`;
        if (connected.has(key) || !this.grid[row][col]) return;
        
        connected.add(key);
        
        // 檢查六個方向的相鄰泡泡
        const directions = [
            [-1, 0], // 上
            [1, 0],  // 下
            [0, -1], // 左
            [0, 1],  // 右
            // 對於奇數行和偶數行，斜向的鄰居不同
            ...(row % 2 === 0 ? [[-1, -1], [-1, 0]] : [[-1, 0], [-1, 1]]),
            ...(row % 2 === 0 ? [[1, -1], [1, 0]] : [[1, 0], [1, 1]])
        ];
        
        for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;
            
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                this.markConnected(nr, nc, connected);
            }
        }
    }
    
    // 檢查關卡是否完成
    checkLevelComplete() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 繪製遊戲
    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 繪製網格中的泡泡
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const bubble = this.grid[row][col];
                if (bubble) {
                    this.ctx.beginPath();
                    this.ctx.arc(bubble.x, bubble.y, this.bubbleRadius, 0, Math.PI * 2);
                    this.ctx.fillStyle = bubble.color;
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            }
        }
        
        // 繪製活動泡泡
        if (this.activeBubble) {
            this.ctx.beginPath();
            this.ctx.arc(this.activeBubble.x, this.activeBubble.y, this.bubbleRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.activeBubble.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // 繪製發射器
        this.ctx.beginPath();
        this.ctx.moveTo(this.shooter.x, this.shooter.y);
        this.ctx.lineTo(
            this.shooter.x + Math.cos(this.shooter.angle) * 30,
            this.shooter.y + Math.sin(this.shooter.angle) * 30
        );
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 繪製發射器的泡泡
        this.ctx.beginPath();
        this.ctx.arc(this.shooter.x, this.shooter.y, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.shooter.bubble.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 繪製下一個泡泡
        this.ctx.beginPath();
        this.ctx.arc(this.width - 30, this.height - 30, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.nextBubble.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 繪製「下一個」文字
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('下一個', this.width - 60, this.height - 50);
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
        
        // 更新活動泡泡
        this.updateActiveBubble();
        
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
        this.gameOver = false;
        this.paused = false;
        
        // 初始化網格
        this.initGrid();
        
        // 準備發射的泡泡
        this.shooter.bubble = null;
        this.prepareNextBubble();
        
        // 更新顯示
        document.getElementById('score').textContent = `分數: 0`;
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
window.onload = () => new BubbleShooter();