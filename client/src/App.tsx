import './App.scss';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { AdminURL } from './MainURL';
import Main from './screen/ceylontour/main/Main';
import RestRouter from './screen/ceylontour/rest/RestRouter';
import TourRouter from './screen/ceylontour/tour/tourRouter';
import CounselRouter from './screen/counsel/CounselRouter';
import Test from './screen/Test';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilExchangeAuthKey, recoilExchangeRate } from './RecoilStore';

function App() {

      
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const recoilExchangeAuthKeyCopy = useRecoilValue(recoilExchangeAuthKey);
  const setRecoilExchangeRateCopy = useSetRecoilState(recoilExchangeRate);

  
  // 한국은행 환율 API
  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(`http://ecos.bok.or.kr/api/KeyStatisticList/${recoilExchangeAuthKeyCopy}/json/kr/1/100`);
      const data = await response.json();
      const copy = data.KeyStatisticList.row;
      const filterdResultUSD = copy.filter((e:any)=> e.KEYSTAT_NAME === "원/달러 환율(종가)");
      const USDExchange = filterdResultUSD[0].DATA_VALUE;
      const filterdResultEUR = copy.filter((e:any)=> e.KEYSTAT_NAME === "원/유로 환율(매매기준율)");
      const EURExchange = filterdResultEUR[0].DATA_VALUE;
      if (data.length === 0) {
        throw new Error('환율정보를 불러오지 못했습니다.');
      } else {
        const result = {
          date: '',
          USDunit : '',
          USDsend_KRW_tts : 0,
          EURunit : '',
          EURsend_KRW_tts : 0
        }
        result.date = formattedDate;
        result.USDunit = 'USD';
        result.USDsend_KRW_tts = USDExchange;
        result.EURunit = 'EUR';
        result.EURsend_KRW_tts = EURExchange;
        setRecoilExchangeRateCopy(result);
        axios
        .post(`${AdminURL}/control/inputexchangerate`, {
          date: formattedDate,
          USDunit : 'USD',
          USDcost : USDExchange,
          EURunit : 'EUR',
          EURcost : EURExchange
        })
        .then((res) => {
          if (res.data) {
            console.log('환율정보가 입력되었습니다.')
          } else {
            console.log('환율정보가 입력되지 않았습니다.')
          }
        })
        .catch((error) => {
          console.log(error);
        });
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  // 환율정보 체크하기
  const checkExchangeRate = () => {
    axios
      .get(`${AdminURL}/control/checkexchangerate/${formattedDate}`)
      .then((res) => {
        if (res.data) {
          const copy = [...res.data];
          const result = {
            date: copy[0].date,
            USDunit : copy[0].USDunit,
            USDsend_KRW_tts : Number(copy[0].USDcost.replace(/,/g, '')),
            EURunit : copy[0].EURunit,
            EURsend_KRW_tts : Number(copy[0].EURcost.replace(/,/g, '')),
          }
          setRecoilExchangeRateCopy(result);
        } else {
          fetchExchangeRate();
        }
      })
      .catch((error) => {
        console.error('Error checking exchange rate:', error);
      });
  };

  useEffect(()=>{
    checkExchangeRate();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="/counsel/*" element={<CounselRouter/>}/>
        <Route path="/rest/*" element={<RestRouter/>}/>
        <Route path="/tour/*" element={<TourRouter/>}/>
        <Route path="/test" element={<Test/>}/>
      </Routes>
    </div>
  );
}

export default App;