import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import './ScheduleRederBox.scss'
import { DropdownBox } from '../../boxs/DropdownBox';
import axios from 'axios';
import { AdminURL } from '../../MainURL';
import { ImLocation } from 'react-icons/im';
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import RatingBoard from './RatingBoard';
import { useRecoilValue, useRecoilState } from 'recoil';
import { recoilExchangeRate, recoilScheduleInfo } from '../../RecoilStore';
import { fetchScheduleDetailDataExternal } from './ScheduleDetailRedering';
import { GoDotFill } from "react-icons/go";
import AirlineData from '../AirlineData';
import trainIcon from '../images/common/train.png';
import busIcon from '../images/common/bus.png';
import shipIcon from '../images/common/ship.png';
import location1Icon from '../images/common/location1.png';

interface ModalScheduleDetailProps {
    airlineData: {
      sort: string;
      airlineCode: string[];
    },
    scheduleDetailData: {
      breakfast :string;
      lunch:string;
      dinner :string;
      hotel:string;
      score:string;
      scheduleDetail: {
        id:number, 
        sort:string,
        st?: string,
        isViewLocation:boolean,
        locationIcon?: string,
        location:string, 
        isUseContent:boolean,
        locationContent?: string,
        locationDetail:{
          subLocation:string, 
          isUseContent:boolean,
          subLocationContent:string, 
          subLocationDetail:number[]}[]
        airlineData?: {
          airlineCode: string;
          airlineName: string;
          depart: string;
          departTime: string;
          arrive: string;
          arriveTime: string;
          addDay: string;
          id?: string;
        } | null;
        trainData?: {
          trainCode: string;
          trainName: string;
          depart: string;
          departTime: string;
          arrive: string;
          arriveTime: string;
          addDay: string;
          id?: string;
        } | null;
        busData?: {
          busCode: string;
          busName: string;
          depart: string;
          departTime: string;
          arrive: string;
          arriveTime: string;
          addDay: string;
          id?: string;
        } | null;
        shipData?: {
          shipCode: string;
          shipName: string;
          depart: string;
          departTime: string;
          arrive: string;
          arriveTime: string;
          addDay: string;
          id?: string;
        } | null;
      }[];
    }[]
  }

interface ScheduleRederBoxProps {
  id?: string | null;
  scheduleInfo?: any;
  productInfo?: any;
  useRecoil?: boolean;
  onSelectedScheduleChange?: (selectedSchedule: ModalScheduleDetailProps | null, selectedIndex: number) => void;
  // 일차별 호텔 정보 (상품명에서 파싱)
  hotelInfoPerDay?: Array<{ dayIndex: number; hotelName: string; hotelLevel: string }>;
  // 일차별 도시 정보 (유럽 일정용)
  cityInfoPerDay?: Array<{ dayIndex: number; cityName: string }>;
  // floating box 숨김 여부
  hideFloatingBox?: boolean;
}
  

