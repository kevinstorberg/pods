/**
 * Role Launcher Library
 * Handles role launching with argument support
 */

const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const os = require('os');
const { getAIAssistant } = require('./config-parser.js');
const { openNewTabAndLaunch } = require('./terminal-utils.js');

// Get script directory
const SCRIPT_DIR = global.SCRIPT_DIR || path.resolve(__dirname, '..');

// Centralized role mapping functions
function getRoleFullname(input) {
    const roleMap = {
        'ad': 'admin',
        'pm': 'product_manager',
        'ar': 'architect',
        'em': 'engineering_manager',
        'fe': 'fullstack_engineer',
        'qe': 'qa_engineer',
        'de': 'designer'
    };
    return roleMap[input] || input;
}

function getRoleAbbreviation(role) {
    const abbrevMap = {
        'admin': 'ad',
        'product_manager': 'pm',
        'architect': 'ar',
        'engineering_manager': 'em',
        'fullstack_engineer': 'fe',
        'qa_engineer': 'qe',
        'designer': 'de'
    };
    return abbrevMap[role] || '';
}

async function launchRole(args) {
    const inputRole = args[0];
    const remainingArgs = args.slice(1);

    let newTab = false;
    let assistantOverride = '';

    // Parse arguments
    for (let i = 0; i < remainingArgs.length; i++) {
        const arg = remainingArgs[i];
        if (arg === '--t') {
            newTab = true;
        } else if (arg === '--a') {
            if (remainingArgs[i + 1]) {
                assistantOverride = remainingArgs[i + 1];
                i++; // Skip next argument
            } else {
                console.error('Error: --a flag requires assistant name (claude, codex, gemini)');
                process.exit(1);
            }
        } else {
            console.error(`Error: Unknown argument ${arg}`);
            console.log('Usage: pods <role> [--t] [--a assistant]');
            process.exit(1);
        }
    }

    // Handle new tab request
    if (newTab) {
        await openNewTabAndLaunch(inputRole, assistantOverride);
        return;
    }

    // Convert abbreviations to full role names
    const roleName = getRoleFullname(inputRole);

    // Validate role exists
    const roleFile = path.join(SCRIPT_DIR, 'roles', `${roleName}.md`);
    if (!fs.existsSync(roleFile)) {
        console.error(`Error: Role '${roleName}' not found.`);
        console.error(`Expected file: ${roleFile}`);
        console.error('');
        console.error('Available roles:');

        const rolesDir = path.join(SCRIPT_DIR, 'roles');
        const roleFiles = fs.readdirSync(rolesDir).filter(f => f.endsWith('.md'));

        roleFiles.forEach(file => {
            const role = file.replace('.md', '');
            const abbrev = getRoleAbbreviation(role);
            if (abbrev) {
                console.error(`  ${role} (${abbrev})`);
            } else {
                console.error(`  ${role}`);
            }
        });

        process.exit(1);
    }

    // Load AI assistant configuration (or use override)
    let aiEditor;
    if (assistantOverride) {
        aiEditor = assistantOverride;
        console.log(`Using assistant override: ${aiEditor}`);
    } else {
        aiEditor = await getAIAssistant(roleName);
    }

    // Detect worktree information BEFORE changing directory
    const callingDir = process.cwd();
    let worktreePath = '';
    let branchName = '';
    let isWorktree = false;

    // Check if we're in a git repository and get worktree info
    try {
        worktreePath = execSync('git rev-parse --show-toplevel 2>/dev/null', { encoding: 'utf8' }).trim();
        branchName = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8' }).trim();

        // Check if this is a worktree (not the main repo)
        const gitDir = execSync('git rev-parse --git-dir 2>/dev/null', { encoding: 'utf8' }).trim();
        const commonDir = execSync('git rev-parse --git-common-dir 2>/dev/null', { encoding: 'utf8' }).trim();
        if (gitDir !== commonDir) {
            isWorktree = true;
        }
    } catch (e) {
        // Not in a git repo, that's fine
    }

    // Change to PODs directory
    process.chdir(SCRIPT_DIR);

    console.log('🚀 Launching ' + aiEditor + ' with PODs framework...');
    console.log('📁 Working directory: ' + SCRIPT_DIR);
    console.log('👤 Role: ' + roleName);
    if (newTab) {
        console.log('🆕 New tab requested');
    }
    if (assistantOverride) {
        console.log('🤖 Assistant override: ' + assistantOverride);
    }

    // Display worktree information
    if (worktreePath) {
        console.log('🌳 Worktree: ' + path.basename(worktreePath));
        console.log('🔀 Branch: ' + branchName);
        if (isWorktree) {
            console.log('✅ Running in worktree (isolated from main)');
        }
    }
    console.log('');

    // Write test result file if TEST_RESULT_FILE is set (for tests)
    if (process.env.TEST_RESULT_FILE) {
        fs.writeFileSync(process.env.TEST_RESULT_FILE,
            `assistant:${aiEditor}\nrole:${roleName}\nWorking directory: ${process.cwd()}\n`);
    }

    // Read project directory from config
    let PROJECT_DIRECTORY = '..';
    try {
        const configPath = path.join(SCRIPT_DIR, 'config', 'project.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            PROJECT_DIRECTORY = config.project_directory || '..';
        }
    } catch (e) {
        // Use default
    }

    // Set environment variables for the AI to use
    if (worktreePath) {
        process.env.WORKTREE_PATH = worktreePath;
        process.env.BRANCH_NAME = branchName;
        process.env.IS_WORKTREE = isWorktree.toString();
        process.env.WORKING_DIRECTORY = worktreePath;
    } else {
        process.env.WORKING_DIRECTORY = PROJECT_DIRECTORY;
    }
    process.env.PROJECT_DIRECTORY = PROJECT_DIRECTORY;

    const roleCommand = `Please read ./roles/${roleName}.md and assume that role. Then output your role metadata in this exact format:

ROLE: ${roleName}
DELIVERABLES: [list the filenames you will create in /branch/ folder]
INPUTS: [list the key files/contexts you will read]
PROJECT_DIRECTORY: ${PROJECT_DIRECTORY}
WORKING_DIRECTORY: ${process.env.WORKING_DIRECTORY}
BRANCH: ${branchName || 'main'}
WORKTREE: ${worktreePath || 'none'}
MCP_SERVERS: [list any MCP servers you have available, or 'none']
AI_ASSISTANT: ${aiEditor}
QUICK_COMMANDS: [list the quick commands you are monitoring for from your role definition]
STATUS: ready

Do not include any other text or explanation - just this structured metadata.`;

    // Add test reporting to command if in test mode
    let testFile = '';
    if (process.env.PODS_TEST_MODE) {
        testFile = `/tmp/pods_test_${roleName}_${Date.now()}.result`;
        process.env.PODS_TEST_FILE = testFile;
    }

    if (testFile) {
        const testCommand = roleCommand + `\n\nAfter outputting the metadata, also run this command to report test results:\necho 'TEST_SUCCESS:${aiEditor}:${roleName}' > '${testFile}'`;
        await launchAIAssistant(aiEditor, testCommand);
    } else {
        await launchAIAssistant(aiEditor, roleCommand);
    }
}

