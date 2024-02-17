const express = require("express");

const api = express.Router();

const messagesRouter = require("./messages/messages.route");
const userRouter = require("./user/user.route");
const videoRouter = require("./video/video.route");
const tweetRouter = require("./tweets/tweets.route");
const storyRouter = require("./stories/stories.route");
const codeRouter = require("./codes/codes.route");
const interactionsRouter = require("./interactions/interactions.route");

api.use("/message", messagesRouter);
api.use("/user", userRouter);
api.use("/video", videoRouter);
api.use("/tweet", tweetRouter);
api.use("/story", storyRouter);
api.use("/code", codeRouter);
api.use("/interaction", interactionsRouter);

api.use('/uploads', express.static('uploads'));
api.use('/photos', express.static('photos'));

module.exports = api