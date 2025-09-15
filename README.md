# Branch Workspace

This directory is for generated content, working files, and temporary outputs from the POD system.

## Structure

```
branch/
├── sessions/           # Individual work sessions
│   ├── {timestamp}/    # Session-specific workspace
│   │   ├── context/    # Project context for this session
│   │   ├── generated/  # LLM-generated files
│   │   └── workspace/  # Working files and drafts
│   └── current/        # Symlink to active session
├── projects/           # Longer-term project workspaces
│   └── {project-name}/ # Per-project generated content
└── cache/              # Cached responses and templates
```

## Usage

- All content in this directory is git-ignored
- LLMs can freely create, modify, and organize files here
- Use namespacing to prevent conflicts between sessions
- Clean up old sessions periodically to manage disk space

## Naming Conventions

- Session timestamps: `YYYY-MM-DD_HH-MM-SS`
- Project names: `kebab-case-project-name`
- Generated files: `{role}-{deliverable}-{version}.md`
- Working files: `draft-{filename}.md`