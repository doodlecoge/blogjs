/**
 * Created by hch on 2014/11/6.
 */
var pool = require('./pool');

var dao = {};
module.exports = dao;


dao.getTags = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var sql = "select * from tags";
        conn.query(sql, function (err, rows) {
            conn.release();
            if (err) console.log('get tags failed');
            callback(err, rows);
        });
    });
};

dao.addTag = function (name, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var sql = "insert into tags (id,name) values (?)";
        conn.query(sql, [[100,"huaichao222"]], function (err, rows) {
            conn.release();
            console.log(err);
            if (err) console.log('add tag failed');
            callback(err, rows);
        });
    });
};

dao.delTag = function (name, callback) {
    pool.getConnection(function (err, conn) {
        if (err) console.log(err);
        var sql = "delete from tags where name=?";
        conn.query(sql, [name], function (err, rows) {
            conn.release();
            if (err) console.log('delete tag failed');
            callback(err, rows);
        });
    });
};

