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
  "eslint-plugin-perfectionist": "^2.5.0",
  "@vitest/eslint-plugin": "^1.0.0",
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

### 2. **Perfectionist Sorting**
Comprehensive alphabetical sorting for:
- **Imports** - Auto-sorted with logical grouping
- **Named imports/exports** - Alphabetical order
- **Object properties** - Consistent key ordering
- **Interface properties** - Sorted type definitions
- **Object types** - Organized type structures

Import grouping order:
1. Type imports
2. Builtin & external packages
3. Internal packages
4. Parent/sibling/index imports
5. Object imports

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

### 5. **Vitest Test Enhancement**
- 🧪 Vitest-specific rules and best practices
- 🧪 Prefer `test` over `it` for consistency
- 🧪 Use `toStrictEqual` over `toEqual` for better assertions
- 🧪 Detect disabled/focused tests
- 🧪 Enforce consistent test patterns

### 6. **Cloudflare Workers Optimization**
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

### Perfectionist Sorting
```typescript
// ✅ Auto-sorted imports with perfectionist
import { someFunction } from 'external-package'

import { localFunction } from './local-file'

import type { SomeType } from './types'

// ✅ Sorted object properties
const config = {
  apiKey: 'value',
  baseUrl: 'https://api.example.com',
  timeout: 5000,
}

// ✅ Sorted interface properties
interface User {
  email: string
  id: number
  name: string
}
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

### Vitest Test Patterns
```typescript
// ❌ Inconsistent test function
it('should work', () => { })

// ✅ Consistent test function
test('should work', () => { })

// ❌ Loose equality
expect(result).toEqual(expected)

// ✅ Strict equality (auto-fixed)
expect(result).toStrictEqual(expected)
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
- **80+ ESLint rules** for code quality
- **20+ TypeScript-specific rules** for type safety
- **35+ Unicorn rules** for modern JavaScript
- **7+ Perfectionist rules** for comprehensive sorting
- **10+ Vitest rules** for better testing practices
- **Import/export organization**
- **Consistent formatting** with Prettier

Rule categories:
- **Core ESLint**: Base JavaScript rules
- **TypeScript**: Type safety and modern patterns
- **Unicorn**: Modern JavaScript best practices
- **Perfectionist**: Alphabetical sorting everywhere
- **Vitest**: Test consistency and best practices
- **Import**: Module organization
- **Prettier**: Code formatting

Result: **Exceptional code quality, perfect organization, modern patterns, excellent test practices**