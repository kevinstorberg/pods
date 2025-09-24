/**
 * Terminal Utilities Library
 * Handles new tab creation across different terminal applications
 */

const { exec } = require('child_process');
const os = require('os');
const path = require('path');

// Get script directory
const SCRIPT_DIR = global.SCRIPT_DIR || path.resolve(__dirname, '..');

async function openNewTabAndLaunch(role, assistantOverride) {
    // Build commands to run in new tab across platforms
    const commands = buildCommands(role, assistantOverride);

    console.log('🆕 Opening new tab for role: ' + role);

    const platform = os.platform();

    try {
        if (platform === 'win32') {
            // Windows - try Windows Terminal first, then PowerShell, then CMD
            await openWindowsTab(commands.windows);
        } else if (platform === 'darwin') {
            // macOS - detect iTerm2 or Terminal.app
            await openMacTab(commands.posix);
        } else {
            // Linux - try various terminal emulators
            await openLinuxTab(commands.posix);
        }
    } catch (error) {
        console.error('❌ Unable to open new terminal tab');
        console.error('Error:', error.message);
        console.error('');
        console.error('Please open a new terminal tab manually and run:');
        console.error(platform === 'win32' ? commands.windows : commands.posix);
        process.exit(1);
    }
}

async function openWindowsTab(commandToRun) {
    // Try Windows Terminal first
    try {
        await execPromise(`wt new-tab cmd /k "${commandToRun}"`);
        console.log('✅ Opened new Windows Terminal tab and switched focus');
        return;
    } catch (e) {
        // Windows Terminal not available
    }

    // Try PowerShell
    try {
        const psCommand = `Start-Process powershell -ArgumentList '-NoExit', '-Command', '${commandToRun.replace(/'/g, "''")}'`;
        await execPromise(`powershell -Command "${psCommand}"`);
        console.log('✅ Opened new PowerShell window');
        return;
    } catch (e) {
        // PowerShell not available
    }

    // Fallback to CMD
    await execPromise(`start cmd /k "${commandToRun}"`);
    console.log('✅ Opened new Command Prompt window');
}

async function openMacTab(commandToRun) {
    // Check if we're in iTerm2
    if (process.env.TERM_PROGRAM === 'iTerm.app') {
        const appleScript = `
            tell application "iTerm2"
                tell current window
                    create tab with default profile
                    tell current session to write text "${commandToRun.replace(/"/g, '\\"')}"
                end tell
                activate
            end tell
        `;
        await execPromise(`osascript -e '${appleScript}'`);
        console.log('✅ Opened new iTerm2 tab and switched focus');
    } else {
        // Default to Terminal.app
        const appleScript = `
            tell application "Terminal"
                do script "${commandToRun.replace(/"/g, '\\"')}"
                set frontmost to true
                set selected of front window to last tab of front window
            end tell
        `;
        await execPromise(`osascript -e '${appleScript}'`);
        console.log('✅ Opened new Terminal.app tab and switched focus');
    }
}

async function openLinuxTab(commandToRun) {
    // Try different terminal emulators in order of preference
    const terminals = [
        {
            name: 'gnome-terminal',
            command: `gnome-terminal --tab --working-directory="${SCRIPT_DIR}" -- bash -c "${commandToRun}; exec bash"`,
            message: 'GNOME Terminal'
        },
        {
            name: 'konsole',
            command: `konsole --new-tab --workdir "${SCRIPT_DIR}" -e bash -c "${commandToRun}; exec bash"`,
            message: 'Konsole'
        },
        {
            name: 'xfce4-terminal',
            command: `xfce4-terminal --tab --working-directory="${SCRIPT_DIR}" -e 'bash -c "${commandToRun}; exec bash"'`,
            message: 'XFCE Terminal'
        },
        {
            name: 'mate-terminal',
            command: `mate-terminal --tab --working-directory="${SCRIPT_DIR}" -e 'bash -c "${commandToRun}; exec bash"'`,
            message: 'MATE Terminal'
        },
        {
            name: 'terminator',
            command: `terminator --new-tab --working-directory="${SCRIPT_DIR}" -e 'bash -c "${commandToRun}; exec bash"'`,
            message: 'Terminator'
        },
        {
            name: 'alacritty',
            command: `alacritty --working-directory "${SCRIPT_DIR}" -e bash -c "${commandToRun}; exec bash"`,
            message: 'Alacritty (new window)'
        },
        {
            name: 'kitty',
            command: `kitty --directory "${SCRIPT_DIR}" bash -c "${commandToRun}; exec bash"`,
            message: 'Kitty (new window)'
        },
        {
            name: 'xterm',
            command: `xterm -e "cd '${SCRIPT_DIR}' && ${commandToRun}; bash"`,
            message: 'XTerm (new window)'
        }
    ];

    for (const terminal of terminals) {
        try {
            // Check if terminal is installed
            await execPromise(`which ${terminal.name}`);
            // Try to open it
            exec(terminal.command); // Don't await, let it run in background
            console.log(`✅ Opened new ${terminal.message} tab/window`);
            return;
        } catch (e) {
            // Try next terminal
            continue;
        }
    }

    throw new Error('No supported terminal emulator found');
}

function buildCommands(role, assistantOverride) {
    const podsExecutable = path.join(SCRIPT_DIR, 'bin', 'pods');

    const posixParts = [`cd ${quotePosix(SCRIPT_DIR)}`];
    if (process.env.TEST_RESULT_FILE) {
        posixParts.push(`export TEST_RESULT_FILE=${quotePosix(process.env.TEST_RESULT_FILE)}`);
    }

    const posixCommandParts = [quotePosix(podsExecutable), quotePosix(role)];
    if (assistantOverride) {
        posixCommandParts.push('--a');
        posixCommandParts.push(quotePosix(assistantOverride));
    }
    posixParts.push(posixCommandParts.join(' '));
    const posixCommand = posixParts.join(' && ');

    const windowsParts = [`cd /d ${quoteWindowsPath(SCRIPT_DIR)}`];
    if (process.env.TEST_RESULT_FILE) {
        windowsParts.push(`set TEST_RESULT_FILE=${quoteWindowsEnv(process.env.TEST_RESULT_FILE)}`);
    }

    const windowsCommandParts = [quoteWindowsPath(podsExecutable), quoteWindowsArg(role)];
    if (assistantOverride) {
        windowsCommandParts.push('--a');
        windowsCommandParts.push(quoteWindowsArg(assistantOverride));
    }
    windowsParts.push(windowsCommandParts.join(' '));
    const windowsCommand = windowsParts.join(' && ');

    return {
        posix: posixCommand,
        windows: windowsCommand
    };
}

function quotePosix(value) {
    const str = String(value ?? '');
    if (str.length === 0) {
        return "''";
    }
    return `'${str.split("'").join("'\"'\"'")}'`;
}

function quoteWindowsPath(value) {
    const normalized = String(value ?? '').replace(/"/g, '""');
    return `"${normalized}"`;
}

function quoteWindowsArg(value) {
    const str = String(value ?? '');
    const escaped = str.replace(/([\^&|<>])/g, '^$1').replace(/"/g, '""');
    if (escaped.length === 0) {
        return '""';
    }
    return /[\s\^&|<>]/.test(escaped) ? `"${escaped}"` : escaped;
}

function quoteWindowsEnv(value) {
    // For SET command, ensure we escape problematic characters
    return quoteWindowsArg(value);
}

// Helper function to promisify exec
function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

module.exports = { openNewTabAndLaunch };
