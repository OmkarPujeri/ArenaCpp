const { spawn } = require('child_process');
const fs = require('fs');

const MAX_OUTPUT_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Executes a binary with timeout and output limit.
 * @param {string} outPath - Absolute path to the binary.
 * @param {string} inputPath - Absolute path to the input.txt file.
 * @param {number} timeout - Execution timeout in ms.
 * @returns {Promise<string>} stdout output.
 */
const execute = (outPath, inputPath, timeout = 2000) => {
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        let isKilled = false;

        console.log(`[LOG] Executing: "${outPath}" < "${inputPath}" (Timeout: ${timeout}ms)`);

        const child = spawn(outPath);
        
        // Feed input to stdin
        const inputData = fs.readFileSync(inputPath);
        child.stdin.write(inputData);
        child.stdin.end();

        // Enforce timeout
        const timer = setTimeout(() => {
            isKilled = true;
            child.kill();
            console.error(`[ERROR] Execution Timeout: Time Limit Exceeded`);
            reject({ type: 'Time Limit Exceeded' });
        }, timeout);

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            if (stdout.length > MAX_OUTPUT_SIZE) {
                isKilled = true;
                clearTimeout(timer);
                child.kill();
                console.error(`[ERROR] Output Limit Exceeded`);
                reject({ type: 'Output Limit Exceeded' });
            }
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code, signal) => {
            if (isKilled) return; // Already handled by timeout or OLE
            clearTimeout(timer);

            if (code === 0) {
                console.log(`[LOG] Execution Successful`);
                resolve(stdout);
            } else {
                console.error(`[ERROR] Execution Failed Code ${code}, Signal ${signal}. Stderr: ${stderr}`);
                // Common signals: SIGSEGV (11), SIGABRT (6)
                let message = stderr.trim() || `Process exited with code ${code}`;
                if (signal === 'SIGSEGV') message = "Segmentation Fault (Memory limit or invalid access)";
                
                reject({ type: 'Runtime Error', message });
            }
        });

        child.on('error', (err) => {
            if (isKilled) return;
            clearTimeout(timer);
            reject({ type: 'Internal Error', message: `Failed to start process: ${err.message}` });
        });
    });
};

module.exports = execute;
