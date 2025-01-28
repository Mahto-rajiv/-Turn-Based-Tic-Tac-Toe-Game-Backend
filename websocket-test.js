import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:3000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OTg2NGJlYzM1MDMxNDk1NTViMzVlNiIsImlhdCI6MTczODA0MzczOX0.xB_Wh7opjDruwVscZNAA7DL8im9Il-6ArSa6_k2c_wU",
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("connect", () => {
  console.log("Connected to server");
  rl.question("Enter room ID to join: ", (roomId) => {
    socket.emit("joinRoom", { roomId });
  });
});

socket.on("gameStart", (data) => {
  console.log("Game started:", data);
});

socket.on("updateBoard", (data) => {
  console.log("Board updated:", data);
});

socket.on("gameEnd", (data) => {
  console.log("Game ended:", data);
});

socket.on("rematchRequested", (data) => {
  console.log("Rematch requested:", data);
});

socket.on("playerDisconnected", (data) => {
  console.log("Player disconnected:", data);
});

socket.on("gameOver", (data) => {
  console.log("Game over:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

rl.on("line", (input) => {
  if (input.toLowerCase() === "quit") {
    socket.disconnect();
    rl.close();
  }
});
