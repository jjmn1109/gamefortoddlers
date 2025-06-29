// Color Matching Game Script

class ColorMatchingGame {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 5;
        this.score = 0;
        this.streak = 0;
        this.targetColor = null;
        this.colorOptions = [];
        this.roundsPerLevel = 5;
        this.currentRound = 1;
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.isPlaying = false;
        this.isPaused = false;

        // Color database with high-contrast, toddler-friendly colors
        this.colors = {
            1: [ // Level 1 - Primary colors (very distinct)
                { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0] },
                { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255] },
                { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0] }
            ],
            2: [ // Level 2 - Add green (4 basic colors)
                { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0] },
                { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255] },
                { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0] },
                { name: 'Green', hex: '#00FF00', rgb: [0, 255, 0] }
            ],
            3: [ // Level 3 - Add orange and purple (very distinct)
                { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0] },
                { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255] },
                { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0] },
                { name: 'Green', hex: '#00FF00', rgb: [0, 255, 0] },
                { name: 'Orange', hex: '#FF8000', rgb: [255, 128, 0] },
                { name: 'Purple', hex: '#8000FF', rgb: [128, 0, 255] }
            ],
            4: [ // Level 4 - Add pink and brown (still very distinct)
                { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0] },
                { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255] },
                { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0] },
                { name: 'Green', hex: '#00FF00', rgb: [0, 255, 0] },
                { name: 'Orange', hex: '#FF8000', rgb: [255, 128, 0] },
                { name: 'Purple', hex: '#8000FF', rgb: [128, 0, 255] },
                { name: 'Pink', hex: '#FF69B4', rgb: [255, 105, 180] },
                { name: 'Brown', hex: '#8B4513', rgb: [139, 69, 19] }
            ],
            5: [ // Level 5 - Add black and white (maximum contrast)
                { name: 'Red', hex: '#FF0000', rgb: [255, 0, 0] },
                { name: 'Blue', hex: '#0000FF', rgb: [0, 0, 255] },
                { name: 'Yellow', hex: '#FFFF00', rgb: [255, 255, 0] },
                { name: 'Green', hex: '#00FF00', rgb: [0, 255, 0] },
                { name: 'Orange', hex: '#FF8000', rgb: [255, 128, 0] },
                { name: 'Purple', hex: '#8000FF', rgb: [128, 0, 255] },
                { name: 'Pink', hex: '#FF69B4', rgb: [255, 105, 180] },
                { name: 'Brown', hex: '#8B4513', rgb: [139, 69, 19] },
                { name: 'Black', hex: '#000000', rgb: [0, 0, 0] },
                { name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255] }
            ]
        };

        this.audioContext = null;
        this.backgroundMusic = null;
        this.isMusicPlaying = false;

        this.initializeGame();
        this.setupEventListeners();
        this.setupAudio();
    }

    initializeGame() {
        this.updateDisplay();
        this.generateNewRound();
    }

    setupEventListeners() {
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });

        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseGame();
        });

        // Modal buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
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
            this.resetGame();
        });

        document.getElementById('game-menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        // Music toggle
        document.getElementById('music-toggle').addEventListener('click', () => {
            this.toggleMusic();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isPaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
            } else if (e.key === 'h' || e.key === 'H') {
                this.showHint();
            }
        });
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(frequency, duration = 200, type = 'sine') {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }

    playCorrectSound() {
        this.playSound(523.25, 300); // C5
        setTimeout(() => this.playSound(659.25, 300), 150); // E5
        setTimeout(() => this.playSound(783.99, 500), 300); // G5
    }

    playIncorrectSound() {
        this.playSound(196, 500, 'sawtooth'); // G3
    }

    playLevelCompleteSound() {
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C, D, E, F, G
        notes.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 200), index * 100);
        });
    }

    playGameCompleteSound() {
        const melody = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        melody.forEach((note, index) => {
            setTimeout(() => this.playSound(note, 400), index * 200);
        });
    }

    toggleMusic() {
        const button = document.getElementById('music-toggle');
        if (this.isMusicPlaying) {
            button.classList.add('muted');
            button.textContent = '🔇';
            this.isMusicPlaying = false;
            // Stop background music if implemented
        } else {
            button.classList.remove('muted');
            button.textContent = '🎵';
            this.isMusicPlaying = true;
            // Start background music if implemented
        }
    }

    generateNewRound() {
        if (this.currentRound > this.roundsPerLevel) {
            this.completeLevel();
            return;
        }

        const levelColors = this.colors[this.currentLevel] || this.colors[1];
        
        // Select target color
        this.targetColor = levelColors[Math.floor(Math.random() * levelColors.length)];

        // Generate options (including target + distractors)
        const numOptions = Math.min(3 + this.currentLevel, 6); // 4-6 options based on level (fewer for toddlers)
        this.colorOptions = [this.targetColor];

        // Add distractor colors from CURRENT level only (to avoid too similar colors)
        const currentLevelColors = levelColors.filter(color => 
            color.name !== this.targetColor.name
        );

        // If we need more options than available in current level, add from previous levels
        const allAvailableColors = [];
        for (let i = 1; i <= this.currentLevel; i++) {
            if (this.colors[i]) {
                allAvailableColors.push(...this.colors[i]);
            }
        }
        
        const availableColors = allAvailableColors.filter(color => 
            color.name !== this.targetColor.name
        );

        // Remove duplicates by name
        const uniqueColors = availableColors.filter((color, index, self) => 
            index === self.findIndex(c => c.name === color.name)
        );

        while (this.colorOptions.length < numOptions && uniqueColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * uniqueColors.length);
            const color = uniqueColors.splice(randomIndex, 1)[0];
            this.colorOptions.push(color);
        }

        // Shuffle options
        this.colorOptions = this.colorOptions.sort(() => Math.random() - 0.5);

        this.displayColors();
        this.updateProgress();
    }

    displayColors() {
        // Update target color display
        const targetColorElement = document.getElementById('target-color');
        const colorNameElement = document.getElementById('color-name');

        targetColorElement.style.backgroundColor = this.targetColor.hex;
        
        // Special handling for white color visibility
        if (this.targetColor.hex.toLowerCase() === '#ffffff' || this.targetColor.name.toLowerCase() === 'white') {
            targetColorElement.style.border = '6px solid #333';
            targetColorElement.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
        } else {
            targetColorElement.style.border = '6px solid #fff';
            targetColorElement.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
        }
        
        colorNameElement.textContent = this.targetColor.name;

        // Update color grid
        const colorGrid = document.getElementById('color-grid');
        colorGrid.innerHTML = '';

        this.colorOptions.forEach((color, index) => {
            const colorElement = document.createElement('div');
            colorElement.className = 'color-option';
            colorElement.style.backgroundColor = color.hex;
            
            // Special handling for white color visibility
            if (color.hex.toLowerCase() === '#ffffff' || color.name.toLowerCase() === 'white') {
                colorElement.style.border = '4px solid #333';
                colorElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }
            
            colorElement.setAttribute('data-color', color.name);
            colorElement.setAttribute('tabindex', '0');
            colorElement.setAttribute('aria-label', `${color.name} color option`);

            // Add click event
            colorElement.addEventListener('click', () => {
                this.selectColor(color, colorElement);
            });

            // Add keyboard event
            colorElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectColor(color, colorElement);
                }
            });

            colorGrid.appendChild(colorElement);
        });

        // Update hint button
        this.updateHintButton();
    }

    selectColor(selectedColor, element) {
        if (this.isPaused) return;

        // Disable all color options temporarily
        const allOptions = document.querySelectorAll('.color-option');
        allOptions.forEach(option => {
            option.style.pointerEvents = 'none';
        });

        if (selectedColor.name === this.targetColor.name) {
            // Correct answer
            element.classList.add('correct');
            this.playCorrectSound();
            this.score += 10 + (this.currentLevel * 5);
            this.streak++;
            
            setTimeout(() => {
                this.currentRound++;
                this.generateNewRound();
                // Re-enable color options
                allOptions.forEach(option => {
                    option.style.pointerEvents = 'auto';
                    option.classList.remove('correct', 'incorrect');
                });
            }, 1000);
        } else {
            // Incorrect answer
            element.classList.add('incorrect');
            this.playIncorrectSound();
            this.streak = 0;
            
            setTimeout(() => {
                element.classList.remove('incorrect');
                // Re-enable color options
                allOptions.forEach(option => {
                    option.style.pointerEvents = 'auto';
                });
            }, 600);
        }

        this.updateDisplay();
    }

    showHint() {
        if (this.hintsUsed >= this.maxHints) return;

        this.hintsUsed++;
        const correctOption = document.querySelector(`[data-color="${this.targetColor.name}"]`);
        if (correctOption) {
            correctOption.classList.add('hint');
            setTimeout(() => {
                correctOption.classList.remove('hint');
            }, 3000);
        }

        this.updateHintButton();
    }

    updateHintButton() {
        const hintBtn = document.getElementById('hint-btn');
        const hintsLeft = this.maxHints - this.hintsUsed;
        hintBtn.textContent = `💡 Hint (${hintsLeft} left)`;
        hintBtn.disabled = hintsLeft === 0;
    }

    completeLevel() {
        this.playLevelCompleteSound();
        
        const modal = document.getElementById('level-complete-modal');
        const message = document.getElementById('level-complete-message');
        
        message.textContent = `Level ${this.currentLevel} complete! You found all the colors perfectly!`;
        
        modal.style.display = 'block';
        
        // Add celebration animation
        setTimeout(() => {
            modal.querySelector('.modal-content').style.animation = 'none';
            modal.querySelector('.modal-content').offsetHeight; // Trigger reflow
            modal.querySelector('.modal-content').style.animation = 'slideIn 0.3s ease';
        }, 100);
    }

    nextLevel() {
        document.getElementById('level-complete-modal').style.display = 'none';
        
        if (this.currentLevel >= this.maxLevel) {
            this.completeGame();
            return;
        }

        this.currentLevel++;
        this.currentRound = 1;
        this.hintsUsed = 0;
        this.generateNewRound();
        this.updateDisplay();
    }

    completeGame() {
        this.playGameCompleteSound();
        
        const modal = document.getElementById('game-complete-modal');
        const finalScore = document.getElementById('final-score');
        
        finalScore.textContent = `Final Score: ${this.score}`;
        modal.style.display = 'block';
    }

    pauseGame() {
        this.isPaused = true;
        document.getElementById('pause-modal').style.display = 'block';
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-modal').style.display = 'none';
    }

    resetGame() {
        document.getElementById('game-complete-modal').style.display = 'none';
        
        this.currentLevel = 1;
        this.currentRound = 1;
        this.score = 0;
        this.streak = 0;
        this.hintsUsed = 0;
        this.isPaused = false;
        
        this.updateDisplay();
        this.generateNewRound();
    }

    updateDisplay() {
        document.getElementById('level-display').textContent = this.currentLevel;
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('streak-display').textContent = this.streak;
    }

    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        const progress = ((this.currentRound - 1) / this.roundsPerLevel) * 100;
        progressBar.style.setProperty('--progress', `${progress}%`);
        progressText.textContent = `${this.currentRound - 1} / ${this.roundsPerLevel}`;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Resume audio context on user interaction
    document.addEventListener('click', () => {
        if (window.game && window.game.audioContext && window.game.audioContext.state === 'suspended') {
            window.game.audioContext.resume();
        }
    }, { once: true });

    window.game = new ColorMatchingGame();
});
