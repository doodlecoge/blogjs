/**
 * Created by hch on 2014/11/6.
 */
var async = require('async');
var pool = require('./pool');

var dao = {};
module.exports = dao;


dao.getArticles = function (page, size, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);

        var count = null;
        size = Math.max(size, 10);
        var start = Math.max((page - 1) * size, 0);

        async.series([
            function (cb) {
                var sql = 'select count(*) cnt from articles';
                conn.query(sql, function (err, rows) {
                    count = rows[0]['cnt'];
                    if (start >= count)
                        start = Math.floor(count / size) * size;
                    cb(err, rows);
                });
            },
            function (cb) {
                var sql = 'select a.id,a.title,a.content,t.name tag from ' +
                    '(select * from articles limit ?,?) a ' +
                    'left join articles_tags at on a.id=at.aid ' +
                    'left join tags t on at.tid=t.id';
                conn.query(sql, [start, size], function (err, rows) {
                    cb(err, rows);
                });
            }
        ], function (err, rows) {
            conn.release();
            callback(err, rows);
        });
    });
};

dao.getArticleById = function (id, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var username = null;
        async.series({
            article: function (cb) {
                var sql = 'select * from articles where id=?';
                conn.query(sql, [id], function (err, rows) {
                    username = rows[0]['username'];
                    cb(err, rows);
                });
            },
            user: function (cb) {
                var sql = 'select * from users where username=?';
                conn.query(sql, [username], function (err, rows) {
                    cb(err, rows);
                });
            },
            tags: function (cb) {
                var sql = 'select t.id, t.name ' +
                    'from articles_tags at ' +
                    'left join tags t ' +
                    'on at.tid=t.id ' +
                    'where at.aid=?';
                conn.query(sql, [id], function (err, rows) {
                    cb(err, rows);
                });
            }
        }, function (err, results) {
            conn.release();

            var _article = results['article'];
            var _user = results['user'];
            var _tags = results['tags'];

            var article = {
                id: _article[0]['id'],
                title: _article[0]['title'],
                content: _article[0]['content'],
                user: {},
                tags: []
            };

            article['user']['fullname'] = _user[0]['fullname'];

            _tags.forEach(function (tag, i) {
                article['tags'].push({
                    id: tag['id'],
                    name: tag['name']
                });
            });

            callback(err, article);
        });
    });
}
;


dao.saveArticle = function (id, title, content, username, tags) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);

        conn.beginTransaction(function (err) {
            console.log('-----=====');
            console.log(err);
        });

        async.series([
            function (cb) {
                if (id) {
                    var sql = "update articles set " +
                        "title=?,content=? where id=?";
                    conn.query(sql, [title, content, id], function (err, rows) {
                        cb(err, rows);
                    });
                } else {
                    var sql = 'insert into articles ' +
                        '(title, content, username, created_at, updated_at) ' +
                        'values(?,?,?,current_timestamp,current_timestamp)';
                    conn.query(sql, [title, content, username],
                        function (err, rows) {
                            if (!err) id = rows['insertId'];
                            cb(err, rows);
                        });
                }
            },
            function (cb) {
                var sql = 'delete from articles_tags where aid=?';
                conn.query(sql, [id], function (err, rows) {
                    cb(err, rows);
                });
            },
            function (cb) {
                var len = tags.length;
                for (var i = 0; i < len; i++) {
                    var sql = 'insert into articles_tags ' +
                        '(aid, tid) values (?,?)';
                    conn.query(sql, [id, tags[i]], function (err, rows) {
                        cb(err, rows);
                    });
                }
            }
        ], function (err, rows) {
            console.log("**********" + err);
            conn.release();
            if (err)
                conn.rollback();
            else
                conn.commit();
        });
    });
};

