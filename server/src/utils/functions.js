export const mapValidationErrors = (errors) => {
  const mappedErrors = errors.array().map((err) => ({
    path: err.path,
    msg: err.msg,
  }));

  return mappedErrors;
};
