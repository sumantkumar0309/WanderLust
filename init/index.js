const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
     
    const transformedData = data.data.map((obj) => ({ 
        ...obj, 
        owner: "6a017a6b4dd44a06418546b0",
        image: { url: obj.image.url, filename: obj.image.filename }
    }));
    await Listing.insertMany(transformedData);
    console.log("data was initialized");
    mongoose.connection.close();
};

initDB();