// tabs.js - Switching between problem description, examples, and constraints
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Toggle active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.style.display = 'block';
                targetContent.classList.add('fade-in');
            }
        });
    });

    // Persistent tab storage (optional)
    const activeTab = localStorage.getItem('active-tab') || 'description';
    const initialBtn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
    if (initialBtn) initialBtn.click();
});
