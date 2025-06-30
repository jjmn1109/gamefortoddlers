// Game state
let gameState = {
    animals: ['🐶', '🐱', '🐸', '🐵', '🦋', '🐧', '🐨', '🦊', '🐰', '🐼'],
    decorations: ['🌸', '🌺', '🌻', '🌷', '🍄', '🌳', '🌿', '☁️', '⭐', '🌈'],
    currentTarget: '',
    foundAnimals: [],
    score: 0,
    currentLevel: 1,
    totalAnimals: 5,
    gameAnimals: [],
    gameTimer: null,
    timeLeft: 60,
    isGameActive: false,
    levelConfig: {
        1: { animals: 5, distractors: 3, time: 60 },
        2: { animals: 6, distractors: 4, time: 55 },
        3: { animals: 7, distractors: 5, time: 50 },
        4: { animals: 8, distractors: 6, time: 45 },
        5: { animals: 9, distractors: 7, time: 40 },
        6: { animals: 10, distractors: 8, time: 35 }
    }
};

// Sound effects (using Web Audio API for simple beeps)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playSuccessSound() {
    // Happy ascending notes
    playSound(523, 0.2); // C
    setTimeout(() => playSound(659, 0.2), 100); // E
    setTimeout(() => playSound(784, 0.3), 200); // G
}

function playWinSound() {
    // Victory fanfare
    playSound(523, 0.3);
    setTimeout(() => playSound(659, 0.3), 150);
    setTimeout(() => playSound(784, 0.3), 300);
    setTimeout(() => playSound(1047, 0.5), 450);
}

function playGameOverSound() {
    // Sad descending notes
    playSound(400, 0.3);
    setTimeout(() => playSound(350, 0.3), 200);
    setTimeout(() => playSound(300, 0.5), 400);
}

function playLevelUpSound() {
    // Triumphant ascending notes
    playSound(523, 0.2); // C
    setTimeout(() => playSound(659, 0.2), 100); // E
    setTimeout(() => playSound(784, 0.2), 200); // G
    setTimeout(() => playSound(1047, 0.2), 300); // C
    setTimeout(() => playSound(1319, 0.4), 400); // E
}

// Game functions
function getRandomPosition(container, element) {
    const containerRect = container.getBoundingClientRect();
    const elementSize = 60; // Approximate size of emoji with padding
    
    const maxX = containerRect.width - elementSize - 20;
    const maxY = containerRect.height - elementSize - 20;
    
    const x = Math.random() * maxX + 10;
    const y = Math.random() * maxY + 10;
    
    return { x, y };
}

function checkOverlap(newPos, existingPositions, minDistance = 80) {
    return existingPositions.some(pos => {
        const distance = Math.sqrt(
            Math.pow(newPos.x - pos.x, 2) + Math.pow(newPos.y - pos.y, 2)
        );
        return distance < minDistance;
    });
}

function createAnimal(emoji, isTarget = false) {
    const animal = document.createElement('div');
    animal.className = 'animal';
    animal.textContent = emoji;
    animal.dataset.animal = emoji;
    
    if (isTarget) {
        animal.classList.add('target');
    }
    
    animal.addEventListener('click', () => handleAnimalClick(animal));
    
    return animal;
}

function createDecoration(emoji) {
    const decoration = document.createElement('div');
    decoration.className = 'decoration';
    decoration.textContent = emoji;
    return decoration;
}

function placeElements() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    const positions = [];
    
    // Place target animals and distractors
    gameState.gameAnimals.forEach(animalData => {
        const animal = createAnimal(animalData.emoji, animalData.isTarget);
        
        let position;
        let attempts = 0;
        do {
            position = getRandomPosition(gameArea, animal);
            attempts++;
        } while (checkOverlap(position, positions) && attempts < 50);
        
        positions.push(position);
        
        animal.style.left = position.x + 'px';
        animal.style.top = position.y + 'px';
        
        gameArea.appendChild(animal);
    });
    
    // Add decorative elements
    for (let i = 0; i < 8; i++) {
        const decoration = createDecoration(
            gameState.decorations[Math.floor(Math.random() * gameState.decorations.length)]
        );
        
        let position;
        let attempts = 0;
        do {
            position = getRandomPosition(gameArea, decoration);
            attempts++;
        } while (checkOverlap(position, positions, 60) && attempts < 30);
        
        if (attempts < 30) {
            positions.push(position);
            decoration.style.left = position.x + 'px';
            decoration.style.top = position.y + 'px';
            gameArea.appendChild(decoration);
        }
    }
}

