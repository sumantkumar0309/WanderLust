const mongoose = require('mongoose');
require('dotenv').config();
const { cloudinary } = require('./cloudConfig');
const Listing = require('./models/listing');
const User = require('./models/user');
const fs = require('fs');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function run() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('1. Connected to MongoDB');

        const user = await User.findOne();
        if (!user) throw new Error('No user found in DB');
        console.log('2. Found user:', user.username);

        // tiny 1x1 png base64
        const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const testImgPath = './test_tiny.png';
        fs.writeFileSync(testImgPath, tinyPng, 'base64');

        const uploadRes = await cloudinary.uploader.upload(testImgPath, {
            folder: 'wanderlust_test',
        });
        console.log('3. Uploaded to Cloudinary:', uploadRes.secure_url);

        const newListing = new Listing({
            title: 'Test Listing',
            description: 'Test Description',
            image: {
                url: uploadRes.secure_url,
                filename: uploadRes.public_id
            },
            price: 100,
            location: 'Test Location',
            country: 'Test Country',
            owner: user._id
        });

        await newListing.save();
        console.log('4. Created Listing');

        const savedListing = await Listing.findById(newListing._id);
        console.log('5. Saved image object:', savedListing.image);

        await Listing.findByIdAndDelete(newListing._id);
        console.log('6. Deleted temporary listing');

        await cloudinary.uploader.destroy(uploadRes.public_id);
        console.log('7. Deleted Cloudinary image');

        fs.unlinkSync(testImgPath);
        console.log('Cleanup complete');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
