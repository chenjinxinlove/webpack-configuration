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
  pathN : pathN,
  //内网ftp地址
  nw: {
    host: '去',
    user: 'program',
    pass: ' ',
    remotePath:'的/' + pathN
  },
  //外网ftp地址
  ww:{
    host: '61 .120',
    user: 'c nxin',
    port:'2 2',
    pass: 'Dk出h1ZnOk7oD',
    remotePath:'出' + pathN
  },
  //微信
  wx:{
    host: ' 2',
    user: 'ch in',
    pass: ' 7nswzC0nfaElE',
    remotePath:'/ ' + pathN +'/'
  }
}

module.exports = ftpConfig;
