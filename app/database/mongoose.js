//MongoDb connection code
const mongoose = require("mongoose");
require('dotenv').config()
const Product = require("../models/Product.model");
const connection = 'mongodb://'+process.env.MONGO_HOST+':'+process.env.MONGO_PORT+'/'+process.env.DATABASE
const connectDb = () => {
 return mongoose.connect(connection,{ 
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true
});
};
module.exports = connectDb;