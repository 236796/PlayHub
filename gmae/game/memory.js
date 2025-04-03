// 記憶配對遊戲邏輯
class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.scoreDisplay = document.getElementById('score');
        this.movesDisplay = document.getElementById('moves');
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 8; // 總共8對卡片
        this.score = 0;
        this.moves = 0;
        this.isPlaying = false;
        
        // 卡片圖案（使用emoji）
        this.cardSymbols = ['🐱', '🐶', '🐼', '🦊', '🐨', '🐯', '🦁', '🐮'];
        
        // 綁定事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    // 開始遊戲
    startGame() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.startBtn.textContent = '遊戲進行中';
            this.resetGame();
            this.createCards();
        }
    }
    
    // 重置遊戲
    resetGame() {
        this.gameBoard.innerHTML = '';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.updateScore();
        this.updateMoves();
        
        if (this.isPlaying) {
            this.createCards();
        }
    }
    
    // 創建卡片
    createCards() {
        // 創建一對對的卡片
        const cardPairs = [];
        for (let i = 0; i < this.totalPairs; i++) {
            const symbol = this.cardSymbols[i];
            cardPairs.push(symbol, symbol);
        }
        
        // 洗牌算法
        this.shuffleArray(cardPairs);
        
        // 創建卡片元素
        cardPairs.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = symbol;
            
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            card.addEventListener('click', () => this.flipCard(card));
            
            this.gameBoard.appendChild(card);
            this.cards.push(card);
        });
    }
    
    // 洗牌算法 (Fisher-Yates)
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 翻轉卡片
    flipCard(card) {
        // 如果遊戲未開始、卡片已經翻開或已經匹配，則不執行任何操作
        if (!this.isPlaying || this.flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        // 翻轉卡片
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        // 如果翻開了兩張卡片，檢查是否匹配
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMoves();
            
            const [card1, card2] = this.flippedCards;
            
            if (card1.dataset.symbol === card2.dataset.symbol) {
                // 匹配成功
                this.matchCards();
            } else {
                // 匹配失敗
                setTimeout(() => this.unflipCards(), 1000);
            }
        }
    }
    
    // 匹配卡片
    matchCards() {
        this.flippedCards.forEach(card => {
            card.classList.add('matched');
            card.classList.remove('flipped');
        });
        
        this.matchedPairs++;
        this.score += 10;
        this.updateScore();
        
        this.flippedCards = [];
        
        // 檢查是否完成所有匹配
        if (this.matchedPairs === this.totalPairs) {
            this.gameComplete();
        }
    }
    
    // 翻回未匹配的卡片
    unflipCards() {
        this.flippedCards.forEach(card => {
            card.classList.remove('flipped');
        });
        
        this.flippedCards = [];
    }
    
    // 更新分數顯示
    updateScore() {
        this.scoreDisplay.textContent = `分數: ${this.score}`;
    }
    
    // 更新步數顯示
    updateMoves() {
        this.movesDisplay.textContent = `步數: ${this.moves}`;
    }
    
    // 遊戲完成
    gameComplete() {
        this.isPlaying = false;
        this.startBtn.textContent = '開始遊戲';
        
        // 計算最終分數（基於步數的獎勵）
        const movesBonus = Math.max(0, 100 - (this.moves - this.totalPairs) * 5);
        this.score += movesBonus;
        this.updateScore();
        
        setTimeout(() => {
            alert(`恭喜！你完成了遊戲！\n最終分數: ${this.score}\n總步數: ${this.moves}`);
        }, 500);
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('game-board')) {
        new MemoryGame();
    }
});