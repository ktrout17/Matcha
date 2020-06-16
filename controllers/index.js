const multer = require("multer");
const crypto = require("crypto-extra")
const User = require("../models/User");
const Likes = require("../models/Likes");
const Chats = require("../models/Chats");

exports.index_dashboard = (req, res, next) => {
  let uploads = res.locals.upload.fields([
    {
      name: "image1",
      maxCount: 1
    },
    {
      name: "image2",
      maxCount: 1
    },
    {
      name: "image3",
      maxCount: 1
    },
    {
      name: "image4",
      maxCount: 1
    }
  ]);
  uploads(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      req.flash("error_msg", err);
      res.status(500).redirect("/dashboard");
      next();
    } else if (err) {
      req.flash("error_msg", err);
      res.status(500).redirect("/dashboard");
      next();
    }
    if (req.files["image1"]) {
      var val = {
        $set: {
          "profileImages.image2": req.files["image1"][0].filename
        }
      };
    } else if (req.files["image2"]) {
      var val = {
        $set: {
          "profileImages.image3": req.files["image2"][0].filename
        }
      };
    } else if (req.files["image3"]) {
      var val = {
        $set: {
          "profileImages.image4": req.files["image3"][0].filename
        }
      };
    } else if (req.files["image4"]) {
      var val = {
        $set: {
          "profileImages.image5": req.files["image4"][0].filename
        }
      };
    }
    await User.findByIdAndUpdate(
      req.user.id,
      val,
      { new: true },
      (err, doc) => {
        if (err) {
          req.flash("error_msg", err);
          res.status(500).redirect("/dashboard");
          next();
        }
        req.flash("success_msg", "Successfully updated picture.");

        res.redirect("/dashboard");
        next();
      }
    );
  });
};

exports.index_profile = (req, res, next) => {
  const id = req.params.id;
  const currUser = req.user;
  
  if (req.body.like_btn === 'like_btn') {
    
    User.findByIdAndUpdate(id,
      { $inc: { likes: 1 },
      $push: {likedby: currUser.username}},
      {new: true}, (err, doc) => {
        if (err) throw err;
        
        if (doc) {
          Likes.findOne({user_username: currUser.username, liked_username: doc.username},
            (err, isLiked) => {
              if (err) throw err;

              if (isLiked != null){
                console.log("like already")
                res.redirect('/profiles/' + id)
              } else {
                const newLike = new Likes ({
                  _userId: currUser.id,
                  likedId: id,
                  user_username: currUser.username,
                  liked_username: doc.username
                });
                
                newLike.save();
                res.redirect('/profiles/' + id);
              }
            })
        }
      })
  } else if (req.body.block_btn === 'block_btn') {
    const id = req.params.id;
    const currUser = req.user;
    
    User.findByIdAndUpdate(id,
      { $inc: { likes: -1 },
      $pull: {likedby: currUser.username},
      $push: {blocked: currUser.username}},
      {new: true}, (err, doc) => {
        if (err) throw err;
        
        User.findByIdAndUpdate(currUser.id,
          {$push: {blocked: doc.username}}, (err) => {
            if (err) throw err;
          })
          Likes.findOneAndDelete({user_username: currUser.username, liked_username: doc.username},
            (err) => {
              if (err) throw err;
              res.redirect('/profiles/' + id)
            })
      });
  }
};

