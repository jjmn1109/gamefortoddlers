// Animal Sounds Game Logic
let gameState = {
    animals: [
        /*{ 
            emoji: '🐄', 
            name: 'Cow', 
            sound: 'moo',
            audioUrls: [
                'animal-sounds/cow-moo.wav'
            ]
        },*/
        { 
            emoji: '🐶', 
            name: 'Dog', 
            sound: 'woof',
            audioUrls: [
                'animal-sounds/dog-woof.wav'
            ]
        },
        { 
            emoji: '🐱', 
            name: 'Cat', 
            sound: 'meow',
            audioUrls: [
                'animal-sounds/cat-meow.wav'
            ]
        },
        { 
            emoji: '🐸', 
            name: 'Frog', 
            sound: 'ribbit',
            audioUrls: [
                'animal-sounds/frog-ribbit.mp3'
            ]
        },
        { 
            emoji: '🐵', 
            name: 'Monkey', 
            sound: 'ooh-ooh',
            audioUrls: [
                'animal-sounds/monkey-ooh-ooh.wav'
            ]
        },
        { 
            emoji: '🐷', 
            name: 'Pig', 
            sound: 'oink',
            audioUrls: [
                'animal-sounds/pig-oink.wav'
            ]
        },
        { 
            emoji: '🦆', 
            name: 'Duck', 
            sound: 'quack',
            audioUrls: [
                'animal-sounds/duck-quack.mp3'
            ]
        },
        { 
            emoji: '🐔', 
            name: 'Chicken', 
            sound: 'cluck',
            audioUrls: [
                'animal-sounds/chicken-cluck.wav'
            ]
        },
        { 
            emoji: '🐴', 
            name: 'Horse', 
            sound: 'neigh',
            audioUrls: [
                'animal-sounds/horse-neigh.wav'
            ]
        },
        { 
            emoji: '🐑', 
            name: 'Sheep', 
            sound: 'baa',
            audioUrls: [
                'animal-sounds/sheep-baa.wav'
            ]
        },
        { 
            emoji: '🦁', 
            name: 'Lion', 
            sound: 'roar',
            audioUrls: [
                'animal-sounds/lion-roar.mp3'
            ]
        },
        { 
            emoji: '🐘', 
            name: 'Elephant', 
            sound: 'trumpet',
            audioUrls: [
                'animal-sounds/elephant-trumpet.mp3'
            ]
        },
        { 
            emoji: '🐍', 
            name: 'Snake', 
            sound: 'hiss',
            audioUrls: [
                'animal-sounds/snake-hiss.mp3'
            ]
        },
        { 
            emoji: '🐦', 
            name: 'Bird', 
            sound: 'chirp',
            audioUrls: [
                'animal-sounds/bird-chirp.mp3'
            ]
        },
        { 
            emoji: '🐝', 
            name: 'Bee', 
            sound: 'buzz',
            audioUrls: [
                'animal-sounds/bee-buzz.mp3'
            ]
        },
        { 
            emoji: '🐭', 
            name: 'Mouse', 
            sound: 'squeak',
            audioUrls: [
                'animal-sounds/mouse-squeak.mp3'
            ]
        },
        { 
            emoji: '🐻', 
            name: 'Bear', 
            sound: 'growl',
            audioUrls: [
                'animal-sounds/bear-growl.mp3'
            ]
        },
        { 
            emoji: '🐯', 
            name: 'Tiger', 
            sound: 'roar',
            audioUrls: [
                'animal-sounds/tiger-roar.mp3'
            ]
        },
        { 
            emoji: '🦉', 
            name: 'Owl', 
            sound: 'hoot',
            audioUrls: [
                'animal-sounds/owl-hoot.mp3'
            ]
        },
        { 
            emoji: '🐐', 
            name: 'Goat', 
            sound: 'bleat',
            audioUrls: [
                'animal-sounds/goat-bleat.mp3'
            ]
        }
    ],
    currentLevel: 1,
    score: 0,
    totalLevels: 5,
    currentAnimal: null,
    gameAnimals: [],
    audioFiles: new Map(), // Cache for loaded audio files
    isPlaying: false,
    currentAudio: null // Track currently playing audio
};

