const express = require("express");
const { auth, my_message, my_tweet} = require("../../utils/auth");
const TweetsController = require("./tweets.controller")

const tweetsRouter = express.Router();


tweetsRouter.get(
    "/",
    TweetsController.getTweets
)

tweetsRouter.get(
    "/search",
    TweetsController.searchTweets
)

tweetsRouter.post(
    "/",
    auth,
    TweetsController.createTweet
)

tweetsRouter.post(
    "/like",
    auth,
    TweetsController.like
)

tweetsRouter.put(
    "/:type/:tweet_id",
    auth,
    my_tweet,
    TweetsController.editTweet
)

tweetsRouter.delete(
    "/:type/:tweet_id",
    auth,
    my_tweet,
    TweetsController.deleteTweet
)

module.exports = tweetsRouter;