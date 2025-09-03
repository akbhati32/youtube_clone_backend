// Handle 404 - Route not found
export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass error to errorHandler
};

// General error handler
export const errorHandler = (err, req, res, next) => {
  // If no status set, default to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Hide stack trace in production
    stack: process.env.NODE_ENV === "production" ? "" : err.stack,
  });
};
