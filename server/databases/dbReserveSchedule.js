// 클라우드 업로드용 (naver)
var mysql = require('mysql');
var dbReserveSchedule = mysql.createPool({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'ct@!2212CT',
  database : 'reserveSchedule'
});

module.exports = {
  dbReserveSchedule
};