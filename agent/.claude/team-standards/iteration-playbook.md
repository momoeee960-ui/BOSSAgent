# Iteration Playbook

> Procedures for reviewing, diagnosing, and upgrading the BOSS Agent system.
> Triggered by user commands. Executed by evolution-team under BOSS supervision.

---

## Weekly Review

**Trigger:** User says "weekly review"

**Procedure:**
1. BOSS calls evolution-team with:
   - All three memory files
   - `activity.log` and `lifecycle.log` content (last 7 days)
   - The week's date range
2. evolution-team produces a Weekly Review report (see evolution-team.md for format)
3. BOSS presents the report to the user
4. User reviews proposals and indicates: accept / reject / defer for each
5. BOSS executes accepted proposals:
   - Edits to agent definitions: BOSS makes the changes, logs in decisions-log.md
   - Edits to standards files: BOSS makes the changes, logs in decisions-log.md
   - Edits to hooks: BOSS makes the changes (user sees hook changes via protect-team-files hook)
6. evolution-team updates `changelog.md` with the changes made

**Expected output time:** < 5 minutes

---

## Team Diagnostic

**Trigger:** User says "diagnose [team-name]"

**Procedure:**
1. BOSS calls evolution-team with:
   - The target team's agent definition file
   - Recent activity and lifecycle logs involving that team
   - Relevant decisions-log.md entries
2. evolution-team produces a Diagnostic Report (see evolution-team.md for format)
3. BOSS presents the report to the user
4. If the user approves proposed changes: BOSS executes them
5. Changes logged in decisions-log.md and changelog.md

**Expected output time:** < 3 minutes

---

## Monthly Upgrade

**Trigger:** User says "monthly upgrade"

**Procedure:**
1. BOSS calls evolution-team with all system files for a comprehensive review
2. evolution-team produces:
   - Assessment of all 11 team definitions
   - Assessment of all 4 hooks
   - Assessment of all standards files
   - Assessment of memory file health
   - Prioritized list of proposed changes
3. BOSS presents the full report
4. User reviews and approves/rejects each proposal
5. BOSS batches and executes all approved changes
6. Changelog updated with version bump

**Expected output time:** < 15 minutes

---

## Emergency Diagnostic

**Trigger:** A quality gate is repeatedly failing, or a team is producing low-quality output

**Procedure:**
1. User describes the problem
2. BOSS immediately calls evolution-team with the problem description + relevant context
3. evolution-team focuses on root cause, not a general review
4. BOSS implements the fix with user approval
5. BOSS monitors the next 3 tasks involving the affected team to confirm improvement

---

## Proposal Tracking

All proposals from evolution-team are tracked in this format in decisions-log.md:

```
### [date] — Evolution Proposal: [topic]
**Status:** PENDING / ACCEPTED / REJECTED / DEFERRED
**Proposal:** [what was proposed]
**Rationale from evolution-team:** [why]
**User decision:** [accepted/rejected/deferred — reason]
**Executed:** [date if accepted]
```

---

## Constraints on Evolution

- evolution-team cannot self-modify (cannot propose changes to its own definition without user review)
- Changes to the protect-team-files hook require explicit user confirmation (double gate)
- Changes to the validate-bash-safety patterns require explicit user confirmation
- BOSS logs every system change in decisions-log.md with the evolution-team proposal reference
