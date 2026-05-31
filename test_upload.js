require('dotenv').config();
const { cloudinary } = require('./cloudConfig.js');

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

cloudinary.uploader.upload(tinyPng, { folder: "test_uploads" })
    .then(result => {
        console.log("SUCCESS");
        console.log("URL: " + result.secure_url);
        console.log("ID: " + result.public_id);
    })
    .catch(error => {
        console.log("FAILURE");
        console.log(error.message);
    });
