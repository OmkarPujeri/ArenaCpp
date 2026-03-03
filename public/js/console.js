// console.js - Handling console expand/collapse and verdict animations
document.addEventListener('DOMContentLoaded', () => {
    const consoleHeader = document.getElementById('consoleHeader');
    const consolePanel = document.getElementById('consolePanel');
    const submitBtn = document.getElementById('submitBtn');
    const consolePlaceholder = document.getElementById('consolePlaceholder');
    const resultDiv = document.getElementById('result');
    const verdictText = document.getElementById('verdictText');
    const statusDot = document.getElementById('statusDot');

    // Fullscreen Toggle Logic
    const fsToggle = document.getElementById('fullscreenToggle');
    const fsIcon = document.getElementById('fsIcon');
    const fsText = document.getElementById('fsText');

    let isFullscreen = false;

    const toggleFullscreen = () => {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
            document.body.classList.add('editor-fullscreen');
            fsIcon.innerText = '⛶'; // Same icon, but change label/style if desired
            fsText.innerText = 'Exit Fullscreen';
            fsToggle.classList.add('btn-primary');
            fsToggle.classList.remove('btn-secondary');
        } else {
            document.body.classList.remove('editor-fullscreen');
            fsIcon.innerText = '⛶';
            fsText.innerText = 'Fullscreen';
            fsToggle.classList.add('btn-secondary');
            fsToggle.classList.remove('btn-primary');
        }
    };

    if (fsToggle) fsToggle.addEventListener('click', toggleFullscreen);

    let isExpanded = false;

    const toggleConsole = (forceExpand = false) => {
        if (forceExpand || !isExpanded) {
            consolePanel.style.height = '350px';
            isExpanded = true;
        } else {
            consolePanel.style.height = '60px';
            isExpanded = false;
        }
    };

    consoleHeader.addEventListener('click', (e) => {
        if (e.target !== submitBtn) {
            toggleConsole();
        }
    });

    // Handle Verdict Animations & Status Updates
    window.addEventListener('arenaVerdictReceived', (e) => {
        const { verdict, passed, total } = e.detail;
        
        // Auto-expand on verdict
        toggleConsole(true);
        consolePlaceholder.classList.add('hidden');
        resultDiv.classList.remove('hidden');
        resultDiv.classList.add('fade-in');

        // Apply visual logic based on verdict
        verdictText.className = 'badge';
        const verdictMap = {
            'Accepted': 'badge-easy verdict-ac',
            'Wrong Answer': 'badge-hard verdict-wa',
            'Time Limit Exceeded': 'badge-medium',
            'Compilation Error': 'badge-medium'
        };
        verdictText.classList.add(verdictMap[verdict] || 'badge-hard');
        
        const dotColors = {
            'Accepted': 'var(--status-ac)',
            'Wrong Answer': 'var(--status-wa)',
            'Time Limit Exceeded': 'var(--status-tle)'
        };
        statusDot.style.background = dotColors[verdict] || 'var(--accent)';
        statusDot.style.boxShadow = `0 0 10px ${statusDot.style.background}`;
    });
});
