import { useCallback } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as AC from "@bacons/apple-colors";
import { Line, Player } from "./use-dots-game";

const PLAYER_COLORS: Record<Player, string> = {
  1: AC.systemBlue as string,
  2: AC.systemRed as string,
};

const PLAYER_BOX_COLORS: Record<Player, string> = {
  1: AC.systemBlue as string,
  2: AC.systemRed as string,
};

const DOT_SIZE = 14;
const LINE_THICKNESS = 5;
const UNDRAWN_OPACITY = 0.15;

interface GameBoardProps {
  rows: number;
  cols: number;
  isLineDrawn: (line: Line) => boolean;
  boxes: { row: number; col: number; owner: Player | null }[][];
  currentPlayer: Player;
  gameOver: boolean;
  onPlaceLine: (line: Line) => void;
}

export default function GameBoard({
  rows,
  cols,
  isLineDrawn,
  boxes,
  currentPlayer,
  gameOver,
  onPlaceLine,
}: GameBoardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const maxBoardWidth = Math.min(windowWidth - 48, 400);
  const cellSize = Math.floor(maxBoardWidth / Math.max(rows, cols));
  const boardWidth = cellSize * cols + DOT_SIZE;
  const boardHeight = cellSize * rows + DOT_SIZE;

  return (
    <View
      style={{
        width: boardWidth,
        height: boardHeight,
        alignSelf: "center",
      }}
    >
      {/* Boxes */}
      {boxes.map((row, r) =>
        row.map((box, c) => (
          <BoxCell
            key={`box-${r}-${c}`}
            row={r}
            col={c}
            owner={box.owner}
            cellSize={cellSize}
          />
        ))
      )}

      {/* Horizontal lines */}
      {Array.from({ length: rows + 1 }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const line: Line = { row: r, col: c, orientation: "h" };
          const drawn = isLineDrawn(line);
          return (
            <HorizontalLine
              key={`h-${r}-${c}`}
              row={r}
              col={c}
              drawn={drawn}
              cellSize={cellSize}
              currentPlayer={currentPlayer}
              gameOver={gameOver}
              onPress={() => onPlaceLine(line)}
            />
          );
        })
      )}

      {/* Vertical lines */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols + 1 }, (_, c) => {
          const line: Line = { row: r, col: c, orientation: "v" };
          const drawn = isLineDrawn(line);
          return (
            <VerticalLine
              key={`v-${r}-${c}`}
              row={r}
              col={c}
              drawn={drawn}
              cellSize={cellSize}
              currentPlayer={currentPlayer}
              gameOver={gameOver}
              onPress={() => onPlaceLine(line)}
            />
          );
        })
      )}

      {/* Dots */}
      {Array.from({ length: rows + 1 }, (_, r) =>
        Array.from({ length: cols + 1 }, (_, c) => (
          <View
            key={`dot-${r}-${c}`}
            style={{
              position: "absolute",
              left: c * cellSize,
              top: r * cellSize,
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: DOT_SIZE / 2,
              backgroundColor: AC.label as string,
              zIndex: 10,
            }}
          />
        ))
      )}
    </View>
  );
}

function BoxCell({
  row,
  col,
  owner,
  cellSize,
}: {
  row: number;
  col: number;
  owner: Player | null;
  cellSize: number;
}) {
  if (!owner) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        position: "absolute",
        left: col * cellSize + DOT_SIZE / 2,
        top: row * cellSize + DOT_SIZE / 2,
        width: cellSize,
        height: cellSize,
        backgroundColor: PLAYER_BOX_COLORS[owner],
        opacity: 0.2,
        borderRadius: 4,
        borderCurve: "continuous",
      }}
    />
  );
}

function HorizontalLine({
  row,
  col,
  drawn,
  cellSize,
  currentPlayer,
  gameOver,
  onPress,
}: {
  row: number;
  col: number;
  drawn: boolean;
  cellSize: number;
  currentPlayer: Player;
  gameOver: boolean;
  onPress: () => void;
}) {
  const handlePress = useCallback(() => {
    if (drawn || gameOver) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [drawn, gameOver, onPress]);

  const color = drawn
    ? AC.label as string
    : (PLAYER_COLORS[currentPlayer] as string);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={{
        position: "absolute",
        left: col * cellSize + DOT_SIZE / 2,
        top: row * cellSize + DOT_SIZE / 2 - LINE_THICKNESS / 2,
        width: cellSize,
        height: LINE_THICKNESS,
        zIndex: 5,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: LINE_THICKNESS / 2,
          backgroundColor: color,
          opacity: drawn ? 0.8 : UNDRAWN_OPACITY,
        }}
      />
    </Pressable>
  );
}

function VerticalLine({
  row,
  col,
  drawn,
  cellSize,
  currentPlayer,
  gameOver,
  onPress,
}: {
  row: number;
  col: number;
  drawn: boolean;
  cellSize: number;
  currentPlayer: Player;
  gameOver: boolean;
  onPress: () => void;
}) {
  const handlePress = useCallback(() => {
    if (drawn || gameOver) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [drawn, gameOver, onPress]);

  const color = drawn
    ? AC.label as string
    : (PLAYER_COLORS[currentPlayer] as string);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={{
        position: "absolute",
        left: col * cellSize + DOT_SIZE / 2 - LINE_THICKNESS / 2,
        top: row * cellSize + DOT_SIZE / 2,
        width: LINE_THICKNESS,
        height: cellSize,
        zIndex: 5,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: LINE_THICKNESS / 2,
          backgroundColor: color,
          opacity: drawn ? 0.8 : UNDRAWN_OPACITY,
        }}
      />
    </Pressable>
  );
}
