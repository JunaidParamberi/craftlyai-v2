#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [, , taskName, status] = process.argv;

if (!taskName || !status) {
  console.error(
    "Usage: node update-task-status.mjs \"Task name\" <done|in-progress|todo>",
  );
  process.exit(1);
}

const statusMap = new Map([
  ["done", "[x]"],
  ["in-progress", "[ ] in-progress ·"],
  ["todo", "[ ] todo ·"],
]);

const token = statusMap.get(status);
if (!token) {
  console.error("Status must be one of: done, in-progress, todo");
  process.exit(1);
}

const filePath = path.resolve("CLAUDE.md");
const file = fs.readFileSync(filePath, "utf8");
const lines = file.split("\n");
let updated = false;

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (!line.startsWith("- [")) continue;
  if (!line.includes(taskName)) continue;

  const rest = line.replace(/^- \[[ x]\](?: (?:todo|in-progress) ·)?\s*/, "");
  lines[i] = `- ${token} ${rest}`;
  updated = true;
  break;
}

if (!updated) {
  console.error(`Task not found in CLAUDE.md: ${taskName}`);
  process.exit(1);
}

fs.writeFileSync(filePath, `${lines.join("\n")}\n`);
console.log(`Updated "${taskName}" to "${status}".`);
