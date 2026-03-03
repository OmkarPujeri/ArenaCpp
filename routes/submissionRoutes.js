const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const submissionController = require('../controllers/submissionController');

/**
 * @route GET /api/problems
 * @desc Get all problems
 */
router.get('/problems', (req, res) => {
    try {
        const problemsPath = path.join(__dirname, '../data/problems.json');
        const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: "Failed to load problems" });
    }
});

/**
 * @route GET /api/problems/:id
 * @desc Get a specific problem by ID
 */
router.get('/problems/:id', (req, res) => {
    try {
        const problemsPath = path.join(__dirname, '../data/problems.json');
        const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
        const problem = problems.find(p => p.id === req.params.id);

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: "Failed to load problem" });
    }
});

/**
 * @route POST /api/submit
 * @desc Submit C++ code for evaluation
 */
router.post('/submit', submissionController.submitCode);

module.exports = router;
