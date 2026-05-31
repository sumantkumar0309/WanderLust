const Reviews = require("../models/reviews");
const Listing = require("../models/listing");


module.exports.createReview = async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Reviews(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        console.log("New review saved");
        req.flash("success", "New review added!!");
        res.redirect(`/listings/${listing._id}`);
    };

    module.exports.deleteReview = async (req, res, next) => {
    
            let { id, reviewsId } = req.params;
            await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } });
            await Reviews.findByIdAndDelete(reviewsId);
            req.flash("success", "Review deleted!!");
            res.redirect(`/listings/${id}`);
        };