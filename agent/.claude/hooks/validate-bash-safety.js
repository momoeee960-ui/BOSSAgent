#!/usr/bin/env node
/**
 * validate-bash-safety.js
 *
 * Hook: PreToolUse (Bash)
 * Purpose: Detect dangerous bash commands and ask for confirmation before
 *          allowing them to execute.
 *
 * Input (stdin): JSON object with tool name and tool input
 * Output: Exit 0 to allow, exit 1 to block (with message to stderr)
 */

"use strict";

const readline = require("readline");

// Patterns that warrant user confirmation
const DANGEROUS_PATTERNS = [
  // Destructive file operations
  { pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*r[a-zA-Z]*)\s/, label: "recursive/forced remove" },
  { pattern: /\brm\s+.*\/\s*$/, label: "remove targeting root-like path" },
  { pattern: /\brmdir\b/, label: "directory removal" },
  { pattern: /\btruncate\b/, label: "file truncation" },

  // Dangerous redirections
  { pattern: />\s*\/[a-zA-Z]/, label: "overwrite to absolute path" },
  { pattern: /\|\s*tee\s+.*\//, label: "tee to absolute path" },

  // System-level operations
  { pattern: /\bchmod\s+[0-7]*7[0-7][0-7]\b/, label: "world-writable chmod" },
  { pattern: /\bchown\b.*\broot\b/, label: "chown to root" },
  { pattern: /\bsudo\b/, label: "sudo command" },
  { pattern: /\bsu\s+/, label: "su command" },

  // Network operations
  { pattern: /\bcurl\b.*\|\s*(ba)?sh\b/, label: "pipe curl to shell" },
  { pattern: /\bwget\b.*\|\s*(ba)?sh\b/, label: "pipe wget to shell" },
  { pattern: /\bnc\b.*-e\b/, label: "netcat with exec" },

  // Package / dependency operations that modify the system
  { pattern: /\bnpm\s+install\s+-g\b/, label: "global npm install" },
  {
    pattern: /\bpip\s+install\b(?!.*--user)/,
    label: "pip install without --user",
    // Allow when pip is invoked from a virtualenv bin directory
    exclude: /(?:venv|\.venv|virtualenv|env)[/\\](?:bin|Scripts)[/\\]pip/,
  },

  // Process control
  { pattern: /\bkill\s+-9\s/, label: "force kill process" },
  { pattern: /\bpkill\b/, label: "pkill" },
  { pattern: /\bkillall\b/, label: "killall" },

  // Database operations
  { pattern: /\bDROP\s+DATABASE\b/i, label: "DROP DATABASE" },
  { pattern: /\bDROP\s+TABLE\b/i, label: "DROP TABLE" },
  { pattern: /\bTRUNCATE\s+TABLE\b/i, label: "TRUNCATE TABLE" },

  // Git operations that rewrite history
  { pattern: /\bgit\s+push\s+.*--force\b/, label: "git force push" },
  { pattern: /\bgit\s+reset\s+--hard\b/, label: "git reset --hard" },
  { pattern: /\bgit\s+clean\s+-[a-zA-Z]*f/, label: "git clean -f" },
];

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

  const toolInput = input.tool_input || input.input || {};
  const command = toolInput.command || toolInput.cmd || "";

  if (!command) {
    process.exit(0);
  }

  const matches = DANGEROUS_PATTERNS.filter(({ pattern, exclude }) =>
    pattern.test(command) && !(exclude && exclude.test(command))
  );

  if (matches.length === 0) {
    process.exit(0);
  }

  const labels = matches.map((m) => `• ${m.label}`).join("\n");

  process.stdout.write(
    `\n⚠️  DANGEROUS COMMAND DETECTED\n` +
      `Command: ${command}\n\n` +
      `Flagged patterns:\n${labels}\n\n` +
      `To proceed, type CONFIRM and press Enter. To cancel, press Ctrl+C or type anything else.\n`
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const answer = await new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // In non-interactive context, block dangerous commands
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
      `[validate-bash-safety] Blocked dangerous command: ${command}\n`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`[validate-bash-safety] Error: ${err.message}\n`);
  process.exit(0); // Fail open
});
