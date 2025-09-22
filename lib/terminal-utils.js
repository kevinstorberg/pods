/**
 * Terminal Utilities Library
 * Handles new tab creation across different terminal applications
 */

const { exec, spawn } = require('child_process');
const os = require('os');
const path = require('path');

// Get script directory
const SCRIPT_DIR = global.SCRIPT_DIR || path.resolve(__dirname, '..');

async function openNewTabAndLaunch(role, assistantOverride) {
    // Build command to run in new tab
    let commandToRun = `cd "${SCRIPT_DIR}"`;

    // Pass TEST_RESULT_FILE environment variable if set
    if (process.env.TEST_RESULT_FILE) {
        if (os.platform() === 'win32') {
            commandToRun += ` && set TEST_RESULT_FILE=${process.env.TEST_RESULT_FILE}`;
        } else {
            commandToRun += ` && export TEST_RESULT_FILE='${process.env.TEST_RESULT_FILE}'`;
        }
    }

    // Add the pods command with optional assistant override
    // Call the bash script directly (not with node, since bin/pods is a bash script)
    commandToRun += ` && "${path.join(SCRIPT_DIR, 'bin', 'pods')}" ${role}`;
    if (assistantOverride) {
        commandToRun += ` --a ${assistantOverride}`;
    }

    console.log('🆕 Opening new tab for role: ' + role);

    const platform = os.platform();

    try {
        if (platform === 'win32') {
            // Windows - try Windows Terminal first, then PowerShell, then CMD
            await openWindowsTab(commandToRun);
        } else if (platform === 'darwin') {
            // macOS - detect iTerm2 or Terminal.app
            await openMacTab(commandToRun);
        } else {
            // Linux - try various terminal emulators
            await openLinuxTab(commandToRun);
        }
    } catch (error) {
        console.error('❌ Unable to open new terminal tab');
        console.error('Error:', error.message);
        console.error('');
        console.error('Please open a new terminal tab manually and run:');
        console.error(commandToRun);
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