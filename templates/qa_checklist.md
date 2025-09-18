# QA Checklist Template

{{include:templates/shared/document_header.md}}

## Test Information
- **Checklist ID**: {{CHECKLIST_ID}}
- **Feature/Story**: {{FEATURE_STORY}}
- **QA Engineer**: {{QA_ENGINEER}}
- **Build Version**: {{BUILD_VERSION}}
- **Environment**: {{TEST_ENVIRONMENT}}

## Pre-Testing Setup
- [ ] Test environment is available and stable
- [ ] Test data is prepared and loaded
- [ ] Required user accounts/permissions are set up
- [ ] Testing tools are configured and ready
- [ ] Feature deployment is confirmed
- [ ] Dependencies are verified and working

## Functional Testing
### Core Functionality
- [ ] {{CORE_FUNCTION_1}}
- [ ] {{CORE_FUNCTION_2}}
- [ ] {{CORE_FUNCTION_3}}
- [ ] {{CORE_FUNCTION_4}}

### User Interface Testing
- [ ] All UI elements are present and correctly positioned
- [ ] Navigation flows work as expected
- [ ] Form validations work correctly
- [ ] Error messages are clear and helpful
- [ ] Success messages are displayed appropriately
- [ ] Loading states and indicators work properly

### Data Validation
- [ ] Data input validation works correctly
- [ ] Data is saved/retrieved accurately
- [ ] Data integrity is maintained
- [ ] Data transformations are correct
- [ ] Database constraints are enforced

### Integration Testing
- [ ] API integrations work correctly
- [ ] Third-party service integrations function
- [ ] Data flow between systems is accurate
- [ ] External dependencies are handled properly
- [ ] Error handling for failed integrations works

## Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (if applicable)

## Responsive/Mobile Testing
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] Touch interactions work properly
- [ ] Mobile-specific features function correctly

## Performance Testing
- [ ] Page load times are acceptable (< {{LOAD_TIME_TARGET}})
- [ ] API response times are within limits (< {{API_RESPONSE_TARGET}})
- [ ] Large data sets are handled efficiently
- [ ] Memory usage is reasonable
- [ ] No performance degradation with extended use

## Security Testing
- [ ] Authentication works correctly
- [ ] Authorization prevents unauthorized access
- [ ] Input sanitization prevents injection attacks
- [ ] Sensitive data is properly protected
- [ ] Session management is secure
- [ ] HTTPS is enforced where required

## Accessibility Testing
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG standards
- [ ] Alt text provided for images
- [ ] Form labels are properly associated
- [ ] Focus indicators are visible

## Error Handling
- [ ] Invalid input is handled gracefully
- [ ] Network errors are handled appropriately
- [ ] Server errors display user-friendly messages
- [ ] 404 errors are handled properly
- [ ] Timeout scenarios are managed correctly
- [ ] Recovery from errors is possible

## Edge Cases & Boundary Testing
- [ ] {{EDGE_CASE_1}}
- [ ] {{EDGE_CASE_2}}
- [ ] {{EDGE_CASE_3}}
- [ ] Minimum/maximum input values tested
- [ ] Empty state scenarios tested
- [ ] Large data volume scenarios tested

## Regression Testing
- [ ] Existing functionality still works
- [ ] No new bugs introduced in related areas
- [ ] Previously fixed bugs remain fixed
- [ ] Core user workflows are unaffected

## User Acceptance Criteria
- [ ] {{ACCEPTANCE_CRITERIA_1}}
- [ ] {{ACCEPTANCE_CRITERIA_2}}
- [ ] {{ACCEPTANCE_CRITERIA_3}}
- [ ] {{ACCEPTANCE_CRITERIA_4}}

## Documentation & Help
- [ ] Help text is accurate and helpful
- [ ] Documentation is updated
- [ ] Tooltips/hints are correct
- [ ] Error messages provide actionable guidance

## Final Validation
- [ ] All test cases executed
- [ ] All critical bugs resolved
- [ ] All medium bugs reviewed and accepted/resolved
- [ ] Performance meets requirements
- [ ] Security requirements satisfied
- [ ] Accessibility standards met
- [ ] Stakeholder approval obtained

## Test Results Summary
### Passed Tests
{{PASSED_TESTS}}

### Failed Tests
{{FAILED_TESTS}}

### Blocked Tests
{{BLOCKED_TESTS}}

### Notes & Observations
{{NOTES_OBSERVATIONS}}

## Sign-off
- **QA Engineer**: {{QA_SIGN_OFF}}
- **Date**: {{QA_SIGN_OFF_DATE}}
- **Status**: {{FINAL_STATUS}} (Pass/Fail/Conditional Pass)
- **Recommendation**: {{RECOMMENDATION}}