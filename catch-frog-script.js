// Catch the Frog Game Logic
class CatchFrogGame {
    constructor() {
        this.currentLevel = 1;
        this.maxLevels = 5;
        this.frogsCaught = 0;
        this.frogsToCatch = 5;
        this.gameStarted = false;
        this.startTime = 0;
        this.gameTimer = null;
        this.frogMoveInterval = null;
        this.frogSpeed = 2000; // milliseconds between moves
        this.gameArea = null;
        this.frog = null;
        this.lilyPads = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createLilyPads();
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
        
        // Frog click
        document.getElementById('frog').addEventListener('click', () => {
            this.catchFrog();
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
    
    createLilyPads() {
        const lilyPadsContainer = document.getElementById('lily-pads');
        lilyPadsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const lilyPad = document.createElement('div');
            lilyPad.className = 'lily-pad';
            lilyPad.textContent = '🪷';
            lilyPadsContainer.appendChild(lilyPad);
        }
    }
    
    loadLevel(level) {
        this.currentLevel = level;
        this.frogsCaught = 0;
        this.gameStarted = false;
        this.startTime = 0;
        
        // Set level-specific parameters
        switch(level) {
            case 1:
                this.frogsToCatch = 5;
                this.frogSpeed = 2000;
                break;
            case 2:
                this.frogsToCatch = 7;
                this.frogSpeed = 1700;
                break;
            case 3:
                this.frogsToCatch = 10;
                this.frogSpeed = 1400;
                break;
            case 4:
                this.frogsToCatch = 12;
                this.frogSpeed = 1100;
                break;
            case 5:
                this.frogsToCatch = 15;
                this.frogSpeed = 800;
                break;
        }
        
        this.gameArea = document.getElementById('game-area');
        this.frog = document.getElementById('frog');
        
        // Reset frog position
        this.moveFrogToRandomPosition();
        
        // Update display
        this.updateDisplay();
        
        // Start the game
        this.startGame();
    }
    
    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
        this.startFrogMovement();
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
    
    startFrogMovement() {
        if (this.frogMoveInterval) {
            clearInterval(this.frogMoveInterval);
        }
        
        this.frogMoveInterval = setInterval(() => {
            if (this.gameStarted) {
                this.moveFrogToRandomPosition();
            }
        }, this.frogSpeed);
    }
    
    moveFrogToRandomPosition() {
        if (!this.gameArea || !this.frog) return;
        
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const frogRect = this.frog.getBoundingClientRect();
        
        // Calculate available area (accounting for frog size)
        const maxX = gameAreaRect.width - frogRect.width;
        const maxY = gameAreaRect.height - frogRect.height;
        
        // Generate random position
        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;
        
        // Apply new position
        this.frog.style.left = `${newX}px`;
        this.frog.style.top = `${newY}px`;
        
        // Add a small bounce effect
        this.frog.style.animation = 'none';
        setTimeout(() => {
            this.frog.style.animation = 'frogBounce 0.5s ease-in-out infinite alternate';
        }, 10);
    }
    
    catchFrog() {
        if (!this.gameStarted) return;
        
        this.frogsCaught++;
        this.playSound('catch');
        
        // Add caught animation
        this.frog.classList.add('caught');
        
        // Remove caught class after animation
        setTimeout(() => {
            this.frog.classList.remove('caught');
            this.moveFrogToRandomPosition();
        }, 500);
        
        this.updateDisplay();
        
        // Check if level is complete
        if (this.frogsCaught >= this.frogsToCatch) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        if (this.frogMoveInterval) {
            clearInterval(this.frogMoveInterval);
        }
        
        this.gameStarted = false;
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('final-caught').textContent = this.frogsCaught;
        document.getElementById('final-time').textContent = timeString;
        
        if (this.currentLevel < this.maxLevels) {
            this.showModal('level-complete-modal');
        } else {
            document.getElementById('final-score').textContent = `Total Frogs Caught: ${this.frogsCaught}`;
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
    
    updateDisplay() {
        document.getElementById('level-display').textContent = this.currentLevel;
        document.getElementById('caught-display').textContent = this.frogsCaught;
        
        const progress = (this.frogsCaught / this.frogsToCatch) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.setProperty('--progress', `${progress}%`);
        }
        
        document.getElementById('progress-text').textContent = 
            `Level ${this.currentLevel} - Catch ${this.frogsToCatch} frogs!`;
    }
    
    togglePause() {
        if (this.gameStarted) {
            this.gameStarted = false;
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
            }
            if (this.frogMoveInterval) {
                clearInterval(this.frogMoveInterval);
            }
        }
        this.showModal('pause-modal');
    }
    
    toggleMusic() {
        const musicToggle = document.getElementById('music-toggle');
        musicToggle.classList.toggle('muted');
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        if (modalId === 'pause-modal' && this.gameStarted) {
            this.startTimer();
            this.startFrogMovement();
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
                case 'catch':
                    oscillator.frequency.value = 600;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
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
    new CatchFrogGame();
}); 