const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, 
        required: true,
        select: false
    },
    image: {
        type: String,
    },
    type: {
        type: String,
        enum: ['user', 'creator', 'partner', 'pro creator','pro user'],
        required: true
    },
    requests: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Interaction',
    },
    expirationDate: {
        type: Date,
    },
    
});

const User = mongoose.model("User", userSchema);

const createUser = async (username, password, image, type, requests, expirationDate) => {
    const user = new User({
        username,
        password,
        image,
        type,
        requests,
        expirationDate
    });
    return await user.save();
};


const findUser = async (id) => {
    return db.collection.find( { user: { } } )
};

const getUserById = async (id) => {
    return User.findById(id).select(' username image type expirationDate -_id').exec();
};

const getUserByIdWithRequests = async (id) => {
    return User.findById(id).select(' username image type requests').exec();
};

const getUserByIdWithId = async (id) => {
    return User.findById(id).select(' username image type _id').exec();
};

const getUserForProfile = async (username) => {
    return User.findOne({ username: username }).select('-_id username image').exec();
};


const getUserByUsername = async (username) => {
    return User.findOne({ username: username }).select('+password').lean();
};


const update = async (user_id, type) => {
    const user = await getUserByIdWithId(user_id);
    console.log(user);

    if (type === 'pro creator' || type === 'pro user') {
        user.type = type;
        const currentDate = new Date();
        const expirationDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        user.expirationDate = expirationDate;
    } else {
        user.type = type;
        user.expirationDate = null;
    }

    await user.save();
    const user2 = await getUserById(user._id);
    return user2;
};

const updatePhoto = async (image, user_id) => {
    const user = await getUserByIdWithId(user_id);
    console.log(user);

    user.image = image;

    await user.save();
    const user2 = await getUserById(user._id);
    return user2;
};


const getNotifications = async (id) => {
    return User.findById(id).populate({
        path: 'requests',
        populate: [
            { path: 'user', select: 'username -_id' },
            { path: 'recipient', select: 'username -_id' }
        ]
    });
};


  

const deleteUser = async (id) => {
    return User.findByIdAndDelete(id);
};


const isValidUsername = async (username) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
}

const isValidPassword = async (password) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(password);
}


module.exports = {
    userSchema,
    User,
    createUser,
    updatePhoto,
    getUserById,
    getUserByIdWithId,
    getUserByIdWithRequests,
    deleteUser,
    getUserForProfile,
    getUserByUsername,
    getNotifications,
    update,
    findUser,
    isValidUsername,
    isValidPassword
};
