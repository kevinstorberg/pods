#!/bin/bash

# Role Launcher Library
# Handles role launching with argument support

launch_role() {
    local input_role="$1"
    shift # Remove role name, remaining args are flags

    local new_tab=false
    local assistant_override=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --t)
                new_tab=true
                shift
                ;;
            --a)
                if [[ -n "$2" ]]; then
                    assistant_override="$2"
                    shift 2
                else
                    echo "Error: --a flag requires assistant name (claude, gemini)"
                    exit 1
                fi
                ;;
            *)
                echo "Error: Unknown argument $1"
                echo "Usage: pods <role> [--t] [--a assistant]"
                exit 1
                ;;
        esac
    done

    # Handle new tab request
    if [[ "$new_tab" == true ]]; then
        open_new_tab_and_launch "$input_role" "$assistant_override"
        return
    fi

    # Convert abbreviations to full role names
    local role_name
    case "$input_role" in
        "ad") role_name="admin" ;;
        "pm") role_name="product_manager" ;;
        "ar") role_name="architect" ;;
        "em") role_name="engineering_manager" ;;
        "fe") role_name="fullstack_engineer" ;;
        "qe") role_name="qa_engineer" ;;
        "de") role_name="designer" ;;
        *) role_name="$input_role" ;;
    esac

    # Validate role exists
    local role_file="${SCRIPT_DIR}/roles/${role_name}.md"
    if [ ! -f "$role_file" ]; then
        echo "Error: Role '$role_name' not found."
        echo "Expected file: $role_file"
        echo ""
        echo "Available roles:"
        for role_file in "${SCRIPT_DIR}/roles"/*.md; do
            if [ -f "$role_file" ]; then
                local role=$(basename "$role_file" .md)
                case "$role" in
                    "admin") echo "  admin (ad)" ;;
                    "product_manager") echo "  product_manager (pm)" ;;
                    "architect") echo "  architect (ar)" ;;
                    "engineering_manager") echo "  engineering_manager (em)" ;;
                    "fullstack_engineer") echo "  fullstack_engineer (fe)" ;;
                    "qa_engineer") echo "  qa_engineer (qe)" ;;
                    "designer") echo "  designer (de)" ;;
                    *) echo "  $role" ;;
                esac
            fi
        done
        exit 1
    fi

    # Load AI assistant configuration (or use override)
    local ai_editor
    if [[ -n "$assistant_override" ]]; then
        ai_editor="$assistant_override"
        echo "Using assistant override: $ai_editor"
    else
        source "${SCRIPT_DIR}/lib/config-parser.sh"
        ai_editor=$(get_ai_assistant "$role_name")
    fi

    # Change to PODs directory
    cd "$SCRIPT_DIR"

    echo "🚀 Launching $ai_editor with PODs framework..."
    echo "📁 Working directory: $SCRIPT_DIR"
    echo "👤 Role: $role_name"
    if [[ "$new_tab" == true ]]; then
        echo "🆕 New tab requested"
    fi
    if [[ -n "$assistant_override" ]]; then
        echo "🤖 Assistant override: $assistant_override"
    fi
    echo ""

    # Write test result file if TEST_RESULT_FILE is set (for tests)
    if [[ -n "$TEST_RESULT_FILE" ]]; then
        echo "assistant:${ai_editor}" > "$TEST_RESULT_FILE"
        echo "role:${role_name}" >> "$TEST_RESULT_FILE"
        echo "Working directory: $(pwd)" >> "$TEST_RESULT_FILE"
    fi

    # Create role command with test reporting
    local test_file=""
    if [[ -n "$PODS_TEST_MODE" ]]; then
        test_file="/tmp/pods_test_${role_name}_$(date +%s).result"
    fi

    local role_command="Please read ./roles/${role_name}.md and assume that role. Then output your role metadata in this exact format:

ROLE: ${role_name}
DELIVERABLES: [list the filenames you will create in /branch/ folder]
INPUTS: [list the key files/contexts you will read]
PROJECT_DIRECTORY: [the directory you will analyze - from project config]
MCP_SERVERS: [list any MCP servers you have available, or 'none']
AI_ASSISTANT: ${ai_editor}
STATUS: ready

Do not include any other text or explanation - just this structured metadata."

    # Add test reporting to command if in test mode
    if [[ -n "$test_file" ]]; then
        role_command="$role_command

After outputting the metadata, also run this command to report test results:
echo 'TEST_SUCCESS:${ai_editor}:${role_name}' > '$test_file'"
        export PODS_TEST_FILE="$test_file"
    fi

    # Launch AI assistant
    launch_ai_assistant "$ai_editor" "$role_command"
}

launch_ai_assistant() {
    local ai_editor="$1"
    local role_command="$2"

    if command -v "$ai_editor" &> /dev/null; then
        case "$ai_editor" in
            "claude")
                "$ai_editor" "$role_command"
                ;;
            "gemini")
                "$ai_editor" -i "$role_command"
                ;;
            *)
                echo "⚠️  Your AI assistant doesn't support automatic role loading."
                "$ai_editor"
                echo ""
                echo "Please manually enter this command:"
                echo "\"$role_command\""
                ;;
        esac
    else
        echo "Error: $ai_editor command not found."
        echo "Please install $ai_editor or ensure it's in your PATH."
        echo "You can also edit config/assistants.json to use a different AI assistant."
        exit 1
    fi
}