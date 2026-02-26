'use strict';
// log-subagent-lifecycle.js
// 记录 Subagent 启停事件（跨平台：Node.js）
// 调用方通过 process.env.LIFECYCLE_EVENT 传入 'START' 或 'STOP'

const fs   = require('fs');
const path = require('path');

const eventType = process.env.LIFECYCLE_EVENT || 'EVENT';

let data = '';
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  let agent = 'unknown';
  try {
    const input = JSON.parse(data);
    agent = input.agent_type || 'unknown';
  } catch (e) {
    const match = data.match(/"agent_type":"([^"]*)"/);
    agent = match ? match[1] : 'unknown';
  }

  const logFile = path.join(process.env.CLAUDE_PROJECT_DIR, '.claude', 'memory', 'agent-activity.log');
  const ts      = new Date().toISOString().replace('T', ' ').slice(0, 19);

  try {
    fs.appendFileSync(logFile, `[${ts}] [${eventType}] ${agent}\n`);
  } catch (e) { /* 日志写入失败不阻塞主流程 */ }

  process.exit(0);
});
