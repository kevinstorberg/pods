/**
 * Git Commands Library
 * Handles git workflow integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function handleGitCommands(args) {
    if (args.length === 0) {
        console.log('Usage: pods g <command> [args...]');
        console.log('');
        console.log('Git commands:');
        console.log('  tree <name>    Create git worktree and switch to it');
        console.log('');
        console.log('Examples:');
        console.log('  pods g tree auth        # Create worktree for \'auth\' feature');
        console.log('  pods g tree user-login  # Create worktree for \'user-login\' feature');
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
        default:
            console.error(`Unknown git command: ${command}`);
            process.exit(1);
    }
}

async function createWorktree(treeName) {
    console.log(`🌳 Creating git worktree: ${treeName}`);

    try {
        // Create the worktree
        const worktreePath = path.join('..', treeName);
        execSync(`git worktree add "${worktreePath}" HEAD`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        console.log(`✅ Worktree created at ${worktreePath}`);

        // Copy all .env files from original directory to worktree
        console.log('📄 Copying .env files...');
        let envCount = 0;

        // Function to find .env files recursively
        function findEnvFiles(dir, basePath = '') {
            const files = [];
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const itemPath = path.join(dir, item);
                const relativePath = path.join(basePath, item);

                // Skip the new worktree directory
                if (itemPath === path.resolve('..', treeName)) {
                    continue;
                }

                const stat = fs.statSync(itemPath);

                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    // Recursively search subdirectories
                    files.push(...findEnvFiles(itemPath, relativePath));
                } else if (stat.isFile() && item.startsWith('.env')) {
                    files.push({
                        source: itemPath,
                        relative: relativePath
                    });
                }
            }

            return files;
        }

        // Find and copy .env files
        const envFiles = findEnvFiles('..');

        for (const envFile of envFiles) {
            const targetPath = path.join('..', treeName, envFile.relative);
            const targetDir = path.dirname(targetPath);

            // Create target directory if it doesn't exist
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // Copy the .env file
            fs.copyFileSync(envFile.source, targetPath);
            console.log(`  ✅ Copied: ${envFile.relative}`);
            envCount++;
        }

        if (envCount === 0) {
            console.log('  📝 No .env files found to copy');
        } else {
            console.log(`  📊 Copied ${envCount} .env file(s)`);
        }

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

module.exports = { handleGitCommands };