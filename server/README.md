# GameBox Server

MCP (Model Context Protocol) server for GameBox - handles game logic, data persistence, and tool registration.

## Structure

```
server/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   ├── games/            # Game logic for each game
│   │   ├── wordChallenge.ts
│   │   ├── twentyQuestions.ts
│   │   ├── connections.ts
│   │   ├── spellingBee.ts
│   │   └── trivia.ts
│   ├── data/             # Word lists, puzzles, questions
│   │   ├── wordLists.ts
│   │   ├── connectionsPuzzles.ts
│   │   └── triviaQuestions.ts
│   └── utils/            # Shared utilities
│       ├── userStats.ts
│       └── state.ts
└── package.json
```

## Technology

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **SDK**: `@openai/apps-sdk`
- **Transport**: `StreamableHTTPServerTransport`
- **Database**: Supabase (PostgreSQL)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

## MCP Tools

The server exposes these MCP tools to ChatGPT:

### Word Challenge
- `start_word_challenge` - Start a new word challenge game
- `check_word_guess` - Submit and validate a word guess

### 20 Questions
- `start_20_questions` - Start a 20 questions game
- `answer_20_questions` - Process an answer

### Connections
- `start_connections` - Start a connections puzzle
- `check_connections_group` - Validate a group of 4 words

### Spelling Bee
- `start_spelling_bee` - Start a spelling bee puzzle
- `check_spelling_word` - Validate a word submission

### Trivia
- `start_trivia` - Start a trivia quiz
- `check_trivia_answer` - Check an answer

## Widget Resources

Each game has an associated widget resource registered with the MCP server:
- `ui://widget/word-challenge.html`
- `ui://widget/connections.html`
- `ui://widget/spelling-bee.html`
- `ui://widget/trivia.html`
- `ui://widget/game-menu.html`

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API

The server exposes an HTTP endpoint at `/mcp` that handles MCP protocol messages using StreamableHTTPServerTransport.
