import { check, param } from "express-validator";

export const validateParamsId = [
  param("id")
    .notEmpty()
    .withMessage("Parametro vacio, ingrese el id")
    .isMongoId()
    .withMessage("Ingrese un ID de mongoDB válido"),
];
