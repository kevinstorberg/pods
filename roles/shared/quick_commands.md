# Quick Commands System

**IMPORTANT:** This document defines quick commands that you MUST recognize and respond to when the user types them.

## Command Recognition Rules

1. **Always monitor** user input for these commands
2. **Immediately respond** when a command is detected
3. **Commands override** normal conversation flow
4. **Both forms work** - short form (`-g`) and long form (`-generate`) are equivalent

## Command Definitions

### `-generate` / `-g`
**When user types this command:**
- Immediately begin generating all deliverables defined for your current role
- Follow the templates and formats specified in your role documentation
- Do not ask for confirmation - proceed directly with generation

### `-continue` / `-c`
**When user types this command:**
- Resume whatever task you were working on
- If you asked a question, treat this as "yes, proceed"
- If you were waiting for approval, consider it granted
- If you paused for any reason, continue from that point
- Do not re-explain or ask again - just continue

### `-back` / `-b`
**When user types this command:**
- Immediately revert the last change or set of changes made
- Use git commands if changes were committed
- Use file restoration if changes were only saved
- Explain briefly what was reverted
- Return to the state before the last action

### `-review` / `-r`
**When user types this command:**
- Conduct a thorough review of all work done in this session
- Check all created/modified files against requirements
- Verify compliance with role responsibilities
- Think deeply as you look for errors and omissions
- Provide a summary of completion status

### `-iterate` / `-i`
**When user types this command:**
- If a list was provided, work through it one item at a time
- After completing each item, pause and wait for user input
- User can type `-c` to continue to next item
- User can type `-b` to redo the current item
- Show clear progress indicators (e.g., "[1/10] Working on...")

## Response Patterns

When a command is detected, your response should:
1. **Acknowledge** the command (e.g., "Executing -generate command...")
2. **Execute** the requested action immediately
3. **Report** progress and completion
4. **Do not** ask for confirmation or clarification

## Priority

These commands take precedence over normal conversation. Even mid-task, if the user types a command, stop and execute it immediately.