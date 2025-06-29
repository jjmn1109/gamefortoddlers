// Shape Sorter Game Script

class ShapeSorterGame {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 5;
        this.score = 0;
        this.streak = 0;
        this.currentShape = null;
        this.shapeOptions = [];
        this.shapesPerLevel = 5;
        this.currentRound = 1;
        this.hintsUsed = 0;
        this.maxHints = 3;
        this.isPlaying = false;
        this.isPaused = false;
        this.draggedElement = null;

        // Shape database with progressive difficulty
        this.shapes = {
            1: [ // Level 1 - Basic shapes
                { name: 'Circle', class: 'circle' },
                { name: 'Square', class: 'square' }
            ],
            2: [ // Level 2 - Add triangle
                { name: 'Circle', class: 'circle' },
                { name: 'Square', class: 'square' },
                { name: 'Triangle', class: 'triangle' }
            ],
            3: [ // Level 3 - Add star
                { name: 'Circle', class: 'circle' },
                { name: 'Square', class: 'square' },
                { name: 'Triangle', class: 'triangle' },
                { name: 'Star', class: 'star' }
            ],
            4: [ // Level 4 - Add pentagon
                { name: 'Circle', class: 'circle' },
                { name: 'Square', class: 'square' },
                { name: 'Triangle', class: 'triangle' },
                { name: 'Star', class: 'star' },
                { name: 'Pentagon', class: 'pentagon' }
            ],
            5: [ // Level 5 - All shapes with more complexity
                { name: 'Circle', class: 'circle' },
                { name: 'Square', class: 'square' },
                { name: 'Triangle', class: 'triangle' },
                { name: 'Star', class: 'star' },
                { name: 'Pentagon', class: 'pentagon' }
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
        } else {
            button.classList.remove('muted');
            button.textContent = '🎵';
            this.isMusicPlaying = true;
        }
    }

    generateNewRound() {
        if (this.currentRound > this.shapesPerLevel) {
            this.completeLevel();
            return;
        }

        const levelShapes = this.shapes[this.currentLevel] || this.shapes[1];
        
        // Select target shape
        this.currentShape = levelShapes[Math.floor(Math.random() * levelShapes.length)];

        // Generate distractor shapes (fewer options for toddlers)
        const numOptions = Math.min(2 + this.currentLevel, 5); // 3-5 options based on level
        this.shapeOptions = [this.currentShape];

        // Add distractor shapes from current level
        const availableShapes = levelShapes.filter(shape => 
            shape.name !== this.currentShape.name
        );

        // If we need more options, add from previous levels
        if (availableShapes.length < numOptions - 1) {
            for (let i = 1; i < this.currentLevel; i++) {
                if (this.shapes[i]) {
                    availableShapes.push(...this.shapes[i].filter(shape => 
                        shape.name !== this.currentShape.name && 
                        !availableShapes.some(existing => existing.name === shape.name)
                    ));
                }
            }
        }

        while (this.shapeOptions.length < numOptions && availableShapes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableShapes.length);
            const shape = availableShapes.splice(randomIndex, 1)[0];
            
            // Avoid duplicates
            if (!this.shapeOptions.some(existing => existing.name === shape.name)) {
                this.shapeOptions.push(shape);
            }
        }

        // Shuffle options
        this.shapeOptions = this.shapeOptions.sort(() => Math.random() - 0.5);

