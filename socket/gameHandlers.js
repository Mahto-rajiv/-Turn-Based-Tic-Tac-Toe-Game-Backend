import { GameRoom } from "../models/GameRoom.model.js";
import { User } from "../models/User.model.js";
import { checkWinner, isBoardFull } from "../utils/gameUtils.js";

export const handlePlayerMove =
  (io, socket) =>
  async ({ roomId, row, col }) => {
    try {
      const gameRoom = await GameRoom.findById(roomId);
      if (!gameRoom || !gameRoom.isActive) return;

      if (gameRoom.currentTurn.toString() !== socket.user._id.toString())
        return;

      if (gameRoom.boardState[row][col] !== "") return;

      const playerSymbol =
        gameRoom.players[0].toString() === socket.user._id.toString()
          ? "X"
          : "O";
      gameRoom.boardState[row][col] = playerSymbol;

      const winner = checkWinner(gameRoom.boardState);
      if (winner) {
        gameRoom.winner = socket.user._id;
        gameRoom.isActive = false;
        await updatePlayerStats(socket.user._id, "win");
        await updatePlayerStats(
          gameRoom.players.find(
            (p) => p.toString() !== socket.user._id.toString()
          ),
          "loss"
        );
      } else if (isBoardFull(gameRoom.boardState)) {
        gameRoom.isDraw = true;
        gameRoom.isActive = false;
        await updatePlayerStats(gameRoom.players[0], "draw");
        await updatePlayerStats(gameRoom.players[1], "draw");
      } else {
        gameRoom.currentTurn = gameRoom.players.find(
          (p) => p.toString() !== socket.user._id.toString()
        );
      }

      await gameRoom.save();

      io.to(roomId).emit("gameUpdate", {
        boardState: gameRoom.boardState,
        currentTurn: gameRoom.currentTurn,
        winner: gameRoom.winner,
        isDraw: gameRoom.isDraw,
      });
    } catch (error) {
      console.error("Error handling player move:", error);
    }
  };

export const handleGameStart = (io) => async (roomId) => {
  try {
    const gameRoom = await GameRoom.findById(roomId);
    if (!gameRoom || gameRoom.players.length !== 2) return;

    gameRoom.currentTurn = gameRoom.players[Math.floor(Math.random() * 2)];
    gameRoom.boardState = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    gameRoom.winner = null;
    gameRoom.isDraw = false;
    gameRoom.isActive = true;

    await gameRoom.save();

    io.to(roomId).emit("gameStarted", {
      boardState: gameRoom.boardState,
      currentTurn: gameRoom.currentTurn,
    });
  } catch (error) {
    console.error("Error starting game:", error);
  }
};

export const handleGameEnd = (io) => async (roomId) => {
  try {
    const gameRoom = await GameRoom.findById(roomId);
    if (!gameRoom) return;

    gameRoom.isActive = false;
    await gameRoom.save();

    io.to(roomId).emit("gameEnded", {
      winner: gameRoom.winner,
      isDraw: gameRoom.isDraw,
    });
  } catch (error) {
    console.error("Error ending game:", error);
  }
};

export const handleRematchRequest = (io, socket) => async (roomId) => {
  try {
    const gameRoom = await GameRoom.findById(roomId);
    if (!gameRoom) return;

    if (!gameRoom.rematchRequests) {
      gameRoom.rematchRequests = new Set();
    }

    gameRoom.rematchRequests.add(socket.user._id.toString());

    if (gameRoom.rematchRequests.size === 2) {
      // Both players have requested a rematch
      await handleGameStart(io)(roomId);
      gameRoom.rematchRequests.clear();
    } else {
      // Notify the other player about the rematch request
      io.to(roomId).emit("rematchRequested", { requestedBy: socket.user._id });
    }

    await gameRoom.save();
  } catch (error) {
    console.error("Error handling rematch request:", error);
  }
};

const updatePlayerStats = async (userId, result) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (result === "win") user.wins++;
    else if (result === "loss") user.losses++;
    else if (result === "draw") user.draws++;

    await user.save();
  } catch (error) {
    console.error("Error updating player stats:", error);
  }
};
