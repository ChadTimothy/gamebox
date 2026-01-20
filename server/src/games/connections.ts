/**
 * Connections Game Logic
 *
 * NYT Connections-style word grouping game where players must find
 * 4 groups of 4 related words from a 16-word grid.
 *
 * Game mechanics:
 * - 16 words displayed in a 4x4 grid
 * - 4 groups of 4 words each with a category connection
 * - 4 difficulty levels: yellow (easiest), green, blue, purple (hardest)
 * - 4 mistakes allowed before game over
 * - Correct groups revealed in order of difficulty
 */

export type Difficulty = "yellow" | "green" | "blue" | "purple";
export type GameStatus = "playing" | "won" | "lost";

export interface WordGroup {
  category: string;
  words: string[];
  difficulty: Difficulty;
}

export interface Puzzle {
  id: string;
  groups: WordGroup[];
  date?: string; // For daily puzzles
}

export interface GuessResult {
  correct: boolean;
  category?: string;
  difficulty?: Difficulty;
  wordsAway?: number; // How many words away from a correct group (for "one away" hints)
}

export interface GameState {
  puzzleId: string;
  remainingWords: string[];
  solvedGroups: WordGroup[];
  mistakeCount: number;
  maxMistakes: number;
  status: GameStatus;
  guessHistory: string[][];
}

/**
 * Connections game class managing game state and validation.
 */
export class ConnectionsGame {
  private readonly puzzle: Puzzle;
  private remainingWords: string[];
  private solvedGroups: WordGroup[];
  private mistakeCount: number;
  private readonly maxMistakes: number = 4;
  private status: GameStatus;
  private guessHistory: string[][];

  constructor(puzzle: Puzzle) {
    if (!puzzle || !puzzle.groups || puzzle.groups.length !== 4) {
      throw new Error("Puzzle must have exactly 4 groups");
    }

    for (const group of puzzle.groups) {
      if (!group.words || group.words.length !== 4) {
        throw new Error("Each group must have exactly 4 words");
      }
      if (!group.category || group.category.trim().length === 0) {
        throw new Error("Each group must have a category");
      }
    }

    this.puzzle = puzzle;
    this.solvedGroups = [];
    this.mistakeCount = 0;
    this.status = "playing";
    this.guessHistory = [];

    // Flatten and shuffle all words
    const allWords = puzzle.groups.flatMap((g) => g.words);
    this.remainingWords = this.shuffleArray([...allWords]);
  }

  /**
   * Fisher-Yates shuffle algorithm.
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Shuffle the remaining words on the grid.
   */
  shuffle(): void {
    if (this.status !== "playing") {
      throw new Error("Cannot shuffle after game is over");
    }
    this.remainingWords = this.shuffleArray(this.remainingWords);
  }

  /**
   * Submit a guess of 4 words.
   */
  submitGuess(words: string[]): GuessResult {
    if (this.status !== "playing") {
      throw new Error("Game is already over");
    }

    if (words.length !== 4) {
      throw new Error("Must select exactly 4 words");
    }

    // Normalize words for comparison
    const normalizedGuess = words.map((w) => w.trim().toUpperCase());

    // Check all words are in remaining words
    const normalizedRemaining = this.remainingWords.map((w) => w.toUpperCase());
    for (const word of normalizedGuess) {
      if (!normalizedRemaining.includes(word)) {
        throw new Error(`Word "${word}" is not available`);
      }
    }

    // Check for duplicate words in guess
    const uniqueWords = new Set(normalizedGuess);
    if (uniqueWords.size !== 4) {
      throw new Error("Cannot select the same word twice");
    }

    // Check if this exact guess was already made
    const guessKey = [...normalizedGuess].sort().join(",");
    for (const prevGuess of this.guessHistory) {
      const prevKey = [...prevGuess].map((w) => w.toUpperCase()).sort().join(",");
      if (guessKey === prevKey) {
        throw new Error("Already guessed this combination");
      }
    }

    // Record the guess
    this.guessHistory.push(words);

    // Check if guess matches any unsolved group
    for (const group of this.puzzle.groups) {
      if (this.solvedGroups.includes(group)) {
        continue;
      }

      const groupWords = group.words.map((w) => w.toUpperCase());
      const matches = normalizedGuess.filter((w) => groupWords.includes(w)).length;

      if (matches === 4) {
        // Correct guess!
        this.solvedGroups.push(group);

        // Remove solved words from remaining
        this.remainingWords = this.remainingWords.filter(
          (w) => !groupWords.includes(w.toUpperCase())
        );

        // Check for win
        if (this.solvedGroups.length === 4) {
          this.status = "won";
        }

        return {
          correct: true,
          category: group.category,
          difficulty: group.difficulty,
        };
      }
    }

    // Wrong guess - check for "one away" hint
    let closestAway = 4;
    for (const group of this.puzzle.groups) {
      if (this.solvedGroups.includes(group)) {
        continue;
      }

      const groupWords = group.words.map((w) => w.toUpperCase());
      const matches = normalizedGuess.filter((w) => groupWords.includes(w)).length;
      const away = 4 - matches;

      if (away < closestAway) {
        closestAway = away;
      }
    }

    this.mistakeCount++;

    // Check for loss
    if (this.mistakeCount >= this.maxMistakes) {
      this.status = "lost";
    }

    return {
      correct: false,
      wordsAway: closestAway,
    };
  }

