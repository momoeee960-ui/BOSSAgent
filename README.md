# BOSS Agent — Claude Code Multi-Agent Team System

> Turn Claude Code into a **full dev team** with 11 specialized agents, automated quality gates, and cross-session memory.

---

## What is this?

A drop-in prompt engineering system for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that transforms a single AI assistant into a coordinated team of specialists:

- **1 BOSS** (CLAUDE.md) — routes tasks, enforces quality gates, manages memory
- **11 Agents** (.claude/agents/) — each with professional DNA, proactive behaviors, and non-negotiable standards
- **4 Hooks** (.claude/hooks/) — automated enforcement layer (file protection, dangerous command detection, activity logging)
- **3 Memory files** (.claude/memory/) — project context, user preferences, decision history

## Quick Start

```bash
# 1. Copy to your project root
cp -r agent/.claude /path/to/your/project/
cp agent/CLAUDE.md /path/to/your/project/

# 2. Open your project in Claude Code
cd /path/to/your/project
claude

# 3. Say this:
> "Help me initialize the project"
```

BOSS will ask you 3 questions (what the project does, tech stack, current stage), then the team is ready.

## Team Structure

```
BOSS (CLAUDE.md)
│
├── Product & Strategy
│   ├── product-team           Requirements analysis, feature planning
│   └── compliance-risk-team   Privacy, payments, legal compliance
│
├── Technical Design
│   └── architecture-team      System design + security architecture
│
├── Development (by platform)
│   ├── backend-team           API, business logic, database
│   ├── admin-frontend-team    Admin dashboard UI
│   ├── user-frontend-team     User-facing web pages
│   └── client-team            Desktop/mobile native apps
│
├── Quality Assurance
│   ├── code-review-team       Code review (with persistent memory)
│   └── qa-team                Testing, release gates
│
├── Operations
│   └── devops-team            CI/CD, deployment, monitoring
│
└── Meta
    └── evolution-team         Weekly reviews, team diagnostics (read-only)
```

## How It Works

### Task Routing
BOSS reads your message and decides:
- **No agent needed** — questions, research, discussion → BOSS answers directly
- **Agent needed** — code changes, reviews, deployments → routes to the right team

### Development Flow (enforced)
```
You: "Add user authentication"
         ↓
1. Architecture-first    → architecture-team designs the system
2. Task breakdown        → BOSS splits into file-level tasks
3. Parallel development  → multiple agents work simultaneously
4. Integration check     → BOSS verifies cross-module compatibility
5. Code review           → code-review-team audits (mandatory)
6. QA verification       → qa-team validates (mandatory)
7. Memory update         → project context updated
8. Report to you         → summary with key decisions
```

### Quality Gates (automated via Hooks)
| Hook | Trigger | Action |
|---|---|---|
| protect-team-files.js | Write/Edit agent definitions | Asks user confirmation |
| validate-bash-safety.js | Dangerous bash commands | Blocks and asks confirmation |
| log-agent-activity.js | Any file operation | Logs to activity file |
| log-subagent-lifecycle.js | Agent start/stop | Logs lifecycle events |

## Directory Structure

```
your-project/
├── CLAUDE.md                          ← BOSS Agent (auto-loaded by Claude Code)
└── .claude/
    ├── settings.json                  ← Agent Teams + Hooks config
    ├── agents/                        ← 11 team definitions (auto-discovered)
    ├── hooks/                         ← 4 Node.js enforcement scripts
    ├── memory/
    │   ├── project-context.md         ← Fill this first!
    │   ├── user-habits.md             ← Learned over time
    │   ├── decisions-log.md           ← Key decisions
    │   └── archive/                   ← Old records
    └── team-standards/
        ├── operating-protocol.md      ← Task lifecycle rules
        ├── memory-policy.md           ← Memory read/write rules
        ├── iteration-playbook.md      ← Review & upgrade procedures
        └── changelog.md              ← Version history
```

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI (v2.1+)
- Node.js (required by Claude Code, used by hooks)
- Claude Max / API access

## Key Design Decisions

**Agents don't auto-modify their own rules.** The evolution-team can only *propose* changes. You confirm, BOSS executes.

**Hooks are cross-platform.** All enforcement scripts are Node.js — works on Windows, Mac, and Linux without bash or PowerShell dependency.

**Memory is file-based.** No external databases, no MCP servers. Just markdown files that agents read on startup. Simple, portable, inspectable.

**Not every project uses every team.** A Python CLI tool might only need backend-team + qa-team. The others stay dormant, zero cost.

## Iteration & Evolution

```
"weekly review"     → evolution-team analyzes recent work, proposes improvements
"diagnose qa-team"  → deep diagnostic on a specific team
"monthly upgrade"   → comprehensive system upgrade proposal
"team status"       → show all team versions
```
