#!/bin/bash

# PODs Shell Function
# This function should be added to user's .bashrc/.zshrc for proper directory changing

pods() {
    local pods_script_dir

    # Find PODs installation
    if [[ -f "./pods/bin/pods" ]]; then
        pods_script_dir="./pods"
    elif [[ -f "../pods/bin/pods" ]]; then
        pods_script_dir="../pods"
    elif [[ -f "bin/pods" ]]; then
        pods_script_dir="."
    else
        echo "Error: PODs installation not found"
        return 1
    fi

    # Handle git tree command specially (needs directory change)
    if [[ "$1" == "g" && "$2" == "tree" ]]; then
        if [[ -z "$3" ]]; then
            echo "Usage: pods g tree <name>"
            return 1
        fi

        local tree_name="$3"
        echo "🌳 Creating git worktree: $tree_name"

        # Create worktree from current directory
        if git worktree add "../${tree_name}" HEAD 2>/dev/null; then
            echo "✅ Worktree created at ../${tree_name}"
            echo "📁 Switching to worktree..."

            # Change to worktree directory
            cd "../${tree_name}" || return 1

            # Create and switch to branch
            git checkout -b "$tree_name" 2>/dev/null || echo "Branch $tree_name already exists"

            echo "🚀 Ready to work on feature: $tree_name"
            echo "📁 Current directory: $(pwd)"
            echo "💡 PODs is available at: pods/bin/pods"
        else
            echo "❌ Failed to create worktree. Check that you're in a git repository."
            return 1
        fi
    else
        # For all other commands, call the regular pods script
        "${pods_script_dir}/bin/pods" "$@"
    fi
}

# Function to set up PODs shell integration
setup_pods_function() {
    local shell_file

    # Detect shell and config file
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_file="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        shell_file="$HOME/.bashrc"
    else
        echo "Warning: Unsupported shell. Please manually add the pods function to your shell config."
        return 1
    fi

    # Check if function already exists
    if grep -q "^pods()" "$shell_file" 2>/dev/null; then
        echo "✅ PODs function already exists in $shell_file"
        return 0
    fi

    echo "📝 Adding PODs function to $shell_file"

    # Add function to shell config
    cat >> "$shell_file" << 'EOF'

# PODs Shell Function
# Enables proper directory changing for git worktree commands
pods() {
    local pods_script_dir

    # Find PODs installation
    if [[ -f "./pods/bin/pods" ]]; then
        pods_script_dir="./pods"
    elif [[ -f "../pods/bin/pods" ]]; then
        pods_script_dir="../pods"
    elif [[ -f "bin/pods" ]]; then
        pods_script_dir="."
    else
        echo "Error: PODs installation not found"
        return 1
    fi

    # Handle git tree command specially
    if [[ "$1" == "g" && "$2" == "tree" ]]; then
        if [[ -z "$3" ]]; then
            echo "Usage: pods g tree <name>"
            return 1
        fi

        local tree_name="$3"
        echo "🌳 Creating git worktree: $tree_name"

        if git worktree add "../${tree_name}" HEAD 2>/dev/null; then
            echo "✅ Worktree created at ../${tree_name}"
            (cd "../${tree_name}" && git checkout -b "$tree_name" 2>/dev/null) || echo "Branch $tree_name already exists"
            cd "../${tree_name}"
            echo "🚀 Ready to work on feature: $tree_name ($(pwd))"
            echo "💡 PODs is available at: pods/bin/pods"
        else
            echo "❌ Failed to create worktree"
            return 1
        fi
    else
        "${pods_script_dir}/bin/pods" "$@"
    fi
}
EOF

    echo "✅ PODs function added to $shell_file"
    echo "🔄 Please restart your terminal or run: source $shell_file"
}

# If this script is run directly, set up the function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    setup_pods_function
fi