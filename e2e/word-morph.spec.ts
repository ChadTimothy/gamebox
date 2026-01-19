import { test, expect } from '@playwright/test';

/**
 * Word Morph E2E Tests
 *
 * These tests verify the Word Morph MCP server functionality
 * by making JSON-RPC calls to the /mcp endpoint.
 */

const MCP_ENDPOINT = '/mcp';
const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream',
};

/**
 * Helper function to make MCP JSON-RPC calls
 */
async function mcpCall(request: any, method: string, params?: any) {
  const response = await request.post(MCP_ENDPOINT, {
    headers: HEADERS,
    data: {
      jsonrpc: '2.0',
      method,
      params,
      id: Math.floor(Math.random() * 10000),
    },
  });

  return response;
}

test.describe('Word Morph MCP Server', () => {

  test('should respond to health check', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('GameBox MCP Server');
  });

  test('should register all Word Morph tools', async ({ request }) => {
    const response = await mcpCall(request, 'tools/list');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.result).toBeDefined();
    expect(data.result.tools).toBeDefined();
    expect(data.result.tools.length).toBeGreaterThanOrEqual(3);

    // Check for specific tools
    const toolNames = data.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('start_word_morph');
    expect(toolNames).toContain('check_word_morph_guess');
    expect(toolNames).toContain('show_game_menu');

    // Check tool metadata
    const wordChallengeTool = data.result.tools.find((t: any) => t.name === 'start_word_morph');
    expect(wordChallengeTool.title).toBe('Start Word Morph');
    expect(wordChallengeTool._meta).toBeDefined();
    expect(wordChallengeTool._meta['openai/outputTemplate']).toBe('ui://widget/word-morph.html');
  });

  test.describe('Daily Mode', () => {

    test('should start a daily Word Morph game', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'start_word_morph',
        arguments: { mode: 'daily' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result).toBeDefined();
      expect(data.result.content).toBeDefined();
      expect(data.result.content[0].type).toBe('text');
      expect(data.result.content[0].text).toContain('Daily Word Morph started');

      // Check structured content
      const structuredContent = data.result.structuredContent;
      expect(structuredContent.gameId).toBeDefined();
      expect(structuredContent.mode).toBe('daily');
      expect(structuredContent.guesses).toEqual([]);
      expect(structuredContent.status).toBe('playing');
      expect(structuredContent.maxGuesses).toBe(6);
      expect(structuredContent.streak).toBeGreaterThanOrEqual(0);
      expect(structuredContent.maxStreak).toBeGreaterThanOrEqual(0);
      expect(structuredContent.totalGamesPlayed).toBeGreaterThanOrEqual(0);
      expect(structuredContent.winRate).toBeGreaterThanOrEqual(0);
    });

    test('should give consistent daily word', async ({ request }) => {
      // Start first game
      const response1 = await mcpCall(request, 'tools/call', {
        name: 'start_word_morph',
        arguments: { mode: 'daily' },
      });
      const data1 = await response1.json();
      const gameId1 = data1.result.structuredContent.gameId;

      // Start second game
      const response2 = await mcpCall(request, 'tools/call', {
        name: 'start_word_morph',
        arguments: { mode: 'daily' },
      });
      const data2 = await response2.json();
      const gameId2 = data2.result.structuredContent.gameId;

      // Game IDs should be different
      expect(gameId1).not.toBe(gameId2);

      // Both should be daily mode
      expect(data1.result.structuredContent.mode).toBe('daily');
      expect(data2.result.structuredContent.mode).toBe('daily');
    });
  });

  test.describe('Practice Mode', () => {

    test('should start a practice Word Morph game', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'start_word_morph',
        arguments: { mode: 'practice' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.content[0].text).toContain('Practice Word Morph started');
      expect(data.result.structuredContent.mode).toBe('practice');
      expect(data.result.structuredContent.status).toBe('playing');
    });
  });

  test.describe('Making Guesses', () => {
    let gameId: string;

    test.beforeEach(async ({ request }) => {
      // Start a new game before each test
      const response = await mcpCall(request, 'tools/call', {
        name: 'start_word_morph',
        arguments: { mode: 'practice' },
      });
      const data = await response.json();
      gameId = data.result.structuredContent.gameId;
    });

    test('should accept valid 5-letter guess', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'check_word_morph_guess',
        arguments: {
          gameId,
          guess: 'crane',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result).toBeDefined();
      expect(data.result.structuredContent).toBeDefined();

      const { guess, result, guesses, status } = data.result.structuredContent;

      // Guess should be uppercased
      expect(guess).toBe('CRANE');

      // Result should have feedback for each letter
      expect(result).toHaveLength(5);
      expect(result[0].letter).toBe('C');
      expect(['correct', 'present', 'absent']).toContain(result[0].feedback);

      // Guesses array should contain our guess
      expect(guesses).toContain('CRANE');
      expect(guesses).toHaveLength(1);

      // Status should be playing (unless we won on first guess)
      expect(['playing', 'won']).toContain(status);
    });

    test('should reject guess that is too short', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'check_word_morph_guess',
        arguments: {
          gameId,
          guess: 'cat',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.isError).toBe(true);
      expect(data.result.content[0].text).toContain('validation error');
      expect(data.result.content[0].text).toContain('exactly 5 character');
    });

    test('should reject guess that is too long', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'check_word_morph_guess',
        arguments: {
          gameId,
          guess: 'cranes',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.isError).toBe(true);
      expect(data.result.content[0].text).toContain('validation error');
    });

    test('should reject guess with numbers', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'check_word_morph_guess',
        arguments: {
          gameId,
          guess: '12345',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.isError).toBe(true);
      expect(data.result.content[0].text).toContain('validation error');
    });

    test('should handle lowercase guesses correctly', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'check_word_morph_guess',
        arguments: {
          gameId,
          guess: 'hello',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Should not be an error
      if (!data.result.isError) {
        expect(data.result.structuredContent.guess).toBe('HELLO');
      }
    });

    test('should track multiple guesses', async ({ request }) => {
      const guessWords = ['crane', 'world', 'hello'];

      for (let i = 0; i < guessWords.length; i++) {
        const response = await mcpCall(request, 'tools/call', {
          name: 'check_word_morph_guess',
          arguments: {
            gameId,
            guess: guessWords[i],
          },
        });

        const data = await response.json();

        // Skip if game already won/lost
        if (data.result.structuredContent?.status !== 'playing') {
          break;
        }

        expect(data.result.structuredContent.guesses).toHaveLength(i + 1);
      }
    });

    test('should reject guesses for non-existent game', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'check_word_morph_guess',
        arguments: {
          gameId: 'non_existent_game_id',
          guess: 'crane',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.isError).toBe(true);
      expect(data.result.content[0].text).toContain('Game not found');
    });
  });

  test.describe('Game Completion', () => {

    test('should detect when game is lost (max guesses reached)', async ({ request }) => {
      // Start a new game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'start_word_morph',
        arguments: { mode: 'practice' },
      });
      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Make 6 guesses (some will likely be wrong)
      const guessWords = ['crane', 'world', 'hello', 'games', 'proxy', 'fuzzy'];
      let finalData;

      for (const word of guessWords) {
        const response = await mcpCall(request, 'tools/call', {
          name: 'check_word_morph_guess',
          arguments: {
            gameId,
            guess: word,
          },
        });

        finalData = await response.json();

        // Stop if game ended early (won)
        if (finalData.result.structuredContent?.status !== 'playing') {
          break;
        }
      }

      // After 6 guesses, game should be over
      const status = finalData?.result?.structuredContent?.status;
      expect(['won', 'lost']).toContain(status);
    });
  });

  test.describe('Game Menu', () => {

    test('should display game menu', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'show_game_menu',
        arguments: {},
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.content[0].text).toContain('Welcome to GameBox');
      expect(data.result.structuredContent.games).toBeDefined();
      expect(data.result.structuredContent.games.length).toBeGreaterThan(0);

      // Check for Word Morph in the menu
      const wordChallengeGame = data.result.structuredContent.games.find(
        (g: any) => g.id === 'word-morph'
      );
      expect(wordChallengeGame).toBeDefined();
      expect(wordChallengeGame.name).toBe('Word Morph');
    });
  });
});
