// divider.js - Draggable vertical divider for split arena
document.addEventListener('DOMContentLoaded', () => {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('problemPanel');
    const arenaLayout = document.getElementById('arenaLayout');
    
    if (!resizer || !leftPanel || !arenaLayout) return;

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection
        resizer.style.background = 'var(--accent)';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const containerRect = arenaLayout.getBoundingClientRect();
        const width = e.clientX - containerRect.left;
        
        // Boundaries: min 300px, max (container - 300px)
        const minWidth = 300;
        const maxWidth = containerRect.width - 300;

        if (width >= minWidth && width <= maxWidth) {
            leftPanel.style.flex = `0 0 ${width}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        resizer.style.background = 'var(--border-glass)';
        
        // Save preference
        localStorage.setItem('cpp-arena-split', leftPanel.style.width || leftPanel.style.flexBasis);
    });

    // Restore split preference
    const savedWidth = localStorage.getItem('cpp-arena-split');
    if (savedWidth && window.innerWidth > 900) {
        leftPanel.style.flex = `0 0 ${savedWidth}`;
    }
});
