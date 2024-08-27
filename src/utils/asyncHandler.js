//promise based code
//The asyncHandler function is used to wrap asynchronous route handlers to ensure that any errors are properly caught and passed to the next middleware. This helps avoid the need for repetitive try-catch blocks in each route handler.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// higher order function which passes a function as its parameter
//try catch wala code
// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Server Error",
//     });
//   }
// };
