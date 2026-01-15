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

// 도시 ID 배열로 스케줄 가져오기 (장바구니 도시 기준)
router.post('/gettourschedulesbycities', (req, res) => {
  const cityIds = req.body.cityIds; // 도시 ID 배열
  
  if (!cityIds || !Array.isArray(cityIds) || cityIds.length === 0) {
    return res.status(400).json({ error: 'cityIds 배열이 필요합니다.' });
  }
  
  // 도시 ID로 도시 정보 가져오기
  const cityIdPlaceholders = cityIds.map(() => '?').join(',');
  
  dbpdTour.query(`
    SELECT id, cityKo, nation
    FROM tourNation
    WHERE id IN (${cityIdPlaceholders})
  `, cityIds, function(error, cities) {
    if (error) {
      console.error('SQL Error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    
    if (!cities || cities.length === 0) {
      return res.send([]);
    }
    
    // 도시 이름 목록 추출
    const cityNames = cities.map(city => city.cityKo).filter(Boolean);
    
    // productScheduleData에 해당 도시들이 포함된 스케줄 찾기
    dbpdTour.query(`
      SELECT h.*,
             (SELECT i.inputImage 
              FROM tourNation i 
              WHERE JSON_UNQUOTE(JSON_EXTRACT(h.tourNation, '$[0]')) = i.nationKo
              LIMIT 1) as inputImage
      FROM tourSchedule h
      WHERE h.productScheduleData IS NOT NULL
        AND h.productScheduleData != ''
    `, function(error, allSchedules) {
      if (error) {
        console.error('SQL Error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
      }
      
      // productScheduleData를 파싱해서 도시 이름이 포함된 스케줄만 필터링
      const filteredSchedules = allSchedules.filter(schedule => {
        try {
          if (!schedule.productScheduleData) return false;
          
          const parsed = JSON.parse(schedule.productScheduleData);
          if (!Array.isArray(parsed)) return false;
          
          const scheduleCities = parsed.map((item) => {
            if (typeof item === 'string') {
              return item;
            } else if (item && typeof item === 'object') {
              return item.city || item.cityKo || '';
            }
            return '';
          }).filter(Boolean);
          
          // 장바구니의 모든 도시가 스케줄에 포함되어 있는지 확인
          return cityNames.every(cityName => 
            scheduleCities.some(scheduleCity => 
              scheduleCity.includes(cityName) || cityName.includes(scheduleCity)
            )
          );
        } catch (e) {
          // 파싱 실패 시 productName에서 확인
          if (schedule.productName) {
            return cityNames.some(cityName => 
              schedule.productName.includes(cityName)
            );
          }
          return false;
        }
      });
      
      if (filteredSchedules.length > 0) {
        res.send(filteredSchedules);
      } else {
        res.send([]);
      }
      res.end();
    });
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