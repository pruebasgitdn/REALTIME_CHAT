import { ErrorResponse } from "../utils/errorResponse.js";

export const preventIfLoggedIn = (req, res, next) => {
  const token = req.cookies.userToken;

  if (!token || token == undefined) {
    // no session -> dejar pasar
    return next();
  }

  try {
    return next(
      new ErrorResponse("Ya tienes una sesión iniciada", 400, null, false)
    );
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("Token expirado");
    } else if (err.name === "JsonWebTokenError") {
      console.log("Token inválido");
    }
    return next(); // dejar pasar para que pueda iniciar sesipn
  }
};
