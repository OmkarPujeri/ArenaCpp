/**
 * Compares actual output with expected output.
 * @param {string} actual - Actual stdout from execution.
 * @param {string} expected - Expected output from txt file.
 * @returns {boolean} True if they match after trimming.
 */
const compare = (actual, expected) => {
    const trimmedActual = actual.toString().trim().replace(/\r\n/g, '\n');
    const trimmedExpected = expected.toString().trim().replace(/\r\n/g, '\n');

    console.log(`[LOG] Comparing Actual Output: "${trimmedActual}" with Expected: "${trimmedExpected}"`);
    return trimmedActual === trimmedExpected;
};

module.exports = compare;
