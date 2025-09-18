# Comment Genius 🤖

Automated comment generation and cleanup tool for JavaScript/TypeScript projects.

## Installation

```bash
npm install -g comment-genius
```
## Usage

### Interactive mode
```bash
comment-genius
```

### Generate comments for specific files
```bash
comment-genius --files "src/**/*.ts" --generate
```

### Cleanup garbage comments
```bash
comment-genius --files "src/**/*.ts" --cleanup
```

### Both generate and cleanup
```bash
comment-genius --files "src/**/*.ts" --both
```

## Features
- 📝 Automatic comment generation for functions, classes, methods, properties
- 🧹 Intelligent cleanup of garbage comments
- 🎯 Support for multiple documentation formats (JSDoc, TypeDoc, Documentation.js)
- ⚙️ Configurable through interactive prompts or config file
- 🔄 Backup and restore functionality

## Supported File Types
- JavaScript (.js)
- TypeScript (.ts)
- JSX (.jsx)
- TSX (.tsx)
