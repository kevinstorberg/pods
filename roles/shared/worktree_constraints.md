## Worktree and Branch Isolation Constraints

### CRITICAL: Workspace Isolation Rules

You are operating within a specific git worktree and branch. ALL file operations MUST be contained within this workspace:

- **Current Branch**: $BRANCH_NAME
- **Worktree Path**: $WORKTREE_PATH
- **Project Directory**: $PROJECT_DIRECTORY

### Mandatory Constraints

1. **NEVER edit files outside the current worktree path**
   - All code changes must be within: $WORKTREE_PATH
   - All deliverables must be saved to: ./branch/ (relative to PODs directory)

2. **NEVER switch branches or worktrees**
   - Stay within the assigned branch: $BRANCH_NAME
   - Do not use git checkout, git switch, or git worktree commands

3. **VERIFY paths before any file operation**
   - Always use absolute paths starting with $WORKTREE_PATH
   - Or use paths relative to the PODs directory for deliverables

4. **Workspace Boundaries**
   - **ALLOWED:** Edit files in $WORKTREE_PATH
   - **ALLOWED:** Create deliverables in ./branch/
   - **FORBIDDEN:** Edit files in parent directories outside worktree
   - **FORBIDDEN:** Edit files in other worktrees or main repository

### Path Resolution

When working with project files:
- Use $PROJECT_DIRECTORY as the base path for all project file operations
- This automatically points to the correct worktree location
- Do NOT use hardcoded paths or navigate to parent directories

### Validation

Before any file operation, confirm:
1. The file path starts with $WORKTREE_PATH or $PROJECT_DIRECTORY
2. You are not navigating outside the worktree boundary
3. You are maintaining isolation between different feature branches

This ensures all POD work remains properly isolated within the intended branch and worktree.