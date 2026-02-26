'use strict';
// protect-team-files.js
// 保护团队定义文件不被 Agent 自动修改（跨平台：Node.js）

let data = '';
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(data);
    filePath = (input.tool_input || {}).file_path || '';
  } catch (e) {
    const match = data.match(/"file_path":"((?:[^"\\]|\\.)*)"/);
    filePath = match ? JSON.parse('"' + match[1] + '"') : '';
  }

  if (!filePath) { process.exit(0); return; }

  // normalize to forward slashes for cross-platform comparison
  const fp = filePath.replace(/\\/g, '/');

  const PROTECTED = [
    'CLAUDE.md',
    '.claude/agents/',
    '.claude/team-standards/operating-protocol.md',
    '.claude/team-standards/memory-policy.md',
    '.claude/team-standards/iteration-playbook.md'
  ];

  for (const pattern of PROTECTED) {
    if (fp.includes(pattern)) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason:
            `⚠️ 受保护的团队定义文件：${filePath}\n\n` +
            `修改团队定义文件必须通过进化治理流程（Evolution Team 提案 → 用户确认 → BOSS 执行）。\n` +
            `如果您是 BOSS 正在执行已确认的提案，请点击允许。`
        }
      }) + '\n');
      process.exit(0);
      return;
    }
  }

  process.exit(0);
});
