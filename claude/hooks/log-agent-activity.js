'use strict';
// log-agent-activity.js
// 记录 Agent 文件操作（跨平台：Node.js）

const fs   = require('fs');
const path = require('path');

let data = '';
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  let filePath = '', toolName = '';
  try {
    const input = JSON.parse(data);
    filePath = (input.tool_input || {}).file_path || '';
    toolName = input.tool_name || '';
  } catch (e) {
    const fp = data.match(/"file_path":"((?:[^"\\]|\\.)*)"/);
    const tn = data.match(/"tool_name":"([^"]*)"/);
    filePath = fp ? JSON.parse('"' + fp[1] + '"') : '';
    toolName = tn ? tn[1] : '';
  }

  if (!filePath) { process.exit(0); return; }

  const logFile  = path.join(process.env.CLAUDE_PROJECT_DIR, '.claude', 'memory', 'agent-activity.log');
  const ts       = new Date().toISOString().replace('T', ' ').slice(0, 19);

  try {
    fs.appendFileSync(logFile, `[${ts}] [FILE_OP] ${toolName}: ${filePath}\n`);
  } catch (e) { /* 日志写入失败不阻塞主流程 */ }

  process.exit(0);
});
