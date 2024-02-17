const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
    {
        content: {
            type: String
        },
        score: {
            type: Number
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reply"
            }
        ],
        deleted: {
            type: Boolean
        },
        plus: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        },
        minus: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        }
    },
    { timestamps: true }
)

const Reply = mongoose.model("Reply", replySchema);

const createReply = async (user_id, content) => {
    const reply = new Reply({
        content,
        score: 0,
        user: user_id,
        replies: [],
        deleted: false,
        plus: [],
        minus: []
    })
    return await reply.save();
}

const getReplyById = async (id) => {
    return Reply.findById(id);
}

const getReplyByIdAndPlusMinus = async (id) => {
    return Reply.findOne({_id: id}, { plus: 1, minus: 1, score: 1 }).exec();
}

const deleteReply = async (id) => {
    const reply = await getReplyById(id);
    reply.deleted = true;
    reply.save();
    return reply
}

const editReply = async (message_id, edited_content) => {
    const reply = await getReplyById(message_id);
    reply.content = edited_content;
    reply.save();
    return reply
}

module.exports = {
    Reply,
    createReply,
    getReplyById,
    getReplyByIdAndPlusMinus,
    deleteReply,
    editReply
}