var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
	done(null, user);
    });

    passport.deserializeUser(function(user, done) {
	done(null, user);
    });

    passport.use(new FacebookStrategy({
        clientID        : process.env.FB_CLIENT_ID,
        clientSecret    : process.env.FB_CLIENT_SECRET,
        callbackURL     : process.env.FB_CALLBACK_URL
    }, function (token, refreshToken, profile, done) {
	return done(null, profile);
    }));

}
