/**
 * Created by hch on 2014/11/3.
 */
var express = require('express');
var router = express.Router();
var marked = require('../public/javascripts/marked');
var article_dao = require('../utils/article_dao.js');
var tagDao = require('../utils/tag_dao.js');
var userDao = require('../utils/user_dao.js');
var async = require('async');

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

router.get('/', function (req, res) {
    article_dao.getArticles(0, 10, function (err, rows, count) {
        if (err) {
            res.render('error');
        } else {
            var obj = {};
            var results = rows[1];
            var len = results.length;
            for (var i = 0; i < len; i++) {
                var id = results[i]['id'];
                if (!obj[id]) obj[id] = {tags: []};
                obj[id]['title'] = results[i]['title'];
                obj[id]['abs'] = results[i]['content'].substr(0, 200);
                if (results[i]['tag']) {
                    obj[id]['tags'].push(results[i]['tag']);
                }
            }
            res.render('article', {
                articles: obj,
                page: 1,
                size: 10,
                count: count
            });
        }
    });
});

router.get('/p/:idx', function (req, res) {
    var page = req.param('idx');

    try {
        page = parseInt(page);
    } catch (e) {
        page = 1;
    }

    article_dao.getArticles(page, 10, function (err, rows, count) {
        if (err) {
            res.render('error');
        } else {
            res.render('article', {
                articles: rows,
                page: page,
                size: 10,
                count: count
            });
        }
    });
});

router.get('/new', function (req, res) {
    tagDao.getTags(function (err, rows) {
        var len = rows.length;
        var data = [];
        for (var i = 0; i < len; i++) {
            data.push(JSON.stringify({
                id: rows[i]['id'],
                label: rows[i]['name']
            }));
        }
        res.render('article_new', {
            tags: '[' + data.join(',') + ']'
        });
    });
});

/* GET /article?id= */
router.get('/:id', function (req, res) {
    var id = req.param('id');
    article_dao.getArticleById(id, function (err, article) {
        if (err) {
            res.render('error');
        } else {
            res.render('article_show', {
                title: article.title,
                content: mk(article.content),
                tags: article.tags,
                user: article.user.fullname,
                created_at: article.created_at,
                updated_at: article.updated_at
            });
        }
    });
});


/* save article */
router.post('/:id/save', function (req, res) {
    var id = req.param('id');
    var title = req.param('title');
    var content = req.param('content');
    var tags = req.param('tags');

    article_dao.saveArticle(parseInt(id), title, content, 'huaichao',
        eval('([' + tags + '])'), function () {
            res.send('hello');
        });
});

router.get('/:id/edit', function (req, res) {
    var id = req.param('id');
    var username = null;

    async.series({
        tags: function (cb) {
            tagDao.getTags(cb);
        },
        article: function (cb) {
            article_dao.getArticleById(id, function (err, rows) {
                cb(err, rows);
            });
        }
    }, function (err, results) {
        var article = results['article'];
        var tags = results['tags'];
        var arr = [];
        tags.forEach(function (tag) {
            arr.push(JSON.stringify({
                id: tag['id'],
                label: tag['name']
            }));
        });
        res.render('article_new', {
            tags: '[' + arr.join(',') + ']',
            article: article
        });
    });


});

module.exports = router;