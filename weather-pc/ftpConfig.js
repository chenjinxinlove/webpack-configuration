/**
 * Created by chen on 2017/4/21.
 */
var path = require('path');
var proName = __dirname.split('\\');
var pathN = transformStr3(proName[proName.length - 1]);
function transformStr3(str){
  var re=/-(\w)/g;
  return str.replace(re,function ($0,$1){
    return $1.toUpperCase();
  });
}
var ftpConfig = {
  pathN: pathN,
  //外网ftp地址
  ww:{
    host: 'xx.xx.xx.xjx',
    user: 'xx',
    pass: 'xx',
    port:'xxxx',
    remotePath:'xx' + pathN
  },
  wwUrl: 'xxxx',
  //微信
  wx:{
    host: 'xx.xx.xx.xx',
    user: 'xx',
    pass: 'xx',
    port:'xxxx',
    remotePath:'xx' + pathN
  },
  wxUrl : 'xxxx'
};

module.exports = ftpConfig;
