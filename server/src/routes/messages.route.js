import express from "express";
import { verifyUserToken } from "../middlewares/authMiddleware.js";
import {
  getMessages,
  getUsersForSideBar,
  sendMessage,
} from "../controllers/messages.controller.js";
import { validateParamsId } from "../validators/messages.validators.js";

const router = express.Router();

router.get("/users", verifyUserToken, getUsersForSideBar);
router.get("/:id", verifyUserToken, validateParamsId, getMessages);

router.post("/send/:id", verifyUserToken, sendMessage);

export default router;
