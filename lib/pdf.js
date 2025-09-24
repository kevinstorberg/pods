#!/usr/bin/env node

/**
 * Simple PDF converter for PODs deliverables
 */

const puppeteer = require('puppeteer');
const marked = require('marked');
const fs = require('fs');
const path = require('path');

// Get script directory
const SCRIPT_DIR = path.resolve(__dirname, '..');

async function convertToPDF(args = []) {
    const branchDir = path.join(SCRIPT_DIR, 'branch');
    const outputDir = path.join(SCRIPT_DIR, 'tmp');

    let files = [];

    // Parse arguments
    if (args.length === 0 || args[0] === '--a') {
        // Convert all files
        files = fs.readdirSync(branchDir).filter(f => f.endsWith('.md'));

        if (files.length === 0) {
            console.log('No markdown files found in /branch directory');
            return;
        }

        console.log(`Found ${files.length} markdown files to convert`);
    } else {
        // Convert specific file
        let filename = args[0];

        // Add .md extension if not present
        if (!filename.endsWith('.md')) {
            filename += '.md';
        }

        // Check if file exists
        if (!fs.existsSync(path.join(branchDir, filename))) {
            console.error(`Error: File '${filename}' not found in /branch directory`);
            console.log('\nAvailable files:');
            const availableFiles = fs.readdirSync(branchDir).filter(f => f.endsWith('.md'));
            availableFiles.forEach(f => console.log(`  • ${f}`));
            return;
        }

        files = [filename];
        console.log(`Converting ${filename} to PDF`);
    }

    // Launch browser once
    const browser = await puppeteer.launch({ headless: 'new' });

    for (const file of files) {
        const inputPath = path.join(branchDir, file);
        const outputPath = path.join(outputDir, file.replace('.md', '.pdf'));

        console.log(`Converting ${file}...`);

        // Read markdown
        const markdown = fs.readFileSync(inputPath, 'utf8');

        // Convert to HTML
        const html = marked.parse(markdown);

        // Create full HTML document
        const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1 { color: #333; border-bottom: 2px solid #333; }
                h2 { color: #555; margin-top: 30px; }
                h3 { color: #666; }
                code { background: #f4f4f4; padding: 2px 4px; }
                pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
                blockquote { border-left: 4px solid #ccc; padding-left: 20px; color: #666; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f4f4f4; }
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>`;

        // Create page and generate PDF
        const page = await browser.newPage();
        await page.setContent(fullHTML);
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        await page.close();

        console.log(`✅ Created ${file.replace('.md', '.pdf')}`);
    }

    await browser.close();
    console.log(`\nAll PDFs saved to: ${outputDir}`);
}

// Export for use as module
module.exports = { convertToPDF };

// Run directly if called as script
if (require.main === module) {
    const args = process.argv.slice(2);
    convertToPDF(args).catch(console.error);
}