        this.displayShapes();
        this.updateProgress();
    }

    displayShapes() {
        // Update instruction shape
        const instructionShape = document.getElementById('instruction-shape');
        const shapeName = document.getElementById('shape-name');

        instructionShape.className = `instruction-shape ${this.currentShape.class}`;
        shapeName.textContent = this.currentShape.name;

        // Create shape holes
        this.createShapeHoles();

        // Create draggable shapes
        this.createDraggableShapes();

        // Update hint button
        this.updateHintButton();
    }

    createShapeHoles() {
        const holesContainer = document.getElementById('shape-holes');
        holesContainer.innerHTML = '';

        this.shapeOptions.forEach((shape, index) => {
            const hole = document.createElement('div');
            hole.className = `shape-hole ${shape.class}`;
            hole.setAttribute('data-shape', shape.name);
            hole.setAttribute('tabindex', '0');
            hole.setAttribute('aria-label', `${shape.name} hole`);

            // Add drop events
            hole.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (this.draggedElement) {
                    hole.classList.add('highlight');
                }
            });

            hole.addEventListener('dragleave', () => {
                hole.classList.remove('highlight');
            });

            hole.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDrop(hole, this.draggedElement);
            });

            // Touch events for mobile
            hole.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });

            holesContainer.appendChild(hole);
        });
    }

    createDraggableShapes() {
        const shapesContainer = document.getElementById('draggable-shapes');
        shapesContainer.innerHTML = '';

        this.shapeOptions.forEach((shape, index) => {
            const shapeElement = document.createElement('div');
            shapeElement.className = `draggable-shape ${shape.class}`;
            shapeElement.setAttribute('data-shape', shape.name);
            shapeElement.setAttribute('draggable', 'true');
            shapeElement.setAttribute('tabindex', '0');
            shapeElement.setAttribute('aria-label', `Draggable ${shape.name}`);

            // Drag events
            shapeElement.addEventListener('dragstart', (e) => {
                this.draggedElement = shapeElement;
                shapeElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', shapeElement.outerHTML);
                
                // Force triangle styling during drag
                if (shape.class === 'triangle') {
                    this.enforceTriangleStyle(shapeElement);
                }
            });

            shapeElement.addEventListener('dragend', () => {
                shapeElement.classList.remove('dragging');
                this.clearHighlights();
                
                // Ensure triangle maintains its shape after drag
                if (shape.class === 'triangle') {
                    this.enforceTriangleStyle(shapeElement);
                }
            });

            // Touch events for mobile devices
            let touchStartX, touchStartY;
            
            shapeElement.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                shapeElement.classList.add('dragging');
                this.draggedElement = shapeElement;
                
                // Force triangle styling during touch
                if (shape.class === 'triangle') {
                    this.enforceTriangleStyle(shapeElement);
                }
            });

            shapeElement.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                shapeElement.style.position = 'fixed';
                shapeElement.style.left = `${touch.clientX - 45}px`;
                shapeElement.style.top = `${touch.clientY - 45}px`;
                shapeElement.style.zIndex = '1000';

                // Maintain triangle shape during drag
                if (shape.class === 'triangle') {
                    this.enforceTriangleStyle(shapeElement);
                }

                // Check if over a hole
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                this.clearHighlights();
                if (elementBelow && elementBelow.classList.contains('shape-hole')) {
                    elementBelow.classList.add('highlight');
                }
            });

            shapeElement.addEventListener('touchend', (e) => {
                const touch = e.changedTouches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                
                if (elementBelow && elementBelow.classList.contains('shape-hole')) {
                    this.handleDrop(elementBelow, shapeElement);
                }

                // Reset position
                shapeElement.style.position = '';
                shapeElement.style.left = '';
                shapeElement.style.top = '';
                shapeElement.style.zIndex = '';
                shapeElement.classList.remove('dragging');
                this.clearHighlights();
            });

            // Keyboard navigation
            shapeElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectShapeWithKeyboard(shape);
                }
            });

            shapesContainer.appendChild(shapeElement);
        });
    }

    selectShapeWithKeyboard(shape) {
        // For keyboard users, automatically place in correct hole
        const correctHole = document.querySelector(`[data-shape="${shape.name}"].shape-hole`);
        const shapeElement = document.querySelector(`[data-shape="${shape.name}"].draggable-shape`);
        
        if (correctHole && shapeElement) {
            this.handleDrop(correctHole, shapeElement);
        }
    }

    handleDrop(hole, draggedShape) {
        if (!hole || !draggedShape || this.isPaused) return;

        this.clearHighlights();
        
        const holeShape = hole.getAttribute('data-shape');
        const draggedShapeName = draggedShape.getAttribute('data-shape');

        if (holeShape === this.currentShape.name && draggedShapeName === this.currentShape.name) {
            // Correct match!
            hole.classList.add('correct');
            draggedShape.classList.add('placed');
            this.playCorrectSound();
            
            this.score += 20 + (this.currentLevel * 10);
            this.streak++;

            setTimeout(() => {
                this.currentRound++;
                this.generateNewRound();
            }, 1500);

        } else {
            // Incorrect match
            this.playIncorrectSound();
            this.streak = 0;
            
            // Visual feedback for wrong answer
            hole.style.background = 'rgba(255, 0, 0, 0.3)';
            setTimeout(() => {
                hole.style.background = '';
            }, 600);
        }

        this.updateDisplay();
    }

    clearHighlights() {
        document.querySelectorAll('.shape-hole.highlight').forEach(hole => {
            hole.classList.remove('highlight');
        });
    }

    enforceTriangleStyle(element) {
        // Force triangle styling to prevent it from becoming a square
        element.style.background = 'linear-gradient(135deg, #ffa726, #ff9800)';
        element.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        element.style.border = 'none';
        element.style.borderRadius = '0';
        element.style.width = '90px';
        element.style.height = '78px';
    }

    showHint() {
        if (this.hintsUsed >= this.maxHints) return;

        this.hintsUsed++;
        
        // Highlight the correct hole
        const correctHole = document.querySelector(`[data-shape="${this.currentShape.name}"].shape-hole`);
        const correctShape = document.querySelector(`[data-shape="${this.currentShape.name}"].draggable-shape`);
        
        if (correctHole) {
            correctHole.classList.add('highlight');
            setTimeout(() => {
                correctHole.classList.remove('highlight');
            }, 3000);
        }

        if (correctShape) {
            correctShape.style.animation = 'hint-glow 1s ease-in-out 3';
            setTimeout(() => {
                correctShape.style.animation = '';
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
        
        message.textContent = `Level ${this.currentLevel} complete! You're a shape sorting expert!`;
        
        modal.style.display = 'block';
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
        this.draggedElement = null;
        
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
        
        const progress = ((this.currentRound - 1) / this.shapesPerLevel) * 100;
        progressBar.style.setProperty('--progress', `${progress}%`);
        progressText.textContent = `${this.currentRound - 1} / ${this.shapesPerLevel}`;
    }
}

// CSS for hint animation
const style = document.createElement('style');
style.textContent = `
    @keyframes hint-glow {
        0%, 100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
        50% { box-shadow: 0 0 30px #ffd700, 0 4px 12px rgba(0, 0, 0, 0.2); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Resume audio context on user interaction
    document.addEventListener('click', () => {
        if (window.game && window.game.audioContext && window.game.audioContext.state === 'suspended') {
            window.game.audioContext.resume();
        }
    }, { once: true });

    window.game = new ShapeSorterGame();
});
