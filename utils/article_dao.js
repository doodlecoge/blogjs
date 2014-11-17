/**
 * Created by hch on 2014/11/6.
 */
var pool = require('./pool');

var dao = {};
module.exports = dao;


dao.getArticles = function (page, size, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);

        var count = null;
        size = Math.max(size, 10);
        var start = Math.max((page - 1) * size, 0);

        var sql = 'select count(*) cnt from articles';
        conn.query(sql, function (err, rows) {
            console.log(rows);
            count = rows[0]['cnt'];
        });

        if (start >= count)
            start = Math.floor(count / size) * size;


        sql = "select * from articles limit ?,?";


        conn.query(sql, [start, size], function (err, rows) {
            conn.release();
            if (err) console.log('get articles failed');
            callback(err, rows, count);
        });
    });
};

dao.getArticleById = function (id, callback) {

    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var sql = "select * from articles where id='" + id + "'";
        conn.query(sql, function (err, rows) {
            conn.release();
            if (err) console.log('get user failed');
            callback(err, rows);
        });
    });
};