export default function ScheduleRederBox (props : ScheduleRederBoxProps) {
  // Recoil에서 일정 데이터 가져오기 (useRecoil prop이 true일 때)
  const [recoilScheduleInfoValue] = useRecoilState(recoilScheduleInfo);
  const useRecoil = props.useRecoil || false;
  
  // ScheduleInfo를 ModalScheduleDetailProps로 변환하는 함수
  const convertScheduleInfoToModalProps = (scheduleInfo: any): ModalScheduleDetailProps => {
    return {
      airlineData: scheduleInfo.airlineData || { sort: '', airlineCode: [] },
      scheduleDetailData: scheduleInfo.scheduleDetailData.map((day: any) => ({
        breakfast: day.breakfast || '',
        lunch: day.lunch || '',
        dinner: day.dinner || '',
        hotel: day.hotel || '',
        score: day.score || '',
        scheduleDetail: day.scheduleDetail.map((detail: any) => ({
          id: detail.id || 0,
          sort: detail.sort || detail.st || '',
          st: detail.st,
          isViewLocation: detail.isViewLocation !== undefined ? detail.isViewLocation : true,
          locationIcon: detail.locationIcon,
          location: detail.location || '',
          isUseContent: detail.isUseMainContent !== undefined ? detail.isUseMainContent : (detail.isUseContent !== undefined ? detail.isUseContent : false),
          locationContent: detail.mainContent || detail.locationContent || '',
          locationDetail: detail.locationDetail || [],
          airlineData: detail.airlineData,
          trainData: detail.trainData,
          busData: detail.busData,
          shipData: detail.shipData
        }))
      }))
    };
  };
  
  const fetchScheduleData = async () => {
  

    try {
      setLoading(true);
      const targetId = props.id ?? '4';
      const response = await fetch(`${AdminURL}/ceylontour/getschedulebyid/${targetId}`);

      const data = await response.json();
      const scheduleData = data[0];

      try {
        await fetchScheduleDetailData(scheduleData);
      } catch (detailError) {
        console.error('상세 데이터 처리 중 오류 발생:', detailError);
        // 에러가 발생해도 기본 구조는 설정
        const defaultSchedule = {
          airlineData: { sort: '', airlineCode: [] },
          scheduleDetailData: [createEmptyDay()]
        };
        setScheduleList([defaultSchedule]);
      }
      
    } catch (error) {
      console.error('스케줄 데이터를 가져오는 중 오류 발생:', error);
      // 에러 발생 시에도 기본 구조 설정
      const defaultSchedule = {
        airlineData: { sort: '', airlineCode: [] },
        scheduleDetailData: [createEmptyDay()]
      };
      setScheduleList([defaultSchedule]);
    } finally {
      // fetchScheduleDetailData가 완전히 끝난 후에만 로딩 해제
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Recoil을 사용하는 경우
    if (useRecoil) {
      if (recoilScheduleInfoValue && recoilScheduleInfoValue.scheduleDetailData) {
        // ScheduleInfo를 ModalScheduleDetailProps로 변환
        const convertedSchedule = convertScheduleInfoToModalProps(recoilScheduleInfoValue);
        setScheduleList([convertedSchedule]);
        setSelectedScheduleIndex(0);
        setLoading(false);
        // 선택된 일정 변경 알림
        if (props.onSelectedScheduleChange) {
          props.onSelectedScheduleChange(convertedSchedule, 0);
        }
      } else if (props.scheduleInfo && props.scheduleInfo.scheduleDetailData) {
        // props.scheduleInfo가 있으면 사용
        setScheduleList([props.scheduleInfo]);
        setSelectedScheduleIndex(0);
        setLoading(false);
        if (props.onSelectedScheduleChange) {
          props.onSelectedScheduleChange(props.scheduleInfo, 0);
        }
      } else {
        // id가 변경될 때마다 해당 id 기준으로 다시 일정 조회
        fetchScheduleData();
      }
    } else {
      // 기존 로직: scheduleInfo prop이 전달되면 해당 일정만 사용
      if (props.scheduleInfo && props.scheduleInfo.scheduleDetailData) {
        setScheduleList([props.scheduleInfo]);
        setSelectedScheduleIndex(0);
        setLoading(false);
        // 선택된 일정 변경 알림
        if (props.onSelectedScheduleChange) {
          props.onSelectedScheduleChange(props.scheduleInfo, 0);
        }
      } else {
        // id가 변경될 때마다 해당 id 기준으로 다시 일정 조회
        fetchScheduleData();
      }
    }
  }, [props.scheduleInfo, props.id, useRecoil, recoilScheduleInfoValue]);


  
  // 처음 렌더링 시 일정 상세 데이터 받아오기 (2단계 fetch)
  const fetchScheduleDetailData = async (dataToFetch?: any) => {
    await fetchScheduleDetailDataExternal({
      dataToFetch,
      scheduleData:null,
      propsScheduleInfo: props.scheduleInfo,
      setScheduleList,
      setManageAirline:() => {},
      createEmptyDay,
      safeJsonParse,
      repairJsonString,
      isAddOrRevise:'add',
      hotelInfoPerDay: props.hotelInfoPerDay,
    });
  };


 

  const [loading, setLoading] = useState<boolean>(true);

  // JSON 문자열 복구 함수 (이스케이프되지 않은 큰따옴표 처리)
  const repairJsonString = (jsonStr: string): string => {
    if (!jsonStr || typeof jsonStr !== 'string') return jsonStr;
    
    try {
      // 먼저 파싱 시도
      JSON.parse(jsonStr);
      return jsonStr; // 이미 올바른 형식이면 그대로 반환
    } catch (e) {
      // 파싱 실패 시 복구 시도
      // 상태 머신 방식: 문자열 값 내부의 큰따옴표만 이스케이프
      let result = '';
      let inString = false;
      let escapeNext = false;
      let inValue = false; // 현재 값 문자열인지 (키가 아닌 값)
      
      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];
        const afterChars = i < jsonStr.length - 1 ? jsonStr.substring(i + 1, Math.min(i + 20, jsonStr.length)) : '';
        const beforeChars = i > 0 ? jsonStr.substring(Math.max(0, i - 20), i) : '';
        
        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          // 키의 끝인지 확인 (" 다음에 : 가 오면 키의 끝)
          const isKeyEnd = /^\s*:/.test(afterChars);
          
          // 값의 시작인지 확인 (:, [, { 뒤에 " 가 오면 값의 시작)
          const isValueStart = /[:\[{]\s*$/.test(beforeChars);
          
          // 값의 끝인지 확인 (" 다음에 , 또는 } 또는 ] 가 오면 값의 끝)
          const isValueEnd = /^\s*[,}\]\]]/.test(afterChars);
          
          if (isKeyEnd) {
            // 키의 끝이므로 그대로
            result += '"';
            inString = false;
            inValue = false;
          } else if (isValueStart && !inString) {
            // 값의 시작
            result += '"';
            inString = true;
            inValue = true;
          } else if (inString && inValue) {
            // 값 문자열 내부에서 큰따옴표 발견
            if (isValueEnd) {
              // 문자열의 끝
              result += '"';
              inString = false;
              inValue = false;
            } else {
              // 문자열 내부의 큰따옴표이므로 이스케이프
              result += '\\"';
            }
          } else {
            // 그 외의 경우
            result += '"';
            if (isValueStart && !inString) {
              inString = true;
              inValue = true;
            } else if (isValueEnd && inString) {
              inString = false;
              inValue = false;
            }
          }
        } else {
          result += char;
        }
      }
      
      return result;
    }
  };


  // 안전한 JSON 파싱 헬퍼 함수
  const safeJsonParse = <T,>(jsonString: any, defaultValue: T): T => {
    if (!jsonString) return defaultValue;
    if (typeof jsonString !== 'string') {
      // 이미 객체인 경우 그대로 반환
      return Array.isArray(jsonString) ? jsonString as T : (typeof jsonString === 'object' ? jsonString as T : defaultValue);
    }
    try {
      const trimmed = jsonString.trim();
      if (!trimmed || trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
        return defaultValue;
      }
      // JSON.parse 시도
      return JSON.parse(trimmed);
    } catch (e: any) {
      console.error('JSON 파싱 오류 (1차 시도):', e?.message || e);
      
      // 파싱 실패 시 JSON 복구 시도
      try {
        const trimmed = jsonString.trim();
        const repaired = repairJsonString(trimmed);
        return JSON.parse(repaired);
      } catch (e2: any) {
        console.error('JSON 파싱 오류 (복구 후 재시도 실패):', e2?.message || e2);
        return defaultValue;
      }
    }
  };


  const [selectedNation, setSelectedNation] = useState<any>(null);

 


  // Helpers to create empty schedule structures
  const createEmptyDetail = () => ({
    id: 0,
    sort: '',
    locationIcon: '',
    location: '',
    isUseContent: false,
    locationContent: '',
    isViewLocation: true,
    locationDetail: [{ subLocation: '', subLocationContent: '', subLocationDetail: [], isUseContent: false }],
    airlineData: null
  });

  const createEmptyDay = () => ({
    breakfast: '',
    lunch: '',
    dinner: '',
    hotel: '',
    score: '',
    scheduleDetail: [createEmptyDetail()]
  });

  // 일정표 -------------------------------------------------------------------------------------------------------------------

  const [scheduleList, setScheduleList] = useState<ModalScheduleDetailProps[]>( 
    [{
      airlineData: {
        sort: "",
        airlineCode: []
      },
      scheduleDetailData: [createEmptyDay()]
    }]
  );  
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);
  // 각 day의 location 표시 여부 (열려있는 day 인덱스 Set)
  const [expandedLocationDays, setExpandedLocationDays] = useState<Set<number>>(new Set());
  // floating box 펼침 상태
  const [isFloatingBoxExpanded, setIsFloatingBoxExpanded] = useState<boolean>(false);

  // 선택된 일정 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (props.onSelectedScheduleChange && scheduleList.length > 0) {
      const selectedSchedule = scheduleList[selectedScheduleIndex] || null;
      props.onSelectedScheduleChange(selectedSchedule, selectedScheduleIndex);
    }
  }, [selectedScheduleIndex, scheduleList, props]);



  const datmealOptions = [
    { value: '선택', label: '선택' },
    { value: '기내식', label: '기내식' },
    { value: '선택식', label: '선택식' },
    { value: '외부식', label: '외부식' },
    { value: '리조트', label: '리조트' },
    { value: '자유식', label: '자유식' },
    { value: '현지식', label: '현지식' },
    { value: '호텔식', label: '호텔식' },
    { value: '포함', label: '포함' },
    { value: '불포함', label: '불포함' }
  ]
  const productOptions = [
    { value: '선택', label: '선택' },
    { value: '리조트', label: '리조트' },
    { value: '풀빌라', label: '풀빌라' },
    { value: '호텔', label: '호텔' },
    { value: '우붓', label: '우붓' },
    { value: '경유지', label: '경유지' },
  ]


  // 도시명(공항코드) 반환 함수
  function getCityNameByCode(code: string) {
    if (code === 'ICN') return '인천(ICN)';
    if (!selectedNation || !selectedNation.cities) return code;
    const city = selectedNation.cities.find((c: any) => c.airportCode === code);
    return city ? `${city.cityKo}(${code})` : code;
  }

  // 기차/버스/선박 코드로 도시명 찾기
  function getCityNameByTrafficCode(code: string, type: 'train' | 'bus' | 'ship') {
    if (!code) return code;
    if (!selectedNation || !selectedNation.cities) return code;
    
    for (const city of selectedNation.cities) {
      if (!city.trafficCode) continue;
      const trafficCode = typeof city.trafficCode === 'string' 
        ? safeJsonParse(city.trafficCode, null)
        : city.trafficCode;
      
      if (!trafficCode) continue;
      
      let codeList: any[] = [];
      if (type === 'train' && trafficCode.train) {
        codeList = trafficCode.train;
      } else if (type === 'bus' && trafficCode.bus) {
        codeList = trafficCode.bus;
      } else if (type === 'ship' && trafficCode.ship) {
        codeList = trafficCode.ship;
      }
      
      const found = codeList.find((item: any) => item.code === code);
      if (found) {
        const name = type === 'train' ? found.station : type === 'bus' ? found.terminal : found.port;
        return name ? `${name}(${code})` : `${city.cityKo}(${code})`;
      }
    }
    
    return code;
  }


  // 검색 리스트 중에 하나 선택 시 일정 상세 데이터 입력 (대분류용)
  
  

  const [editMealRowIndex, setEditMealRowIndex] = useState<number>(-1);

  // 일정표 추가, 삭제, 이동 함수
  const addDay = (idx:number) => {
    const copy = [...scheduleList];
    const target = copy[selectedScheduleIndex];
    if (!target || !target.scheduleDetailData) return;
    target.scheduleDetailData.splice(idx + 1, 0, createEmptyDay());
    setScheduleList(copy);
  };
  const deleteDay = (idx:number) => {
    const copy = [...scheduleList];
    const target = copy[selectedScheduleIndex];
    if (!target || !target.scheduleDetailData) return;
    if (target.scheduleDetailData.length > 1) {
      target.scheduleDetailData.splice(idx, 1);
      setScheduleList(copy);
    } else {
      alert('마지막 1일은 삭제할 수 없습니다.');
    }
  };
  const moveDayUp = (idx:number) => {
    if (idx > 0) {
      const copy = [...scheduleList];
      const target = copy[selectedScheduleIndex];
      if (!target || !target.scheduleDetailData) return;
      const tmp = target.scheduleDetailData[idx];
      target.scheduleDetailData[idx] = target.scheduleDetailData[idx - 1];
      target.scheduleDetailData[idx - 1] = tmp;
      setScheduleList(copy);
    } else {
      alert('맨 위 입니다.')
    }
  };
  const moveDayDown = (idx:number) => {
    const copy = [...scheduleList];
    const target = copy[selectedScheduleIndex];
    if (!target || !target.scheduleDetailData) return;
    if (idx < target.scheduleDetailData.length - 1) {
      const tmp = target.scheduleDetailData[idx];
      target.scheduleDetailData[idx] = target.scheduleDetailData[idx + 1];
      target.scheduleDetailData[idx + 1] = tmp;
      setScheduleList(copy);
    } else {
      alert('맨 아래 입니다.')
    }
  };


  // 유틸 함수: 출발-도착 시간으로 소요시간 계산
  function getFlightDuration(departTime: any, arriveTime: any) {
    if (!departTime || !arriveTime) return '';
    const depH = parseInt(departTime.slice(0,2), 10);
    const depM = parseInt(departTime.slice(2,4), 10);
    const arrH = parseInt(arriveTime.slice(0,2), 10);
    const arrM = parseInt(arriveTime.slice(2,4), 10);
    let min = (arrH*60+arrM) - (depH*60+depM);
    if (min < 0) min += 24*60;
    const h = Math.floor(min/60);
    const m = min%60;
    return `${h.toString().padStart(2,'0')}시간 ${m.toString().padStart(2,'0')}분`;
  }







  return (
    <div className='modal-addinput'>

    

      {/* 스케줄 ------------------------------------------------------------------------------------------------ */}

      <div className="schedule-layout-container">
        <div className="schedule-layout-left">
          <div className="schedule-resort_detail_mx__section">
            <div className="schedule-resort_detail_schedule_header__wrapper">
              <span className="schedule-header__main">추천 여행일정표</span>
              <div className="schedule-header__tabs">
                {
                  scheduleList.map((schedule, scheduleIndex) => {
                    // 첫 번째 날짜에서 항공편 정보 추출
                    const firstDay = schedule.scheduleDetailData && schedule.scheduleDetailData.length > 0 
                      ? schedule.scheduleDetailData[0] 
                      : null;
                    const airlineItem = firstDay?.scheduleDetail?.find((item: any) => item.sort === 'airline' && item.airlineData);
                    
                    if (!airlineItem || !airlineItem.airlineData) {
                      // 항공편 정보가 없는 경우
                    return (
                      <div
                        key={scheduleIndex}
                          className={`schedule-flight__item__wrapper ${selectedScheduleIndex === scheduleIndex ? 'schedule-flight__item__wrapper--active' : ''}`}
                          onClick={() => setSelectedScheduleIndex(scheduleIndex)}
                        >
                          <div className="schedule-airline__wrapper">
                            <span>항공편없음</span>
                            </div>
                        </div>
                      );
                        }

                    const airlineData = airlineItem.airlineData;
                    const airlineWord = airlineData.airlineCode?.slice(0, 2) || '';
                    const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                    const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                    return (
                      <div
                        key={scheduleIndex}
                        className={`schedule-flight__item__wrapper ${selectedScheduleIndex === scheduleIndex ? 'schedule-flight__item__wrapper--active' : ''}`}
                        onClick={() => setSelectedScheduleIndex(scheduleIndex)}
                      >
                        <div className="schedule-airline__wrapper">
                          {airlineImage && <img src={airlineImage} alt="airline" />}
                          <span>{airlineData.airlineName || '-'}</span>
                      </div>
                        <div className="schedule-flight__schedule__wrapper">
                          <div className="schedule-flight__schedule_row">
                            <span>{getCityNameByCode(airlineData.depart)}</span>
                            <span>출발</span>
                            <span>({airlineData.departTime?.slice(0, 2) || ''}:{airlineData.departTime?.slice(2, 4) || ''})</span>
                            <span>-</span>
                            <span>{getCityNameByCode(airlineData.arrive)}</span>
                            <span>도착</span>
                            <span>({airlineData.arriveTime?.slice(0, 2) || ''}:{airlineData.arriveTime?.slice(2, 4) || ''})</span>
                          </div>
                        </div>
                        <div className="schedule-flight__fare-text">
                          <span className="schedule-fare-label">{schedule.airlineData.sort === 'direct' ? '직항' : '경유'}</span>
                          <span className="schedule-fare-amount">{airlineData.airlineCode || ''}</span>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            
            <div className="schedule-schedule__tables__wrapper">
              {
                scheduleList.map((schedule, scheduleIndex) => {
                  return (
                    <div key={scheduleIndex}>
                      { selectedScheduleIndex === scheduleIndex && (() => {
                        // 사용된 cityInfoPerDay 인덱스 추적
                        const usedCityIndices = new Set<number>();
                        // 도시명 -> cityInfoPerDay의 cityName 매핑 (첫 등장 시)
                        const cityNameMap = new Map<string, string>();
                        
                        return schedule.scheduleDetailData.map((dayItem, dayIndex) => {
                          // 호텔 정보 location 기반 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
                          let hotelNameForDay: string | undefined = undefined;
                          let hotelLevelForDay: string | undefined = undefined;
                          
                          // hotelInfoPerDay만 있을 때 (휴양지 경로)
                          if (props.hotelInfoPerDay && !props.cityInfoPerDay) {
                            const hotelInfo = props.hotelInfoPerDay.find((info: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                              info.dayIndex === dayIndex
                            );
                            if (hotelInfo) {
                              hotelNameForDay = hotelInfo.hotelName;
                              hotelLevelForDay = hotelInfo.hotelLevel;
                            } else {
                              // hotelInfoPerDay에 해당 dayIndex가 없으면 이전 날짜의 호텔 정보 사용
                              // 같은 호텔이 여러 박인 경우 이전 박의 호텔 정보를 그대로 사용
                              for (let prevDay = dayIndex - 1; prevDay >= 0; prevDay--) {
                                const prevHotelInfo = props.hotelInfoPerDay.find((info: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                                  info.dayIndex === prevDay
                                );
                                if (prevHotelInfo) {
                                  // 하이픈이 없는 경우에만 이전 호텔 정보 사용 (체크아웃/체크인 날이 아닌 경우)
                                  if (!prevHotelInfo.hotelName.includes(' - ')) {
                                    hotelNameForDay = prevHotelInfo.hotelName;
                                    hotelLevelForDay = prevHotelInfo.hotelLevel;
                                    break;
                                  }
                                }
                              }
                            }
                          }
                          
                          // 유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때
                          if (props.hotelInfoPerDay && props.cityInfoPerDay && dayItem.scheduleDetail && Array.isArray(dayItem.scheduleDetail)) {
                            // scheduleDetail 배열에서 location 값을 찾기
                            for (const detail of dayItem.scheduleDetail) {
                              if (detail.location && typeof detail.location === 'string') {
                                const location = detail.location.trim();
                                // location에서 도시명만 추출 (예: "2일차 - 루체른" -> "루체른")
                                const locationParts = location.split('-').map((part: string) => part.trim());
                                const locationCityName = locationParts[locationParts.length - 1] || location;
                                
                                // 이미 매핑된 도시명인지 확인
                                let matchedCityName: string | undefined = undefined;
                                if (cityNameMap.has(locationCityName)) {
                                  matchedCityName = cityNameMap.get(locationCityName);
                                } else {
                                  // 첫 등장인 경우, cityInfoPerDay에서 순차적으로 찾기 (사용되지 않은 항목 중)
                                  const matchedCity = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                                    !usedCityIndices.has(idx) &&
                                    (locationCityName === cityInfo.cityName || 
                                     location.includes(cityInfo.cityName) || 
                                     cityInfo.cityName.includes(locationCityName))
                                  );
                                  if (matchedCity) {
                                    const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                                      cityInfo.dayIndex === matchedCity.dayIndex && cityInfo.cityName === matchedCity.cityName
                                    );
                                    if (matchedIndex !== -1) {
                                      usedCityIndices.add(matchedIndex);
                                      cityNameMap.set(locationCityName, matchedCity.cityName);
                                      matchedCityName = matchedCity.cityName;
                                    }
                                  }
                                }
                                
                                if (matchedCityName) {
                                  // 매칭된 도시명으로 cityInfoPerDay에서 dayIndex 찾기
                                  const matchedCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }) => 
                                    cityInfo.cityName === matchedCityName
                                  );
                                  if (matchedCityInfo) {
                                    // 찾은 도시의 dayIndex를 사용하여 hotelInfoPerDay에서 호텔 정보 찾기
                                    const matchedHotel = props.hotelInfoPerDay.find((hotelInfo: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                                      hotelInfo.dayIndex === matchedCityInfo.dayIndex
                                    );
                                    if (matchedHotel) {
                                      hotelNameForDay = matchedHotel.hotelName;
                                      hotelLevelForDay = matchedHotel.hotelLevel;
                                      break;
                                    }
                                  }
                                }
                              }
                            }
                          }
                          
                          return (
                            <div className="schedule-schedule__table__wrapper" key={dayIndex} id={`schedule-day-${dayIndex}`}>
                              <div className="schedule-schedule__header">
                                <div className="schedule-schedule__header-inner">
                                  <span className="schedule-main__text">{dayIndex +1} DAY</span>
                                </div>
                              </div>
                              <div className="schedule-schedule__main__wrapper">
                                { (dayItem.scheduleDetail && dayItem.scheduleDetail.length > 0)
                                  &&
                                  dayItem.scheduleDetail.map((loctionItem:any, locationIndex:any) => (
                                      <div className="schedule-schedule__element__wrapper" key={locationIndex}>
                                        <div className="schedule-schedule__element__header__wrapper">
                                          <div className="schedule-schedule__location__wrapper">
                                            {loctionItem.isViewLocation !== false && (
                                            <div className={`${loctionItem.locationIcon === 'dot' ? 'schedule-location-bluedot__wrapper' : `schedule-location__absolute__wrapper 
                                            ${loctionItem.sort === 'airline' || loctionItem.sort === 'train' || loctionItem.sort === 'bus' || loctionItem.sort === 'ship' ? 'traffic-wrapper' : ''}`}`}>
                                              <div className="schedule-location__icon-relative">
                                                <div
                                                  className="schedule-location__icon-button"
                                                >
                                                   {(loctionItem.locationIcon || loctionItem.st) === 'airline' ? (
                                                    <span style={{color: '#ff6b6b', fontSize: '30px', fontWeight: 'bold'}}>✈</span>
                                                  ) : (loctionItem.locationIcon || loctionItem.st) === 'train' ? (
                                                    <img src={trainIcon} alt="train" style={{width: '24px', height: '24px', objectFit: 'contain'}}/>
                                                  ) : (loctionItem.locationIcon || loctionItem.st) === 'bus' ? (
                                                    <img src={busIcon} alt="bus" style={{width: '24px', height: '24px', objectFit: 'contain'}}/>
                                                  ) : (loctionItem.locationIcon || loctionItem.st) === 'ship' ? (
                                                    <img src={shipIcon} alt="ship" style={{width: '24px', height: '24px', objectFit: 'contain'}}/>
                                                  ) : loctionItem.locationIcon === 'dot' ? (
                                                    <GoDotFill className="schedule-white-dot__icon"/>
                                                  ) : loctionItem.locationIcon === 'black' ? (
                                                    <div className="schedule-absolute__wrapper">
                                                      <GoDotFill className="schedule-dot__icon" fontSize={16}/>
                                                    </div>
                                                  ) : (
                                                    <img src={location1Icon} alt="location" style={{width: '40px', height: '40px', objectFit: 'contain'}}/>
                                                  )}
                                                </div>
                                                
                                              </div>
                                            </div>
                                            )}
                                            <div className="schedule-location__row">
                                              {(loctionItem.sort !== 'airline' && loctionItem.sort !== 'train' && loctionItem.sort !== 'bus' && loctionItem.sort !== 'ship') &&
                                                <>
                                                  {loctionItem.isViewLocation !== false && (
                                                    <>
                                                      <span
                                                        className="schedule-location__name"
                                                      >
                                                        {loctionItem.location || ''}
                                                      </span>
                                                    </>
                                                  )}
                                                </>
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        {/* locationContent 표시 영역 */}
                                        {loctionItem.isUseMainContent && (
                                          <div className="schedule-location__content-wrapper">
                                            <span
                                              className="schedule-location__content"
                                            >
                                              {loctionItem.mainContent || ''}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {loctionItem.sort === 'airline' && loctionItem.airlineData ? (
                                          // 첨부 이미지 스타일의 항공편 정보 UI
                                          <div className="schedule__element__wrapper">
                                          <div className="schedule-flight__schedule__board__wrapper">
                                            <div className="schedule-flight__schedule__board">
                                                {loctionItem.airlineData && loctionItem.sort === 'airline' ? (
                                                // 항공편 표시 (직항/경유 구분 없이)
                                                <>
                                                  <div className="schedule-flight__info__wrapper">
                                                    {(() => {
                                                      const airlineCode = loctionItem.airlineData?.airlineCode?.slice(0, 2);
                                                      try {
                                                        return <img src={require(`../airlineLogos/${loctionItem.airlineData?.airlineCode}.png`)} alt="항공사로고" />;
                                                      } catch {
                                                        return null;
                                                      }
                                                    })()}
                                                    <span>{loctionItem.airlineData?.airlineName || '-'}</span>
                                                    <span style={{marginLeft:'5px'}}>{loctionItem.airlineData?.airlineCode}</span>
                                                    {loctionItem.airlineData?.addDay === 'true' && (
                                                      <span style={{color:'#ff6b6b', fontWeight:'bold'}}>+1D</span>
                                                    )}
                                                  </div>
                                                  <div className="schedule-flight__time__wrapper">
                                                    <span className="schedule-flight__time">{getFlightDuration(loctionItem.airlineData?.departTime, loctionItem.airlineData?.arriveTime)}</span>
                                                    <div className="schedule-depart__info">
                                                      <div />
                                                      <span className="schedule-time__text">{loctionItem.airlineData?.departTime?.slice(0,2) + ':' + loctionItem.airlineData?.departTime?.slice(2,4)}</span>
                                                      <span className="schedule-airport__text">{getCityNameByCode(loctionItem.airlineData?.depart)} 출발</span>
                                                    </div>
                                                    <div className="schedule-arrive__info">
                                                      <div />
                                                      <span className="schedule-time__text">{loctionItem.airlineData?.arriveTime?.slice(0,2) + ':' + loctionItem.airlineData?.arriveTime?.slice(2,4)}</span>
                                                      <span className="schedule-airport__text">{getCityNameByCode(loctionItem.airlineData?.arrive)} 도착</span>
                                                    </div>
                                                  </div>
                                                </>
                                              ) : (
                                                // 직항 항공편: 기존 표시 방식
                                                <>
                                                  <div className="schedule-flight__info__wrapper">
                                                    {(() => {
                                                      const airlineCode = loctionItem.airlineData?.airlineCode?.slice(0, 2);
                                                      try {
                                                        return <img src={require(`../airlineLogos/${airlineCode}.png`)} alt="항공사로고" />;
                                                      } catch {
                                                        return null;
                                                      }
                                                    })()}
                                                    <span>{loctionItem.airlineData?.airlineName || '-'}</span>
                                                    <span style={{marginLeft:'10px'}}>{loctionItem.airlineData?.airlineCode}</span>
                                                    {loctionItem.airlineData?.addDay === 'true' && (
                                                      <span style={{marginLeft:'10px', color:'#ff6b6b', fontWeight:'bold'}}>+1D</span>
                                                    )}
                                                  </div>
                                                  <div className="schedule-flight__time__wrapper">
                                                    <span className="schedule-flight__time">{getFlightDuration(loctionItem.airlineData?.departTime, loctionItem.airlineData?.arriveTime)}</span>
                                                    <div className="schedule-depart__info">
                                                      <div />
                                                      <span className="schedule-time__text">{loctionItem.airlineData?.departTime?.slice(0,2) + ':' + loctionItem.airlineData?.departTime?.slice(2,4)}</span>
                                                      <span className="schedule-airport__text">{getCityNameByCode(loctionItem.airlineData?.depart)} 출발</span>
                                                    </div>
                                                    <div className="schedule-arrive__info">
                                                      <div />
                                                      <span className="schedule-time__text">{loctionItem.airlineData?.arriveTime?.slice(0,2) + ':' + loctionItem.airlineData?.arriveTime?.slice(2,4)}</span>
                                                      <span className="schedule-airport__text">{getCityNameByCode(loctionItem.airlineData?.arrive)} 도착</span>
                                                    </div>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        ) : null}
                                        {/* 기차편 렌더링 */}
                                        {loctionItem.sort === 'train' && loctionItem.trainData ? (
                                          <div className="schedule__element__wrapper">
                                            <div className="schedule-flight__schedule__board__wrapper">
                                              <div className="schedule-flight__schedule__board">
                                                <div className="schedule-flight__info__wrapper">
                                                  <span style={{fontSize:'16px', marginRight:'10px'}}>🚂</span>
                                                  <span>{loctionItem.trainData?.trainName || '-'}</span>
                                                  <span style={{marginLeft:'10px'}}>{loctionItem.trainData?.trainCode || '-'}</span>
                                                  {loctionItem.trainData?.addDay === 'true' && (
                                                    <span style={{marginLeft:'10px', color:'#ff6b6b', fontWeight:'bold'}}>+1D</span>
                                                  )}
                                                </div>
                                                <div className="schedule-flight__time__wrapper">
                                                  <span className="schedule-flight__time">{getFlightDuration(loctionItem.trainData?.departTime, loctionItem.trainData?.arriveTime)}</span>
                                                  <div className="schedule-depart__info">
                                                    <div />
                                                    <span className="schedule-time__text">{loctionItem.trainData?.departTime?.slice(0,2) + ':' + loctionItem.trainData?.departTime?.slice(2,4)}</span>
                                                    <span className="schedule-airport__text">{getCityNameByTrafficCode(loctionItem.trainData?.depart, 'train')} 출발</span>
                                                  </div>
                                                  <div className="schedule-arrive__info">
                                                    <div />
                                                    <span className="schedule-time__text">{loctionItem.trainData?.arriveTime?.slice(0,2) + ':' + loctionItem.trainData?.arriveTime?.slice(2,4)}</span>
                                                    <span className="schedule-airport__text">{getCityNameByTrafficCode(loctionItem.trainData?.arrive, 'train')} 도착</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : null}
                                        {/* 버스편 렌더링 */}
                                        {loctionItem.sort === 'bus' && loctionItem.busData ? (
                                          <div className="schedule__element__wrapper">
                                            <div className="schedule-flight__schedule__board__wrapper">
                                              <div className="schedule-flight__schedule__board">
                                                <div className="schedule-flight__info__wrapper">
                                                  <span style={{fontSize:'16px', marginRight:'10px'}}>🚌</span>
                                                  <span>{loctionItem.busData?.busName || '-'}</span>
                                                  <span style={{marginLeft:'10px'}}>{loctionItem.busData?.busCode || '-'}</span>
                                                  {loctionItem.busData?.addDay === 'true' && (
                                                    <span style={{marginLeft:'10px', color:'#ff6b6b', fontWeight:'bold'}}>+1D</span>
                                                  )}
                                                </div>
                                                <div className="schedule-flight__time__wrapper">
                                                  <span className="schedule-flight__time">{getFlightDuration(loctionItem.busData?.departTime, loctionItem.busData?.arriveTime)}</span>
                                                  <div className="schedule-depart__info">
                                                    <div />
                                                    <span className="schedule-time__text">{loctionItem.busData?.departTime?.slice(0,2) + ':' + loctionItem.busData?.departTime?.slice(2,4)}</span>
                                                    <span className="schedule-airport__text">{getCityNameByTrafficCode(loctionItem.busData?.depart, 'bus')} 출발</span>
                                                  </div>
                                                  <div className="schedule-arrive__info">
                                                    <div />
                                                    <span className="schedule-time__text">{loctionItem.busData?.arriveTime?.slice(0,2) + ':' + loctionItem.busData?.arriveTime?.slice(2,4)}</span>
                                                    <span className="schedule-airport__text">{getCityNameByTrafficCode(loctionItem.busData?.arrive, 'bus')} 도착</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : null}
                                        {/* 선박편 렌더링 */}
                                        {loctionItem.sort === 'ship' && loctionItem.shipData ? (
                                          <div className="schedule__element__wrapper">
                                            <div className="schedule-flight__schedule__board__wrapper">
                                              <div className="schedule-flight__schedule__board">
                                                <div className="schedule-flight__info__wrapper">
                                                  <span style={{fontSize:'16px', marginRight:'10px'}}>🚢</span>
                                                  <span>{loctionItem.shipData?.shipName || '-'}</span>
                                                  <span style={{marginLeft:'10px'}}>{loctionItem.shipData?.shipCode || '-'}</span>
                                                  {loctionItem.shipData?.addDay === 'true' && (
                                                    <span style={{marginLeft:'10px', color:'#ff6b6b', fontWeight:'bold'}}>+1D</span>
                                                  )}
                                                </div>
                                                <div className="schedule-flight__time__wrapper">
                                                  <span className="schedule-flight__time">{getFlightDuration(loctionItem.shipData?.departTime, loctionItem.shipData?.arriveTime)}</span>
                                                  <div className="schedule-depart__info">
                                                    <div />
                                                    <span className="schedule-time__text">{loctionItem.shipData?.departTime?.slice(0,2) + ':' + loctionItem.shipData?.departTime?.slice(2,4)}</span>
                                                    <span className="schedule-airport__text">{getCityNameByTrafficCode(loctionItem.shipData?.depart, 'ship')} 출발</span>
                                                  </div>
                                                  <div className="schedule-arrive__info">
                                                    <div />
                                                    <span className="schedule-time__text">{loctionItem.shipData?.arriveTime?.slice(0,2) + ':' + loctionItem.shipData?.arriveTime?.slice(2,4)}</span>
                                                    <span className="schedule-airport__text">{getCityNameByTrafficCode(loctionItem.shipData?.arrive, 'ship')} 도착</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : null}
                                        {loctionItem.sort === 'location' ? (
                                          // location 타입일 때의 기존 UI
                                          loctionItem.locationDetail.map((locationDetailItem:any, locationDetailIndex:number)=>{
                                            return (
                                              <div key={locationDetailIndex} className="schedule-schedule__sub_element__wrapper">
                                                <div className="schedule-schedule__element__subTitle__wrapper">
                                                  <div className="schedule-schedule__element__subTitle">
                                                    <div className="schedule-absolute__wrapper">
                                                      <div className="schedule-dot__icon" />
                                                    </div>
                                                    <div className="schedule-schedule__text__wrapper">
                                                      <span>{locationDetailItem.subLocation ? locationDetailItem.subLocation.replace(/^\[|\]$/g, '') : ''}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                {/* isUseContent가 true인 경우 subLocationContent 표시 */}
                                                {locationDetailItem.isUseContent && locationDetailItem.subLocationContent && (
                                                      <div className="schedule-subLocationContent__wrapper">
                                                        <div 
                                                          className="schedule-subLocationContent__text"
                                                          dangerouslySetInnerHTML={{__html: locationDetailItem.subLocationContent}}
                                                        />
                                                      </div>
                                                )}
                                                {
                                                  locationDetailItem.subLocationDetail.map((subDetailBoxItem:any, subDetailBoxIndex:number)=>{
                                                    const shouldShowDivider = subDetailBoxIndex > 0;
                                                    return (
                                                      <div key={subDetailBoxIndex}>
                                                        {shouldShowDivider && (
                                                              <div className="schedule-subDetail__divider"></div>
                                                        )}
                                                          <div className="schedule-schedule__element__main__wrapper">
                                                              <div className="schedule-table__wrapper">
                                                                <div className="schedule-table__header">
                                                              <span>{subDetailBoxItem.locationTitle}</span>
                                                            </div>
                                                                <div className="schedule-table__main"
                                                              dangerouslySetInnerHTML={{__html: subDetailBoxItem.locationContent}}
                                                            />                                                
                                                          </div>
                                                              <div className="schedule-image__wrapper">
                                                                <div
                                                                  className={
                                                                    subDetailBoxItem.postImages && subDetailBoxItem.postImages.length === 2
                                                                      ? 'schedule-image__list schedule-image__list--two'
                                                                      : 'schedule-image__list'
                                                                  }
                                                                >
                                                              {subDetailBoxItem.postImages && subDetailBoxItem.postImages.length > 0 ? (
                                                                subDetailBoxItem.postImages.slice(0, 3).map((imgName: string, imgIdx: number) => (
                                                                  <img
                                                                    key={imgIdx}
                                                                      className="schedule-image__item"
                                                                    src={`${AdminURL}/images/scheduledetailboximages/${imgName}`}
                                                                    onError={e => { e.currentTarget.src = ''; e.currentTarget.alt = '이미지가 없습니다.'; }}
                                                                  />
                                                                ))
                                                              ) : (
                                                                <span></span>
                                                              )}
                                                        </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )
                                                  })
                                                }
                                              </div>
                                            )
                                          })
                                        ) : null}
                                      </div>
                                    ))
                                  }
                              </div>
                              <div className="schedule-additional__schedule__wrapper">
                                <div className="schedule-index__wrapper">
                                  <span>식사</span>
                                </div>
                                <div className="schedule-additional__schedule__wrapper__textbox">
                                  <div className="schedule-meal__info__wrapper">
                                    <div className="schedule-meal__info__wrapper__text">
                                      <span>[조식]</span>
                                      <span className="schedule-meal__value">{dayItem.breakfast || '없음'}</span>
                                    </div>
                                    <div className="schedule-meal__info__wrapper__text">
                                      <span>[중식]</span>
                                      <span className="schedule-meal__value">{dayItem.lunch || '없음'}</span>
                                    </div>
                                    <div className="schedule-meal__info__wrapper__text">
                                      <span>[석식]</span>
                                      <span className="schedule-meal__value">{dayItem.dinner || '없음'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="schedule-additional__schedule__wrapper">
                                <div className="schedule-index__wrapper">
                                  {/* 호텔 아이콘 대체 가능 */}
                                  <span>{props.cityInfoPerDay && !props.hotelInfoPerDay ? '도시' : '호텔'}</span>
                                </div>
                                <div className="schedule-additional__schedule__wrapper__textbox">
                                  <div className="schedule-additional__info__wrapper">
                                      <p>{hotelNameForDay || ''}</p>
                                    {(!props.cityInfoPerDay || props.hotelInfoPerDay) && hotelNameForDay && (
                                      <div className="schedule-additional__rating__wrapper">
                                        <RatingBoard ratingSize={16} rating={parseInt(hotelLevelForDay || dayItem.score) || 0} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        });
                        })()}
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
        
      </div>

      {/* 플로팅 박스 - 일정 요약 */}
      {!props.hideFloatingBox && (
      <div className="schedule-floating-box" style={{ width: isFloatingBoxExpanded ? '450px' : '100px' }}>
        <div className="schedule-floating-box-header">
          <div className="schedule-floating-box-header-buttons">
            {!isFloatingBoxExpanded ? (
              <button
                type="button"
                className="schedule-floating-box-header-btn"
                onClick={() => {
                  setIsFloatingBoxExpanded(true);
                }}
              >
                펼쳐보기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="schedule-floating-box-header-btn"
                  onClick={() => {
                    setIsFloatingBoxExpanded(false);
                  }}
                >
                  간단히보기
                </button>
              <button
                type="button"
                className="schedule-floating-box-header-btn"
                onClick={() => {
                  // 모든 day 인덱스를 expandedLocationDays에 추가
                  const allDayIndices = new Set<number>();
                  scheduleList[selectedScheduleIndex]?.scheduleDetailData?.forEach((_: any, idx: number) => {
                    allDayIndices.add(idx);
                  });
                  setExpandedLocationDays(allDayIndices);
                }}
              >
                상세모두보기
              </button>
                <button
                  type="button"
                  className="schedule-floating-box-header-btn"
                  onClick={() => {
                    // 모든 day 닫기
                    setExpandedLocationDays(new Set());
                  }}
                >
                  상세모두닫기
                </button>
              </>
            )}
          </div>
        </div>
        {(() => {
          // 사용된 cityInfoPerDay 인덱스 추적
          const usedCityIndices = new Set<number>();
          // 도시명 -> cityInfoPerDay의 cityName 매핑 (첫 등장 시)
          const cityNameMap = new Map<string, string>();
          // 이전 day의 호텔 정보 및 도시명 저장 (같은 도시가 연속으로 나올 때 사용)
          const prevDayInfo = new Map<number, { cityName: string; hotelName: string; hotelLevel: string }>();
          
          const scheduleData = scheduleList[selectedScheduleIndex]?.scheduleDetailData || [];
          
          const dayElements = scheduleData.map((dayItem: any, dayIndex: number) => {
            // 일정 데이터의 location 값에서 도시명 추출 (여러 도시를 배열로 저장)
            const cityNamesForDay: string[] = [];
            // 호텔 정보 location 기반 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
            let hotelNameForDay: string | undefined = undefined;
            let hotelLevelForDay: string | undefined = undefined;
            
            if (props.cityInfoPerDay && dayItem.scheduleDetail && Array.isArray(dayItem.scheduleDetail)) {
              const cityInfoPerDay = props.cityInfoPerDay; // 변수에 할당하여 TypeScript 오류 방지
              // scheduleDetail 배열에서 location 값을 찾기 (모든 location을 순회)
              for (const detail of dayItem.scheduleDetail) {
                if (detail.location && typeof detail.location === 'string' && detail.location.trim()) {
                  const location = detail.location.trim();
                  // location에서 도시명만 추출 (예: "2일차 - 루체른" -> "루체른")
                  const locationParts = location.split('-').map((part: string) => part.trim());
                  const locationCityName = locationParts[locationParts.length - 1] || location;
                  
                  // 이미 매핑된 도시명인지 확인
                  let shouldUseMappedCity = false;
                  let matchedCityName: string | undefined = undefined;
                  
                  if (cityNameMap.has(locationCityName)) {
                    const mappedCityName = cityNameMap.get(locationCityName);
                    if (mappedCityName) {
                      // 매핑된 도시명이 cityInfoPerDay에서 사용되지 않은 항목인지 확인
                      const mappedCityInfo = cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                        cityInfo.cityName === mappedCityName && !usedCityIndices.has(idx)
                      );
                      // 사용되지 않은 도시만 재사용 (같은 도시가 여러 박인 경우)
                      if (mappedCityInfo) {
                        shouldUseMappedCity = true;
                        matchedCityName = mappedCityName;
                        // 사용된 인덱스 추가
                        const matchedIndex = cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                          cityInfo.dayIndex === mappedCityInfo.dayIndex && cityInfo.cityName === mappedCityInfo.cityName
                        );
                        if (matchedIndex !== -1) {
                          usedCityIndices.add(matchedIndex);
                        }
                      }
                    }
                  }
                  
                  if (!shouldUseMappedCity) {
                    // 첫 등장인 경우, cityInfoPerDay에서 순차적으로 찾기 (사용되지 않은 항목 중)
                    // 정확한 매칭 우선 (locationCityName === cityInfo.cityName)
                    const exactMatch = cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                      !usedCityIndices.has(idx) &&
                      locationCityName === cityInfo.cityName
                    );
                    
                    if (exactMatch) {
                      const matchedIndex = cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                        cityInfo.dayIndex === exactMatch.dayIndex && cityInfo.cityName === exactMatch.cityName
                      );
                      if (matchedIndex !== -1) {
                        usedCityIndices.add(matchedIndex);
                        cityNameMap.set(locationCityName, exactMatch.cityName);
                        matchedCityName = exactMatch.cityName;
                      }
                    } else {
                      // 정확한 매칭이 없으면 부분 매칭 시도
                      const matchedCity = cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                        !usedCityIndices.has(idx) &&
                        (location.includes(cityInfo.cityName) || 
                         cityInfo.cityName.includes(locationCityName))
                      );
                      if (matchedCity) {
                        const matchedIndex = cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                          cityInfo.dayIndex === matchedCity.dayIndex && cityInfo.cityName === matchedCity.cityName
                        );
                        if (matchedIndex !== -1) {
                          usedCityIndices.add(matchedIndex);
                          cityNameMap.set(locationCityName, matchedCity.cityName);
                          matchedCityName = matchedCity.cityName;
                        }
                      }
                    }
                  }
                  
                  // 매칭된 도시명을 배열에 추가 (중복 제거)
                  if (matchedCityName && !cityNamesForDay.includes(matchedCityName)) {
                    cityNamesForDay.push(matchedCityName);
                  }
                  
                  // 호텔 정보 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
                  if (props.hotelInfoPerDay && matchedCityName && !hotelNameForDay) {
                    // 사용되지 않은 항목 중에서 해당 도시명을 가진 항목 찾기
                    const matchedCityInfo = cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                      cityInfo.cityName === matchedCityName && !usedCityIndices.has(idx)
                    );
                    if (matchedCityInfo) {
                      const matchedIndex = cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                        cityInfo.dayIndex === matchedCityInfo.dayIndex && cityInfo.cityName === matchedCityInfo.cityName
                      );
                      if (matchedIndex !== -1) {
                        const matchedHotel = props.hotelInfoPerDay.find((hotelInfo: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                          hotelInfo.dayIndex === matchedCityInfo.dayIndex
                        );
                        if (matchedHotel) {
                          hotelNameForDay = matchedHotel.hotelName;
                          hotelLevelForDay = matchedHotel.hotelLevel;
                          // 사용된 인덱스 추가
                          usedCityIndices.add(matchedIndex);
                        }
                      }
                    }
                  }
                }
              }
            }
            
            // hotelInfoPerDay만 있을 때 (휴양지 경로)
            if (props.hotelInfoPerDay && !props.cityInfoPerDay) {
              const hotelInfo = props.hotelInfoPerDay.find((info: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                info.dayIndex === dayIndex
              );
              if (hotelInfo) {
                hotelNameForDay = hotelInfo.hotelName;
                hotelLevelForDay = hotelInfo.hotelLevel;
              } else {
                // hotelInfoPerDay에 해당 dayIndex가 없으면 이전 날짜의 호텔 정보 사용
                for (let prevDay = dayIndex - 1; prevDay >= 0; prevDay--) {
                  const prevHotelInfo = props.hotelInfoPerDay.find((info: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                    info.dayIndex === prevDay
                  );
                  if (prevHotelInfo) {
                    // 하이픈이 없는 경우에만 이전 호텔 정보 사용 (체크아웃/체크인 날이 아닌 경우)
                    if (!prevHotelInfo.hotelName.includes(' - ')) {
                      hotelNameForDay = prevHotelInfo.hotelName;
                      hotelLevelForDay = prevHotelInfo.hotelLevel;
                      break;
                    }
                  }
                }
              }
            }
            
            // 해당 day의 location 정보 추출
            const locations: string[] = [];
            if (dayItem.scheduleDetail && Array.isArray(dayItem.scheduleDetail)) {
              dayItem.scheduleDetail.forEach((detail: any) => {
                if (detail.location && typeof detail.location === 'string' && detail.location.trim() && detail.isViewLocation !== false) {
                  const location = detail.location.trim();
                  if (location && !locations.includes(location)) {
                    locations.push(location);
                  }
                }
              });
            }
            
            // locations에서 cityInfoPerDay에 있는 도시명만 추출하여 표시
            const matchedCityNamesFromLocations: string[] = [];
            if (props.cityInfoPerDay && locations.length > 0) {
              const cityInfoPerDay = props.cityInfoPerDay; // 변수에 할당하여 TypeScript 오류 방지
              locations.forEach((location: string) => {
                const foundCityInfo = cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }) => {
                  if (cityInfo.cityName === location || location === cityInfo.cityName) {
                    return true;
                  }
                  const locationParts = location.split('-').map((part: string) => part.trim());
                  const locationCityName = locationParts[locationParts.length - 1] || location;
                  return cityInfo.cityName === locationCityName || locationCityName === cityInfo.cityName;
                });
                
                if (foundCityInfo && !matchedCityNamesFromLocations.includes(foundCityInfo.cityName)) {
                  matchedCityNamesFromLocations.push(foundCityInfo.cityName);
                }
              });
            }
            
            // cityNamesForDay와 matchedCityNamesFromLocations를 합쳐서 중복 제거
            const allCityNamesSet = new Set<string>();
            cityNamesForDay.forEach(city => allCityNamesSet.add(city));
            matchedCityNamesFromLocations.forEach(city => allCityNamesSet.add(city));
            const allCityNames = Array.from(allCityNamesSet);
            
            // cityNamesForDay 배열을 하이픈으로 연결
            const cityNameForDay = allCityNames.length > 0 ? allCityNames.join('-') : undefined;
            
            // 호텔 정보 매칭 (같은 도시가 여러 박인 경우, 각 박마다 호텔 정보 매칭)
            if (props.hotelInfoPerDay && props.cityInfoPerDay && cityNameForDay && !hotelNameForDay) {
              const cityInfoPerDay = props.cityInfoPerDay; // 변수에 할당하여 TypeScript 오류 방지
              // cityNameForDay에서 첫 번째 도시명 추출 (하이픈으로 연결된 경우)
              const firstCityName = cityNameForDay.split('-')[0];
              
              // 바로 앞의 날짜에 같은 도시가 있고 호텔 정보가 있으면 그대로 사용
              if (dayIndex > 0 && prevDayInfo.has(dayIndex - 1)) {
                const prevDayData = prevDayInfo.get(dayIndex - 1);
                if (prevDayData) {
                  const prevDayCityName = prevDayData.cityName.split('-')[0];
                  if (prevDayCityName === firstCityName && prevDayData.hotelName) {
                    hotelNameForDay = prevDayData.hotelName;
                    hotelLevelForDay = prevDayData.hotelLevel;
                  }
                }
              }
              
              // 앞의 날짜에서 찾지 못했으면 cityInfoPerDay에서 사용되지 않은 항목 찾기
              if (!hotelNameForDay) {
                const matchedCityInfo = cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                  cityInfo.cityName === firstCityName && !usedCityIndices.has(idx)
                );
                
                if (matchedCityInfo) {
                  const matchedHotel = props.hotelInfoPerDay.find((hotelInfo: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                    hotelInfo.dayIndex === matchedCityInfo.dayIndex
                  );
                  if (matchedHotel) {
                    hotelNameForDay = matchedHotel.hotelName;
                    hotelLevelForDay = matchedHotel.hotelLevel;
                    const matchedIndex = cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                      cityInfo.dayIndex === matchedCityInfo.dayIndex && cityInfo.cityName === matchedCityInfo.cityName
                    );
                    if (matchedIndex !== -1) {
                      usedCityIndices.add(matchedIndex);
                    }
                  }
                }
              }
            }
            
            // 현재 day의 정보를 저장 (다음 day에서 사용)
            if (cityNameForDay) {
              prevDayInfo.set(dayIndex, { 
                cityName: cityNameForDay, 
                hotelName: hotelNameForDay || '', 
                hotelLevel: hotelLevelForDay || '' 
              });
            }
          
            // 호텔 정보 (유럽 경로가 아닌 경우 또는 호텔 정보가 없는 경우)
            const displayHotelName = props.hotelInfoPerDay && props.cityInfoPerDay 
              ? (hotelNameForDay || '') 
              : (dayItem.hotel || '');
            const displayHotelLevel = props.hotelInfoPerDay && props.cityInfoPerDay 
              ? (hotelLevelForDay || dayItem.score || '') 
              : (dayItem.score || '');

            return (
              <div key={dayIndex} className="schedule-floating-box-item"
                onClick={() => {
                  // ScheduleRederBox에서 해당 day로 스크롤
                  const targetElement = document.getElementById(`schedule-day-${dayIndex}`);
                  if (targetElement) {
                    targetElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }
                }}
              >
                {isFloatingBoxExpanded ? (
                  <>
                    <div className="schedule-floating-box-row">
                      <div className="schedule-floating-box-day">
                        <span className="schedule-main__text">{dayIndex + 1} DAY</span>
                      </div>

                      <div className="schedule-floating-box-hotel">
                        <span className="schedule-floating-box-hotel-name">
                          {props.cityInfoPerDay
                            ? (cityNameForDay || '')
                            : (dayItem.hotel || '-')}
                        </span>
                      </div>

                      <div className="schedule-floating-box-buttons">
                        {locations.length > 0 && (
                          <button
                            type="button"
                            className="schedule-floating-box-btn"
                            title={expandedLocationDays.has(dayIndex) ? "상세정보 닫기" : "상세정보 열기"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLocationDays(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(dayIndex)) {
                                  newSet.delete(dayIndex);
                                } else {
                                  newSet.add(dayIndex);
                                }
                                return newSet;
                              });
                            }}
                          >
                            {expandedLocationDays.has(dayIndex) ? <IoIosArrowUp /> : <IoIosArrowDown />}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {locations.length > 0 && expandedLocationDays.has(dayIndex) && (
                      <div className="schedule-floating-box-locations">
                        {locations.map((location, locIndex) => (
                          <div key={locIndex} className="schedule-floating-box-location-item">
                            {location}
                          </div>
                        ))}
                        
                        {displayHotelName && (
                          <div className="schedule-floating-box-hotel-info">
                            <div className="schedule-floating-box-hotel-info-label">호텔</div>
                            <div className="schedule-floating-box-hotel-info-name">{displayHotelName}</div>
                            {displayHotelLevel && (
                              <div className="schedule-floating-box-hotel-info-rating">
                                <RatingBoard ratingSize={14} rating={parseInt(displayHotelLevel) || 0} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="schedule-floating-box-row">
                    <div className="schedule-floating-box-day">
                      <span className="schedule-main__text">{dayIndex + 1} DAY</span>
                    </div>
                  </div>
                )}
              </div>
            );
          });
          
          return dayElements;
        })()}
      </div>
      )}
    
           
     
      
    </div>     
  )
}
