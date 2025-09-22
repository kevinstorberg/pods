#!/usr/bin/env node

/**
 * PODs Initialization Script
 * This script starts project setup with the Admin role
 */

const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

// Get script directory
const SCRIPT_DIR = path.resolve(__dirname, '..');

console.log('🚀 Starting PODs project initialization...');
console.log('');
console.log('The Admin will help you configure:');
console.log('  • Business context and company details');
console.log('  • Technical stack and constraints');
console.log('  • Customer personas and requirements');
console.log('  • Project scope and limitations');
console.log('');
console.log('Once your AI editor starts, the Admin will guide you through setup.');
console.log('');

// Launch the admin role to configure the project
const podsMainPath = path.join(SCRIPT_DIR, 'lib', 'pods.js');

const adminProcess = spawn('node', [podsMainPath, 'admin'], {
    stdio: 'inherit',
    shell: os.platform() === 'win32'
});

adminProcess.on('exit', (code) => {
    process.exit(code || 0);
});

adminProcess.on('error', (err) => {
    console.error('Error launching admin role:', err.message);
    process.exit(1);
});