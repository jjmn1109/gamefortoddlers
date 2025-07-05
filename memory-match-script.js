// Memory Match Game Logic
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.startTime = 0;
        this.gameTimer = null;
        this.currentLevel = 1;
        this.maxLevels = 5;
        
        // Card symbols for different levels
        this.cardSymbols = {
            1: ['🐶', '🐱', '🐰', '🐸', '🐼', '🐨'], // Level 1: 6 pairs
            2: ['🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'], // Level 2: 8 pairs
            3: ['🦊', '🐻', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'], // Level 3: 10 pairs
            4: ['🦊', '🐻', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆'], // Level 4: 12 pairs
            5: ['🦊', '🐻', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦅', '🦉'] // Level 5: 14 pairs
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.playSound('click');
            setTimeout(() => window.location.href = 'menu.html', 300);
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Music toggle
        document.getElementById('music-toggle').addEventListener('click', () => {
            this.toggleMusic();
        });
        
        // Modal buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.hideModal('pause-modal');
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('level-menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('game-menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal('pause-modal');
            }
        });
    }
    
    loadLevel(level) {
        this.currentLevel = level;
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.gameStarted = false;
        this.startTime = 0;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        const symbols = this.cardSymbols[level];
        this.cards = this.createCardPairs(symbols);
        this.renderCards();
        this.updateDisplay();
    }
    
    createCardPairs(symbols) {
        const pairs = [];
        symbols.forEach(symbol => {
            pairs.push({ id: symbol + '1', symbol: symbol, isFlipped: false, isMatched: false });
            pairs.push({ id: symbol + '2', symbol: symbol, isFlipped: false, isMatched: false });
        });
        
        // Shuffle the cards
        return this.shuffleArray(pairs);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    renderCards() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';
        
        // Adjust grid columns based on level
        const columns = this.currentLevel <= 2 ? 4 : this.currentLevel <= 3 ? 5 : 6;
        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.id = card.id;
            
            cardElement.innerHTML = `
                <div class="card-front">❓</div>
                <div class="card-back">${card.symbol}</div>
            `;
            
            cardElement.addEventListener('click', () => this.flipCard(card));
            grid.appendChild(cardElement);
        });
    }
    
    flipCard(card) {
        if (card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }
        
        // Start timer on first card flip
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
            this.startTimer();
        }
        
        card.isFlipped = true;
        this.flippedCards.push(card);
        
        const cardElement = document.querySelector(`[data-id="${card.id}"]`);
        cardElement.classList.add('flipped');
        
        this.playSound('flip');
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkMatch();
        }
        
        this.updateDisplay();
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found!
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;
            
            const card1Element = document.querySelector(`[data-id="${card1.id}"]`);
            const card2Element = document.querySelector(`[data-id="${card2.id}"]`);
            
            card1Element.classList.add('matched');
            card2Element.classList.add('matched');
            
            this.playSound('match');
            
            // Check if level is complete
            if (this.matchedPairs === this.cards.length / 2) {
                setTimeout(() => this.completeLevel(), 1000);
            }
        } else {
            // No match, flip cards back
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                
                const card1Element = document.querySelector(`[data-id="${card1.id}"]`);
                const card2Element = document.querySelector(`[data-id="${card2.id}"]`);
                
                card1Element.classList.remove('flipped');
                card2Element.classList.remove('flipped');
                
                this.playSound('wrong');
            }, 1000);
        }
        
        this.flippedCards = [];
    }
    
    completeLevel() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = timeString;
        
        if (this.currentLevel < this.maxLevels) {
            this.showModal('level-complete-modal');
        } else {
            document.getElementById('final-score').textContent = `Total Moves: ${this.moves}`;
            this.showModal('game-complete-modal');
        }
    }
    
    nextLevel() {
        this.hideModal('level-complete-modal');
        this.loadLevel(this.currentLevel + 1);
    }
    
    restartGame() {
        this.hideModal('game-complete-modal');
        this.loadLevel(1);
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameStarted) {
                const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(timeElapsed / 60);
                const seconds = timeElapsed % 60;
                document.getElementById('time-display').textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    updateDisplay() {
        document.getElementById('level-display').textContent = this.currentLevel;
        document.getElementById('moves-display').textContent = this.moves;
        
        const progress = (this.matchedPairs / (this.cards.length / 2)) * 100;
        document.querySelector('.progress-bar::before').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `${this.matchedPairs} / ${this.cards.length / 2} pairs found`;
    }
    
    togglePause() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        this.showModal('pause-modal');
    }
    
    toggleMusic() {
        const musicToggle = document.getElementById('music-toggle');
        musicToggle.classList.toggle('muted');
        // Add music toggle logic here if needed
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        if (modalId === 'pause-modal' && this.gameStarted) {
            this.startTimer();
        }
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'flip':
                    oscillator.frequency.value = 600;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                    
                case 'match':
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'wrong':
                    oscillator.frequency.value = 200;
                    oscillator.type = 'sawtooth';
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                case 'click':
                    oscillator.frequency.value = 400;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
            }
        } catch (error) {
            console.log('Audio not available');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
}); 