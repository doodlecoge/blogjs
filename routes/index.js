var express = require('express');
var router = express.Router();
var db = require('../utils/db.js');

/* GET home page. */
router.get('/', function (req, res) {
    var page = 0;
    var size = 2;
    db.getAllArticles(page, size, function (count, rows) {
        res.render('index', {
            title: 'Index',
            articles: rows,
            count: count,
            page: page,
            size: size
        });
    });
});

module.exports = router;
