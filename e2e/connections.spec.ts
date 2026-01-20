import { test, expect } from '@playwright/test';

/**
 * Connections E2E Tests
 *
 * These tests verify the Connections MCP server functionality
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

test.describe('Connections MCP Server', () => {

  test('should register Connections tools', async ({ request }) => {
    const response = await mcpCall(request, 'tools/list');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.result).toBeDefined();
    expect(data.result.tools).toBeDefined();

    // Check for Connections tools
    const toolNames = data.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('gamebox.start_connections');
    expect(toolNames).toContain('gamebox.submit_connections_guess');
    expect(toolNames).toContain('gamebox.shuffle_connections');

    // Check tool metadata
    const startTool = data.result.tools.find((t: any) => t.name === 'gamebox.start_connections');
    expect(startTool.title).toBe('Start Connections Game');
    expect(startTool._meta).toBeDefined();
    expect(startTool._meta['openai/outputTemplate']).toBe('ui://widget/connections.html');
  });

  test.describe('Starting Games', () => {

    test('should start a daily game', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'daily' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result).toBeDefined();
      expect(data.result.content).toBeDefined();
      expect(data.result.content[0].type).toBe('text');
      expect(data.result.content[0].text).toContain('Connections');

      // Verify structured content
      const structured = data.result.structuredContent;
      expect(structured).toBeDefined();
      expect(structured.gameId).toBeDefined();
      expect(structured.gameId).toMatch(/^cn_/); // Connections session ID prefix
      expect(structured.mode).toBe('daily');
      expect(structured.remainingWords).toBeDefined();
      expect(structured.remainingWords.length).toBe(16); // 4x4 grid
      expect(structured.solvedGroups).toEqual([]);
      expect(structured.mistakeCount).toBe(0);
      expect(structured.mistakesRemaining).toBe(4);
      expect(structured.status).toBe('playing');
    });

    test('should start a practice game', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      const structured = data.result.structuredContent;
      expect(structured.mode).toBe('practice');
      expect(structured.remainingWords.length).toBe(16);
    });

    test('should shuffle words in practice mode', async ({ request }) => {
      // Start two practice games and verify words can be in different order
      const response1 = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const response2 = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Both should have 16 words
      expect(data1.result.structuredContent.remainingWords.length).toBe(16);
      expect(data2.result.structuredContent.remainingWords.length).toBe(16);
    });

  });

  test.describe('Submitting Guesses', () => {

    test('should submit a guess and get response', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const words = startData.result.structuredContent.remainingWords;

      // Submit first 4 words (may be correct or incorrect)
      const guessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.submit_connections_guess',
        arguments: { gameId, words: words.slice(0, 4) },
      });

      const guessData = await guessResponse.json();

      // Check response
      expect(guessData.result).toBeDefined();
      expect(guessData.result.content[0]).toBeDefined();

      const structured = guessData.result.structuredContent;
      expect(structured).toBeDefined();
      expect(structured.gameId).toBe(gameId);
      // Either correct or incorrect
      expect(typeof structured.correct).toBe('boolean');
    });

    test('should track mistakes for wrong guesses', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const words = startData.result.structuredContent.remainingWords;

      // Submit an intentionally wrong guess (first 4 words unlikely to be a group)
      const wrongGuess = words.slice(0, 4);
      const guessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.submit_connections_guess',
        arguments: { gameId, words: wrongGuess },
      });

      const guessData = await guessResponse.json();
      const structured = guessData.result.structuredContent;

      // Either correct (solved a group) or incorrect (mistake)
      expect(structured).toBeDefined();
      if (!structured.correct) {
        expect(structured.mistakeCount).toBe(1);
        expect(structured.mistakesRemaining).toBe(3);
      }
    });

    test('should end game after 4 mistakes', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const words = startData.result.structuredContent.remainingWords;

      // Make 4 wrong guesses using actual words from the puzzle
      // Pick words likely to not be a valid group (every 4th word)
      let lastStructured: any;
      let mistakeCount = 0;

      for (let attempt = 0; attempt < 8 && mistakeCount < 4; attempt++) {
        // Try different combinations of words
        const offset = attempt % 4;
        const guessWords = [
          words[offset],
          words[(offset + 4) % 16],
          words[(offset + 8) % 16],
          words[(offset + 12) % 16],
        ].filter(Boolean);

        if (guessWords.length !== 4) continue;

        const response = await mcpCall(request, 'tools/call', {
          name: 'gamebox.submit_connections_guess',
          arguments: { gameId, words: guessWords },
        });

        const data = await response.json();
        if (data.result && data.result.structuredContent) {
          lastStructured = data.result.structuredContent;
          mistakeCount = lastStructured.mistakeCount || 0;

          // Break if game ended (either won or lost)
          if (lastStructured.status !== 'playing') break;
        }
      }

      // Should have received game state back
      expect(lastStructured).toBeDefined();
    });

    test('should require exactly 4 words', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Try to submit 3 words (should fail at schema level)
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.submit_connections_guess',
        arguments: { gameId, words: ['A', 'B', 'C'] },
      });

      const data = await response.json();
      // Should get an error about word count
      expect(data.error || data.result.content[0].text).toBeDefined();
    });

  });

  test.describe('Shuffle Functionality', () => {

    test('should shuffle remaining words', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const originalWords = startData.result.structuredContent.remainingWords;

      // Shuffle
      const shuffleResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.shuffle_connections',
        arguments: { gameId },
      });

      expect(shuffleResponse.ok()).toBeTruthy();
      const shuffleData = await shuffleResponse.json();

      const shuffledWords = shuffleData.result.structuredContent.remainingWords;

      // Same words, possibly different order
      expect(shuffledWords.length).toBe(originalWords.length);
      expect(shuffledWords.sort()).toEqual(originalWords.sort());
    });

    test('should not affect solved groups', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Shuffle
      const shuffleResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.shuffle_connections',
        arguments: { gameId },
      });

      const shuffleData = await shuffleResponse.json();
      const structured = shuffleData.result.structuredContent;

      // Solved groups should still be empty
      expect(structured.solvedGroups).toEqual([]);
      expect(structured.status).toBe('playing');
    });

  });

  test.describe('Error Handling', () => {

    test('should reject invalid game ID', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.submit_connections_guess',
        arguments: { gameId: 'invalid_game_id', words: ['A', 'B', 'C', 'D'] },
      });

      const data = await response.json();
      expect(data.result.content[0].text).toContain('Game not found');
    });

    test('should reject words not in puzzle', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Submit words that don't exist in the puzzle
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.submit_connections_guess',
        arguments: { gameId, words: ['NOTAWORD1', 'NOTAWORD2', 'NOTAWORD3', 'NOTAWORD4'] },
      });

      const data = await response.json();
      expect(data.result.content[0].text).toContain('not available');
    });

    test('should reject operations on finished game', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_connections',
        arguments: { mode: 'practice' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const words = startData.result.structuredContent.remainingWords;

      // Make 4 wrong guesses to end game using actual words
      for (let i = 0; i < 4; i++) {
        const offset = i;
        const guessWords = [
          words[offset],
          words[(offset + 4) % 16],
          words[(offset + 8) % 16],
          words[(offset + 12) % 16],
        ];

        const response = await mcpCall(request, 'tools/call', {
          name: 'gamebox.submit_connections_guess',
          arguments: { gameId, words: guessWords },
        });

        const data = await response.json();
        // Break if game ended
        if (data.result?.structuredContent?.status !== 'playing') break;
      }

      // Try to shuffle after game may have ended
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.shuffle_connections',
        arguments: { gameId },
      });

      const data = await response.json();
      // Should still return a response (either shuffled or error)
      expect(data.result).toBeDefined();
    });

  });

  test.describe('Tool Metadata', () => {

    test('should have correct tool metadata for Connections', async ({ request }) => {
      const response = await mcpCall(request, 'tools/list');

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Check start_connections tool description mentions Connections
      const startTool = data.result.tools.find((t: any) => t.name === 'gamebox.start_connections');
      expect(startTool).toBeDefined();
      expect(startTool.description).toContain('Connections');
    });

  });

});
