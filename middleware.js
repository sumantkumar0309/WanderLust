const Listing = require("./models/listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewsSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    console.log("isLoggedIn middleware hit! isAuthenticated:", req.isAuthenticated());
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listings = await Listing.findById(id);
    if (!listings.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    if (!req.body) req.body = {};
    let {error} = listingSchema.validate(req.body);
    if( error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReviews = (req, res, next) => {
    let {error} = reviewsSchema.validate(req.body);
    if( error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewsId } = req.params;
    let review = await Review.findById(reviewsId);
    const authorId = review && (review.author._id || review.author);
    if (!review || !authorId || String(authorId) !== String(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};