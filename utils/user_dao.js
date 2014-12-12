/**
 * Created by hch on 2014/12/1.
 */

var pool = require('./pool');
var dao = {};
module.exports = dao;


dao.getUser = function (username, callback) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        var sql = "select * from users where username=?";
        conn.query(sql, [username], function (err, rows) {
            conn.release();
            var user = null;
            if (rows.length == 1) {
                user = {
                    username: rows[0]['username'],
                    fullname: rows[0]['fullname'],
                    password: rows[0]['password']
                }
            }
            callback(err, user);
        });
    });
};