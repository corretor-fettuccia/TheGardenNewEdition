(function() {
    'use strict';
    
    function initGlassButtons() {
        const buttons = document.querySelectorAll('.glassButton');
        
        buttons.forEach(button => {
            // Cria luz do cursor
            let cursorLight = button.querySelector('.glassButton__cursor-light');
            if (!cursorLight) {
                cursorLight = document.createElement('div');
                cursorLight.className = 'glassButton__cursor-light';
                button.appendChild(cursorLight);
            }
            
            const updateMousePosition = (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                button.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                button.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
                
                if (cursorLight) {
                    cursorLight.style.left = `${x}px`;
                    cursorLight.style.top = `${y}px`;
                }
            };
            
            const handleMouseLeave = () => {
                button.style.setProperty('--mouse-x', '50%');
                button.style.setProperty('--mouse-y', '50%');
                if (cursorLight) cursorLight.style.opacity = '0';
            };
            
            const handleMouseEnter = () => {
                if (cursorLight) cursorLight.style.opacity = '1';
            };
            
            button.addEventListener('mousemove', updateMousePosition);
            button.addEventListener('mouseleave', handleMouseLeave);
            button.addEventListener('mouseenter', handleMouseEnter);
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlassButtons);
    } else {
        initGlassButtons();
    }
})();
