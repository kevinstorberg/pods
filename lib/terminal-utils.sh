#!/bin/bash

# Terminal Utilities Library
# Handles new tab creation across different terminal applications

open_new_tab_and_launch() {
    local role="$1"
    local assistant_override="$2"

    # Build command to run in new tab
    local command_to_run="cd '$SCRIPT_DIR'"

    # Pass TEST_RESULT_FILE environment variable if set
    if [[ -n "$TEST_RESULT_FILE" ]]; then
        command_to_run="${command_to_run} && export TEST_RESULT_FILE='$TEST_RESULT_FILE'"
    fi

    # Add the pods command with optional assistant override
    command_to_run="${command_to_run} && bin/pods $role"
    if [[ -n "$assistant_override" ]]; then
        command_to_run="${command_to_run} --a $assistant_override"
    fi

    echo "🆕 Opening new tab for role: $role"

    # Detect terminal and open new tab
    if [[ "$TERM_PROGRAM" == "iTerm.app" ]]; then
        # iTerm2
        osascript -e "
            tell application \"iTerm2\"
                tell current window
                    create tab with default profile
                    tell current session to write text \"$command_to_run\"
                end tell
                activate
            end tell
        "
        echo "✅ Opened new iTerm2 tab and switched focus"

    elif [[ "$TERM_PROGRAM" == "Apple_Terminal" ]]; then
        # Terminal.app
        osascript -e "
            tell application \"Terminal\"
                do script \"$command_to_run\"
                set frontmost to true
                set selected of front window to last tab of front window
            end tell
        "
        echo "✅ Opened new Terminal.app tab and switched focus"

    elif command -v gnome-terminal &> /dev/null; then
        # GNOME Terminal (Linux)
        gnome-terminal --tab --working-directory="$SCRIPT_DIR" -- bash -c "$command_to_run; exec bash"
        # GNOME Terminal automatically focuses new tabs
        echo "✅ Opened new GNOME Terminal tab and switched focus"

    elif command -v konsole &> /dev/null; then
        # Konsole (KDE)
        konsole --new-tab --workdir "$SCRIPT_DIR" -e bash -c "$command_to_run; exec bash" &
        # Konsole automatically focuses new tabs
        echo "✅ Opened new Konsole tab and switched focus"

    else
        echo "❌ Unable to detect supported terminal application"
        echo "Supported terminals: iTerm2, Terminal.app, GNOME Terminal, Konsole"
        exit 1
    fi
}