const express = require("express");
const { auth, my_message } = require("../../utils/auth");
const MessagesController = require("./messages.controller")

const messagesRouter = express.Router();

messagesRouter.get(
    "/:reply_id",
    auth,
    MessagesController.getMessages
)

messagesRouter.post(
    "/",
    auth,
    MessagesController.createMessage
)

messagesRouter.post(
    "/like",
    auth,
    MessagesController.like
)


messagesRouter.delete(
    "/:video_id/:type/:message_id",
    auth,
    my_message,
    MessagesController.deleteMessage
)

messagesRouter.put(
    "/:type/:message_id",
    auth,
    my_message,
    MessagesController.editMessage
)

module.exports = messagesRouter;