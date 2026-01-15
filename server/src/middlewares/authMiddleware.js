import jwt from "jsonwebtoken";
import { ErrorResponse } from "../utils/errorResponse.js";

export const verifyUserToken = (req, res, next) => {
  const token = req.cookies.userToken;

  if (!token) {
    return next(
      new ErrorResponse(
        "No se proporciona el token, autorización denegada.",
        401,
        null,
        false
      )
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("Token inválido", 401, null, false));
  }
};
