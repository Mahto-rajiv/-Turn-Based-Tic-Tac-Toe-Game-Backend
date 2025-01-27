import GameRoom from "../models/GameRoom.js";
import User from "../models/User.js";

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
};

export const makeMove = async (req, res) => {
  try {
    const { roomId, row, col } = req.body;
    const room = await GameRoom.findById(roomId);

    if (!room || !room.isActive) {
      return res.status(404).send({ error: "Game not found or inactive" });
    }

    if (!room.currentTurn) {
      return res.status(400).send({ error: "Game state is invalid" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).send({ error: "User not authenticated" });
    }

    if (room.currentTurn.toString() !== req.user._id.toString()) {
      return res.status(400).send({ error: "Not your turn" });
    }

    if (row < 0 || row > 2 || col < 0 || col > 2) {
      return res.status(400).send({ error: "Invalid move: Out of bounds" });
    }

    if (room.boardState[row][col] !== "") {
      return res
        .status(400)
        .send({ error: "Invalid move: Cell already occupied" });
    }

    room.boardState[row][col] =
      room.players[0].toString() === req.user._id.toString() ? "X" : "O";

    const flatBoard = room.boardState.flat();
    const winner = checkWinner(flatBoard);

    if (winner) {
      room.winner = req.user._id;
      room.isActive = false;
      await User.findByIdAndUpdate(req.user._id, { $inc: { wins: 1 } });
      const loser = room.players.find(
        (p) => p.toString() !== req.user._id.toString()
      );
      if (loser) {
        await User.findByIdAndUpdate(loser, { $inc: { losses: 1 } });
      }
    } else if (!flatBoard.includes("")) {
      room.isDraw = true;
      room.isActive = false;
      await User.updateMany(
        { _id: { $in: room.players } },
        { $inc: { draws: 1 } }
      );
    } else {
      const nextPlayer = room.players.find(
        (p) => p.toString() !== req.user._id.toString()
      );
      if (nextPlayer) {
        room.currentTurn = nextPlayer;
      } else {
        return res
          .status(400)
          .send({ error: "Unable to determine next player" });
      }
    }

    await room.save();
    res.send(room);
  } catch (error) {
    console.error("Error in makeMove:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ wins: -1 })
      .limit(10)
      .select("username wins losses draws");
    res.send(leaderboard);
  } catch (error) {
    res.status(400).send(error);
  }
};
