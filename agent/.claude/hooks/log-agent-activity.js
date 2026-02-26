#!/usr/bin/env node
/**
 * log-agent-activity.js
 *
 * Hook: PostToolUse (Write, Edit, MultiEdit, Read)
 * Purpose: Log every file operation performed by any agent to an activity log
 *          for auditing, debugging, and evolution-team analysis.
 *
 * Log file: .claude/memory/activity.log (created if it doesn't exist)
 *
 * Input (stdin): JSON object with tool name, tool input, and tool response
 * Output: Always exits 0 (logging should never block operations)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const LOG_PATH = path.join(
  process.cwd(),
  ".claude",
  "memory",
  "activity.log"
);

function ensureLogDir() {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatTimestamp() {
  return new Date().toISOString();
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
  });
}

async function main() {
  const raw = await readStdin();

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolName = input.tool_name || input.tool || "unknown";
  const toolInput = input.tool_input || input.input || {};

  const filePath =
    toolInput.path ||
    toolInput.file_path ||
    toolInput.new_path ||
    (Array.isArray(toolInput.edits) &&
      toolInput.edits
        .map((e) => e && e.path)
        .filter(Boolean)
        .join(", ")) ||
    toolInput.command ||
    "";

  const logEntry = `[${formatTimestamp()}] ${toolName.padEnd(12)} ${filePath}\n`;

  try {
    ensureLogDir();
    fs.appendFileSync(LOG_PATH, logEntry, "utf8");
  } catch (err) {
    process.stderr.write(
      `[log-agent-activity] Failed to write log: ${err.message}\n`
    );
  }

  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`[log-agent-activity] Error: ${err.message}\n`);
  process.exit(0);
});
