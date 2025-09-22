/**
 * Shared Test Utilities
 * Common utilities for PODs test suite
 */

const os = require('os');

// ANSI color codes (with Windows support detection)
const supportsColor = process.stdout.isTTY &&
    (os.platform() !== 'win32' || process.env.TERM || process.env.COLORTERM);

const colors = {
    RED: supportsColor ? '\x1b[31m' : '',
    GREEN: supportsColor ? '\x1b[32m' : '',
    YELLOW: supportsColor ? '\x1b[33m' : '',
    BLUE: supportsColor ? '\x1b[34m' : '',
    NC: supportsColor ? '\x1b[0m' : ''  // No Color/Reset
};

// Test counters
let passedTests = 0;
let failedTests = 0;

function incrementPassed() {
    passedTests++;
}

function incrementFailed() {
    failedTests++;
}

function getTestResults() {
    return {
        passed: passedTests,
        failed: failedTests,
        total: passedTests + failedTests
    };
}

function resetTestCounters() {
    passedTests = 0;
    failedTests = 0;
}

function printTestSummary(testName) {
    const results = getTestResults();
    console.log('');
    console.log('=================================');
    console.log(`${testName} Summary:`);
    console.log(`  ${colors.GREEN}✅ Passed: ${results.passed}${colors.NC}`);
    if (results.failed > 0) {
        console.log(`  ${colors.RED}❌ Failed: ${results.failed}${colors.NC}`);
    }
    console.log(`  Total: ${results.total}`);
    console.log('=================================');

    return results.failed === 0;
}

// Cross-platform command existence check
function commandExists(command) {
    const { execSync } = require('child_process');
    try {
        if (os.platform() === 'win32') {
            execSync(`where ${command}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${command}`, { stdio: 'ignore' });
        }
        return true;
    } catch (e) {
        return false;
    }
}

// Cross-platform timeout execution
async function executeWithTimeout(command, timeoutMs = 10000, options = {}) {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
        let output = '';
        let errorOutput = '';
        let timedOut = false;

        // Use shell to handle command parsing properly
        const child = spawn(command, [], {
            ...options,
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']  // Ensure we capture stdout and stderr
        });

        // Set timeout
        const timeout = setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
            setTimeout(() => {
                if (child.exitCode === null) {
                    child.kill('SIGKILL');
                }
            }, 1000);
        }, timeoutMs);

        child.stdout?.on('data', (data) => {
            output += data.toString();
        });

        child.stderr?.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('exit', (code) => {
            clearTimeout(timeout);
            if (timedOut) {
                resolve({
                    output: 'TIMEOUT_ERROR',
                    error: 'Command timed out',
                    code: -1
                });
            } else {
                resolve({
                    output,
                    error: errorOutput,
                    code
                });
            }
        });

        child.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

// Get script directory
function getScriptDir() {
    const path = require('path');
    return path.resolve(__dirname, '..');
}

module.exports = {
    colors,
    incrementPassed,
    incrementFailed,
    getTestResults,
    resetTestCounters,
    printTestSummary,
    commandExists,
    executeWithTimeout,
    getScriptDir,
    SCRIPT_DIR: getScriptDir()
};