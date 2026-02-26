#!/usr/bin/env node
/**
 * log-subagent-lifecycle.js
 *
 * Hook: SubagentStart / SubagentStop
 * Purpose: Log when specialized agents are started and stopped, to provide
 *          visibility into team activity and help evolution-team diagnose
 *          workflow patterns.
 *
 * Usage: node log-subagent-lifecycle.js [start|stop]
 *
 * Log file: .claude/memory/lifecycle.log (created if it doesn't exist)
 *
 * Input (stdin): JSON object with agent name/details
 * Output: Always exits 0 (logging should never block operations)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const LOG_PATH = path.join(
  process.cwd(),
  ".claude",
  "memory",
  "lifecycle.log"
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
  const event = process.argv[2] || "unknown"; // "start" or "stop"

  const raw = await readStdin();

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    input = {};
  }

  const agentName =
    input.agent_name ||
    input.name ||
    input.agent ||
    (input.tool_input && input.tool_input.agent) ||
    "unknown-agent";

  const taskSummary =
    input.task ||
    input.description ||
    (input.tool_input && input.tool_input.description) ||
    "";

  const logEntry =
    `[${formatTimestamp()}] ${event.toUpperCase().padEnd(5)} ${agentName}` +
    (taskSummary ? ` | ${taskSummary.slice(0, 100)}` : "") +
    `\n`;

  try {
    ensureLogDir();
    fs.appendFileSync(LOG_PATH, logEntry, "utf8");
  } catch (err) {
    process.stderr.write(
      `[log-subagent-lifecycle] Failed to write log: ${err.message}\n`
    );
  }

  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`[log-subagent-lifecycle] Error: ${err.message}\n`);
  process.exit(0);
});
