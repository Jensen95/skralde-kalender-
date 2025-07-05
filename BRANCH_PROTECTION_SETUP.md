# Branch Protection Rules Setup for Dependabot Auto-Merge

## Why Branch Protection Rules Are Needed

GitHub's auto-merge feature requires branch protection rules to be enabled. Without these rules, the auto-merge will fail even after the workflow enables it.

## Required Branch Protection Settings

### Via GitHub Web Interface

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub
   - Click on "Settings" tab
   - Click on "Branches" in the left sidebar

2. **Add Branch Protection Rule**
   - Click "Add rule"
   - Branch name pattern: `main` (or your default branch)

3. **Required Settings for Auto-Merge**
   
   **✅ Require status checks to pass before merging**
   - Check this box
   - Search for and select: `Test & Build` (from your CI workflow)
   - ✅ Require branches to be up to date before merging

   **✅ Require pull request reviews before merging**
   - Check this box
   - Required approving reviews: `0` (since Dependabot workflow auto-approves)
   - ✅ Dismiss stale reviews when new commits are pushed

   **Optional but Recommended:**
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators (applies rules to admins too)

4. **Save Changes**
   - Click "Create" or "Save changes"

### Via GitHub CLI (Alternative Method)

```bash
# Enable branch protection with required status checks
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Test & Build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":0,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## Verification

After setting up branch protection rules:

1. **Check if rules are active:**
   ```bash
   gh api repos/:owner/:repo/branches/main/protection
   ```

2. **Test with a new Dependabot PR:**
   - Wait for the next Dependabot PR
   - Verify that "Auto-merge enabled" appears on the PR
   - Verify that the PR shows "Merging is blocked" until CI passes
   - Verify that PR merges automatically after CI passes

## Common Issues and Solutions

### Issue: "Auto-merge is not available"
**Solution:** Ensure branch protection rules are enabled with required status checks

### Issue: "Required status check is expected"
**Solution:** Make sure the status check name exactly matches your CI workflow job name (`Test & Build`)

### Issue: "Pull request reviews are required"
**Solution:** Set required approving reviews to `0` since Dependabot workflow handles approval

## Branch Protection Rule Summary

Here's what your branch protection rule should look like:

```yaml
Branch: main
Required status checks:
  - Test & Build ✅
  - Require branches to be up to date ✅
Required pull request reviews:
  - Required approving reviews: 0 ✅
  - Dismiss stale reviews: true ✅
Restrictions: None
Include administrators: true (recommended)
```

## Testing the Setup

1. Create a test PR or wait for next Dependabot PR
2. Verify the following sequence:
   - PR is created
   - Dependabot workflow runs and approves PR
   - Auto-merge is enabled
   - CI workflow runs
   - PR shows "Merging is blocked" until CI passes
   - PR merges automatically when CI passes

## Need Help?

If you encounter issues:
1. Check that status check names match exactly
2. Verify branch protection rules are applied to the correct branch
3. Ensure the CI workflow is triggered on pull requests
4. Check that the Dependabot workflow has proper permissions