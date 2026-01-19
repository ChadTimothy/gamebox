# GameBox 🎮

**The Ultimate ChatGPT Game Collection** - 5 addictive games in one ChatGPT app!

[![Project Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/ChadTimothy/gamebox)
[![GitHub Project](https://img.shields.io/badge/project-board-blue)](https://github.com/users/ChadTimothy/projects/4)

## What is GameBox?

GameBox brings the most viral word games directly into ChatGPT with zero downloads and beautiful interactive widgets. Based on proven game mechanics with 5.3B+ annual plays worldwide, GameBox combines:

- **Low-effort development** - Minimal complex UI, chat-native interaction
- **High viral potential** - Proven game mechanics (Wordle, Connections, word-building puzzles)
- **Perfect ChatGPT fit** - Leverages AI for smart gameplay
- **Broad appeal** - Something for everyone among 800M+ weekly ChatGPT users

## The Games

### 🔤 Word Challenge (Wordle-style)
Guess the 5-letter word in 6 tries with color-coded feedback.
- **Daily Mode**: One puzzle per day for everyone
- **Practice Mode**: Unlimited random puzzles
- **Streaks**: Track your winning streak
- **Social**: Share your results as emoji grids

### ❓ 20 Questions AI
Classic guessing game powered by ChatGPT's intelligence.
- **AI Guesses**: Think of something, AI asks yes/no questions
- **User Guesses**: AI thinks of something, you ask questions
- **Categories**: People, places, things, characters
- **Pure Chat**: Minimal UI, maximum fun

### 🔗 Connections (Category Match)
Find 4 groups of 4 related words from a 4x4 grid.
- **Daily Puzzles**: New challenge every day
- **4 Difficulty Levels**: Yellow → Green → Blue → Purple
- **4 Mistakes Allowed**: Think carefully!
- **Beautiful Animations**: Smooth, satisfying interactions

### 🔤 Lexicon Smith
Build words from 7 letters - center letter required!
- **Find the Pangram**: Use all 7 letters for 7 bonus points
- **Length-based Scoring**: 4-letter=1pt, 5-letter=2pts, 6+ letters=3pts
- **Circular Layout**: Beautiful letter arrangement
- **Daily & Practice Modes**: New challenge daily or play unlimited

### 🧠 Trivia Challenge
Test your knowledge across multiple categories.
- **6 Categories**: General, Science, History, Pop Culture, Sports, Geography
- **3 Difficulty Levels**: Easy, Medium, Hard
- **Instant Feedback**: Learn with every question
- **Explanations**: Understand the answers

## Technology Stack

### Server (MCP)
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **SDK**: `@openai/apps-sdk` (Official OpenAI Apps SDK)
- **Transport**: `StreamableHTTPServerTransport`
- **Database**: Supabase (PostgreSQL)

### Client (Widgets)
- **Framework**: React 18 with TypeScript
- **UI Library**: `@openai/apps-sdk-ui` (Official ChatGPT design system)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Apps SDK UI tokens
- **Hosting**: Fly.io + Cloudflare CDN

**Note**: Technology stack updated based on [Official Apps SDK documentation review](./docs/TECHNICAL_REVIEW.md)

## Project Structure

```
gamebox/
├── server/              # MCP server (Node.js/TypeScript)
│   ├── src/
│   │   ├── index.ts    # Main MCP server
│   │   ├── games/      # Game logic for each game
│   │   ├── data/       # Word lists, puzzles, questions
│   │   └── utils/      # Shared utilities
│   └── package.json
├── web/                 # Widget UI (React/TypeScript)
│   ├── src/
│   │   ├── widgets/    # React components for each game
│   │   ├── hooks/      # React hooks for MCP integration
│   │   └── styles/     # Tailwind CSS
│   └── package.json
├── assets/              # Compiled widget bundles
└── docs/                # Documentation
```

## Development Status

🚧 **Currently in Development**

Track progress on our [GitHub Project Board](https://github.com/users/ChadTimothy/projects/4)

### ⚠️ Technical Review Complete
We've completed a comprehensive review against the [Official OpenAI Apps SDK documentation](https://developers.openai.com/apps-sdk). See [Technical Review](./docs/TECHNICAL_REVIEW.md) for details.

**Critical Updates**:
- ✅ Architecture validated
- ⚠️ SDK package needs update (#44)
- ⚠️ Transport layer needs update (#45)
- ⚠️ UI components need SDK library (#46)
- ⚠️ Widget hooks need implementation (#47)
- ❌ CSP configuration required (#48)

### Epics
- [ ] **Epic #1**: Project Setup & Infrastructure (⚠️ updated with critical fixes)
- [ ] **Epic #4**: Game 1 - Word Challenge
- [ ] **Epic #11**: Game 2 - 20 Questions AI
- [ ] **Epic #12**: Game 3 - Connections
- [x] **Epic #13**: Game 4 - Lexicon Smith ✅
- [ ] **Epic #14**: Game 5 - Trivia Challenge
- [ ] **Epic #15**: Integration & Polish
- [ ] **Epic #16**: Testing & Deployment

## Getting Started

Documentation for local development coming soon. See [Epic #1](https://github.com/ChadTimothy/gamebox/issues/1) for setup tasks.

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- ChatGPT Plus subscription (for testing)

### Quick Start (Coming Soon)

```bash
# Clone the repository
git clone https://github.com/ChadTimothy/gamebox.git
cd gamebox

# Install dependencies
cd server && npm install
cd ../web && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development servers
npm run dev:server   # Terminal 1: MCP server on :8000
npm run dev:web      # Terminal 2: Widget dev server on :4444

# Expose to ChatGPT (for testing)
ngrok http 8000
# Use ngrok URL in ChatGPT connector settings
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon) for guidelines.

### Development Process

Each task follows this process:
1. **Read ticket** - Review requirements and related tickets
2. **Review documentation** - Check technical design
3. **Make plan** - Create implementation plan
4. **Create PR** - Create placeholder PR
5. **Implement** - Enter Ralph Loop for iterative development
6. **Simplify** - Refactor for clarity
7. **Test** - Write and run tests
8. **Review** - Self-review code
9. **Complete** - Mark done with comments

## Roadmap

### Phase 1: Foundation (Week 1)
- Set up project structure
- Implement Word Challenge (highest ROI)
- Add 20 Questions (easiest)

### Phase 2: Core Games (Week 2)
- Implement Connections
- ✅ Implement Lexicon Smith (COMPLETE)
- Implement Trivia Challenge

### Phase 3: Polish (Week 3)
- Integration & game menu
- Leaderboards
- Branding & styling
- Performance optimization

### Phase 4: Launch (Week 4)
- Comprehensive testing
- Production deployment
- ChatGPT App Directory submission
- Marketing & promotion

## License

MIT License - see [LICENSE](./LICENSE) for details

## Contact

- **GitHub**: [@ChadTimothy](https://github.com/ChadTimothy)
- **Issues**: [GitHub Issues](https://github.com/ChadTimothy/gamebox/issues)
- **Project Board**: [Development Progress](https://github.com/users/ChadTimothy/projects/4)

---

Built with ❤️ for the ChatGPT community
