const fs = require('fs');
const path = require('path');

/**
 * Deletes temporary files or directories after processing.
 * @param {string[]} paths - Array of absolute file or directory paths to delete.
 */
const cleanup = (paths) => {
    paths.forEach((itemPath) => {
        if (fs.existsSync(itemPath)) {
            try {
                const stat = fs.lstatSync(itemPath);
                if (stat.isDirectory()) {
                    fs.rmSync(itemPath, { recursive: true, force: true });
                    console.log(`[CLEANUP] Deleted directory: ${itemPath}`);
                } else {
                    fs.unlinkSync(itemPath);
                    console.log(`[CLEANUP] Deleted file: ${itemPath}`);
                }
            } catch (error) {
                console.error(`[CLEANUP ERROR] Failed to delete: ${itemPath}`, error);
            }
        }
    });
};

module.exports = cleanup;
