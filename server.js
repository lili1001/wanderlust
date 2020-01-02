let express = require("express");
let app = express();
let reloadMagic = require("./reload-magic.js");
let cookieParser = require("cookie-parser");
app.use(cookieParser());
let multer = require("multer");
let upload = multer({ dest: __dirname + "/uploads" });
app.use("/images", express.static(__dirname + "/uploads"));
let hash = require("password-hash");
reloadMagic(app);

app.use("/", express.static("build")); // Needed for the HTML and JS files
app.use("/", express.static("public")); // Needed for local assets
//global=============================================================
let sessions = {};
const generateId = length => {
  const base = "abcdefghijklmonpqrstuvwxyz";
  let id = "";
  for (let i = 0; i < length; i++) {
    let index = Math.floor(Math.random() * 26);
    id = id + base[index];
  }
  return id;
};

//handle database-----------------------------------------------------------------
let MongoClient = require("mongodb").MongoClient;
let ObjectID = require("mongodb").ObjectID;
let dbo = undefined;
let url =
  "mongodb+srv://lili:123@cluster0-axnip.mongodb.net/test?retryWrites=true&w=majority";
MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
  if (err) {
    console.log(err);
    return;
  }
  dbo = db.db("wanderlust");
  console.log("--------------------------database initialized------------");
});

// Your endpoints go after this line
app.post("/signup", upload.none(), async (req, res) => {
  let userGiven = req.body.username;
  dbo
    .collection("auth")
    .find({ username: userGiven })
    .toArray((err, usernames) => {
      if (err) {
        console.log(err);
        return;
      }
      if (usernames.length > 0) {
        console.log("username exists");
        reply = {
          success: false,
          msg: "this username has been take, please choose another one"
        };
        res.send(JSON.stringify(reply));
        return;
      } else {
        let passwordHashed = hash.generate(req.body.password);
        dbo.collection("auth").insertOne(
          {
            username: userGiven,
            password: passwordHashed
          },
          (err, result) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log("user auth info stored");
          }
        );
        let userdata = {
          username: userGiven,
          image: "http://placekitten.com/798/798",
          myJourneysPosted: [],
          myPlansPosted: [],
          myJourneysFav: [],
          myPlansFav: [],
          myPlansJoined: []
        };
        console.log("userdata", userdata);
        dbo.collection("users").insertOne(userdata, (err, dbResult) => {
          if (err) {
            console.log(err);
            rerurn;
          }
          let sid = generateId(6);
          sessions[sid] = userGiven;
          res.cookie("sid", sid);
          res.send(JSON.stringify({ success: true, userdata: userdata }));
          console.log("user data pushed to users collection");
        });
      }
    });
});
//change my pic----------------------------------------------------
app.post("/myIMG", upload.none(), (req, res) => {
  console.log("change my pic", req.body);
  let username = sessions[req.cookies.sid];
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $set: { image: req.body.myIMG } },
        err => {
          if (err) {
            res.send(
              JSON.stringify({
                success: false,
                msg: "update users collection failed"
              })
            );
            console.log(err);
            return;
          }
          console.log("update image in  users collection");
          res.send(JSON.stringify({ success: true }));
          return;
        }
      );
  });
});

