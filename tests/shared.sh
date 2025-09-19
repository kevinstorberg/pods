#!/bin/bash

# PODs Test Shared Utilities
# Common variables and functions used across all test files

# Test directory setup
export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PASSED=0
export FAILED=0

# Colors for output
export GREEN='\033[0;32m'
export RED='\033[0;31m'
export BLUE='\033[0;34m'
export YELLOW='\033[0;33m'
export NC='\033[0m' # No Color

# Common test result tracking
increment_passed() {
    PASSED=$((PASSED + 1))
}

increment_failed() {
    FAILED=$((FAILED + 1))
}

# Print test summary
print_test_summary() {
    local test_name="$1"
    echo "=========================="
    echo -e "${test_name} Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"

    if [ $FAILED -eq 0 ]; then
        echo "🎉 All ${test_name} passed!"
        return 0
    else
        echo "💥 Some ${test_name} failed."
        return 1
    fi
}