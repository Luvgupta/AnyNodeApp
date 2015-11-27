var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var model = require("../models/model_user");
var log = require("../utilities/logger.js").log;
var cache = require("../utilities/redis.js");
var config = require('../../config');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        model.userModel.findById(id, function (err, user) {
            done(err, user);
        });
    });

    var opts = {}
    opts.secretOrKey = config.secret;
    opts.passReqToCallback = true;
    passport.use(new JwtStrategy(opts, function (req, payload, done) {
        cache.get(req.get("Authorization").split("JWT ")[1], function (_d) {
            if (_d) {
                model.userModel.findOne({
                    username: payload.username,
                    org: payload.org.toLowerCase()
                }, function (err, _u) {
                    if (err) {
                        return done(err);
                    }

                    if (!_u)
                        return done(null, false, 'No user found.');

                    if (!_u.validatePassword(payload.password))
                        return done(null, false, 'Oops! Wrong password.');

                    return done(null, _u);
                });
            } else {
                return done(null, false);
            }
        });

    }));

}