// asyncHandler is a higher order function. Higher order function means it takes another function as an argument and returns the function

const asyncHandler = (requestHandler) => {
    return (req, res, next) =>  {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    }
}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

export { asyncHandler };