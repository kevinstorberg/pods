#!/usr/bin/env node

/**
 * PODs - AI Development Framework
 * Main Node.js entry point
 */

const path = require('path');

// Get script directory (works on all platforms)
const SCRIPT_DIR = path.resolve(__dirname, '..');

// Set SCRIPT_DIR as global for other modules to use
global.SCRIPT_DIR = SCRIPT_DIR;

// Import modules
const { launchRole } = require('./role-launcher.js');
const { handleGitCommands } = require('./git-commands.js');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: pods <subcommand> [args...]');
    console.log('');
    console.log('Subcommands:');
    console.log('  <role-name>     Launch AI role (admin, pm, ar, em, fe, qe, de)');
    console.log('  g               Git operations (tree, branch, etc.)');
    console.log('');
    console.log('Role arguments:');
    console.log('  --t            Open new terminal tab');
    console.log('  --a assistant  Override AI assistant');
    console.log('');
    console.log('Examples:');
    console.log('  pods pm              # Launch Product Manager');
    console.log('  pods fe --t          # Launch Fullstack Engineer in new tab');
    console.log('  pods ar --a gemini   # Launch Architect with Gemini');
    console.log('  pods g tree auth     # Create git worktree for \'auth\' feature');
    process.exit(1);
}

// Route commands
async function main() {
    try {
        if (args[0] === 'g') {
            await handleGitCommands(args.slice(1));
        } else {
            await launchRole(args);
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.stack && process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});