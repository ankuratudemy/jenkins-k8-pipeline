//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Product = require("../models/Product.model");

//Require the dev-dependencies
let chai = require('chai');
let chaiDom = require("chai-dom");
let chaiHttp = require('chai-http');
expect = require('chai').expect;
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);
//chai.use(chaiDom);
let agent = chai.request.agent(server);

describe('Functional test', () => {
  before((done) => { //Before  test we empty the Product collection
      Product.collection.drop({}, (err) => { 
         done();           
      });        
  });

 
    it(' Should be able to add products', (done) => {
        let products = [{ "product_code":"CH1", "name":"Chai", "price":3.11 },{ "product_code":"AP1", "name":"Apples", "price":6.00 },{ "product_code":"CF1", "name":"Coffee", "price":11.23 },{ "product_code":"MK1", "name":"Milk", "price":4.75 },{ "product_code":"OM1", "name":"Oatmeal", "price":3.69 }]


        
            agent.post('/createProducts')
            .send(products)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('status').eql('success');   
                  Cookies = res.headers['set-cookie'].pop().split(';')[0];
                  done();             
              
            });
      });


 //   describe('/GET products', () => {
      it('it should GET all the products and length of array should be 5', (done) => {
        agent.set('Cookie', 'cookieName='+Cookies)
            .get('/products')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('array');
                  res.body.length.should.be.eql(5);
                  done();
            });
      });
 // });

 // describe('/GET add item CH1 to cart', () => {
    it('It should add CH1 to cart and status should be success', (done) => {
      agent.set('Cookie', 'cookieName='+Cookies)
          .get('/addToCart/CH1')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('success1');
                done();
          });
    });
//});

 // describe('/GET add item ZM1 to cart', () => {
    it('It should not be able to add ZM1 to cart and status shoule be Error', (done) => {
      agent.set('Cookie', 'cookieName='+Cookies)
          .get('/addToCart/ZM1')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('status').eql('error1');
                done();
          });
    });
//});

//describe('/GET add item AP1 to cart', () => {
  it('It should add CH1 to cart and status should be success', (done) => {
    agent.set('Cookie', 'cookieName='+Cookies)
        .get('/addToCart/AP1')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('success1');
          done();
        });
  });
//});


//describe('/GET cart and check amount', () => {
  it('Checks if total is $9.11', (done) => {
    agent.set('Cookie', 'cookieName='+Cookies)
        .get('/cart')
        .end((err, res) => {
          res.should.have.status(200);
          console.log(res.text)
          //res.body.should.be.a('object');
          res.text.should.contain('$9.11')
         
          done();
        });
  });

  it('deletes products collection in the end', (done) => {
  agent.get('/deleteProducts')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message')  
                  done();             
              
            });
      });
//});

  
});   

