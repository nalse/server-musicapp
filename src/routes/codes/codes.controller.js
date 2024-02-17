const bcrypt = require('bcrypt');
const CodeModel = require('../../models/codes/codes.model');

const CodeController = {
    createCode: async function(req, res) {
        const { content, user_id } = req.body;
        if (!content) {
          return res.status(400).json({ message: 'Invalid request' });
        }
        try {

          const code = await CodeModel.createCode(content);
    
          return res.status(201).json({ message: code });
        } catch (error) {
            console.log(error)
          return res.status(500).json({ message: 'Something went wrong' });
        }
      },

    // getCode: async function(req, res) {
    //     const { id } = req.body;
    //     if (!id) {
    //         res.status(400).json({ message: "Invalid request" });
    //     }
    //     try {
    //         const user = await UserModel.getUserById(id);
    //         res.status(200).json({ user });
    //     } catch (error) {
    //         res.status(500).json({ message: "Something went wrong" });
    //     }
    // },

    // deleteCode: async function(req, res) {
    //     const { id } = req.body;
    //     if (!id) {
    //         res.status(400).json({ message: "Invalid request" });
    //     }
    //     try {
    //         const user = await CodeModel.deleteCode(id);
    //         res.status(200).json({ message: "Code deleted" });
    //     } catch (error) {
    //         res.status(500).json({ message: "Something went wrong" });
    //     }
    // }
};

module.exports = CodeController;