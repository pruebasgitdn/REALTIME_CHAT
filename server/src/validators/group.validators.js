import { check, param } from "express-validator";
import mongoose from "mongoose";

export const validateCreateGroup = [
  check("groupName")
    .notEmpty()
    .withMessage("Ingrese el nombre del grupo")
    .isLength({ min: 3, max: 35 })
    .withMessage("Nombre del grupo minimo 3 caracteres y maximo 35"),

  check("members").notEmpty().withMessage("Ingrese los miembros del grupo"),
  // .custom((value) => {
  //   const members = value.split(",");
  //   for (let i = 0; i < members.length; i++) {
  //     if (!mongoose.Types.ObjectId.isValid(members[i])) {
  //       throw new Error("Ingrese un id valido de Mongo para cada miembro");
  //     }
  //   }
  //   return true;
  // }),

  // check("createdBy")
  //   .notEmpty()
  //   .withMessage("Ingrese el creador del grupo")
  //   .isMongoId()
  //   .withMessage("Ingrese un id valido de Mongo"),
];

export const validateGroupId = [
  param("id")
    .notEmpty()
    .withMessage("Ingrese el nombre del grupo al cual enviar los mensajes")
    .isMongoId()
    .withMessage("Ingrese un id valido de Mongo"),
];

export const validateNewAdmin = [
  param("id")
    .notEmpty()
    .withMessage("Ingrese el nombre del grupo al cual enviar los mensajes")
    .isMongoId()
    .withMessage("Ingrese un id valido de Mongo"),

  check("new_admin_id")
    .notEmpty()
    .withMessage("Ingrese id de nuevo admin")
    .isMongoId()
    .withMessage("Ingrese un id valido de Mongo"),
];
