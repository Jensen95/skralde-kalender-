# GitHub Actions CI/CD Setup

This repository is configured with a comprehensive GitHub Actions pipeline that includes:

## 🔄 CI Pipeline (Pull Requests)

**Workflow**: `.github/workflows/ci.yml`

Triggers on:
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

Steps:
1. **Type Check** - Validates TypeScript types
2. **Format Check** - Prettier code formatting validation
3. **Lint** - ESLint code quality checks (flat config)
4. **Test** - Runs Vitest test suite
5. **Build** - Compiles TypeScript
6. **Coverage Upload** - Uploads test coverage artifacts

## 🚀 Deployment Pipeline (Main Branch)

**Workflow**: `.github/workflows/deploy.yml`

Triggers on:
- Push to `main` branch
- Manual workflow dispatch

Steps:
1. Runs all CI checks (type-check, format-check, lint, test, build)
2. Deploys to Cloudflare Workers production environment
3. Notifies deployment status

## 🤖 Dependabot Auto-Merge

**Configuration**: `.github/dependabot.yml`
**Workflow**: `.github/workflows/dependabot-auto-merge.yml`

Features:
- Weekly dependency updates (Mondays at 4 AM)
- Automatic approval for minor/patch updates
- Auto-merge when all CI tests pass
- Separate handling for npm and GitHub Actions dependencies

## 🔧 Required Secrets

Add these secrets to your GitHub repository:

### Cloudflare Secrets
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

### Getting Cloudflare Credentials

#### API Token
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" with these permissions:
   - Account: Cloudflare Workers:Edit
   - Zone: Zone:Read (if using custom domains)
   - Zone Resources: Include All zones

#### Account ID
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain/account
3. Copy the Account ID from the right sidebar

## 📋 Setup Checklist

- [ ] Install new dependencies: `npm install`
- [ ] Update `wrangler.toml` with your actual database IDs
- [ ] Set up Cloudflare secrets in GitHub
- [ ] Update email destination in `wrangler.toml`
- [ ] Remove the old `.eslintrc.js` file (replaced by `eslint.config.js`)
- [ ] Run `npm run check` to verify all tools work correctly
- [ ] Test the pipeline with a pull request
- [ ] Verify deployment works manually

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format

# Type check
npm run type-check

# Run all checks (type-check + lint + format)
npm run check

# Build for production
npm run build
```

## 📊 Workflow Status Badges

Add these to your README:

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Deploy](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml)
```

## 🔒 Branch Protection

Recommended branch protection rules for `main`:

1. Go to Settings → Branches → Add rule
2. Configure:
   - Require a pull request before merging
   - Require status checks to pass before merging
   - Required status checks: `Test & Build`
   - Require branches to be up to date before merging
   - Restrict pushes that create files larger than 100MB

## 🎯 Manual Triggers

Both workflows support manual triggers:

1. Go to Actions tab in your repository
2. Select the workflow (CI or Deploy)
3. Click "Run workflow"
4. Choose branch and run

## 🔄 Chanfana & Hono Integration

The project now uses:
- **Hono** - Fast web framework for Cloudflare Workers
- **Chanfana** - OpenAPI documentation generator for Hono

New endpoints:
- `/docs` - Interactive API documentation (Swagger UI)
- `/openapi.json` - OpenAPI schema

## 🎨 Code Quality & Formatting

The project uses modern tooling for code quality:

### ESLint (Flat Config)
- **Configuration**: `eslint.config.js` (new flat config format)
- **Features**: TypeScript support, Prettier integration
- **Rules**: Strict TypeScript rules with sensible defaults

### Prettier
- **Configuration**: `.prettierrc`
- **Features**: Automatic code formatting
- **Integration**: ESLint reports formatting issues as errors

### Pre-commit Checks
All workflows check:
1. TypeScript compilation
2. Code formatting (Prettier)
3. Linting rules (ESLint)
4. Test coverage

## 🚨 Troubleshooting

### Deployment fails
- Check Cloudflare secrets are correctly set
- Verify database IDs in wrangler.toml
- Check Cloudflare account permissions

### Tests fail
- Run tests locally: `npm run test`
- Check for missing dependencies: `npm install`
- Verify TypeScript configuration

### Linting errors
- Run locally: `npm run lint`
- Auto-fix: `npm run lint:fix`
- Check ESLint configuration in `eslint.config.js`

### Formatting errors
- Run locally: `npm run format:check`
- Auto-fix: `npm run format`
- Check Prettier configuration in `.prettierrc`
- Run all checks: `npm run check`