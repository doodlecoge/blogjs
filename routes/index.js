var express = require('express');
var router = express.Router();
var dao = require('../utils/article_dao.js');

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

module.exports = router;
