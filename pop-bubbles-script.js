// Pop the Bubbles Game Script
class PopBubblesGame {
    constructor() {
        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.score = 0;
        this.timeRemaining = 60;
        this.bubblesPopped = 0;
        this.bubblesRequired = 10;
        this.maxBubbles = 8;
        this.bubbles = [];
        this.gameTimer = null;
        this.bubbleSpawnTimer = null;
        
        // DOM elements
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score');
        this.bubblesElement = document.getElementById('bubbles-popped');
        this.levelElement = document.getElementById('current-level');
        this.timeElement = document.getElementById('timer');
        this.targetScoreElement = document.getElementById('target-score');
        
        // Check if elements exist
        console.log('DOM elements found:', {
            gameArea: !!this.gameArea,
            scoreElement: !!this.scoreElement,
            bubblesElement: !!this.bubblesElement,
            levelElement: !!this.levelElement,
            timeElement: !!this.timeElement,
            targetScoreElement: !!this.targetScoreElement
        });
        
        // Modals
        this.levelCompleteModal = document.getElementById('celebration');
        this.gameCompleteModal = document.getElementById('game-complete');
        this.pauseModal = document.getElementById('pause-modal');
        this.gameOverModal = document.getElementById('game-over');
        
        // Audio context for sound effects
        this.audioContext = null;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initAudio();
        this.updateDisplay();
        this.startLevel(); // Start immediately instead of showing modal first
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported');
            this.soundEnabled = false;
        }
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('back-to-menu').addEventListener('click', () => this.goHome());
        
        // Modal buttons - Level complete modal
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('replay-level-btn').addEventListener('click', () => this.restart());
        
        // Game complete modal  
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('menu-btn').addEventListener('click', () => this.goHome());
        
        // Game over modal
        document.getElementById('try-again-btn').addEventListener('click', () => this.restart());
        document.getElementById('game-over-menu-btn').addEventListener('click', () => this.goHome());
        
