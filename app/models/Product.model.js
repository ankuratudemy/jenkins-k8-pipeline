//Item model
const mongoose = require("mongoose");
var ProductSchema = new mongoose.Schema({
    product_code     : { type : String , required : true, unique : true,  dropDups: true },
    name             : { type : String , required : true},
    price            : { type : Number , required : true}
});
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;