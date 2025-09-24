/**
 * Generators Library
 * Handles various generation commands (worktrees, PDFs, etc.)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function handleGenerators(args) {
    if (args.length === 0) {
        console.log('Usage: pods g <generator> [args...]');
        console.log('');
        console.log('Generators:');
        console.log('  tree <name>           Create git worktree and switch to it');
        console.log('  pdf [--a|filename]    Convert deliverables to PDF');
        console.log('');
        console.log('Examples:');
        console.log('  pods g tree auth                # Create worktree for \'auth\' feature');
        console.log('  pods g tree user-login          # Create worktree for \'user-login\' feature');
        console.log('  pods g pdf --a                  # Convert all deliverables to PDF');
        console.log('  pods g pdf requirements_doc.md  # Convert specific file to PDF');
        process.exit(1);
    }

    const command = args[0];

    switch (command) {
        case 'tree':
            if (!args[1]) {
                console.error('Error: tree command requires a name');
                console.log('Usage: pods g tree <name>');
                console.log('   or: source <(pods g tree <name>)  # To change directory');
                process.exit(1);
            }
            await createWorktree(args[1]);
            break;
        case 'pdf':
            await generatePDFs(args.slice(1));
            break;
        default:
            console.error(`Unknown generator: ${command}`);
            process.exit(1);
    }
}

async function createWorktree(treeName) {
    console.log(`🌳 Creating git worktree: ${treeName}`);

    try {
        // Create the worktree with a new branch
        const worktreePath = path.join('..', treeName);
        execSync(`git worktree add -b ${treeName} "${worktreePath}" HEAD`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        console.log(`✅ Worktree created at ${worktreePath}`);
        console.log('');
        console.log('📝 To switch to the worktree, run:');
        console.log(`   cd ../${treeName}`);
        console.log('');
        console.log('Then launch PODs roles from the worktree:');
        console.log(`   ../pods/bin/pods pm  # Launch Product Manager`);
        console.log(`   ../pods/bin/pods fe  # Launch Fullstack Engineer`);

        // Install dependencies if package.json exists
        const sourcePackageJson = path.join('..', 'package.json');
        const targetPackageJson = path.join('..', treeName, 'package.json');

        if (fs.existsSync(targetPackageJson)) {
            console.log('');
            console.log('📦 Remember to install dependencies in the worktree:');
            console.log(`   cd ../${treeName} && npm install`);
        }

    } catch (error) {
        console.error('❌ Failed to create worktree:', error.message);

        // Check if it's because the worktree already exists
        if (error.message.includes('already exists')) {
            console.log('');
            console.log('ℹ️  Worktree already exists. To remove it:');
            console.log(`   git worktree remove ../${treeName}`);
        }

        process.exit(1);
    }
}

async function generatePDFs(args = []) {
    // Show help if requested
    if (args[0] === '--help' || args[0] === '-h') {
        console.log('Usage: pods g pdf [options]');
        console.log('');
        console.log('Options:');
        console.log('  --a            Convert all markdown files in /branch');
        console.log('  <filename>     Convert specific file (e.g., requirements_doc.md)');
        console.log('');
        console.log('Examples:');
        console.log('  pods g pdf --a                  # Convert all files');
        console.log('  pods g pdf requirements_doc.md  # Convert specific file');
        console.log('  pods g pdf architecture_spec    # Convert specific file (no .md needed)');
        return;
    }

    console.log('📄 Converting deliverables to PDF...');
    console.log('');

    // Check if dependencies are installed
    try {
        require.resolve('puppeteer');
        require.resolve('marked');
    } catch (e) {
        console.log('Installing PDF dependencies...');
        execSync('npm install', {
            cwd: path.resolve(__dirname, '..'),
            stdio: 'inherit'
        });
    }

    // Import and run the PDF conversion
    const { convertToPDF } = require('./pdf.js');
    await convertToPDF(args);
}

module.exports = { handleGenerators };