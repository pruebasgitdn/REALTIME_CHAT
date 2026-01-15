import express from "express";
import { preventIfLoggedIn } from "../middlewares/preventLoggedIn.js";
import {
  editProfileInfoValidation,
  loginValidation,
  registerValidation,
} from "../validators/auth.validators.js";
import {
  check,
  editProfile,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import { verifyUserToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginValidation, login);

router.post("/register", registerValidation, register);

router.put(
  "/edit_profile",
  verifyUserToken,
  editProfileInfoValidation,
  editProfile
);

router.get("/logout", verifyUserToken, logout);

router.get("/check", verifyUserToken, check);

export default router;
