#!/bin/bash

# Configuration Parser Library
# Handles JSONC parsing for PODs configuration files

get_ai_assistant() {
    local role_name="$1"
    local config_file="${SCRIPT_DIR}/config/assistants.json"

    if [ ! -f "$config_file" ]; then
        echo "Error: Config file not found at $config_file"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        echo "Error: Node.js required to parse JSONC config file"
        echo "Please install Node.js: https://nodejs.org/"
        exit 1
    fi

    # Check if jsonc-parser is installed
    if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
        echo "Installing dependencies..."
        cd "$SCRIPT_DIR" && npm install > /dev/null 2>&1
    fi

    # Parse JSONC configuration
    local config_result
    config_result=$(node -e "
        const fs = require('fs');
        const { parse } = require('jsonc-parser');
        try {
            const content = fs.readFileSync('$config_file', 'utf8');
            const config = parse(content);
            const defaultAssistant = config.default || 'claude';
            const roleAssistant = config.roles && config.roles['$role_name'] || '';
            console.log(JSON.stringify({default: defaultAssistant, role: roleAssistant}));
        } catch (error) {
            console.log(JSON.stringify({error: error.message}));
        }
    " 2>/dev/null)

    # Check for parsing errors
    if echo "$config_result" | grep -q '"error"'; then
        echo "Error parsing config file: $config_file"
        exit 1
    fi

    # Extract values
    local default_assistant role_assistant
    default_assistant=$(echo "$config_result" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).default)")
    role_assistant=$(echo "$config_result" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).role)")

    # Return appropriate assistant
    if [ -n "$role_assistant" ] && [ "$role_assistant" != "null" ] && [ "$role_assistant" != "" ]; then
        echo "Using role-specific AI assistant: $role_assistant" >&2
        echo "$role_assistant"
    else
        echo "Using default AI assistant: $default_assistant" >&2
        echo "$default_assistant"
    fi
}