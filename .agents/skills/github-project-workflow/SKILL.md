---
name: github-project-workflow
description: Creates, manages and tracks implementation tasks using GitHub Issues and GitHub Projects v2 through GitHub CLI.
---

# GitHub Projects Workflow

## Purpose

Use GitHub Issues as the authoritative task records and GitHub Projects v2 as the planning and status board.

Read `.github/project-workflow.md` before using GitHub.

## 1. Preflight checks

Before interacting with GitHub:

1. Confirm the current repository and branch.
2. Run `gh auth status`.
3. Verify that `gh` is authenticated for the expected GitHub account.
4. Verify repository access.
5. Read `.github/project-workflow.md`.
6. Verify that the configured GitHub Project exists and is accessible.

If authentication or permissions are insufficient, stop and report the issue.

Required project permission can be refreshed interactively:

```bash
gh auth refresh -s project
```

Do not request or store personal access tokens in repository files.

## 2. Creating issues

Only create issues after explicit user approval of the proposed task list.

Before creating an issue:

- Search existing open and closed issues for duplicates.
- Check whether the task already exists in the project.
- Confirm the task has a clear scope.
- Include acceptance criteria.
- Identify dependencies.
- Select priority and labels.

Use this issue format:

```markdown
## Context

Why this task is needed.

## Description

What needs to be implemented.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Technical notes

Relevant architecture, modules and constraints.

## Testing

- [ ] Unit tests
- [ ] Integration tests (if applicable)
- [ ] E2E tests (if applicable)
- [ ] Lint and typecheck

## Dependencies

- Blocked by #123

## Planning reference

docs/planning/implementation-plan.md
```

Add a stable task identifier in the issue body:

```html
<!-- agent-task-id: PLAN-001 -->
```

Use this identifier to help detect duplicates and link the issue to the planning document.

Create the issue:

```bash
gh issue create \
  --title "Implement feature X" \
  --body-file issue-body.md \
  --label "type:feature,area:frontend"
```

Capture the returned issue URL and number.

## 3. Add issues to GitHub Projects

Add the newly created issue:

```bash
gh project item-add PROJECT_NUMBER \
  --owner PROJECT_OWNER \
  --url ISSUE_URL
```

Set its status and priority using the actual field values configured in the project:

```bash
gh project item-edit PROJECT_NUMBER \
  --owner PROJECT_OWNER \
  --url ISSUE_URL \
  --field "Status" \
  --value "Ready"
```

```bash
gh project item-edit PROJECT_NUMBER \
  --owner PROJECT_OWNER \
  --url ISSUE_URL \
  --field "Priority" \
  --value "P1 - High"
```

Inspect available fields and options before attempting updates:

```bash
gh project field-list PROJECT_NUMBER \
  --owner PROJECT_OWNER \
  --format json
```

Do not assume that field names or options exist.

## 4. Planning document synchronization

After issue creation, update:

`docs/planning/github-issues.md`

Include:

- Stable task ID
- Issue number
- Issue URL
- Title
- Priority
- Labels
- Dependencies
- Current status

Do not copy the entire issue description into the planning document. Link to the authoritative issue instead.

If issue creation partially fails, record which issues were created and which were not. Never blindly retry all creation operations.

## 5. Developer workflow

When given an issue number:

1. Retrieve the issue using `gh issue view`.
2. Read acceptance criteria and technical notes.
3. Check blockers and dependencies.
4. Inspect the working tree and preserve existing changes.
5. Move the issue to In Progress, if authorized.
6. Create a task branch.

Branch convention:

```text
feature/123-short-description
bugfix/124-short-description
chore/125-short-description
```

7. Implement the task.
8. Run relevant tests, lint and typecheck.
9. Commit only task-related changes.
10. Create a pull request referencing the issue:

```text
Closes #123
```

11. Add a progress comment when useful.
12. Move the project item to In Review when a pull request is ready.

Do not close the issue merely because code has been committed or a pull request has been created.

## 6. Reviewer workflow

1. Read the linked issue.
2. Verify all acceptance criteria against the implementation.
3. Inspect the complete pull request diff.
4. Check tests and CI results.
5. Report findings with severity and file references.
6. If changes are required, leave the issue in In Review or return it to In Progress.
7. If approved, report that it is ready to merge.

Only update status or close an issue when authorized and when the corresponding workflow condition has actually been satisfied.

## 7. Safety rules

- Never create issues without user approval.
- Never create duplicate issues.
- Never modify project configuration without approval.
- Never close an issue simply because implementation is finished.
- Never delete or archive issues automatically.
- Never change unrelated issue fields.
- Never move an issue to Done without verified completion.
- Never expose GitHub credentials.
- Never use production data for tests.

## 8. Reporting

Always report:

- Issues created or updated.
- Project items added.
- Status and priority changes.
- Failed operations.
- Items requiring manual action.

Use exact issue URLs and numbers.
