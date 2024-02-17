const bcrypt = require('bcrypt');
const UserModel = require('../../models/users/users.model');
const CodeModel = require('../../models/codes/codes.model');
const fs = require('fs');
var crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './photos',
    filename: (req, file, callback) => {
        const photoName = `${crypto.randomBytes(16).toString('hex')}_${file.originalname}`;
        callback(null, photoName);
    },
});

const upload = multer({ storage }).single('image');

const UserController = {
    createUser: async function (req, res) {
        const { username, password, image, type, content } = req.body;
        if (!username || !password | !image || !type) {
            console.log(username)
            console.log(image)
            console.log(password)
            return res.status(400).json({ message: 'Invalid request' });
        }

        const check = await UserModel.isValidUsername(username);
        const check2 = await UserModel.isValidPassword(password);

        if (!check) {
            return res.status(400).json({ message: 'Username should not contain spaces or special characters' });
        }

        if (!check2) {
            return res.status(400).json({ message: 'Password should not contain spaces or special characters' });
        }


        try {

            const existingUser = await UserModel.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await UserModel.createUser(username, hashedPassword, image, type);
            //   console.log(user._id)

            if (content) {
                const code = await CodeModel.getCodeByContent(content);

                if (!code) {
                    return res.status(400).json({ message: "Invalid code" });
                }

                if (code.user === null) {

                    code.user = user._id;
                    user.type = "partner";
                    // const partnerCodePattern = /^PARTNER([1-11]|1)$/;

                    // if (partnerCodePattern.test(code.content)) {
                    //     user.type = "partner";
                    // }else {
                    //     console.log("djjd")
                    //     console.log(content)
                    //     console.log(code.content)
                    // }
                    await code.save();
                    await user.save();
                    // console.log(code);
                    console.log(user);
                }
                else {
                    return res.status(400).json({ message: "Invalid code" });
                }
            }


            return res.status(201).json({ message: 'User created' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },
          

    getUser: async function (req, res) {
        const { user_id } = req.body;
        if (!user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            const user = await UserModel.getUserById(user_id);
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong" });
        }
    },

    getProfile: async function (req, res) {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            const user = await UserModel.getUserForProfile(username);
            return res.status(200).json({ user });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Something went wrong" });
        }
    },
    

    updatePhoto: (req, res) => {
        const { user_id } = req.body;
        upload(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error updating photo' });
            }

            
            if (!user_id) {
                return res.status(400).json({ message: 'Invalid request' });
            }

            const image = req.file;
            if (!image) {
                return res.status(400).json({ message: 'No photo uploaded' });
            }

            const newPhoto = await UserModel.updatePhoto(image.filename, user_id);
            console.log("new",newPhoto)

            return res.status(200).json({ message: 'Photo updated successfully', image: newPhoto });
        });
    },

    // loginUser: async function (req, res) {
    //     const { username, password, content } = req.body;
    //     if (!username || !password) {
    //         return res.status(400).json({ message: "Invalid request" });
    //     }
    //     try {
    //         if (content) {
    //             const code = await CodeModel.getCodeByContent(content);


    //             if (!code) {
    //                 return res.status(400).json({ message: "Invalid code" });
    //             }

    //             if (code.user.username.toString() !== username) {
    //                 console.log(code.user.username.toString())
    //                 console.log(username)
    //                 return res.status(400).json({ message: "Invalid username" });
    //             }

    //         }

    //         const user = await UserModel.getUserByUsername(username);
    //         if (user) {
    //             if (!content && user.type === "partner") {
    //                 return res.status(400).json({ message: "Invalid request" });
    //             }
    //             const isPasswordValid = await bcrypt.compare(password, user.password);
    //             if (isPasswordValid) {
    //                 const { password, ..._user } = user;
    //                 return res.status(200).json({ user: _user });
    //             }
    //         }
    //         return res.status(400).json({ message: "Invalid request" });
    //     } catch (error) {
    //         console.log(error)
    //         return res.status(500).json({ message: "Something went wrong" });
    //     }
    // },

    loginUser: async function (req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
          return res.status(400).json({ message: "Invalid request" });
        }
      
        try {
          const user = await UserModel.getUserByUsername(username);
          if (!user) {
            return res.status(400).json({ message: "User not found" });
          }
      
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (isPasswordValid) {
            const { password, ..._user } = user;
            console.log(user)
            const currentDate = new Date();
            const expirationDate = new Date(_user.expirationDate);
      
            if (expirationDate <= currentDate) {
              const newType = _user.type === 'pro creator' ? 'creator' : 'user';
      
              try {
                const updatedUser = await UserModel.update(_user._id, newType);
                const user_ = await UserModel.getUserByUsername(updatedUser.username);
                const { password, ...__user } = user_;
                return res.status(200).json({ user: __user });
              } catch (updateError) {
                console.error("Error updating user type:", updateError);
                return res.status(500).json({ message: "Error updating user type" });
              }
            } else {
              return res.status(200).json({ user: _user });
            }
          } else {
            return res.status(400).json({ message: "Invalid request" });
          }
        } catch (error) {
          console.error("Error during login:", error);
          res.status(500).json({ message: "Something went wrong" });
        }
      },
         
    
    getNotifications: async function (req, res) {
        const { user_id } = req.body;
        try {
            const user = await UserModel.getUserById(user_id);
            const userType = user.type;
        
            if ( userType !== 'pro creator' && userType !== 'partner') {
                return res.status(403).json({ message: 'Permission denied' });
            }

            const requests = await UserModel.getNotifications(user_id);
            const notifications = requests.requests
            res.status(200).json({ notifications });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    updateType: async function (req, res) {
        const { user_id, type } = req.body;

        if (!user_id || !type) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        const user = await UserModel.getUserById(user_id);
        const userType = user.type;

        console.log("here we go", userType)
    
        if ( userType !== 'pro creator' && userType !== 'pro user' && userType !== 'creator' && userType !== 'user') {
            return res.status(403).json({ message: 'Permission denied' });
        }

        try {
            const updatedUser = await UserModel.update(user_id, type);
            return res.status(200).json({ updatedUser });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },

    // getType: async function (req, res) {
    //     const { user_id } = req.body;

    //     if (!user_id) {
    //         return res.status(400).json({ message: 'Invalid request' });
    //     }

    //     try {
    //         const updatedUser = await UserModel.getUser(user_id);
    //         return res.status(200).json({ message: 'Type updated successfully', updatedUser });

    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ message: 'Something went wrong' });
    //     }
    // },

    deleteUser: async function (req, res) {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({ message: "Invalid request" });
        }
        try {
            const user = await UserModel.deleteUser(id);
            res.status(200).json({ message: "User deleted" });
        } catch (error) {
            res.status(500).json({ message: "Something went wrong" });
        }
    }
};

module.exports = UserController;
