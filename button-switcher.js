const switchers = document.querySelectorAll('.switcher');

const initializeSwitcher = (el) => {
  const options = el.querySelectorAll('.switcher__option');
  const radios = el.querySelectorAll('input[type="radio"]');
  let previousIndex = null;

  // Calculate toggle width and positions dynamically
  const updateTogglePosition = (checkedIndex) => {
    if (checkedIndex === null || checkedIndex < 0) return;
    
    const option = options[checkedIndex];
    if (!option) return;
    
    // Get the option's position relative to the switcher
    const optionRect = option.getBoundingClientRect();
    const switcherRect = el.getBoundingClientRect();
    
    // Calculate the position: option's left edge relative to switcher's left edge
    // The toggle starts at left: 4px, so we need to subtract that
    const toggleLeftOffset = 4; // CSS left: 4px
    
    // The toggle should extend slightly beyond the option to match the outer container's pill shape
    // Original design had 84px toggle width for 68px option (8px extra on each side)
    const togglePadding = 8; // Extra width on each side to create elongated pill shape
    const translateX = optionRect.left - switcherRect.left - toggleLeftOffset - togglePadding;
    
    // Set toggle width to be slightly wider than option to match outer container shape
    const toggleWidth = optionRect.width + (togglePadding * 2);
    el.style.setProperty('--toggle-width', `${toggleWidth}px`);
    el.style.setProperty('--toggle-translate', `${translateX}px`);
    
    // Set transform origin based on direction
    if (previousIndex !== null) {
      if (checkedIndex > previousIndex) {
        el.style.setProperty('--toggle-origin', 'left');
      } else {
        el.style.setProperty('--toggle-origin', 'right');
      }
    } else {
      el.style.setProperty('--toggle-origin', 'left');
    }
    
    previousIndex = checkedIndex;
  };

  // Find initially checked radio
  let initiallyCheckedIndex = null;
  radios.forEach((radio, index) => {
    if (radio.checked) {
      initiallyCheckedIndex = index;
    }
  });

  // Initialize position after layout is ready
  const initializePosition = () => {
    if (initiallyCheckedIndex !== null) {
      // Use requestAnimationFrame to ensure layout is calculated
      requestAnimationFrame(() => {
        updateTogglePosition(initiallyCheckedIndex);
      });
    }
  };
  
  // Initialize immediately and also after a short delay to ensure layout
  initializePosition();
  setTimeout(initializePosition, 10);
  
  // Recalculate on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentChecked = el.querySelector('input[type="radio"]:checked');
      if (currentChecked) {
        const currentIndex = Array.from(radios).indexOf(currentChecked);
        if (currentIndex >= 0) {
          updateTogglePosition(currentIndex);
        }
      }
    }, 100);
  });

  // Listen for changes
  radios.forEach((radio, index) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        requestAnimationFrame(() => {
          updateTogglePosition(index);
        });
      }
    });
  });

  // Handle clicks on labels/links - update radio state
  options.forEach((option, index) => {
    const radio = option.querySelector('input[type="radio"]');
    const link = option.querySelector('a');
    
    if (link) {
      link.addEventListener('click', (e) => {
        // Update radio state and toggle position
        if (radio) {
          radio.checked = true;
          requestAnimationFrame(() => {
            updateTogglePosition(index);
          });
        }
        // If href is just "#", prevent default navigation
        if (link.getAttribute('href') === '#') {
          e.preventDefault();
        }
        // Otherwise, allow default link behavior
      });
    } else {
      option.addEventListener('click', (e) => {
        if (radio && !radio.checked) {
          radio.checked = true;
          requestAnimationFrame(() => {
            updateTogglePosition(index);
          });
        }
      });
    }
  });
};

switchers.forEach(switcher => {
  if (switcher) {
    initializeSwitcher(switcher);
  }
});