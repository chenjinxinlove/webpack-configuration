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
    host: '10.0.120.212',
    user: 'program',
    pass: '78RVBpRGuvY3NX8febOm',
    remotePath:'/ser/www/chenjinxin/' + pathN
  },
  //外网ftp地址
  ww:{
    host: '61.4.185.120',
    user: 'chenjinxin',
    port:'2222',
    pass: 'DkIYCQ3E3oUh1ZnOk7oD',
    remotePath:'/ser/www/bbs/htdocs/ski/' + pathN
  },
  //微信
  wx:{
    host: '61.4.185.222',
    user: 'chenjinxin',
    pass: 'hzXUNdP7nswzC0nfaElE',
    remotePath:'/wx/' + pathN +'/'
  }
}

module.exports = ftpConfig;