  /**
   * Get current game state.
   */
  getState(): GameState {
    return {
      puzzleId: this.puzzle.id,
      remainingWords: [...this.remainingWords],
      solvedGroups: this.solvedGroups.map((g) => ({ ...g, words: [...g.words] })),
      mistakeCount: this.mistakeCount,
      maxMistakes: this.maxMistakes,
      status: this.status,
      guessHistory: this.guessHistory.map((g) => [...g]),
    };
  }

  /**
   * Get puzzle ID.
   */
  getPuzzleId(): string {
    return this.puzzle.id;
  }

  /**
   * Get all groups (for revealing at game end).
   */
  getAllGroups(): WordGroup[] {
    return this.puzzle.groups.map((g) => ({ ...g, words: [...g.words] }));
  }

  /**
   * Get unsolved groups (for revealing at game end).
   */
  getUnsolvedGroups(): WordGroup[] {
    return this.puzzle.groups
      .filter((g) => !this.solvedGroups.includes(g))
      .map((g) => ({ ...g, words: [...g.words] }));
  }

  /**
   * Get mistakes remaining.
   */
  getMistakesRemaining(): number {
    return this.maxMistakes - this.mistakeCount;
  }

  /**
   * Generate share text for completed game.
   */
  generateShareText(): string {
    if (this.status === "playing") {
      return "";
    }

    const difficultyEmoji: Record<Difficulty, string> = {
      yellow: "🟨",
      green: "🟩",
      blue: "🟦",
      purple: "🟪",
    };

    let shareText = `Connections #${this.puzzle.id}\n`;

    // Show guess history with colored squares
    for (const guess of this.guessHistory) {
      const normalizedGuess = guess.map((w) => w.toUpperCase());
      let row = "";

      // For each guess, show which difficulty each word belonged to
      for (const word of normalizedGuess) {
        for (const group of this.puzzle.groups) {
          if (group.words.map((w) => w.toUpperCase()).includes(word)) {
            row += difficultyEmoji[group.difficulty];
            break;
          }
        }
      }

      shareText += row + "\n";
    }

    return shareText.trim();
  }
}

// ============================================
// Predefined Puzzles
// ============================================

