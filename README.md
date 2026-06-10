# Graph Hierarchy Analyzer

A full-stack web application built using Node.js and Express that analyzes graph relationships, detects cycles, identifies duplicate and invalid edges, and generates hierarchy trees.

## Features

- Accepts graph edges in the format `A->B`
- Detects invalid entries
- Detects duplicate edges
- Handles multi-parent nodes (first parent wins)
- Builds hierarchy trees
- Detects cyclic graphs
- Calculates tree depth
- Finds the largest tree root
- Interactive frontend UI
- REST API support

---

## Tech Stack

### Backend
- Node.js
- Express.js
- CORS

### Frontend
- HTML
- CSS
- JavaScript

### Hosting
- Render

---

## API Endpoint

### POST /api/graph

### Request Body

```json
{
  "edges": [
    "A->B",
    "A->C",
    "B->D"
  ]
}
```

### Sample Response

```json
{
  "user_id": "aman_22042005",
  "email_id": "aman.vats.btech2023@sitpune.edu.in",
  "enrollment_number": "23070122025",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          }
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## Installation

### Clone Repository

```bash
git clone <your-github-repo-url>
```

### Navigate to Project

```bash
cd bajaj-graph
```

### Install Dependencies

```bash
npm install
```

### Run Application

```bash
node index.js
```

Application runs on:

```
http://localhost:3000
```

---

## Project Structure

```
bajaj-graph/
│
├── public/
│   └── index.html
│
├── index.js
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

---

## Author

**Aman Vats**

Email: aman.vats.btech2023@sitpune.edu.in

Enrollment Number: 23070122025