function handleAnimalClick(animalElement) {
    if (!gameState.isGameActive) return;
    
    // Prevent multiple clicks on the same animal
    if (animalElement.classList.contains('found') || animalElement.classList.contains('clicking')) {
        return;
    }
    
    // Add clicking class to prevent rapid clicks
    animalElement.classList.add('clicking');
    
    playClickSound();
    
    const clickedAnimal = animalElement.dataset.animal;
    
    if (clickedAnimal === gameState.currentTarget) {
        // Correct animal found!
        animalElement.classList.add('found');
        gameState.foundAnimals.push(clickedAnimal);
        gameState.score++;
        
        playSuccessSound();
        updateScore();
        
        // Remove target highlighting from all animals
        document.querySelectorAll('.animal.target').forEach(el => {
            el.classList.remove('target');
        });
        
        // Remove clicking class since this animal is now found
        animalElement.classList.remove('clicking');
        
        setTimeout(() => {
            if (gameState.score >= gameState.totalAnimals) {
                completeLevel();
            } else {
                setNewTarget();
            }
        }, 1000);
    } else {
        // Wrong animal - give gentle feedback
        animalElement.style.animation = 'none';
        animalElement.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            animalElement.style.animation = '';
            animalElement.style.transform = '';
            // Remove clicking class after feedback animation
            animalElement.classList.remove('clicking');
        }, 200);
    }
}

function setNewTarget() {
    const availableTargets = gameState.gameAnimals.filter(
        animal => animal.isTarget && !gameState.foundAnimals.includes(animal.emoji)
    );
    
    if (availableTargets.length > 0) {
        const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        gameState.currentTarget = randomTarget.emoji;
        
        // Highlight the new target
        document.querySelectorAll('.animal').forEach(animal => {
            if (animal.dataset.animal === gameState.currentTarget && !animal.classList.contains('found')) {
                animal.classList.add('target');
            }
        });
        
        updateTargetDisplay();
    }
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('total-animals').textContent = gameState.totalAnimals;
}

function updateLevelDisplay() {
    document.getElementById('current-level').textContent = gameState.currentLevel;
}

function completeLevel() {
    stopTimer();
    
    const isMaxLevel = gameState.currentLevel >= Object.keys(gameState.levelConfig).length;
    
    if (isMaxLevel) {
        // Game completed!
        document.getElementById('celebration-title').textContent = '🏆 You Won! 🏆';
        document.getElementById('celebration-message').textContent = 'You completed all levels! You are amazing!';
        document.getElementById('next-level-btn').style.display = 'none';
        document.getElementById('celebration-new-game-btn').style.display = 'inline-block';
    } else {
        // Level completed, can advance
        document.getElementById('celebration-title').textContent = `🎉 Level ${gameState.currentLevel} Complete! 🎉`;
        document.getElementById('celebration-message').textContent = 'Great job finding all the animals!';
        document.getElementById('next-level-btn').style.display = 'inline-block';
        document.getElementById('celebration-new-game-btn').style.display = 'none';
    }
    
    playWinSound();
    document.getElementById('celebration').classList.add('show');
}

function startNextLevel() {
    gameState.currentLevel++;
    const levelConfig = gameState.levelConfig[gameState.currentLevel];
    
    if (levelConfig) {
        gameState.totalAnimals = levelConfig.animals;
        playLevelUpSound();
        hideCelebration();
        startNewGame(false); // Don't reset level
    }
}

function updateTargetDisplay() {
    document.getElementById('target-animal').textContent = gameState.currentTarget;
}

