const JwtStratergy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config();

const User = require("../models/user");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
  algorythm: ["RS256"]
};

// console.log(options)

module.exports = (passport) => {
  passport.use(
    new JwtStratergy(options, (jwt_payload, done) => {
      // console.log(jwt_payload.id)
      User.findOne({ _id: jwt_payload.id }, (err,user) => {
        if (err) {
          return done(err, false);
        }
       
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
