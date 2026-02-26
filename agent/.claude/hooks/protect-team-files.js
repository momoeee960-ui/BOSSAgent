#!/usr/bin/env node
/**
 * protect-team-files.js
 *
 * Hook: PreToolUse (Write, Edit, MultiEdit)
 * Purpose: When an agent attempts to write or edit files inside .claude/agents/,
 *          .claude/hooks/, or .claude/team-standards/, ask the user for confirmation
 *          before allowing the operation to proceed.
 *
 * Input (stdin): JSON object with tool name and tool input
 * Output: Exit 0 to allow, exit 1 to block (with message to stderr)
 */

"use strict";

const readline = require("readline");

const PROTECTED_PATTERNS = [
  /\.claude[\\/]agents[\\/]/,
  /\.claude[\\/]hooks[\\/]/,
  /\.claude[\\/]team-standards[\\/]/,
  /CLAUDE\.md$/,
];

function isProtected(filePath) {
  if (!filePath) return false;
  return PROTECTED_PATTERNS.some((pattern) => pattern.test(filePath));
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
    // Not valid JSON or no input — allow the operation
    process.exit(0);
  }

  const toolInput = input.tool_input || input.input || {};

  // Collect all file paths touched by this operation (handles MultiEdit)
  const filePaths = [];
  if (toolInput.path) filePaths.push(toolInput.path);
  if (toolInput.file_path) filePaths.push(toolInput.file_path);
  if (toolInput.new_path) filePaths.push(toolInput.new_path);
  if (Array.isArray(toolInput.edits)) {
    toolInput.edits.forEach((edit) => {
      if (edit && edit.path) filePaths.push(edit.path);
    });
  }

  const protectedPaths = filePaths.filter(isProtected);

  if (protectedPaths.length === 0) {
    process.exit(0);
  }

  const filePath = protectedPaths.join(", ");

  // Print warning to stdout (visible to user via Claude Code)
  process.stdout.write(
    `\n⚠️  PROTECTED FILE(S): "${filePath}"\n` +
      `These files are part of the BOSS Agent system definition.\n` +
      `Modifying them will change agent behavior.\n\n` +
      `To proceed, type CONFIRM and press Enter. To cancel, press Ctrl+C or type anything else.\n`
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const answer = await new Promise((resolve) => {
    // In non-interactive hook context, default to blocking
    if (!process.stdin.isTTY) {
      resolve("BLOCKED");
      return;
    }
    rl.question("> ", (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });

  if (answer === "CONFIRM") {
    process.exit(0);
  } else {
    process.stderr.write(
      `[protect-team-files] Blocked write to protected file: ${filePath}\n`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`[protect-team-files] Error: ${err.message}\n`);
  process.exit(0); // Fail open — don't block on hook errors
});
