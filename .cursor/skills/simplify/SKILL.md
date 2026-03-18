---
name: simplify
description: Simplify/refactor code with fewer lines while preserving behavior. Use when the user says “simplify”, “less code”, or “refactor for brevity”.
---

# Simplify

## Quick start

Goal: produce the same behavior with less code.

Constraints:

- Preserve behavior exactly
- Follow existing style/lint rules
- No new dependencies

Response format:

- Brief explanation, then apply edits

## Workflow

1. Read the smallest relevant scope (file or function).
2. Identify safe reductions:
   - Early returns, remove dead/duplicate code, inline single-use vars
   - Use existing helpers/components instead of new ones
   - Prefer concise patterns already used in the file
3. Avoid semantic changes:
   - No API changes, no new side effects, no logic reorder that changes output
4. Edit code with minimal lines added.
5. Re-scan for unintended behavior changes and style violations.

## Examples

**Input:** “simplify this component”
**Output:** Brief rationale + patch that reduces lines with same behavior.
