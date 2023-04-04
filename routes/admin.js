const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const router = require("express").Router();
const validateToken = require("../utils/utils").validateToken;
const Admin = require("../models/admin");
const User = require('../models/user')
const {generateUploadURL}=require("../confg/s3")

router.post("/registeruser", validateToken, (req, res) => {
  
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  const user = new User({
    username: req.body.username,
    hash: hashed_password,
    activeStatus:1
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
          error: err.message,
        });
      } else {
        res.send({
          success: false,
          message: "Something wrong happened",
          error: err.message,
        });
      }
    });
});

router.post("/changepassword",(req,res)=>{
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  User.findOne({username: req.body.username})
  .then((user)=>{
    user.hash=hashed_password;
    user.save()
    .then((user) => {
      res.send({
        success: true,
        message: "Admin successfully created",
        user: user,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.send({
          success: false,
          message: "Username already in use",
          error: err.message,
        });
      } else {
        res.send({
          success: false,
          message: "Something wrong happened",
          error: err.message,
        });
      }
    });
  })
  .catch((err)=>{
    res.send(err.message)
  })

})

router.post("/deleteuser",validateToken,(req,res)=>{
  console.log("came")
  User.deleteOne({username:req.body.username})
  .then((res)=>{res.send({res:res,success:true})})
  .catch((err)=>{res.send({err:err,success:false})})
})

router.post("/register", (req, res) => {
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  const admin = new Admin({
    username: req.body.username,
    hash: hashed_password,
  });

  admin
    .save()
    .then((admin) => {
      res.send({
        success: true,
        message: "Admin successfully created",
        user: admin,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.send({
          success: false,
          message: "Username already in use",
          error: err.message,
        });
      } else {
        res.send({
          success: false,
          message: "Something wrong happened",
          error: err.message,
        });
      }
    });
});

router.post("/login", (req, res) => {
  
  Admin.findOne({ username: req.body.username })
  .then((admin) => {
    if (!admin) {

      return res.status(401).send({
        success: false,
        message: "could not find the admin",
      });
    }
    if (!bcrypt.compareSync(req.body.password, admin.hash)) {

      return res.status(401).send({
        success: false,
        message: "Incorrect password",
      });
    }

    const payload = {
      username: admin.username,
      id: admin.id,
    };

    const token = jwt.sign(payload, process.env.ADMIN_SECRET_KEY, {
      expiresIn: "10d",
    });

    return res.json({
      success: true,
      message: "logged in successfully",
      token: `Bearer ${token}`,
    });
  });
});

router.get('/protected',validateToken,(req,res)=>{
  res.json({
    success:true,
    username:req.admin.username,
    id:req.admin.id
  });
})

router.get('/protected',validateToken,(req,res)=>{
  res.json({
    success:true,
    username:req.admin.username,
    id:req.admin.id
  });
})

router.post(
  "/getprotectedimages",
  validateToken,
  (req, res) => {
    console.log(req.body.username)
    User.findOne({username:req.body.username})
    .then((user)=>{
      res.send({
        username:user.username,
        id:user._id,
        files:user.files
      })
    })
    .catch(()=>{
      res.status(403).send({success:false})
    })
  }
);


router.get('/admindashboard',validateToken,(req,res)=>{
  User.find({})
  .then((data)=>{res.json({
    success:true,
    users:data
  })})
  .catch((err)=>{console.log(err)})
})

router.post(
  "/deleteimage",
  validateToken,
  (req, res) => {
    console.log("came")
    User.findOne({ username: req.body.username })
      .then((user) => {
        user.files = user.files.filter((item) => {
          return item._id != req.body.idr;
        });
        user.shortlisted=user.shortlisted.filter((item)=>{
          return item._id!=req.body.idr
        })
        user
          .save()
          .then(() => {
            res.send({ success: true, images: user.files });
          })
          .catch(() => {
            res.send({ success: false, message: "No" });
          });
      })
      .catch(() => {
        res.send({ success: false, message: "Something wrong happened2" });
      });
  }
);

router.post(
  "/deleteshortlisted",
  validateToken,
  (req, res) => {
    User.findOne({ username: req.body.username })
      .then((user) => {
        
        user.shortlisted=user.shortlisted.filter((item)=>{
          return item._id!=req.body.idr
        })
        user
          .save()
          .then(() => {
            res.send({ success: true, images: user.files });
          })
          .catch(() => {
            res.send({ success: false, message: "No" });
          });
      })
      .catch(() => {
        res.send({ success: false, message: "Something wrong happened2" });
      });
  }
);


router.post("/addimages", (req, res) => {
  console.log("username",req.body.username)
  console.log("files",req.body.files)

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
      // console.log(user)
    })
    .catch((err) => {
      console.log(err);
    });
});


router.post("/addeditedimages", (req, res) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      user.edited = [...user.edited, ...req.body.files];
      user
        .save()
        .then((user) => {
          res.json({ success: true, username: user.username });
        })
        .catch((err) => {
          res.json({ success: false, message: err });
        });
      // console.log(user)
    })
    .catch((err) => {
      console.log(err);
    });
});


router.get(
  "/getfolderimages/:id",
 validateToken,
  async (req, res) => {
    const data = await User.findOne({ username: req.params.id });
    const folders = data.shortlisted;
    
    if (folders) res.send({ success: true,folder:folders });
    else res.send({ success: false,message:"something wrong happened" });
  }
);

router.post("/changeactivestatus",validateToken,(req,res)=>{
  User.findOne({username:req.body.username})
  .then((user)=>{
    user.activeStatus=req.body.activeStatus;
    user.save()
    .then((user)=>{ res.send({ success: true, user: user.username })})
    .catch((err)=>{res.json({ success: false, message: err })})
  })
})

router.get("/getUrl",async (req,res)=>{
  const url=await generateUploadURL();
  res.send(url)
})

module.exports=router