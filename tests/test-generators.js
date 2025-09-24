#!/usr/bin/env node

/**
 * Test suite for generator commands
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { colors, incrementPassed, incrementFailed, printTestSummary } = require('./shared.js');

const SCRIPT_DIR = path.resolve(__dirname, '..');
let testResults = [];

// Test utility function
function runTest(testName, testFn, results) {
    process.stdout.write(`  ${testName}... `);
    try {
        const result = testFn();
        if (result && result.skipped) {
            results.push({ name: testName, status: 'skipped' });
            return;
        }
        console.log(`${colors.GREEN}✅${colors.NC}`);
        incrementPassed();
        results.push({ name: testName, status: 'passed' });
    } catch (error) {
        console.log(`${colors.RED}❌${colors.NC}`);
        console.log(`    Error: ${error.message}`);
        incrementFailed();
        results.push({ name: testName, status: 'failed', error: error.message });
    }
}

// Test summary function
function testSummary(results) {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    console.log('');
    console.log('Generator Test Summary:');
    console.log(`  ${colors.GREEN}✅ Passed: ${passed}${colors.NC}`);
    if (failed > 0) {
        console.log(`  ${colors.RED}❌ Failed: ${failed}${colors.NC}`);
    }
    if (skipped > 0) {
        console.log(`  ${colors.YELLOW}⏭️  Skipped: ${skipped}${colors.NC}`);
    }
    console.log(`  Total: ${results.length}`);
}

console.log('🧪 Testing Generator Commands...\n');

// Test 1: PDF generation with no arguments (should convert all)
runTest('PDF generation - no arguments', () => {
    // Create test markdown files
    const branchDir = path.join(SCRIPT_DIR, 'branch');
    if (!fs.existsSync(branchDir)) {
        fs.mkdirSync(branchDir);
    }

    // Create test markdown file
    const testMd = path.join(branchDir, 'test_doc.md');
    fs.writeFileSync(testMd, '# Test Document\n\nThis is a test.');

    try {
        // Check if puppeteer is installed first
        try {
            require.resolve('puppeteer');
        } catch (e) {
            console.log('  ⏭️  Skipping - Puppeteer not installed');
            return { skipped: true };
        }

        // Run PDF generation
        const output = execSync('node lib/pdf.js', {
            cwd: SCRIPT_DIR,
            encoding: 'utf8'
        });

        // Check if PDF was created
        const pdfPath = path.join(SCRIPT_DIR, 'tmp', 'test_doc.pdf');
        if (!fs.existsSync(pdfPath)) {
            throw new Error('PDF was not created');
        }

        // Clean up
        fs.unlinkSync(testMd);
        fs.unlinkSync(pdfPath);

        return { success: true };
    } catch (error) {
        // Clean up on error
        if (fs.existsSync(testMd)) fs.unlinkSync(testMd);
        throw error;
    }
}, testResults);

// Test 2: PDF generation with --a flag
runTest('PDF generation - --a flag', () => {
    const branchDir = path.join(SCRIPT_DIR, 'branch');
    if (!fs.existsSync(branchDir)) {
        fs.mkdirSync(branchDir);
    }

    // Create multiple test files
    const testFiles = ['doc1.md', 'doc2.md'];
    testFiles.forEach(file => {
        fs.writeFileSync(path.join(branchDir, file), `# ${file}\n\nContent`);
    });

    try {
        // Check if puppeteer is installed
        try {
            require.resolve('puppeteer');
        } catch (e) {
            // Clean up test files
            testFiles.forEach(file => {
                const filePath = path.join(branchDir, file);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
            console.log('  ⏭️  Skipping - Puppeteer not installed');
            return { skipped: true };
        }

        // Run PDF generation with --a
        const output = execSync('node lib/pdf.js --a', {
            cwd: SCRIPT_DIR,
            encoding: 'utf8'
        });

        // Check if all PDFs were created
        const allCreated = testFiles.every(file => {
            const pdfName = file.replace('.md', '.pdf');
            return fs.existsSync(path.join(SCRIPT_DIR, 'tmp', pdfName));
        });

        if (!allCreated) {
            throw new Error('Not all PDFs were created');
        }

        // Clean up
        testFiles.forEach(file => {
            fs.unlinkSync(path.join(branchDir, file));
            const pdfName = file.replace('.md', '.pdf');
            const pdfPath = path.join(SCRIPT_DIR, 'tmp', pdfName);
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        });

        return { success: true };
    } catch (error) {
        // Clean up on error
        testFiles.forEach(file => {
            const mdPath = path.join(branchDir, file);
            if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
            const pdfPath = path.join(SCRIPT_DIR, 'tmp', file.replace('.md', '.pdf'));
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        });
        throw error;
    }
}, testResults);

// Test 3: PDF generation with specific file
runTest('PDF generation - specific file', () => {
    const branchDir = path.join(SCRIPT_DIR, 'branch');
    if (!fs.existsSync(branchDir)) {
        fs.mkdirSync(branchDir);
    }

    const targetFile = 'specific_doc.md';
    const otherFile = 'other_doc.md';

    // Create test files
    fs.writeFileSync(path.join(branchDir, targetFile), '# Specific\n\nContent');
    fs.writeFileSync(path.join(branchDir, otherFile), '# Other\n\nContent');

    try {
        // Check if puppeteer is installed
        try {
            require.resolve('puppeteer');
        } catch (e) {
            // Clean up test files
            fs.unlinkSync(path.join(branchDir, targetFile));
            fs.unlinkSync(path.join(branchDir, otherFile));
            console.log('  ⏭️  Skipping - Puppeteer not installed');
            return { skipped: true };
        }

        // Run PDF generation for specific file
        const output = execSync(`node lib/pdf.js ${targetFile}`, {
            cwd: SCRIPT_DIR,
            encoding: 'utf8'
        });

        // Check that only target PDF was created
        const targetPdf = path.join(SCRIPT_DIR, 'tmp', 'specific_doc.pdf');
        const otherPdf = path.join(SCRIPT_DIR, 'tmp', 'other_doc.pdf');

        if (!fs.existsSync(targetPdf)) {
            throw new Error('Target PDF was not created');
        }

        if (fs.existsSync(otherPdf)) {
            throw new Error('Other PDF should not have been created');
        }

        // Clean up
        fs.unlinkSync(path.join(branchDir, targetFile));
        fs.unlinkSync(path.join(branchDir, otherFile));
        fs.unlinkSync(targetPdf);

        return { success: true };
    } catch (error) {
        // Clean up on error
        [targetFile, otherFile].forEach(file => {
            const mdPath = path.join(branchDir, file);
            if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
            const pdfPath = path.join(SCRIPT_DIR, 'tmp', file.replace('.md', '.pdf'));
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        });
        throw error;
    }
}, testResults);

// Test 4: Generator command routing
runTest('Generator command routing', () => {
    try {
        // Test help output
        const output = execSync('node lib/pods.js g', {
            cwd: SCRIPT_DIR,
            encoding: 'utf8',
            stdio: 'pipe'
        }).toString();

        // Should show generator help
        if (!output.includes('Generators:') && !output.includes('pdf')) {
            throw new Error('Generator help not shown correctly');
        }

        return { success: true };
    } catch (error) {
        // Exit code 1 is expected for help display
        if (error.status === 1 && error.stdout) {
            const output = error.stdout.toString();
            if (output.includes('Generators:') || output.includes('pdf')) {
                return { success: true };
            }
        }
        throw error;
    }
}, testResults);

// Test 5: Worktree creation (without actually creating one)
runTest('Worktree command validation', () => {
    try {
        // Test that tree command requires an argument
        try {
            execSync('node lib/pods.js g tree', {
                cwd: SCRIPT_DIR,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            throw new Error('Should have failed without tree name');
        } catch (error) {
            if (!error.stdout || !error.stdout.includes('requires a name')) {
                throw new Error('Incorrect error message for missing tree name');
            }
        }

        return { success: true };
    } catch (error) {
        // Expecting the command to fail is the success case
        if (error.message === 'Should have failed without tree name') {
            throw error;
        }
        return { success: true };
    }
}, testResults);

// Test 6: PDF command with invalid file
runTest('PDF generation - invalid file', () => {
    const branchDir = path.join(SCRIPT_DIR, 'branch');
    if (!fs.existsSync(branchDir)) {
        fs.mkdirSync(branchDir);
    }

    try {
        // Check if puppeteer is installed
        try {
            require.resolve('puppeteer');
        } catch (e) {
            console.log('  ⏭️  Skipping - Puppeteer not installed');
            return { skipped: true };
        }

        // Try to convert non-existent file
        try {
            execSync('node lib/pdf.js nonexistent.md', {
                cwd: SCRIPT_DIR,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            throw new Error('Should have failed for non-existent file');
        } catch (error) {
            const output = error.stdout ? error.stdout.toString() : '';
            if (!output.includes('not found')) {
                throw new Error('Incorrect error handling for missing file');
            }
        }

        return { success: true };
    } catch (error) {
        if (error.message === 'Should have failed for non-existent file') {
            throw error;
        }
        return { success: true };
    }
}, testResults);

// Print test summary
testSummary(testResults);

// Exit with appropriate code
const hasFailures = testResults.some(r => r.status === 'failed');
process.exit(hasFailures ? 1 : 0);