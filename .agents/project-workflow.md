# GitHub Project Workflow Configuration

## Repository
repository: n-timurka/gym-assistant

## GitHub Project
owner: n-timurka
number: 4
url: https://github.com/orgs/n-timurka/projects/4

## Project fields

Status field: Status

Status values:
- Backlog
- Ready
- In Progress
- In Review
- Done

Priority field: Priority

Priority values:
- P0 - Critical
- P1 - High
- P2 - Normal
- P3 - Low

## Issue labels

Types:
- type:feature
- type:bug
- type:task
- type:technical-debt
- type:documentation

Areas:
- area:frontend
- area:firebase
- area:pwa
- area:mobile
- area:testing
- area:infrastructure
- area:security

## Rules

- GitHub Issues are the source of truth for tasks.
- GitHub Projects is the source of truth for task status.
- /docs/planning contains audit reports and planning summaries.
- Every implementation task must have acceptance criteria.
- Every task must be assigned a priority and relevant labels.
- Do not create duplicate issues.
- Do not close issues automatically after implementation.