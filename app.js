var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MemStore = session.MemoryStore;


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'huaichao',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 10 * 1000}
}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.req = req;
    next();
});

var routes = require('./routes/index');
var users = require('./routes/users');
var article = require('./routes/article');
var tag = require('./routes/tag');
var logo = require('./routes/logo');
var test = require('./routes/test');

app.use(function (req, res, next) {
    return next();
    if (req.session['user']) return next();

    delete req.session.error;
    var path = req.path;

    var nologin_ptns = [
        /^\/$/,                     // index
        /^\/login$/,                // login
        /^\/logout$/,               // logout
        /^\/article$/,              // article list
        /^\/article\/p\/[0-9]+$/,   // article paging
        /^\/article\/[0-9]+$/,      // article display page
    ];

    for (var i = 0; i < nologin_ptns.length; i++) {
        if (path.match(nologin_ptns[i])) {
            next();
            return;
        }
    }

    req.session.error = 'Session expired or you are not signed in';
    req.session.original_url = path;
    res.redirect('/login');
});

app.use('/test', test);
app.use('/', routes);
app.use('/article', article);
app.use('/users', users);
app.use('/tag', tag);
app.use('/logo', logo);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.log("=========here get an error==========");
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log("=========here got an error==========");
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
