#!/bin/bash

# PODs Test Dependencies Checker
# Ensures all required commands are available before running tests

set -e

# Source shared test utilities
source "$(dirname "${BASH_SOURCE[0]}")/shared.sh"

echo "🔍 Checking test dependencies..."
echo "================================"
echo ""

MISSING_DEPS=0

# Check for timeout command
if command -v timeout &> /dev/null; then
    echo -e "${GREEN}✅ timeout${NC} - command found"
else
    echo -e "${RED}❌ timeout${NC} - command not found"
    echo ""
    echo "  Installation instructions:"
    echo "    On macOS:         brew install coreutils"
    echo "    On Ubuntu/Debian: apt-get install coreutils"
    echo "    On RHEL/CentOS:   yum install coreutils"
    echo ""
    MISSING_DEPS=$((MISSING_DEPS + 1))
fi

# Check for git (required for git worktree tests)
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ git${NC} - command found"
else
    echo -e "${RED}❌ git${NC} - command not found"
    echo ""
    echo "  Git is required for worktree operations"
    echo "  Installation: https://git-scm.com/downloads"
    echo ""
    MISSING_DEPS=$((MISSING_DEPS + 1))
fi

# Check for node (required for config parsing)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ node${NC} - command found"
else
    echo -e "${YELLOW}⚠️  node${NC} - command not found (optional)"
    echo ""
    echo "  Node.js is required for JSONC config parsing"
    echo "  Installation: https://nodejs.org/"
    echo ""
fi

echo ""
echo "================================"

if [ $MISSING_DEPS -eq 0 ]; then
    echo -e "${GREEN}✅ All required dependencies are installed${NC}"
    exit 0
else
    echo -e "${RED}❌ Missing $MISSING_DEPS required dependencies${NC}"
    echo "Please install the missing dependencies before running tests."
    exit 1
fi