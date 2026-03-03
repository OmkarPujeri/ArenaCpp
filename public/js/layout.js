// layout.js - Global UI interactions, navbar, and common effects
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    
    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
            navbar.style.padding = 'var(--space-sm) var(--space-xl)';
            navbar.style.boxShadow = 'var(--shadow-high)';
            navbar.style.borderBottom = '1px solid var(--accent-glow)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.padding = 'var(--space-md) var(--space-xl)';
            navbar.style.boxShadow = 'none';
            navbar.style.borderBottom = '1px solid var(--border-glass)';
        }
    });

    // Ripple Effect on Primary Buttons
    const primaryBtns = document.querySelectorAll('.btn-primary');
    primaryBtns.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / btn.clientWidth) * 100;
            const y = ((e.clientY - rect.top) / btn.clientHeight) * 100;
            btn.style.setProperty('--mouse-x', `${x}%`);
            btn.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // Hero Fade In Micro-interaction
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in');
    }
});
