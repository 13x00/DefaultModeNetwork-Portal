# DMN Lab - Default Mode Network Research Lab

A Next.js application that creates a local scrolling portal for sharing messages in a clean, terminal-inspired interface. Messages are persisted to disk with atomic writes and daily archiving.

## Features

- **Local File Persistence**: Messages stored in `data/messages.json` with atomic writes
- **Daily Archiving**: Older messages automatically moved to `data/archive/YYYY-MM-DD.json`
- **Wall Street Ticker Style**: Smooth horizontal scrolling marquee with pause/play controls
- **Real-time Updates**: New messages appear immediately in the scrolling ticker
- **Rate Limiting**: Prevents spam with 5-second cooldown for duplicate messages
- **Terminal Aesthetic**: Clean white terminal interface with DMN Lab branding
- **Typing Indicator**: Visual feedback when users are typing messages
- **Message Confirmation**: Visual confirmation when messages are sent
- **Accessibility**: Keyboard navigation, reduced motion support, and screen reader friendly

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Local file system storage (no external databases)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3003](http://localhost:3003)

## File Structure

```
├── app/
│   ├── api/
│   │   ├── messages/
│   │   │   ├── route.ts           # GET/POST messages
│   │   │   └── clear/route.ts     # Clear all messages
│   │   └── archive/route.ts       # Manual archive trigger
│   ├── page.tsx                   # Main portal page
│   ├── layout.tsx                 # Root layout
│   └── styles/globals.css         # Global styles with DMN Lab branding
├── components/
│   ├── TickerMarquee.tsx          # Wall Street style ticker component
│   └── Composer.tsx               # Message input with typing indicator
├── lib/
│   ├── fsdb.ts                    # File system database with atomic writes
│   ├── time.ts                    # Time formatting utilities
│   └── sanitize.ts                # Text sanitization
├── public/assets/
│   ├── Logo_Mark.png              # DMN Lab pixelated head icon
│   └── Logo_Type.png              # DMN Lab text logo
└── data/
    ├── messages.json              # Current messages (today only)
    ├── messages.bak.json          # Backup file
    └── archive/                   # Daily archive files
        └── YYYY-MM-DD.json
```

## Data Persistence

The app uses a custom file system database with the following features:

- **Atomic Writes**: All writes go through a temp file → rename process
- **Backup System**: Every write creates a backup in `messages.bak.json`
- **Daily Archiving**: Messages older than today are moved to archive files
- **Crash Recovery**: Falls back to backup file if main file is corrupted
- **Mutex Protection**: Serializes all write operations to prevent corruption
- **No Seeding**: Starts with empty messages by default

## API Endpoints

- `GET /api/messages` - Retrieve today's messages
- `POST /api/messages` - Submit a new message
- `POST /api/messages/clear` - Clear all messages
- `POST /api/archive` - Manually trigger archiving

## Controls

- **Speed Control**: Adjust scrolling speed (0.5× to 2×)
- **Pause/Play**: Toggle scrolling animation
- **Dev Menu**: Access archive and clear functions
- **Hover to Pause**: Hover over the ticker to pause scrolling
- **Typing Indicator**: Shows animated dots when user is typing

## DMN Lab Branding

- **Primary Blue**: `#0015D5` (DMN Lab blue)
- **Background**: White terminal interface
- **Text**: Black on white for high contrast
- **Logos**: Integrated Logo_Mark.png and Logo_Type.png
- **Typography**: Clean, modern sans-serif fonts

## Interface Design

- **Terminal Aesthetic**: Clean white background with rounded elements
- **Ticker Style**: Wall Street-style horizontal scrolling marquee
- **Message Cards**: Time indicators with rounded squares
- **Input Field**: Integrated send button with typing indicator
- **Loading Screen**: Large logo display with 5-second delay

## Development

The app includes several development features:

- Empty start state (no seed messages)
- Dev menu with archive and clear functions
- Rate limiting to prevent spam
- Comprehensive error handling and recovery
- Visual confirmation for sent messages
- Typing indicator with floating dots animation

## Production Build

```bash
npm run build
npm start
```

The app is designed to run locally without any external services or databases.

## DMN Lab

Default Mode Network Research Lab - Avslappningsmaskin 3000 - White Terminal Interface