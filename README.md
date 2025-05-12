# Fragments API

Fragments back-end API for managing text and binary data fragments.

## Available Scripts

### `npm run lint`

Run ESLint to check for code quality issues.

```
npm run lint
```

### `npm start`

Start the server normally on port 8080.

```
npm start
```

### `npm run dev`

Start the server with nodemon for development. Auto-restarts on file changes. Runs with debug logging enabled.

```
npm run dev
```

### `npm run debug`

Start the server with debugging enabled on port 9229. Allows attaching a debugger.

```
npm run debug
```

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Environment Variables

- `PORT`: Server port (default: 8080)
- `LOG_LEVEL`: Logging level (default: info)

## API Endpoints

- `GET /`: Health check endpoint

## Development

This project uses:

- Express.js for the web server
- Pino for structured logging
- ESLint for code linting
- Prettier for code formatting
- Nodemon for development auto-restart
