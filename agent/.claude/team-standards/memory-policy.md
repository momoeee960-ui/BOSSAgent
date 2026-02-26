# Memory Policy

> Rules for reading and writing the three memory files.
> All agents must follow this policy to maintain accurate cross-session context.

---

## Memory Files

| File | Purpose | Who Writes | Who Reads |
|---|---|---|---|
| `project-context.md` | Architecture, stack, active modules, known issues | BOSS (after completing work) | All agents, at startup |
| `user-habits.md` | User preferences, workflow patterns, things to avoid | BOSS (as patterns emerge) | All agents, at startup |
| `decisions-log.md` | Significant technical and product decisions with rationale | BOSS (after each session with decisions) | All agents, code-review-team, evolution-team |
| `memory/activity.log` | File operation audit log | log-agent-activity hook (auto) | evolution-team |
| `memory/lifecycle.log` | Agent start/stop events | log-subagent-lifecycle hook (auto) | evolution-team |

---

## Reading Policy

**All agents must read `project-context.md` at the start of every task.**

- Read `decisions-log.md` when: making architectural choices, reviewing code, or proposing changes
- Read `user-habits.md` when: deciding how to format output or structure work

Agents must not assume they know the current state of the project from training data. Always read memory first.

---

## Writing Policy

**Only BOSS writes to memory files.** Individual agents do not write to memory directly.

After completing work, BOSS:
1. Updates `project-context.md` if:
   - A new service, module, or component was added
   - The tech stack changed
   - A known issue was resolved or a new one discovered
   - The project stage changed

2. Appends to `decisions-log.md` if:
   - A significant technical decision was made (architecture, database, auth approach, etc.)
   - A product decision was made (feature scoped in/out, approach chosen)
   - A quality gate was overridden (log the override with reason)

3. Updates `user-habits.md` if:
   - The user expressed a clear preference
   - A pattern was observed (user always wants tests first, prefers short summaries, etc.)

---

## Append-Only Policy

**Never delete or overwrite existing entries in memory files.**

- Always append new entries to the end of the file
- Archive old entries (do not delete them) when files exceed 200 lines
- The archive is in `.claude/memory/archive/`

---

## Archive Policy

When a memory file exceeds 200 lines:
1. Create a new file: `.claude/memory/archive/[source-file-name]-[YYYY-MM].md`
2. Move the oldest entries (enough to bring the active file under 150 lines) to the archive file
3. Update `.claude/memory/archive/README.md` with the archive entry
4. Confirm the active file still makes sense without the archived entries (add a note at the top if context was lost)

---

## Accuracy Standards

- Only write what actually happened, not what was intended
- If a decision was reversed, log the reversal as a new entry — do not edit the original
- If a fact in `project-context.md` is no longer true, add an updated entry — do not delete the old one (add a `[SUPERSEDED]` tag to the old entry)