exports.index_advancedMathas = (req, res) => {
  const search = req.body.search;

  if (req.body.sSubmit === "sSubmit") {
    User.find({$and: [{ username: search }, { username: { $ne: req.user.username } }]})
      .exec()
      .then(docs => {
        res.render("suggestedMatchas", {
          users: docs.map(doc => {
            return {
              firstname: doc.firstname,
              lastname: doc.lastname,
              username: doc.username,
              profileImage: doc.profileImages.image1,
              request: {
                url: "/profiles/" + doc.id
              }
            };
          })
        });
      });
  } else if (req.body.aSubmit === "aSubmit") {
    const agePref = req.body.age_preference;
    const interests = req.body.interests;
    const fame = parseInt(req.body.fame);
    const loc = req.body.loc;
    const sortby = req.body.sortby;

    let interestsQuery;
    let ageQuery;
    let fameQuery;
    let locQuery;
    let sortQuery;


    let a = -1,
      b = -1,
      c = -1,
      tagsSort = {};
    if (Array.isArray(sortby)) {
      sortby.forEach(function(value) {
        if (value === "age") a = 1;
        if (value === "loc") b = 1;
        if (value === "fame") c = 1;
        if (value === "tags")
          tagsSort = {
            "interests.first": 1,
            "interests.second": 1,
            "interests.third": 1,
            "interests.fourth": 1,
            "interests.fifth": 1
          };
      });
    } else {
      if (sortby === "age") a = 1;
      if (sortby === "loc") b = 1;
      if (sortby === "fame") c = 1;
      if (sortby === "tags")
        tagsSort = {
          "interests.first": 1,
          "interests.second": 1,
          "interests.third": 1,
          "interests.fourth": 1,
          "interests.fifth": 1
        };
    }
    sortQuery = { age: `${a}`, city: `${b}`, fame: `${c}` };

    const SortResult = {};
    Object.keys(sortQuery).forEach(key => (SortResult[key] = sortQuery[key]));
    Object.keys(tagsSort).forEach(key => (SortResult[key] = tagsSort[key]));

    switch (agePref) {
      case "age1":
        ageQuery = { age: { $gte: 18, $lte: 24 } };
        break;
      case "age2":
        ageQuery = { age: { $gte: 25, $lte: 31 } };
        break;
      case "age3":
        ageQuery = { age: { $gte: 32, $lte: 38 } };
        break;
      case "age4":
        ageQuery = { age: { $gte: 39, $lte: 45 } };
        break;
      case "age5":
        ageQuery = { age: { $gte: 46, $lte: 52 } };
        break;
      case "age6":
        ageQuery = { age: { $gte: 53, $lte: 59 } };
        break;
      case "age7":
        ageQuery = { age: { $gte: 60, $lte: 66 } };
        break;
      default:
        ageQuery = {};
    }

    if (typeof interests !== "undefined") {
      if (Array.isArray(interests)) {
        interestsQuery = {
          $or: [
            {
              "interests.first": {
                $in: [
                  interests[0],
                  interests[1],
                  interests[2],
                  interests[3],
                  interests[4]
                ]
              }
            },
            {
              "interests.second": {
                $in: [
                  interests[0],
                  interests[1],
                  interests[2],
                  interests[3],
                  interests[4]
                ]
              }
            },
            {
              "interests.third": {
                $in: [
                  interests[0],
                  interests[1],
                  interests[2],
                  interests[3],
                  interests[4]
                ]
              }
            },
            {
              "interests.fourth": {
                $in: [
                  interests[0],
                  interests[1],
                  interests[2],
                  interests[3],
                  interests[4]
                ]
              }
            },
            {
              "interests.fifth": {
                $in: [
                  interests[0],
                  interests[1],
                  interests[2],
                  interests[3],
                  interests[4]
                ]
              }
            }
          ]
        };
      } else {
        interestsQuery = {
          $or: [
            {
              "interests.first": { $eq: interests }
            },
            {
              "interests.second": { $eq: interests }
            },
            {
              "interests.third": { $eq: interests }
            },
            {
              "interests.fourth": { $eq: interests }
            },
            {
              "interests.fifth": { $eq: interests }
            }
          ]
        };
      }
    } else {
      interestsQuery = {};
    }

    fameQuery = { fame: fame };

    switch (loc) {
      case "near":
        locQuery = { city: req.user.city };
        break;
      case "far":
        locQuery = { province: req.user.province };
        break;
      case "any":
        locQuery = {}; // or {country: req.user.country } to be specific to the country
        break;
      default:
        locQuery = {};
    }

    User.find({
      $and: [
        ageQuery,
        interestsQuery,
        fameQuery,
        locQuery,
        { _id: { $ne: req.user.id } },
        { username: {$nin: req.user.blocked} }
      ]
    })
      .sort(SortResult)
      .exec()
      .then(docs => {
        res.render("suggestedMatchas", {
          users: docs.map(doc => {
            return {
              firstname: doc.firstname,
              lastname: doc.lastname,
              username: doc.username,
              profileImage: doc.profileImages.image1,
              request: {
                url: "/profiles/" + doc.id
              }
            };
          })
        });
      });
  }
};