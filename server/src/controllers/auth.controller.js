import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import { SuccessResponse } from "../utils/successResponse.js";
import { generateToken } from "../middlewares/jwtToken.js";
import { mapValidationErrors } from "../utils/functions.js";
import cloudinary from "cloudinary";
import { io } from "../lib/socket.js";

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { fullName, email, password } = req.body;
    const { profilePic } = req.files || {};

    const isRegistered = await User.findOne({
      email,
    });

    if (isRegistered) {
      return next(
        new ErrorResponse(
          `Error, el correo ${email} ya esta registrado`,
          400,
          null,
          false
        )
      );
    }

    const allowedFormats = ["image/png", "image/jpeg"];
    let photoData = {};

    if (profilePic) {
      if (!allowedFormats.includes(profilePic.mimetype)) {
        return next(
          new ErrorResponse(
            `Error, el archivo ${profilePic.originalname} no es una imagen`,
            400,
            null,
            false
          )
        );
      }

      const photoCloudinaryResponse = await cloudinary.uploader.upload(
        profilePic.tempFilePath
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

    const user = await User.create({
      email,
      fullName,
      password,
      profilePic: photoData,
    });

    if (!user || user === undefined || user === null) {
      return next(
        new ErrorResponse(
          `Error, no se pudo crear el usuario`,
          400,
          null,
          false
        )
      );
    }

    //emitir la creacion del tan para actualizar el cliente
    const publicUser = user.toObject();
    delete publicUser.password;
    io.emit("userCreated", publicUser);

    generateToken(
      user,
      "REGISTRO EXITOSO - con credenciales exitosas",
      200,
      res
    );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user == null || user === undefined) {
      return next(
        new ErrorResponse(`El usuario: ${email} , no existe`, 404, null, false)
      );
    }

    const comparePassword = await user.comparePassword(password);

    if (!comparePassword) {
      return next(
        new ErrorResponse("Credenciales incorrectas", 403, null, false)
      );
    }

    generateToken(
      user,
      "INICIO DE SESION EXITOSO - con credenciales exitosas",
      200,
      res
    );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse("ERROR interno del servidor", 500, null, false)
    );
  }
};

export const editProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { email, password, fullName } = req.body || {};
    const { profilePic } = req.files || {};
    const id = req.user.id;

    const user = await User.findById(id);

    if (!user || user == undefined || user == null || user.lenght < 0) {
      return next(new ErrorResponse("Usuario no encontrado", 404, null, false));
    }

    if (profilePic) {
      //eliminar foto actual
      if (user.profilePic?.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
      }

      // Subir la nueva foto a Cloudinary
      const photoCloudinaryResponse = await cloudinary.uploader.upload(
        profilePic.tempFilePath
      );

      if (!photoCloudinaryResponse) {
        return next(
          new ErrorResponse(
            "Error al subir la nueva foto a Cloudinary",
            403,
            null,
            false
          )
        );
      }

      user.profilePic = {
        public_id: photoCloudinaryResponse.public_id,
        url: photoCloudinaryResponse.secure_url,
      };
    }

    if (email && email != user.email) {
      user.email = email;
    }
    if (password && password != user.password) {
      user.password = password;
    }
    if (fullName && fullName != user.fullName) {
      user.fullName = fullName;
    }

    const updatedUser = await user.save();

    if (
      !updatedUser ||
      updatedUser == undefined ||
      updatedUser == null ||
      updatedUser.lenght < 0
    ) {
      return next(
        new ErrorResponse(
          "ERROR: El usuario no se pudo editar",
          403,
          null,
          false
        )
      );
    }

    res
      .status(200)
      .json(
        new SuccessResponse("Usuario editado con éxito", updatedUser, true)
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const logout = async (req, res, next) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(0),
    };

    res
      .status(200)
      .cookie("userToken", "", cookieOptions)
      .json(new SuccessResponse("Sesion cerrada correctamente!!"));
    console.log("Sesion cerrada!");
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const check = async (req, res, next) => {
  try {
    const verifyUser = await User.findById(req.user.id);

    if (!verifyUser) {
      return next(new ErrorResponse("Usuario no encontrado", 404, null, false));
    }
    res
      .status(200)
      .json(
        new SuccessResponse(
          "Usuario encontrado con éxito",
          verifyUser,
          true,
          1,
          req.cookies.userToken
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};
