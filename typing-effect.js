class TypingEffect {
    constructor() {
        this.words = [
            "PASSION",
            "PROTECTION", 
            "SAFETY",
            "EXCELLENCE",
            "RELIABILITY",
            "INNOVATION",
            "COMMITMENT"
        ];
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.typingSpeed = 100; // Typing speed in ms
        this.deletingSpeed = 60; // Deleting speed in ms
        this.pauseDuration = 1500; // Pause between words in ms
        
        this.typingElement = document.querySelector('.typing-text');
        this.cursorElement = document.querySelector('.typing-cursor');
        
        this.init();
    }
    
    init() {
        if (!this.typingElement) return;
        
        // Start the typing animation
        this.type();
        
        // Add cursor animation
        this.animateCursor();
    }
    
    type() {
        const currentWord = this.words[this.currentWordIndex];
        
        if (this.isDeleting) {
            // Delete character
            this.typingElement.textContent = currentWord.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            // Type character
            this.typingElement.textContent = currentWord.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        // Determine speed
        let speed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
        
        // If word is complete
        if (!this.isDeleting && this.currentCharIndex === currentWord.length) {
            // Pause at the end of the word
            speed = this.pauseDuration;
            this.isDeleting = true;
        } 
        // If word is completely deleted
        else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            // Move to next word
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            // Small pause before starting next word
            speed = 500;
        }
        
        // Continue the animation
        setTimeout(() => this.type(), speed);
    }
    
    animateCursor() {
        if (!this.cursorElement) return;
        
        // The cursor already has CSS animation, but we can enhance it
        setInterval(() => {
            this.cursorElement.style.opacity = this.cursorElement.style.opacity === '0.3' ? '1' : '0.3';
        }, 500);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const typingEffect = new TypingEffect();
});

// Optional: Pause animation on hover
document.addEventListener('DOMContentLoaded', () => {
    const typingContainer = document.querySelector('.typing-wrapper');
    if (typingContainer) {
        typingContainer.addEventListener('mouseenter', () => {
            // You could add pause functionality here if needed
        });
        
        typingContainer.addEventListener('mouseleave', () => {
            // Resume animation
        });
    }
});