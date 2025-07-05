// Letter Learning Game Logic
class LetterLearningGame {
    constructor() {
        this.currentLetterIndex = 0;
        this.score = 0;
        this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.letterWords = {
            'A': 'Apple', 'B': 'Ball', 'C': 'Cat', 'D': 'Dog', 'E': 'Elephant',
            'F': 'Fish', 'G': 'Giraffe', 'H': 'House', 'I': 'Ice Cream', 'J': 'Jump',
            'K': 'Kite', 'L': 'Lion', 'M': 'Moon', 'N': 'Nest', 'O': 'Orange',
            'P': 'Pig', 'Q': 'Queen', 'R': 'Rainbow', 'S': 'Star', 'T': 'Tree',
            'U': 'Umbrella', 'V': 'Violin', 'W': 'Water', 'X': 'Xylophone', 'Y': 'Yellow', 'Z': 'Zebra'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadLetter(this.currentLetterIndex);
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
        
        // Sound button
        document.getElementById('sound-btn').addEventListener('click', () => {
            this.playLetterSound();
        });
        
        // Modal buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.hideModal('pause-modal');
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        document.getElementById('next-letter-btn').addEventListener('click', () => {
            this.nextLetter();
        });
        
        document.getElementById('letter-menu-btn').addEventListener('click', () => {
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
            
            // Number keys 1-9 for quick letter selection
            const key = e.key.toUpperCase();
            if (this.alphabet.includes(key)) {
                this.selectLetter(key);
            }
        });
    }
    
    loadLetter(index) {
        this.currentLetterIndex = index;
        const letter = this.alphabet[index];
        const word = this.letterWords[letter];
        
        // Update main letter display
        document.getElementById('main-letter').textContent = letter;
        document.getElementById('letter-name').textContent = `${letter} is for ${word}`;
        document.getElementById('letter-display').textContent = letter;
        
        // Generate letter options
        this.generateLetterOptions(letter);
        
        // Update progress
        this.updateProgress();
    }
    
    generateLetterOptions(correctLetter) {
        const optionsContainer = document.getElementById('letter-options');
        optionsContainer.innerHTML = '';
        
        // Create array of 3 letters including the correct one
        let options = [correctLetter];
        
        // Add 2 random different letters
        while (options.length < 3) {
            const randomLetter = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
            if (!options.includes(randomLetter)) {
                options.push(randomLetter);
            }
        }
        
        // Shuffle the options
        options = this.shuffleArray(options);
        
        // Create option buttons
        options.forEach(letter => {
            const optionButton = document.createElement('button');
            optionButton.className = 'letter-option';
            optionButton.textContent = letter;
            optionButton.addEventListener('click', () => this.selectLetter(letter));
            optionsContainer.appendChild(optionButton);
        });
    }
    
    selectLetter(selectedLetter) {
        const correctLetter = this.alphabet[this.currentLetterIndex];
        const optionButtons = document.querySelectorAll('.letter-option');
        
        // Disable all buttons temporarily
        optionButtons.forEach(btn => btn.style.pointerEvents = 'none');
        
        if (selectedLetter === correctLetter) {
            // Correct answer
            this.score += 10;
            this.playSound('correct');
            
            // Find and highlight the correct button
            optionButtons.forEach(btn => {
                if (btn.textContent === selectedLetter) {
                    btn.classList.add('correct');
                }
            });
            
            // Show celebration after a short delay
            setTimeout(() => {
                this.completeLetter();
            }, 1000);
        } else {
            // Wrong answer
            this.playSound('wrong');
            
            // Find and highlight the wrong button
            optionButtons.forEach(btn => {
                if (btn.textContent === selectedLetter) {
                    btn.classList.add('wrong');
                }
            });
            
            // Re-enable buttons after animation
            setTimeout(() => {
                optionButtons.forEach(btn => {
                    btn.classList.remove('wrong');
                    btn.style.pointerEvents = 'auto';
                });
            }, 600);
        }
        
        this.updateDisplay();
    }
    
    completeLetter() {
        const letter = this.alphabet[this.currentLetterIndex];
        const word = this.letterWords[letter];
        
        // Update celebration modal
        document.getElementById('letter-complete-message').textContent = `You found the letter ${letter}!`;
        document.getElementById('celebration-letter').textContent = letter;
        document.getElementById('celebration-word').textContent = word;
        
        if (this.currentLetterIndex < this.alphabet.length - 1) {
            this.showModal('letter-complete-modal');
        } else {
            // Game complete
            document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
            this.showModal('game-complete-modal');
        }
    }
    
    nextLetter() {
        this.hideModal('letter-complete-modal');
        this.currentLetterIndex++;
        this.loadLetter(this.currentLetterIndex);
    }
    
    restartGame() {
        this.hideModal('game-complete-modal');
        this.currentLetterIndex = 0;
        this.score = 0;
        this.loadLetter(0);
    }
    
    updateDisplay() {
        document.getElementById('score-display').textContent = this.score;
        this.updateProgress();
    }
    
    updateProgress() {
        const progress = ((this.currentLetterIndex + 1) / this.alphabet.length) * 100;
        document.querySelector('.progress-bar::before').style.width = `${progress}%`;
        document.getElementById('progress-display').textContent = `${this.currentLetterIndex + 1}/26`;
        document.getElementById('progress-text').textContent = `${this.currentLetterIndex + 1} / 26 letters learned`;
    }
    
    playLetterSound() {
        const letter = this.alphabet[this.currentLetterIndex];
        const word = this.letterWords[letter];
        
        // Use speech synthesis to pronounce the letter and word
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`${letter} is for ${word}`);
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            speechSynthesis.speak(utterance);
        }
        
        this.playSound('letter');
    }
    
    togglePause() {
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
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'correct':
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
                    
                case 'letter':
                    oscillator.frequency.value = 600;
                    oscillator.type = 'sine';
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
    new LetterLearningGame();
}); 