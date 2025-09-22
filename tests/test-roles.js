/**
 * PODs Role Loading Tests
 * Tests each role's metadata output for essential information
 * Resilient to additions, fails only on destructive changes
 */

const path = require('path');
const { execSync } = require('child_process');
const {
    colors,
    incrementPassed,
    incrementFailed,
    executeWithTimeout,
    resetTestCounters,
    printTestSummary,
    SCRIPT_DIR
} = require('./shared.js');

async function testRole(roleName, expectedDeliverables, mustIncludeInputs) {
    console.log(`${colors.BLUE}Testing role: ${roleName}${colors.NC}`);

    let output = '';

    try {
        // Capture role output using execSync (like the original bash test)
        const command = path.join(SCRIPT_DIR, 'bin', 'pods');

        // Use execSync with timeout, capturing both stdout and stderr
        try {
            output = execSync(`${command} ${roleName} 2>&1`, {
                encoding: 'utf8',
                timeout: 60000,  // 60 second timeout
                cwd: SCRIPT_DIR,
                maxBuffer: 10 * 1024 * 1024  // 10MB buffer
            });
        } catch (execError) {
            if (execError.code === 'ETIMEDOUT') {
                console.log(`  ${colors.RED}❌ TIMEOUT${colors.NC} - Role took too long to respond`);
                incrementFailed();
                return;
            }
            // Still capture output even if command failed
            output = (execError.stdout || '') + (execError.stderr || '');
        }

        // Check for errors
        if (output.toLowerCase().includes('error:')) {
            console.log(`  ${colors.RED}❌ ERROR${colors.NC} - Role failed to launch`);
            console.log(`     Output: ${output.substring(0, 100)}...`);
            incrementFailed();
            return;
        }

        // Convert abbreviation to full name for role identification test
        const roleNameMap = {
            'ad': 'admin',
            'pm': 'product_manager',
            'ar': 'architect',
            'em': 'engineering_manager',
            'fe': 'fullstack_engineer',
            'qe': 'qa_engineer',
            'de': 'designer'
        };

        const expectedRoleName = roleNameMap[roleName] || roleName;

        // Test 1: Role field exists and matches
        const roleRegex = new RegExp(`ROLE:.*${expectedRoleName}`);
        if (roleRegex.test(output)) {
            console.log(`  ${colors.GREEN}✅ Role identification${colors.NC}`);
            incrementPassed();
        } else {
            console.log(`  ${colors.RED}❌ Role identification${colors.NC} - Missing or incorrect ROLE field`);
            incrementFailed();
            return;
        }

        // Test 2: Deliverables field exists and contains expected files
        if (output.includes('DELIVERABLES:')) {
            let deliverablesValid = true;

            for (const deliverable of expectedDeliverables) {
                if (output.includes(deliverable)) {
                    console.log(`  ${colors.GREEN}✅ Deliverable: ${deliverable}${colors.NC}`);
                    incrementPassed();
                } else {
                    console.log(`  ${colors.RED}❌ Missing deliverable: ${deliverable}${colors.NC}`);
                    deliverablesValid = false;
                    incrementFailed();
                }
            }

            if (!deliverablesValid) {
                return;
            }
        } else {
            console.log(`  ${colors.RED}❌ DELIVERABLES field missing${colors.NC}`);
            incrementFailed();
            return;
        }

        // Test 3: Key inputs are present (flexible - allows additions)
        if (output.includes('INPUTS:')) {
            let inputsValid = true;

            for (const input of mustIncludeInputs) {
                if (output.includes(input)) {
                    console.log(`  ${colors.GREEN}✅ Required input: ${input}${colors.NC}`);
                    incrementPassed();
                } else {
                    console.log(`  ${colors.RED}❌ Missing required input: ${input}${colors.NC}`);
                    inputsValid = false;
                    incrementFailed();
                }
            }

            if (!inputsValid) {
                return;
            }
        } else {
            console.log(`  ${colors.RED}❌ INPUTS field missing${colors.NC}`);
            incrementFailed();
            return;
        }

        // Test 4: Other required metadata fields
        const requiredFields = ['PROJECT_DIRECTORY:', 'WORKING_DIRECTORY:', 'STATUS:'];

        for (const field of requiredFields) {
            if (output.includes(field)) {
                console.log(`  ${colors.GREEN}✅ ${field.replace(':', '')} field present${colors.NC}`);
                incrementPassed();
            } else {
                console.log(`  ${colors.RED}❌ ${field.replace(':', '')} field missing${colors.NC}`);
                incrementFailed();
            }
        }

    } catch (error) {
        console.log(`  ${colors.RED}❌ Test failed with error: ${error.message}${colors.NC}`);
        incrementFailed();
    }

    console.log('');
}

async function runRoleTests() {
    console.log('🧪 PODs Role Loading Tests');
    console.log('==========================');
    console.log('');

    resetTestCounters();

    // Test Product Manager role
    await testRole('pm',
        ['requirements_doc.md', 'user_stories.md'],
        ['business_context', 'customer_personas']
    );

    // Test Architect role
    await testRole('ar',
        ['architecture_spec.md'],
        ['requirements_doc.md', 'technical_context']
    );

    // Test Engineering Manager role
    await testRole('em',
        ['tickets.md', 'implementation_plan.md'],
        ['architecture_spec.md']
    );

    // Test Fullstack Engineer role
    await testRole('fe',
        [],  // No specific deliverables (creates code)
        ['tickets.md', 'implementation_plan.md']
    );

    // Test QA Engineer role
    await testRole('qe',
        ['qa_report.md'],
        ['requirements_doc.md', 'implementation']
    );

    // Test Admin role
    await testRole('admin',
        [],  // Admin configures context, no specific deliverables
        []   // Admin doesn't require specific inputs
    );

    // Test Designer role (if exists)
    await testRole('de',
        ['design_task.md', 'design_system.md'],
        ['requirements_doc.md', 'user_stories.md']
    );

    const success = printTestSummary('Role Loading Tests');
    return success;
}

// Run if executed directly
if (require.main === module) {
    runRoleTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runRoleTests };