// Real animal sound loading and playback system
async function loadRealAnimalSound(animal) {
    // Check if we already have this audio loaded
    if (gameState.audioFiles.has(animal.name)) {
        return gameState.audioFiles.get(animal.name);
    }
    
    console.log(`🔄 Loading real sound for ${animal.name}...`);
    
    // Try each URL until one works
    for (let i = 0; i < animal.audioUrls.length; i++) {
        const url = animal.audioUrls[i];
        console.log(`   Trying URL ${i + 1}/${animal.audioUrls.length}: ${url}`);
        
        try {
            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            
            // Create a promise that resolves when audio is loaded
            const loadPromise = new Promise((resolve, reject) => {
                let resolved = false;
                
                audio.addEventListener('canplaythrough', () => {
                    if (!resolved) {
                        resolved = true;
                        console.log(`✅ Successfully loaded ${animal.name} sound from: ${url}`);
                        resolve(audio);
                    }
                });
                
                audio.addEventListener('error', (e) => {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error(`Failed to load: ${e.message || 'Unknown error'}`));
                    }
                });
                
                audio.addEventListener('abort', () => {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error('Loading aborted'));
                    }
                });
                
                // Set timeout
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error('Loading timeout'));
                    }
                }, 5000);
            });
            
            // Start loading the audio
            audio.src = url;
            audio.load();
            
            // Wait for it to load
            const loadedAudio = await loadPromise;
            
            // Cache the successful audio
            gameState.audioFiles.set(animal.name, loadedAudio);
            return loadedAudio;
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            continue; // Try next URL
        }
    }
    
    // If all URLs failed, throw an error
    throw new Error(`All audio URLs failed for ${animal.name}`);
}

async function playAnimalSound(animal) {
    // Stop any currently playing sound first
    stopCurrentSound();
    
    const soundButton = document.getElementById('play-sound-btn');
    const soundWaves = document.getElementById('sound-waves');
    
    soundButton.classList.add('playing');
    soundWaves.classList.add('active');
    gameState.isPlaying = true;
    
    try {
        console.log(`🎵 Playing ${animal.name} sound...`);
        
        // Load and play the real animal sound
        const audio = await loadRealAnimalSound(animal);
        
        // Store reference to current audio
        gameState.currentAudio = audio;
        
        // Reset to beginning and play
        audio.currentTime = 0;
        audio.volume = 0.7; // Set a reasonable volume
        
        const playPromise = audio.play();
        
        // Handle play promise (required for some browsers)
        if (playPromise !== undefined) {
            await playPromise;
        }
        
        console.log(`✅ Successfully playing ${animal.name} sound!`);
        
        // Stop visual effects when sound ends or after max duration
        const stopEffects = () => {
            soundButton.classList.remove('playing');
            soundWaves.classList.remove('active');
            gameState.isPlaying = false;
        };
        
        // Listen for the audio to end
        const onEnded = () => {
            stopEffects();
            audio.removeEventListener('ended', onEnded);
        };
        audio.addEventListener('ended', onEnded);
        
        // Also set a maximum timeout (in case audio doesn't fire 'ended' event)
        setTimeout(stopEffects, 5000);
        
    } catch (error) {
        console.error(`❌ Error playing ${animal.name} sound:`, error);
        
        // Show user-friendly error message
        const instruction = document.getElementById('instruction-text');
        const originalText = instruction.textContent;
        instruction.textContent = `⚠️ Could not load ${animal.name} sound. Please check your internet connection.`;
        
        setTimeout(() => {
            instruction.textContent = originalText;
        }, 3000);
        
        // Remove visual effects
        soundButton.classList.remove('playing');
        soundWaves.classList.remove('active');
        gameState.isPlaying = false;
    }
}

// Simple feedback sounds (keeping these synthetic since they're just UI feedback)
function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Happy ascending notes
        playSimplePattern(audioContext, [523, 659, 784, 1047], [0.2, 0.2, 0.2, 0.4], 'sine');
    } catch (error) {
        console.log('Audio context not available for success sound');
    }
}

function playWrongSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Gentle "try again" sound
        playSimplePattern(audioContext, [300, 250], [0.2, 0.3], 'triangle');
    } catch (error) {
        console.log('Audio context not available for wrong sound');
    }
}

function playLevelCompleteSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Victory fanfare
        playSimplePattern(audioContext, [523, 659, 784, 1047, 1319], [0.2, 0.2, 0.2, 0.2, 0.5], 'sine');
    } catch (error) {
        console.log('Audio context not available for level complete sound');
    }
}

function playSimplePattern(audioContext, frequencies, durations, waveType = 'sine') {
    let currentTime = audioContext.currentTime;
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = waveType;
        
        const duration = durations[index];
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
        
        currentTime += duration + 0.05;
    });
}

// Game logic functions
function generateLevel() {
    // Stop any currently playing sound from previous level
    stopCurrentSound();
    
    // Select animals for this level (3-5 options depending on level)
    const numOptions = Math.min(3 + gameState.currentLevel, 5);
    const shuffledAnimals = [...gameState.animals].sort(() => Math.random() - 0.5);
    gameState.gameAnimals = shuffledAnimals.slice(0, numOptions);
    
    // Choose the target animal
    gameState.currentAnimal = gameState.gameAnimals[Math.floor(Math.random() * gameState.gameAnimals.length)];
    
    displayAnimals();
    updateDisplay();
    
    // Automatically play the sound after a short delay to let UI update
    setTimeout(() => {
        if (gameState.currentAnimal) {
            playAnimalSound(gameState.currentAnimal);
        }
    }, 500);
}

