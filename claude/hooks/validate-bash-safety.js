'use strict';
// validate-bash-safety.js
// 拦截高风险命令，要求用户确认（跨平台：Node.js）

let data = '';
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  let command = '';
  try {
    const input = JSON.parse(data);
    command = (input.tool_input || {}).command || '';
  } catch (e) {
    const match = data.match(/"command":"((?:[^"\\]|\\.)*)"/);
    command = match ? JSON.parse('"' + match[1] + '"') : '';
  }

  if (!command) { process.exit(0); return; }

  // 极高风险：需要用户明确审批
  const HIGH_RISK = [
    'rm -rf', 'rm -f /', 'DROP TABLE', 'DROP DATABASE',
    'DELETE FROM', 'chmod 777', 'sudo rm', 'format c:'
  ];
  for (const pattern of HIGH_RISK) {
    if (command.toLowerCase().includes(pattern.toLowerCase())) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason:
            `🔴 高风险命令检测：\n${command}\n\n` +
            `匹配危险模式：${pattern}\n` +
            `请确认此操作是有意为之且已有回滚方案。`
        }
      }) + '\n');
      process.exit(0);
      return;
    }
  }

  // 生产环境操作：需要确认
  const PROD_PATTERNS = [
    /kubectl.*production/i,
    /docker.*prod/i,
    /git\s+push.*main/i,
    /git\s+push.*master/i
  ];
  for (const pattern of PROD_PATTERNS) {
    if (pattern.test(command)) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason:
            `⚠️ 检测到生产环境操作：\n${command}\n\n` +
            `请确认已准备好回滚方案并选择了正确的发布窗口。`
        }
      }) + '\n');
      process.exit(0);
      return;
    }
  }

  process.exit(0);
});
