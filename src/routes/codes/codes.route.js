const express = require("express");
const CodeController = require("./codes.controller")

const codeRouter = express.Router();

codeRouter.post(
    "/",
    CodeController.createCode
)

// codeRouter.get(
//     "/",
//     CodeController.getCode
// )

// codeRouter.delete(
//     "/",
//     CodeController.deleteCode
// )

module.exports = codeRouter;