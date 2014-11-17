/**
 * Created by hch on 2014/11/3.
 */
var express = require('express');
var router = express.Router();
var dao = require('../utils/tag_dao.js');

/* get all tags */
router.get('/', function (req, res) {
    dao.getTags(function (err, rows) {
        if (err || rows == null) {
            res.render('error');
        } else {
            res.render('tag', {
                title: 'tags',
                tags: rows
            });
        }
    });
});

router.post('/new', function (req, res) {
    var name = req.param('tag');
    if (name.trim() == '') {
        res.end();
    }
    console.log('adding tag: ' + name);
    dao.addTag(name, function (err, result) {
        res.redirect('/tag');
    });
});

router.get('/:name/del', function (req, res) {
    var name = req.param('name');
    console.log(name);
    dao.delTag(name, function (err, result) {
        res.redirect('/tag');
    });
});

module.exports = router;