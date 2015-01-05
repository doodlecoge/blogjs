/**
 * Created by huaichao on 2014/12/27.
 */

var express = require('express');
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
var util = require('util');
var time = require('../utils/time.js');
var logo_dao = require('../utils/logo_dao.js');

var router = express.Router();

var baseDir = path.normalize(__dirname + path.sep + '..');
var subDir = ['public', 'upload', 'images', 'alogo'].join(path.sep);
var uploadDir = baseDir + path.sep + subDir + path.sep;


router.get('/', function (req, res) {
    logo_dao.getLogos(function (err, logos) {
        res.render('logo_list', {
            logos: logos
        });
    });
});

router.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = 'e:\\tmp';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024;
    form.encoding = 'utf-8';

    var ret = {error: false};

    form.parse(req, function (err, fields, files) {
        if (!files['logo'] || files.logo.size === 0) {
            ret.error = true;
            ret.message = 'logo image not selected';
            res.send(JSON.stringify(ret));
            return;
        }

        var type = files['logo'].type;
        if (type.indexOf('image/') === -1) {
            fs.unlink(files.logo.path);
            ret.error = true;
            ret.message = 'only image is allowed';
            res.send(JSON.stringify(ret));
            return;
        }

        var desc = fields.desc && files.desc.trim() || 'noname';
        var fileName = desc.replace(/[^\d\w_\-]/g, '_');
        fileName += time.ts() + path.extname(files.logo.path);
        logo_dao.addLogo(desc, fileName, function (err, rows) {
            if (err) {
                fs.unlink(files.logo.path);
                ret.error = true;
                ret.message = 'database error';
                res.send(JSON.stringify(ret));
            } else {
                console.log(rows);
                fs.renameSync(files.logo.path, uploadDir + fileName);
                res.send(JSON.stringify(ret));
            }
        });


        //var types = files.upload.name.split('.');
        //console.log(types);
        //var date = new Date();
        //var ms = Date.parse(date);
        //fs.renameSync(files.upload.path, "e:\\tmp\\" + ms +"." + String(types[types.length-1]));

        //res.writeHead(200, {'content-type': 'text/plain'});
        //res.write('received upload:\n\n');
        //res.end(util.inspect({fields: fields, files: files}));
    });
});

module.exports = router;