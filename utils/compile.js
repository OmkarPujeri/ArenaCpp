const { spawn } = require('child_process');

/**
 * Compiles a C++ file using g++.
 * @param {string} filePath - Absolute path to the .cpp file.
 * @param {string} outPath - Absolute path to the output binary.
 * @returns {Promise<void>} Resolves if compilation succeeds, rejects if it fails.
 */
const compile = (filePath, outPath) => {
    return new Promise((resolve, reject) => {
        console.log(`[LOG] Compiling: g++ "${filePath}" -o "${outPath}"`);
        
        const child = spawn('g++', [filePath, '-o', outPath]);
        
        let stderr = '';
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`[LOG] Compilation Successful`);
                resolve();
            } else {
                console.error(`[ERROR] Compilation Failed: ${stderr}`);
                reject({ type: 'Compilation Error', message: stderr.trim() });
            }
        });

        child.on('error', (err) => {
            reject({ type: 'Internal Error', message: `Failed to start compiler: ${err.message}` });
        });
    });
};

module.exports = compile;
