'use strict';

var serveStatic     = require('serve-static')
  , handlebars      = require('express-handlebars')
	, methodOverride  = require('method-override')
  , bodyParser      = require('body-parser')
  , session         = require('express-session')
	, passport        = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

var extend = require('node.extend');

var defaultOptions = {
	routes: {
		prefix:   '',
		home:     '/',
		auth:     '/auth/twitter',
		callback: '/auth/twitter/callback',
		login:    '/login',
		logout:   '/logout',
		failure:  '/failure',
		profile:  '/profile'
	},
	paths: {
		views:  './views',
		public: './public'
	},
	consumerKey:    '',
	consumerSecret: '',
	protocol:       'http',
	hostname:       '127.0.0.1',
	port:           3000,
	enableUI:       true,
	autoLogout:     false,
	title:          'Twitter Auth',
	session: {
		secret: 'keyboard catttt',
		saveUninitialized: false,
		resave: false 
	}
};


function initUI(app, options, ensureAuthenticated) {
	// load routes into views for dynamic URLs
	app.locals.routes = options.routes;
	app.locals.title  = options.title;
	
	app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
	app.set('view engine', 'handlebars');
	app.set('views', options.paths.views);
	app.use(serveStatic(options.paths.public));


	// "home page"
	app.get(options.routes.home, function(req, res) {
		res.render('index', { user: req.user });
	});


	// shows profile data pulled from twitter, only works if using session
	app.get(options.routes.profile, ensureAuthenticated, function(req, res) {
		res.render('profile', { user: req.user, data: JSON.stringify(req.user, null, 4) });
	});

	// simply shows a login button that goes to actual auth url
	app.get(options.routes.login, function(req, res){
		res.render('login', { user: req.user });
	});
}


function TwitterAuth(app, options, callback) {
	options = extend(true, defaultOptions, options);


	// setup oauth
	passport.use(new TwitterStrategy({
			consumerKey:    options.consumerKey,
			consumerSecret: options.consumerSecret,
			callbackURL:    options.protocol + '://' + options.hostname + ':' + options.port + options.routes.callback
		},
		function(token, tokenSecret, profile, done) {
			// asynchronous verification, for effect...
			process.nextTick(function () {
				// in future, this is where user is looked up by linkedin ID and logged in
				callback(token, tokenSecret, profile);
				return done(null, profile);
			});
		}
	));

	// start setting up web server
	app.use(methodOverride());
	app.use(bodyParser.json());
	app.use(session(options.session));

	// called when we first get data from twitter
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
		

	// init passport
	app.use(passport.initialize());
	app.use(passport.session());


	// initiates oauth by redirecting to twitter
	app.get(options.routes.auth,
		passport.authenticate('twitter'),
		function(req, res) {
			// The request will be redirected to Twitter for authentication, so this
			// function will not be called.
	});


	// user gets redirected here from twitter site after completing oauth
	app.get(options.routes.callback, passport.authenticate('twitter', { failureRedirect: options.routes.failure }), function(req, res) {
		
		if (options.autoLogout)
			res.redirect(options.routes.logout);
		else
			res.redirect( options.enableUI ? options.routes.home : '/' );
  });


	app.get(options.routes.failure, function(req, res) {
		if (options.enableUI)	res.render('failure', { user: req.user });
		else res.status(400).send('Twitter OAuth Failed');
	});


	app.get(options.routes.logout, function(req, res) {
		req.logout();
		res.redirect( options.enableUI ? options.routes.home : '/' );
	});


	// if we want to have a web UI for registration/debugging
	if (options.enableUI) {
		initUI(app, options, ensureAuthenticated);
	}


	// helper function
	function route(name) {
		return options.routes.prefix + options.routes[name];	
	}


	// define function that determines whether req is auth
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		else res.redirect( options.enableUI ? options.routes.home : '/' );
	}

	return {
		isAuth: ensureAuthenticated
	};
};

module.exports = TwitterAuth;
