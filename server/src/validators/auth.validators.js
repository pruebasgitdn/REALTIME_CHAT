import { check } from "express-validator";

export const registerValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email vacío, ingrese el email")
    .isEmail()
    .withMessage("Ingrese un email válido"),

  check("password")
    .notEmpty()
    .withMessage("Contraseña vacía, ingrese una contraseña")
    .isLength({ min: 8, max: 10 })
    .withMessage("La contraseña debe contener entre 8 y 10 caracteres"),

  check("fullName")
    .notEmpty()
    .withMessage("Nombre vacío, ingrese el nombre")
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre debe contener entre 3 y 30 caracteres"),
];

export const loginValidation = [
  check("email")
    .notEmpty()
    .withMessage("Nombre vacio, ingrese el nombre")
    .isEmail()
    .withMessage("Ingrese un email valido"),

  check("password")
    .notEmpty()
    .withMessage("Contraseña vacia, ingrese una contraseña"),
  // .isLength({ max: 10 })
  // .withMessage("La contraseña debe contener maximo 10 caracteres"),
];

export const editProfileInfoValidation = [
  check("email").optional().isEmail().withMessage("Ingrese un email válido"),

  check("password")
    .optional()
    .isLength({ min: 8, max: 10 })
    .withMessage("La contraseña debe contener entre 8 y 10 caracteres"),

  check("fullName")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre debe contener entre 3 y 30 caracteres"),
];
