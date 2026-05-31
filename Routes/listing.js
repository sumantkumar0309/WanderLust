const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const normalizeListingBody = (req, res, next) => {
    try {
        if (!req.body) req.body = {};
        if (!req.body.listing) {
            req.body.listing = req.body.listing || {
                title: req.body["listing[title]"] || "",
                description: req.body["listing[description]"] || "",
                location: req.body["listing[location]"] || "",
                country: req.body["listing[country]"] || "",
                category: req.body["listing[category]"] || "",
                price: req.body["listing[price]"] || 0,
            };
        }
        next();
    } catch (err) {
        next(err);
    }
};

//Search Route - MUST come FIRST before any parameterized routes
router.get("/search", wrapAsync(listingController.search));

router
    .route("/")
    //Index Route
    .get(wrapAsync(listingController.index))
    //Create Route
    .post(
        isLoggedIn,
        upload.single("listing[image]"), 
                normalizeListingBody,
        validateListing, 
        wrapAsync(listingController.createListing)
      );

//New Route - MUST come before /:id
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Edit Route - MUST come before /:id
router.get("/:id/edit",
    isLoggedIn,
    isOwner, listingController.editListing);

router
    .route("/:id")
    //Show Route
    .get(listingController.showaListing)
    //Update Route
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        normalizeListingBody,
        validateListing,
        wrapAsync(listingController.updateListing))
    //Delete Route
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.deleteListing));

module.exports = router;



