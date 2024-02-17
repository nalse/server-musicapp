const express = require("express");
const { auth } = require("../../utils/auth");
const VideoController = require("./video.controller")

const videoRouter = express.Router();

videoRouter.get(
    "/search",
    VideoController.searchVideos
)

videoRouter.get(
    "/profile/:username",
    VideoController.getProfile
)

videoRouter.get(
    "/:video_id",
    VideoController.getVideo
)

videoRouter.get(
    "/",
    VideoController.getVideos
)

videoRouter.post(
    "/upload",
    auth,
    VideoController.uploadVideo
);

// videoRouter.post(
//     "/",
//     VideoController.createVideo
// )

videoRouter.post(
    "/like",
    auth,
    VideoController.like
)

videoRouter.post(
    "/view",
    auth,
    VideoController.view
)

videoRouter.delete(
    "/:video_id",
    auth,
    VideoController.deleteVideo
)



module.exports = videoRouter;