# Quick Commands System

**IMPORTANT:** This document defines quick commands that you MUST recognize and respond to when the user types them.

## Command Recognition Rules

1. **Always monitor** user input for these commands
2. **Immediately respond** when a command is detected
3. **Commands override** normal conversation flow
4. **Both forms work** - short form (`-g`) and long form (`-generate`) are equivalent

## Command Definitions

### `-ducky` / `-d`
**When user types this command:**
- Review the instructions in `ducky.md`
- Take your time to think deeply about them

### `-think` / `-t`
**When user types this command:**
- Take your time to thoroughly investigate the problem space, the application, and all relevant resources
- Think deeply about all of this and describe it in detail to the user along with possible solutions

### `-generate` / `-g`
**When user types this command:**
- Carefully and systematically generate all of your defined deliverables
- Follow the templates and formats specified in your role documentation
- Take your time and be thorough in your execution
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
- Provide a summary of completion status along with a list of possible issues

### `-iterate` / `-i`
**When user types this command:**
- Iterate over the list one item at a time, describing each item in detail
- After describing an item propose possible actions and align with the user on next steps
- Carefully implement agreed upon next steps and then move onto the next item in the list
- Exit iteration when every item in the list has been addressed

## Response Patterns

When a command is detected, your response should:
1. **Acknowledge** the command (e.g., "Executing -generate command...")
2. **Execute** the requested action immediately
3. **Report** progress and completion
4. **Do not** ask for confirmation or clarification

## Priority

These commands take precedence over normal conversation. Even mid-task, if the user types a command, stop and execute it immediately.