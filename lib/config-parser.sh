#!/bin/bash

# Configuration Parser Library
# Handles JSONC parsing for PODs configuration files

get_ai_assistant() {
    local role_name="$1"
    local config_file="${SCRIPT_DIR}/config/assistants.json"

    if ! command -v node &> /dev/null; then
        echo "Error: Node.js required to parse JSONC config file"
        echo "Please install Node.js: https://nodejs.org/"
        exit 1
    fi

    if [ ! -f "$config_file" ]; then
        echo "Error: Config file not found at $config_file"
        exit 1
    fi

    if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
        echo "Installing dependencies..."
        cd "$SCRIPT_DIR" && npm install
    fi

    # Parse JSONC configuration and get the assistant
    local assistant
    assistant=$(node -e "
        const fs = require('fs');
        const { parse } = require('jsonc-parser');
        try {
            const content = fs.readFileSync('$config_file', 'utf8');
            const config = parse(content);
            const roleAssistant = config.roles && config.roles['$role_name'];
            const defaultAssistant = config.default || 'claude';

            if (roleAssistant) {
                console.error('Using role-specific AI assistant: ' + roleAssistant);
                console.log(roleAssistant);
            } else {
                console.error('Using default AI assistant: ' + defaultAssistant);
                console.log(defaultAssistant);
            }
        } catch (error) {
            console.error('Error parsing config file: ' + error.message);
            process.exit(1);
        }
    " 2>&1)

    # Check if node command succeeded
    if [ $? -ne 0 ]; then
        echo "$assistant"  # This will contain the error message
        exit 1
    fi

    # Return the assistant (last line of output)
    echo "$assistant" | tail -n1
}