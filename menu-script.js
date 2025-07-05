// Menu navigation and game launcher
function playGame(gameId) {
    // Play click sound
    playMenuSound();
    
    // Show loading animation
    showLoading(gameId);
    
    // Navigate to the selected game after a short delay
    setTimeout(() => {
        switch(gameId) {
            case 'find-animals':
                window.location.href = 'find-animals.html';
                break;
            case 'animal-sounds':
                window.location.href = 'animal-sounds.html';
                break;
            case 'pop-bubbles':
                window.location.href = 'pop-bubbles.html';
                break;
            case 'color-matching':
                window.location.href = 'color-matching.html';
                break;
            case 'shape-sorter':
                window.location.href = 'shape-sorter.html';
                break;
            case 'counting':
                window.location.href = 'counting-fun.html';
                break;
            case 'memory-match':
                window.location.href = 'memory-match.html';
                break;
            case 'letter-learning':
                window.location.href = 'letter-learning.html';
                break;
            case 'music-maker':
                window.location.href = 'music-maker.html';
                break;
            default:
                hideLoading();
                alert('🚧 This game is coming soon! Stay tuned for more fun! 🚧');
        }
    }, 1000);
}

function showLoading(gameId) {
    const loading = document.createElement('div');
    loading.className = 'loading show';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner">🎮</div>
            <div class="loading-text">Loading ${getGameTitle(gameId)}...</div>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

function getGameTitle(gameId) {
    const titles = {
        'find-animals': 'Find the Animals',
        'animal-sounds': 'Animal Sounds',
        'pop-bubbles': 'Pop the Bubbles',
        'counting': 'Counting Fun',
        'color-matching': 'Color Matching',
        'shape-sorter': 'Shape Sorter',
        'memory-match': 'Memory Match',
        'letter-learning': 'Letter Learning',
        'music-maker': 'Music Maker'
    };
    return titles[gameId] || 'Game';
}

// Sound effects for menu
function playMenuSound() {
    // Create audio context for menu sounds
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Cheerful click sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        // Silent fail if audio context isn't available
        console.log('Audio not available');
    }
}

// Add hover effects and animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
        // This helps with audio context initialization
    }, { once: true });
    
    // Add interactive effects to game cards
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.game-icon');
            icon.style.transform = 'scale(1.2) rotate(10deg)';
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.game-icon');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Add ripple effect to play buttons
    const playButtons = document.querySelectorAll('.play-btn:not(.disabled)');
    
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideLoading();
    }
    
    // Number keys to launch games
    const gameMap = {
        '1': 'find-animals',
        '2': 'animal-sounds'
    };
    
    if (gameMap[e.key]) {
        playGame(gameMap[e.key]);
    }
});

// Back to menu function (for use in individual games)
function backToMenu() {
    window.location.href = 'menu.html';
}

// Export for use in other games
window.gameMenu = {
    backToMenu,
    playMenuSound
};
