if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const User = require("../models/user.js")

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
}

// Every seeded listing needs an owner, otherwise the show/edit pages have no
// user to compare against. Reuse a demo account, creating it on first run.
const getDemoOwner = async () => {
    let owner = await User.findOne({username: "demo"});
    if(!owner){
        owner = await User.register(new User({username: "demo", email: "demo@wanderlust.local"}), "demo1234");
        console.log("Created demo user -> username: demo / password: demo1234");
    }
    return owner;
};

const initDB = async () => {
    const owner = await getDemoOwner();
    await Review.deleteMany({})
    await Listing.deleteMany({})
    const listings = initData.data.map((obj) => ({...obj, owner: owner._id, reviews: []}))
    await Listing.insertMany(listings)
    console.log(`Data was initialized (${listings.length} listings)`)
};

main()
.then(async () => {
    console.log("connected to DB")
    await initDB();
    await mongoose.connection.close();
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
