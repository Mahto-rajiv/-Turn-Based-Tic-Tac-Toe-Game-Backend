import jwt from "jsonwebtoken";
import User from "../models/User.js";
import GameRoom from "../models/GameRoom.js";

export const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("Authentication error"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    socket.on("joinRoom", async ({ roomId }) => {
      const room = await GameRoom.findById(roomId);
      if (room) {
        socket.join(roomId);
        if (room.players.length === 2) {
          io.to(roomId).emit("gameStart", { message: "Game started!", room });
        }
      }
    });

    socket.on("move", async ({ roomId, row, col }) => {
      const room = await GameRoom.findById(roomId);
      if (room && room.isActive) {
        io.to(roomId).emit("updateBoard", {
          row,
          col,
          player: socket.user._id,
        });
        if (room.winner || room.isDraw) {
          io.to(roomId).emit("gameEnd", {
            winner: room.winner,
            isDraw: room.isDraw,
          });
        }
      }
    });

    socket.on("requestRematch", async ({ roomId }) => {
      const room = await GameRoom.findById(roomId);
      if (room && !room.isActive) {
        io.to(roomId).emit("rematchRequested", {
          requestedBy: socket.user._id,
        });
      }
    });

    socket.on("acceptRematch", async ({ roomId }) => {
      const room = await GameRoom.findById(roomId);
      if (room && !room.isActive) {
        room.boardState = [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ];
        room.currentTurn = room.players[0];
        room.winner = null;
        room.isDraw = false;
        room.isActive = true;
        await room.save();
        io.to(roomId).emit("gameStart", { message: "Rematch started!", room });
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });
  });
};
