import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import { mapValidationErrors } from "../utils/functions.js";
import { SuccessResponse } from "../utils/successResponse.js";
import { validationResult } from "express-validator";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSideBar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const filteredUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    res
      .status(200)
      .json(
        new SuccessResponse(
          "Usuarios econtrados con éxito",
          filteredUsers,
          true,
          filteredUsers.length
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { id: userId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: myId },
        { senderId: myId, receiverId: userId },
      ],
    });

    if (!messages || messages.length === 0) {
      return next(
        new ErrorResponse(
          "No se encontraron mensajes entre estos dos usuarios",
          404,
          null,
          false
        )
      );
    }

    res
      .status(200)
      .json(
        new SuccessResponse(
          "Mensajes encontrados con éxito",
          messages,
          true,
          messages.length
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { image } = req.files || {};
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    const allowedFormats = ["image/png", "image/jpeg"];
    let photoData = {};
    if (image) {
      if (!allowedFormats.includes(image.mimetype)) {
        return next(
          new ErrorResponse(
            `Error, el archivo ${image.originalname} no es una imagen`,
            400,
            null,
            false
          )
        );
      }

      const photoCloudinaryResponse = await cloudinary.uploader.upload(
        image.tempFilePath
      );
      if (!photoCloudinaryResponse) {
        console.error("Error en Cloudinary:", photoCloudinaryResponse);
        new ErrorResponse(
          `Error al subir el archivo a Cloudinary`,
          400,
          null,
          false
        );
      }

      photoData = {
        public_id: photoCloudinaryResponse.public_id,
        url: photoCloudinaryResponse.secure_url,
      };
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: photoData,
    });

    await newMessage.save();

    //funcionalidad en tiempo real
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res
      .status(201)
      .json(new SuccessResponse("Mensaje enviado con exito", newMessage, true));
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};
