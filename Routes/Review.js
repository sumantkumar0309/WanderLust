const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Reviews = require("../models/reviews.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReviews, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewControllers = require("../controllers/reviews.js");

//POst Reviews Route

router.post("/:id/reviews",
    isLoggedIn,
    validateReviews,
    wrapAsync(reviewControllers.createReview));

//Delete Review route

router.delete("/:id/reviews/:reviewsId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewControllers.deleteReview));

module.exports = router;