function displayAnimals() {
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = '';
    
    gameState.gameAnimals.forEach(animal => {
        const animalDiv = document.createElement('div');
        animalDiv.className = 'animal-option';
        animalDiv.dataset.animal = animal.name;
        animalDiv.innerHTML = `
            <span class="animal-emoji">${animal.emoji}</span>
            <span class="animal-name">${animal.name}</span>
        `;
        
        animalDiv.addEventListener('click', () => handleAnimalClick(animal));
        grid.appendChild(animalDiv);
    });
}

function handleAnimalClick(selectedAnimal) {
    // Check if this animal element has already been clicked
    const animalElement = document.querySelector(`[data-animal="${selectedAnimal.name}"]`);
    if (animalElement.classList.contains('clicked') || animalElement.classList.contains('correct') || animalElement.classList.contains('wrong')) {
        return; // Prevent multiple clicks on the same animal
    }
    
    // Add clicked class to prevent rapid clicks
    animalElement.classList.add('clicked');
    
    const animalElements = document.querySelectorAll('.animal-option');
    
    if (selectedAnimal.name === gameState.currentAnimal.name) {
        // Correct answer!
        const correctElement = document.querySelector(`[data-animal="${selectedAnimal.name}"]`);
        correctElement.classList.add('correct');
        
        playSuccessSound();
        gameState.score++;
        updateDisplay();
        
        setTimeout(() => {
            if (gameState.score >= 5) {
                completeLevel();
            } else {
                generateLevel(); // Next question
            }
        }, 1500);
        
    } else {
        // Wrong answer - give gentle feedback
        const wrongElement = document.querySelector(`[data-animal="${selectedAnimal.name}"]`);
        wrongElement.classList.add('wrong');
        
        playWrongSound();
        
        setTimeout(() => {
            wrongElement.classList.remove('wrong');
            wrongElement.classList.remove('clicked'); // Allow clicking again for wrong answers
        }, 500);
    }
}

function completeLevel() {
    const isLastLevel = gameState.currentLevel >= gameState.totalLevels;
    
    if (isLastLevel) {
        // Game complete!
        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('game-complete').classList.add('show');
        playLevelCompleteSound();
    } else {
        // Level complete, can advance
        document.getElementById('celebration-title').textContent = `🎉 Level ${gameState.currentLevel} Complete! 🎉`;
        document.getElementById('celebration-message').textContent = `Great job! You got ${gameState.score}/5 sounds right!`;
        document.getElementById('celebration').classList.add('show');
        playLevelCompleteSound();
    }
}

function nextLevel() {
    gameState.currentLevel++;
    gameState.score = 0;
    hideCelebration();
    generateLevel();
}

function updateDisplay() {
    document.getElementById('current-level').textContent = gameState.currentLevel;
    document.getElementById('score').textContent = gameState.score;
    
    const instruction = document.getElementById('instruction-text');
    if (gameState.currentAnimal) {
        instruction.textContent = `🎵 Listen carefully and find the matching animal! 🎵`;
    }
}

function startNewGame() {
    // Stop any currently playing sound
    stopCurrentSound();
    
    gameState.currentLevel = 1;
    gameState.score = 0;
    hideCelebration();
    hideGameComplete();
    generateLevel();
}

function hideCelebration() {
    document.getElementById('celebration').classList.remove('show');
}

function hideGameComplete() {
    document.getElementById('game-complete').classList.remove('show');
}

// Function to stop any currently playing sound
function stopCurrentSound() {
    if (gameState.currentAudio) {
        gameState.currentAudio.pause();
        gameState.currentAudio.currentTime = 0;
        gameState.currentAudio = null;
    }
    
    // Reset visual effects
    const soundButton = document.getElementById('play-sound-btn');
    const soundWaves = document.getElementById('sound-waves');
    soundButton.classList.remove('playing');
    soundWaves.classList.remove('active');
    gameState.isPlaying = false;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Sound button
    document.getElementById('play-sound-btn').addEventListener('click', () => {
        if (gameState.currentAnimal) {
            playAnimalSound(gameState.currentAnimal);
        }
    });
    
    // Control buttons
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('repeat-btn').addEventListener('click', () => {
        if (gameState.currentAnimal) {
            playAnimalSound(gameState.currentAnimal);
        }
    });
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    document.getElementById('restart-btn').addEventListener('click', startNewGame);
    
    // Start the first game
    generateLevel();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        // Spacebar or Enter to play sound
        e.preventDefault();
        if (gameState.currentAnimal) {
            playAnimalSound(gameState.currentAnimal);
        }
    } else if (e.key === 'n' || e.key === 'N') {
        startNewGame();
    } else if (e.key === 'Escape') {
        hideCelebration();
        hideGameComplete();
    }
    
    // Number keys to select animals (1-5)
    const num = parseInt(e.key);
    if (num >= 1 && num <= gameState.gameAnimals.length) {
        const animal = gameState.gameAnimals[num - 1];
        handleAnimalClick(animal);
    }
});

// Prevent context menu for better mobile experience
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.animal-option') || e.target.closest('.sound-button')) {
        e.preventDefault();
    }
});
