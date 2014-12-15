/**
 * Created by hch on 2014/12/1.
 */
var express = require('express');
var async = require('async');
var router = express.Router();
module.exports = router;


router.get('/', function (req, res) {
    //console.log('1======' + (new Date() - 0));
    //for(var i = 0; i<3;i++) {
    //    console.log('2======' + (new Date() - 0));
    //    async.series({
    //        a: function (cb) {
    //            for(var j = 0; j< 3; j++) {
    //                console.log("a" + i + " - " + j);
    //                //setTimeout(function() {
    //                //    console.log("    a" + i + " - " + j);
    //                //    cb(null);
    //                //},2000);
    //                cb(null, "xxxxx", "cccc");
    //                console.log("a -- " + i + " - " + j);
    //            }
    //        },
    //        b: function (cb, a, b) {
    //            console.log("b_____________________");
    //            console.log(arguments);
    //            cb(null);
    //        }
    //    }, function (err, data) {
    //        console.log("c");
    //    });
    //}
    //console.log('3======' + (new Date() - 0));


    //async.waterfall([
    //        function (cb) {
    //            console.log("===a===");
    //            cb("eeeeerrr", 1, 2);
    //        },
    //        function (one, tow, cb) {
    //            console.log("===b===", one, tow);
    //            cb(null, 'done');
    //        }
    //    ],
    //    function (err, results) {
    //        console.log(err);
    //        console.log(results);
    //    });

    var obj = {
        a: 100, b: 200
    }

    console.log(Object.keys(obj));
    res.send('hello test');
});