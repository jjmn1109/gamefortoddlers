// Music Maker Game Logic
class MusicMakerGame {
    constructor() {
        this.currentInstrument = 'piano';
        this.currentMode = 'free';
        this.notesPlayed = 0;
        this.isRecording = false;
        this.recordedNotes = [];
        this.isPlaying = false;
        this.audioContext = null;
        this.musicKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        this.patterns = [
            ['C', 'D', 'E', 'F'],
            ['G', 'A', 'B', 'C'],
            ['C', 'E', 'G', 'C'],
            ['F', 'A', 'C', 'F'],
            ['D', 'F', 'A', 'D']
        ];
        this.currentPattern = [];
        this.patternIndex = 0;
        this.userPattern = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createKeyboard();
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
        
        // Instrument buttons
        document.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectInstrument(btn.dataset.instrument);
            });
        });
        
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectMode(btn.dataset.mode);
            });
        });
        
        // Recording controls
        document.getElementById('record-btn').addEventListener('click', () => {
            this.toggleRecording();
        });
        
        document.getElementById('play-btn').addEventListener('click', () => {
            this.playRecording();
        });
        
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearRecording();
        });
        
        // Modal buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.hideModal('pause-modal');
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        document.getElementById('next-pattern-btn').addEventListener('click', () => {
            this.nextPattern();
        });
        
        document.getElementById('pattern-menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        document.getElementById('create-new-btn').addEventListener('click', () => {
            this.createNewSong();
        });
        
        document.getElementById('song-menu-btn').addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal('pause-modal');
            }
            
            // Number keys 1-7 for quick note selection
            const keyMap = {
                '1': 'C', '2': 'D', '3': 'E', '4': 'F',
                '5': 'G', '6': 'A', '7': 'B'
            };
            
            if (keyMap[e.key]) {
                this.playNote(keyMap[e.key]);
            }
        });
    }
    
    createKeyboard() {
        const keyboard = document.getElementById('music-keyboard');
        keyboard.innerHTML = '';
        
        this.musicKeys.forEach(note => {
            const key = document.createElement('button');
            key.className = 'music-key';
            key.textContent = note;
            key.dataset.note = note;
            key.addEventListener('click', () => this.playNote(note));
            keyboard.appendChild(key);
        });
    }
    
    selectInstrument(instrument) {
        this.currentInstrument = instrument;
        
        // Update active button
        document.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-instrument="${instrument}"]`).classList.add('active');
        
        // Update display
        document.getElementById('instrument-display').textContent = 
            instrument.charAt(0).toUpperCase() + instrument.slice(1);
        
        this.playSound('instrument');
    }
    
    selectMode(mode) {
        this.currentMode = mode;
        
        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update display
        const modeNames = {
            'free': 'Free Play',
            'follow': 'Follow Pattern',
            'create': 'Create Song'
        };
        document.getElementById('mode-display').textContent = modeNames[mode];
        
        // Show/hide pattern display
        const patternDisplay = document.getElementById('pattern-display');
        if (mode === 'follow') {
            this.generatePattern();
            patternDisplay.style.display = 'block';
        } else {
            patternDisplay.style.display = 'none';
        }
        
        this.playSound('mode');
    }
    
    generatePattern() {
        this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
        this.patternIndex = 0;
        this.userPattern = [];
        
        const patternSequence = document.getElementById('pattern-sequence');
        patternSequence.innerHTML = '';
        
        this.currentPattern.forEach(note => {
            const patternNote = document.createElement('div');
            patternNote.className = 'pattern-note';
            patternNote.textContent = note;
            patternSequence.appendChild(patternNote);
        });
    }
    
    playNote(note) {
        if (this.isPlaying) return;
        
        this.notesPlayed++;
        this.playInstrumentSound(note);
        
        // Visual feedback
        const keyElement = document.querySelector(`[data-note="${note}"]`);
        keyElement.classList.add('playing');
        setTimeout(() => keyElement.classList.remove('playing'), 200);
        
        // Handle different modes
        if (this.currentMode === 'follow') {
            this.handleFollowMode(note);
        } else if (this.currentMode === 'create') {
            this.handleCreateMode(note);
        }
        
        this.updateDisplay();
    }
    
    handleFollowMode(note) {
        const expectedNote = this.currentPattern[this.patternIndex];
        
        if (note === expectedNote) {
            // Correct note
            this.userPattern.push(note);
            this.patternIndex++;
            
            // Highlight the pattern note
            const patternNotes = document.querySelectorAll('.pattern-note');
            if (this.patternIndex > 0) {
                patternNotes[this.patternIndex - 1].classList.add('highlight');
            }
            
            if (this.patternIndex >= this.currentPattern.length) {
                // Pattern complete
                setTimeout(() => this.completePattern(), 500);
            }
        } else {
            // Wrong note - reset
            this.patternIndex = 0;
            this.userPattern = [];
            document.querySelectorAll('.pattern-note').forEach(note => {
                note.classList.remove('highlight');
            });
            this.playSound('wrong');
        }
    }
    
    handleCreateMode(note) {
        if (this.isRecording) {
            this.recordedNotes.push({
                note: note,
                time: Date.now()
            });
        }
    }
    
    completePattern() {
        this.playSound('success');
        this.showModal('pattern-complete-modal');
    }
    
    toggleRecording() {
        const recordBtn = document.getElementById('record-btn');
        const playBtn = document.getElementById('play-btn');
        
        if (!this.isRecording) {
            // Start recording
            this.isRecording = true;
            this.recordedNotes = [];
            recordBtn.textContent = '⏹️ Stop';
            recordBtn.classList.add('recording');
            playBtn.disabled = true;
            this.playSound('record');
        } else {
            // Stop recording
            this.isRecording = false;
            recordBtn.textContent = '🔴 Record';
            recordBtn.classList.remove('recording');
            playBtn.disabled = false;
            
            if (this.recordedNotes.length > 0) {
                this.playSound('success');
            }
        }
    }
    
    playRecording() {
        if (this.recordedNotes.length === 0) return;
        
        this.isPlaying = true;
        const playBtn = document.getElementById('play-btn');
        playBtn.disabled = true;
        
        let index = 0;
        const playNextNote = () => {
            if (index < this.recordedNotes.length) {
                const noteData = this.recordedNotes[index];
                this.playInstrumentSound(noteData.note);
                
                // Visual feedback
                const keyElement = document.querySelector(`[data-note="${noteData.note}"]`);
                keyElement.classList.add('playing');
                setTimeout(() => keyElement.classList.remove('playing'), 200);
                
                index++;
                setTimeout(playNextNote, 500);
            } else {
                this.isPlaying = false;
                playBtn.disabled = false;
                
                if (this.currentMode === 'create') {
                    this.completeSong();
                }
            }
        };
        
        playNextNote();
    }
    
    clearRecording() {
        this.recordedNotes = [];
        this.isRecording = false;
        document.getElementById('record-btn').textContent = '🔴 Record';
        document.getElementById('record-btn').classList.remove('recording');
        document.getElementById('play-btn').disabled = true;
        this.playSound('clear');
    }
    
    completeSong() {
        document.getElementById('song-stats').textContent = `Notes played: ${this.recordedNotes.length}`;
        this.showModal('song-complete-modal');
    }
    
    nextPattern() {
        this.hideModal('pattern-complete-modal');
        this.generatePattern();
    }
    
    createNewSong() {
        this.hideModal('song-complete-modal');
        this.clearRecording();
        this.notesPlayed = 0;
        this.updateDisplay();
    }
    
    playInstrumentSound(note) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Set frequency based on note
            const frequencies = {
                'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
                'G': 392.00, 'A': 440.00, 'B': 493.88
            };
            
            oscillator.frequency.value = frequencies[note];
            
            // Set waveform based on instrument
            switch(this.currentInstrument) {
                case 'piano':
                    oscillator.type = 'triangle';
                    break;
                case 'guitar':
                    oscillator.type = 'sawtooth';
                    break;
                case 'drums':
                    oscillator.type = 'square';
                    break;
                case 'flute':
                    oscillator.type = 'sine';
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
        } catch (error) {
            console.log('Audio not available');
        }
    }
    
    updateDisplay() {
        document.getElementById('notes-display').textContent = this.notesPlayed;
        
        // Update progress for create mode
        if (this.currentMode === 'create') {
            const progress = Math.min((this.notesPlayed / 10) * 100, 100);
            document.querySelector('.progress-bar::before').style.width = `${progress}%`;
            document.getElementById('progress-text').textContent = 
                `Create your own music! (${this.notesPlayed} notes)`;
        }
    }
    
    togglePause() {
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
    }
    
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'success':
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
                    
                case 'record':
                    oscillator.frequency.value = 600;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                case 'clear':
                    oscillator.frequency.value = 400;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                    
                case 'instrument':
                case 'mode':
                case 'click':
                    oscillator.frequency.value = 500;
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
    new MusicMakerGame();
}); 