// 俄羅斯方塊遊戲邏輯
class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.cellSize = this.canvas.width / this.gridWidth;
        
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.colors = [
            null,
            '#FF0D72', // I
            '#0DC2FF', // J
            '#0DFF72', // L
            '#F538FF', // O
            '#FF8E0D', // S
            '#FFE138', // T
            '#3877FF'  // Z
        ];
        
        this.pieces = [
            // I
            [[[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], 1],
            // J
            [[[2, 0, 0], [2, 2, 2], [0, 0, 0]], 2],
            // L
            [[[0, 0, 3], [3, 3, 3], [0, 0, 0]], 3],
            // O
            [[[4, 4], [4, 4]], 4],
            // S
            [[[0, 5, 5], [5, 5, 0], [0, 0, 0]], 5],
            // T
            [[[0, 6, 0], [6, 6, 6], [0, 0, 0]], 6],
            // Z
            [[[7, 7, 0], [0, 7, 7], [0, 0, 0]], 7]
        ];
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.currentPos = {x: 0, y: 0};
        
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.gameLoop = null;
        this.dropInterval = 1000; // 初始下落速度 (毫秒)
        
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
    
    // 創建新的方塊
    createPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        const [matrix, colorIndex] = this.pieces[pieceIndex];
        return {
            matrix,
            colorIndex
        };
    }
    
    // 繪製方塊
    drawPiece(ctx, matrix, position, colorIndex) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = this.colors[colorIndex];
                    ctx.fillRect(
                        (position.x + x) * this.cellSize,
                        (position.y + y) * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                    
                    // 繪製方塊邊框
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(
                        (position.x + x) * this.cellSize,
                        (position.y + y) * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                }
            });
        });
    }
    
    // 繪製下一個方塊預覽
    drawNextPiece() {
        this.nextCtx.fillStyle = '#111';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const matrix = this.nextPiece.matrix;
            const offset = {
                x: (this.nextCanvas.width / this.cellSize - matrix[0].length) / 2,
                y: (this.nextCanvas.width / this.cellSize - matrix.length) / 2
            };
            
            this.drawPiece(
                this.nextCtx,
                matrix,
                offset,
                this.nextPiece.colorIndex
            );
        }
    }
    
    // 繪製遊戲網格
    drawGrid() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製已固定的方塊
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                    
                    // 繪製方塊邊框
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                }
            });
        });
        
        // 繪製當前方塊
        if (this.currentPiece) {
            this.drawPiece(
                this.ctx,
                this.currentPiece.matrix,
                this.currentPos,
                this.currentPiece.colorIndex
            );
        }
    }
    
    // 檢查碰撞
    checkCollision(matrix, position) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0 &&
                    (this.grid[y + position.y] === undefined ||
                     this.grid[y + position.y][x + position.x] === undefined ||
                     this.grid[y + position.y][x + position.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 旋轉方塊
    rotatePiece() {
        const matrix = this.currentPiece.matrix;
        const newMatrix = [];
        
        // 創建新的旋轉後矩陣
        for (let i = 0; i < matrix[0].length; i++) {
            newMatrix.push([]);
            for (let j = matrix.length - 1; j >= 0; j--) {
                newMatrix[i].push(matrix[j][i]);
            }
        }
        
        // 檢查旋轉後是否會碰撞
        const originalMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = newMatrix;
        
        // 嘗試不同的位置調整
        const offset = [0, -1, 1, -2, 2];
        let validRotation = false;
        
        for (let i = 0; i < offset.length; i++) {
            const newPos = {x: this.currentPos.x + offset[i], y: this.currentPos.y};
            if (!this.checkCollision(newMatrix, newPos)) {
                this.currentPos.x = newPos.x;
                validRotation = true;
                break;
            }
        }
        
        // 如果所有嘗試都失敗，恢復原始矩陣
        if (!validRotation) {
            this.currentPiece.matrix = originalMatrix;
        }
    }
    
    // 合併方塊到網格
    mergePiece() {
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.grid[y + this.currentPos.y][x + this.currentPos.x] = this.currentPiece.colorIndex;
                }
            });
        });
    }
    
    // 清除已完成的行
    clearLines() {
        let linesCleared = 0;
        
        outer: for (let y = this.gridHeight - 1; y >= 0; y--) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === 0) {
                    continue outer;
                }
            }
            
            // 移除該行並在頂部添加新行
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            y++; // 檢查同一行（現在是新行）
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            // 更新分數
            const points = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 行的分數
            this.score += points[linesCleared] * this.level;
            this.lines += linesCleared;
            
            // 更新等級
            this.level = Math.floor(this.lines / 10) + 1;
            
            // 每消除一行就增加一點速度
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100 - this.lines * 5);
            
            // 如果遊戲循環正在運行，更新它的速度
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.dropInterval);
            }
            
            // 更新顯示
            document.getElementById('score').textContent = `分數: ${this.score}`;
            document.getElementById('level').textContent = `等級: ${this.level}`;
            document.getElementById('lines').textContent = `消除行數: ${this.lines}`;
        }
    }
    
    // 重置方塊位置
    resetPiece() {
        this.currentPiece = this.nextPiece || this.createPiece();
        this.nextPiece = this.createPiece();
        this.currentPos = {
            x: Math.floor(this.gridWidth / 2) - Math.floor(this.currentPiece.matrix[0].length / 2),
            y: 0
        };
        
        // 繪製下一個方塊預覽
        this.drawNextPiece();
        
        // 檢查遊戲結束
        if (this.checkCollision(this.currentPiece.matrix, this.currentPos)) {
            this.gameOver = true;
            this.stop();
            alert(`遊戲結束！最終分數: ${this.score}`);
        }
    }
    
    // 處理按鍵事件
    handleKeyPress(event) {
        if (this.gameOver || this.paused || !this.gameLoop) return;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.currentPos.x--;
                if (this.checkCollision(this.currentPiece.matrix, this.currentPos)) {
                    this.currentPos.x++;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.currentPos.x++;
                if (this.checkCollision(this.currentPiece.matrix, this.currentPos)) {
                    this.currentPos.x--;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.moveDown();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.rotatePiece();
                break;
            case 'f':
            case 'F':
                this.hardDrop();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }
        
        this.drawGrid();
    }
    
    // 向下移動方塊
    moveDown() {
        this.currentPos.y++;
        if (this.checkCollision(this.currentPiece.matrix, this.currentPos)) {
            this.currentPos.y--;
            this.mergePiece();
            this.clearLines();
            this.resetPiece();
            return false;
        }
        return true;
    }
    
    // 快速下落
    hardDrop() {
        while(this.moveDown()) {}
    }
    
    // 切換暫停
    togglePause() {
        if (this.paused) {
            this.paused = false;
            this.gameLoop = setInterval(() => this.update(), this.dropInterval);
            document.getElementById('start-btn').textContent = '暫停遊戲';
        } else {
            this.paused = true;
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            document.getElementById('start-btn').textContent = '繼續遊戲';
        }
    }
    
    // 更新遊戲狀態
    update() {
        if (this.gameOver || this.paused) return;
        
        this.moveDown();
        this.drawGrid();
    }
    
    // 開始遊戲
    start() {
        if (this.gameLoop) return;
        
        // 重置遊戲狀態
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropInterval = 1000;
        
        // 更新顯示
        document.getElementById('score').textContent = `分數: 0`;
        document.getElementById('level').textContent = `等級: 1`;
        document.getElementById('lines').textContent = `消除行數: 0`;
        document.getElementById('start-btn').textContent = '暫停遊戲';
        
        // 創建初始方塊
        this.nextPiece = this.createPiece();
        this.resetPiece();
        
        // 開始遊戲循環
        this.gameLoop = setInterval(() => this.update(), this.dropInterval);
    }
    
    // 停止遊戲
    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            document.getElementById('start-btn').textContent = '開始遊戲';
        }
    }
}

// 初始化遊戲
window.onload = () => new Tetris();