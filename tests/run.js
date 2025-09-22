#!/usr/bin/env node

/**
 * PODs Test Suite Runner
 * Main entry point for all PODs framework tests
 */

const { colors } = require('./shared.js');
const { checkDependencies } = require('./test-dependencies.js');
const { runRoleTests } = require('./test-roles.js');
const { runRoleArgsTests } = require('./test-role-args.js');

async function runAllTests() {
    console.log('🧪 Running PODs Test Suite');
    console.log('=========================');
    console.log('');

    let allTestsPassed = true;

    // Check dependencies first
    console.log('Step 1: Checking Dependencies');
    console.log('-----------------------------');
    const depsOk = checkDependencies();
    if (!depsOk) {
        console.log(`${colors.RED}❌ Dependency check failed. Please install missing dependencies.${colors.NC}`);
        return false;
    }
    console.log('');

    // Run role loading tests
    console.log('Step 2: Role Loading Tests');
    console.log('--------------------------');
    try {
        const roleTestsPassed = await runRoleTests();
        if (!roleTestsPassed) {
            allTestsPassed = false;
        }
    } catch (error) {
        console.error(`${colors.RED}❌ Role tests failed with error: ${error.message}${colors.NC}`);
        allTestsPassed = false;
    }
    console.log('');

    // Run role arguments tests
    console.log('Step 3: Role Arguments Tests');
    console.log('----------------------------');
    try {
        const argsTestsPassed = await runRoleArgsTests();
        if (!argsTestsPassed) {
            allTestsPassed = false;
        }
    } catch (error) {
        console.error(`${colors.RED}❌ Role arguments tests failed with error: ${error.message}${colors.NC}`);
        allTestsPassed = false;
    }

    // Final summary
    console.log('');
    console.log('=========================');
    console.log('Test Suite Summary');
    console.log('=========================');

    if (allTestsPassed) {
        console.log(`${colors.GREEN}✅ PODs test suite completed successfully!${colors.NC}`);
        console.log('All tests passed.');
    } else {
        console.log(`${colors.RED}❌ PODs test suite completed with failures.${colors.NC}`);
        console.log('Please review the errors above.');
    }

    return allTestsPassed;
}

// Run tests if executed directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error(`${colors.RED}Fatal error: ${error.message}${colors.NC}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { runAllTests };