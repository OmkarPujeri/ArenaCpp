const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const problemsPath = path.join(__dirname, "../data/problems.json");

// Get all problems
router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(problemsPath));
  res.json(data);
});

// Get single problem by id
router.get("/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(problemsPath));
  const problem = data.find(p => p.id === req.params.id);

  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  res.json(problem);
});

module.exports = router;