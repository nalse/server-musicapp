const mongoose = require("mongoose");
const { userSchema } = require("../users/users.model");

const storiesSchema = new mongoose.Schema(
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

const Story = mongoose.model("Story", storiesSchema);

const createStory = async (user_id, content) => {
    const story = new Story({
        content,
        user: user_id,
        replies: [],
        deleted: false,
        likes: []
    })
    return await story.save();
}

const getAllStories = async () => {
    return Story.find();
}

const searchCreatorStories = async (query,username) => {
    try {
        const populatedStories = await Story.find()
        .populate('user', 'username image -_id')
        .exec();
      
      console.log(populatedStories);
  
      const stories = populatedStories.filter((story) => {
        if(story.user.username === username) {
            return (
            (story.user &&
                story.user.username &&
                story.user.username.toLowerCase().includes(query.toLowerCase())) ||
            (story.content && story.content.includes(query))
            );
        }
      });
  
      return stories;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  };

const searchStories = async (query) => {
    try {
        const populatedStories = await Story.find()
        .populate('user', 'username image -_id')
        .exec();
      
      console.log(populatedStories);
  
      const stories = populatedStories.filter((story) => {
        return (
          (story.user &&
            story.user.username &&
            story.user.username.toLowerCase().includes(query.toLowerCase())) ||
          (story.content && story.content.includes(query))
        );
      });
  
      return stories;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  };

const getStoryById = async (id) => {
    return Story.findById(id);
}

const getStoryByIdAndPlusMinus = async (id) => {
    return Story.findOne({_id: id}, { likes:1 }).exec();
}

const deleteStory = async (id) => {
    const story = await getStoryById(id);
    story.deleted = true;
    story.save();
    return story
}

const editStory = async (story_id, edited_content) => {
    const story = await Story.findById(story_id).populate('user', 'username image -_id');
    console.log(story);
    story.content = edited_content;
    await story.save();
    return story;
};



module.exports = {
    Story,
    searchStories,
    searchCreatorStories,
    createStory,
    getAllStories,
    getStoryById,
    getStoryByIdAndPlusMinus,
    deleteStory,
    editStory
}