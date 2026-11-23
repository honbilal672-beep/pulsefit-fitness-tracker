import { validationResult } from "express-validator";
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param || "field",
      message: err.msg,
      value: err.value
    }));
    res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || "Input validation failed",
      errors: formattedErrors
    });
    return;
  }
  next();
};
export {
  validateRequest
};
