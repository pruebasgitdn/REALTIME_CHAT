export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJWT(); //del modelo
  const cookieName = "userToken";

  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  res.status(statusCode).cookie(cookieName, token, cookieOptions).json({
    succes: true,
    message,
    user,
    token,
  });
};
