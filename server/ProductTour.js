const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { dbpdTour } = require('../databases/dbpdTour');
var cors = require('cors');
router.use(cors());
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
const multer  = require('multer')
var fs = require("fs");

const escapeQuotes = (str) => str.replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');


// 스케줄 이름 전체 가져오기 (tourNation 기반)
router.get('/gettourschedulenames', async (req, res) => {
  dbpdTour.query(`
    SELECT h.id, h.isView, h.tourNation, 
           (SELECT i.inputImage 
            FROM tourNation i 
            WHERE JSON_UNQUOTE(JSON_EXTRACT(h.tourNation, '$[0]')) = i.nationKo
            LIMIT 1) as inputImage
    FROM tourSchedule h;
  `, function(error, result) {
    if (error) {throw error;}
    if (result.length > 0) {
      res.json(result);
      res.end();
    } else {
      res.send(false);
      res.end();
    }
  });
});


// 특정 나라 스케줄 데이터 가져오기
router.post('/gettourschedules', (req, res) => {
  
  const tourNation = req.body.tourNation;
  
  dbpdTour.query(`
    SELECT h.*,
           (SELECT i.inputImage 
            FROM tourNation i 
            WHERE JSON_UNQUOTE(JSON_EXTRACT(h.tourNation, '$[0]')) = i.nationKo
            LIMIT 1) as inputImage
    FROM tourSchedule h
    WHERE h.tourNation = ?;
  `, [tourNation], function(error, result) {
    if (error) {
      console.error('SQL Error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }            
  });
});


// 특정 스케줄 데이터 가져오기
router.get('/gettourschedulepart/:id', (req, res) => {
  
  var postId = req.params.id;
  dbpdTour.query(`
    SELECT * FROM tourSchedule
    WHERE id = '${postId}';
  `, function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }            
  });
});

// // 특정 호텔 해당 지역 스케줄 가져오기
// router.get('/getschedules/:nation/:city', (req, res) => {
  
//   var nation = req.params.nation;
//   var tourLocation = req.params.city;

//   dbpdTour.query(`
//     SELECT * FROM tourSchedule WHERE nation = '${nation}' AND tourLocation = '${tourLocation}';
//   `, function(error, result) {
//     if (error) throw error;
//     if (result.length > 0) {
//       res.send(result);
//       res.end();
//     } else {              
//       res.send(false);
//       res.end();
//     }            
//   });
// });

// // 호텔 상품 조립용 리스트 가져오기
// router.get('/getothershotels/:sort/:city', (req, res) => {
//   const sort = req.params.sort;
//   const city = req.params.city;

//   const sql = `
//     SELECT h.*, i.*
//     FROM tourHotel h
//     LEFT JOIN tourHotelImage i
//       ON h.id = i.hotelID
//     WHERE h.hotelType = ? AND h.city = ?;
//   `;

//   dbpdTour.query(sql, [sort, city], (error, result) => {
//     if (error) {
//       console.error(error);
//       return res.status(500).send('Database error');
//     }

//     if (result.length > 0) {
//       res.send(result);
//     } else {
//       res.send(false);
//     }
//   });
// });



module.exports = router;