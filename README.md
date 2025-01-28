# Tic-Tac-Toe Game Backend

A real-time multiplayer Tic-Tac-Toe game backend built with Node.js, Express, MongoDB, and Socket.IO.

## Features

- 👥 User authentication with JWT
- 🎮 Real-time game updates using WebSocket
- 🏠 Game room management (public/private rooms)
- 📊 Leaderboard system
- 🔄 Rematch functionality
- 👀 Game state tracking
- 🎯 Move validation
- 🏆 Win/Draw detection

## Technologies

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JSON Web Tokens (JWT)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mahto-rajiv/-Turn-Based-Tic-Tac-Toe-Game-Backend
   cd -Turn-Based-Tic-Tac-Toe-Game-Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/tic-tac-toe
   JWT_SECRET=your_jwt_secret_here
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

#### Register User

- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

#### Login

- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "_id": "string",
      "username": "string"
    },
    "token": "string"
  }
  ```

### Game Rooms

#### Create Room

- **POST** `/api/room/create`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "roomName": "string",
    "isPrivate": true
  }
  ```

#### Join Room

- **POST** `/api/room/join`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "roomId": "string",
    "joinCode": "string" // Optional, required for private rooms
  }
  ```

#### List Active Rooms

- **GET** `/api/room/list`
- **Headers:** `Authorization: Bearer <token>`

### Game Play

#### Make Move

- **POST** `/api/game/move`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "roomId": "string",
    "row": 0,
    "col": 0
  }
  ```

#### Request Rematch

- **POST** `/api/game/request-rematch`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "roomId": "string"
  }
  ```

#### Accept Rematch

- **POST** `/api/game/accept-rematch`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "roomId": "string"
  }
  ```

#### Get Leaderboard

- **GET** `/api/game/leaderboard`

## WebSocket Events

### Client Events (Emit)

1. `joinRoom`

   - Payload: `{ roomId: "string" }`
   - Description: Join a game room

2. `move`
   - Payload: `{ roomId: "string", row: 0, col: 0 }`
   - Description: Make a move in the game

### Server Events (Listen)

1. `gameStart`

   - Payload:
     ```json
     {
       "message": "string",
       "room": {
         "id": "string",
         "players": [
           {
             "id": "string",
             "username": "string"
           }
         ],
         "currentTurn": "string"
       }
     }
     ```

2. `updateBoard`

   - Payload:
     ```json
     {
       "row": 0,
       "col": 0,
       "player": "string",
       "boardState": []
     }
     ```

3. `gameEnd`

   - Payload:
     ```json
     {
       "result": "win | draw",
       "winner": "string",
       "isDraw": true
     }
     ```

4. `rematchRequested`

   - Payload: `{ requestedBy: "string" }`

5. `playerDisconnected`
   - Payload: `{ player: "string" }`

## Testing

### API Testing with Postman

1. Import the provided Postman collection.
2. Set up environment variables in Postman:
   - `baseUrl`: Your server's URL (e.g., `http://localhost:3000`)
   - `authToken`: JWT token received after login
   - `roomId`: ID of the game room

### Testing Process

1. **User Authentication:**

   - Register two users.
   - Log in with both users to get auth tokens.

2. **Game Room:**

   - Create a room with the first user.
   - Join the room with the second user.
   - Verify room listing functionality.

3. **Gameplay:**
   - Make alternating moves between users.
   - Verify win/draw conditions.
   - Test rematch functionality.

### WebSocket Testing

Use the provided WebSocket test script:

```javascript
// websocket-test.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "YOUR_AUTH_TOKEN",
  },
});

socket.on("connect", () => {
  console.log("Connected to server");
});

// Add event listeners for testing
socket.on("gameStart", (data) => console.log("Game started:", data));
socket.on("updateBoard", (data) => console.log("Board updated:", data));
socket.on("gameEnd", (data) => console.log("Game ended:", data));
```

Run the test script:

```bash
node websocket-test.js
```

## Project Structure

```
tic-tac-toe-backend/
├── controllers/
│   ├── authController.js
│   ├── gameController.js
│   └── roomController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── GameRoom.js
├── routes/
│   ├── authRoutes.js
│   ├── gameRoutes.js
│   └── roomRoutes.js
├── utils/
│   ├── socketManager.js
│   └── helpers.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a new Pull Request.
