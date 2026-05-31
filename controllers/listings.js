const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    console.log("Session at GET /listings:", req.session);
    console.log("GET /listings HIT! res.locals.success is:", res.locals.success);
    
    let filter = {};
    const category = req.query.category;
    
    if (category) {
        filter.category = category;
    }
    
    const allListings = await Listing.find(filter).populate("owner");
    res.render("listings/index.ejs", { 
        allListings, 
        title: "WanderLust — Listings",
        category: category || null
    });
};

module.exports.search = async (req, res, next) => {
    try {
        console.log("SEARCH CONTROLLER CALLED");
        const { location, title, category, minPrice, maxPrice } = req.query;
        console.log("Query params:", { location, title, category, minPrice, maxPrice });
        
        let filter = {};

        // Search by location (case-insensitive)
        if (location && location.trim()) {
            filter.location = { $regex: location, $options: "i" };
            console.log("Added location filter:", filter);
        }

        // Search by title (case-insensitive)
        if (title && title.trim()) {
            filter.title = { $regex: title, $options: "i" };
            console.log("Added title filter:", filter);
        }

        // Filter by category
        if (category && category.trim()) {
            filter.category = category;
            console.log("Added category filter:", filter);
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
            console.log("Added price filter:", filter);
        }

        console.log("Final search filter:", filter);
        const searchResults = await Listing.find(filter).populate("owner");
        console.log("Search Results Count:", searchResults.length);
        console.log("About to render template with title variable");
        
        res.render("listings/index.ejs", {
            allListings: searchResults,
            title: "Search Results — WanderLust",
            category: category || null,
            searchQuery: location || title || ""
        });
    } catch (err) {
        console.error("SEARCH ERROR:", err);
        console.error("Error stack:", err.stack);
        next(err);
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { title: "Add New Listing — WanderLust" });
}

module.exports.showaListing = async (req, res) => {
    let { id } = req.params;
    console.log("=== SHOW LISTING ROUTE HIT ===");
    console.log("ID Parameter:", id);
    const listing = await Listing.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you are requesting for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing, title: `${listing.title} — WanderLust` });
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are requesting for does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,originalImageUrl, title: `Edit ${listing.title} — WanderLust` });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const listingData = req.body && req.body.listing ? req.body.listing : undefined;
    if (!listingData) {
        throw new ExpressError(400, "Listing data is missing");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are requesting for does not exist");
        return res.redirect("/listings");
    }
    Object.assign(listing, listingData);
    if (req.file) {
        const imageUrl = req.file.path || req.file.secure_url || req.file.url;
        const imageName = req.file.filename || req.file.public_id;
        listing.image = { url: imageUrl, filename: imageName };
    }
    await listing.save();
    req.flash("success", "Listing Updated!!");
    req.session.save(() => {
        res.redirect(`/listings/${id}`);
    });
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing delted!!");
    req.session.save(() => {
        res.redirect("/listings");
    });
};

module.exports.createListing = async (req, res) => {
    const listingData = req.body && req.body.listing ? req.body.listing : undefined;
    if (!listingData) {
        throw new ExpressError(400, "Listing data is missing");
    }
    if (!req.file) {
        throw new ExpressError(400, "Image file is missing");
    }
    console.log('POST /listings hit! Body:', listingData);
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    const imageName = req.file.filename || req.file.public_id;
    newListing.image = { url: imageUrl, filename: imageName };
    await newListing.save();
    console.log('Listing saved:', newListing._id);
    req.flash("success", "New listing added!!");
    req.session.save(() => {
        res.redirect("/listings");
    });
};


