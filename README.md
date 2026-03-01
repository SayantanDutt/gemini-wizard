# Gemini Sandbox Wizard

A production-quality Interactive Security Policy and Sandbox Wizard inspired by Gemini CLI architecture.

## Installation

```bash
npm install
```

## Development

```bash
# Run the wizard in development mode
npm run dev -- init .
```

## Production

```bash
# Build the project
npm run build

# Run the production build
npm start -- init .
```

## Features

- **Interactive TUI**: Built with React Ink.
- **Risk Assessment**: `PolicyEngine` detects dangerous configurations.
- **Strong Typing**: Full TypeScript support with Zod schema validation.
- **Zero Configuration**: Generates `.gemini/policy.json` automatically.

## License

MIT
