const MessageModel = require("../models/messages/messages.model");
const ReplyModel = require("../models/replies/replies.model");
const UserModel = require("../models/users/users.model");
const TweetModel = require("../models/tweets/tweets.model");
const StoryModel = require("../models/stories/stories.model");

module.exports = {
    auth: async function (req, res, next) {
        if (!req.headers.authorization) {
            return res.status(403).json({ error: 'No credentials sent!' });
        }
        const authToken = req.headers.authorization;
        let user_id = "";
        if (authToken.startsWith("Bearer ")){
            user_id = authToken.substring(7, authToken.length);
        }
        if (!user_id) {
            return res.status(403).json({ error: 'No credentials sent!' });
        }

        if (await UserModel.getUserById(user_id)) {
            req.body.user_id = user_id;
        }
        else {
            return res.status(403).json({ error: 'Invalid credentials!' });
        }

        next();
    },
    my_message: function (req, res, next) {
        const { message_id, type } = req.params;
        const authToken = req.headers.authorization;
        let user_id = "";
        if (authToken.startsWith("Bearer ")){
            user_id = authToken.substring(7, authToken.length);
        }
        console.log(user_id)
        if (!message_id || !type || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        async function checkMyMessage(get) {
            try {
                const message = await get(message_id);
                if (message) {
                    console.log(message.user.toString(), user_id)
                    if (message.user.toString() === user_id) {
                        next();
                    }
                    else {
                        return res.status(403).json({ error: 'Unauthorized!' });
                    }
                }
                else {
                    return res.status(400).json({ message: "Invalid request" });
                }
            } catch (error) {
                return res.status(500).json({ message: "Something went wrong" });
            }
        }
        if (type === "message") {
            return checkMyMessage(MessageModel.getMessageById)
        }
        else if (type === "reply") {
            return checkMyMessage(ReplyModel.getReplyById)
        }
        else {
            return res.status(400).json({ message: "Invalid request" });
        }
    },

    my_tweet: function (req, res, next) {
        const { tweet_id, type } = req.params;
        const authToken = req.headers.authorization;
        let user_id = "";
        if (authToken.startsWith("Bearer ")){
            user_id = authToken.substring(7, authToken.length);
        }
        console.log(user_id)
        if (!tweet_id || !type || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        async function checkMyMessage(get) {
            try {
                const tweet = await get(tweet_id);
                if (tweet) {
                    console.log(tweet.user.toString(), user_id)
                    if (tweet.user.toString() === user_id) {
                        next();
                    }
                    else {
                        return res.status(403).json({ error: 'Unauthorized!' });
                    }
                }
                else {
                    return res.status(400).json({ message: "Invalid request" });
                }
            } catch (error) {
                return res.status(500).json({ message: "Something went wrong" });
            }
        }
        if (type === "message") {
            return checkMyMessage(TweetModel.getTweetById)
        }
        else if (type === "reply") {
            return checkMyMessage(ReplyModel.getReplyById)
        }
        else {
            return res.status(400).json({ message: "Invalid request" });
        }
    },
    my_story: function (req, res, next) {
        const { story_id, type } = req.params;
        const authToken = req.headers.authorization;
        let user_id = "";
        if (authToken.startsWith("Bearer ")){
            user_id = authToken.substring(7, authToken.length);
        }
        console.log(user_id)
        if (!story_id || !type || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        async function checkMyMessage(get) {
            try {
                const story = await get(story_id);
                if (story) {
                    console.log(story.user.toString(), user_id)
                    if (story.user.toString() === user_id) {
                        next();
                    }
                    else {
                        return res.status(403).json({ error: 'Unauthorized!' });
                    }
                }
                else {
                    return res.status(400).json({ message: "Invalid request" });
                }
            } catch (error) {
                return res.status(500).json({ message: "Something went wrong" });
            }
        }
        if (type === "message") {
            return checkMyMessage(StoryModel.getStoryById)
        }
        else if (type === "reply") {
            return checkMyMessage(ReplyModel.getReplyById)
        }
        else {
            return res.status(400).json({ message: "Invalid request" });
        }
    }
};