# Word Challenge Deployment

## Fly.io Production URLs

The Word Challenge app is deployed on Fly.io with stable, permanent URLs:

- **MCP Endpoint**: `https://word-challenge.fly.dev/mcp`
- **Widget Assets**: `https://word-challenge.fly.dev/assets/index.js`
- **Widget CSS**: `https://word-challenge.fly.dev/assets/index.css`
- **Health Check**: `https://word-challenge.fly.dev/`

## Architecture

Single Node.js server serving both:
- MCP protocol endpoint at `/mcp`
- Static widget assets at `/assets/*`

### Infrastructure
- **Platform**: Fly.io
- **Machines**: 2 instances (high availability)
- **Region**: San Jose (sjc)
- **Memory**: 512MB per machine
- **Auto-suspend**: Yes (when idle)
- **Auto-start**: Yes (on first request)

## Deployment Commands

### Deploy updates
```bash
fly deploy
```

### Check status
```bash
fly status -a word-challenge
```

### View logs
```bash
fly logs -a word-challenge
```

### SSH into container
```bash
fly ssh console -a word-challenge
```

### Scale machines
```bash
fly scale count 1  # Single machine
fly scale count 2  # High availability (default)
```

## Local Development

The local MCP server runs on port 8000 and serves:
- MCP endpoint: `http://localhost:8000/mcp`
- Widget assets: `http://localhost:8000/assets/*`

Start local server:
```bash
cd server
npm run dev
```

## Notes

- The serveo tunnels are no longer needed and have been replaced by this permanent deployment
- The app auto-suspends when idle to minimize costs
- First request after idle may take 1-2 seconds to wake up
- Health checks run every 30 seconds
- Widget version cache busting is built-in
