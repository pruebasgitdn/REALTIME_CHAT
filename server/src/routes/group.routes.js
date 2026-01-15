import express from "express";
import { verifyUserToken } from "../middlewares/authMiddleware.js";
import {
  createGroup,
  deleteGroup,
  editGroupImage,
  editGroupName,
  editMembers,
  getGroupMessages,
  GetGroupsWhereImMember,
  leaveGroup,
  sendGroupMessage,
  setNewAdmin,
} from "../controllers/group.controller.js";
import {
  validateCreateGroup,
  validateGroupId,
  validateNewAdmin,
} from "../validators/group.validators.js";

const router = express.Router();

router.post("/create", verifyUserToken, validateCreateGroup, createGroup);

router.get("/group_member", verifyUserToken, GetGroupsWhereImMember);

router.post(
  "/send_message/:id",
  verifyUserToken,
  validateGroupId,
  sendGroupMessage
);

router.get(
  "/get_messages/:id",
  verifyUserToken,
  validateGroupId,
  getGroupMessages
);

router.put("/edit_members/:id", verifyUserToken, validateGroupId, editMembers);

router.put("/edit_image/:id", verifyUserToken, validateGroupId, editGroupImage);

router.put("/edit_name/:id", verifyUserToken, validateGroupId, editGroupName);

router.put("/leave_group/:id", verifyUserToken, validateGroupId, leaveGroup);

router.put(
  "/new_admin_group/:id",
  verifyUserToken,
  validateNewAdmin,
  setNewAdmin
);

router.delete(
  "/delete_group/:id",
  verifyUserToken,
  validateGroupId,
  deleteGroup
);

export default router;
