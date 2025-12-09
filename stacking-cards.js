class StackingCards {
    constructor() {
        this.stackContainer = document.getElementById('cardsStack');
        this.cards = Array.from(this.stackContainer.querySelectorAll('.stack-card'));
        this.totalCards = this.cards.length;
        this.activeIndex = 0;
        this.isAnimating = false;
        this.animationDuration = 800;
        this.autoPlayInterval = 4000;
        this.autoPlayTimer = null;
        this.visibleStackCount = 4;
        
        // Drag/swipe variables
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        this.dragThreshold = 50;
        
        this.init();
    }
    
    init() {
        // Set initial positions
        this.positionCards();
        
        // Add drag/swipe events
        this.setupDragEvents();
        
        // Add wheel scroll event
        this.stackContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                if (e.deltaY > 0) {
                    this.nextCard();
                } else {
                    this.prevCard();
                }
            }
        }, { passive: false });
        
        // Click events for stacked cards
        this.cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (!card.classList.contains('active') && !this.isAnimating) {
                    this.activateCard(index);
                }
            });
        });
        
        // Start autoplay
        this.startAutoPlay();
        
        // Pause autoplay on hover
        this.stackContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.stackContainer.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Make it globally accessible
        window.cardDeck = this;
    }
    
    positionCards() {
        // Position all cards in vertical stack (directly behind each other)
        this.cards.forEach((card, index) => {
            const isActive = index === this.activeIndex;
            
            // Remove all animation classes
            card.classList.remove('active', 'stacked', 'exiting', 'entering');
            card.style.transition = '';
            card.style.transform = '';
            card.style.zIndex = '';
            card.style.height = '';
            card.style.opacity = '';
            card.style.pointerEvents = 'auto';
            
            if (isActive) {
                // Active card - top of stack
                card.classList.add('active');
                card.style.zIndex = this.totalCards + 100;
                card.style.transform = 'translateY(0) scale(1)';
                card.style.setProperty('--stack-index', '0');
                card.style.opacity = '1';
            } else {
                // Calculate position in stack
                let stackIndex;
                if (index < this.activeIndex) {
                    stackIndex = this.activeIndex - index;
                } else {
                    stackIndex = this.totalCards - index + this.activeIndex;
                }
                
                // Only show limited number of stacked cards
                if (stackIndex <= this.visibleStackCount) {
                    card.classList.add('stacked');
                    // Stack directly behind (1px overlap for perfect stacking)
                    card.style.zIndex = this.totalCards + 100 - stackIndex;
                    card.style.setProperty('--stack-index', stackIndex);
                    
                    // Position stacked cards DIRECTLY behind active card (1px overlap only)
                    card.style.transform = `translateY(${stackIndex * -1}px) scale(1)`;
                    card.style.opacity = '1';
                } else {
                    // Hide cards beyond visible stack
                    card.style.opacity = '0';
                    card.style.pointerEvents = 'none';
                    card.style.transform = 'translateY(-100px) scale(1)';
                    card.style.zIndex = '0';
                }
            }
        });
    }
    
    activateCard(newIndex, direction = 'auto') {
        if (this.isAnimating || newIndex === this.activeIndex) return;
        
        this.isAnimating = true;
        this.stopAutoPlay();
        
        // Determine direction if auto
        if (direction === 'auto') {
            direction = newIndex > this.activeIndex ? 'next' : 'prev';
        }
        
        const currentCard = this.cards[this.activeIndex];
        const nextCard = this.cards[newIndex];
        
        // Add animation classes
        currentCard.classList.add('exiting');
        nextCard.classList.add('entering');
        
        // Set smooth transition for all cards
        this.cards.forEach(card => {
            card.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        });
        
        if (direction === 'next') {
            // Current card moves slightly down and fades
            currentCard.style.transform = 'translateY(30px) scale(1)';
            currentCard.style.opacity = '0.7';
            currentCard.style.zIndex = this.totalCards + 50;
            
            // Next card comes from behind (slightly up) and becomes active
            nextCard.style.transform = 'translateY(-10px) scale(1)';
            nextCard.style.opacity = '0.9';
            nextCard.style.zIndex = this.totalCards + 150;
            
        } else {
            // Current card moves slightly up and fades
            currentCard.style.transform = 'translateY(-30px) scale(1)';
            currentCard.style.opacity = '0.7';
            currentCard.style.zIndex = this.totalCards + 50;
            
            // Next card comes from behind (slightly down) and becomes active
            nextCard.style.transform = 'translateY(10px) scale(1)';
            nextCard.style.opacity = '0.9';
            nextCard.style.zIndex = this.totalCards + 150;
        }
        
        // Force reflow
        nextCard.offsetHeight;
        
        // Update active index
        const oldIndex = this.activeIndex;
        this.activeIndex = newIndex;
        
        // After a short delay, update all card positions simultaneously
        setTimeout(() => {
            // Reset transitions for final positioning
            this.cards.forEach(card => {
                card.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            });
            
            // Position all cards
            this.positionCards();
        }, 50);
        
        // After animation completes
        setTimeout(() => {
            // Remove animation classes
            currentCard.classList.remove('exiting');
            nextCard.classList.remove('entering');
            
            // Reset transitions
            this.cards.forEach(card => {
                card.style.transition = '';
            });
            
            this.isAnimating = false;
            this.startAutoPlay();
        }, this.animationDuration);
    }
    
    nextCard() {
        const nextIndex = (this.activeIndex + 1) % this.totalCards;
        this.activateCard(nextIndex, 'next');
    }
    
    prevCard() {
        const prevIndex = (this.activeIndex - 1 + this.totalCards) % this.totalCards;
        this.activateCard(prevIndex, 'prev');
    }
    
    setupDragEvents() {
        // Mouse events
        this.stackContainer.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        
        // Touch events
        this.stackContainer.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
        
        // Prevent default touch behavior
        this.stackContainer.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    handleDragStart(e) {
        if (this.isAnimating) return;
        
        this.isDragging = true;
        this.startY = this.getClientY(e);
        this.currentY = this.startY;
        
        // Stop autoplay during drag
        this.stopAutoPlay();
        
        // Add active class to indicate dragging
        this.stackContainer.classList.add('dragging');
    }
    
    handleDragMove(e) {
        if (!this.isDragging || this.isAnimating) return;
        
        e.preventDefault();
        const clientY = this.getClientY(e);
        const deltaY = clientY - this.currentY;
        this.currentY = clientY;
        
        // Calculate drag distance
        const dragDistance = clientY - this.startY;
        
        // Apply visual feedback during drag
        if (Math.abs(dragDistance) > 10) {
            const activeCard = this.cards[this.activeIndex];
            const direction = dragDistance > 0 ? 1 : -1;
            const translateY = Math.min(Math.abs(dragDistance) * 0.3, 40) * direction;
            
            activeCard.style.transform = `translateY(${translateY}px) scale(1)`;
            activeCard.style.opacity = `${1 - Math.abs(dragDistance) / 400}`;
        }
    }
    
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.stackContainer.classList.remove('dragging');
        
        const clientY = this.getClientY(e);
        const dragDistance = clientY - this.startY;
        
        // Reset active card position
        const activeCard = this.cards[this.activeIndex];
        activeCard.style.transform = '';
        activeCard.style.opacity = '';
        activeCard.style.transition = 'all 0.3s ease';
        
        // Check if drag exceeds threshold
        if (Math.abs(dragDistance) > this.dragThreshold) {
            if (dragDistance > 0) {
                // Dragged down - go to previous card
                this.prevCard();
            } else {
                // Dragged up - go to next card
                this.nextCard();
            }
        } else {
            // Reset to original position
            setTimeout(() => {
                activeCard.style.transition = '';
            }, 300);
        }
        
        // Restart autoplay after delay
        setTimeout(() => this.startAutoPlay(), 2000);
    }
    
    getClientY(e) {
        if (e.type.includes('touch')) {
            return e.touches[0] ? e.touches[0].clientY : e.changedTouches[0].clientY;
        }
        return e.clientY;
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayTimer = setInterval(() => {
            this.nextCard();
        }, this.autoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cardDeck = new StackingCards();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === ' ') {
            cardDeck.prevCard();
        } else if (e.key === 'ArrowDown') {
            cardDeck.nextCard();
        }
    });
});