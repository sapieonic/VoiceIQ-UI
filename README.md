# VoiceIQ-UI

Web interface for VoiceIQ - an AI-powered voice agent platform. Built with React, TypeScript, and Vite.

## Features

- **AI Voice Agents** - Configure and manage different voice agent personas
- **Outbound Calling** - Initiate AI-powered calls to any phone number
- **Call History** - Track call history with recording playback
- **Multi-language Support** - English, Hindi, Kannada, Telugu
- **Firebase Authentication** - Secure access with Google Sign-in and Email/Password

## Tech Stack

- React 19
- TypeScript
- Vite
- Firebase Authentication
- Grafana Faro (Frontend Observability)

## Prerequisites

- Node.js 18+
- Firebase project with Authentication enabled
- Backend services running (Call-Mediator on port 4000)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration values.

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Project Settings** > **Your Apps** > **Web App**
4. Copy the Firebase config values to your `.env` file
5. Enable Authentication providers:
   - Go to **Authentication** > **Sign-in method**
   - Enable **Email/Password**
   - Enable **Google** provider
   - Add your domain to **Authorized domains** (e.g., `localhost` for development)

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL (default: `http://localhost:4000`) |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | No | Firebase app ID |
| `VITE_FARO_COLLECTOR_URL` | No | Grafana Faro collector URL |

## Authentication

The app uses Firebase Authentication with the following features:

- **Email/Password Sign Up** - Create account with email and password
- **Email/Password Sign In** - Sign in with existing credentials
- **Google Sign In** - One-click sign in with Google account
- **Password Reset** - Send password reset email
- **Persistent Sessions** - Stay signed in across browser sessions

### Authentication Flow

1. User visits the app
2. If not authenticated, the login page is shown
3. User can sign in with email/password or Google
4. After authentication, the main app is displayed
5. User info and logout button shown in header

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthPage.tsx     # Login/Signup page
│   ├── CallingAgent.tsx # Main calling interface
│   └── ChatAgent.tsx    # Chat interface
├── config/              # Configuration files
│   ├── agents/          # Individual agent configurations
│   ├── agentConfig.ts   # Agent config exports
│   └── types.ts         # TypeScript types
├── context/             # React contexts
│   └── AuthContext.tsx  # Authentication state
├── firebase/            # Firebase setup
│   ├── config.ts        # Firebase initialization
│   └── auth.ts          # Auth helper functions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── telemetry.ts         # Grafana Faro setup
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Docker

The app includes a Dockerfile for containerized deployment:

```bash
docker build -t voiceiq-ui .
docker run -p 5000:5000 voiceiq-ui
```

## Related Services

- **MagicVoice** (Port 3000) - Core voice engine
- **Call-Mediator** (Port 4000) - API gateway

See the main [VoiceIQ README](../README.md) for full platform documentation.
