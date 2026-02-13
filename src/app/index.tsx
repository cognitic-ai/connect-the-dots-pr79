import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as AC from "@bacons/apple-colors";
import GameBoard from "@/components/game-board";
import { useDotsGame, Player } from "@/components/use-dots-game";

const PLAYER_COLORS: Record<Player, string> = {
  1: AC.systemBlue as string,
  2: AC.systemRed as string,
};

export default function GameScreen() {
  const game = useDotsGame(4, 4);

  const handleReset = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    game.reset();
  }, [game.reset]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 28,
      }}
      style={{ backgroundColor: AC.systemBackground as string }}
    >
      {/* Scoreboard */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <ScoreCard
          label="Player 1"
          score={game.scores[0]}
          color={PLAYER_COLORS[1]}
          active={!game.gameOver && game.currentPlayer === 1}
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: AC.secondaryLabel as string,
          }}
        >
          vs
        </Text>
        <ScoreCard
          label="Player 2"
          score={game.scores[1]}
          color={PLAYER_COLORS[2]}
          active={!game.gameOver && game.currentPlayer === 2}
        />
      </View>

      {/* Turn indicator */}
      {!game.gameOver && (
        <Animated.View entering={FadeIn.duration(200)}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: PLAYER_COLORS[game.currentPlayer],
            }}
          >
            Player {game.currentPlayer}'s turn
          </Text>
        </Animated.View>
      )}

      {/* Game Over message */}
      {game.gameOver && (
        <Animated.View entering={FadeInUp.duration(400)} style={{ alignItems: "center", gap: 4 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: AC.label as string,
            }}
          >
            {game.winner === "tie"
              ? "It's a Tie!"
              : `Player ${game.winner} Wins!`}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: AC.secondaryLabel as string,
            }}
          >
            {game.scores[0]} - {game.scores[1]}
          </Text>
        </Animated.View>
      )}

      {/* Game Board */}
      <GameBoard
        rows={game.rows}
        cols={game.cols}
        isLineDrawn={game.isLineDrawn}
        boxes={game.boxes}
        currentPlayer={game.currentPlayer}
        gameOver={game.gameOver}
        onPlaceLine={game.placeLine}
      />

      {/* New Game button */}
      <Pressable
        onPress={handleReset}
        style={({ pressed }) => ({
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 14,
          borderCurve: "continuous",
          backgroundColor: pressed
            ? (AC.systemGray4 as string)
            : (AC.secondarySystemBackground as string),
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        })}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: AC.systemBlue as string,
            textAlign: "center",
          }}
        >
          New Game
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function ScoreCard({
  label,
  score,
  color,
  active,
}: {
  label: string;
  score: number;
  color: string;
  active: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderCurve: "continuous",
        backgroundColor: AC.secondarySystemBackground as string,
        alignItems: "center",
        gap: 6,
        borderWidth: active ? 2.5 : 0,
        borderColor: active ? color : "transparent",
        boxShadow: active ? `0 0 12px ${color}33` : "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          opacity: active ? 1 : 0.5,
        }}
      />
      <Text
        selectable
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: AC.secondaryLabel as string,
        }}
      >
        {label}
      </Text>
      <Text
        selectable
        style={{
          fontSize: 32,
          fontWeight: "bold",
          fontVariant: ["tabular-nums"],
          color: color,
        }}
      >
        {score}
      </Text>
    </View>
  );
}
