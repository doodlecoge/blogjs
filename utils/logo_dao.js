/**
 * Created by huaichao on 2014/12/27.
 */

var pool = require('./pool');

var dao = {};
module.exports = dao;


dao.getLogos = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var sql = "select * from logos";
        conn.query(sql, function (err, rows) {
            conn.release();
            callback(err, rows);
        });
    });
};

dao.addLogo = function (desc, path, callback) {
    pool.getConnection(function (err, conn) {
        console.log(err);
        var sql = "insert into logos (description,path) values (?,?)";
        conn.query(sql, [desc, path], function (err, rows) {
            conn.release();
            console.log(err);
            console.log(rows);
            callback(err, rows);
        });
    });
};