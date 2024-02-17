const VideoModel = require('../../models/video/video.model');
const UserModel = require('../../models/users/users.model');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const { getVideoDurationInSeconds } = require('get-video-duration')


const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const videoName = `${crypto.randomBytes(16).toString('hex')}_${file.originalname}`;
      callback(null, videoName);
    },
  });
  
  const upload = multer({ storage }).single('video');

const VideoController = {
    getVideos: async function (req, res) {
        try {
          let videos = await VideoModel.getAllVideos();

          if(req.headers.authorization) {
            const authToken = req.headers.authorization;
            let user_id = "";
            if (authToken.startsWith("Bearer ")){
                user_id = authToken.substring(7, authToken.length);
            }
            videos = videos.map(video => {
                const user_idString = user_id.toString(); // Convert user_id to a string
                console.log(user_idString)
                const liked = video.likes.map((like) => like.toString()).includes(user_idString);
                return { ...video, liked };
            }); 
          } else {
            console.log("ggggg")
          }
          
          videos = videos.map(video => {
            video.likes = video.likes.length
            video.views = video.views.length
            return video
          })
          res.status(200).json({ videos });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Something went wrong88" });
        }
    },

    // getMyProfile: async function (req, res) {
    //     const { user_id } = req.body;
    //     if (!user_id) {
    //         return res.status(400).json({ message: "Invalid request" });
    //     }
    //     try {
    //       let videos = await VideoModel.getAllVideosByUserId(user_id);

    //       if(req.headers.authorization) {
    //         const authToken = req.headers.authorization;
    //         let user_id = "";
    //         if (authToken.startsWith("Bearer ")){
    //             user_id = authToken.substring(7, authToken.length);
    //         }
    //         videos = videos.map(video => {
    //             const user_idString = user_id.toString(); // Convert user_id to a string
    //             const liked = video.likes.includes(user_idString);
    //             return { ...video.toObject(), liked };
    //         }); 
    //       }
          
    //       videos = videos.map(video => {
    //         video.likes = video.likes.length
    //         video.views = video.views.length
    //         return video
    //       })
    //       res.status(200).json({ videos });
    //     } catch (error) {
    //       console.log(error);
    //       res.status(500).json({ message: "Something went wrong99" });
    //     }
    // },

    getProfile: async function (req, res) {
        const { username } = req.params;
        console.log(username)
        if (!username) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
          let videos = await VideoModel.getVideoByUser(username);

          if(req.headers.authorization) {
            const authToken = req.headers.authorization;
            let user_id = "";
            if (authToken.startsWith("Bearer ")){
                user_id = authToken.substring(7, authToken.length);
            }
            videos = videos.map(video => {
                const user_idString = user_id.toString(); // Convert user_id to a string
                const liked = video.likes.includes(user_idString);
                return { ...video.toObject(), liked };
            }); 
          }

          
          videos = videos.map(video => {
            video.likes = video.likes.length
            video.views = video.views.length
            return video
          })
          res.status(200).json({ videos });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "Something went wrong99" });
        }
    },

    uploadVideo: async (req, res) => {
        const { user_id } = req.body;
      
        try {
          const user = await UserModel.getUserById(user_id);
          const userType = user.type;
      
          if (userType !== 'creator' && userType !== 'pro creator' && userType !== 'partner' ) {
            return res.status(403).json({ message: 'Permission denied' });
          }
      
          upload(req, res, async (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Error uploading video' });
            }
      
            const { hashtags } = req.body;
            if (!user_id) {
              return res.status(400).json({ message: 'Invalid request' });
            }
      
            const video = req.file;
            if (!video) {
              return res.status(400).json({ message: 'No video file uploaded' });
            }
  
            const fileSize = video.size;
      
            if (fileSize > 2000000000) {
              return res.status(400).json({ message: 'Video file size must be less than 2 GB' });
            }
      
            const videoPath = video.path;
      
            getVideoDurationInSeconds(videoPath)
              .then((duration) => {
                console.log(`Video duration: ${duration} seconds`);
      
                if (duration > 300) {
                  return res.status(400).json({ message: 'Video duration must be less than 5 minutes' });
                }
              });
      
            let newVideo = await VideoModel.createVideo(video.filename, user_id, hashtags);
      
            await newVideo.populate('user', 'username -_id');
      
            return res.status(200).json({ message: 'Video uploaded successfully', video: newVideo });
          });
        } catch (error) {
          console.error('Error fetching user type:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      },
      

      like: async function (req, res) {
        const { video_id, user_id } = req.body;
        if (!video_id || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            let video = await VideoModel.getVideoByIdAndLike(video_id);
            if (video) {
                if (!video.likes.includes(user_id)) {
                    if(!video.views.includes(user_id)) {
                        video.views.push(user_id);
                    }
                    video.likes.push(user_id);
                }
                else {
                    const remove = video.likes.indexOf(user_id);
                    video.likes.splice(remove, 1);
                }
                await video.save();
                video=video.toObject();
                video.likes = video.likes.length;
                video.views = video.views.length;
                
                return res.status(200).json({ video });
            }
            else {
                return res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Something went wrong" });
        }
    },

    view: async function (req, res) {
        const { video_id, user_id } = req.body;
        if (!video_id || !user_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            let video = await VideoModel.getVideoByIdAndLike(video_id); 
            console.log("hiuhi")
            if (video) {
                if (!video.views.includes(user_id)) {
                    video.views.push(user_id);
                }
                await video.save();

                if(req.headers.authorization) {
                    const authToken = req.headers.authorization;
                    let user_id = "";
                    if (authToken.startsWith("Bearer ")){
                       user_id = authToken.substring(7, authToken.length);
                    }
                    video = video.toObject();
                    const user_idString = user_id.toString();
                    video.messages = video.messages.map((message) => {
                        const liked = message.likes.some(like => like.toString() === user_idString);
                        message.likes = message.likes.length
                        console.log(message.likes)
                        console.log(liked, user_idString)
                        return { ...message, liked };
                    });
                }

                video.likes = video.likes.length
                video.views = video.views.length

                return res.status(200).json({ video });
            }
            else {
                return res.status(400).json({ message: "Invalid request" });
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Something went wrong" });
        }
    },


    getVideo: async function(req, res) {
        const { video_id } = req.params;
        if (!video_id) {
            res.status(400).json({ message: "Invalid request" });
        }
        try {
            
            let _video = await VideoModel.getVideoById(video_id);
            console.log(_video)
            _video = _video.toObject();
            _video.likes = _video.likes.length
            _video.views = _video.views.length
            if (_video && _video.messages) {
                _video.messages.forEach((message) => {
                  if (message.likes) {
                    message.likes = message.likes.length;
                  }
                });
              }              

            res.status(200).json({ video: _video });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Something went wrong" });
        }
    },

    searchVideos: async function (req, res) {
        try {
            const { query } = req.query;

            let videos = await VideoModel.searchVideos(query);
            videos = videos.map(video => {
                // video = video.toObject()
                video.likes = video.likes.length;
                video.views = video.views.length;
                return video
            });
    
            return res.status(200).json({ videos });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    },
    
      
      
    deleteVideo: async function(req, res) {
        const { video_id } = req.params;
        if (!video_id) {
            return res.status(400).json({ message: "Invalid request" });
        }
        try {
            const _video = await VideoModel.deleteVideo(video_id);
            return res.status(200).json({ message: "Video deleted" });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong" });
        }
    },
};

module.exports = VideoController;
