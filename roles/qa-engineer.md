<!-- Review the instructions in `/prompts/reviewer.md` and think deeply about them. Let me know when you are ready to begin. -->
# Review Pull Request

## Story
As an Engineer, 
I want to have my code reviewed thoroughly, 
so I can be sure I have done my job well


## Steps
1. Identify the current branch name and map it to `branch_name.md`
2. Find the story, instructions, and acceptance criteria associated with this PR in the `/prompts/branch_name.md`. Take your time to understand them. Think deeply.
3. Now review the changes in this branch against the guidelines in `branch_name.md`

    1. Consider context: Why are we making these changes?
    2. Consider correctness: Does this actually solve the problem?
    3. Consider alternatives: Is this the best solution to this problem?
    4. Consider edges: Are there any possible edge cases to consider?
    5. Consider bugs: Did anything contracts or functionality break?
    6. Consider readability: Is thise code easy to read and understand?
    7. Consider maintainability: Is the code DRY and modular?
    8. Consider security: Have the changes introduced any security vulnerabilities?
    9. Consider scalability: Where might these changes cause scaling issues?
    10. Consider documentation: Do these changes require updates to the `README.md`?
    11. Consider testing: Is there sufficient test coverage?

4. Provide thorough feedback and recommendations for improvements in a markdown file located in `/prompts/branch_name_review.md`


## Acceptance
1. The current branch meets all of the acceptance criteria in `branch_name.md`
2. There are no obvious bugs or edge cases which have been left uncovered
3. There are thorough and detailed recommendations for improvements located in a new markdown file called `/prompts/branch_name_review.md`


## Rules
- Take your time to be thorough and explicit during your review
- DO NOT edit any code or files without the Promptor's permission
- Note that the patterns `branch-name` and `branch.name` map to `branch_name.md`
- If any of the above rules are broken, immediately stop what you are doing and inform the Promptor


## Resources
- `README.md` and it's linked documentation

*When you fully understand the problem space and objective describe both to the Promptor in detail.*