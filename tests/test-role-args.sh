#!/bin/bash

# PODs Role Arguments Tests
# Tests assistant override and new tab opening functionality separately.

set -e # Exit immediately if a command exits with a non-zero status.

# Source shared test utilities
source "$(dirname "${BASH_SOURCE[0]}")/shared.sh"

# --- Test Runner ---
echo "🧪 PODs Role Arguments Tests"
echo "==========================="
echo ""

# Test 1: Assistant Override
echo -e "${BLUE}Test 1: Assistant Override${NC}"
echo "Running: bin/pods pm --a claude"

output=$(cd "$SCRIPT_DIR" && timeout 10s bin/pods pm --a claude 2>&1) || true

if [[ "$output" == *"Using assistant override: claude"* ]]; then
    echo -e "  ${GREEN}✅ Assistant override detected in output${NC}"
    increment_passed
else
    echo -e "  ${RED}❌ Assistant override not found in output${NC}"
    echo "  Output: $output"
    increment_failed
fi

# Note: Not killing any processes here as it could affect other running instances

echo ""

# Test 2: New Tab Opening
echo -e "${BLUE}Test 2: New Tab Opening${NC}"
echo "Running: bin/pods ar --t"

# Get list of window IDs before opening new one
if [[ "$TERM_PROGRAM" == "Apple_Terminal" ]]; then
    WINDOWS_BEFORE=$(osascript -e "tell application \"Terminal\" to count windows" 2>/dev/null || echo "0")
    # Get IDs of existing windows as a list
    WINDOW_IDS_BEFORE=$(osascript -e "tell application \"Terminal\" to id of every window" 2>/dev/null || echo "")
elif [[ "$TERM_PROGRAM" == "iTerm.app" ]]; then
    TABS_BEFORE=$(osascript -e "tell application \"iTerm2\" to tell current window to count tabs" 2>/dev/null || echo "0")
fi

output=$(cd "$SCRIPT_DIR" && bin/pods ar --t 2>&1) || true

if [[ "$output" == *"🆕 Opening new tab"* ]]; then
    echo -e "  ${GREEN}✅ New tab message detected in output${NC}"
    increment_passed
else
    echo -e "  ${RED}❌ New tab message not found in output${NC}"
    echo "  Output: $output"
    increment_failed
fi

# Give a moment for the window/tab to actually open
sleep 3

# Count windows/tabs after and cleanup
if [[ "$TERM_PROGRAM" == "Apple_Terminal" ]]; then
    WINDOWS_AFTER=$(osascript -e "tell application \"Terminal\" to count windows" 2>/dev/null || echo "0")
    if [[ $WINDOWS_AFTER -gt $WINDOWS_BEFORE ]]; then
        echo "  ✅ New window opened (before: $WINDOWS_BEFORE, after: $WINDOWS_AFTER)"
        echo "  Attempting to close test window..."

        # Get IDs of windows after opening
        WINDOW_IDS_AFTER=$(osascript -e "tell application \"Terminal\" to id of every window" 2>/dev/null || echo "")

        # Convert comma-separated lists to space-separated for easier comparison
        IDS_BEFORE_CLEAN=$(echo "$WINDOW_IDS_BEFORE" | tr ',' ' ')
        IDS_AFTER_CLEAN=$(echo "$WINDOW_IDS_AFTER" | tr ',' ' ')

        # Find the new window ID by comparing lists
        NEW_WINDOW_ID=""
        for id in $IDS_AFTER_CLEAN; do
            if [[ ! " $IDS_BEFORE_CLEAN " =~ " $id " ]]; then
                NEW_WINDOW_ID=$id
                break
            fi
        done

        if [[ -n "$NEW_WINDOW_ID" ]]; then
            echo "    Found new window ID: $NEW_WINDOW_ID"
            # Close the specific window by ID
            osascript <<EOF 2>/dev/null
tell application "Terminal"
    set allWindows to every window
    repeat with w in allWindows
        if id of w is $NEW_WINDOW_ID then
            close w saving no
            exit repeat
        end if
    end repeat
end tell
EOF
        else
            echo "    ⚠️  Could not identify new window ID"
        fi

        # Verify it actually closed
        sleep 1
        WINDOWS_FINAL=$(osascript -e "tell application \"Terminal\" to count windows" 2>/dev/null || echo "0")
        if [[ $WINDOWS_FINAL -eq $WINDOWS_BEFORE ]]; then
            echo "    ✅ Successfully closed test window (count back to $WINDOWS_FINAL)"
        else
            echo "    ⚠️  Window may not have closed properly (expected: $WINDOWS_BEFORE, actual: $WINDOWS_FINAL)"
        fi
    else
        echo "  ⚠️  No new window detected"
    fi
elif [[ "$TERM_PROGRAM" == "iTerm.app" ]]; then
    TABS_AFTER=$(osascript -e "tell application \"iTerm2\" to tell current window to count tabs" 2>/dev/null || echo "0")
    if [[ $TABS_AFTER -gt $TABS_BEFORE ]]; then
        echo "  ✅ New tab opened (before: $TABS_BEFORE, after: $TABS_AFTER)"
        echo "  Attempting to close test tab..."
        osascript -e "
            tell application \"iTerm2\"
                tell current window
                    close last tab
                end tell
            end tell
        " 2>&1 && echo "    ✅ Closed test tab" || echo "    ⚠️  Could not close test tab"
    else
        echo "  ⚠️  No new tab detected"
    fi
fi

echo ""

# --- Summary ---
print_test_summary "role arguments tests"