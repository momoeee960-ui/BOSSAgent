# Changelog

> Version history for the BOSS Agent system.
> Updated by BOSS after any system change is executed (agent definitions, hooks, standards).

---

## Version Format

```
## v[MAJOR].[MINOR].[PATCH] — [YYYY-MM-DD]

### Added
- [new capability or file]

### Changed
- [modified behavior or definition]

### Fixed
- [bug or incorrect behavior corrected]

### Removed
- [removed capability or file]
```

---

## Versions

## v1.0.0 — Initial Release

### Added
- BOSS orchestrator (CLAUDE.md)
- 11 agent definitions:
  - product-team
  - compliance-risk-team
  - architecture-team
  - backend-team
  - admin-frontend-team
  - user-frontend-team
  - client-team
  - code-review-team
  - qa-team
  - devops-team
  - evolution-team
- 4 enforcement hooks:
  - protect-team-files.js
  - validate-bash-safety.js
  - log-agent-activity.js
  - log-subagent-lifecycle.js
- 3 memory files:
  - project-context.md
  - user-habits.md
  - decisions-log.md
- 4 team standards documents:
  - operating-protocol.md
  - memory-policy.md
  - iteration-playbook.md
  - changelog.md
- settings.json with hook configuration

---

_Future versions will be appended above by BOSS after system upgrades._