//login -----------------------------------------------------------------
app.post("/login", upload.none(), (req, res) => {
  let userGiven = req.body.username;
  dbo.collection("auth").findOne({ username: userGiven }, (err, result) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "auth info caould not be retrieved"
        })
      );
      return;
    }
    if (result === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    let passwordedHashed = result.password;
    if (hash.verify(req.body.password, passwordedHashed)) {
      //send back cookies and data
      console.log("login as ", result.username);
      dbo
        .collection("users")
        .findOne({ username: userGiven }, (err, userdata) => {
          if (err) {
            console.log(err);
            res.send(
              JSON.stringify({
                success: false,
                msg: "user data could not be retrieved"
              })
            );
            return;
          }
          let sid = generateId(6);
          sessions[sid] = userGiven;
          res.cookie("sid", sid);
          res.send(JSON.stringify({ success: true, userdata: userdata }));
        });
      return;
    }
    res.send(JSON.stringify({ success: false, msg: "invalid password" }));
    return;
  });
});
app.get("/logout", (req, res) => {
  delete sessions[req.cookies.sid];
  res.send(JSON.stringify({ success: true }));
});
//autologin-----------------------------------------------------------
app.get("/autologin", (req, res) => {
  let sid = req.cookies.sid;
  let username = sessions[sid];
  if (!username) {
    res.send(JSON.stringify({ success: false, msg: "invalid session Id" }));
    return;
  }
  if (username) {
    console.log("active session found");
    dbo.collection("users").findOne({ username: username }, (err, userdata) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({
            success: false,
            msg: "users info could not be retrieved"
          })
        );
        return;
      }
      if (userdata === null) {
        res.send(JSON.stringify({ success: false, msg: "invalid username" }));
        return;
      }
      res.send(JSON.stringify({ success: true, userdata: userdata }));
    });
  }
});

