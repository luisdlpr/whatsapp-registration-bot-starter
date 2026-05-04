# AGENTS.md - Developer Guidelines for wa-bot-test

## Commands
- **Run app**: `node app.js`
- **Test**: No test framework configured (npm test is not implemented)
- **Lint/Format**: No linter or formatter configured

## Code Style
- **Language**: JavaScript (Node.js) with ES Modules (type: module in package.json)
- **Imports**: Use `import/export` syntax, include `.js` extension in imports (e.g., `import { deps } from "./deps.js"`)
- **Dependencies**: Express.js for server, check package.json before adding new dependencies
- **Environment Variables**: Accessed via `process.env`, validated in deps.js using `checkEnv()`
- **Error Handling**: Use HTTP status codes (200, 403), log errors/warnings with console
- **Naming**: camelCase for variables/functions (e.g., `verifyToken`, `checkEnv`)
- **Formatting**: 2-space indentation, double quotes for strings
- **Comments**: Use `//` for single-line comments to explain logic

## Architecture
- **app.js**: Main Express server with webhook verification (GET) and webhook handler (POST)
- **deps.js**: Environment variable management and validation
- **lib.js**: Utility functions (e.g., `sendMessage` for WhatsApp API calls)
- **Port**: Default 3000, configurable via PORT env var
