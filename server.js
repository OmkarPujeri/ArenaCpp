/**
 * CppJudge - Basic Online Judge Backend
 * This system executes user code directly on host machine and is NOT safe for production.
 * Future improvement: Docker sandboxing.
 */

const express = require('express');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', submissionRoutes);
const problemRoutes = require("./routes/problemRoutes");
console.log("Server loaded problem routes");
app.use("/api/problems", problemRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to CppJudge API" });
});

// Start server
app.listen(PORT, () => {
    console.log(`[LOG] Server is running on http://localhost:${PORT}`);
    console.warn(`[WARNING] SYSTEM IS NOT SANDBOXED. DO NOT RUN UNTRUSTED CODE.`);
});
