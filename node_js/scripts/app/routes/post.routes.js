const limit = require('express-limit').limit;

module.exports = app => {
    const post = require("../controllers/post.controller.js");
    const {signin, refresh} = require('../../authentication');
    const {verify} = require('../../middleware');

    app.post('/post', verify, limit({
      max:    5,        // 5 requests
      period: 60 * 1000 // per minute (60 seconds)
    }), post.create);
    //app.post("/post", post.create);
    app.get("/post", limit({
      max:    20,        
      period: 60 * 1000 
    }), post.findAll);
    app.get("/post/:postId", verify, limit({
      max:    20,       
      period: 60 * 1000 
    }), post.findOne);
    // app.put("/post/:postId", post.update);
    //app.delete("/post/:postId", post.delete);

    app.get("/ig", post.getIg);
  
  };