console.log('-----------------' + new Date());

var mysql = require('mysql');
var db = {
    pool: mysql.createPool({
        host: 'localhost',
        user: 'huaichao',
        password: 'password',
        database: 'blog',
        port: 3306
    }),
    getUsers: function (callback) {
        this.pool.getConnection(function (err, conn) {
            if (err) console.log("POOL ==> " + err);

            var sql = 'select * from users';

            conn.query(sql, function (err, rows) {
                if (err) console.log(err);
                callback.call(null, rows);
                conn.release();
            });
        });
    },
    getArticle: function (id, callback) {
        this.pool.getConnection(function (err, conn) {
            if (err) console.log("POOL ==> " + err);

            var sql = "" +
                "select * from articles a " +
                "left outer join articles_tags at on a.id=at.aid " +
                "left outer join tags t on at.tid = t.id " +
                "where a.id='" + id + "'";

            //var sql = "select * from articles where id='" + id + "'";

            conn.query(sql, function (err, rows) {
                if (err) console.log(err);
                callback.call(null, rows);
                conn.release();
            });
        });
    },
    getAllArticles: function (page, size, callback) {
        var start = Math.max(0, page - 1 * size);

        this.pool.getConnection(function (err, conn) {
            if (err) console.log("POOL ==> " + err);

            var sql = 'select count(*) cnt from articles';
            var count = 0;

            conn.query(sql, function (err, rows) {
                count = rows[0].cnt;
            });

            sql = "select * from articles limit " + start + "," + size;

            conn.query(sql, function (err, rows) {
                if (err) console.log(err);
                callback.call(null, count, rows);
                conn.release();
            });
        });
    }
};
module.exports = db;