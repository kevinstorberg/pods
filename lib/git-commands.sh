#!/bin/bash

# Git Commands Library
# Handles git workflow integration

handle_git_commands() {
    if [ $# -eq 0 ]; then
        echo "Usage: pods g <command> [args...]"
        echo ""
        echo "Git commands:"
        echo "  tree <name>    Create git worktree and switch to it"
        echo ""
        echo "Examples:"
        echo "  pods g tree auth        # Create worktree for 'auth' feature"
        echo "  pods g tree user-login  # Create worktree for 'user-login' feature"
        exit 1
    fi

    case "$1" in
        "tree")
            if [ -z "$2" ]; then
                echo "Error: tree command requires a name"
                echo "Usage: pods g tree <name>"
                echo "   or: source <(pods g tree <name>)  # To change directory"
                exit 1
            fi

            local tree_name="$2"

            echo "🌳 Creating git worktree: $tree_name"

            if git worktree add "../${tree_name}" HEAD 2>/dev/null; then
                echo "✅ Worktree created at ../${tree_name}"

                # Copy all .env files from original directory to worktree
                echo "📄 Copying .env files..."
                local env_count=0
                while IFS= read -r -d '' env_file; do
                    local relative_path="${env_file#../}"
                    local target_dir="../${tree_name}/$(dirname "$relative_path")"
                    local target_file="../${tree_name}/$relative_path"

                    # Create target directory if it doesn't exist
                    mkdir -p "$target_dir"

                    # Copy the .env file
                    cp "$env_file" "$target_file"
                    echo "  ✅ Copied: $relative_path"
                    ((env_count++))
                done < <(find .. -path "../${tree_name}" -prune -o -name ".env*" -type f -print0 2>/dev/null)

                if [ $env_count -eq 0 ]; then
                    echo "  📝 No .env files found to copy"
                else
                    echo "  📊 Copied $env_count .env file(s)"
                fi

                echo ""
                echo "📝 To switch to the worktree, run:"
                echo "   cd ../$tree_name"
                echo "   git checkout -b $tree_name"
            else
                echo "❌ Failed to create worktree. Check that you're in a git repository."
                exit 1
            fi
            ;;
        *)
            echo "Error: Unknown git command '$1'"
            echo "Available commands: tree"
            exit 1
            ;;
    esac
}