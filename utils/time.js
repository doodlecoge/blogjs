/**
 * Created by huaichao on 2015/1/4.
 */

var time = {};
module.exports = time;

time.ts = function () {
    var ts = '';
    var date = new Date();
    var comps = [];
    comps.push(date.getFullYear());
    comps.push(pad(date.getMonth() + 1, 2));
    comps.push(pad(date.getDate(), 2));
    comps.push(pad(date.getHours(), 2));
    comps.push(pad(date.getMinutes(), 2));
    comps.push(pad(date.getSeconds(), 2));
    return comps.join('');
};

function pad(obj, len, placeholder) {
    placeholder = placeholder || '0';
    var str = obj.toString();
    if (str.length < len) {
        for (var i = 0; i < len - str.length; i++) {
            str = placeholder + str;
        }
    }
    return str;
}
