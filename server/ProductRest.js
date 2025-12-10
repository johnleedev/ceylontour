const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { dbpdRest } = require('../databases/dbpdRest');
var cors = require('cors');
router.use(cors());
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
const multer  = require('multer')
var fs = require("fs");

const escapeQuotes = (str) => str.replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');


// ResortMainPage ------------------------------------------------
// 리조트 전체 가져오기
router.get('/getresthotelall', async (req, res) => {
  dbpdRest.query(`
    SELECT h.*, i.*
    FROM restHotel h
    LEFT JOIN restHotelImage i
      ON h.id = i.hotelID;
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


// 특정 호텔 데이터 가져오기
router.get('/getresthotelpart/:id', (req, res) => {
  var postId = req.params.id;
  dbpdRest.query(`
    SELECT h.*, i.*
    FROM restHotel h
    LEFT JOIN restHotelImage i
      ON h.id = i.hotelID
      WHERE h.id = '${postId}';
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

// 특정 호텔 해당 지역 스케줄 가져오기
router.get('/getschedules/:nation/:city', (req, res) => {
  
  var nation = req.params.nation;
  var tourLocation = req.params.city;

  dbpdRest.query(`
    SELECT * FROM restSchedule WHERE nation = '${nation}' AND tourLocation = '${tourLocation}';
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

// 호텔 상품 조립용 리스트 가져오기
router.get('/getothershotels/:sort/:city', (req, res) => {
  const sort = req.params.sort;
  const city = req.params.city;

  const sql = `
    SELECT h.*, i.*
    FROM restHotel h
    LEFT JOIN restHotelImage i
      ON h.id = i.hotelID
    WHERE h.hotelType = ? AND h.city = ?;
  `;

  dbpdRest.query(sql, [sort, city], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Database error');
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send(false);
    }
  });
});



module.exports = router;