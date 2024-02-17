const express = require("express");
const UserController = require("./user.controller")
const { auth } = require("../../utils/auth");
const userRouter = express.Router();

userRouter.post(
    "/upload",
    auth,
    UserController.updatePhoto
)

userRouter.post(
    "/",
    UserController.createUser
)

userRouter.post(
    "/login",
    UserController.loginUser
)


userRouter.get(
    "/notifications",
    auth,
    UserController.getNotifications
)

userRouter.get(
    "/:username",
    UserController.getProfile
)


userRouter.get(
    "/",
    auth,
    UserController.getUser
)


userRouter.put(
    "/",
    auth,
    UserController.updateType
)


userRouter.delete(
    "/",
    auth,
    UserController.deleteUser
)

module.exports = userRouter;