const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function isValidEdge(raw) {
  const s = raw.trim();
  return /^[A-Z]->[A-Z]$/.test(s);
}

function parseEdge(raw) {
  const s = raw.trim();
  return {
    from: s[0],
    to: s[3],
  };
}

function buildTrees(validEdges) {
  const childrenOf = {};
  const parentOf = {}; // FIXED
  const allNodes = new Set();

  for (const { from, to } of validEdges) {
    allNodes.add(from);
    allNodes.add(to);

    if (!childrenOf[from]) {
      childrenOf[from] = [];
    }

    // Multi-parent handling:
    // First parent wins
    if (parentOf[to] !== undefined) {
      continue;
    }

    parentOf[to] = from;
    childrenOf[from].push(to);
  }

  const roots = [...allNodes].filter((node) => parentOf[node] === undefined);

  const visited = new Set();
  const components = [];

  function collectComponent(start) {
    const comp = new Set();
    const stack = [start];

    while (stack.length) {
      const node = stack.pop();

      if (comp.has(node)) continue;

      comp.add(node);
      visited.add(node);

      for (const child of childrenOf[node] || []) {
        stack.push(child);
      }
    }

    return comp;
  }

  for (const root of roots) {
    if (!visited.has(root)) {
      components.push({
        root,
        nodes: collectComponent(root),
      });
    }
  }

  // Handle pure cycles
  const unreached = [...allNodes].filter((node) => !visited.has(node));

  if (unreached.length) {
    const cycleVisited = new Set();

    for (const node of unreached) {
      if (cycleVisited.has(node)) continue;

      const comp = new Set();
      const stack = [node];

      while (stack.length) {
        const curr = stack.pop();

        if (comp.has(curr)) continue;

        comp.add(curr);
        cycleVisited.add(curr);

        for (const child of childrenOf[curr] || []) {
          stack.push(child);
        }
      }

      const cycleRoot = [...comp].sort()[0];

      components.push({
        root: cycleRoot,
        nodes: comp,
        isCycle: true,
      });
    }
  }

  return {
    components,
    childrenOf,
  };
}

function hasCycle(root, childrenOf) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    if (recStack.has(node)) {
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    recStack.add(node);

    for (const child of childrenOf[node] || []) {
      if (dfs(child)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  return dfs(root);
}

function buildTree(node, childrenOf) {
  const obj = {};

  for (const child of childrenOf[node] || []) {
    obj[child] = buildTree(child, childrenOf);
  }

  return obj;
}

function getDepth(node, childrenOf) {
  const children = childrenOf[node] || [];

  if (children.length === 0) {
    return 1;
  }

  return 1 + Math.max(...children.map((child) => getDepth(child, childrenOf)));
}

// ─────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────

app.post("/api/graph", (req, res) => {
  const { edges = [] } = req.body;

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const validEdges = [];

  for (const raw of edges) {
    const trimmed = typeof raw === "string" ? raw.trim() : "";

    // Self-loop
    if (/^[A-Z]->[A-Z]$/.test(trimmed) && trimmed[0] === trimmed[3]) {
      invalidEntries.push(raw);
      continue;
    }

    if (!isValidEdge(trimmed)) {
      invalidEntries.push(raw);
      continue;
    }

    if (seenEdges.has(trimmed)) {
      if (!duplicateEdges.includes(trimmed)) {
        duplicateEdges.push(trimmed);
      }
      continue;
    }

    seenEdges.add(trimmed);
    validEdges.push(parseEdge(trimmed));
  }

  const { components, childrenOf } = buildTrees(validEdges);

  const hierarchies = [];

  let totalTrees = 0;
  let totalCycles = 0;

  for (const component of components) {
    const { root, isCycle } = component;

    if (isCycle || hasCycle(root, childrenOf)) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });

      totalCycles++;
    } else {
      const tree = {
        [root]: buildTree(root, childrenOf),
      };

      const depth = getDepth(root, childrenOf);

      hierarchies.push({
        root,
        tree,
        depth,
      });

      totalTrees++;
    }
  }

  const nonCyclicTrees = hierarchies.filter((h) => !h.has_cycle);

  let largestRoot = "";

  if (nonCyclicTrees.length > 0) {
    const maxDepth = Math.max(...nonCyclicTrees.map((h) => h.depth));

    const candidates = nonCyclicTrees
      .filter((h) => h.depth === maxDepth)
      .map((h) => h.root)
      .sort();

    largestRoot = candidates[0];
  }

  res.json({
    user_id: "amanvats_22042005",
    email_id: "aman.vats.btech2023@sitpune.edu.in",
    enrollment_number: "23070122025",

    hierarchies,

    invalid_entries: invalidEntries,

    duplicate_edges: duplicateEdges,

    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestRoot,
    },
  });
});

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
