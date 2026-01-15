import { ErrorResponse } from "../utils/errorResponse.js";
import { mapValidationErrors } from "../utils/functions.js";
import { SuccessResponse } from "../utils/successResponse.js";
import { validationResult } from "express-validator";
import Group from "../models/group.model.js";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { groupName, members } = req.body;
    const { groupImage } = req.files || {};
    const creator_id = req.user.id;

    if (Array.isArray(members)) {
      if (members.length < 2) {
        return next(
          new ErrorResponse(
            `Debes introducir al menos 2 o mas miembros `,
            400,
            null,
            false
          )
        );
      }
    }

    const allowedFormats = ["image/png", "image/jpeg"];
    let photoData = {};

    if (groupImage) {
      if (!allowedFormats.includes(groupImage.mimetype)) {
        return next(
          new ErrorResponse(
            `Error, el archivo ${groupImage.originalname} no es una imagen`,
            400,
            null,
            false
          )
        );
      }

      const photoCloudinaryResponse = await cloudinary.uploader.upload(
        groupImage.tempFilePath
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

    const newGroup = new Group({
      groupName: groupName,
      members: [...members, creator_id],
      createdBy: creator_id,
      groupImage: photoData,
    });

    const savedGroup = await newGroup.save();

    let socketId = [];
    savedGroup.members.map((mp) => {
      socketId = getReceiverSocketId(mp);
      console.log(socketId);

      if (socketId) {
        io.to(socketId).emit("addedToNewGroup", savedGroup);
      }
    });

    res
      .status(201)
      .json(new SuccessResponse("Grupo creado con éxito", savedGroup, true));
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const GetGroupsWhereImMember = async (req, res, next) => {
  try {
    const id = req.user.id;

    const seek = await Group.find({
      $or: [{ members: id }, { createdBy: id }],
    });
    if (!seek || seek.length === 0) {
      return next(
        new ErrorResponse(`No eres miembro de ningun grupo`, 500, null, false)
      );
    }

    res
      .status(200)
      .json(
        new SuccessResponse(
          "Grupos encontrados con éxito",
          seek,
          true,
          seek.length
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const sendGroupMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { text } = req.body;
    const { image } = req.files || {};
    const { id: group_id } = req.params;
    const senderId = req.user.id;

    // TODO : verificar si esta antes en miembros

    const group = await Group.findById(group_id);

    if (!group) {
      return next(
        new ErrorResponse(
          `No se econtraron grupos por el id: ${group_id}`,
          400,
          null,
          false
        )
      );
    }
    // Verificar si el usuario es miembro del grupo
    if (!group.members.includes(senderId)) {
      return next(
        new ErrorResponse(
          `No se encontró al usuario ${senderId} en el grupo: ${group.groupName}`,
          400,
          null,
          false
        )
      );
    }

    if (!text && !image) {
      return next(
        new ErrorResponse(
          `No se envia contenido ni imagen ni texto, Porfavor ingrese alguna de las dos para enviar el mensaje`,
          400,
          null,
          false
        )
      );
    }

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
      groupId: group_id,
      text,
      image: photoData,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName email profilePic");

    //SERVIDOR AL GRUPO ID -> EMITIENDO EL EVENTO Y PASANDO EL MENSAJE
    io.to(group_id).emit("newGroupMessage", newMessage);

    res
      .status(201)
      .json(
        new SuccessResponse(
          "Mensaje enviado al grupo con éxito",
          newMessage,
          true
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const getGroupMessages = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { id: groupId } = req.params;

    const messages = await Message.find({ groupId }).populate(
      "senderId",
      "fullName email profilePic"
    );

    if (!messages || messages.length === 0) {
      return next(
        new ErrorResponse(
          "No se encontraron mensajes en este grupo",
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
          "Mensajes del grupo encontrados",
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

export const editMembers = async (req, res, next) => {
  try {
    //id grupo
    // miembros id para meter
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { id } = req.params;
    const my_id = req.user.id;
    const { membersId } = req.body;

    const group = await Group.findById(id);

    if (!group) {
      return next(
        new ErrorResponse(
          `No se encontro grupo por el id:${id}`,
          404,
          null,
          false
        )
      );
    }

    if (group.createdBy != my_id) {
      return next(
        new ErrorResponse(
          `No eres el Creador/Administrador del grupo, no tienes permiso para ejecutar esto`,
          400,
          null,
          false
        )
      );
    }

    if (!membersId || membersId == undefined || membersId == null) {
      return next(
        new ErrorResponse(
          `No se proporcionaron los ids de los miembros`,
          400,
          null,
          false
        )
      );
    }

    membersId.forEach((mem_id) => {
      const exits = group.members.includes(mem_id);

      if (exits) {
        group.members = group.members.filter(
          (gm_id) => String(gm_id) !== String(mem_id)
        );
        const socketId = getReceiverSocketId(mem_id);
        console.log(socketId);
        if (socketId) {
          io.to(socketId).emit("removedFromGroup", {
            _id: String(group._id),
            groupName: group.groupName,
            groupImage: group.groupImage,
            members: group.members.map(String),
            createdBy: String(group.createdBy),
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          });
        }
      } else {
        group.members.push(mem_id);

        const socketId = getReceiverSocketId(mem_id);
        console.log(socketId);
        if (socketId) {
          io.to(socketId).emit("addedToGroup", {
            _id: String(group._id),
            groupName: group.groupName,
            groupImage: group.groupImage,
            members: group.members.map(String),
            createdBy: String(group.createdBy),
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          });
        }
      }
    });

    await group.save();

    res
      .status(201)
      .json(
        new SuccessResponse(
          `Miembros actualizados con exito del grupo: ${group.groupName}`,
          group,
          true
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const editGroupImage = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const my_id = req.user.id;
    const { id: group_id } = req.params;
    const { groupImage } = req.files || {};

    const group = await Group.findById(group_id);

    if (!group) {
      return next(
        new ErrorResponse(
          `No se encontró grupos por el id asocioado: ${group_id}`,
          404,
          null,
          false
        )
      );
    }

    const allowedFormats = ["image/png", "image/jpeg"];
    let photoData = {};

    if (groupImage) {
      if (group.groupImage?.public_id) {
        await cloudinary.uploader.destroy(group.groupImage?.public_id);
      }

      // Subir la nueva foto a Cloudinary
      const photoCloudinaryResponse = await cloudinary.uploader.upload(
        groupImage.tempFilePath
      );

      if (!allowedFormats.includes(groupImage.mimetype)) {
        return next(
          new ErrorResponse(
            `Error, el archivo ${groupImage.originalname} no es una imagen`,
            400,
            null,
            false
          )
        );
      }

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
    } else if (!groupImage || groupImage == null) {
      return next(
        new ErrorResponse(`No se proporciona la imagen`, 400, null, false)
      );
    }

    if (group.createdBy != my_id) {
      return next(
        new ErrorResponse(
          `No eres el dueño o admn del grupo, no tienes permitido esta accion`,
          500,
          null,
          false
        )
      );
    }

    group.groupImage = photoData;

    const editedGroup = await group.save();

    let socketId = [];
    editedGroup.members.map((mp) => {
      socketId = getReceiverSocketId(mp);

      if (socketId) {
        io.to(socketId).emit("notifyChangeGroupEdited", editedGroup);
      }
    });

    //emitir

    res
      .status(201)
      .json(new SuccessResponse("Imagen editada con éxito", editedGroup, true));
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR INTERNO DEL SERVIDOR`, 500, null, false)
    );
  }
};

export const editGroupName = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const my_id = req.user.id;
    const { id: group_id } = req.params;
    const { groupName } = req.body || {};

    if (!groupName) {
      return next(
        new ErrorResponse(`Ingrese el nombre del grupo`, 404, null, false)
      );
    }

    const group = await Group.findById(group_id);

    if (!group) {
      return next(
        new ErrorResponse(
          `No se encontró grupos por el id asocioado: ${group_id}`,
          404,
          null,
          false
        )
      );
    }

    if (group.createdBy != my_id) {
      return next(
        new ErrorResponse(
          `No eres el dueño o admn del grupo, no tienes permitido esta accion`,
          500,
          null,
          false
        )
      );
    }

    group.groupName = groupName;

    const editedGroup = await group.save();

    let socketId = [];
    editedGroup.members.map((mp) => {
      socketId = getReceiverSocketId(mp);

      if (socketId) {
        io.to(socketId).emit("notifyChangeGroupNameEdited", editedGroup);
      }
    });

    //emitir

    res
      .status(201)
      .json(new SuccessResponse("Nombre editado con éxito", editedGroup, true));
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR INTERNO DEL SERVIDOR`, 500, null, false)
    );
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const my_id = req.user.id;
    const { id: group_id } = req.params;

    const group = await Group.findById(group_id);

    if (!group) {
      return next(
        new ErrorResponse(
          `No se encontró grupos por el id asocioado: ${group_id}`,
          404,
          null,
          false
        )
      );
    }

    if (String(group.createdBy) === my_id) {
      return next(
        new ErrorResponse(
          `Al ser el unico propietario/admin del grupo debes dejar un nuevo admin a cargo, asegurate de hacerlo antes de continuar con el proceso`,
          500,
          null,
          false
        )
      );
    }

    if (group.members.includes(my_id)) {
      group.members = group.members.filter((g) => String(g) != my_id);
    } else {
      return next(
        new ErrorResponse(
          `No eres miembro de este grupo, accion invalida`,
          500,
          null,
          false
        )
      );
    }

    await group.save();

    //emitir
    io.to(group_id).emit("memberLeft", {
      groupId: group_id,
      userId: my_id,
    });

    res
      .status(200)
      .json(
        new SuccessResponse(
          `Has abandonado el grupo: ${group.groupName}`,
          group,
          true
        )
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const setNewAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { id: id_group } = req.params;
    const my_id = req.user.id;
    const { new_admin_id } = req.body;

    const check = await Group.findById(id_group);
    if (!check) {
      return next(
        new ErrorResponse(
          `No se encontro el grupo por el id: ${id_group}`,
          500,
          null,
          false
        )
      );
    }

    if (String(check.createdBy) != String(my_id)) {
      return next(
        new ErrorResponse(
          `No eres el admin no tientes permiso para ejecutar esta accion`,
          400,
          null,
          false
        )
      );
    }

    const newAdmin = await User.findById(new_admin_id);
    if (!newAdmin) {
      return next(
        new ErrorResponse(
          `No se encontró al usuario con el id: ${new_admin_id}`,
          404,
          null,
          false
        )
      );
    }

    check.createdBy = new_admin_id;

    await check.save();

    res
      .status(200)
      .json(
        new SuccessResponse(`Nuevo admin seteado correctamente: `, check, true)
      );
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const mappedErrors = mapValidationErrors(errors);
      return next(
        new ErrorResponse("Errores de validacion", 404, mappedErrors, false)
      );
    }

    const { id: group_id } = req.params;
    const my_id = req.user.id;

    const group = await Group.findById(group_id);

    if (!group) {
      return next(
        new ErrorResponse(
          `El grupo por el ${group_id} no existe`,
          404,
          null,
          false
        )
      );
    }

    const check = String(group.createdBy) == String(my_id);

    if (!check) {
      return next(
        new ErrorResponse(
          `El usuario ${my_id} no es el administrador del grupo ${group.groupName}, ACCION INVALIDA`,
          404,
          null,
          false
        )
      );
    }

    let socketId = [];
    group.members.map((mp) => {
      socketId = getReceiverSocketId(mp);
      console.log(socketId);
      if (socketId) {
        io.to(socketId).emit("groupDeleted", {
          _id: String(group._id),
          groupName: group.groupName,
          groupImage: group.groupImage,
          members: group.members.map(String),
          createdBy: String(group.createdBy),
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        });
      }
    });

    await group.deleteOne();

    const groups = await Group.find();

    res
      .status(200)
      .json(
        new SuccessResponse(
          `Grupo eliminado con exito `,
          groups,
          true,
          groups.length,
          null
        )
      );

    // group.remove o d
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`ERROR interno del servidor`, 500, null, false)
    );
  }
};
