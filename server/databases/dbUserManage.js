// 클라우드 업로드용 (naver)
var mysql = require('mysql');
var dbUserManage = mysql.createPool({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'ct@!2212CT',
  database : 'userManage'
});


module.exports = {
  dbUserManage
};