var express = require('express');
var router = express.Router();
var dao = require('../utils/article_dao.js');
var user_dao = require('../utils/user_dao.js');

/* GET home page. */
router.get('/', function (req, res) {
    var page = 0;
    var size = 2;
    dao.getArticles(0, 10, function (err, rows, count) {
        if (err) {
            res.render('error');
        } else {
            res.render('index', {
                articles: rows,
                page: page,
                size: size,
                count: count
            });
        }
    });
});

router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function (req, res) {
    var username = req.param('username');
    var password = req.param('password');
    user_dao.getUser(username, function (err, user) {
        if (user != null && user.password == password) {
            req.session['user'] = user;
            res.redirect('/');
        } else {
            res.render('login', {
                error: 'username or password incorrect'
            });
        }
    });
});

router.get('/logout', function (req, res) {
    delete req.session['user'];
    res.render('login');
});

module.exports = router;
