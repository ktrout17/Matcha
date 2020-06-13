const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Chat = require('../models/Chats');
const Likes = require("../models/Likes");
const Views = require("../models/Views");
const { ensureAuthenticated } = require("../config/auth");
const multer = require("multer");
const mongoose = require("mongoose");
const dummyData = require("../faker");
const storage = require("../config/fileStorage");
const upload = multer({
  storage: storage.storage,
  limits: storage.limits,
  fileFilter: storage.fileFilter
});

// Render ejs view pages
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  // dummyData.fake();
  res.render("welcome");
});

router.get("/profiles/:id", ensureAuthenticated,(req, res, next) => {
  const id = req.params.id;
  let visitor = false;
  let liked;

  Likes.findOne({ _userId: req.user.id, likedId: id })
    .exec()
    .then(doc => {
      if (doc) {
        liked = "liked";
      } else {
        liked = "like";
      }
    })
    .catch(err => {
      console.log(err);
      res.end();
    });

  User.findById(id)
    .exec()
    .then(docs => {
      if (!docs) {
        console.log("There was a weird error");
        res.end();
      } else {
        Views.findOne(
          { $and: [{ _userId: req.user.id }, { viewedId: id }] },
          (err, doc) => {
            if (err) throw err;

            if (!doc) {
              visitor = true;

              const newView = new Views({
                _userId: req.user.id,
                viewedId: id
              });

              newView.save(err => {
                if (err) throw err;
              });
            }

            if (visitor) {
              User.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
                .exec()
                .then(doc => {
                  res.render("profiles", {
                    user: doc,
                    liked: liked,
                    curr_userUsername: req.user.username,
                    curr_userId: req.user.id
                  });
                  next();
                })
                .catch(err => {
                  console.log("catch err: " + err);
                });
            }
          }
        )
          .exec()
          .then(() => {
            if (!visitor) {
              if (docs) {
                res.render("profiles", {
                  user: docs,
                  liked: liked,
                  curr_userUsername: req.user.username,
                  curr_userId: req.user.id
                });
                res.end();
              }
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

function matches(likedByUsers, likedUsers) {
  let _ = require('underscore')
  let matches = [];

  matches = _.intersection(likedByUsers, likedUsers)
  return matches;
}

router.get("/chats", ensureAuthenticated, (req, res,next) => {
  const user = req.user;
  let likedUsers = [];
  let likedByUsers = [];
  let matchedUsers = [];

  Likes.find({user_username: user.username}, (err, likes) => {
    likes.forEach(users => {
      likedUsers.push(users.liked_username)
    });
      Likes.find({liked_username: user.username}, (err, currUserliked) => {
        currUserliked.forEach(likedby => {
          likedByUsers.push(likedby.user_username)
        })
       matchedUsers = matches(likedByUsers,likedUsers);
       User.find({username: {$in: matchedUsers, $nin: user.blocked}}, (err, nonBlockedUsers) => {
        res.locals.user = user;
        res.locals.nonBlockedUsers = nonBlockedUsers; 
        next()
       });
      })
  })
}, (req, res, next) => {
  let nonBlockedUsers = res.locals.nonBlockedUsers;
  let user = res.locals.user;
  let chatId = req.url.split('?', 2)[1];

  Chat.find({$and: [{$or: [{to: user.username}, {from: user.username}]}, {chatId: chatId}]}).sort({time: 1}).then(messages => {
      res.render("chats", {
        user: user,
        chatId: chatId,
        messages: messages,
        nonBlockedUsers: nonBlockedUsers.map(nonBlockedUser => {
          return {
            username: nonBlockedUser.username,
            pp: nonBlockedUser.profileImages.image1,
            lastSeen: nonBlockedUser.lastSeen,
            loggedIn: nonBlockedUser.loggedIn,
            bio: nonBlockedUser.bio,
            request: {
              url: "/chats?" + [user.username, nonBlockedUser.username].sort().join('-')
            }
          }
        })
      });
  });
});

router.get("/suggestedMatchas", ensureAuthenticated, (req, res) => {
  User.find({
    $and: [
      // change $or back to $and for suggested searches
      {
        city: req.user.city
      },
      {
        $or: [
          // change to $and for all 5 to match or change it to $or for at least one to match
          {
            "interests.first": {
              $in: [
                req.user.interests["first"],
                req.user.interests["second"],
                req.user.interests["third"],
                req.user.interests["fourth"],
                req.user.interests["fifth"]
              ]
            }
          },
          {
            "interests.second": {
              $in: [
                req.user.interests["first"],
                req.user.interests["second"],
                req.user.interests["third"],
                req.user.interests["fourth"],
                req.user.interests["fifth"]
              ]
            }
          },
          {
            "interests.third": {
              $in: [
                req.user.interests["first"],
                req.user.interests["second"],
                req.user.interests["third"],
                req.user.interests["fourth"],
                req.user.interests["fifth"]
              ]
            }
          },
          {
            "interests.fourth": {
              $in: [
                req.user.interests["first"],
                req.user.interests["second"],
                req.user.interests["third"],
                req.user.interests["fourth"],
                req.user.interests["fifth"]
              ]
            }
          },
          {
            "interests.fifth": {
              $in: [
                req.user.interests["first"],
                req.user.interests["second"],
                req.user.interests["third"],
                req.user.interests["fourth"],
                req.user.interests["fifth"]
              ]
            }
          }
        ]
      },
      {
        $or: [
          {
            $and: [
              { gender: { $eq: req.user.sexPref } },
              { gender: { $eq: "male" } }
            ]
          },
          {
            $and: [
              { gender: { $eq: req.user.sexPref } },
              { gender: { $eq: "female" } }
            ]
          },
          { gender2: { $eq: req.user.sexPref } }
        ]
      },
      // {
      //   fame: 5  *NOTE: Not sure if needed, but pdf wants it.
      // },
      { _id: { $ne: req.user.id } },
      { username: {$nin: req.user.blocked} }
    ]
  })
    .sort({ fame: -1 })
    .select("firstname lastname username profileImages.image1 fame")
    .exec()
    .then(docs => {
      res.status(200).render("suggestedMatchas", {
        users: docs.map(doc => {
          return {
            firstname: doc.firstname,
            lastname: doc.lastname,
            username: doc.username,
            fame: doc.fame,
            profileImage: doc.profileImages.image1,
            request: {
              url: "/profiles/" + doc.id
            }
          };
        })
      });
    })
    .catch();
});
// Dashboard
router.get(
  "/dashboard",
  ensureAuthenticated,
  (req, res, next) => {
    let totalViews = [];

    Views.find({ viewedId: req.user.id }, (err, viewsDoc) => {
      if (viewsDoc. length != 0) {
      viewsDoc.forEach(value => {
        User.find({ _id: value._userId }, (err, userViewsDoc) => {
          userViewsDoc.forEach(valued => {
            totalViews.push(valued.username);
          });
        })
        .exec()
        .then(() => {
          res.locals.totalViews = totalViews;
          next();
          })
          .catch();
      });
      } else {
        next()
      }
    })
      .exec()
      .catch();
  }, (req, res, next) => {
    let totalLikes = [];

    Likes.find({ likedId: req.user.id }, (err, likesDoc) => {
      if (likesDoc.length != 0) {
      likesDoc.forEach(value => {
        User.find({ _id: value._userId }, (err, userLikesDoc) => {
          userLikesDoc.forEach(valued => {
            totalLikes.push(valued.username);
          });
         
        })
        .exec()
        .then(() => {
          res.locals.totalLikes = totalLikes;
            next();
          })
          .catch();
      });
      } else {
        next();
      }
    })
      .exec()
      .catch();

  },
  (req, res, next) => {
    const { totalLikes } = res.locals;
    const { totalViews } = res.locals;

    res.render("dashboard", {
      name: req.user.username,
      pp: req.user.profileImages.image1,
      province: req.user.province,
      city: req.user.city,
      image1: req.user.profileImages.image2,
      image2: req.user.profileImages.image3,
      image3: req.user.profileImages.image4,
      image4: req.user.profileImages.image5,
      gender: req.user.gender,
      sexPref: req.user.sexPref,
      interests: req.user.interests,
      bio: req.user.bio,
      views: req.user.views,
      likes: req.user.likes,
      fame: req.user.fame,
      age: req.user.age,
      userLikes: totalLikes,
      userViews: totalViews
    });
    next();
  }
);

// Index Controller
const IndexController = require("../controllers/index");

router.post(
  "/dashboard",
  (req, res, next) => {
    res.locals.upload = upload;
    next();
  },
  IndexController.index_dashboard
);
router.post("/profiles/:id", IndexController.index_profile);

router.post("/suggestedMatchas", IndexController.index_advancedMathas);

module.exports = router;