        // Pause modal
        document.getElementById('resume-btn').addEventListener('click', () => this.resume());
        document.getElementById('pause-menu-btn').addEventListener('click', () => this.goHome());
        
        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => this.restart());
        
        // Touch and click handling for game area
        this.gameArea.addEventListener('click', (e) => this.handleGameAreaClick(e));
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleGameAreaClick(e.touches[0]);
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent context menu on long press
        this.gameArea.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleKeyPress(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePause();
                break;
            case 'Escape':
                if (this.isPlaying && !this.isPaused) {
                    this.togglePause();
                }
                break;
        }
    }
    
    handleGameAreaClick(event) {
        if (!this.isPlaying || this.isPaused) return;
        
        const rect = this.gameArea.getBoundingClientRect();
        const x = (event.clientX || event.pageX) - rect.left;
        const y = (event.clientY || event.pageY) - rect.top;
        
        // Check if click/touch hit a bubble
        const hitBubble = this.findBubbleAt(x, y);
        if (hitBubble) {
            this.popBubble(hitBubble);
        } else {
            // Miss - create a small visual feedback
            this.createMissEffect(x, y);
        }
    }
    
    findBubbleAt(x, y) {
        return this.bubbles.find(bubble => {
            const bubbleRect = bubble.element.getBoundingClientRect();
            const gameAreaRect = this.gameArea.getBoundingClientRect();
            const bubbleX = bubbleRect.left - gameAreaRect.left + bubbleRect.width / 2;
            const bubbleY = bubbleRect.top - gameAreaRect.top + bubbleRect.height / 2;
            const radius = bubbleRect.width / 2;
            
            const distance = Math.sqrt(Math.pow(x - bubbleX, 2) + Math.pow(y - bubbleY, 2));
            return distance <= radius && !bubble.isPopping;
        });
    }
    
    createMissEffect(x, y) {
        const missEffect = document.createElement('div');
        missEffect.style.position = 'absolute';
        missEffect.style.left = x - 10 + 'px';
        missEffect.style.top = y - 10 + 'px';
        missEffect.style.width = '20px';
        missEffect.style.height = '20px';
        missEffect.style.background = 'rgba(255, 255, 255, 0.6)';
        missEffect.style.borderRadius = '50%';
        missEffect.style.pointerEvents = 'none';
        missEffect.style.animation = 'missEffect 0.5s ease-out forwards';
        
        // Add miss effect animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes missEffect {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(3); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        this.gameArea.appendChild(missEffect);
        setTimeout(() => {
            this.gameArea.removeChild(missEffect);
        }, 500);
    }
    
    startLevel() {
        console.log('Starting level:', this.currentLevel); // Debug log
        this.isPlaying = true;
        this.isPaused = false;
        this.bubblesPopped = 0;
        this.timeRemaining = Math.max(30, 60 - (this.currentLevel - 1) * 5); // Decrease time per level
        this.bubblesRequired = Math.min(50, 10 + (this.currentLevel - 1) * 5); // Increase required bubbles
        this.maxBubbles = Math.min(15, 5 + Math.floor(this.currentLevel / 2)); // Increase max bubbles
        
        this.hideAllModals();
        this.clearBubbles();
        this.updateDisplay();
        this.startGameTimer();
        this.startBubbleSpawning();
        
        // Create initial bubbles
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createBubble(), i * 500);
        }
        
        this.playSound('start');
        console.log('Level started, should see bubbles soon'); // Debug log
    }
    
    nextLevel() {
        this.currentLevel++;
        this.hideAllModals();
        this.startLevel();
    }
    
    popBubble(bubble) {
        if (bubble.isPopping) return;
        
        bubble.isPopping = true;
        bubble.element.classList.add('popping');
        
        // Calculate points based on bubble type and size
        let points = 10;
        if (bubble.element.classList.contains('golden')) points = 50;
        else if (bubble.element.classList.contains('rainbow')) points = 100;
        else if (bubble.element.classList.contains('small')) points = 15;
        else if (bubble.element.classList.contains('large')) points = 5;
        
        this.score += points;
        this.bubblesPopped++;
        
        console.log(`Bubble popped! Points: ${points}, Total Score: ${this.score}, Bubbles: ${this.bubblesPopped}`);
        
        // Show score popup
        this.showScorePopup(bubble.element, points);
        
        // Remove bubble after animation
        setTimeout(() => {
            this.removeBubble(bubble);
        }, 300);
        
        this.playSound('pop', bubble.element.classList.contains('golden') ? 'golden' : 
                            bubble.element.classList.contains('rainbow') ? 'rainbow' : 'normal');
        
        this.updateDisplay();
        this.checkLevelComplete();
    }
    
    showScorePopup(bubbleElement, points) {
        const popup = document.createElement('div');
        popup.textContent = `+${points}`;
        popup.style.position = 'absolute';
        popup.style.left = bubbleElement.style.left;
        popup.style.top = bubbleElement.style.top;
        popup.style.color = '#FFD700';
        popup.style.fontSize = '1.5rem';
        popup.style.fontWeight = 'bold';
        popup.style.pointerEvents = 'none';
        popup.style.zIndex = '1000';
        popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        popup.style.animation = 'scorePopup 1s ease-out forwards';
        
        // Add score popup animation if not exists
        if (!document.querySelector('#scorePopupStyle')) {
            const style = document.createElement('style');
            style.id = 'scorePopupStyle';
            style.textContent = `
                @keyframes scorePopup {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.gameArea.appendChild(popup);
        setTimeout(() => {
            if (popup.parentNode) {
                this.gameArea.removeChild(popup);
            }
        }, 1000);
    }
    
    createBubble() {
        if (this.bubbles.length >= this.maxBubbles || !this.isPlaying || this.isPaused) return;
        
        const bubble = {
            element: document.createElement('div'),
            id: Date.now() + Math.random(),
            isPopping: false
        };
        
        bubble.element.className = 'bubble';
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const sizeWeights = [0.4, 0.4, 0.2]; // Favor smaller bubbles
        bubble.element.classList.add(this.weightedRandom(sizes, sizeWeights));
        
        // Special bubble types (rare)
        const rand = Math.random();
        if (rand < 0.05 && this.currentLevel >= 3) { // 5% chance for rainbow, level 3+
            bubble.element.classList.add('rainbow');
        } else if (rand < 0.15 && this.currentLevel >= 2) { // 10% chance for golden, level 2+
            bubble.element.classList.add('golden');
        } else {
            // Regular colored bubble
            const colorNum = Math.floor(Math.random() * 6) + 1;
            bubble.element.classList.add(`color-${colorNum}`);
        }
        
        // Random position (ensure game area has dimensions)
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const gameAreaWidth = Math.max(gameAreaRect.width, 400); // Minimum width
        const gameAreaHeight = Math.max(gameAreaRect.height, 300); // Minimum height
        
        const bubbleSize = bubble.element.classList.contains('small') ? 60 :
                          bubble.element.classList.contains('medium') ? 80 : 100;
        
        const maxX = Math.max(gameAreaWidth - bubbleSize, 50);
        const maxY = Math.max(gameAreaHeight - bubbleSize, 50);
        
        bubble.element.style.left = Math.random() * maxX + 'px';
        bubble.element.style.top = Math.random() * maxY + 'px';
        
        // Ensure bubble doesn't overlap with existing bubbles
        let attempts = 0;
        while (this.checkBubbleOverlap(bubble) && attempts < 10) {
            bubble.element.style.left = Math.random() * maxX + 'px';
            bubble.element.style.top = Math.random() * maxY + 'px';
            attempts++;
        }
        
        console.log(`Creating bubble at ${bubble.element.style.left}, ${bubble.element.style.top}`); // Debug log
        
        this.gameArea.appendChild(bubble.element);
        this.bubbles.push(bubble);
        
        // Auto-remove bubble after some time (makes game more dynamic)
        setTimeout(() => {
            if (!bubble.isPopping) {
                this.removeBubble(bubble);
            }
        }, 5000 + Math.random() * 3000);
    }
    
    checkBubbleOverlap(newBubble) {
        const newRect = newBubble.element.getBoundingClientRect();
        return this.bubbles.some(existingBubble => {
            const existingRect = existingBubble.element.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(newRect.left - existingRect.left, 2) + 
                Math.pow(newRect.top - existingRect.top, 2)
            );
            return distance < 80; // Minimum distance between bubbles
        });
    }
    
    removeBubble(bubble) {
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
            this.bubbles.splice(index, 1);
            if (bubble.element.parentNode) {
                this.gameArea.removeChild(bubble.element);
            }
        }
    }
    
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (!this.isPaused) {
                this.timeRemaining--;
                this.updateDisplay();
                
                if (this.timeRemaining <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    startBubbleSpawning() {
        const spawnInterval = Math.max(500, 2000 - (this.currentLevel - 1) * 100);
        this.bubbleSpawnTimer = setInterval(() => {
            if (!this.isPaused) {
                this.createBubble();
            }
        }, spawnInterval);
    }
    
    checkLevelComplete() {
        if (this.bubblesPopped >= this.bubblesRequired) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.isPlaying = false;
        this.clearTimers();
        
        // Bonus points for remaining time
        const timeBonus = this.timeRemaining * 5;
        this.score += timeBonus;
        
        if (this.currentLevel >= 10) {
            this.showGameCompleteModal();
        } else {
            this.showLevelCompleteModal();
        }
        
        this.playSound('levelComplete');
    }
    
    endGame() {
        this.isPlaying = false;
        this.clearTimers();
        this.showGameOverModal();
        this.playSound('gameOver');
    }
    
    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showPauseModal();
        } else {
            this.hidePauseModal();
        }
    }
    
    resume() {
        this.isPaused = false;
        this.hidePauseModal();
    }
    
    restart() {
        this.currentLevel = 1;
        this.score = 0;
        this.clearTimers();
        this.clearBubbles();
        this.hideAllModals();
        this.startLevel();
    }
    
    playAgain() {
        this.restart();
    }
    
    goHome() {
        window.location.href = 'menu.html';
    }
    
    clearTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.bubbleSpawnTimer) {
            clearInterval(this.bubbleSpawnTimer);
            this.bubbleSpawnTimer = null;
        }
    }
    
    clearBubbles() {
        this.bubbles.forEach(bubble => {
            if (bubble.element.parentNode) {
                this.gameArea.removeChild(bubble.element);
            }
        });
        this.bubbles = [];
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.bubblesElement.textContent = this.bubblesPopped;
        this.levelElement.textContent = this.currentLevel;
        this.timeElement.textContent = this.timeRemaining;
        this.targetScoreElement.textContent = this.bubblesRequired;
        
        // Update stats in modals
        document.getElementById('level-bubbles').textContent = this.bubblesPopped;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('total-bubbles').textContent = this.bubblesPopped;
        document.getElementById('game-over-bubbles').textContent = this.bubblesPopped;
        
        // Update time bonus in level complete modal
        const timeBonus = this.timeRemaining * 5;
        document.getElementById('time-bonus').textContent = timeBonus;
    }
    
    // Modal management
    showLevelCompleteModal() {
        this.updateDisplay();
        this.levelCompleteModal.classList.add('show');
    }
    
    showGameCompleteModal() {
        this.updateDisplay();
        this.gameCompleteModal.classList.add('show');
    }
    
    showPauseModal() {
        this.pauseModal.classList.add('show');
    }
    
    hidePauseModal() {
        this.pauseModal.classList.remove('show');
    }
    
    showGameOverModal() {
        this.updateDisplay();
        this.gameOverModal.classList.add('show');
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Sound effects using Web Audio API
    playSound(type, variant = 'normal') {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency, duration, gainValue;
            
            switch (type) {
                case 'pop':
                    if (variant === 'golden') {
                        frequency = 800;
                        gainValue = 0.3;
                    } else if (variant === 'rainbow') {
                        frequency = 1200;
                        gainValue = 0.4;
                    } else {
                        frequency = 400 + Math.random() * 400;
                        gainValue = 0.2;
                    }
                    duration = 0.1;
                    oscillator.type = 'sine';
                    break;
                    
                case 'start':
                    frequency = 523.25; // C5
                    duration = 0.3;
                    gainValue = 0.3;
                    oscillator.type = 'triangle';
                    break;
                    
                case 'levelComplete':
                    // Play a cheerful melody
                    this.playMelody([523.25, 659.25, 783.99, 1046.5], [0.2, 0.2, 0.2, 0.4]);
                    return;
                    
                case 'gameOver':
                    frequency = 220;
                    duration = 0.5;
                    gainValue = 0.2;
                    oscillator.type = 'sawtooth';
                    break;
                    
                default:
                    frequency = 440;
                    duration = 0.2;
                    gainValue = 0.2;
                    oscillator.type = 'sine';
            }
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(gainValue, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }
    
    playMelody(frequencies, durations) {
        let currentTime = this.audioContext.currentTime;
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, currentTime);
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + durations[index]);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + durations[index]);
            
            currentTime += durations[index];
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new PopBubblesGame();
    window.popBubblesGame = game; // Store globally for debugging
});

// Handle page visibility changes (pause when tab becomes inactive)
document.addEventListener('visibilitychange', () => {
    const game = window.popBubblesGame;
    if (game && document.hidden && game.isPlaying && !game.isPaused) {
        game.togglePause();
    }
});

// Prevent zoom on double tap for better mobile experience
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
