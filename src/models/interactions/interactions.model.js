const mongoose = require("mongoose");

const interactionsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ['sent', 'rejected by partner', 'accepted', 'rejected'],
        },
        seen: {
            type: Boolean
        },
    },
)

const Interaction = mongoose.model("Interaction", interactionsSchema);

const createInteraction = async ( user_id, recipient_id, status) => {
    const interaction = new Interaction({
        user: user_id,
        recipient: recipient_id,
        status,
        seen: false,
    })
    return await interaction.save();
}

const getInteractionById = async (id) => {
    const interaction = await Interaction.findById(id)
      .populate('user', 'username -_id')
      .populate('recipient', 'username -_id');
  
    return interaction;
  };
  
  

const update = async (interaction_id, status) => {
    const interaction = await getInteractionById(interaction_id);
    console.log(interaction)
    interaction.status = status;
    interaction.save();
    return interaction
}

const seen = async (interaction_id) => {
    const interaction = await getInteractionById(interaction_id);
    console.log(interaction)
    interaction.seen = true;
    interaction.save();
    return interaction
}


// const getCodeByContent = async (content) => {
//     return Code.findOne({ content }).populate("user", "username");
// }

module.exports = {
    Interaction,
    createInteraction,
    getInteractionById,
    update,
    seen
    // getCodeByContent,
    // getReplyByIdAndPlusMinus,
}