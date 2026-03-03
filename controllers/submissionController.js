const fs = require('fs');
const path = require('path');
const compile = require('../utils/compile');
const execute = require('../utils/execute');
const cleanup = require('../utils/cleanup');

/**
 * Normalize output for comparison
 */
function normalizeOutput(output) {
    if (!output) return "";
    return output.toString().replace(/\r\n/g, '\n').trim();
}

/**
 * Compare actual vs expected output
 */
function compareOutput(actual, expected) {
    return normalizeOutput(actual) === normalizeOutput(expected);
}

/**
 * Sort input files numerically: input1, input2, input10
 */
function numericSortInputFiles(files) {
    return files.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10);
        const numB = parseInt(b.replace(/\D/g, ''), 10);
        return (numA || 0) - (numB || 0);
    });
}

/**
 * Run a single test case
 */
async function runTestCase(outPath, inputPath, expectedOutput, testCaseNumber) {
    try {
        const actualOutput = await execute(outPath, inputPath);

        if (!compareOutput(actualOutput, expectedOutput)) {
            return {
                verdict: "Wrong Answer",
                failedTestCase: testCaseNumber,
                expected: normalizeOutput(expectedOutput),
                received: normalizeOutput(actualOutput)
            };
        }

        return { verdict: "Passed" };
    } catch (error) {
        // Return first error encountered
        return {
            verdict: error.type || "Runtime Error",
            failedTestCase: testCaseNumber,
            error: error.message || "Execution error"
        };
    }
}

/**
 * Controller to handle problem submission with improved robustness
 */
exports.submitCode = async (req, res) => {
    const { code, problemId, runMode } = req.body;

    if (!code || !problemId) {
        return res.status(400).json({ error: "Code and problemId are required." });
    }

    const id = Date.now();
    const submissionDir = path.join(__dirname, `../submissions/${id}`);
    const sourcePath = path.join(submissionDir, `${id}.cpp`);
    const outPath = path.join(submissionDir, `${id}.exe`);
    const testcasesDir = path.join(__dirname, "../testcases", problemId);

    // Step 1: Create per-submission workspace
    try {
        if (!fs.existsSync(submissionDir)) {
            fs.mkdirSync(submissionDir, { recursive: true });
        }
        fs.writeFileSync(sourcePath, code);
    } catch (err) {
        console.error(`[INTERNAL ERROR] Failed to create workspace: ${err.message}`);
        return res.status(500).json({ verdict: "Internal Error", message: "Failed to initialize submission workspace" });
    }

    const startTime = Date.now();

    try {
        // Step 2: Compile
        await compile(sourcePath, outPath);

        // Step 3: Check testcases directory
        if (!fs.existsSync(testcasesDir)) {
            return res.json({ 
                verdict: "Internal Error", 
                message: `Problem directory not found: ${problemId}` 
            });
        }

        const files = fs.readdirSync(testcasesDir);
        const inputFiles = numericSortInputFiles(
            files.filter(f => f.startsWith('input') && f.endsWith('.txt'))
        );

        // In Run mode, only use the first test case
        const targetInputFiles = runMode ? inputFiles.slice(0, 1) : inputFiles;
        const totalTestCases = targetInputFiles.length;

        if (totalTestCases === 0) {
            return res.json({ verdict: "Internal Error", message: "No testcases found" });
        }

        let passed = 0;

        // Step 4: Run against test cases
        for (let i = 0; i < totalTestCases; i++) {
            const inputFileName = targetInputFiles[i];
            const outputFileName = inputFileName.replace('input', 'output');

            const inputPath = path.join(testcasesDir, inputFileName);
            const outputPath = path.join(testcasesDir, outputFileName);

            if (!fs.existsSync(outputPath)) {
                return res.json({
                    verdict: "Internal Error",
                    message: `Expected output file missing for ${inputFileName}`
                });
            }

            const expectedOutput = fs.readFileSync(outputPath, 'utf8');

            const result = await runTestCase(outPath, inputPath, expectedOutput, i + 1);

            if (result.verdict !== "Passed") {
                return res.json(result);
            }

            passed++;
        }

        // All test cases passed
        const executionTime = Date.now() - startTime;
        return res.json({
            verdict: runMode ? "Passed (Single Test)" : "Accepted",
            totalTestCases: inputFiles.length, 
            total: runMode ? 1 : inputFiles.length,
            passed: runMode ? 1 : passed,
            executionTime
        });

    } catch (error) {
        if (error.type === 'Compilation Error') {
            return res.json({
                verdict: "Compilation Error",
                error: (error.message || "").trim()
            });
        }
        return res.json({
            verdict: error.type || "Runtime Error",
            error: error.message || "Unknown error occurred"
        });
    } finally {
        // Step 5: Secure cleanup of the entire submission directory
        cleanup([submissionDir]);
    }
};
