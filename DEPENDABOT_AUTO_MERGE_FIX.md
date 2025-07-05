# Dependabot Auto-Merge Fix

## Issue
The Dependabot auto-merge workflow was failing on checks even though the CI tests were passing.

## Root Cause
The issue was in the `wait-for-checks` job in `.github/workflows/dependabot-auto-merge.yml`. The workflow was checking for "check runs" using `github.rest.checks.listForRef()`, but GitHub Actions workflows create "status checks" instead of "check runs".

There are two different types of checks in GitHub:
1. **Check runs** - Created by GitHub Apps
2. **Status checks** - Created by GitHub Actions workflows

The auto-merge workflow was only checking for check runs, so it never detected the CI workflow's status checks.

## Solution
Removed the problematic `wait-for-checks` job entirely. GitHub's built-in auto-merge feature automatically waits for all required status checks to pass before merging a PR.

## Changes Made
1. Removed the `wait-for-checks` job from the workflow
2. Added a comment explaining that GitHub's auto-merge handles the waiting automatically
3. The workflow now simply:
   - Approves minor and patch updates
   - Enables auto-merge
   - Lets GitHub handle the rest

## How It Works Now
1. Dependabot creates a PR
2. The workflow auto-approves minor/patch updates
3. The workflow enables auto-merge with `gh pr merge --auto --squash`
4. GitHub automatically waits for all required checks (CI workflow) to pass
5. Once all checks pass, GitHub automatically merges the PR

## Testing
To test this fix:
1. Wait for the next Dependabot PR
2. Verify that the auto-merge is enabled
3. Verify that the PR merges automatically after CI passes

## Additional Notes
- The fix is more robust because it relies on GitHub's native auto-merge behavior
- No more custom polling logic that could fail
- Simpler workflow that's easier to maintain
- Works with both check runs and status checks automatically