function showCelebration() {
    completeLevel();
}

function hideCelebration() {
    document.getElementById('celebration').classList.remove('show');
}

function hideGameOver() {
    document.getElementById('game-over').classList.remove('show');
}

function generateGameAnimals() {
    const levelConfig = gameState.levelConfig[gameState.currentLevel] || gameState.levelConfig[6];
    
    // Select random animals for targets
    const shuffledAnimals = [...gameState.animals].sort(() => Math.random() - 0.5);
    const targetAnimals = shuffledAnimals.slice(0, levelConfig.animals);
    
    // Create game animals array with targets and distractors
    gameState.gameAnimals = [];
    
    // Add target animals
    targetAnimals.forEach(emoji => {
        gameState.gameAnimals.push({ emoji, isTarget: true });
    });
    
    // Add distractor animals (animals that look similar but aren't targets)
    const remainingAnimals = shuffledAnimals.slice(levelConfig.animals);
    const numDistractors = Math.min(levelConfig.distractors, remainingAnimals.length);
    
    for (let i = 0; i < numDistractors; i++) {
        gameState.gameAnimals.push({ emoji: remainingAnimals[i], isTarget: false });
    }
    
    // Shuffle the final array
    gameState.gameAnimals.sort(() => Math.random() - 0.5);
    
    // Update total animals for this level
    gameState.totalAnimals = levelConfig.animals;
}

function startNewGame(resetLevel = true) {
    // Stop any existing timer
    stopTimer();
    
    // Reset game state
    if (resetLevel) {
        gameState.currentLevel = 1;
        gameState.totalAnimals = gameState.levelConfig[1].animals;
    }
    
    gameState.foundAnimals = [];
    gameState.score = 0;
    gameState.currentTarget = '';
    
    // Generate new game layout
    generateGameAnimals();
    placeElements();
    
    // Update displays
    updateLevelDisplay();
    updateScore();
    
    // Set first target and start timer
    setNewTarget();
    startTimer();
    
    hideCelebration();
    hideGameOver();
}

function showHint() {
    if (!gameState.isGameActive) return;
    
    playClickSound();
    
    // Make the target animal glow more prominently
    const targetAnimals = document.querySelectorAll('.animal.target');
    targetAnimals.forEach(animal => {
        animal.style.animation = 'pulse 0.5s ease 3';
        animal.style.transform = 'scale(1.4)';
        
        setTimeout(() => {
            animal.style.animation = 'pulse 2s infinite';
            animal.style.transform = '';
        }, 1500);
    });
}

// Timer functions
function startTimer() {
    const levelConfig = gameState.levelConfig[gameState.currentLevel] || gameState.levelConfig[6];
    gameState.timeLeft = levelConfig.time;
    gameState.isGameActive = true;
    updateTimerDisplay();
    
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 10) {
            document.getElementById('timer').parentElement.classList.add('warning');
        }
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
        gameState.gameTimer = null;
    }
    gameState.isGameActive = false;
    document.getElementById('timer').parentElement.classList.remove('warning');
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = gameState.timeLeft;
}

function endGame() {
    stopTimer();
    playGameOverSound();
    
    document.getElementById('final-level').textContent = gameState.currentLevel;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').classList.add('show');
}

function playClickSound() {
    playSound(800, 0.1);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
    
    document.getElementById('new-game-btn').addEventListener('click', () => startNewGame(true));
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('next-level-btn').addEventListener('click', startNextLevel);
    document.getElementById('celebration-new-game-btn').addEventListener('click', () => startNewGame(true));
    document.getElementById('restart-btn').addEventListener('click', () => startNewGame(true));
    
    // Start the first game
    startNewGame(true);
});

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        showHint();
    } else if (e.key === 'n' || e.key === 'N') {
        startNewGame(true);
    } else if (e.key === 'Escape') {
        // Close modals
        hideCelebration();
        hideGameOver();
    }
});

// Prevent context menu on touch devices for better mobile experience
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('animal')) {
        e.preventDefault();
    }
});
