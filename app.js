//set up dependencies
const express = require("express");
const redis = require("redis");
const axios = require("axios");
const bodyParser = require("body-parser");

//setup port constants
const port_redis = 6379;
const port = 5000;

//configure redis client on port 6379
const redis_client = redis.createClient(port_redis);

//configure express server
const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middleware Function to Check Cache
checkRedisCache = (req, res, next) => {
  const { id } = req.params;

  redis_client.get(id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    if (data != null) {
      res.send(data);
    } else {
      next();
    }
  });
};

//  Endpoint:  GET /starships/:id
//  @desc Return Starships data for particular starship id
app.get("/user/:id", checkRedisCache, async (req, res) => {
  try {
    const { id } = req.params;
    const users = await axios.get(
      `https://jsonplaceholder.typicode.com/todos/${id}`
    );
    //get data from response
    const data = users.data;
    //add data to Redis
    redis_client.setex(id, 3600, JSON.stringify(data));

    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.listen(port, () => console.log(`Server running on Port ${port}`));
