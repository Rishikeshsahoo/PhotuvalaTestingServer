const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
require('dotenv').config()

const issueJWT=(payload)=>{
    const accessToken=jwt.sign(payload,process.env.ADMIN_SECRET_KEY)
    return accessToken;
}
//url?name="val"
//post req - body
//headers
const validateToken=(req,res,next)=>{
    const header=req.headers['authorization'];
    const token= header && header.split(' ')[1];
    if(token==null)
    {
        return res.sendStatus(401);
    }

    jwt.verify(token,process.env.ADMIN_SECRET_KEY,(err,admin)=>{
        if(err)return res.sendStatus(403)
        req.admin=admin;
        next()
    })
}

module.exports.validateToken=validateToken
module.exports.issueJWT=issueJWT


