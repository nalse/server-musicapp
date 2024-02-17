const bcrypt = require('bcrypt');
const InteractionsModel = require('../../models/interactions/interactions.model');
const UserModel = require('../../models/users/users.model');

const InteractionsController = {
    createInteraction: async function(req, res) {
        let { recipient_id, status, user_id } = req.body;
        if (!user_id || !recipient_id || !status) {
            console.log(user_id);
            console.log(status);
            return res.status(400).json({ message: 'Invalid request' });
        }
        const user = await UserModel.getUserById(user_id);
        const userType = user.type;
    
        if (userType !== 'partner') {
          return res.status(403).json({ message: 'Permission denied' });
        }
        try {
            recipient_id = await UserModel.getUserByUsername(recipient_id);
            console.log("1",recipient_id)
            const interaction = await InteractionsModel.createInteraction(user_id, recipient_id._id, status);
            const user = await UserModel.getUserByIdWithRequests(recipient_id);
            const partner = await UserModel.getUserByIdWithRequests(user_id);
            console.log("2",interaction)
            console.log("user", user);
            console.log("partner", partner);
            user.requests.push(interaction._id);
            partner.requests.push(interaction._id);
            console.log("user", user);
            console.log("partner", partner);
            await user.save();
            await partner.save();

            const populatedInteraction = await InteractionsModel.getInteractionById(interaction._id);
            console.log("3",populatedInteraction)
    
            return res.status(201).json({ message: populatedInteraction });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },
    
 
    updateStatus: async function(req, res) {
        const { interaction_id, status } = req.body;
    
        if (!interaction_id || !status) {
            return res.status(400).json({ message: 'Invalid request' });
        }
    
        try {
            const updatedInteraction = await InteractionsModel.update(interaction_id, status);
            return res.status(200).json({ message: 'Status updated successfully', updatedInteraction });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },

    seen: async function(req, res) {
        const { interaction_id} = req.body;
    
        if (!interaction_id) {
            return res.status(400).json({ message: 'Invalid request' });
        }
    
        try {
            const seenInteraction = await InteractionsModel.seen(interaction_id);
            return res.status(200).json({ message: 'Seen', seenInteraction });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
};

module.exports = InteractionsController;