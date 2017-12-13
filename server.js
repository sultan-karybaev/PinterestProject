var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var fs  = require("fs");
var multer = require("multer");
var sizeOf = require("image-size");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);

var upload = multer({dest: "public/images/markImages"});

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/pinterest");

var app = express();

//var Pin = require("./server/models/Pin");
var User = require("./server/models/User");
var Mark = require("./server/models/Mark");
var Image = require("./server/models/Image");
var Collection = require("./server/models/Collection");
var Save = require("./server/models/Save");
var Comment = require("./server/models/Comment");

app.set("port", process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your secret here',
    resave:  true,
    saveUninitialized: true,
    key: 'jsessionid',
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' },
    function( email, password, done) {
        User.findOne({ email: email }).exec(function(err, user) {
            if (err) return done(err);
            if (!user) return done(null, false);
            user.comparePassword(password, function(err, isMatch) {
                if (err) return done(err);
                if (isMatch) return done(null, user);
                return done(null, false);
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id).exec(function(err, user) {
        done(err, user);
    });
});

app.post('/api/post/login', passport.authenticate('local'), function(req, res, next) {
    res.cookie("sessionPinterestUserID", req.sessionID);
    //res.sendStatus(200);
    res.send(req.user);
});

app.post('/api/post/logout', function(req, res, next) {
    req.logout();
    res.clearCookie("sessionPinterestUserID");
    res.sendStatus(200);
});

app.post("/api/post/signup", function (req, res, next) {
    var user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        sex: req.body.sex,
        age: req.body.age,
        avatar: "/images/logo-default.jpg",
        admin: false,
        email:req.body.email,
        password: req.body.password
    });

    user.save(function (err, savedUser) {
        console.log(err);
        if (err) return res.sendStatus(400).end();
        res.cookie("sessionPinterestUserID", req.sessionID);
        res.send(savedUser);
    });
});

app.get("/api/get/ProfileOrUser/:id", function (req, res, next) {
    if (req.params.id === req.session.passport.user) {
        res.send(true);
    } else {
        res.send(false);
    }
});

//------------------------------------------------
//ctrl.home
app.get("/api/get/pins", function (req, res, next) {
    Image.find().populate("mark")
        .exec(function (err, images) {
            if(err) return res.status(400).end();
            res.send(images);
        });
});

app.get("/api/get/collectionImages4/:collectionId", function (req, res, next) {
    Save.find({coll: req.params.collectionId}).limit(4)
        .exec(function (err, saves) {
            if(err) return res.status(400).end();
            res.send(saves);
        });
});

app.post("/api/post/save", function (req, res, next) {
    var varSave = new Save({
        coll: req.body.coll,
        image: req.body.pin,
        imageWay: req.body.imageWay
    });
    varSave.save(function (err) {
        if(err) return res.status(400).end();
        Collection.findById(req.body.coll)
            .exec(function (err, coll) {
                coll.imagecount++;
                coll.save(function (err) {
                    if(err) return res.status(400).end();
                    res.sendStatus(200);
                })
            });
    });
});
//---------------
//ctrl.adminpanel
app.post("/api/post/mark", upload.array("downloadImages", 10), function (req, res, next) {
    var mark = new Mark({
        title: req.body.title,
        text: req.body.text,
        images: req.body.images,
        imagegridstyle: req.body.imagegridstyle,
        admin: req.session.passport.user
    });

    mark.save(function (err, savedMark) {
        if (err) return res.sendStatus(400).end();

        var index = 0;
        req.files.forEach(function (t) {
            index++;
            var image = new Image({
                mark: savedMark._id,
                index: index
            });
            var tempPATH = t.path;
            console.log("tempPATH");
            console.log(tempPATH);
            var targetPATH = path.resolve("public/images/markImages/" + savedMark._id + "-" + index + "."
                + t.originalname.split(".").slice(-1).pop());
            image.image = "/images/markImages/" +  savedMark._id + "-" + index + "." + t.originalname.split(".").slice(-1).pop();
            sizeOf(tempPATH, function (err, dimensions) {
                if (err) return console.log(err);
                image.width = dimensions.width;
                image.height = dimensions.height;
                image.save(function (err) {
                    if (err) return res.sendStatus(400).end();
                });
                fs.rename(tempPATH, targetPATH, function (err) {
                    if (err) return res.sendStatus(400).end();
                });
            });

        });
        res.sendStatus(200);
    });
});

app.get("/api/get/allMarks", function (req, res, next) {
    Mark.find({})
        .exec(function (err, marks) {
            if (err) return res.sendStatus(400).end();
            res.send(marks);
        });
});

app.get("/api/get/markImage/:markId", function (req, res, next) {
    Image.findOne({mark: req.params.markId})
        .exec(function (err, image) {
            if (err) return res.sendStatus(400).end();
            res.send(image.image);
        });
});

app.delete("/api/delete/mark/:markId", function (req, res, next) {
    Mark.deleteOne({_id: req.params.markId})
        .exec(function (err) {
            if (err) return res.sendStatus(400).end();
            Image.deleteMany({mark: req.params.markId})
                .exec(function (err) {
                    if (err) return res.sendStatus(400).end();
                    res.sendStatus(200);
                });
        });
});

app.get("/api/get/editMarkImages/:markId", function (req, res, next) {
    Image.find({mark: req.params.markId})
        .exec(function (err, images) {
            if (err) return res.sendStatus(400).end();
            res.send(images);
        });
});

app.delete("/api/delete/markImage/:imageId", function (req, res, next) {
    Image.findById(req.params.imageId)
        .exec(function (err, image) {
            if (err) return res.sendStatus(400).end();
            var mark = image.mark;
            var n = image.index;
            fs.unlink("public" + image.image, function (err) {
                if (err) return res.sendStatus(400).end();
                console.log("IMAGE", image.image);
                Image.deleteOne({_id: req.params.imageId})
                    .exec(function (err) {
                        if (err) return res.sendStatus(400).end();
                        res.sendStatus(200);
                        Image.find({mark: mark})
                            .exec(function (err, images) {
                                if (err) return console.log(err);
                                //todo async forEach
                                for (var i = n; i < images.length; i++) {
                                    var Fpath = images[i].image;
                                    var Spath = images[i].image;
                                    console.log("OLDIMAGE", i, Fpath,
                                        Spath);
                                    fs.rename("public" + images[i].image,
                                        "public/images/markImages/" +  mark + "-" + i + "." + images[i].image.split(".").slice(-1).pop(),
                                        function (err) {
                                            if (err) return console.log(err);

                                        });
                                }
                                // images.forEach(function (t, ind) {
                                //     var index = ind + 1;
                                //     fs.rename("public" + t.image,
                                //         "public/images/markImages/" +  mark + "-" + index + "." + t.image.split(".").slice(-1).pop(),
                                //         function (err) {
                                //         if (err) return console.log(err);
                                //         console.log("OLDIMAGE", index, "public" + t.image,
                                //             "/images/markImages/" +  mark + "-" + index + "." + t.image.split(".").slice(-1).pop());
                                //     });
                                //     t.index = index;
                                //     var oldImage = "public" + t.image;
                                //     t.image = "/images/markImages/" +  mark + "-" + index + "." + oldImage.split(".").slice(-1).pop();
                                //
                                //     t.save(function (err) {
                                //         if (err) return console.log(err);
                                //     });
                                // });
                            });
                    });
            });
        });
});

app.put("/api/put/mark/:markId", upload.array("downloadImages", 10), function (req, res, next) {
    Mark.findById(req.params.markId)
        .exec(function (err, mark) {
            if (err) return res.sendStatus(400).end();
            mark.title = req.body.title;
            mark.text = req.body.text;
            mark.images = req.body.images;
            mark.imagegridstyle = req.body.imagegridstyle;
            mark.save(function (err, savedMark) {
                if (err) return res.sendStatus(400).end();
                res.sendStatus(200);
            });
        });

    //todo
    var i = 0;
    var index;
    if (req.files.length > 0) {
        req.files.forEach(function (t, ind) {
            index = ind + 1;
            Image.find({mark: req.params.markId})
                .exec(function (err, images) {
                    if (err) return console.log("ERROR", err);
                    images.forEach(function (d, dindex) {

                    })
                });
        })
    }
});
//---------------
//ctrl.mark
app.get("/api/get/mark/:markId", function (req, res, next) {
    Mark.findById(req.params.markId)
        .exec(function (err, mark) {
            if (err) return res.sendStatus(400).end();
            res.send(mark);
        });
});

app.get("/api/get/markImages/:markId", function (req, res, next) {
    Image.find({mark: req.params.markId})
        .exec(function (err, images) {
            if (err) return res.sendStatus(400).end();
            res.send(images);
        });
});

app.get("/api/get/markComments/:markId", function (req, res, next) {
    Comment.find({mark: req.params.markId}).populate("user")
        .exec(function (err, comments) {
            if (err) return res.sendStatus(400).end();
            res.send(comments);
        });
});

app.post("/api/post/markComment", function (req, res, next) {
    var comment = new Comment({
        user: req.session.passport.user,
        mark: req.body.mark,
        text: req.body.text
    });
    comment.save(function (err, savedComment) {
        if (err) return res.sendStatus(400).end();
        Comment.findById(savedComment._id).populate("user")
            .exec(function (err, comment) {
                if (err) return res.sendStatus(400).end();
                res.send(comment);
            });
    });
});
//---------------
//ctrl.profile
app.get("/api/get/profile", function (req, res, next) {
    User.findById(req.session.passport.user)
        .exec(function (err, user) {
            if (err) return res.sendStatus(400).end();
            res.send(user);
        });
});

app.get("/api/get/usercollections", function (req, res, next) {
    Collection.find({user: req.session.passport.user})
        .exec(function (err, collections) {
            if (err) return res.sendStatus(400).end();
            res.send(collections);
        });
});

app.post("/api/post/collection", function (req, res, next) {
    var coll = new Collection({
        imagecount: 0,
        title: req.body.collectionName,
        user: req.session.passport.user
    });

    coll.save(function (err, savedCollection) {
        if (err) return res.sendStatus(400).end();
        res.send(savedCollection);
    });
});

app.delete("/api/delete/collection/:collectionId", function (req, res, next) {
    Collection.deleteOne({_id: req.params.collectionId})
        .exec(function (err) {
            if (err) return res.sendStatus(400).end();
            Save.deleteMany({coll: req.params.collectionId})
                .exec(function (err) {
                    if (err) return res.sendStatus(400).end();
                    res.sendStatus(200);
                });
        });
});

app.put("/api/put/collection/:collectionId", function (req, res, next) {
    Collection.findById(req.params.collectionId)
        .exec(function (err, collection) {
            if (err) return res.sendStatus(400).end();
            collection.title = req.body.collectionName;
            collection.save(function (err, savedCollection) {
                if (err) return res.sendStatus(400).end();
                res.sendStatus(200);
            })
        });
});
//---------------
//ctrl.user
app.get("/api/get/user/:userId", function (req, res, next) {
    User.findById(req.params.userId)
        .exec(function (err, user) {
            if (err) return res.sendStatus(400).end();
            res.send(user);
        });
});

app.get("/api/get/usercollectionsID/:userId", function (req, res, next) {
    Collection.find({user: req.params.userId})
        .exec(function (err, collections) {
            if (err) return res.sendStatus(400).end();
            res.send(collections);
        });
});
//---------------
//ctrl.collection
app.get("/api/get/collection/:collectionId", function (req, res, next) {
    Collection.findById(req.params.collectionId).populate("user")
        .exec(function (err, coll) {
            if (err) return res.sendStatus(400).end();
            res.send(coll);
        });
});

app.get("/api/get/collectionPins/:collectionId", function (req, res, next) {
    Save.find({coll: req.params.collectionId})
        .exec(function (err, saves) {
            if (err) return res.sendStatus(400).end();
            res.send(saves);
        });
});

app.get("/api/get/collectionPin/:imageId", function (req, res, next) {
    Image.findById(req.params.imageId).populate("mark")
        .exec(function (err, image) {
            if (err) return res.sendStatus(400).end();
            res.send(image);
        });
});

app.delete("/api/delete/save/:collectionId/:imageId", function (req, res, next) {
    Save.deleteOne({coll: req.params.collectionId, image: req.params.imageId})
        .exec(function (err, image) {
            if (err) return res.sendStatus(400).end();
            Collection.findById(req.params.collectionId)
                .exec(function (err, coll) {
                    coll.imagecount--;
                    coll.save(function (err) {
                        if (err) return res.sendStatus(400).end();
                        res.sendStatus(200);
                    });
                });
        });
});
//---------------

app.get('*', function(req, res, next) {
    if(req.session.passport.user){
        if(req.url === "/authorization"){
            res.redirect('/');
        }
        if (req.url === "/adminpanel") {
            User.findById(req.session.passport.user)
                .exec(function (err, user) {
                    if(err) return console.log(err);
                    if (!user.admin) {
                        res.redirect('/');
                    } else {
                        res.redirect('/#' + req.originalUrl);
                    }
                });
        } else {
            res.redirect('/#' + req.originalUrl);
        }
    } else {
        res.redirect('/#/authorization');
    }

});

var server = app.listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
});

array = [1, 2, 3, 4, 5];
timeout = (index)=> {
    return new Promise((resolve, reject)=>{
        let time = 1000*(Math.floor(Math.random() * (3 - 0)) + 0);
    setTimeout(() => {
        resolve(index);
}, time);
});
    // return index;
}

start = async () => {
    for(let num of array) {
        let result = await timeout(num);
        console.log(result);
    }
}

start().then(()=>{
    console.log('hello');
});