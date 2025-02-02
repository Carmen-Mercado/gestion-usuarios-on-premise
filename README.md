# gestion-usuarios-on-premise

## Getting Started

### Prerequisites

1. Node.js (v18 or later)
2. Firebase CLI - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

### Initial Setup

1. Clone and install dependencies:
   ```bash
   git clone <repository-url>
   cd gestion-usuarios-on-premise
   ```

2. Setup Functions:
   ```bash
   cd functions
   npm install
   ```

3. Login to Firebase:
   ```bash
   firebase login
   ```

4. Initialize Firebase project:
   ```bash
   firebase init
   ```
   - Select "Functions" when prompted
   - Choose to use an existing project or create a new one
   - Select TypeScript
   - Say NO to overwriting existing files

### Running the Project

1. Make sure you're in the functions directory:
   ```bash
   cd functions  # Skip if you're already in the functions directory
   ```

2. Build and start the local development server:
   ```bash
   npm run build
   npm run serve
   ```

3. Access the API endpoint at:
   ```
   http://localhost:5001/<your-project-id>/<region>/api/hello
   ```

## Available Scripts

In the `functions` directory:

- `npm run build` - Build the TypeScript code
- `npm run serve` - Run the Firebase emulator locally
- `npm run deploy` - Deploy to Firebase
- `npm run logs` - View Firebase function logs

## API Endpoints

### GET /api/hello
- **Description**: Test endpoint that returns a greeting message
- **Response**: `{ "message": "Hello from Firebase Functions!" }`

## Features

- TypeScript with strict mode enabled
- ES modules support
- Express.js for HTTP request handling
- Basic request logging
- Local development with emulators
- Streamlined deployment process

## Dependencies

Main dependencies:
- `firebase-functions`: ^4.3.1
- `firebase-admin`: ^11.8.0
- `express`: ^4.18.2

Dev dependencies:
- `typescript`: ^5.0.4
- `@types/express`: ^4.17.17
- `firebase-functions-test`: ^3.1.0

## License

MIT