export const CONNECTIONS_PUZZLES: Puzzle[] = [
  {
    id: "1",
    groups: [
      {
        category: "PLANETS",
        words: ["MARS", "VENUS", "SATURN", "JUPITER"],
        difficulty: "yellow",
      },
      {
        category: "CANDY BARS",
        words: ["SNICKERS", "TWIX", "MILKYWAY", "BOUNTY"],
        difficulty: "green",
      },
      {
        category: "GREEK GODS",
        words: ["ZEUS", "APOLLO", "HERMES", "ARES"],
        difficulty: "blue",
      },
      {
        category: "THINGS THAT ARE RED",
        words: ["APPLE", "FIRE", "RUBY", "BLOOD"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "2",
    groups: [
      {
        category: "FRUITS",
        words: ["ORANGE", "LEMON", "LIME", "GRAPE"],
        difficulty: "yellow",
      },
      {
        category: "MUSIC GENRES",
        words: ["JAZZ", "BLUES", "ROCK", "POP"],
        difficulty: "green",
      },
      {
        category: "CARD GAMES",
        words: ["POKER", "BRIDGE", "HEARTS", "SPADES"],
        difficulty: "blue",
      },
      {
        category: "TYPES OF DANCE",
        words: ["SALSA", "TANGO", "WALTZ", "SWING"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "3",
    groups: [
      {
        category: "ANIMALS",
        words: ["TIGER", "LION", "BEAR", "WOLF"],
        difficulty: "yellow",
      },
      {
        category: "NFL TEAMS",
        words: ["EAGLES", "RAVENS", "DOLPHINS", "GIANTS"],
        difficulty: "green",
      },
      {
        category: "FAIRY TALE CHARACTERS",
        words: ["RAPUNZEL", "CINDERELLA", "SNOW", "SLEEPING"],
        difficulty: "blue",
      },
      {
        category: "___ KING (MOVIES)",
        words: ["LION", "SCORPION", "BURGER", "STEPHEN"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "4",
    groups: [
      {
        category: "COLORS",
        words: ["BLUE", "GREEN", "YELLOW", "ORANGE"],
        difficulty: "yellow",
      },
      {
        category: "CHESS PIECES",
        words: ["KING", "QUEEN", "ROOK", "KNIGHT"],
        difficulty: "green",
      },
      {
        category: "TYPES OF COFFEE",
        words: ["ESPRESSO", "LATTE", "MOCHA", "CAPPUCCINO"],
        difficulty: "blue",
      },
      {
        category: "THINGS WITH CROWNS",
        words: ["MONARCH", "TOOTH", "ROLEX", "CORONA"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "5",
    groups: [
      {
        category: "BODY PARTS",
        words: ["ARM", "LEG", "HEAD", "HAND"],
        difficulty: "yellow",
      },
      {
        category: "FURNITURE",
        words: ["CHAIR", "TABLE", "DESK", "BED"],
        difficulty: "green",
      },
      {
        category: "POKER TERMS",
        words: ["FOLD", "RAISE", "CALL", "CHECK"],
        difficulty: "blue",
      },
      {
        category: "___BAND",
        words: ["RUBBER", "HEAD", "BROAD", "HUSBAND"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "6",
    groups: [
      {
        category: "WEATHER",
        words: ["RAIN", "SNOW", "WIND", "STORM"],
        difficulty: "yellow",
      },
      {
        category: "METALS",
        words: ["GOLD", "SILVER", "BRONZE", "COPPER"],
        difficulty: "green",
      },
      {
        category: "OLYMPIC MEDALS",
        words: ["FIRST", "SECOND", "THIRD", "FOURTH"],
        difficulty: "blue",
      },
      {
        category: "TYPES OF HUMOR",
        words: ["DRY", "DARK", "SLAPSTICK", "DEADPAN"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "7",
    groups: [
      {
        category: "VEGETABLES",
        words: ["CARROT", "POTATO", "ONION", "CELERY"],
        difficulty: "yellow",
      },
      {
        category: "MUSICAL INSTRUMENTS",
        words: ["PIANO", "GUITAR", "DRUMS", "VIOLIN"],
        difficulty: "green",
      },
      {
        category: "THINGS IN A WALLET",
        words: ["CASH", "CARDS", "LICENSE", "PHOTOS"],
        difficulty: "blue",
      },
      {
        category: "SLANG FOR MONEY",
        words: ["BREAD", "DOUGH", "CHEDDAR", "BACON"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "8",
    groups: [
      {
        category: "SEASONS",
        words: ["SPRING", "SUMMER", "FALL", "WINTER"],
        difficulty: "yellow",
      },
      {
        category: "SPORTS",
        words: ["BASEBALL", "FOOTBALL", "BASKETBALL", "HOCKEY"],
        difficulty: "green",
      },
      {
        category: "TYPES OF SHOWS",
        words: ["GAME", "TALK", "REALITY", "VARIETY"],
        difficulty: "blue",
      },
      {
        category: "___BALL",
        words: ["BASKET", "FOOT", "BASE", "VOLLEY"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "9",
    groups: [
      {
        category: "BIRDS",
        words: ["EAGLE", "HAWK", "OWL", "FALCON"],
        difficulty: "yellow",
      },
      {
        category: "CARS",
        words: ["MUSTANG", "CHARGER", "CHALLENGER", "CAMARO"],
        difficulty: "green",
      },
      {
        category: "SUPERHERO NAMES",
        words: ["BATMAN", "SUPERMAN", "SPIDERMAN", "IRONMAN"],
        difficulty: "blue",
      },
      {
        category: "THINGS THAT FLY",
        words: ["PLANE", "BIRD", "KITE", "DRONE"],
        difficulty: "purple",
      },
    ],
  },
  {
    id: "10",
    groups: [
      {
        category: "NUMBERS",
        words: ["ONE", "TWO", "THREE", "FOUR"],
        difficulty: "yellow",
      },
      {
        category: "DIRECTIONS",
        words: ["NORTH", "SOUTH", "EAST", "WEST"],
        difficulty: "green",
      },
      {
        category: "BOY BANDS",
        words: ["NSYNC", "BACKSTREET", "NKOTB", "ONEREPUBLIC"],
        difficulty: "blue",
      },
      {
        category: "KANYE WEST ALBUMS",
        words: ["GRADUATION", "DONDA", "YEEZUS", "PABLO"],
        difficulty: "purple",
      },
    ],
  },
];

/**
 * Get puzzle by ID.
 */
export function getPuzzleById(id: string): Puzzle | undefined {
  return CONNECTIONS_PUZZLES.find((p) => p.id === id);
}

/**
 * Get daily puzzle based on date.
 */
export function getDailyPuzzle(date: Date): Puzzle {
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const puzzleIndex = daysSinceEpoch % CONNECTIONS_PUZZLES.length;
  const puzzle = CONNECTIONS_PUZZLES[puzzleIndex];
  return {
    ...puzzle,
    date: date.toISOString().split("T")[0],
  };
}

/**
 * Get random puzzle for practice mode.
 */
export function getRandomPuzzle(): Puzzle {
  const randomIndex = Math.floor(Math.random() * CONNECTIONS_PUZZLES.length);
  return CONNECTIONS_PUZZLES[randomIndex];
}
