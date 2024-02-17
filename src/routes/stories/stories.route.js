const express = require("express");
const { auth, my_story } = require("../../utils/auth");
const StoriesController = require("./stories.controller")

const storiesRouter = express.Router();


storiesRouter.get(
    "/",
    StoriesController.getStories
)

storiesRouter.get(
    "/search",
    auth,
    StoriesController.searchStories
)

storiesRouter.post(
    "/",
    auth,
    StoriesController.createStory
)

storiesRouter.post(
    "/like",
    auth,
    StoriesController.like
)

storiesRouter.put(
    "/:type/:story_id",
    auth,
    my_story,
    StoriesController.editStory
)

storiesRouter.delete(
    "/:type/:story_id",
    auth,
    my_story,
    StoriesController.deleteStory
)

module.exports = storiesRouter;