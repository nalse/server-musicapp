const MessageModel = require("../../models/messages/messages.model");
const ReplyModel = require("../../models/replies/replies.model");
const VideoModel = require('../../models/video/video.model');

const MessagesController = {
    getMessages: async function (req, res) {
        const user_id = req.headers.authorization;
        try {
            let func = null;
            const { reply_id } = req.params;
            if (reply_id && reply_id !== "ALL") {
                func = ReplyModel.Reply.findById(reply_id)
            }
            else {
                func = MessageModel.Message.find()
            }

            let messages = await func
                .populate({
                    path: "user",
                    model: "User",
                })
                .populate({
                    path: "replies",
                    model: "Reply",
                    populate: [
                        {
                            path: "user",
                            model: "User",
                        },
                        {
                            path: "replies",
                            model: "Reply",
                            populate: [
                                {
                                    path: "user",
                                    model: "User",
                                },
                                {
                                    path: "replies",
                                    model: "Reply"
                                }
                            ]
                        }
                    ]
                })
                .lean()
                .exec();

            function findSign(message) {
                let sign = "";
                if (message.plus.map(o => o.toString()).includes(user_id)) {
                    sign = "+"
                }
                else if (message.minus.map(o => o.toString()).includes(user_id)) {
                    sign = "-"
                }
                return sign;
            }

            if (reply_id && reply_id !== "ALL") {
                messages = [messages];
            }

            const _messages = messages.map(message => {
                message.replies = message.replies.map(reply => {
                    reply.replies = reply.replies.map(_reply => {
                        if (_reply.deleted) {
                            return {
                                _id: _reply._id,
                                deleted: true,
                                replies: _reply.replies
                            }
                        }
                        _reply.sign = findSign(_reply);
                        delete _reply["plus"];
                        delete _reply["minus"];
                        return _reply;
                    })
                    if (reply.deleted) {
                        return {
                            _id: reply._id,
                            deleted: true,
                            replies: reply.replies
                        }
                    }
                    reply.sign = findSign(reply);
                    delete reply["plus"];
                    delete reply["minus"];
                    return reply;
                })
                if (message.deleted) {
                    return {
                        _id: message._id,
                        deleted: true,
                        replies: message.replies
                    }
                }
                message.sign = findSign(message);
                delete message["plus"];
                delete message["minus"];
                return message;
            })

            res.status(200).json({ messages: _messages });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong" });
        }
    },
    createMessage: async function (req, res) {
        const { user_id, content, video_id } = req.body;
        if (!user_id || !content || !video_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            const message = await MessageModel.createMessage(user_id, content);

            let video = await VideoModel.getVideoById(video_id);
            if (!video) {
              return res.status(404).json({ message: "Video not found" });
            }
        
            video.messages.push(message._id);
            await video.save();

            const populatedMessage = await message.populate("user", "username image -_id")
            res.status(201).json({ message: populatedMessage });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    like: async function (req, res) {
        const { message_id, user_id } = req.body;
        if (!message_id || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            let message = await MessageModel.getMessageByIdAndPlusMinus(message_id);
            console.log(message)
            if (message) {
                if (!message.likes.includes(user_id)) {
                    message.likes.push(user_id);
                }
                else {
                    const remove = message.likes.indexOf(user_id);
                    message.likes.splice(remove, 1);
                }
                await message.save();
                
                message = message.toObject()
                message.likes = message.likes.length;
                return res.status(200).json({ message });
            }
            else {
                console.log(message)
                return res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Something went wrong" });
        }
    },

    deleteMessage: async function (req, res) {
        const { message_id, type, video_id } = req.params;
        if (!message_id || !type || !video_id) {
            return res.status(400).json({ message: "Invalid request" });
        }

        try {
            async function deleteMe(_delete) {
                await _delete(message_id);
                return res.status(200).json({ message: "Message deleted" });
            }
            if (type === "message") {
                const video = await VideoModel.getVideoById(video_id);
                if (!video) {
                  return res.status(404).json({ message: "Video not found" });
                }
            
                const index = video.messages.indexOf(message_id);
                if (index > -1) {
                  video.messages.splice(index, 1);
                  await video.save();
                }
                return deleteMe(MessageModel.deleteMessage)
            }
            else if (type === "reply") {
                return deleteMe(ReplyModel.deleteReply)
            }
            else {
                return res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            return res.status(500).json({ message: "Something went wrong" });
        }
    },

    editMessage: async function (req, res) {
        const { message_id, type } = req.params;
        const { edited_content } = req.body;
        if (!message_id || !edited_content || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            async function editMe(_edit) {
                const message = await _edit(message_id, edited_content);
                res.status(200).json({ message });
            }
            if (type === "message") {
                editMe(MessageModel.editMessage)
            }
            else if (type === "reply") {
                editMe(ReplyModel.editReply)
            }
            else {
                res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
        
    }
}

module.exports = MessagesController;