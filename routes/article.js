/**
 * Created by hch on 2014/11/3.
 */
var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var marked = require('../public/javascripts/marked');
var dao = require('../utils/article_dao.js');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

function mk(markedText) {
    return marked(markedText);
}

router.get('/new', function (req, res) {
    res.render('article_new');
});

/* GET /article?id= */
router.get('/:id', function (req, res) {
    var id = req.param('id');
    dao.getArticleById(id, function (err, rows) {
        if (err || rows == null || rows.length != 1) {
            res.render('error');
        } else {
            res.render('article', {
                title: rows[0].title,
                content: mk(rows[0].content)
            });
        }
    });
});



/* add new article */
router.post('/', function (req, res) {
    var title = req.param('title');
    var content = req.param('content');
    var tags = req.param('tags');

});

module.exports = router;