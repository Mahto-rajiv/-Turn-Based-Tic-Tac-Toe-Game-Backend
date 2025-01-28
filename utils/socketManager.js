import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const setupSocketHandlers = (io) => {
  // Debug middleware to log socket connections
  io.use((socket, next) => {
    console.log("Socket middleware: New connection attempt");
    next();
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log("Socket authentication failed: No token provided");
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        console.log("Socket authentication failed: User not found");
        return next(new Error("Authentication error"));
      }

      console.log(`Socket authenticated for user: ${user.username}`);
      socket.user = user;
      next();
    } catch (error) {
      console.log("Socket authentication error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New socket connection established:", socket.id);

    socket.on("joinRoom", async ({ roomId }) => {
      console.log(`Socket ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      io.to(roomId).emit("userJoined", {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Debug event to monitor room joins
  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  });

  return io;
};
