/**
 * PODs Role Arguments Tests
 * Tests assistant override and new tab opening functionality separately
 */

const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');
const {
    colors,
    incrementPassed,
    incrementFailed,
    resetTestCounters,
    printTestSummary,
    SCRIPT_DIR
} = require('./shared.js');

async function testAssistantOverride() {
    console.log(`${colors.BLUE}Test 1: Assistant Override${colors.NC}`);
    console.log('Running: bin/pods pm --a claude');

    try {
        const command = path.join(SCRIPT_DIR, 'bin', 'pods');
        let output = '';
        try {
            output = execSync(`${command} pm --a claude 2>&1`, {
                encoding: 'utf8',
                timeout: 10000,
                cwd: SCRIPT_DIR,
                maxBuffer: 10 * 1024 * 1024
            });
        } catch (execError) {
            output = (execError.stdout || '') + (execError.stderr || '');
        }

        if (output.includes('Using assistant override: claude')) {
            console.log(`  ${colors.GREEN}✅ Assistant override detected in output${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`  ${colors.RED}❌ Assistant override not found in output${colors.NC}`);
            console.log(`  Output: ${output}`);
            incrementFailed();
        }
    } catch (error) {
        console.log(`  ${colors.RED}❌ Test failed with error: ${error.message}${colors.NC}`);
        incrementFailed();
    }

    console.log('');
}

async function testNewTabOpening() {
    console.log(`${colors.BLUE}Test 2: New Tab Opening${colors.NC}`);
    console.log('Running: bin/pods ar --t');

    // macOS specific variables
    let windowsBefore = 0;
    let windowIdsBefore = [];
    let tabsBefore = 0;

    try {
        // --- Get "Before" State (macOS only) ---
        if (os.platform() === 'darwin') {
            if (process.env.TERM_PROGRAM === 'Apple_Terminal') {
                try {
                    const countCmd = 'osascript -e "tell application \\"Terminal\\" to count windows"';
                    windowsBefore = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim(), 10) || 0;
                    const idsCmd = 'osascript -e "tell application \\"Terminal\\" to id of every window"';
                    const idsOutput = execSync(idsCmd, { encoding: 'utf8' }).trim();
                    if (idsOutput) {
                        windowIdsBefore = idsOutput.split(', ').map(id => id.trim());
                    }
                } catch (e) {
                    console.log('  ⚠️  Could not get initial state of Apple Terminal.');
                }
            } else if (process.env.TERM_PROGRAM === 'iTerm.app') {
                try {
                    const countCmd = 'osascript -e "tell application \\"iTerm2\\" to tell current window to count tabs"';
                    tabsBefore = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim(), 10) || 0;
                } catch (e) {
                    console.log('  ⚠️  Could not get initial state of iTerm2.');
                }
            }
        }

        // --- Run the command ---
        const command = path.join(SCRIPT_DIR, 'bin', 'pods');
        const output = await new Promise((resolve) => {
            exec(`${command} ar --t 2>&1`, {
                encoding: 'utf8',
                timeout: 5000,
                cwd: SCRIPT_DIR
            }, (error, stdout, stderr) => {
                resolve(stdout + stderr);
            });
        });

        if (output.includes('🆕 Opening new tab') || output.includes('Opening new tab')) {
            console.log(`  ${colors.GREEN}✅ New tab message detected in output${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`  ${colors.RED}❌ New tab message not found in output${colors.NC}`);
            console.log(`  Output: ${output}`);
            incrementFailed();
        }

        // Give time for window/tab to open
        await new Promise(resolve => setTimeout(resolve, 3000));

        // --- Get "After" State and Cleanup (macOS only) ---
        if (os.platform() === 'darwin') {
            if (process.env.TERM_PROGRAM === 'Apple_Terminal') {
                try {
                    const countCmd = 'osascript -e "tell application \\"Terminal\\" to count windows"';
                    const windowsAfter = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim(), 10) || 0;

                    if (windowsAfter > windowsBefore) {
                        console.log(`  ✅ New window opened (before: ${windowsBefore}, after: ${windowsAfter})`);
                        console.log('  Attempting to close test window...');

                        const idsCmd = 'osascript -e "tell application \\"Terminal\\" to id of every window"';
                        const idsOutput = execSync(idsCmd, { encoding: 'utf8' }).trim();
                        const windowIdsAfter = idsOutput ? idsOutput.split(', ').map(id => id.trim()) : [];
                        
                        const newWindowId = windowIdsAfter.find(id => !windowIdsBefore.includes(id));

                        if (newWindowId) {
                            console.log(`    Found new window ID: ${newWindowId}`);
                            const closeCmd = `osascript -e 'tell application "Terminal" to close (every window whose id is ${newWindowId}) saving no'`;
                            execSync(closeCmd);

                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for close
                            const windowsFinal = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim(), 10) || 0;

                            if (windowsFinal === windowsBefore) {
                                console.log(`    ✅ Successfully closed test window (count back to ${windowsFinal})`);
                                incrementPassed();
                            } else {
                                console.log(`    ⚠️  Window may not have closed properly (expected: ${windowsBefore}, actual: ${windowsFinal})`);
                            }
                        } else {
                            console.log('    ⚠️  Could not identify new window ID to close.');
                        }
                    } else {
                        console.log(`  ⚠️  Window count unchanged (before: ${windowsBefore}, after: ${windowsAfter})`);
                    }
                } catch (e) {
                    console.log('  ⚠️  Could not verify window creation/closure.');
                }
            } else if (process.env.TERM_PROGRAM === 'iTerm.app') {
                try {
                    const countCmd = 'osascript -e "tell application \\"iTerm2\\" to tell current window to count tabs"';
                    const tabsAfter = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim(), 10) || 0;

                    if (tabsAfter > tabsBefore) {
                        console.log(`  ✅ New tab opened (before: ${tabsBefore}, after: ${tabsAfter})`);
                        console.log('  Attempting to close test tab...');
                        
                        const closeCmd = 'osascript -e "tell application \\"iTerm2\\" to tell current window to close last tab"';
                        execSync(closeCmd);
                        
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for close
                        const tabsFinal = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim(), 10) || 0;

                        if (tabsFinal === tabsBefore) {
                            console.log(`    ✅ Successfully closed test tab (count back to ${tabsFinal})`);
                            incrementPassed();
                        } else {
                            console.log(`    ⚠️  Tab may not have closed properly (expected: ${tabsBefore}, actual: ${tabsFinal})`);
                        }
                    } else {
                        console.log(`  ⚠️  Tab count unchanged (before: ${tabsBefore}, after: ${tabsAfter})`);
                    }
                } catch (e) {
                    console.log('  ⚠️  Could not verify tab creation/closure.');
                }
            }
        } else if (os.platform() === 'win32') {
            console.log('  ℹ️  Windows tab verification not implemented.');
        } else {
            console.log('  ℹ️  Linux tab verification not implemented.');
        }

    } catch (error) {
        console.log(`  ${colors.RED}❌ Test failed with error: ${error.message}${colors.NC}`);
        incrementFailed();
    }

    console.log('');
}

