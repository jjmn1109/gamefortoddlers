// Counting Fun Game Logic
class CountingFunGame {
    constructor() {
        // Game state
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.maxLevels = 8;
        this.questionsPerLevel = 5;
        
        // Current question state
        this.currentAnswer = 0;
        this.currentObjects = [];
        this.objectType = '';
        this.isPaused = false;
        this.isAnswering = false;
        
        // Object types for different levels
        this.objectTypes = [
            { emoji: '🍎', name: 'apples' },
            { emoji: '🌟', name: 'stars' },
            { emoji: '🎈', name: 'balloons' },
            { emoji: '🍪', name: 'cookies' },
            { emoji: '🦋', name: 'butterflies' },
            { emoji: '🌸', name: 'flowers' },
            { emoji: '🎾', name: 'balls' },
            { emoji: '🍓', name: 'strawberries' },
            { emoji: '🌙', name: 'moons' },
            { emoji: '🐠', name: 'fish' },
            { emoji: '🎨', name: 'paintbrushes' },
            { emoji: '🧸', name: 'teddy bears' }
        ];
        
        // DOM elements
        this.gameArea = document.getElementById('game-area');
        this.objectsContainer = document.getElementById('objects-container');
        this.questionText = document.getElementById('question-text');
        this.numberOptions = document.getElementById('number-options');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('current-level');
        this.streakElement = document.getElementById('streak');
        
        // Modals
        this.levelCompleteModal = document.getElementById('level-complete');
        this.gameCompleteModal = document.getElementById('game-complete');
        this.pauseModal = document.getElementById('pause-modal');
        this.gameOverModal = document.getElementById('game-over');
        this.hintModal = document.getElementById('hint-modal');
        
        // Audio context for sound effects
        this.audioContext = null;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initAudio();
        this.updateDisplay();
        this.startLevel();
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
        document.getElementById('back-to-menu').addEventListener('click', () => this.goHome());
        document.getElementById('new-game-btn').addEventListener('click', () => this.restart());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        
        // Modal buttons
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restart());
        document.getElementById('menu-btn').addEventListener('click', () => this.goHome());
        document.getElementById('try-again-btn').addEventListener('click', () => this.restart());
        document.getElementById('game-over-menu-btn').addEventListener('click', () => this.goHome());
        document.getElementById('resume-btn').addEventListener('click', () => this.resume());
        document.getElementById('pause-menu-btn').addEventListener('click', () => this.goHome());
        document.getElementById('close-hint-btn').addEventListener('click', () => this.closeHint());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (this.isAnswering) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.showHint();
                break;
            case 'Escape':
                if (!this.isPaused) {
                    this.togglePause();
                }
                break;
        }
        
        // Number keys to select answers (1-9)
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            this.selectAnswer(num);
        }
    }
    
    startLevel() {
        console.log(`Starting level ${this.currentLevel}`);
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.hideAllModals();
        this.generateQuestion();
    }
    
    generateQuestion() {
        if (this.questionsAnswered >= this.questionsPerLevel) {
            this.completeLevel();
            return;
        }
        
        this.isAnswering = false;
        
        // Clear previous question
        this.objectsContainer.innerHTML = '';
        this.numberOptions.innerHTML = '';
        
        // Select object type for this question
        const objectTypeIndex = Math.floor(Math.random() * this.objectTypes.length);
        this.objectType = this.objectTypes[objectTypeIndex];
        
        // Determine count based on level (1-9, increasing with level)
        const maxCount = Math.min(3 + this.currentLevel, 9);
        this.currentAnswer = Math.floor(Math.random() * maxCount) + 1;
        
        // Create objects
        this.createObjects();
        
        // Update question text
        this.questionText.textContent = `How many ${this.objectType.name} do you see?`;
        
        // Create number options
        this.createNumberOptions();
        
        this.updateDisplay();
        this.playSound('question');
    }
    
    createObjects() {
        this.currentObjects = [];
        
        // Create the correct number of objects
        for (let i = 0; i < this.currentAnswer; i++) {
            const object = document.createElement('div');
            object.className = 'counting-object';
            object.textContent = this.objectType.emoji;
            object.dataset.index = i;
            
            // Add click handler for interactive counting
            object.addEventListener('click', () => this.countObject(object));
            
            // Stagger animation
            setTimeout(() => {
                this.objectsContainer.appendChild(object);
            }, i * 200);
            
            this.currentObjects.push(object);
        }
    }
    
    countObject(objectElement) {
        if (objectElement.classList.contains('counted')) {
            // Uncount if already counted
            objectElement.classList.remove('counted');
            this.playSound('uncount');
        } else {
            // Count the object
            objectElement.classList.add('counted');
            this.playSound('count');
        }
    }
    
    createNumberOptions() {
        // Create options around the correct answer
        const options = new Set();
        options.add(this.currentAnswer);
        
        // Add other options
        const maxOptions = Math.min(6, 3 + Math.floor(this.currentLevel / 2));
        const maxNumber = Math.min(9, Math.max(this.currentAnswer + 2, 5));
        
        while (options.size < maxOptions) {
            const option = Math.floor(Math.random() * maxNumber) + 1;
            options.add(option);
        }
        
        // Convert to array and shuffle
        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        
        // Create buttons
        optionsArray.forEach(number => {
            const button = document.createElement('button');
            button.className = 'number-btn';
            button.textContent = number;
            button.dataset.number = number;
            button.addEventListener('click', () => this.selectAnswer(number));
            this.numberOptions.appendChild(button);
        });
    }
    
    selectAnswer(selectedNumber) {
        if (this.isAnswering || this.isPaused) return;
        
        // Find the clicked button and check if it's already been clicked
        const clickedButton = this.numberOptions.querySelector(`[data-number="${selectedNumber}"]`);
        if (clickedButton.classList.contains('clicked') || clickedButton.classList.contains('correct') || clickedButton.classList.contains('wrong')) {
            return; // Prevent multiple clicks on the same button
        }
        
        // Add clicked class to prevent rapid clicks
        clickedButton.classList.add('clicked');
        
        this.isAnswering = true;
        const correct = selectedNumber === this.currentAnswer;
        
        const correctButton = this.numberOptions.querySelector(`[data-number="${this.currentAnswer}"]`);
        
        if (correct) {
            // Correct answer
            clickedButton.classList.add('correct');
            this.score += 10 * this.currentLevel;
            this.streak++;
            this.correctAnswers++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
            this.playSound('correct');
            
            // Animate all objects
            this.currentObjects.forEach((obj, index) => {
                setTimeout(() => {
                    obj.style.animation = 'correctPulse 0.6s ease-out';
                }, index * 100);
            });
            
        } else {
            // Wrong answer
            clickedButton.classList.add('wrong');
            correctButton.classList.add('correct');
            this.streak = 0;
            this.playSound('wrong');
        }
        
        this.questionsAnswered++;
        this.updateDisplay();
        
        // Move to next question after delay
        setTimeout(() => {
            this.generateQuestion();
        }, 2000);
    }
    
    showHint() {
        if (this.isPaused || this.isAnswering) return;
        
        const hintContent = document.getElementById('hint-content');
        const hintAnimation = document.getElementById('hint-animation');
        
        // Clear previous hint
        hintAnimation.innerHTML = '';
        
        // Create animated counting sequence
        let count = 0;
        const hintInterval = setInterval(() => {
            if (count < this.currentAnswer) {
                const hintObject = document.createElement('span');
                hintObject.className = 'hint-object';
                hintObject.textContent = this.objectType.emoji;
                hintAnimation.appendChild(hintObject);
                count++;
                this.playSound('count');
            } else {
                clearInterval(hintInterval);
                
                // Show the number
                setTimeout(() => {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'hint-number';
                    numberSpan.textContent = ` = ${this.currentAnswer}`;
                    hintAnimation.appendChild(numberSpan);
                    this.playSound('correct');
                }, 500);
            }
        }, 800);
        
        this.hintModal.classList.add('show');
    }
    
    closeHint() {
        this.hintModal.classList.remove('show');
    }
    
    completeLevel() {
        const isLastLevel = this.currentLevel >= this.maxLevels;
        
        // Update modal content
        document.getElementById('level-correct').textContent = this.correctAnswers;
        document.getElementById('level-score').textContent = this.score;
        
        if (isLastLevel) {
            this.showGameCompleteModal();
        } else {
            this.showLevelCompleteModal();
        }
        
        this.playSound('levelComplete');
    }
    
    nextLevel() {
        this.currentLevel++;
        this.hideAllModals();
        this.startLevel();
    }
    
    replayLevel() {
        this.hideAllModals();
        this.startLevel();
    }
    
    restart() {
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.hideAllModals();
        this.startLevel();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseModal.classList.add('show');
        } else {
            this.pauseModal.classList.remove('show');
        }
    }
    
    resume() {
        this.isPaused = false;
        this.pauseModal.classList.remove('show');
    }
    
    goHome() {
        window.location.href = 'menu.html';
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.currentLevel;
        this.streakElement.textContent = this.streak;
        
        // Update modal content
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('best-streak').textContent = this.bestStreak;
        document.getElementById('game-over-score').textContent = this.score;
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
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Sound effects
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            let frequency, duration, gainValue;
            
            switch (type) {
                case 'count':
                    frequency = 440 + Math.random() * 200;
                    duration = 0.2;
                    gainValue = 0.3;
                    oscillator.type = 'sine';
                    break;
                    
                case 'uncount':
                    frequency = 300;
                    duration = 0.1;
                    gainValue = 0.2;
                    oscillator.type = 'triangle';
                    break;
                    
                case 'correct':
                    this.playMelody([523.25, 659.25, 783.99], [0.2, 0.2, 0.4]);
                    return;
                    
                case 'wrong':
                    frequency = 200;
                    duration = 0.3;
                    gainValue = 0.2;
                    oscillator.type = 'sawtooth';
                    break;
                    
                case 'question':
                    frequency = 329.63; // E4
                    duration = 0.3;
                    gainValue = 0.3;
                    oscillator.type = 'triangle';
                    break;
                    
                case 'levelComplete':
                    this.playMelody([523.25, 659.25, 783.99, 1046.5], [0.2, 0.2, 0.2, 0.5]);
                    return;
                    
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
    const game = new CountingFunGame();
    window.countingFunGame = game; // Store globally for debugging
});

// Handle page visibility changes (pause when tab becomes inactive)
document.addEventListener('visibilitychange', () => {
    const game = window.countingFunGame;
    if (game && document.hidden && !game.isPaused) {
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
