/**
 * Created by hch on 2014/12/1.
 */

var pool = require('./pool');
var dao = {};
module.exports = dao;


dao.getUser = function (username, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var sql = "select * from users where username=?";
        conn.query(sql, [username], function (err, rows) {
            conn.release();
            if (err) console.log('get tags failed');
            callback(err, rows);
        });
    });
};