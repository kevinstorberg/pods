/**
 * Centralized role mappings for PODs framework
 * This module exports the mappings between role abbreviations and full names
 * Used by both the role launcher and test suites
 */

// Map of abbreviations to full role names
const roleFullNames = {
    'ad': 'admin',
    'an': 'analyst',
    'ar': 'architect',
    'de': 'designer',
    'dv': 'devops_engineer',
    'em': 'engineering_manager',
    'fe': 'fullstack_engineer',
    'pm': 'product_manager',
    'qe': 'qa_engineer'
};

// Reverse map of full names to abbreviations
const roleAbbreviations = {
    'admin': 'ad',
    'analyst': 'an',
    'architect': 'ar',
    'designer': 'de',
    'devops_engineer': 'dv',
    'engineering_manager': 'em',
    'fullstack_engineer': 'fe',
    'product_manager': 'pm',
    'qa_engineer': 'qe'
};

// List of all roles (alphabetized)
const allRoles = [
    'admin',
    'analyst',
    'architect',
    'designer',
    'devops_engineer',
    'engineering_manager',
    'fullstack_engineer',
    'product_manager',
    'qa_engineer'
];

// List of all abbreviations (alphabetized)
const allAbbreviations = ['ad', 'an', 'ar', 'de', 'dv', 'em', 'fe', 'pm', 'qe'];

/**
 * Get the full role name from an abbreviation
 * @param {string} input - Role abbreviation or full name
 * @returns {string} Full role name, or input if not found
 */
function getRoleFullname(input) {
    return roleFullNames[input] || input;
}

/**
 * Get the abbreviation for a role
 * @param {string} role - Full role name
 * @returns {string} Role abbreviation, or empty string if not found
 */
function getRoleAbbreviation(role) {
    return roleAbbreviations[role] || '';
}

/**
 * Get a formatted string of all role abbreviations for help text
 * @returns {string} Comma-separated list of abbreviations
 */
function getRoleHelpText() {
    return allAbbreviations.join(', ');
}

/**
 * Check if a role exists (by abbreviation or full name)
 * @param {string} role - Role to check
 * @returns {boolean} True if role exists
 */
function roleExists(role) {
    return role in roleFullNames || role in roleAbbreviations;
}

module.exports = {
    roleFullNames,
    roleAbbreviations,
    allRoles,
    allAbbreviations,
    getRoleFullname,
    getRoleAbbreviation,
    getRoleHelpText,
    roleExists
};