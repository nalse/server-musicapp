const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema(
    {
        content: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
)

const Code = mongoose.model("Code", codeSchema);

const createCode = async ( content ) => {
    const code = new Code({
        content
    })
    return await code.save();
}

const getCodeByContent = async (content) => {
    return Code.findOne({ content }).populate("user", "username -_id");
}

module.exports = {
    Code,
    createCode,
    getCodeByContent,
}