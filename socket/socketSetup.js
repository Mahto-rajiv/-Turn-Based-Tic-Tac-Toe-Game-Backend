import { authenticateSocketToken } from "../middleware/auth.js";
import {
  handlePlayerMove,
  handleGameStart,
  handleGameEnd,
  handleRematchRequest,
} from "./gameHandlers.js";

export const setupSocketIO = (io) => {
  io.use(authenticateSocketToken);

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Client joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`Client left room: ${roomId}`);
    });

    socket.on("playerMove", handlePlayerMove(io, socket));
    socket.on("gameStart", handleGameStart(io));
    socket.on("gameEnd", handleGameEnd(io));
    socket.on("rematchRequest", handleRematchRequest(io, socket));

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
