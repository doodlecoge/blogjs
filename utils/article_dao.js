/**
 * Created by hch on 2014/11/6.
 */
var pool = require('./pool');

var dao = {};
module.exports = dao;


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

