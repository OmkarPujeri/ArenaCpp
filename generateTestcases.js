const fs = require("fs");
const path = require("path");

console.log("🚀 Script started");

// Absolute path to testcases.json
const testDataPath = path.join(__dirname, "data", "testcases.json");
const testcasesRoot = path.join(__dirname, "testcases");

console.log("📂 Reading from:", testDataPath);

// Check file exists
if (!fs.existsSync(testDataPath)) {
  console.error("❌ testcases.json not found at:", testDataPath);
  process.exit(1);
}

// Read file
const rawData = fs.readFileSync(testDataPath, "utf-8");

// Check if empty
if (!rawData.trim()) {
  console.error("❌ testcases.json is empty");
  process.exit(1);
}

let data;

try {
  data = JSON.parse(rawData);
} catch (err) {
  console.error("❌ Invalid JSON format:", err.message);
  process.exit(1);
}

console.log("📊 Total problems found:", data.length);

// Ensure testcases root folder exists
fs.mkdirSync(testcasesRoot, { recursive: true });

// Generate folders + files
data.forEach(problem => {
  if (!problem.id || !problem.testCases) {
    console.warn(`⚠️ Skipping invalid problem entry:`, problem);
    return;
  }

  const problemDir = path.join(testcasesRoot, problem.id);
  fs.mkdirSync(problemDir, { recursive: true });

  problem.testCases.forEach((tc, index) => {
    const inputPath = path.join(problemDir, `input${index + 1}.txt`);
    const outputPath = path.join(problemDir, `output${index + 1}.txt`);

    fs.writeFileSync(inputPath, tc.input);
    fs.writeFileSync(outputPath, tc.output);
  });

  console.log(`✅ Generated testcases for ${problem.id}`);
});

console.log("🎉 All testcases generated successfully.");