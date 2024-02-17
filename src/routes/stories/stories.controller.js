const StoryModel = require("../../models/stories/stories.model");
const UserModel = require('../../models/users/users.model');

const StoriesController = {
  getStories: async function (req, res) {
    // const user_id = req.headers.authorization;
    try {
      let func = null;
      const { reply_id } = req.params;
      if (reply_id && reply_id !== "ALL") {
        func = ReplyModel.Reply.findById(reply_id)
      } else {
        func = StoryModel.Story.find()
      }

      let stories = await func
        .populate({
          path: 'user',
          model: 'User',
          select: '-_id username image',
        })
        .populate({
          path: "replies",
          model: "Reply",
          populate: [
            {
              path: "user",
              model: "User",
            },
            {
              path: "replies",
              model: "Reply",
              populate: [
                {
                  path: "user",
                  model: "User",
                },
                {
                  path: "replies",
                  model: "Reply"
                }
              ]
            }
          ]
        })
        .lean()
        .exec();
      if (req.headers.authorization) {
        const authToken = req.headers.authorization;
        let user_id = "";
        if (authToken.startsWith("Bearer ")) {
          user_id = authToken.substring(7, authToken.length);
        }

        stories = stories.map(story => {
          const user_idString = user_id.toString();
          const liked = story.likes.some(like => like.toString() === user_idString);
          console.log(story.likes)
          console.log(liked, user_idString)
          return { ...story, liked };
        });
      }

      if (reply_id && reply_id !== "ALL") {
        stories = [stories];
      }

      let _stories = stories.map(story => {
        story.replies = story.replies.map(reply => {
          reply.replies = reply.replies.map(_reply => {
            if (_reply.deleted) {
              return {
                _id: _reply._id,
                deleted: true,
                replies: _reply.replies
              }
            }
            return _reply;
          })
          if (reply.deleted) {
            return {
              _id: reply._id,
              deleted: true,
              replies: reply.replies
            }
          }
          return reply;
        })
        if (story.deleted) {
          return {
            _id: story._id,
            deleted: true,
            replies: story.replies
          }
        }
        return story;
      });


      if (req.headers.authorization) {
        const authToken = req.headers.authorization;
        let user_id = "";
        if (authToken.startsWith("Bearer ")) {
          user_id = authToken.substring(7, authToken.length);
        }
        const user = await UserModel.getUserById(user_id);
        const userType = user.type;
        const username = user.username;

        if (userType === 'creator') {
          _stories = _stories.filter((story) => story.user?.username === username);
        }
        else if (userType === 'pro user' || userType === 'pro creator' || userType === 'partner') {
          _stories = _stories

        } else {
          _stories = []
        }
      }

      _stories = _stories.map(story => {
        if (story.likes) {
          story.likes = story.likes.length;
        }
        return story;
      });

      res.status(200).json({ stories: _stories });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Something went wrong" });
    }
  },
  createStory: async function (req, res) {
    const { user_id, content } = req.body;
    if (!user_id || !content) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const user = await UserModel.getUserById(user_id);
    const userType = user.type;

    if (userType !== 'creator' && userType !== 'pro creator' && userType !== 'partner') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    try {
      const story = await StoryModel.createStory(user_id, content)

      const populatedStory = await story.populate("user", "username image")
      res.status(201).json({ message: populatedStory });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  like: async function (req, res) {
    const { story_id, user_id } = req.body;
    if (!story_id || !user_id) {
      return res.status(400).json({ message: "Invalid request" });
    }
    try {
      let story = await StoryModel.getStoryByIdAndPlusMinus(story_id);
      console.log(story)
      if (story) {
        if (!story.likes.includes(user_id)) {
          story.likes.push(user_id);
        }
        else {
          const remove = story.likes.indexOf(user_id);
          story.likes.splice(remove, 1);
        }
        await story.save();
        story = story.toObject()
        story.likes = story.likes.length;
        return res.status(200).json({ story });
      }
      else {
        console.log(story)
        return res.status(400).json({ message: "Invalid request" });
      }
    }
    catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Something went wrong" });
    }
  },

  searchStories: async function (req, res) {
    try {
      const { query } = req.query;
      const { user_id } = req.body;
  
      const user = await UserModel.getUserById(user_id);
      const userType = user.type;
      const username = user.username;
  
      let stories = [];
  
      if (userType === "creator") {
        stories = await StoryModel.searchCreatorStories(query, username);
      } else if (userType === 'pro user' || userType === 'pro creator' || userType === 'partner') {
        stories = await StoryModel.searchStories(query);
      }
  
      stories = stories.map((story) => {
        story = story.toObject();
        story.likes = story.likes ? story.likes.length : 0;
        return story;
      });      
  
      return res.status(200).json({ stories });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  },
  

  deleteStory: async function (req, res) {
    const { story_id, type } = req.params;
    if (!story_id || !type) {
      return res.status(400).json({ message: "Invalid request" });
    }

    try {
      async function deleteMe(_delete) {
        await _delete(story_id);
        return res.status(200).json({ message: "Story deleted" });
      }
      if (type === "message") {
        return deleteMe(StoryModel.deleteStory)
      }
      else if (type === "reply") {
        return deleteMe(ReplyModel.deleteReply)
      }
      else {
        return res.status(400).json({ message: "Invalid request" });
      }
    }
    catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  },

  editStory: async function (req, res) {
    const { story_id, type } = req.params;
    const { edited_content } = req.body;
    if (!story_id || !edited_content || !type) {
      return res.status(400).json({ message: "Invalid request" });
    }
    try {
      async function editMe(_edit) {
        let story = await _edit(story_id, edited_content);
        story = story.toObject();
        story.likes = story.likes.length;
        res.status(200).json({ story });
      }
      if (type === "message") {
        editMe(StoryModel.editStory)
      }
      else if (type === "reply") {
        editMe(ReplyModel.editReply)
      }
      else {
        res.status(400).json({ message: "Invalid request" });
      }
    }
    catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }

  },
}

module.exports = StoriesController;