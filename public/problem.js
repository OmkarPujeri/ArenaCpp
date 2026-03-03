// Extract problem ID from URL query string
const urlParams = new URLSearchParams(window.location.search);
const problemId = urlParams.get('id');

const problemDetail = document.getElementById('problemDetail');
const submitBtn = document.getElementById('submitBtn');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const shortcutsBtn = document.getElementById('shortcutsBtn');
const shortcutsOverlay = document.getElementById('shortcutsOverlay');
const closeShortcuts = document.getElementById('closeShortcuts');

/**
 * Initialize CodeMirror Editor
 */
let editor;
const initialCode = `#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`;

async function initEditor() {
    try {
        const { EditorView, basicSetup, cpp, oneDark, keymap, indentWithTab } = await import("./js/codemirror.bundle.js");

        editor = new EditorView({
            doc: initialCode,
            extensions: [
                basicSetup,
                cpp(),
                oneDark,
                keymap.of([
                    indentWithTab,
                    {
                        key: "Ctrl-Enter",
                        run: () => { handleRun(); return true; }
                    },
                    {
                        key: "Ctrl-Shift-Enter",
                        run: () => { handleSubmit(); return true; }
                    }
                ]),
            EditorView.theme({
                "&": { height: "100%", width: "100%" },
                ".cm-scroller": { 
                    overflow: "auto",
                    height: "100%",
                    maxHeight: "none"
                },
                "&.cm-focused": { outline: "none" }
            })

            ],
            parent: document.getElementById("editor")
        });
    } catch (e) {
        console.error("CodeMirror failed to load:", e);
        const codeTextarea = document.getElementById("code");
        if (codeTextarea) {
            codeTextarea.style.display = "block";
            codeTextarea.style.width = "100%";
            codeTextarea.style.height = "100%";
            codeTextarea.style.background = "#0B0B0E";
            codeTextarea.style.color = "#fff";
            codeTextarea.style.border = "none";
            codeTextarea.style.padding = "20px";
            codeTextarea.style.fontFamily = "'JetBrains Mono', monospace";
            codeTextarea.style.fontSize = "14px";
            codeTextarea.style.lineHeight = "1.6";
            codeTextarea.style.outline = "none";
            codeTextarea.style.resize = "none";
            codeTextarea.style.overflowY = "auto";
            codeTextarea.value = initialCode;

            // Basic Tab support for fallback textarea
            codeTextarea.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = codeTextarea.selectionStart;
                    const end = codeTextarea.selectionEnd;
                    codeTextarea.value = codeTextarea.value.substring(0, start) + 
                                       "    " + codeTextarea.value.substring(end);
                    codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 4;
                }
            });
        }
    }
}

// Shortcuts logic
if (shortcutsBtn) {
    shortcutsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shortcutsOverlay.classList.toggle('hidden');
    });
}
if (closeShortcuts) {
    closeShortcuts.addEventListener('click', () => {
        shortcutsOverlay.classList.add('hidden');
    });
}

// Close shortcuts if clicking outside
document.addEventListener('click', (e) => {
    if (shortcutsOverlay && !shortcutsOverlay.contains(e.target) && !shortcutsBtn.contains(e.target)) {
        shortcutsOverlay.classList.add('hidden');
    }
});

// Reset logic
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm("Reset code to default?")) {
            if (editor && typeof editor.dispatch === 'function') {
                editor.dispatch({
                    changes: { from: 0, to: editor.state.doc.length, insert: initialCode }
                });
            } else {
                const codeTextarea = document.getElementById("code");
                if (codeTextarea) codeTextarea.value = initialCode;
            }
        }
    });
}

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
    if (!title) return "";
    const clean = sanitize(title);
    return clean.startsWith("The ") ? clean.slice(4) : clean;
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
                li.style.wordBreak = 'break-word';
                li.style.overflowWrap = 'break-word';
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
 * Handle run (single testcase)
 */
async function handleRun() {
    await performSubmission(true);
}

/**
 * Handle submission (all testcases)
 */
async function handleSubmit() {
    await performSubmission(false);
}

/**
 * Perform submission/run logic
 */
async function performSubmission(isRunMode = false) {
    let code = "";
    if (editor && editor.state) {
        code = editor.state.doc.toString();
    } else {
        const codeTextarea = document.getElementById("code");
        if (codeTextarea) code = codeTextarea.value;
    }

    const resultBox = document.getElementById('result');
    const verdictText = document.getElementById('verdictText');
    const passedText = document.getElementById('passedText');
    const totalText = document.getElementById('totalText');
    const errorLog = document.getElementById('errorLog');
    const targetBtn = isRunMode ? runBtn : submitBtn;

    if (!code.trim()) {
        alert('Please enter some code.');
        return;
    }

    const originalText = targetBtn.innerText;
    targetBtn.innerText = isRunMode ? 'Running...' : 'Compiling...';
    targetBtn.disabled = true;
    targetBtn.style.opacity = '0.7';

    // Clear previous results
    resultBox.classList.add('hidden');
    errorLog.classList.add('hidden');

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code, 
                problemId,
                runMode: isRunMode 
            })
        });

        if (!response.ok) throw new Error("Submission failed");
        
        const data = await response.json();

        // Populate results
        verdictText.textContent = data.verdict;
        passedText.textContent = data.passed || 0;
        totalText.textContent = data.total || 0;

        if (data.error || data.received) {
            let log = data.error || "";
            if (data.verdict === "Wrong Answer" && isRunMode) {
                log = `Expected:\n${data.expected}\n\nReceived:\n${data.received}`;
            }
            errorLog.textContent = log;
            errorLog.classList.remove('hidden');
        }

        // Emit custom event
        window.dispatchEvent(new CustomEvent('arenaVerdictReceived', { 
            detail: { 
                verdict: data.verdict, 
                passed: data.passed, 
                total: data.total,
                isRunMode
            } 
        }));

    } catch (err) {
        console.error('Submission failed:', err);
        alert('Failed to connect to the arena server.');
    } finally {
        targetBtn.innerText = originalText;
        targetBtn.disabled = false;
        targetBtn.style.opacity = '1';
    }
}

// Event Listeners for buttons
submitBtn.addEventListener('click', handleSubmit);
runBtn.addEventListener('click', handleRun);

// Keyboard Global Shortcuts (Optional fallback)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        if (e.shiftKey) handleSubmit();
        else handleRun();
    }
    if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('arenaToggleConsole'));
    }
});

// Initialize
initEditor();
fetchProblem();
