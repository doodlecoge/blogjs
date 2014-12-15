/**
 * Created by hch on 2014/11/6.
 */
var async = require('async');
var pool = require('./pool');

var dao = {};
module.exports = dao;


dao.getArticles = function (page, size, callback) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;

        async.waterfall([
            // get count of articles
            function (cb) {
                var sql = 'select count(*) cnt from articles';
                conn.query(sql, function (err, rows) {
                    if (err) {
                        cb(err);
                    } else {
                        var count = rows[0]['cnt'];
                        cb(err, count);
                    }
                });
            },
            // get articles
            function (count, cb) {
                if (count == 0) {
                    cb('no record');
                    return;
                }
                page = Math.max(0, page);
                size = Math.max(10, size);
                var start = page * size;
                if (start >= count)
                    start = Math.floor((count - 1) / size) * size;

                var sql = '' +
                    'select a.*, u.fullname from articles a ' +
                    'left join users u ' +
                    'on a.username = u.username ' +
                    'order by updated_at desc ' +
                    'limit ?,?';
                conn.query(sql, [start, size], function (err, rows) {
                    if (err) {
                        cb(err);
                        return;
                    }

                    var articles = {};
                    rows.forEach(function (row) {
                        articles[row.id] = {
                            article: {
                                title: row.title,
                                content: row.content,
                                created_at: row.created_at,
                                updated_at: row.updated_at
                            },
                            user: {
                                username: row.username,
                                fullname: row.fullname
                            },
                            tags: []
                        };
                    });

                    cb(err, articles, count);
                });
            },
            // set tags
            function (articles, count, cb) {
                var ids = Object.keys(articles);
                // tags
                var sql = '' +
                    'select t.id, t.name, at.aid from articles_tags at ' +
                    'left join tags t ' +
                    'on at.tid=t.id ' +
                    'where at.aid in (?)';
                conn.query(sql, [ids], function (err, tags) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    tags.forEach(function (tag) {
                        articles[tag.aid].tags.push({
                            id: tag.id,
                            name: tag.name
                        });
                    });
                    cb(err, articles, count);
                });
            }
        ], function (err, articles, count) {
            conn.release();
            callback(err, articles, count);
        });
    });
};

dao.getArticleById = function (id, callback) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        var username = null;
        async.series({
            article: function (cb) {
                var sql = 'select * from articles where id=?';
                conn.query(sql, [id], function (err, rows) {
                    if (err) {
                        cb(err, rows);
                    } else if (rows.length == 0) {
                        cb('article not found ' + id);
                    } else {
                        username = rows[0]['username'];
                        cb(err, rows);
                    }
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
            if (err) {
                callback(err);
                return;
            }

            var _article = results['article'];
            var _user = results['user'];
            var _tags = results['tags'];

            var article = {
                id: _article[0]['id'],
                title: _article[0]['title'],
                content: _article[0]['content'],
                user: {},
                tags: [],
                created_at: _article[0]['created_at'],
                updated_at: _article[0]['updated_at']
            };

            article['user']['username'] = _user[0]['username'];
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
};


dao.deleteArticle = function (id, callback) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        async.series({
            tags: function (cb) {
                var sql = 'delete from articles_tags where aid=?';
                conn.query(sql, [id], function (err, rows) {
                    cb(err, rows);
                });
            },
            article: function (cb) {
                var sql = 'delete from articles where id=?';
                conn.query(sql, [id], function (err, rows) {
                    cb(err, rows);
                });
            }
        }, function (err, results) {
            if (err)
                conn.rollback();
            else
                conn.commit();
            conn.release();
            callback(err, results);
        });
    });
};


dao.saveArticle = function (id, title, content, username, tags, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);

        conn.beginTransaction(function (err) {
            if (err) console.log(err);
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
                if (tags.length == 0)
                    var sql = 'insert into articles_tags (aid, tid) values ';


                function fns() {
                    var fns = [];
                    var len = tags.length;
                    for (var i = 0; i < len; i++) {
                        fns.push(insert(id, tags[i]));
                    }
                    return fns;
                }

                function insert(aid, tid) {
                    return function (cb) {
                        var sql = 'insert into articles_tags ' +
                            '(aid, tid) values (?,?)';
                        conn.query(sql, [aid, tid], function (err, rows) {
                            console.log('aid:' + aid + ',tid:' + tid);
                            cb(err, rows);
                        });
                    }
                }

                async.series(fns(), function (err, rows) {
                    cb(err, rows);
                });

            }
        ], function (err, rows) {
            if (err)
                conn.rollback();
            else
                conn.commit();
            conn.release();
            callback(err, id);
        });
    });
};

