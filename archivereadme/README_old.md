# Portal - Local Scrolling Message Board

A Next.js application that creates a local scrolling portal for sharing messages. Messages are persisted to disk with atomic writes and daily archiving.

## Features

- **Local File Persistence**: Messages stored in `data/messages.json` with atomic writes
- **Daily Archiving**: Older messages automatically moved to `data/archive/YYYY-MM-DD.json`
- **Smooth Scrolling**: GPU-accelerated horizontal marquee with pause/play controls
- **Real-time Updates**: New messages appear immediately in the scrolling banner
- **Rate Limiting**: Prevents spam with 5-second cooldown for duplicate messages
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
   Navigate to [http://localhost:3000](http://localhost:3000)

## File Structure

```
├── app/
│   ├── api/
│   │   ├── messages/route.ts    # GET/POST messages
│   │   └── archive/route.ts     # Manual archive trigger
│   ├── page.tsx                 # Main portal page
│   ├── layout.tsx               # Root layout
│   └── styles/globals.css       # Global styles with brand tokens
├── components/
│   ├── Marquee.tsx              # Scrolling banner component
│   ├── MessageCard.tsx          # Individual message card
│   └── Composer.tsx             # Message input form
├── lib/
│   ├── fsdb.ts                  # File system database with atomic writes
│   ├── time.ts                  # Time formatting utilities
│   └── sanitize.ts              # Text sanitization
└── data/
    ├── messages.json            # Current messages (today only)
    ├── messages.bak.json        # Backup file
    └── archive/                 # Daily archive files
        └── YYYY-MM-DD.json
```

## Data Persistence

The app uses a custom file system database with the following features:

- **Atomic Writes**: All writes go through a temp file → rename process
- **Backup System**: Every write creates a backup in `messages.bak.json`
- **Daily Archiving**: Messages older than today are moved to archive files
- **Crash Recovery**: Falls back to backup file if main file is corrupted
- **Mutex Protection**: Serializes all write operations to prevent corruption

## API Endpoints

- `GET /api/messages` - Retrieve today's messages
- `POST /api/messages` - Submit a new message
- `POST /api/archive` - Manually trigger archiving

## Controls

- **Speed Control**: Adjust scrolling speed (0.5× to 2×)
- **Pause/Play**: Toggle scrolling animation
- **Dev Menu**: Access archive and clear functions
- **Hover to Pause**: Hover over the marquee to pause scrolling

## Brand Colors

- `--brand: #FF390B` (Orange)
- `--ink: #0A0A0A` (Dark)
- `--paper: #FFFFFF` (White)

## Development

The app includes several development features:

- Seed messages on first run
- Dev menu with archive and clear functions
- Rate limiting to prevent spam
- Comprehensive error handling and recovery

## Production Build

```bash
npm run build
npm start
```

The app is designed to run locally without any external services or databases.
