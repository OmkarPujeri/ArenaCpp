// divider.js - Draggable vertical divider for split arena
document.addEventListener('DOMContentLoaded', () => {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('problemPanel');
    const arenaLayout = document.getElementById('arenaLayout');
    
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        resizer.style.background = 'var(--accent)';
        resizer.style.boxShadow = '0 0 10px var(--accent-glow)';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const offsetLeft = arenaLayout.getBoundingClientRect().left;
        const width = e.clientX - offsetLeft;
        
        // Boundaries
        if (width > 300 && width < (arenaLayout.clientWidth - 400)) {
            leftPanel.style.flex = 'none';
            leftPanel.style.width = `${width}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.cursor = 'default';
        resizer.style.background = 'var(--border-glass)';
        resizer.style.boxShadow = 'none';
        
        // Save preference
        localStorage.setItem('cpp-arena-split', leftPanel.style.width);
    });

    // Restore split preference
    const savedWidth = localStorage.getItem('cpp-arena-split');
    if (savedWidth) {
        leftPanel.style.flex = 'none';
        leftPanel.style.width = savedWidth;
    }
});
