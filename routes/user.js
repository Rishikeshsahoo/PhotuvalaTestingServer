const mongoose = require("mongoose");
const router = require("express").Router();
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { listIndexes } = require("../models/user");
require("dotenv").config();

router.post("/register", (req, res) => {
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  const user = new User({
    username: req.body.username,
    hash: hashed_password,
  });

  user
    .save()
    .then((user) => {
      res.send({
        success: true,
        message: "user successfully created",
        user: user,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.send({
          success: false,
          message: "Username already in use",
          error: err,
        });
      } else {
        res.send({
          success: false,
          message: "Something wrong happened",
          error: err,
        });
      }
    });
});

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
   
    res.json({
      username: req.user.username,
      id: req.user.id,
    });
  }
);

router.get(
  "/getprotectedimages",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

router.get(
  "/getfolderimages",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const data = await User.findOne({ username: req.user.username });
    const folders = data.shortlisted;

    
    
    if (folders) res.send({ success: true,folder:folders });
    else res.send({ success: false,message:"something wrong happened" });
  }
);

router.get("/deletefolder/:id",passport.authenticate("jwt",{session:false}),(req,res)=>{
  User.findOne({username:req.user.username})
  .then((user)=>{
    console.log(user.folders.length)

    user.folders=user.folders.filter((it)=>{return req.params.id.toString()!=it._id.toString()})
    console.log(user.folders.length)
    user.save().then(()=>{res.send({success:"true"})}).catch(()=>{res.send("NOOOoo")})
  })
  .catch(()=>{res.send("Nooooo")})
})

router.post("/addimagestofolder",passport.authenticate("jwt",{session:false}),(req,res)=>{
  User.findOne({username:req.user.username})
  .then((user)=>{
    let is=false;
    user.shortlisted.forEach((it)=>{if(it.id===req.body.folder[0]._id)is=true;});
    if(is)req.body.folder=[];
    const data=[...user.shortlisted, ...req.body.folder]
    
    user.shortlisted=[...new Set(data)]
    user.save()
    .then(()=>{res.send({success:true})})
    .catch(()=>{res.send({success:false})})
    
  })
  .catch((err)=>{
    res.send({success:false,message:err})
  })
})


router.post("/removeedited",passport.authenticate("jwt",{session:false}),(req,res)=>{
  User.findOne({username:req.user.username})
  .then((user)=>{
    let is=false;
    const data=user.edited.filter((it)=>{ return (it.id!==req.body.folder[0]._id)});
    user.edited=[...new Set(data)]
    user.save()
    .then(()=>{res.send({success:true})})
    .catch(()=>{res.send({success:false})})
    
  })
  .catch((err)=>{
    res.send({success:false,message:err})
  })
})


router.post("/removeimage",passport.authenticate("jwt",{session:false}),(req,res)=>{
  User.findOne({username:req.user.username})
  .then((user)=>{
    console.log(user.shortlisted.length)
    const data=user.shortlisted.filter((item)=>item._id!=req.body.image._id)
    console.log(data.length)
    user.shortlisted=data;
    user.save()
    .then(()=>{res.send({success:true})})
    .catch(()=>{res.send({success:false})})
    
  })
  .catch((err)=>{
    res.send({success:false,message:err})
  })
})

router.post(
  "/addfolder",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ username: req.user.username }).then((user) => {
      const folder = { name: req.body.folderName, images: [] };
      user.folders = [...user.folders, folder];
      user
        .save()
        .then(() => {
          res.json({ success: true, folders: user.folders });
        })
        .catch((err) => {
          res.json({ success: false, error: err });
        });
    });
  }
);



router.post("/addimages", (req, res) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      user.files = [...user.files, ...req.body.files];
      user
        .save()
        .then((user) => {
          res.json({ success: true, username: user.username });
        })
        .catch((err) => {
          res.json({ success: false, message: err });
        });
    })
    .catch((err) => {
      //console.log("err");
    });
});



router.post("/login", (req, res) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        //console.log("came in login1");

        return res.status(401).send({
          success: false,
          message: "could not find the user",
        });
      }
      if (!bcrypt.compareSync(req.body.password, user.hash)) {
        //console.log("came in login69");

        return res.status(401).send({
          success: false,
          message: "Incorrect password",
        });
      }
      if(user.activeStatus!=1)
      {
        return res.status(401).send({
          success: false,
          message: "The User is currently Deactivated",
        });
      }

      const payload = {
        username: user.username,
        id: user._id,
      };

      const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "10d",
      });
      
      user.lastLogin=Date.now().toString();
      user.save()
      .then((user)=>{console.log(`${user.username} logged in successfully`)})
      .catch((err)=>{console.log(err.message)})
      return res.json({
        success: true,
        message: "logged in successfully",
        token: `Bearer ${token}`,
      });
    })
    .catch((err) => {
      res.send({ error: err });
    });
});

module.exports = router;
