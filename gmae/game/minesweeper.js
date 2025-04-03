// 掃雷遊戲邏輯
class MinesweeperGame {
    constructor() {
        // 獲取DOM元素
        this.gameBoard = document.getElementById('game-board');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.minesCounter = document.getElementById('mines-counter');
        this.timerDisplay = document.getElementById('timer');
        this.easyBtn = document.getElementById('easy-btn');
        this.mediumBtn = document.getElementById('medium-btn');
        this.hardBtn = document.getElementById('hard-btn');
        
        // 遊戲設置
        this.difficulties = {
            easy: { rows: 10, cols: 10, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };
        
        // 當前難度
        this.currentDifficulty = 'easy';
        
        // 遊戲狀態
        this.isPlaying = false;
        this.isGameOver = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.flaggedCount = 0;
        
        // 遊戲網格
        this.grid = [];
        this.rows = this.difficulties.easy.rows;
        this.cols = this.difficulties.easy.cols;
        this.mines = this.difficulties.easy.mines;
        
        // 綁定事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.homeBtn.addEventListener('click', () => this.goHome());
        this.easyBtn.addEventListener('click', () => this.changeDifficulty('easy'));
        this.mediumBtn.addEventListener('click', () => this.changeDifficulty('medium'));
        this.hardBtn.addEventListener('click', () => this.changeDifficulty('hard'));
        
        // 初始化遊戲
        this.initializeGrid();
        this.renderGrid();
    }
    
    // 初始化網格
    initializeGrid() {
        this.grid = [];
        
        // 創建空網格
        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = {
                    row,
                    col,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    // 放置地雷
    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 確保不在第一次點擊的位置及其周圍放置地雷
            if (!this.grid[row][col].isMine && 
                !(Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1)) {
                this.grid[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        // 計算每個格子周圍的地雷數
        this.calculateNeighborMines();
    }
    
    // 計算每個格子周圍的地雷數
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.grid[row][col].isMine) {
                    let count = 0;
                    
                    // 檢查周圍8個方向
                    for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                        for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                            if (!(r === row && c === col) && this.grid[r][c].isMine) {
                                count++;
                            }
                        }
                    }
                    
                    this.grid[row][col].neighborMines = count;
                }
            }
        }
    }
    
    // 渲染網格
    renderGrid() {
        // 調整網格大小
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;
        this.gameBoard.style.width = `${this.cols * 30 + (this.cols - 1)}px`;
        
        // 更新遊戲信息寬度
        document.getElementById('game-info').style.width = `${this.cols * 30 + (this.cols - 1)}px`;
        document.querySelector('.instructions').style.maxWidth = `${this.cols * 30 + (this.cols - 1)}px`;
        
        // 清空網格
        this.gameBoard.innerHTML = '';
        
        // 創建格子
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 左鍵點擊揭開格子
                cell.addEventListener('click', (e) => {
                    if (this.isPlaying && !this.isGameOver) {
                        this.revealCell(row, col);
                    }
                });
                
                // 右鍵點擊標記地雷
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (this.isPlaying && !this.isGameOver) {
                        this.toggleFlag(row, col);
                    }
                });
                
                this.gameBoard.appendChild(cell);
            }
        }
        
        // 更新地雷計數器
        this.updateMinesCounter();
    }
    
    // 開始遊戲
    startGame() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.isGameOver = false;
            this.firstClick = true;
            this.startBtn.textContent = '遊戲進行中';
            
            // 重置計時器
            this.timer = 0;
            this.updateTimer();
            
            // 開始計時
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateTimer();
            }, 1000);
        }
    }
    
    // 重置遊戲
    resetGame() {
        // 停止計時器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // 重置遊戲狀態
        this.isPlaying = false;
        this.isGameOver = false;
        this.firstClick = true;
        this.timer = 0;
        this.flaggedCount = 0;
        this.startBtn.textContent = '開始遊戲';
        
        // 重置網格
        this.initializeGrid();
        this.renderGrid();
        this.updateTimer();
    }
    
    // 返回主頁
    goHome() {
        window.location.href = 'index.html';
    }
    
    // 更改難度
    changeDifficulty(difficulty) {
        if (this.currentDifficulty !== difficulty) {
            this.currentDifficulty = difficulty;
            this.rows = this.difficulties[difficulty].rows;
            this.cols = this.difficulties[difficulty].cols;
            this.mines = this.difficulties[difficulty].mines;
            
            // 更新難度按鈕狀態
            this.easyBtn.classList.remove('active');
            this.mediumBtn.classList.remove('active');
            this.hardBtn.classList.remove('active');
            
            switch(difficulty) {
                case 'easy':
                    this.easyBtn.classList.add('active');
                    break;
                case 'medium':
                    this.mediumBtn.classList.add('active');
                    break;
                case 'hard':
                    this.hardBtn.classList.add('active');
                    break;
            }
            
            // 重置遊戲
            this.resetGame();
        }
    }
    
    // 揭開格子
    revealCell(row, col) {
        const cell = this.grid[row][col];
        
        // 如果格子已經被揭開或被標記，則不做任何操作
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        // 如果是第一次點擊，放置地雷
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
        }
        
        // 揭開格子
        cell.isRevealed = true;
        
        // 更新DOM
        const cellElement = this.getCellElement(row, col);
        cellElement.classList.add('revealed');
        
        // 如果是地雷，遊戲結束
        if (cell.isMine) {
            this.gameOver(false);
            cellElement.classList.add('mine');
            cellElement.textContent = '💣';
            return;
        }
        
        // 如果周圍有地雷，顯示數字
        if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines;
            cellElement.dataset.mines = cell.neighborMines;
        } else {
            // 如果周圍沒有地雷，自動揭開周圍的格子
            this.revealEmptyCells(row, col);
        }
        
        // 檢查是否獲勝
        this.checkWin();
    }
    
    // 揭開空白格子周圍的格子
    revealEmptyCells(row, col) {
        // 檢查周圍8個方向
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                // 跳過當前格子
                if (r === row && c === col) continue;
                
                const neighbor = this.grid[r][c];
                
                // 如果鄰居格子未被揭開且未被標記，則揭開它
                if (!neighbor.isRevealed && !neighbor.isFlagged) {
                    this.revealCell(r, c);
                }
            }
        }
    }
    
    // 標記/取消標記地雷
    toggleFlag(row, col) {
        const cell = this.grid[row][col];
        
        // 如果格子已經被揭開，則不做任何操作
        if (cell.isRevealed) {
            return;
        }
        
        // 切換標記狀態
        cell.isFlagged = !cell.isFlagged;
        
        // 更新標記計數
        this.flaggedCount += cell.isFlagged ? 1 : -1;
        
        // 更新DOM
        const cellElement = this.getCellElement(row, col);
        cellElement.classList.toggle('flagged');
        
        // 更新地雷計數器
        this.updateMinesCounter();
        
        // 檢查是否獲勝
        this.checkWin();
    }
    
    // 獲取格子元素
    getCellElement(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }
    
    // 更新地雷計數器
    updateMinesCounter() {
        this.minesCounter.textContent = `剩餘地雷: ${this.mines - this.flaggedCount}`;
    }
    
    // 更新計時器
    updateTimer() {
        this.timerDisplay.textContent = `時間: ${this.timer}`;
    }
    
    // 檢查是否獲勝
    checkWin() {
        // 檢查所有非地雷格子是否都已揭開
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (!cell.isMine && !cell.isRevealed) {
                    return; // 還有非地雷格子未揭開
                }
            }
        }
        
        // 所有非地雷格子都已揭開，獲勝
        this.gameOver(true);
    }
    
    // 遊戲結束
    gameOver(isWin) {
        this.isPlaying = false;
        this.isGameOver = true;
        
        // 停止計時器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.startBtn.textContent = '開始遊戲';
        
        // 如果獲勝，標記所有地雷
        if (isWin) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const cell = this.grid[row][col];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isFlagged = true;
                        this.getCellElement(row, col).classList.add('flagged');
                    }
                }
            }
            
            this.flaggedCount = this.mines;
            this.updateMinesCounter();
            
            setTimeout(() => {
                alert(`恭喜！你贏了！\n用時: ${this.timer} 秒`);
            }, 100);
        } else {
            // 如果失敗，顯示所有地雷
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const cell = this.grid[row][col];
                    if (cell.isMine && !cell.isRevealed) {
                        const cellElement = this.getCellElement(row, col);
                        if (cell.isFlagged) {
                            // 正確標記的地雷
                            cellElement.classList.add('flagged');
                        } else {
                            // 未標記的地雷
                            cellElement.classList.add('revealed');
                            cellElement.classList.add('mine');
                            cellElement.textContent = '💣';
                        }
                    } else if (cell.isFlagged && !cell.isMine) {
                        // 錯誤標記的地雷
                        const cellElement = this.getCellElement(row, col);
                        cellElement.classList.add('revealed');
                        cellElement.classList.add('flagged');
                        cellElement.textContent = '❌';
                    }
                }
            }
            
            setTimeout(() => {
                alert(`遊戲結束！你踩到地雷了！\n用時: ${this.timer} 秒`);
            }, 100);
        }
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new MinesweeperGame();
});