const mongoose = require("mongoose");
const { userSchema } = require("../users/users.model");

const tweetsSchema = new mongoose.Schema(
    {
        content: {
            type: String
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
        likes: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        }
    },
    { timestamps: true }
)

const Tweet = mongoose.model("Tweet", tweetsSchema);

const createTweet = async (user_id, content) => {
    const tweet = new Tweet({
        content,
        user: user_id,
        replies: [],
        deleted: false,
        likes: []
    })
    return await tweet.save();
}

const getAllTweets = async () => {
    return Tweet.find();
}

const searchTweets = async (query) => {
    try {
        const populatedTweets = await Tweet.find()
        .populate('user', 'username image -_id')
        .exec();
      
      console.log(populatedTweets);
  
      const tweets = populatedTweets.filter((tweet) => {
        return (
          (tweet.user &&
            tweet.user.username &&
            tweet.user.username.toLowerCase().includes(query.toLowerCase())) ||
          (tweet.content && tweet.content && tweet.content.toLowerCase().includes(query.toLowerCase()))
        );
      });
  
      return tweets;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  };

const getTweetById = async (id) => {
    return Tweet.findById(id);
}

const getTweetByIdAndPlusMinus = async (id) => {
    return Tweet.findOne({_id: id}, { likes:1 }).exec();
}

const deleteTweet = async (id) => {
    const tweet = await getTweetById(id);
    tweet.deleted = true;
    tweet.save();
    return tweet
}

const editTweet = async (tweet_id, edited_content) => {
    const tweet = await Tweet.findById(tweet_id).populate('user', 'username image -_id');
    console.log(tweet)
    tweet.content = edited_content;
    await tweet.save();
    return tweet
}


module.exports = {
    Tweet,
    searchTweets,
    createTweet,
    getAllTweets,
    getTweetById,
    getTweetByIdAndPlusMinus,
    deleteTweet,
    editTweet
}