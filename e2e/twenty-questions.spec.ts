import { test, expect } from '@playwright/test';

/**
 * Twenty Questions E2E Tests
 *
 * These tests verify the Twenty Questions MCP server functionality
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

test.describe('Twenty Questions MCP Server', () => {

  test('should register Twenty Questions tools', async ({ request }) => {
    const response = await mcpCall(request, 'tools/list');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.result).toBeDefined();
    expect(data.result.tools).toBeDefined();

    // Check for Twenty Questions tools
    const toolNames = data.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('gamebox.start_20_questions');
    expect(toolNames).toContain('gamebox.answer_20_questions');
    expect(toolNames).toContain('gamebox.guess_20_questions');

    // Check tool metadata
    const startTool = data.result.tools.find((t: any) => t.name === 'gamebox.start_20_questions');
    expect(startTool.title).toBe('Start Twenty Questions Game');
    expect(startTool._meta).toBeDefined();
    expect(startTool._meta['openai/outputTemplate']).toBe('ui://widget/twenty-questions.html');
  });

  test.describe('AI Guesses Mode', () => {

    test('should start an AI guesses game with default category', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'ai-guesses' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result).toBeDefined();
      expect(data.result.content).toBeDefined();
      expect(data.result.content[0].type).toBe('text');
      expect(data.result.content[0].text).toContain('AI Guesses Mode');

      // Verify structured content
      const structured = data.result.structuredContent;
      expect(structured).toBeDefined();
      expect(structured.gameId).toBeDefined();
      expect(structured.gameId).toMatch(/^tq_/); // Twenty Questions session ID prefix
      expect(structured.mode).toBe('ai-guesses');
      expect(structured.category).toBeDefined();
      expect(structured.questionAnswers).toEqual([]);
      expect(structured.currentQuestionNumber).toBe(1);
      expect(structured.questionsRemaining).toBe(20);
      expect(structured.status).toBe('playing');
      expect(structured.target).toBeUndefined(); // Hidden in ai-guesses mode
    });

    test('should start an AI guesses game with specific category', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'ai-guesses', category: 'people' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      const structured = data.result.structuredContent;
      expect(structured.mode).toBe('ai-guesses');
      expect(structured.category).toBe('people');
    });

    test('should answer AI question and update state', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'ai-guesses', category: 'places' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Answer a question (simulate AI asked a question)
      const answerResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.answer_20_questions',
        arguments: { gameId, question: 'Is it in Europe?', answer: 'yes' },
      });

      expect(answerResponse.ok()).toBeTruthy();
      const answerData = await answerResponse.json();

      expect(answerData.result.content[0].text).toContain('Answer recorded');
      const structured = answerData.result.structuredContent;
      expect(structured.currentQuestionNumber).toBe(2); // Incremented
      expect(structured.questionsRemaining).toBe(19); // Decremented
    });

    test('should support all answer types', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'ai-guesses' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Test each answer type
      const answerTypes = ['yes', 'no', 'maybe', 'unknown'];

      for (let i = 0; i < answerTypes.length; i++) {
        const answer = answerTypes[i];
        const response = await mcpCall(request, 'tools/call', {
          name: 'gamebox.answer_20_questions',
          arguments: { gameId, question: `Test question ${i + 1}?`, answer },
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.result.content[0].text).toContain('Answer recorded');
      }
    });

    test('should end game after 20 questions', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'ai-guesses' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Answer 20 questions
      for (let i = 0; i < 20; i++) {
        await mcpCall(request, 'tools/call', {
          name: 'gamebox.answer_20_questions',
          arguments: { gameId, question: `Question ${i + 1}?`, answer: 'no' },
        });
      }

      // Try to answer 21st question - should fail
      const extraResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.answer_20_questions',
        arguments: { gameId, question: 'Question 21?', answer: 'yes' },
      });

      const extraData = await extraResponse.json();
      expect(extraData.result.content[0].text).toContain('Game is not in playing state');
    });

  });

  test.describe('User Guesses Mode', () => {

    test('should start a user guesses game', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses', category: 'things' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data.result.content[0].text).toContain('User Guesses Mode');

      // Verify structured content
      const structured = data.result.structuredContent;
      expect(structured.mode).toBe('user-guesses');
      expect(structured.category).toBe('things');
      expect(structured.target).toBeDefined(); // Visible in user-guesses mode
      expect(structured.target.length).toBeGreaterThan(0);
      expect(structured.status).toBe('playing');
    });

    test('should reveal target in user-guesses mode', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses', category: 'characters' },
      });

      const data = await response.json();
      const structured = data.result.structuredContent;

      // Target should be visible and be a string
      expect(structured.target).toBeDefined();
      expect(typeof structured.target).toBe('string');
      expect(structured.target.length).toBeGreaterThan(0);
    });

  });

  test.describe('Guessing', () => {

    test('should accept correct guess and win game', async ({ request }) => {
      // Start game in user-guesses mode (so we know the target)
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses', category: 'places' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const target = startData.result.structuredContent.target;

      // Make correct guess
      const guessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.guess_20_questions',
        arguments: { gameId, guess: target },
      });

      expect(guessResponse.ok()).toBeTruthy();
      const guessData = await guessResponse.json();

      expect(guessData.result.content[0].text).toContain('Correct');
      const structured = guessData.result.structuredContent;
      expect(structured.status).toBe('won');
      expect(structured.correct).toBe(true);
    });

    test('should handle case-insensitive guesses', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses', category: 'people' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const target = startData.result.structuredContent.target;

      // Make guess in different case
      const guessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.guess_20_questions',
        arguments: { gameId, guess: target.toUpperCase() },
      });

      const guessData = await guessResponse.json();
      expect(guessData.result.structuredContent.correct).toBe(true);
    });

    test('should reject incorrect guess and lose game', async ({ request }) => {
      // Start game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses', category: 'things' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Make incorrect guess
      const guessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.guess_20_questions',
        arguments: { gameId, guess: 'Definitely Wrong Answer' },
      });

      expect(guessResponse.ok()).toBeTruthy();
      const guessData = await guessResponse.json();

      expect(guessData.result.content[0].text).toContain('Not quite');
      const structured = guessData.result.structuredContent;
      expect(structured.status).toBe('lost');
      expect(structured.correct).toBe(false);
      expect(structured.target).toBeDefined(); // Target revealed on game end
    });

    test('should include share text on game end', async ({ request }) => {
      // Start and end game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const target = startData.result.structuredContent.target;

      // Make guess
      const guessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.guess_20_questions',
        arguments: { gameId, guess: target },
      });

      const guessData = await guessResponse.json();
      const structured = guessData.result.structuredContent;

      expect(structured.shareText).toBeDefined();
      expect(structured.shareText).toContain('Twenty Questions');
      expect(structured.shareText).toContain(target);
    });

  });

  test.describe('Error Handling', () => {

    test('should reject invalid game ID', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.answer_20_questions',
        arguments: { gameId: 'invalid_game_id', question: 'Test question?', answer: 'yes' },
      });

      const data = await response.json();
      expect(data.result.content[0].text).toContain('Game session not found');
    });

    test('should reject answer_20_questions in user-guesses mode', async ({ request }) => {
      // Start user-guesses game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;

      // Try to use answer tool (only for ai-guesses mode)
      const answerResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.answer_20_questions',
        arguments: { gameId, question: 'Is it a person?', answer: 'yes' },
      });

      const answerData = await answerResponse.json();
      expect(answerData.result.content[0].text).toContain('only for ai-guesses mode');
    });

    test('should reject operations on finished game', async ({ request }) => {
      // Start and finish game
      const startResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses' },
      });

      const startData = await startResponse.json();
      const gameId = startData.result.structuredContent.gameId;
      const target = startData.result.structuredContent.target;

      // Finish game with guess
      await mcpCall(request, 'tools/call', {
        name: 'gamebox.guess_20_questions',
        arguments: { gameId, guess: target },
      });

      // Try to guess again
      const secondGuessResponse = await mcpCall(request, 'tools/call', {
        name: 'gamebox.guess_20_questions',
        arguments: { gameId, guess: 'Another guess' },
      });

      const secondGuessData = await secondGuessResponse.json();
      expect(secondGuessData.result.content[0].text).toContain('Game is not in playing state');
    });

  });

  test.describe('Categories', () => {

    test('should support all category types', async ({ request }) => {
      const categories = ['people', 'places', 'things', 'characters', 'any'];

      for (const category of categories) {
        const response = await mcpCall(request, 'tools/call', {
          name: 'gamebox.start_20_questions',
          arguments: { mode: 'user-guesses', category },
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        const structured = data.result.structuredContent;
        expect(structured.category).toBe(category);
        expect(structured.target).toBeDefined();
      }
    });

    test('should select random category for "any"', async ({ request }) => {
      const response = await mcpCall(request, 'tools/call', {
        name: 'gamebox.start_20_questions',
        arguments: { mode: 'user-guesses', category: 'any' },
      });

      const data = await response.json();
      const structured = data.result.structuredContent;

      // Category should still be "any" in the response
      expect(structured.category).toBe('any');
      // But target should be defined (selected from a random category)
      expect(structured.target).toBeDefined();
    });

  });

});
