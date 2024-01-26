import { AppError } from "./app-error.js";


export function errorHandler(err, req, res) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).send({
      message: err.message,
    });
  }
  // If it's not an instance of AppError, we consider it as a generic
  // error
  res.status(500).send({
    message: "Internal server error",
  });
  console.error(err);
}
