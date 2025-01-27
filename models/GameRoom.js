import mongoose from "mongoose";

const gameRoomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPrivate: { type: Boolean, default: false },
  joinCode: { type: String, unique: true, sparse: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  boardState: [[String]],
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isDraw: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model("GameRoom", gameRoomSchema);
