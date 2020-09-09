## Basket-with-offers
	This project is to create a shopping basket with products listed below along with the product code, Name , and Price.

	+--------------|--------------|---------+
	| Product Code |     Name     |  Price  |
	+--------------|--------------|---------+
	|     CH1      |   Chai       |  $3.11  |
	|     AP1      |   Apples     |  $6.00  |
	|     CF1      |   Coffee     | $11.23  |
	|     MK1      |   Milk       |  $4.75  |
	|     OM1      |   Oatmeal    |  $3.69  |
	+--------------|--------------|---------+
	
### We’ll need to update our checkout system to apply the following rules.

	1. BOGO -- Buy-One-Get-One-Free Special on Coffee. (Unlimited)
	2. APPL -- If you buy 3 or more bags of Apples, the price drops to $4.50.
	3. CHMK -- Purchase a box of Chai and get milk free. (Limit 1)
	4. APOM -- Purchase a bag of Oatmeal and get 50% off a bag of Apples
## Dev Requirements
	For development, you will need Node.js, MongoDB instance (either as docker container or local install), and Docker intalled and a node global package, npm, installed in your environement.
    make sure you have an instance of mongoDB running either as docker container or on your machine
	create and add entries for mongoDB and nodejs express port in .env to run code locally by running npm start
	.env :
	---
	  MONGO_HOST=<your mongo db instance host>
	  MONGO_PORT=27017
	  DATABASE=rackspace-basket
	  PORT=8080
	---


## Node
### Node installation on Windows
	Just go on official Node.js website and download the installer. Also, be sure to have git available in your PATH, npm might need it (You can find git here).

### Node installation on Ubuntu
#### You can install nodejs and npm easily with apt install, just run the following commands.

	$ sudo apt install nodejs
	$ sudo apt install npm
### Other Operating Systems
You can find more information about the installation on the official Node.js website and the official NPM website.

	If the installation was successful, you should be able to run the following command.

	  $ node --version

		v12.18.0

	  $ npm --version

		6.14.4
## Running with docker-compose
### Clone git repository to local machine
	$ git clone https://github.com/ankuratudemy/basket-with-offers
	$ cd basket-with-offers
	$ npm install 
### Configure app
Create and Open .env-docker then edit it with your settings. You will need:
		
		MONGO_HOST=mongodb
		MONGO_PORT=27017
		DATABASE=rackspace-basket
		PORT=8080

### Create docker volume to mount a local host directory mapped to /data/db folder insode mongoDB conatiner:
	$ docker volume create --name basket_mongodb_volume --opt type=none --opt device=<e.g. /f/rackspace-basket/mongoDBData/> --opt o=bind

	output:
	basket_mongodb_volume
	
#### Update docker-compose.yml with volume name you just created. This will allow to persist mongoDB data even when you delee and rerun mongoDB container

	    version: "3.0"
		services:
		  test:
		    image: rackspace-basket
		    command:
		      dockerize
			-wait tcp://mongodb:27017 -wait tcp://web:8080 -timeout 10s
			bash -c "npm test"
		    env_file: .env-docker
		    links:
		      - web
		      - mongodb
		  web:
		    container_name: rackspace-basket
		    image: rackspace-basket
		    build: .
		    ports:
		    - "8080:8080"
		    env_file: .env-docker
		    volumes:
		    - ./host_folder/:/apps
		    depends_on:
		    - mongodb
		    links:
		    - mongodb
		  mongodb:
		    container_name: mongodb
		    image: mongo
		    volumes:
		    - basket_mongodb_volume:/data/db/
		    ports:
		    - "27017:27017"
		volumes:
		  basket_mongodb_volume:


#### Start services - Go to powershell( on windows ) or other git bash shell and run following commands from root project folder:
		  ---
		docker-compose up --build
		  ---

## Mocha Chai Functional testing 
 Docker compose will bring up mongodb container --> rackspace-basket --> test container. Test container will perform functional testing as per test defined in test/test.js 
 Test conatiner will exit once tests are performed with exit code '0' for success. else exit code will be '1' 

 ![test_conatiner](https://user-images.githubusercontent.com/65302849/91607753-0f55ce00-e992-11ea-92d6-636e8a46db82.JPG)


### Verify Services:
	Open browser and hit  http://localhost:8080/cart. You should see an empty cart
![cart](https://user-images.githubusercontent.com/65302849/91467054-a85ee900-e8ad-11ea-92f5-fa82b586af2b.JPG)


## APIs ( How to use )
### POST /createProducts
```diff
- **You must upload products data first once the services are up**.
```
	
	 Run below mentioned curl command to upload products.json (find it in host_folder) data using below curl command

		$ curl -v -H "Content-Type: application/json" -X POST -d @host_folder/products.json  http://localhost:8080/createProducts

		  Response: success: {"message":"Save sucesfull","status":"success"}
			    failure: {"message":"Save unsucesfull","status":"failed"}
### GET /deleteProducts
    Open browser and hit : http://localhost:8080/deleteProducts
	This will delete products collection(data) from mongoDB
		   Response: sucess: {"message":"Drop sucesfull"}
		             failure: {"message":"Drop unsucesfull with error: ns not found"}


### GET /products
		You can verify products upload is successfull by running going to http://localhost:8080/products in browser
		You will get a response with products data in json
		
![products](https://user-images.githubusercontent.com/65302849/91468262-5d45d580-e8af-11ea-9e13-236be245b8a0.JPG)


### GET /addToCart/<product_code to add >
		To add Items (e.g MK1) to the cart hit : http://localhost:8080/addToCart/MK1  in browser. You can add as many items you want by changing the product_code.
		If you keep refreshing the page the quantity for same product_code will increment by 1 each time.
![addToCart](https://user-images.githubusercontent.com/65302849/91468955-5bc8dd00-e8b0-11ea-899e-054bd1bef5d7.JPG)


### GET /cart
		Hit http://localhost:8080/cart

		You get the latest cart status as output
![Cart1](https://user-images.githubusercontent.com/65302849/91468966-5d92a080-e8b0-11ea-8082-bdbc00eeb3c9.JPG)


### GET /removefromcart/<product_code to add >
		To remove an item from cart hit http://loclahost:8080/removefromcart/MK1
		This will deacrease the quantity of MK1 in cart by 1 and if 1 item was present it will remove the item from cart.
		You can remove as many items you want by changing the product_code.
		If you keep refreshing the page the quantity for same product_code will decrease by 1 each time.
![removefromcart](https://user-images.githubusercontent.com/65302849/91469669-4bfdc880-e8b1-11ea-9910-43cd8d351d66.JPG)

### GET /emptycart
		This will empty your cart and remove everything from it.
![emptycart](https://user-images.githubusercontent.com/65302849/91469670-4d2ef580-e8b1-11ea-8170-bd95e2d7c170.JPG)


### GET /
		Hittin http://localhost:8080/ will give you the session expiry time and number to views to / path.

![session](https://user-images.githubusercontent.com/65302849/91470142-f70e8200-e8b1-11ea-8611-ed27e277498e.JPG)
	
