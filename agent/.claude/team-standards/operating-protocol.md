# Operating Protocol

> Rules governing the full lifecycle of every task in the BOSS Agent system.
> All agents must follow this protocol. BOSS enforces it.

---

## Task Lifecycle

Every task goes through these stages in order:

### Stage 1: Intake
- BOSS receives user request
- BOSS reads all memory files
- BOSS determines if an agent is needed or if BOSS should answer directly
- If agent needed: BOSS identifies which team(s) and in what order

### Stage 2: Architecture (for non-trivial features)
- architecture-team designs system before any code is written
- architecture-team produces: system diagram, API contracts, data models, ADR
- BOSS reviews architecture output and confirms before proceeding
- **Skip condition:** Changes to a single file with no interface impact may skip this stage

### Stage 3: Product Specification (when requirements are unclear)
- product-team produces user stories with acceptance criteria
- Scope is explicitly bounded
- Compliance flags raised to compliance-risk-team
- **Skip condition:** Requirements are already clear and scoped

### Stage 4: Development
- BOSS breaks work into file-level tasks
- Tasks are assigned to appropriate dev team(s)
- Independent tasks run in parallel
- Each agent reads memory files before starting
- Each agent reports changes made, tests written, risks identified

### Stage 5: Integration Check
- BOSS reviews all agent outputs for cross-module compatibility
- Interface mismatches, naming conflicts, and missing connections are flagged
- Dev teams fix integration issues before proceeding

### Stage 6: Code Review (mandatory)
- code-review-team reviews all changes
- Applies full review checklist
- Issues categorized as BLOCK, REQUIRED, SUGGESTED, or NOTE
- **BLOCK or REQUIRED issues must be resolved before Stage 7**
- No exceptions. If user insists on skipping, warn once, log override in decisions-log.md

### Stage 7: QA Verification (mandatory)
- qa-team validates all acceptance criteria
- Runs regression check
- Produces release gate checklist
- **QA BLOCKED means no merge/deploy**
- No exceptions.

### Stage 8: Memory Update
- BOSS updates `.claude/memory/project-context.md` with architecture changes
- BOSS appends significant decisions to `.claude/memory/decisions-log.md`
- BOSS notes any new user preferences in `.claude/memory/user-habits.md`

### Stage 9: Report
- BOSS summarizes: what changed, what was decided, what's next
- Surfaces any known issues or deferred items
- Confirms quality gates were passed (or logs any that were overridden)

---

## Parallel Execution Rules

Tasks may run in parallel when:
- They touch different files with no shared interfaces
- They have no data dependency on each other's output

Tasks must run sequentially when:
- Task B depends on the output or interface defined by Task A
- Both tasks modify the same file or shared module

---

## Agent Communication Standards

When one agent's output is input to another:
1. The sending agent clearly marks what it produced (not what it intended to produce)
2. BOSS validates the handoff before passing to the next agent
3. If the output is incomplete or unclear, BOSS asks the sending agent to clarify before proceeding

---

## Override Policy

The user may override any stage. When this happens:
1. BOSS warns the user of the risk exactly once
2. BOSS complies with the override
3. BOSS logs the override in decisions-log.md with timestamp and user's stated reason

---

## Escalation Rules

| Situation | Action |
|---|---|
| Requirements conflict | Stop, ask user to resolve before proceeding |
| Architecture is unclear | Call architecture-team before any dev work |
| Compliance risk found | Stop, call compliance-risk-team, surface risk to user |
| Security vulnerability found | BLOCK immediately, report to user |
| Code review finds BLOCK issue | Stop, fix, re-review before proceeding |
| QA finds BLOCKER | Stop, fix, re-test before proceeding |