//post journery--------------------------------------------------------------------
app.post("/postmyjourney", upload.none(), (req, res) => {
  console.log("post a journey", req.body);
  let username = sessions[req.cookies.sid];
  let postId = generateId(8);
  let journeyData = {
    username: username,
    journeyId: postId,
    title: req.body.title,
    destination: req.body.destination,
    days: req.body.days,
    date: req.body.date,
    expense: req.body.expense,
    coverImage: req.body.coverImage,
    content: JSON.parse(req.body.content)
  };
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $push: { myJourneysPosted: postId } },
        err => {
          if (err) {
            res.send({ success: false, msg: "update users collection failed" });
            console.log(err);
            return;
          }
          console.log("new journeyId written to users collection");
          //insert journey into journeys collection
          dbo.collection("journeys").insertOne(journeyData, (err, dbResult) => {
            if (err) {
              console.log(err);
              rerurn;
            }
            res.send(JSON.stringify({ success: true }));
            console.log("push journey data to journeys collection");
          });
        }
      );
  });
});
//delete a journey--------------------------------------------------------------
app.post("/deletejourney", upload.none(), (req, res) => {
  console.log("delete a journey", req.body);
  let username = sessions[req.cookies.sid];
  let journeyId = req.body.id;
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $pull: { myJourneysPosted: journeyId } },
        err => {
          if (err) {
            res.send({ success: false, msg: "update users collection failed" });
            console.log(err);
            return;
          }
          console.log(" journeyId deleted in users collection");
          //remove journey in journeys collection
          dbo
            .collection("journeys")
            .remove({ journeyId: journeyId }, (err, dbResult) => {
              if (err) {
                console.log(err);
                rerurn;
              }
              res.send(JSON.stringify({ success: true }));
              console.log("remove journey data in journeys collection");
            });
        }
      );
  });
});
//delete a plan--------------------------------------------------------------
app.post("/deleteplan", upload.none(), (req, res) => {
  console.log("delete a plan", req.body);
  let username = sessions[req.cookies.sid];
  let planId = req.body.id;
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $pull: { myPlansPosted: planId } },
        err => {
          if (err) {
            res.send({ success: false, msg: "update users collection failed" });
            console.log(err);
            return;
          }
          console.log(" planId deleted in users collection");
          //remove plan in plans collection
          dbo
            .collection("plans")
            .remove({ planId: planId }, (err, dbResult) => {
              if (err) {
                console.log(err);
                rerurn;
              }
              res.send(JSON.stringify({ success: true }));
              console.log("remove plan data in plans collection");
            });
        }
      );
  });
});
//post plan---------------------------------------------------------------------
app.post("/postmyplan", upload.none(), (req, res) => {
  console.log("post a plan", req.body);
  let username = sessions[req.cookies.sid];
  let postId = generateId(8);
  let planData = {
    username: username,
    planId: postId,
    contact: req.body.contact,
    participants: [],
    title: req.body.title,
    from: req.body.from,
    destination: req.body.destination,
    days: req.body.days,
    date: req.body.date,
    idealNumber: req.body.idealNumber,
    coverImage: req.body.coverImage,
    content: req.body.content
  };
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $push: { myPlansPosted: postId } },
        err => {
          if (err) {
            res.send({ success: false, msg: "update users collection failed" });
            console.log(err);
            return;
          }
          console.log("new planId written to users collection");
          //insert journey into journeys collection
          dbo.collection("plans").insertOne(planData, (err, dbResult) => {
            if (err) {
              console.log(err);
              rerurn;
            }
            res.send(JSON.stringify({ success: true }));
            console.log("push plan data to plans collection");
          });
        }
      );
  });
});
//fetch all posts--------------------------------------------------------------
app.get("/getallposts", (req, res) => {
  let response = {};
  dbo
    .collection("journeys")
    .find({})
    .toArray((err, journeyposts) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({
            success: false,
            msg: "journeys data could not be retrived"
          })
        );
        return;
      }
      if (journeyposts) {
        console.log("all journey posts", journeyposts);
        response.allJourneys = journeyposts;
      } else {
        response.allJourneys = [];
      }
      dbo
        .collection("plans")
        .find({})
        .toArray((err, planposts) => {
          if (err) {
            console.log(err);
            res.send(
              JSON.stringify({
                success: false,
                msg: "plans data could not be retrived"
              })
            );
            return;
          }
          if (planposts) {
            console.log("all plan posts", planposts);
            response.allPlans = planposts;
          } else {
            console.log("my plan posts", planposts);
            response.allPlans = [];
          }
          console.log("data to be sent to front end by getallposts", response);
          //posts -----is an onject{myJourneys:[], myPlans:[]}
          res.send(JSON.stringify({ success: true, posts: response }));
        });
    });
});
//fetch my favorite posts-------------------------------------------------------------------
app.get("/getmyfavposts", (req, res) => {
  console.log("start fetch my favorite posts on back end");
  let response = {};
  let username = sessions[req.cookies.sid];
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    let journeysFavId = userdata.myJourneysFav;
    let plansFavId = userdata.myPlansFav;
    console.log(
      "journey Fav ids: ",
      journeysFavId,
      "plan fav ids: ",
      plansFavId
    );
    dbo
      .collection("journeys")
      .find({ journeyId: { $in: journeysFavId } })
      .toArray((err, journeyposts) => {
        if (err) {
          console.log(err);
          res.send(
            JSON.stringify({
              success: false,
              msg: "journeys data could not be retrived"
            })
          );
          return;
        }
        console.log("my fav journey posts", journeyposts);
        response.myFavJourneys = journeyposts;
        dbo
          .collection("plans")
          .find({ planId: { $in: plansFavId } })
          .toArray((err, planposts) => {
            if (err) {
              console.log(err);
              res.send(
                JSON.stringify({
                  success: false,
                  msg: "plans data could not be retrived"
                })
              );
              return;
            }
            console.log("my plan posts", planposts);
            response.myFavPlans = planposts;
            console.log("data to be sent to front end by getmyposts", response);
            //posts -----is an onject{myJourneys:[], myPlans:[]}
            res.send(JSON.stringify({ success: true, posts: response }));
          });
      });
  });
});
//fetch my posts-------------------------------------------------------------------
app.get("/getmyposts", (req, res) => {
  console.log("start fetch my posts on back end");
  let response = {};
  let username = sessions[req.cookies.sid];
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    //get my joined plans Id
    let myPlansJoined = userdata.myPlansJoined;
    dbo
      .collection("journeys")
      .find({ username: username })
      .toArray((err, journeyposts) => {
        if (err) {
          console.log(err);
          res.send(
            JSON.stringify({
              success: false,
              msg: "journeys data could not be retrived"
            })
          );
          return;
        }
        console.log("my journey posts", journeyposts);
        response.myJourneys = journeyposts;
        dbo
          .collection("plans")
          .find({ username: username })
          .toArray((err, planposts) => {
            if (err) {
              console.log(err);
              res.send(
                JSON.stringify({
                  success: false,
                  msg: "plans data could not be retrived"
                })
              );
              return;
            }
            console.log("my plan posts", planposts);
            response.myPlans = planposts;
            dbo
              .collection("plans")
              .find({ planId: { $in: myPlansJoined } })
              .toArray((err, planposts) => {
                if (err) {
                  console.log(err);
                  res.send(
                    JSON.stringify({
                      success: false,
                      msg: "plans data could not be retrived"
                    })
                  );
                  return;
                }
                console.log("my joined plan posts", planposts);
                response.myPlansJoined = planposts;
                console.log(
                  "data to be sent to front end by getmyposts",
                  response
                );
                //posts -----is an onject{myJourneys:[], myPlans:[], myPlansJoined:[]}
                res.send(JSON.stringify({ success: true, posts: response }));
              });
          });
      });
  });
});
//fetch plan detail----------------------------------------------------------
app.post("/plandetail", upload.none(), (req, res) => {
  console.log("fetch plan detail", req.body);
  let planId = req.body.planId;
  dbo.collection("plans").findOne({ planId: planId }, (err, plandata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "plan collection could not be retrieved"
        })
      );
      return;
    }
    if (plandata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid planId" }));
      return;
    }
    console.log("plan sent to front end", plandata);
    res.send(JSON.stringify({ success: true, plan: plandata }));
  });
});
//fetch journey detail---------------------------------------------------------
app.post("/journeydetail", upload.none(), (req, res) => {
  console.log("fetch journey detail", req.body);
  let journeyId = req.body.journeyId;
  dbo
    .collection("journeys")
    .findOne({ journeyId: journeyId }, (err, journeydata) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({
            success: false,
            msg: "journey collection could not be retrieved"
          })
        );
        return;
      }
      if (journeydata === null) {
        res.send(JSON.stringify({ success: false, msg: "invalid journeyId" }));
        return;
      }
      console.log("journey sent to front end", journeydata);
      res.send(JSON.stringify({ success: true, journey: journeydata }));
    });
});
//favorite a post-----------------------------------------------------------------
app.post("/favoritepost", upload.none(), (req, res) => {
  console.log("favorite a post", req.body);
  let username = sessions[req.cookies.sid];
  console.log("type", req.body.type);
  if (req.body.type === "journey") {
    let journeyId = req.body.ID;
    dbo.collection("users").findOne({ username: username }, (err, userdata) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({
            success: false,
            msg: "users info could not be retrieved"
          })
        );
        return;
      }
      if (userdata === null) {
        res.send(JSON.stringify({ success: false, msg: "invalid username" }));
        return;
      }
      if (userdata.myJourneysFav.indexOf(journeyId) !== -1) {
        res.send(
          JSON.stringify({ success: false, msg: "you already liked the posts" })
        );
        return;
      }
      dbo
        .collection("users")
        .updateOne(
          { username: username },
          { $push: { myJourneysFav: journeyId } },
          err => {
            if (err) {
              res.send(
                JSON.stringify({
                  success: false,
                  msg: "update users collection failed"
                })
              );
              console.log(err);
              return;
            }
            console.log("update myJourneysFav in  users collection");
            res.send(JSON.stringify({ success: true }));
            return;
          }
        );
    });
  }
  if (req.body.type === "plan") {
    let planId = req.body.ID;
    dbo.collection("users").findOne({ username: username }, (err, userdata) => {
      console.log("userdata", userdata);
      if (userdata.myPlansFav.indexOf(planId) !== -1) {
        res.send(
          JSON.stringify({ success: false, msg: "you already liked the posts" })
        );
        return;
      }
      dbo
        .collection("users")
        .updateOne(
          { username: username },
          { $push: { myPlansFav: planId } },
          err => {
            if (err) {
              res.send(
                JSON.stringify({
                  success: false,
                  msg: "update users collection failed"
                })
              );
              console.log(err);
              return;
            }
            console.log("update myJourneysFav in  users collection");
            res.send(JSON.stringify({ success: true }));
            return;
          }
        );
    });
  }
});
//unfavorite a post
app.post("/unfavoritepost", upload.none(), (req, res) => {
  console.log("unfavorite a post", req.body);
  let username = sessions[req.cookies.sid];
  console.log("type", req.body.type);
  if (req.body.type === "journey") {
    let journeyId = req.body.ID;
    dbo.collection("users").findOne({ username: username }, (err, userdata) => {
      if (err) {
        console.log(err);
        res.send(
          JSON.stringify({
            success: false,
            msg: "users info could not be retrieved"
          })
        );
        return;
      }
      if (userdata === null) {
        res.send(JSON.stringify({ success: false, msg: "invalid username" }));
        return;
      }
      if (userdata.myJourneysFav.indexOf(journeyId) == -1) {
        res.send(
          JSON.stringify({
            success: false,
            msg: "you already unliked the posts"
          })
        );
        return;
      }
      dbo
        .collection("users")
        .updateOne(
          { username: username },
          { $pull: { myJourneysFav: journeyId } },
          err => {
            if (err) {
              res.send(
                JSON.stringify({
                  success: false,
                  msg: "update users collection failed"
                })
              );
              console.log(err);
              return;
            }
            console.log("update myJourneysFav in  users collection");
            res.send(JSON.stringify({ success: true }));
            return;
          }
        );
    });
  }
  if (req.body.type === "plan") {
    let planId = req.body.ID;
    dbo.collection("users").findOne({ username: username }, (err, userdata) => {
      console.log("userdata", userdata);
      if (userdata.myPlansFav.indexOf(planId) == -1) {
        res.send(
          JSON.stringify({
            success: false,
            msg: "you already unliked the posts"
          })
        );
        return;
      }
      dbo
        .collection("users")
        .updateOne(
          { username: username },
          { $pull: { myPlansFav: planId } },
          err => {
            if (err) {
              res.send(
                JSON.stringify({
                  success: false,
                  msg: "update users collection failed"
                })
              );
              console.log(err);
              return;
            }
            console.log("update myJourneysFav in  users collection");
            res.send(JSON.stringify({ success: true }));
            return;
          }
        );
    });
  }
});
//join a plan-----------------------------------------------------------------------------
app.post("/joinplan", upload.none(), (req, res) => {
  console.log("/joinplan", req.body);
  let username = sessions[req.cookies.sid];
  let planId = req.body.planId;
  let contact = req.body.contact;
  let detail = req.body.detail;
  //push participant into plans collections participants
  let participant = { name: username, contact: contact, detail: detail };
  dbo.collection("users").findOne({ username: username }, (err, userdata) => {
    if (err) {
      console.log(err);
      res.send(
        JSON.stringify({
          success: false,
          msg: "users info could not be retrieved"
        })
      );
      return;
    }
    if (userdata === null) {
      res.send(JSON.stringify({ success: false, msg: "invalid username" }));
      return;
    }
    if (userdata.myPlansJoined.indexOf(planId) !== -1) {
      res.send(
        JSON.stringify({ success: false, msg: "you already joined the plan" })
      );
      return;
    }
    dbo
      .collection("users")
      .updateOne(
        { username: username },
        { $push: { myPlansJoined: planId } },
        err => {
          if (err) {
            res.send(
              JSON.stringify({
                success: false,
                msg: "update users collection failed"
              })
            );
            console.log(err);
            return;
          }
          console.log("update myPlansJoined in  users collection");
          dbo
            .collection("plans")
            .updateOne(
              { planId: planId },
              { $push: { participants: participant } },
              err => {
                if (err) {
                  res.send(
                    JSON.stringify({
                      success: false,
                      msg: "update plans collection failed"
                    })
                  );
                  console.log(err);
                  return;
                }
                console.log("update participants in  plans collection");
                res.send(JSON.stringify({ success: true }));
                return;
              }
            );
        }
      );
  });
});
// Your endpoints go before this line

app.all("/*", (req, res, next) => {
  // needed for react router
  res.sendFile(__dirname + "/build/index.html");
});

app.listen(4000, "0.0.0.0", () => {
  console.log("Server running on port 4000");
});
