let problems = [];
let currentFilter = 'All';
let currentSearch = '';

const tableBody = document.getElementById('problemTableBody');
const searchBar = document.getElementById('searchBar');
const filterBtns = document.querySelectorAll('.filter-btn');

/**
 * Fetch problems from API
 */
async function fetchProblems() {
    try {
        const response = await fetch('/api/problems');
        problems = await response.json();
        renderProblems();
    } catch (err) {
        console.error('Failed to fetch problems:', err);
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: var(--wa);">Error loading problems. Make sure the API is running.</td></tr>';
    }
}

/**
 * Render problems to the table with filtering
 */
function renderProblems() {
    const filtered = problems.filter(p => {
        const matchDifficulty = currentFilter === 'All' || p.difficulty === currentFilter;
        const matchSearch = p.title.toLowerCase().includes(currentSearch.toLowerCase());
        return matchDifficulty && matchSearch;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px; color: var(--muted);">No problems found.</td></tr>';
        return;
    }

    filtered.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'problem-row';
        row.innerHTML = `
            <td>${p.title}</td>
            <td><span class="diff-badge diff-${p.difficulty}">${p.difficulty}</span></td>
            <td>${p.topic}</td>
        `;
        
        row.addEventListener('click', () => {
            window.location.href = `problem.html?id=${p.id}`;
        });

        tableBody.appendChild(row);
    });
}

// Search Logic
searchBar.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderProblems();
});

// Filter Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update UI
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update State
        currentFilter = btn.dataset.difficulty;
        renderProblems();
    });
});

// Initialize
fetchProblems();
