import express from "express";
import authRouter from "./routes/auth.route.js";
import messagesRouter from "./routes/messages.route.js";
import groupRouter from "./routes/group.routes.js";
import dotenv from "dotenv";
import { connectionDB } from "./lib/db.js";
import { errorMessage } from "./middlewares/handleErrorMessage.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import { app, server } from "./lib/socket.js";

dotenv.config({});

const isDev = process.env.NODE_ENV !== "production";
const clientOrigin = isDev
  ? process.env.CLIENT_DEV_URI
  : process.env.CLIENT_PROD_URI;

console.log(clientOrigin);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//servidor socket io
app.use(
  cors({
    origin: [process.env.CLIENT_DEV_URI, process.env.CLIENT_PROD_URI],
    methods: ["PUT", "DELETE", "POST", "GET"],
    credentials: true,
  }),
);

app.use(
  fileUpload({
    useTempFiles: true, //archivos temporales
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/groups", groupRouter);

app.use(errorMessage);

server.listen(PORT, () => {
  console.log(`Corriendo en: http://localhost:${PORT} ✅`);
  connectionDB();
});
