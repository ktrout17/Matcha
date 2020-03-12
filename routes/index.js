const express = require("express");
const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");
const Likes = require("../models/Likes");
const Views = require("../models/Views");
const { ensureAuthenticated } = require("../config/auth");
const multer = require("multer");
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

router.get("/profiles/:id", (req, res, next) => {
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
                    liked: liked
                  });
                  next();
                })
                .catch(err => {
                  console.log("catch err: " + err), res.end();
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
                  liked: liked
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

router.get("/chats", ensureAuthenticated, (req, res) => res.render("chats"));

router.get("/suggestedMatchas", (req, res) => {
  User.find({
    $and: [
      // change $or back to $and for suggested searches
      {
        city: req.user.city
      },
      {
        $and: [
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
      {
        fame: 5
      },
      { _id: { $ne: req.user.id } }
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
    let totalLikes = [];
    let totalViews = [];

    Views.find({ viewedId: req.user.id }, (err, viewsDoc) => {
      viewsDoc.forEach(value => {
        User.find({ _id: value._userId }, (err, userViewsDoc) => {
          userViewsDoc.forEach(valued => {
            totalViews.push(valued.username);
          });
        })
          .exec()
          .then(() => {
            res.locals.totalViews = totalViews;

            Likes.find({ likedId: req.user.id }, (err, likesDoc) => {
              likesDoc.forEach(value => {
                User.find({ _id: value._userId }, (err, userLikesDoc) => {
                  userLikesDoc.forEach(valued => {
                    totalLikes.push(valued.username);
                  });
                  res.locals.totalLikes = totalLikes;
                })
                .exec()
                .then(() => {
                    next();
                  })
                  .catch();
              });
            })
              .exec()
              .catch();
          })
          .catch();
      });
    })
      .exec()
      .catch();
  },
  (req, res, next) => {
    const { totalLikes } = res.locals;
    const { totalViews } = res.locals;
    console.log(totalLikes);

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

router.get("/notifications", (req, res) => res.render("notifications"));

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
