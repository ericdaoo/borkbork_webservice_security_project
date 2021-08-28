const Post = require("../models/post.model.js");
const multer = require('multer');
const helpers = require('./helpers');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");
const fs = require("fs");
const fse = require('fs-extra');


//for image storing
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'public/images/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, img_id);//path.extname(file.originalname));
  }
});


// Create and Save a new Post
exports.create = (req, res) => {
  post_id_num = Date.now()
  img_id = 'img_id_' + post_id_num + ".jpeg";
  
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('post_img');


  //photo upload
  upload(req, res, function(err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any

      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }
      else if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
      }
    
      // Creating a post using the Post module from post.model.js
      //by using the constructor, this new object will inherit all the functions inside
      // the constructor(.create)
      const post = new Post({
        post_id: post_id_num,
        post_text: req.body.post_text,
        poster_id: Number(req.cookies.user)
      });
    
      // Save Post in the database by calling the .create function from the Post module
      //don't understand this data parameter
      Post.create(post, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Post."
          });
        else res.redirect('/');
        
      });

      // Display uploaded image for user validation
      //res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
      //res.send(req.body.post_text)
      //res.send(img_id)
    });
};




// // Create and Save a new Post
// //this first line basically will export this function named "create"
// exports.create = (req, res) => {
//     // Validate request
//     if (!req.body) {
//       res.status(400).send({
//         message: "Content can not be empty!"
//       });
//     }
  
//     // Creating a post using the Post module from post.model.js
//     //by using the constructor, this new object will inherit all the functions inside
//     // the constructor(.create)
//     const post = new Post({
//       post_text: req.body.post_text,
//       poster_id: req.body.poster_id,
//     });
  
//     // Save Post in the database by calling the .create function from the Post module
//     //don't understand this data parameter
//     Post.create(post, (err, data) => {
//       if (err)
//         res.status(500).send({
//           message:
//             err.message || "Some error occurred while creating the Post."
//         });
//       else res.send(data);
//     });
//   };

// Retrieve all Customers from the database.


exports.getIg = (req, res) => {
var POST_URL = ["https://www.instagram.com/p/CI3c2iQlfGx/", "https://www.instagram.com/p/CIicTGXhVkP/", "https://www.instagram.com/p/CInJsvAhWKM/"];
var APP_ID = "707297213549381";
var CLIENT_TOKEN = "ecf1a9a8abfec56a1bef790e5660ad19";
const data_html = []

async function getPost(i) {
  var response = await fetch(
    "https://graph.facebook.com/v8.0/instagram_oembed?url=" +
    POST_URL[i] + "&omitscript=true&access_token=" + APP_ID + "|" +
    CLIENT_TOKEN);
  var data = await response.json();
  const myPostHtml = await data.html;
  data_html.push(myPostHtml);

  
};

// async function get_igs() {
//   await getPost(0)
// }
//async function () 
getPost(0).then(
  getPost(1).then(
    getPost(2).then(result => {
    res.json(data_html);
//   }).catch(err => {
//     console.log(err);
//   })
// ).catch(err => {
//   console.log(err);
  })));
  
//;

};

exports.findAll = (req, res) => {
  try {
    if (!fs.existsSync("public/images")) {
      console.log("image database is down")
      fse.copy("public/backup_images", "public/images");
      console.log("Sucessfully switched over to backup database");
    }
  }
  catch (err) {
    console.error(err)
  }
    Post.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving post."
        });
      else res.send(data);
    });
  };

// Find a single Post with a postId
exports.findOne = (req, res) => {
    Post.findById(req.params.postId, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Post with id ${req.params.postId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving Post with id " + req.params.postId
          });
        }
      } else res.send(data);
    });
  };

// Update a Post identified by the postId in the request
// exports.update = (req, res) => {
//     if (!req.body) {
//       res.status(400).send({
//         message: "Content can not be empty!"
//       });
//     }
  
//     Post.updateById(
//       req.params.postId,
//       new Post(req.body),
//       (err, data) => {
//         if (err) {
//           if (err.kind === "not_found") {
//             res.status(404).send({
//               message: `Not found Post with id ${req.params.postId}.`
//             });
//           } else {
//             res.status(500).send({
//               message: "Error updating Post with id " + req.params.postId
//             });
//           }
//         } else res.send(data);
//       }
//     );
//   };

// Delete a Post with the specified postId in the request
// exports.delete = (req, res) => {
//     Post.remove(req.params.postId, (err, data) => {
//       if (err) {
//         if (err.kind === "not_found") {
//           res.status(404).send({
//             message: `Not found Post with id ${req.params.postId}.`
//           });
//         } else {
//           res.status(500).send({
//             message: "Could not delete Post with id " + req.params.postId
//           });
//         }
//       } else res.send({ message: `Post was deleted successfully!` });
//     });
//   };
