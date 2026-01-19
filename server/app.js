const express = require('express');
const path = require('path');
const app = express();


var bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
var cors = require('cors');

// 홈페이지 라우터
var HomeRouter = require('./routes/Home');
var ProductRestRouter = require('./ProductRest');
var ProductTourRouter = require('./ProductTour');
var ProductEstimateRouter = require('./ProductEstimate');
app.use('/home', HomeRouter);
app.use('/ceylontour/productrest', ProductRestRouter);
app.use('/ceylontour/producttour', ProductTourRouter);
app.use('/ceylontour/productestimate', ProductEstimateRouter);
app.use('/ceylontour', ProductEstimateRouter); // /ceylontour/getEstimateList, /ceylontour/getEstimate/:id 지원
app.use('/productrest', ProductRestRouter);
app.use('/producttour', ProductTourRouter);
app.use('/productestimate', ProductEstimateRouter);


// 관리 라우터
var AdminControlRouter = require('./routes/admins/AdminControl');
var AdminNoticeRouter = require('./routes/admins/AdminNotice');
var AdminDevListRouter = require('./routes/admins/AdminDevList');
var AdminBackupRouter = require('./routes/admins/AdminBackup');
app.use('/admincontrol', AdminControlRouter);
app.use('/adminnotice', AdminNoticeRouter);
app.use('/admindevlist', AdminDevListRouter);
app.use('/adminbackup', AdminBackupRouter);

// api 라우터
var KaKaoNotifiRouter = require('./routes/api/KaKaoNotifi');
var SearchAccountRouter = require('./routes/api/SearchAccount');
var CashReceiptRouter = require('./routes/api/CashReceipt');
var NaverOcrRouter = require('./routes/api/NaverOcr');
app.use('/apikakaonotifi', KaKaoNotifiRouter);
app.use('/apisearchaccount', SearchAccountRouter);
app.use('/apicashreceipt', CashReceiptRouter);
app.use('/apinaverocr', NaverOcrRouter);

// 예약스케줄 라우터
var AdminCounselRouter = require('./routes/reserveSchedule/AdminCounsel');
var AdminReserveRouter = require('./routes/reserveSchedule/AdminReserve');
var AdminScheduleRouter = require('./routes/reserveSchedule/AdminSchedule');
var AdminCSdataRouter = require('./routes/reserveSchedule/AdminCSdata');
app.use('/admincounsel', AdminCounselRouter);
app.use('/adminreserve', AdminReserveRouter);
app.use('/adminschedule', AdminScheduleRouter);
app.use('/admincsdata', AdminCSdataRouter);


// 회원관리 라우터
var AdminUsersRouter = require('./routes/userManage/Users');
app.use('/users', AdminUsersRouter);



// 휴양지관리 라우터
var RestNationCityRouter = require('./routes/productsRest/PdRestNationCity');
var RestProductHotelRouter = require('./routes/productsRest/PdRestProductHotel');
var RestProductScheduleRouter = require('./routes/productsRest/PdRestProductSchedule');
var RestScheduleDetailBoxRouter = require('./routes/productsRest/PdRestScheduleDetailBox');

app.use('/restnationcity', RestNationCityRouter);
app.use('/restproducthotel', RestProductHotelRouter);
app.use('/restproductschedule', RestProductScheduleRouter);
app.use('/restscheduledetailbox', RestScheduleDetailBoxRouter);

// 관광지관리 라우터
var TourNationCityRouter = require('./routes/productsTour/PdTourNationCity');
var TourScheduleRouter = require('./routes/productsTour/PdTourProductSchedule');
var TourProductHotelRouter = require('./routes/productsTour/PdTourProductHotel');
var TourScheduleDetailBoxRouter = require('./routes/productsTour/PdTourScheduleDetailBox');
app.use('/tournationcity', TourNationCityRouter);
app.use('/tourproductschedule', TourScheduleRouter);
app.use('/tourproducthotel', TourProductHotelRouter);
app.use('/tourscheduledetailbox', TourScheduleDetailBoxRouter);


// 랜드사관리 라우터
var AdminLandCompanyRouter = require('./routes/landCompany/AdminLandCompany');
app.use('/landcompany', AdminLandCompanyRouter);



app.use(express.static('build'));
app.use(express.urlencoded({ extended: true, limit: '10mb' })) 
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(compression());
app.use(helmet());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:;"
  );
  next();
});

app.listen(8000, ()=>{
  console.log('server is running')
});



// 리액트 연결하기 ----------------------------------------------------------------- //

app.use(express.static(path.join(__dirname, '/build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});


