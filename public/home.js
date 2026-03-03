let problems = [];
let filteredProblems = [];
let currentSearch = '';
let selectedDifficulties = new Set();
let selectedTopics = new Set();
let currentSort = 'default';

const tableBody = document.getElementById('problemTableBody');
const searchBar = document.getElementById('searchBar');
const topicMenu = document.getElementById('topicMenu');

// Difficulty mapping for badges and sorting
const difficultyBadgeMap = {
    'Easy': 'badge badge-easy',
    'Medium': 'badge badge-medium',
    'Hard': 'badge badge-hard'
};
const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
        window.scrollY > 50 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
    }
});

/**
 * Fetch problems from the API
 */
async function fetchProblems() {
    try {
        const response = await fetch('/api/problems');
        problems = await response.json();
        
        initTopicDropdown();
        applyFilters();
    } catch (err) {
        console.error('Failed to fetch problems:', err);
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: var(--status-wa);">Error loading problems.</td></tr>';
    }
}

/**
 * Populate topic dropdown dynamically from problem data
 */
function initTopicDropdown() {
    const topics = [...new Set(problems.map(p => p.topic))].sort();
    topicMenu.innerHTML = topics.map(topic => `
        <label class="dropdown-item">
            <input type="checkbox" value="${topic}"> <span>${topic}</span>
        </label>
    `).join('');

    // Add event listeners to labels (dropdown-items) for better click behavior
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // If click was on checkbox, handle change. If on label, toggle checkbox.
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    document.querySelectorAll('.dropdown-menu input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const val = e.target.value;
            const isTopic = e.target.closest('#topicDropdown');
            const set = isTopic ? selectedTopics : selectedDifficulties;
            
            e.target.checked ? set.add(val) : set.delete(val);
            
            updateDropdownLabels();
            applyFilters();
        });
    });
}

function updateDropdownLabels() {
    // Difficulty Label
    const diffTrigger = document.querySelector('#difficultyDropdown .trigger-label');
    diffTrigger.textContent = selectedDifficulties.size === 0 ? 'Difficulty' : 
                             selectedDifficulties.size === 1 ? [...selectedDifficulties][0] : 
                             `${selectedDifficulties.size} Selected`;

    // Topic Label
    const topicTrigger = document.querySelector('#topicDropdown .trigger-label');
    topicTrigger.textContent = selectedTopics.size === 0 ? 'Topic' : 
                              selectedTopics.size === 1 ? [...selectedTopics][0] : 
                              `${selectedTopics.size} Selected`;
}

/**
 * Filtering and Sorting Logic
 */
function applyFilters() {
    filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                             p.topic.toLowerCase().includes(currentSearch.toLowerCase());
        const matchesDifficulty = selectedDifficulties.size === 0 || selectedDifficulties.has(p.difficulty);
        const matchesTopic = selectedTopics.size === 0 || selectedTopics.has(p.topic);
        
        return matchesSearch && matchesDifficulty && matchesTopic;
    });

    // Apply Sorting
    if (currentSort === 'difficulty-asc') {
        filteredProblems.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    } else if (currentSort === 'difficulty-desc') {
        filteredProblems.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
    } else if (currentSort === 'title-asc') {
        filteredProblems.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        // Default: Difficulty then Title
        filteredProblems.sort((a, b) => {
            const diff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            return diff !== 0 ? diff : a.title.localeCompare(b.title);
        });
    }

    renderProblems();
}

/**
 * Format title for display
 */
function formatTitle(title) {
    return title || "";
}

/**
 * Render to Table
 */
function renderProblems() {
    tableBody.innerHTML = '';
    
    if (filteredProblems.length === 0) {
        tableBody.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: var(--space-xl);">No challenges found matching your criteria.</div>`;
        return;
    }

    filteredProblems.forEach(p => {
        const card = document.createElement('a');
        card.href = `problem.html?id=${p.id}`;
        card.className = 'problem-card hover-lift';
        
        card.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-size: 16px; font-weight: 600; color: #fff;">${formatTitle(p.title)}</span>
                <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${p.topic}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <span class="${difficultyBadgeMap[p.difficulty] || 'badge'}">${p.difficulty}</span>
                <span style="color: var(--text-muted); font-size: 14px; opacity: 0.5;">→</span>
            </div>
        `;
        
        tableBody.appendChild(card);
    });
}

/**
 * UI Interaction Listeners
 */
searchBar.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    applyFilters();
});

// Dropdown Toggle Logic
document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        const container = trigger.parentElement;
        const isOpen = container.classList.contains('open');
        
        // Close all first
        document.querySelectorAll('.dropdown-container').forEach(c => c.classList.remove('open'));
        
        // Toggle current
        if (!isOpen) container.classList.add('open');
        e.stopPropagation();
    });
});

// Close on outside click
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-container').forEach(c => c.classList.remove('open'));
});

// Sort Item selection
document.querySelectorAll('#sortDropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
        currentSort = item.dataset.sort;
        document.querySelector('#sortDropdown .trigger-label').textContent = `Sort: ${item.textContent}`;
        applyFilters();
    });
});

// Init
fetchProblems();
