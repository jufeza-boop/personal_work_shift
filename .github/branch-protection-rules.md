# Branch Protection Rules for `main`

Apply these repository settings manually in GitHub because the current environment does not have an authenticated admin CLI configured.

## Recommended rules

- Require a pull request before merging
- Require at least 1 approval
- Dismiss stale approvals when new commits are pushed
- Require conversation resolution before merging
- Require status checks to pass before merging
- Required checks: `quality`
- Require linear history
- Do not allow force pushes
- Do not allow deletions

## Repository settings to pair with protection

- Enable Actions permissions for workflows to read repository contents
- Add Vercel secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Set the default branch to `main`
