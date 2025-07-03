# Enhanced ESLint & Prettier Configuration

This project uses a modern, comprehensive code quality setup with the latest ESLint flat config format and powerful plugins for maintaining high code standards.

## 🔧 Configuration Files

### ESLint Configuration
- **File**: `eslint.config.mjs` (ES Module format)
- **Type**: Flat Config (ESLint 9+)
- **Extends**: Recommended configs + TypeScript + Prettier integration

### Prettier Configuration
- **File**: `.prettierrc`
- **Features**: No semicolons, package.json sorting, modern formatting

## 📦 Plugins & Dependencies

### ESLint Plugins
```json
{
  "eslint": "^9.0.0",
  "typescript-eslint": "^8.0.0",
  "eslint-plugin-unicorn": "^52.0.0",
  "eslint-plugin-import": "^2.29.0",
  "eslint-plugin-simple-import-sort": "^12.0.0",
  "globals": "^14.0.0"
}
```

### Prettier Plugins
```json
{
  "prettier": "^3.2.0",
  "prettier-plugin-packagejson": "^2.4.0"
}
```

## ⚡ Key Features

### 1. **Modern JavaScript/TypeScript Rules**
- ✅ Prefer arrow functions over function declarations
- ✅ Consistent type imports (`import type`)
- ✅ Template literals over string concatenation
- ✅ Modern array methods (prefer `find`, `some`, `includes`)
- ✅ Optional catch binding
- ✅ Prefer spread over `apply`

### 2. **Import Organization**
Auto-sorted imports with logical grouping:
1. Side effect imports
2. Node.js builtins
3. External packages
4. Internal packages
5. Parent directory imports
6. Relative imports
7. Type imports (separate)

### 3. **Unicorn Rules (Modern JavaScript)**
- 🚀 Better regex optimization
- 🚀 Prefer native methods (`Number.isNaN`, `String.slice`)
- 🚀 Consistent error handling
- 🚀 Modern DOM APIs when applicable
- 🚀 Filename case enforcement (kebab-case)
- 🚀 No unnecessary loops (prefer array methods)

### 4. **TypeScript Excellence**
- 📝 Consistent interface definitions
- 📝 Type imports separation
- 📝 No unused imports/variables
- 📝 Proper type assertions

### 5. **Cloudflare Workers Optimization**
- 🌐 Proper global definitions for Workers environment
- 🌐 D1 Database types
- 🌐 Web API globals (Request, Response, etc.)
- 🌐 Console logging allowed (needed for debugging)

## 🎨 Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-packagejson"]
}
```

### Benefits:
- **No semicolons** - Cleaner, more modern look
- **Single quotes** - Consistent style
- **Package.json sorting** - Automatic dependency organization
- **100 character line width** - Better readability on modern screens

## 🚀 Available Scripts

```bash
# Type checking
npm run type-check

# Linting
npm run lint           # Check for issues
npm run lint:fix       # Fix auto-fixable issues

# Formatting
npm run format         # Format all files
npm run format:check   # Check formatting without fixing

# Combined check
npm run check          # Run all checks (type + lint + format)
```

## 📋 Specific Rule Highlights

### Arrow Function Enforcement
```typescript
// ❌ Function declaration
export function myFunction() {
  return 'hello'
}

// ✅ Arrow function (preferred)
export const myFunction = () => {
  return 'hello'
}
```

### Import Sorting
```typescript
// ✅ Auto-sorted imports
import { someFunction } from 'external-package'

import { localFunction } from './local-file'
import { parentFunction } from '../parent'

import type { SomeType } from './types'
```

### Modern JavaScript
```typescript
// ❌ Old style
if (isNaN(value)) { }
const text = 'Hello ' + name

// ✅ Modern style (auto-fixed)
if (Number.isNaN(value)) { }
const text = `Hello ${name}`
```

### Better Regex
```typescript
// ❌ Less optimal
/[a-zA-Z0-9]/g

// ✅ Optimized (auto-suggested)
/[\dA-Za-z]/g
```

## 🔒 Environment-Specific Rules

### Test Files (`**/*.test.ts`, `**/*.spec.ts`)
- Relaxed `@typescript-eslint/no-explicit-any`
- Disabled `unicorn/consistent-function-scoping`
- Allow `null` usage

### Config Files
- Allow CommonJS patterns when needed
- Relaxed module preferences

## 🎯 Best Practices Enforced

1. **Error Handling**
   - Consistent error naming
   - Proper error types
   - Modern error patterns

2. **Performance**
   - Prefer native methods
   - Avoid unnecessary regex
   - Efficient array operations

3. **Readability**
   - Consistent naming conventions
   - Clear function expressions
   - Organized imports

4. **Maintainability**
   - Type safety
   - No unused code
   - Consistent patterns

## 🔧 Customization

To adjust rules, edit `eslint.config.mjs`:

```javascript
export default tseslint.config(
  // ... base configs
  {
    rules: {
      // Override or add custom rules
      'unicorn/prefer-module': 'off', // Example: disable if needed
      'your-custom-rule': 'error',
    },
  }
)
```

## 💡 IDE Integration

### VS Code
Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.experimental.useFlatConfig": true
}
```

### Other IDEs
- **WebStorm/IntelliJ**: Enable ESLint and Prettier in settings
- **Vim/Neovim**: Use appropriate plugins for ESLint and Prettier
- **Emacs**: Configure with lsp-mode or similar

## 🚨 Migration Notes

### From Legacy ESLint Config
- Old `.eslintrc.js` files are ignored
- Flat config provides better performance
- More explicit configuration options

### Breaking Changes
- Some rules are stricter (arrow functions required)
- Import sorting may reorganize existing imports
- Semicolons removed automatically

### Benefits
- Faster linting
- Better TypeScript integration
- More consistent code style
- Future-proof configuration

## 📊 Metrics

This configuration enforces:
- **55+ ESLint rules** for code quality
- **20+ TypeScript-specific rules** for type safety
- **30+ Unicorn rules** for modern JavaScript
- **Import sorting and organization**
- **Consistent formatting** with Prettier

Result: **Higher code quality, better maintainability, modern JavaScript patterns**