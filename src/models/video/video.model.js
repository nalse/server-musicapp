const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    video: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    views: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    hashtags: [{ type: String }],
    messages: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }]
    },
},
{ timestamps: true }
);

let Video = mongoose.model("Video", videoSchema);

const createVideo = async (video, user_id, hashtags) => {
    const _video = new Video({
        video,
        user: user_id,
        likes: [],
        views: [],
        hashtags,
        messages: []
    });
    return await _video.save();
};


const getAllVideos = async () => {
    return Video.find()
      .select('video likes hashtags views createdAt')
      .populate('user', 'username image type -_id')
      .lean();
  };
  
  

const getAllVideosByUserId = async (user_id) => {
    return Video.find({ user: user_id }).populate("user", "username image");
}

const getVideoByUser = async (username) => {
    try {
        const populatedVideos = await Video.find().populate('user', 'username image -_id').exec();
    
        const videos = populatedVideos.filter((video) => {
          return video.user.username === username;
        });
    
        return videos;
    } catch (error) {
        console.error('Error searching videos:', error);
        throw error;
    }
};


const searchVideos = async (query) => {
    try {
      const populatedVideos = await Video.find()
        .select('video likes hashtags views createdAt')
        .populate('user', 'username -_id')
        .lean();
  
      const videos = populatedVideos.filter((video) => {
        return (
          (video.user &&
            video.user.username &&
            video.user.username.toLowerCase().includes(query.toLowerCase())) ||
          (video.hashtags && video.hashtags.includes(query))
        );
      });
  
      return videos;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  };
  

  const getVideoById = async (id) => {
    return Video.findById(id)
        .populate({
            path: 'user',
            select: 'username image -_id',
        })
        .populate({
            path: 'messages',
            populate: {
              path: 'user',
              select: 'username image -_id',
            }
        });
};



// const getVideoByUser = async (user) => {
//     return Video.findOne({ user: user }).lean();
// };

const getVideoByIdAndLike = async (id) => {
    return Video.findOne({ _id: id })
      .populate('user', 'username image -_id')
      .populate({
        path: 'messages',
        populate: {
          path: 'user',
          select: 'username image -_id',
        },
      })
      .exec();
};


  
  

const deleteVideo = async (id) => {
    return Video.findByIdAndDelete(id);
};

module.exports = {
    videoSchema,
    Video,
    getAllVideos,
    getAllVideosByUserId,
    searchVideos,
    createVideo,
    getVideoById,
    getVideoByIdAndLike,
    deleteVideo,
    getVideoByUser
};
