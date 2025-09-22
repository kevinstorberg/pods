/**
 * PODs Test Dependencies Checker
 * Ensures all required commands are available before running tests
 */

const {
    colors,
    commandExists,
    incrementPassed,
    incrementFailed,
    printTestSummary
} = require('./shared.js');

const os = require('os');

function checkDependencies() {
    console.log('🔍 Checking test dependencies...');
    console.log('================================');
    console.log('');

    let missingDeps = 0;

    // Check for git (required for git worktree tests)
    if (commandExists('git')) {
        console.log(`${colors.GREEN}✅ git${colors.NC} - command found`);
        incrementPassed();
    } else {
        console.log(`${colors.RED}❌ git${colors.NC} - command not found`);
        console.log('');
        console.log('  Git is required for worktree operations');
        console.log('  Installation: https://git-scm.com/downloads');
        console.log('');
        missingDeps++;
        incrementFailed();
    }

    // Check for node (should always pass since we're running in Node)
    if (commandExists('node')) {
        console.log(`${colors.GREEN}✅ node${colors.NC} - command found`);
        incrementPassed();
    } else {
        console.log(`${colors.RED}❌ node${colors.NC} - command not found`);
        console.log('');
        console.log('  Node.js is required to run PODs');
        console.log('  Installation: https://nodejs.org/');
        console.log('');
        missingDeps++;
        incrementFailed();
    }

    // Check for npm (for package installation)
    if (commandExists('npm')) {
        console.log(`${colors.GREEN}✅ npm${colors.NC} - command found`);
        incrementPassed();
    } else {
        console.log(`${colors.YELLOW}⚠️  npm${colors.NC} - command not found (optional)`);
        console.log('');
        console.log('  npm is recommended for package management');
        console.log('  Usually comes with Node.js installation');
        console.log('');
    }

    // Platform-specific checks
    if (os.platform() === 'win32') {
        // Windows-specific checks
        if (commandExists('powershell')) {
            console.log(`${colors.GREEN}✅ powershell${colors.NC} - command found (Windows)${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`${colors.YELLOW}⚠️  powershell${colors.NC} - command not found`);
        }

        if (commandExists('wt')) {
            console.log(`${colors.GREEN}✅ Windows Terminal${colors.NC} - command found${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`${colors.YELLOW}⚠️  Windows Terminal${colors.NC} - not found (optional)`);
            console.log('  Install from Microsoft Store for better terminal tab support');
        }
    } else if (os.platform() === 'darwin') {
        // macOS-specific checks
        if (commandExists('osascript')) {
            console.log(`${colors.GREEN}✅ osascript${colors.NC} - command found (macOS)${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`${colors.YELLOW}⚠️  osascript${colors.NC} - command not found`);
        }
    } else {
        // Linux-specific checks
        const terminals = ['gnome-terminal', 'konsole', 'xterm', 'alacritty', 'kitty'];
        let foundTerminal = false;

        for (const terminal of terminals) {
            if (commandExists(terminal)) {
                console.log(`${colors.GREEN}✅ ${terminal}${colors.NC} - terminal emulator found${colors.NC}`);
                foundTerminal = true;
                incrementPassed();
                break;
            }
        }

        if (!foundTerminal) {
            console.log(`${colors.YELLOW}⚠️  No supported terminal emulator found${colors.NC}`);
            console.log('  Supported: gnome-terminal, konsole, xterm, alacritty, kitty');
        }
    }

    console.log('');
    console.log('================================');

    if (missingDeps === 0) {
        console.log(`${colors.GREEN}✅ All required dependencies are installed${colors.NC}`);
        return true;
    } else {
        console.log(`${colors.RED}❌ Missing ${missingDeps} required dependencies${colors.NC}`);
        console.log('Please install the missing dependencies before running tests.');
        return false;
    }
}

// Run if executed directly
if (require.main === module) {
    const success = checkDependencies();
    process.exit(success ? 0 : 1);
}

module.exports = { checkDependencies };