async function launchAIAssistant(aiEditor, roleCommand) {
    // Check if command exists
    try {
        if (os.platform() === 'win32') {
            execSync(`where ${aiEditor}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${aiEditor}`, { stdio: 'ignore' });
        }
    } catch (e) {
        console.error(`Error: ${aiEditor} command not found.`);
        console.error(`Please install ${aiEditor} or ensure it's in your PATH.`);
        console.error('You can also edit config/assistants.json to use a different AI assistant.');
        process.exit(1);
    }

    let childProcess;

    if (aiEditor === 'claude') {
        childProcess = spawn('claude', [roleCommand], {
            stdio: 'inherit',
            shell: os.platform() === 'win32'
        });
    } else if (aiEditor === 'codex') {
        childProcess = spawn('codex', [roleCommand], {
            stdio: 'inherit',
            shell: os.platform() === 'win32'
        });
    } else if (aiEditor === 'gemini') {
        childProcess = spawn('gemini', ['-i', roleCommand], {
            stdio: 'inherit',
            shell: os.platform() === 'win32'
        });
    } else {
        console.log(`⚠️  Your AI assistant doesn't support automatic role loading.`);
        childProcess = spawn(aiEditor, [], {
            stdio: 'inherit',
            shell: os.platform() === 'win32'
        });
        console.log('');
        console.log('Please manually enter this command:');
        console.log(`"${roleCommand}"`);
    }

    return new Promise((resolve, reject) => {
        childProcess.on('exit', (code) => {
            if (code === 0) {
                resolve();
            } else {
                process.exit(code);
            }
        });

        childProcess.on('error', (err) => {
            console.error('Error launching AI assistant:', err.message);
            process.exit(1);
        });
    });
}

module.exports = { launchRole };