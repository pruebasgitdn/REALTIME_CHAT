export const errorMessage = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const success = err.success || false;
  const errors = err.errors || [];
  const message = err.message || "Error interno del servidor";
  res.status(statusCode).json({
    success: success,
    message: message,
    totalErrors: errors.length,
    errors: errors.length > 0 ? errors : null,
  });
};
