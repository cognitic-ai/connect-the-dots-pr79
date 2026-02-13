import { useCallback, useState } from "react";

export type Player = 1 | 2;

export interface Line {
  row: number;
  col: number;
  orientation: "h" | "v";
}

export interface Box {
  row: number;
  col: number;
  owner: Player | null;
}

function lineKey(line: Line): string {
  return `${line.orientation}-${line.row}-${line.col}`;
}

function createInitialLines(rows: number, cols: number): Set<string> {
  return new Set<string>();
}

function getBoxLines(row: number, col: number): Line[] {
  return [
    { row, col, orientation: "h" }, // top
    { row: row + 1, col, orientation: "h" }, // bottom
    { row, col, orientation: "v" }, // left
    { row, col: col + 1, orientation: "v" }, // right
  ];
}

function checkBoxCompleted(
  row: number,
  col: number,
  lines: Set<string>
): boolean {
  return getBoxLines(row, col).every((l) => lines.has(lineKey(l)));
}

export interface GameState {
  rows: number;
  cols: number;
  lines: Set<string>;
  boxes: Box[][];
  currentPlayer: Player;
  scores: [number, number];
  gameOver: boolean;
  winner: Player | null | "tie";
}

export function useDotsGame(rows = 4, cols = 4) {
  const [state, setState] = useState<GameState>(() => createInitialState(rows, cols));

  const placeLine = useCallback(
    (line: Line) => {
      setState((prev) => {
        if (prev.gameOver) return prev;
        const key = lineKey(line);
        if (prev.lines.has(key)) return prev;

        const newLines = new Set(prev.lines);
        newLines.add(key);

        const newBoxes = prev.boxes.map((r) => r.map((b) => ({ ...b })));
        let boxesCompleted = 0;

        // Check all adjacent boxes
        const adjacentBoxes = getAdjacentBoxes(line, prev.rows, prev.cols);
        for (const ab of adjacentBoxes) {
          if (
            !newBoxes[ab.row][ab.col].owner &&
            checkBoxCompleted(ab.row, ab.col, newLines)
          ) {
            newBoxes[ab.row][ab.col].owner = prev.currentPlayer;
            boxesCompleted++;
          }
        }

        const newScores: [number, number] = [...prev.scores];
        newScores[prev.currentPlayer - 1] += boxesCompleted;

        const totalBoxes = prev.rows * prev.cols;
        const totalFilled = newScores[0] + newScores[1];
        const gameOver = totalFilled === totalBoxes;

        let winner: Player | null | "tie" = null;
        if (gameOver) {
          if (newScores[0] > newScores[1]) winner = 1;
          else if (newScores[1] > newScores[0]) winner = 2;
          else winner = "tie";
        }

        // If player completed a box, they get another turn
        const nextPlayer: Player =
          boxesCompleted > 0 ? prev.currentPlayer : prev.currentPlayer === 1 ? 2 : 1;

        return {
          ...prev,
          lines: newLines,
          boxes: newBoxes,
          currentPlayer: nextPlayer,
          scores: newScores,
          gameOver,
          winner,
        };
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState(createInitialState(rows, cols));
  }, [rows, cols]);

  const isLineDrawn = useCallback(
    (line: Line) => state.lines.has(lineKey(line)),
    [state.lines]
  );

  return { ...state, placeLine, reset, isLineDrawn };
}

function createInitialState(rows: number, cols: number): GameState {
  const boxes: Box[][] = [];
  for (let r = 0; r < rows; r++) {
    boxes[r] = [];
    for (let c = 0; c < cols; c++) {
      boxes[r][c] = { row: r, col: c, owner: null };
    }
  }
  return {
    rows,
    cols,
    lines: createInitialLines(rows, cols),
    boxes,
    currentPlayer: 1,
    scores: [0, 0],
    gameOver: false,
    winner: null,
  };
}

function getAdjacentBoxes(
  line: Line,
  rows: number,
  cols: number
): { row: number; col: number }[] {
  const result: { row: number; col: number }[] = [];
  if (line.orientation === "h") {
    // Horizontal line: box above (row-1, col) and box below (row, col)
    if (line.row > 0) result.push({ row: line.row - 1, col: line.col });
    if (line.row < rows) result.push({ row: line.row, col: line.col });
  } else {
    // Vertical line: box left (row, col-1) and box right (row, col)
    if (line.col > 0) result.push({ row: line.row, col: line.col - 1 });
    if (line.col < cols) result.push({ row: line.row, col: line.col });
  }
  return result;
}
