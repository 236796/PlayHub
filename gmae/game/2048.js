// 2048遊戲邏輯
class Game2048 {
    constructor() {
        this.grid = document.getElementById('grid');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.size = 8; // 8x8網格
        this.cells = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score')) || 0;
        this.bestScoreDisplay.textContent = this.bestScore;

        // 綁定事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.newGameBtn.addEventListener('click', () => this.initGame());

        // 初始化遊戲
        this.initGame();
    }

    // 初始化遊戲
    initGame() {
        this.grid.innerHTML = '';
        this.cells = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScore();

        // 網格容器樣式已在CSS中定義，這裡只需確保grid元素的基本屬性
        this.grid.style.display = 'grid';

        // 創建網格
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.display = 'flex';
            cell.style.justifyContent = 'center';
            cell.style.alignItems = 'center';
            cell.style.fontSize = '16px';
            this.grid.appendChild(cell);
        }

        // 添加兩個初始數字
        this.addNewNumber();
        this.addNewNumber();
        this.updateGrid();
    }

    // 添加新數字
    addNewNumber() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.cells[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // 更新網格顯示
    updateGrid() {
        const cellElements = this.grid.children;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.cells[i][j];
                const cell = cellElements[i * this.size + j];
                cell.textContent = value || '';
                cell.dataset.value = value || '';
                cell.style.transform = 'scale(1)';
                // 確保每個單元格都有正確的樣式
                cell.style.display = 'flex';
                cell.style.justifyContent = 'center';
                cell.style.alignItems = 'center';
            }
        }
    }

    // 更新分數
    updateScore() {
        this.scoreDisplay.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreDisplay.textContent = this.bestScore;
            localStorage.setItem('2048-best-score', this.bestScore);
        }
    }

    // 處理按鍵事件
    handleKeyPress(e) {
        let moved = false;

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                moved = this.move('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                moved = this.move('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moved = this.move('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moved = this.move('right');
                break;
            default:
                return;
        }

        if (moved) {
            setTimeout(() => {
                this.addNewNumber();
                this.updateGrid();

                if (this.isGameOver()) {
                    setTimeout(() => {
                        alert(`遊戲結束！\n最終分數：${this.score}`);
                    }, 300);
                }
            }, 200);
        }
    }

    // 移動方塊
    move(direction) {
        let moved = false;
        const vector = this.getVector(direction);

        for (let i = 0; i < this.size; i++) {
            const line = this.getLine(i, direction);
            const merged = this.mergeLine(line);
            if (merged.moved) moved = true;
            this.setLine(i, direction, merged.line);
        }

        return moved;
    }

    // 獲取移動方向向量
    getVector(direction) {
        const vectors = {
            'up': {x: -1, y: 0},
            'down': {x: 1, y: 0},
            'left': {x: 0, y: -1},
            'right': {x: 0, y: 1}
        };
        return vectors[direction];
    }

    // 獲取一行或一列
    getLine(index, direction) {
        const line = [];
        for (let i = 0; i < this.size; i++) {
            switch(direction) {
                case 'up':
                case 'down':
                    line.push(this.cells[i][index]);
                    break;
                case 'left':
                case 'right':
                    line.push(this.cells[index][i]);
                    break;
            }
        }
        if (direction === 'down' || direction === 'right') line.reverse();
        return line;
    }

    // 設置一行或一列
    setLine(index, direction, line) {
        if (direction === 'down' || direction === 'right') line.reverse();
        for (let i = 0; i < this.size; i++) {
            switch(direction) {
                case 'up':
                case 'down':
                    this.cells[i][index] = line[i];
                    break;
                case 'left':
                case 'right':
                    this.cells[index][i] = line[i];
                    break;
            }
        }
    }

    // 合併一行或一列
    mergeLine(line) {
        const newLine = line.filter(cell => cell !== 0);
        let moved = newLine.length !== line.length;

        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                const mergedValue = newLine[i] * 2;
                newLine[i] = mergedValue;
                newLine.splice(i + 1, 1);
                this.score += mergedValue;
                this.updateScore();
                moved = true;
                
                // 添加合併動畫
                setTimeout(() => {
                    const cells = this.grid.children;
                    for (let y = 0; y < this.size; y++) {
                        for (let x = 0; x < this.size; x++) {
                            if (this.cells[y][x] === mergedValue) {
                                const cell = cells[y * this.size + x];
                                cell.style.transform = 'scale(1.2)';
                                setTimeout(() => {
                                    cell.style.transform = 'scale(1)';
                                }, 400);
                            }
                        }
                    }
                }, 200);
            }
        }

        while (newLine.length < this.size) {
            newLine.push(0);
        }

        return {line: newLine, moved};
    }

    // 檢查遊戲是否結束
    isGameOver() {
        // 檢查是否有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.cells[i][j] === 0) return false;
            }
        }

        // 檢查是否有相鄰的相同數字
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.cells[i][j];
                // 檢查右邊
                if (j < this.size - 1 && current === this.cells[i][j + 1]) return false;
                // 檢查下面
                if (i < this.size - 1 && current === this.cells[i + 1][j]) return false;
            }
        }

        return true;
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});