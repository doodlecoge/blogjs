var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'huaichao',
    password: 'password',
    database: 'blogjs',
    port: 3306
});
pool.on('connection', function (conn) {
    console.log('===on connection===');
});
module.exports = pool;