const express = require("express");
require('dotenv').config()
const app = express();
const connectDb = require("./database/mongoose");
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Product = require("./models/Product.model");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const CheckAndAddOffers = require('./services/cartService')
const store = new MongoDBStore({
  uri: 'mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.DATABASE,
  collection: 'sessions'
});


store.on('error', function (error) {
  console.log("Session Store Error",error);
});

const PORT = process.env.PORT;
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 1 // 24 hours week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET endpoint to test code to check session storage is working fine Access the session as req.session
app.get('/', function (req, res, next) {
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>Session expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    
  }
})

//GET API endpoint to fetch current cart status
app.get('/cart', function (req, res, next) {
  if (!req.session.cart) {

    req.session.cart = []

  }
  if (req.session.cart) {
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>CART: ')
    res.write('<p>....................................................................................</p>')
    res.write('<span>     Item &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbspOffer Code &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp Price   </span>')
    res.write('<p>....................................................................................</p>')

    var offer_item_cart = CheckAndAddOffers.checkAndAddOffers(req.session.cart);

    for (let i = 0; i < req.session.cart.length; i++) {
      for (let j = 0; j < req.session.cart[i].quantity; j++) {
        res.write('<p>' + JSON.stringify(req.session.cart[i].product_code) + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp $' + JSON.stringify(req.session.cart[i].price) + '</p>')
      }
      for (let k = 0; k < offer_item_cart.length; k++) {
        if (offer_item_cart[k].product_code === req.session.cart[i].product_code) {
          for (let z = 0; z < offer_item_cart[k].quantity; z++) {
            res.write('<p>' + JSON.stringify(offer_item_cart[k].product_code) + '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp' + JSON.stringify(offer_item_cart[k].offer_code) + ' &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp $' + JSON.stringify(offer_item_cart[k].price) + '</p>')
          }
        }
      }

    }

    // res.write('<p>Offer Item Cart' + JSON.stringify(offer_item_cart) + '</p>')

    //Total amount display
    let init_total = req.session.cart.reduce((total, currElement) => total + currElement.quantity * currElement.price, 0)
    let offer_total = offer_item_cart.reduce((total1, currElement1) => total1 + currElement1.quantity * currElement1.price, 0)
    let total = init_total + offer_total;
    console.log(offer_total)
    res.write('<p>....................................................................................</p>')
    res.write('<span>     Total &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp $' + parseFloat(total).toFixed(2) + '</span>')
    res.write('<p>....................................................................................</p>')

    res.end()
  } else {
    req.session.cart = []
    res.end('You have an empty cart!')
  }
})
// GET API endpoint to get list of Products available in portal. Responds with a JSON with array of products 
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET API endpoint to delete all items from cart
app.get("/emptycart", async (req, res) => {
  req.session.cart = [];
  res.send({ "message": "Cart Emptied" })
})

// POST API endpoint to add Product list by uploading JSON data 
// This data will be stored in MongoDb 
app.post('/createProducts', function (req, res, next) {
  console.log("REQ BODY: ", req.body)

  Product.insertMany(req.body, function (err) {
    if (err) {
      console.log(err)
      res.send({ "message": "Save unsucesfull","status":"failed" })
    }
    else {
      res.send({ "message": "Save sucesfull","status":"success" })
    }

  });

});


// POST API endpoint to add Product list by uploading JSON data 
// This data will be stored in MongoDb 
app.get('/deleteProducts', function (req, res, next) {
  
  Product.collection.drop(function(err) {

  if (err) {
      console.log(err)
      res.send({ "message": "Drop unsucesfull with error: "+err.message })
    }
    else {
      res.send({ "message": "Drop sucessfull" })
    }

  });


});

// GET API endpoint to add a product(code) to cart.  
app.get('/addtocart/:product_code', function (req, res, next) {

  if (!req.session.cart) {

    req.session.cart = []
  }


  var productcode = req.params.product_code;

  Product.findOne({ product_code: productcode }, function (err, docs) {
    if (err) {
      console.log(err)
      res.send({ "message": "Product Not Found" })
    }
    else {
      if (docs) {

        var { _id, __v, ...restOfItems } = docs._doc;
        //console.log("Result : ", restOfItems);

        const existingCartItem = req.session.cart.find(
          cartItem => cartItem.product_code === productcode
        );
        if (existingCartItem) {

          console.log("Item Exists in cart ", JSON.stringify(req.session.cart))
          req.session.cart.map(cartItem =>
            cartItem.product_code === productcode
              ? { ...cartItem, quantity: cartItem.quantity++ }
              : cartItem
          )
          //res.send({ "message": "Product " + restOfItems.name + " Updated in Cart. ","status": JSON.stringify(req.session.cart) })
          console.log(JSON.stringify(req.session.cart))
          res.send({ "message": "Product " + restOfItems.name + " Updated in Cart. ","status": "success1" })

        }

        else {
          req.session.cart.push({ ...restOfItems, quantity: 1 })
          console.log(JSON.stringify(req.session.cart))
          res.send({ "message": "Product " + restOfItems.name + " Added to Cart. ","status": "success1" })

        }
      }
      else {
        console.log(JSON.stringify(req.session.cart))
        res.send({ "message": "Pelase check the Product Code. Product Code not found in Product list","status":"error1" })

      }




    }
  });
});



//GET Endpoint to remove a product ( by code) from cart.
app.get('/removefromcart/:product_code', function (req, res, next) {

  if (!req.session.cart) {
    console.log("SETTING CART TO ARRAY 22")
    req.session.cart = [];
  }


  var productcode = req.params.product_code;

  Product.findOne({ product_code: productcode }, function (err, docs) {
    if (err) {
      console.log(err)
      res.send({ "message": "Product Not Found" })
    }
    else {
      if (docs) {
        var { _id, __v, ...restOfItems } = docs._doc
        console.log("Result : ", restOfItems);

        const existingCartItem = req.session.cart.find(
          cartItem => cartItem.product_code === productcode
        );

        if (existingCartItem && existingCartItem.quantity === 1) {
          console.log("Remove Condition Mtached")
          req.session.cart = req.session.cart.filter(cartItem => cartItem.product_code !== productcode)
          res.send({ "message": "Product " + restOfItems.name + " Removed from Cart. Updated Cart is: " + JSON.stringify(req.session.cart) })

        }
        else if (existingCartItem && existingCartItem.quantity >= 1) {
          req.session.cart.map(cartItem =>
            cartItem.product_code === productcode
              ? { ...cartItem, quantity: cartItem.quantity-- }
              : cartItem
          )
          res.send({ "message": "Product " + restOfItems.name + " Subtracted from Cart. Udpated Cart is: " + JSON.stringify(req.session.cart) })
        }
        else {
          res.send({ "message": "Product " + restOfItems.name + " Not found in cart." })


        }
      }
      else {
        res.send({ "message": "Pelase check the Product Code. Product Code not found in Product list" })

      }


    }
  });
});


// Start app on port 'PORT' from env file and then connect to mongoDB
app.listen(PORT, function () {
  console.log(`Listening on ${PORT}`);
  connectDb().then(() => {
    console.log("MongoDb connected");
  });
});


module.exports = app; // for testing 