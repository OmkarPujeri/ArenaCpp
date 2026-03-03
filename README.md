# ArenaCpp

ArenaCpp is a boutique C++ coding arena that pairs fast G++17 judging with a refined, developer-first interface and JSON-driven problem management.

---

## Highlights

- Fast local judging with G++17 compilation and execution
- Real-time verdicts with pass/fail counts
- Minimal, premium UI designed for focus and clarity
- JSON-backed problem storage for easy problem management
- Simple, extensible backend built with Express.js

---

## Tech Stack

- Frontend: HTML, CSS (modular design system), Vanilla JS  
- Backend: Node.js, Express.js  
- Compiler: G++ (C++17)  
- Storage: Local JSON (data/problems.json, data/testcases.json)

---

## Project Structure

```
/root
├── server.js                # Express entry point
├── controllers/             # Submission + problem logic
├── routes/                  # API endpoints
├── utils/                   # Compile, execute, compare utilities
├── data/                    # JSON data store
│   ├── problems.json
│   └── testcases.json
└── public/                  # Frontend UI
    ├── css/
    ├── js/
    └── *.html
```

---

## API Overview

### Problems
- `GET /api/problems`  
  Returns all problems.

- `GET /api/problems/:id`  
  Returns a single problem by ID.

### Submissions
- `POST /api/submit`  
  Submit source code for evaluation.

Request Body
```json
{
  "code": "string",
  "problemId": "string"
}
```

Response
```json
{
  "verdict": "Accepted",
  "passed": 12,
  "total": 12,
  "error": null
}
```

---

## Judging Flow

1. User submits C++ code.
2. Server writes the code into a temporary .cpp file.
3. Code is compiled with g++ (C++17).
4. Executable runs against hidden testcases.
5. Output is compared with expected results.
6. Verdict (AC / WA / TLE / CE) is returned.

---

## Deployment

### Live URL
[https://arenacpp.onrender.com/](https://arenacpp.onrender.com/)

### Render (Web Service)
This project is deployed on Render as a Web Service using Docker.
- Service Type: Web Service
- Environment: Docker
- Auto-deploy: Enabled for the main branch.

---

## Local Setup

### Requirements
- Node.js
- G++ compiler (C++17)
- Ensure both are available in your system PATH.

### Run Locally

```bash
# install dependencies
npm install

# (Optional) Rebuild the editor bundle if needed
npx esbuild src/codemirror-entry.js --bundle --minify --format=esm --outfile=public/js/codemirror.bundle.js

# start server
node server.js
```

### Editor Bundle
The IDE (CodeMirror 6) is bundled locally using `esbuild` to ensure a single instance of the editor state and avoid CDN-related version conflicts. This guarantees consistent syntax highlighting and Tab indentation across all environments.

Then open:  
```
http://localhost:3000
```

---

## Notes

- This system executes code on the host machine.  
  Do not use in production without sandboxing.
