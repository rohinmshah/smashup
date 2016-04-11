module.exports = function(app, passport) {
    function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
            return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
    }

    app.get('/', function(request, response) {
	response.render('pages/index');
    });

    app.get('/game', isLoggedIn, function(request, response) {
	response.render('pages/game');
    });

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook'));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/game',
            failureRedirect : '/'
        }));
};
