import { Server } from "socket.io";
import http from "http"; //nativo de node
import express from "express";
import dotenv from "dotenv";
const app = express();
const server = http.createServer(app);

dotenv.config({});

const isDev = process.env.NODE_ENV !== "production";
const clientOrigin = isDev
  ? process.env.CLIENT_DEV_URI
  : process.env.CLIENT_PROD_URI;

console.log("origin:", clientOrigin);

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  console.log("=== NUEVA CONEXIÓN ===");
  console.log("Socket ID:", socket.id);
  console.log("Query params:", socket.handshake.query);
  console.log("Origin:", socket.handshake.headers.origin);
  console.log("====================");

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  //servidor emitiendo a los clientes connectados
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`El usuario: ${socket.id} se ha unido a la sala: ${roomId}`);
  });

  socket.on("sendRoomMessage", (roomId, message) => {
    io.to(roomId).emit("newGroupMessage", message);
  });

  socket.on("leaveRoom", (room_id, user_id, name) => {
    socket.leave(room_id);
    console.log(`El usuario: ${socket.id} ha salido de la sala: ${room_id}`);

    io.to(room_id).emit("memberLeft", {
      room_id,
      user_id,
      name,
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuario se desconecto:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };
