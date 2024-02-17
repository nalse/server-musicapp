const express = require("express");
const InteractionsController = require("./interactions.controller");
const { auth } = require("../../utils/auth");

const interactionsRouter = express.Router();

interactionsRouter.post(
    "/",
    auth,
    InteractionsController.createInteraction
)

interactionsRouter.put(
    "/seen",
    auth,
    InteractionsController.seen
)

interactionsRouter.put(
    "/",
    auth,
    InteractionsController.updateStatus
)


// interactionsRouter.get(
//     "/",
//     InteractionsController.getInteraction
// )

// userRouter.delete(
//     "/",
//     UserController.deleteUser
// )

module.exports = interactionsRouter;