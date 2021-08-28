const sql = require("./db.js");

// constructor
const Post = function(post) {
  this.post_id = post.post_id;
  this.post_text = post.post_text;
  this.poster_id = post.poster_id;
};


Post.create = (newPost, result) => {
  sql.query(`INSERT INTO post SET ?`, newPost, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created post: ", { id: res.insertId, ...newPost });
    result(null, { id: res.insertId, ...newPost }); 
  });
};

Post.findById = (postId, result) => {
  const escaper = sql.escape(postId);
  sql.query(`SELECT * FROM post WHERE post_id = ${escaper}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found post: ", postId, res);
      result(null, res); //res[0]
      return;
    }

    // not found Post with the id
    result({ kind: "not_found" }, null);
  });
};

Post.getAll = result => {
  sql.query("SELECT * FROM post", (err, res) => {
    if (err) {
      (console.log("error: ", err));
      (console.log("Switching to backup database"));
      sql.query("SELECT * FROM post_backup", (err, res) => {
        console.log("post_backup: ", res);
        result(null, res);
      })
      // result(null, err);
      // return;
    }

    if (res) {
      //console.log("post: ", res);
      result(null, res);
    }
  });
};

// Post.updateById = (id, post, result) => {
//   sql.query(
//     "UPDATE post SET email = ?, name = ?, active = ? WHERE id = ?",
//     [post.email, post.name, post.active, id],
//     (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }

//       if (res.affectedRows == 0) {
//         // not found Post with the id
//         result({ kind: "not_found" }, null);
//         return;
//       }

//       console.log("updated post: ", { id: id, ...post });
//       result(null, { id: id, ...post });
//     }
//   );
// };

// Post.remove = (id, result) => {
//   sql.query("DELETE FROM post WHERE post_id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     if (res.affectedRows == 0) {
//       // not found Post with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }

//     console.log("deleted post with id: ", id);
//     result(null, res);
//   });
// };

module.exports = Post;