const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Reviews = require("./reviews.js");
const { required } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Reviews"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    category: {
        type: String,
        enum: ["city","mountain","castle","pool","beach","farm","camping","lakefront"],
        lowercase: true
    },

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Reviews.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;