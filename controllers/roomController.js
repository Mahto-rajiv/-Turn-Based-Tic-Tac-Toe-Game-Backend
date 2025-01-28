import GameRoom from "../models/GameRoom.js";
import { generateJoinCode } from "../utils/helpers.js";

export const createRoom = async (req, res) => {
  try {
    const { roomName, isPrivate } = req.body;
    const room = new GameRoom({
      roomName,
      createdBy: req.user._id,
      isPrivate,
      joinCode: isPrivate ? generateJoinCode() : undefined,
      players: [req.user._id],
      boardState: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      currentTurn: req.user._id,
    });
    await room.save();
    res.status(201).send(room);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId, joinCode } = req.body;
    const room = await GameRoom.findOne({
      $or: [{ _id: roomId }, { joinCode }],
      isActive: true,
    });

    if (!room) {
      return res.status(404).send({ error: "Room not found" });
    }

    if (room.players.length >= 2) {
      room.spectators.push(req.user._id);
    } else {
      room.players.push(req.user._id);
    }

    await room.save();
    res.send(room);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const listActiveRooms = async (req, res) => {
  try {
    const rooms = await GameRoom.find({
      isActive: true,
      isPrivate: false,
      players: { $size: 1 },
    }).populate("players", "username");
    res.send(rooms);
  } catch (error) {
    res.status(400).send(error);
  }
};
