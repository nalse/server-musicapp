const TweetModel = require("../../models/tweets/tweets.model");
const ReplyModel = require("../../models/replies/replies.model");

const TweetsController = {
    getTweets: async function (req, res) {
        const user_id = req.headers.authorization;
        console.log("ins",user_id)
        try {
          let func = null;
          const { reply_id } = req.params;
          if (reply_id && reply_id !== "ALL") {
            func = ReplyModel.Reply.findById(reply_id)
          } else {
            func = TweetModel.Tweet.find()
          }
    
          let tweets = await func
            .populate({
              path: "user",
              model: "User",
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
            if (authToken.startsWith("Bearer ")){
                user_id = authToken.substring(7, authToken.length);
            }
            tweets = tweets.map(tweet => {
              const user_idString = user_id.toString();
              const liked = tweet.likes.some(like => like.toString() === user_idString);
              console.log(tweet.likes)
              console.log(liked, user_idString)
              return { ...tweet, liked };
            });
          }
    
          if (reply_id && reply_id !== "ALL") {
            tweets = [tweets];
          }
    
          let _tweets = tweets.map(tweet => {
            tweet.replies = tweet.replies.map(reply => {
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
            if (tweet.deleted) {
              return {
                _id: tweet._id,
                deleted: true,
                replies: tweet.replies
              }
            }
            return tweet;
          });

          _tweets = _tweets.map(tweet => {
            if (tweet.likes) {
              tweet.likes = tweet.likes.length;
            }
            return tweet;
          });
          
          res.status(200).json({ tweets: _tweets });
        } catch (error) {
          console.log(error)
          res.status(500).json({ message: "Something went wrong" });
        }
      },
    createTweet: async function (req, res) {
        const { user_id, content } = req.body;
        if (!user_id || !content) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            const tweet = await TweetModel.createTweet(user_id, content)
        
            const populatedTweet = await tweet.populate("user", "username image")
            res.status(201).json({ message: populatedTweet });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    like: async function (req, res) {
        const { tweet_id, user_id } = req.body;
        if (!tweet_id || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            let tweet = await TweetModel.getTweetByIdAndPlusMinus(tweet_id);
            console.log(tweet)
            if (tweet) {
                if (!tweet.likes.includes(user_id)) {
                    tweet.likes.push(user_id);
                }
                else {
                    const remove = tweet.likes.indexOf(user_id);
                    tweet.likes.splice(remove, 1);
                }
                await tweet.save();
                tweet = tweet.toObject()
                tweet.likes = tweet.likes.length;
                return res.status(200).json({ tweet });
            }
            else {
                console.log(tweet)
                return res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Something went wrong" });
        }
    },

    searchTweets: async function (req, res) {
        try {
          const { query } = req.query;
          console.log(query)
          let tweets = await TweetModel.searchTweets(query);
          tweets = tweets.map(tweet => {
            tweet = tweet.toObject()
            tweet.likes = tweet.likes.length;
            return tweet
        });
      
          return res.status(200).json({ tweets });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Something went wrong' });
        }
      },

    deleteTweet: async function (req, res) {
        const { tweet_id, type } = req.params;
        if (!tweet_id || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }

        try {
            async function deleteMe(_delete) {
                await _delete(tweet_id);
                return res.status(200).json({ message: "Tweet deleted" });
            }
            if (type === "message") {
                return deleteMe(TweetModel.deleteTweet)
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

    editTweet: async function (req, res) {
        const { tweet_id, type } = req.params;
        const { edited_content } = req.body;
        if (!tweet_id || !edited_content || !type) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            async function editMe(_edit) {
                let tweet = await _edit(tweet_id, edited_content);
                tweet = tweet.toObject();
                tweet.likes = tweet.likes.length;
                res.status(200).json({ tweet });
            }
            if (type === "message") {
                editMe(TweetModel.editTweet)
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

module.exports = TweetsController;