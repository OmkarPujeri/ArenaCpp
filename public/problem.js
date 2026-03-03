// Extract problem ID from URL query string
const urlParams = new URLSearchParams(window.location.search);
const problemId = urlParams.get('id');

const problemDetail = document.getElementById('problemDetail');
const submitBtn = document.getElementById('submitBtn');

/**
 * Fetch specific problem details
 */
async function fetchProblem() {
    if (!problemId) {
        document.getElementById('problemTitle').innerText = "Error: No problem ID provided.";
        return;
    }

    try {
        const response = await fetch(`/api/problems/${problemId}`);
        if (!response.ok) {
            throw new Error(response.status === 404 ? "Problem not found" : "Failed to load problem");
        }
        
        const problem = await response.json();
        renderProblem(problem);
    } catch (err) {
        console.error('Failed to fetch problem:', err);
        document.getElementById('problemTitle').innerText = "Error loading problem details.";
    }
}

// Problem difficulty badge class mapping
const difficultyBadgeMap = {
    'Easy': 'badge badge-easy',
    'Medium': 'badge badge-medium',
    'Hard': 'badge badge-hard'
};

/**
 * Sanitize text by removing $ and other artifacts
 */
function sanitize(text) {
    if (!text) return "";
    return text.replace(/\$/g, '');
}

/**
 * Sanitize text by removing $ and other artifacts, and converting LaTeX symbols
 */
function sanitize(text) {
    if (!text) return "";
    return text
        .replace(/\$/g, '')
        .replace(/\\le/g, '≤')
        .replace(/\\ge/g, '≥');
}

/**
 * Format title for display
 */
function formatTitle(title) {
    return sanitize(title) || "";
}

/**
 * Render problem data to the UI with Arena 2.0 styles (Unified continuous layout)
 */
function renderProblem(p) {
    if (!p) return;

    // Header Info
    document.getElementById('problemTitle').innerText = formatTitle(p.title) || "Untitled Problem";
    
    // Metadata row: Difficulty + Tags
    const diffBadge = document.getElementById('problemDiff');
    diffBadge.innerText = p.difficulty || "Unknown";
    diffBadge.className = difficultyBadgeMap[p.difficulty] || 'badge';
    
    const tagContainer = document.getElementById('tagContainer');
    tagContainer.innerHTML = '';
    
    // Combine topic and tags if they exist
    const tags = [];
    if (p.topic) tags.push(p.topic);
    if (p.tags && Array.isArray(p.tags)) tags.push(...p.tags);

    // Remove duplicates and render
    const uniqueTags = [...new Set(tags)];
    uniqueTags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'badge badge-topic';
        span.style.fontSize = '10px';
        span.style.padding = '3px 10px';
        span.style.textTransform = 'capitalize';
        span.innerText = tag;
        tagContainer.appendChild(span);
    });

    // Continuous Content Sections
    document.getElementById('problemDesc').innerText = sanitize(p.description) || "No description available.";
    document.getElementById('inputFormat').innerText = sanitize(p.inputFormat) || "Standard input.";
    document.getElementById('outputFormat').innerText = sanitize(p.outputFormat) || "Standard output.";
    
    const constraintsElem = document.getElementById('constraints');
    const constraintsSection = document.getElementById('constraintsSection');
    const constraintsText = sanitize(p.constraints);
    
    if (constraintsText && constraintsText.trim() !== "") {
        // Split by semicolon and render as bullets
        const constraintLines = constraintsText.split(';').map(s => s.trim()).filter(s => s !== "");
        if (constraintLines.length > 0) {
            constraintsElem.innerHTML = ''; // Clear existing pre text
            const ul = document.createElement('ul');
            ul.style.listStyleType = 'disc';
            ul.style.paddingLeft = '20px';
            ul.style.margin = '0';
            
            constraintLines.forEach(line => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';
                li.style.color = 'var(--text-secondary)';
                li.innerText = line;
                ul.appendChild(li);
            });
            constraintsElem.appendChild(ul);
            constraintsSection.style.display = 'block';
        } else {
            constraintsSection.style.display = 'none';
        }
    } else {
        constraintsSection.style.display = 'none';
    }

    // Render Examples (Supporting 'examples' and legacy 'exampleTestCases')
    const examplesContainer = document.getElementById('examplesContainer');
    const examplesSection = document.getElementById('examplesSection');
    examplesContainer.innerHTML = '';
    
    const testCases = p.examples || p.exampleTestCases || [];

    if (testCases && testCases.length > 0) {
        examplesSection.style.display = 'block';
        testCases.forEach((ex, idx) => {
            const exDiv = document.createElement('div');
            exDiv.style.marginBottom = '28px';
            
            let html = `
                <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary); font-weight: 600;">Example ${idx + 1}</h4>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <div class="label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Input</div>
                        <pre style="margin: 0; font-family: 'JetBrains Mono'; font-size: 13px; color: var(--text-primary); background: rgba(0,0,0,0.2); padding: 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); white-space: pre-wrap;">${sanitize(ex.input)}</pre>
                    </div>
                    <div>
                        <div class="label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Output</div>
                        <pre style="margin: 0; font-family: 'JetBrains Mono'; font-size: 13px; color: var(--status-ac); background: rgba(0,0,0,0.2); padding: 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); white-space: pre-wrap;">${sanitize(ex.output)}</pre>
                    </div>`;

            if (ex.explanation) {
                html += `
                    <div>
                        <div class="label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Explanation</div>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: var(--text-secondary);">${sanitize(ex.explanation)}</p>
                    </div>`;
            }

            html += `</div>`;
            exDiv.innerHTML = html;
            examplesContainer.appendChild(exDiv);
        });
    } else {
        examplesSection.style.display = 'none';
    }

    // Reveal content
    if (problemDetail) {
        problemDetail.classList.add('fade-in');
    }
}

/**
 * Handle submission with Arena 2.0 console events
 */
submitBtn.addEventListener('click', async () => {
    const code = document.getElementById('code').value;
    const resultBox = document.getElementById('result');
    const verdictText = document.getElementById('verdictText');
    const passedText = document.getElementById('passedText');
    const totalText = document.getElementById('totalText');
    const errorLog = document.getElementById('errorLog');

    if (!code.trim()) {
        alert('Please enter some code.');
        return;
    }

    submitBtn.innerText = 'Compiling...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // Clear previous results
    resultBox.classList.add('hidden');
    errorLog.classList.add('hidden');

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, problemId })
        });

        if (!response.ok) throw new Error("Submission failed");
        
        const data = await response.json();

        // Populate results
        verdictText.textContent = data.verdict;
        passedText.textContent = data.passed || 0;
        totalText.textContent = data.total || 0;

        if (data.error) {
            errorLog.textContent = data.error;
            errorLog.classList.remove('hidden');
        }

        // Emit custom event for the Arena Console component to handle animations
        window.dispatchEvent(new CustomEvent('arenaVerdictReceived', { 
            detail: { 
                verdict: data.verdict, 
                passed: data.passed, 
                total: data.total 
            } 
        }));

    } catch (err) {
        console.error('Submission failed:', err);
        alert('Failed to connect to the arena server.');
    } finally {
        submitBtn.innerText = 'Submit Code';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
});

// Initialize
fetchProblem();