async function testInvalidArguments() {
    console.log(`${colors.BLUE}Test 3: Invalid Arguments Handling${colors.NC}`);
    console.log('Running: bin/pods pm --invalid');

    try {
        const command = path.join(SCRIPT_DIR, 'bin', 'pods');
        let output = '';
        try {
            output = execSync(`${command} pm --invalid 2>&1`, {
                encoding: 'utf8',
                timeout: 5000,
                cwd: SCRIPT_DIR,
                maxBuffer: 10 * 1024 * 1024
            });
        } catch (execError) {
            output = (execError.stdout || '') + (execError.stderr || '');
        }

        if (output.includes('Unknown argument') || output.includes('Error:')) {
            console.log(`  ${colors.GREEN}✅ Invalid argument properly rejected${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`  ${colors.RED}❌ Invalid argument not rejected${colors.NC}`);
            console.log(`  Output: ${output}`);
            incrementFailed();
        }
    } catch (error) {
        console.log(`  ${colors.GREEN}✅ Invalid argument caused expected error${colors.NC}`);
        incrementPassed();
    }

    console.log('');
}


async function runRoleArgsTests() {
    console.log('🧪 PODs Role Arguments Tests');
    console.log('===========================');
    console.log('');

    resetTestCounters();

    // Run all tests
    await testAssistantOverride();
    await testNewTabOpening();
    await testInvalidArguments();

    const success = printTestSummary('Role Arguments Tests');
    return success;
}

// Run if executed directly
if (require.main === module) {
    runRoleArgsTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runRoleArgsTests };