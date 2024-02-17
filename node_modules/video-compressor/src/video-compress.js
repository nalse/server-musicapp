const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFmpeg = require('fluent-ffmpeg');
const fs = require('fs');
FFmpeg.setFfmpegPath(ffmpeg.path);

const {input, output} = require('./res/paths');

const path = require('path');

const queue = [];
let running = false;

const processVideo = async (input_video, call, missingVideos = []) => {
    if (queue.length === 0 && input_video !== "") {
        queue.push(input_video);
    }

    if (missingVideos.length > 1) {
        const clone = [...missingVideos];
        clone.shift();

        clone.forEach((v, i) => {
            queue.push(v);
        });
    }


    if (!running && queue.length > 0) {
        running = true;

        const proc = await new FFmpeg({source: path.resolve(input, queue[0])})
            .videoCodec('libx264')
            //.noAudio()
            .saveToFile(path.resolve(output, queue[0]))
            .on('end', function () {
                //console.log("OK");
                fs.unlinkSync(path.resolve(input, queue[0]))
                running = false;

                if (queue.shift() !== undefined && queue.length > 0) {
                    processVideo(queue[0], call);
                }
            });
    } else {
        queue.push(input_video);
    }
};

module.exports = processVideo;