/**
 * Created by hch on 2014/12/1.
 */
var express = require('express');
var async = require('async');
var router = express.Router();
module.exports = router;


router.get('/', function (req, res) {
    console.log('1======' + (new Date() - 0));
    for(var i = 0; i<3;i++) {
        console.log('2======' + (new Date() - 0));
        async.series({
            a: function (cb) {
                for(var j = 0; j< 3; j++) {
                    console.log("    a" + i + " - " + j);
                    setTimeout(function() {
                        console.log("    a" + i + " - " + j);
                        cb(null);
                    },2000);
                }
            },
            b: function (cb) {
                console.log("b");
                cb(null);
            }
        }, function (err, data) {
            console.log("c");
        });
    }
    console.log('3======' + (new Date() - 0));
    res.send('hello test');
});