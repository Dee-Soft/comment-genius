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