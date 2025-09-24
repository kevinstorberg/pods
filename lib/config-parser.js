/**
 * Configuration Parser Library
 * Handles JSONC parsing for PODs configuration files
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('jsonc-parser');

// Get script directory
const SCRIPT_DIR = global.SCRIPT_DIR || path.resolve(__dirname, '..');

async function getAIAssistant(roleName) {
    const configFile = path.join(SCRIPT_DIR, 'config', 'assistants.jsonc');

    if (!fs.existsSync(configFile)) {
        console.error(`Error: Config file not found at ${configFile}`);
        process.exit(1);
    }

    // Check if node_modules exists
    const nodeModulesPath = path.join(SCRIPT_DIR, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('Installing dependencies...');
        const { execSync } = require('child_process');
        execSync('npm install', {
            cwd: SCRIPT_DIR,
            stdio: 'inherit'
        });
    }

    try {
        const content = fs.readFileSync(configFile, 'utf8');
        const config = parse(content);

        const roleAssistant = config.roles && config.roles[roleName];
        const defaultAssistant = config.default || 'claude';

        if (roleAssistant) {
            console.log(`Using role-specific AI assistant: ${roleAssistant}`);
            return roleAssistant;
        } else {
            console.log(`Using default AI assistant: ${defaultAssistant}`);
            return defaultAssistant;
        }
    } catch (error) {
        console.error('Error parsing config file:', error.message);
        process.exit(1);
    }
}

module.exports = { getAIAssistant };