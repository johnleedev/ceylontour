import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import './ScheduleRederBox.scss'
import { DropdownBox } from '../../boxs/DropdownBox';
import axios from 'axios';
import {AdminURL} from '../../MainURL';
import { format, formatDate } from 'date-fns';
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import RatingBoard from './RatingBoard';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { recoilExchangeRate, recoilScheduleInfo } from '../../RecoilStore';
import ScheduleTrafficAdd from './ScheduleTrafficAdd';
import { fetchScheduleDetailDataExternal } from './ScheduleDetailRedering';
import { GoDotFill } from "react-icons/go";
import { FaArrowsLeftRight } from "react-icons/fa6";
import airlineLogos, { KE, GA } from '../AirlineData';
import busIcon from '../images/common/bus.png';
import trainIcon from '../images/common/train.png';
import shipIcon from '../images/common/ship.png';
import location1Icon from '../images/common/location1.png';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";


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
      sort?: string,
      st?: string,
      isViewLocation:boolean,
      locationIcon?: string,
      location:string, 
      isUseMainContent:boolean,
      mainContent?: string,
      locationDetail:{
        subLocation:string, 
        isUseContent:boolean,
        subLocationContent:string, // HTML 문자열 (예: "<p>텍스트</p>")
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


export default function ScheduleRederCustom (props : any) {
	
  const [loading, setLoading] = useState<boolean>(true);


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
        if (useRecoil) {
          setScheduleListWithRecoil([defaultSchedule]);
        } else {
          setScheduleList([defaultSchedule]);
        }
      }
      
    } catch (error) {
      console.error('스케줄 데이터를 가져오는 중 오류 발생:', error);
      // 에러 발생 시에도 기본 구조 설정
      const defaultSchedule = {
        airlineData: { sort: '', airlineCode: [] },
        scheduleDetailData: [createEmptyDay()]
      };
      if (useRecoil) {
        setScheduleListWithRecoil([defaultSchedule]);
      } else {
        setScheduleList([defaultSchedule]);
      }
    } finally {
      // fetchScheduleDetailData가 완전히 끝난 후에만 로딩 해제
      setLoading(false);
    }
  };
  

  // 플로팅 버튼 관련 상태
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  // 각 day의 location 표시 여부 (열려있는 day 인덱스 Set)
  const [expandedLocationDays, setExpandedLocationDays] = useState<Set<number>>(new Set());
  // floating box 펼침 상태
  const [isFloatingBoxExpanded, setIsFloatingBoxExpanded] = useState<boolean>(false);

  // 스크롤 감지 함수
  const handleScroll = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // 버튼이 화면에서 사라졌을 때 플로팅 버튼 표시
      setShowFloatingButtons(rect.bottom < 0);
    }
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const handleScrollEvent = () => {
      handleScroll();
    };
    window.addEventListener('scroll', handleScrollEvent);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, []);


  // 국가, 도시, 항공코드, 랜드사, 적용패키지 -------------------------------------------------------------------------------------------------
  
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

  // 숫자 문자열을 콤마 포맷팅하는 헬퍼 함수
  const formatNumberWithCommas = (value: string | number | undefined | null): string => {
    if (!value) return '';
    const numStr = String(value).replace(/,/g, '');
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
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

  
  // 항공편
  const [airlineList, setAirlineList] = useState<any[]>([]);
  // 기차편
  const [trainList, setTrainList] = useState<any[]>([]);
  // 버스편
  const [busList, setBusList] = useState<any[]>([]);
  // 선박편
  const [shipList, setShipList] = useState<any[]>([]);
  
  // 항공편 데이터 (Sub1_Airline.tsx 참조)
  const fetchAirlineData = async (airportCode?: string) => {
    setIsLoadingAirline(true);
    try {
      const payload = airportCode ? { airportCode } : {};
      const res = await axios.post(`${AdminURL}/airline/getairlinedata`, payload);
      if (res.data && res.data !== false) {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        const copy = [...data];
        setAirlineList(copy);
      } else {
        setAirlineList([]);
      }
    } catch (e) {
      console.error("fetchAirlineData 에러:", e);
      setAirlineList([]);
    } finally {
      setIsLoadingAirline(false);
    }
  }
  
  // 항공 데이터 검색 (공항코드)
  const searchAirlineData = async (searchTerm: string) => {
    setIsLoadingAirline(true);
    try {
      const term = (searchTerm || '').trim();
      if (!term) {
        setAirlineList([]);
        return;
      }
      
      // 공항 코드인지 확인 (3자리 대문자)
      const isAirportCode = /^[A-Z]{3}$/.test(term);
      
      if (isAirportCode) {
        // 공항 코드로 검색
        const res = await axios.post(`${AdminURL}/airline/getairlinedata`, { airportCode: term });
        if (res.data && res.data !== false) {
          const data = Array.isArray(res.data) ? res.data : [res.data];
          // departDate를 배열로 변환 처리
          const processedData = data.map((item: any) => ({
            ...item,
            departDate: Array.isArray(item.departDate)
              ? item.departDate
              : safeJsonParse<string[]>(item.departDate, [])
          }));
          setAirlineList(processedData);
        } else {
          setAirlineList([]);
        }
      } else {
        // 도시명으로 검색하는 경우, 공항 코드로 변환 필요
        // 일단 빈 배열로 설정 (추후 도시명 검색 기능 추가 가능)
        setAirlineList([]);
      }
    } catch (e) {
      console.error("searchAirlineData 에러:", e);
      setAirlineList([]);
    } finally {
      setIsLoadingAirline(false);
    }
  }

  // 기차 데이터 검색 (도시명)
  const searchTrainData = async (searchTerm: string) => {
    setIsLoadingTrain(true);
    try {
      const term = (searchTerm || '').trim();
      if (!term) {
        setTrainList([]);
        return;
      }
      
      const res = await axios.post(`${AdminURL}/train/gettraindata`, { keyword: term });
      if (res.data && res.data !== false) {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        const processedData = data.map((item: any) => ({
          ...item,
          departDate: Array.isArray(item.departDate)
            ? item.departDate
            : safeJsonParse<string[]>(item.departDate, [])
        }));
        setTrainList(processedData);
      } else {
        setTrainList([]);
      }
    } catch (e) {
      console.error("searchTrainData 에러:", e);
      setTrainList([]);
    } finally {
      setIsLoadingTrain(false);
    }
  }

  // 버스 데이터 검색 (도시명)
  const searchBusData = async (searchTerm: string) => {
    setIsLoadingBus(true);
    try {
      const term = (searchTerm || '').trim();
      if (!term) {
        setBusList([]);
        return;
      }
      
      const res = await axios.post(`${AdminURL}/bus/getbusdata`, { keyword: term });
      if (res.data && res.data !== false) {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        const processedData = data.map((item: any) => ({
          ...item,
          departDate: Array.isArray(item.departDate)
            ? item.departDate
            : safeJsonParse<string[]>(item.departDate, [])
        }));
        setBusList(processedData);
      } else {
        setBusList([]);
      }
    } catch (e) {
      console.error("searchBusData 에러:", e);
      setBusList([]);
    } finally {
      setIsLoadingBus(false);
    }
  }

  // 선박 데이터 검색 (도시명)
  const searchShipData = async (searchTerm: string) => {
    setIsLoadingShip(true);
    try {
      const term = (searchTerm || '').trim();
      if (!term) {
        setShipList([]);
        return;
      }
      
      const res = await axios.post(`${AdminURL}/ship/getshipdata`, { keyword: term });
      if (res.data && res.data !== false) {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        const processedData = data.map((item: any) => ({
          ...item,
          departDate: Array.isArray(item.departDate)
            ? item.departDate
            : safeJsonParse<string[]>(item.departDate, [])
        }));
        setShipList(processedData);
      } else {
        setShipList([]);
      }
    } catch (e) {
      console.error("searchShipData 에러:", e);
      setShipList([]);
    } finally {
      setIsLoadingShip(false);
    }
  }

  // 원래 도시의 항공코드로 데이터 초기화
  const resetToOriginalAirportCode = async () => {
    if (originalAirportCode) {
      setIsLoadingAirline(true);
      try {
        await fetchAirlineData();
        setCurrentSearchAirportCode('');
        // 검색 입력 필드 초기화
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
        }
      } finally {
        setIsLoadingAirline(false);
      }
    }
  }



  // 포함사항, 불포함사항 체크박스
  interface SelectBoxIncludeNotInclueProps {
    text : string;
    useState: any;
    setUseSate: any;
  }

  const SelectBoxIncludeNotInclue : React.FC<SelectBoxIncludeNotInclueProps> = ({ text, useState, setUseSate }) => (
    <div className='etcCheckInput'>
      <input className="input" type="checkbox"
        checked={useState.includes(text)}
        onChange={()=>{
          const copy = [...useState];
          if (useState.includes(text)) {
            const result = copy.filter(e => e !== text);
            setUseSate(result);
          } else {
            copy.push(text); 
            setUseSate(copy);
          }
        }}
      />
      <p>{text}</p>
    </div>
  )


  // Helpers to create empty schedule structures
  const createEmptyDetail = () => ({
    id: 0,
    sort: '',
    st: '',
    locationIcon: '',
    location: '',
    isUseMainContent: false,
    mainContent: '',
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

  // Recoil에서 일정 데이터 가져오기 (useRecoil prop이 true일 때)
  const [recoilScheduleInfoValue, setRecoilScheduleInfo] = useRecoilState(recoilScheduleInfo);
  const useRecoil = props.useRecoil || false;
  
  // setScheduleList를 래핑하여 Recoil도 함께 업데이트
  const setScheduleListWithRecoil = useCallback((updater: any) => {
    if (useRecoil) {
      if (typeof updater === 'function') {
        setScheduleList((prev) => {
          const next = updater(prev);
          // Recoil도 업데이트
          if (next && next.length > 0) {
            setRecoilScheduleInfo(next[0]);
          }
          return next;
        });
      } else {
        setScheduleList(updater);
        // Recoil도 업데이트
        if (updater && updater.length > 0) {
          setRecoilScheduleInfo(updater[0]);
        }
      }
    } else {
      // Recoil을 사용하지 않으면 기존대로
      setScheduleList(updater);
    }
  }, [useRecoil, setRecoilScheduleInfo]);

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

  // 항공사명 매핑 함수
  const getAirlineName = (code: string): string => {
    const airlineNames: { [key: string]: string } = {
      'KE': '대한항공',
      'GA': '가루다항공',
      '5J': '세부퍼시픽',
      '5M': '사이팬에어',
      '7C': '제주항공',
      '8B': '비즈니스에어',
      'AA': '아메리칸항공',
      'AM': '아에로멕시코',
      'BX': '진에어',
      'CX': '캐세이퍼시픽',
      'D7': '에어아시아X',
      'EK': '에미레이트항공',
      'ET': '에티오피아항공',
      'HA': '하와이안항공',
      'JL': '일본항공',
      'LJ': '진에어',
      'MH': '말레이시아항공',
      'OZ': '아시아나항공',
      'PG': '방콕에어웨이즈',
      'PR': '필리핀항공',
      'QF': '퀀타스항공',
      'QR': '카타르항공',
      'SQ': '싱가포르항공',
      'TG': '타이항공',
      'TK': '터키항공',
      'TN': '에어타히티누이',
      'TW': '티웨이항공',
      'UA': '유나이티드항공',
      'VJ': '비제트스타퍼시픽',
      'VN': '베트남항공',
      'ZA': '스쿠트',
      'ZE': '이스타항공'
    };
    return airlineNames[code] || code;
  };

  // 항공사 로고 가져오기 함수
  const getAirlineLogo = (code: string) => {
    const logoMap: { [key: string]: any } = airlineLogos;
    return logoMap[code] || null;
  };

  const [locationSearchList, setLocationSearchList] = useState<any[]>([]);
  const [searchListDayOpenId, setSearchListDayOpenId] = useState<number|null>(null);
  const [searchListDetailOpenId, setSearchListDetailOpenId] = useState<number|null>(null);
  const [isLoadingAirline, setIsLoadingAirline] = useState(false);
  const [airlineModalOpen, setAirlineModalOpen] = useState<{dayIndex: number, locationIndex: number} | null>(null);
  const [currentSearchAirportCode, setCurrentSearchAirportCode] = useState('');
  const [originalAirportCode, setOriginalAirportCode] = useState(''); // 원래 도시의 항공코드 저장
  const searchInputRef = useRef<HTMLInputElement>(null); // 검색 입력 필드 참조
  
  // 기차/버스/선박 모달 관련 상태
  const [isLoadingTrain, setIsLoadingTrain] = useState(false);
  const [isLoadingBus, setIsLoadingBus] = useState(false);
  const [isLoadingShip, setIsLoadingShip] = useState(false);
  const [trainModalOpen, setTrainModalOpen] = useState<{dayIndex: number, locationIndex: number} | null>(null);
  const [busModalOpen, setBusModalOpen] = useState<{dayIndex: number, locationIndex: number} | null>(null);
  const [shipModalOpen, setShipModalOpen] = useState<{dayIndex: number, locationIndex: number} | null>(null);
  const [currentSearchTrainCity, setCurrentSearchTrainCity] = useState('');
  const [currentSearchBusCity, setCurrentSearchBusCity] = useState('');
  const [currentSearchShipCity, setCurrentSearchShipCity] = useState('');
  
  // 통합 교통편 모달 상태
  const [trafficModalOpen, setTrafficModalOpen] = useState<{dayIndex: number, locationIndex: number} | null>(null);
  const [selectedTrafficTab, setSelectedTrafficTab] = useState<'airline' | 'train' | 'bus' | 'ship'>('airline');
  const [searchModalKeyword, setSearchModalKeyword] = useState<string>('');
  // 아이콘 선택기 열림 상태 (키: `${dayIndex}-${locationIndex}`)
  const [iconSelectorOpen, setIconSelectorOpen] = useState<Record<string, boolean>>({});
  // 선택된 영역 상태 (외부에서 상세일정 아이템을 클릭했을 때 데이터를 추가할 위치)
  const [selectedLocation, setSelectedLocation] = useState<{dayIndex: number, locationIndex: number, locationDetailIndex?: number, tabType: '변경'} | null>(null);
  
  // 최신 selectedLocation 값을 참조하기 위한 ref
  const selectedLocationRef = useRef<{dayIndex: number, locationIndex: number, locationDetailIndex?: number, tabType: '변경'} | null>(null);
  
  // selectedLocation이 변경될 때마다 ref 업데이트
  React.useEffect(() => {
    selectedLocationRef.current = selectedLocation;
  }, [selectedLocation]);
  
  // locationDetailItem의 subLocationDetail을 변경하는 함수
  const handleLocationDetailItemChange = (item: any, dayIndex: number, locationIndex: number, locationDetailIndex: number) => {
    // 소분류는 바로 하나의 박스로 입력
    let postImages: string[] = [];
    if (Array.isArray(item.inputImage)) {
      postImages = item.inputImage.slice(0, 3);
    } else if (typeof item.inputImage === 'string') {
      try {
        const arr = JSON.parse(item.inputImage);
        postImages = Array.isArray(arr) ? arr.slice(0, 3) : [item.inputImage];
      } catch {
        postImages = [item.inputImage];
      }
    }
    
    const sortValue = item.sort || '';
    const subLocationValue = sortValue ? `[${sortValue}]` : '';
    
    const detailBoxItem = {
      id: item.id,
      postImages: postImages,
      locationTitle: item.productName,
      locationContent: item.detailNotice,
      locationDetailSort: ''
    };
    
    // 해당 DAY/LOCATION/LOCATIONDETAIL의 subLocationDetail 업데이트
    (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
      const next = [...prev];
      const schedule = next[selectedScheduleIndex];
      const day = schedule?.scheduleDetailData?.[dayIndex];
      const currentItem = day?.scheduleDetail?.[locationIndex];

      if (!schedule || !day || currentItem === undefined) return prev;

      const newScheduleDetail = [...day.scheduleDetail];
      const updatedItem = { ...currentItem };
      
      if (updatedItem.locationDetail && Array.isArray(updatedItem.locationDetail) && updatedItem.locationDetail[locationDetailIndex]) {
        const updatedLocationDetail = [...updatedItem.locationDetail];
        updatedLocationDetail[locationDetailIndex] = {
          ...updatedLocationDetail[locationDetailIndex],
          subLocation: subLocationValue,
          subLocationDetail: [detailBoxItem] as any
        };
        updatedItem.locationDetail = updatedLocationDetail;
      }
      
      newScheduleDetail[locationIndex] = updatedItem;

      const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
      const newScheduleDetailData = [...schedule.scheduleDetailData];
      newScheduleDetailData[dayIndex] = updatedDay;

      next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };

      return next;
    });
  };

  // 외부에서 상세일정 아이템을 추가하는 함수를 전역에 노출 (항상 존재하도록 설정)
  React.useEffect(() => {
    // 전역 함수를 항상 설정 (selectedLocation이 null이어도 함수는 존재)
    (window as any).__addDetailItemToSelectedLocation = (item: any) => {
      console.log('전역 함수 호출됨, item:', item);
      // ref를 통해 최신 selectedLocation 값 참조
      const currentSelectedLocation = selectedLocationRef.current;
      console.log('현재 선택된 영역 (ref):', currentSelectedLocation);
      if (!currentSelectedLocation) {
        console.warn('선택된 영역이 없습니다.');
        alert('먼저 일정표에서 "변경" 버튼을 클릭하여 추가할 위치를 선택해주세요.');
        return;
      }
      
      if (currentSelectedLocation.tabType === '변경' && currentSelectedLocation.locationDetailIndex !== undefined) {
        console.log('변경 버튼으로 인한 subLocationDetail 변경 실행');
        // locationDetailItem의 subLocationDetail을 변경하는 로직을 직접 구현
        let postImages: string[] = [];
        if (Array.isArray(item.inputImage)) {
          postImages = item.inputImage.slice(0, 3);
        } else if (typeof item.inputImage === 'string') {
          try {
            const arr = JSON.parse(item.inputImage);
            postImages = Array.isArray(arr) ? arr.slice(0, 3) : [item.inputImage];
          } catch {
            postImages = [item.inputImage];
          }
        }
        
        const sortValue = item.sort || '';
        const subLocationValue = sortValue ? `[${sortValue}]` : '';
        
        const detailBoxItem = {
          id: item.id,
          postImages: postImages,
          locationTitle: item.productName,
          locationContent: item.detailNotice,
          locationDetailSort: ''
        };
        
        // 해당 DAY/LOCATION/LOCATIONDETAIL의 subLocationDetail 업데이트
        setScheduleList(prev => {
          const next = [...prev];
          const schedule = next[selectedScheduleIndex];
          const day = schedule?.scheduleDetailData?.[currentSelectedLocation.dayIndex];
          const currentItem = day?.scheduleDetail?.[currentSelectedLocation.locationIndex];

          if (!schedule || !day || currentItem === undefined) return prev;

          const newScheduleDetail = [...day.scheduleDetail];
          const updatedItem = { ...currentItem };
          
          if (updatedItem.locationDetail && Array.isArray(updatedItem.locationDetail) && updatedItem.locationDetail[currentSelectedLocation.locationDetailIndex!]) {
            const updatedLocationDetail = [...updatedItem.locationDetail];
            updatedLocationDetail[currentSelectedLocation.locationDetailIndex!] = {
              ...updatedLocationDetail[currentSelectedLocation.locationDetailIndex!],
              subLocation: subLocationValue,
              subLocationDetail: [detailBoxItem] as any
            };
            updatedItem.locationDetail = updatedLocationDetail;
          }
          
          newScheduleDetail[currentSelectedLocation.locationIndex] = updatedItem;

          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
          const newScheduleDetailData = [...schedule.scheduleDetailData];
          newScheduleDetailData[currentSelectedLocation.dayIndex] = updatedDay;

          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };

          return next;
        });
      }
      // 추가 후 선택 해제
      setSelectedLocation(null);
    };
    console.log('전역 함수 설정 완료:', (window as any).__addDetailItemToSelectedLocation);
    
    return () => {
      // 컴포넌트 언마운트 시에만 삭제
      delete (window as any).__addDetailItemToSelectedLocation;
    };
  }, []); // 빈 dependency array - 컴포넌트 마운트 시 한 번만 설정
  



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


  function getCityNameByCode(code: string) {
    if (code === 'ICN') return '인천(ICN)';
    if (!props.productInfo?.tourLocation || !props.productInfo.tourLocation.cities) return code;
    const city = props.productInfo.tourLocation.cities.find((c: any) => c.airportCode === code);
    return city ? `${city.cityKo}(${code})` : code;
  }

  // 기차/버스/선박 코드로 도시명 찾기
  function getCityNameByTrafficCode(code: string, type: 'train' | 'bus' | 'ship') {
    if (!code) return code;
    if (!props.productInfo.tourLocation || !props.productInfo.tourLocation.cities) return code;
    
    for (const city of props.productInfo.tourLocation.cities) {
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

  const [editMealRowIndex, setEditMealRowIndex] = useState<number>(-1);

  // 일정표 추가, 삭제, 이동 함수
  const addDay = (idx:number) => {
    (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
      const copy = [...prev];
      const target = { ...copy[selectedScheduleIndex] };
      if (!target || !target.scheduleDetailData) return prev;
      const newScheduleDetailData = [...target.scheduleDetailData];
      newScheduleDetailData.splice(idx + 1, 0, createEmptyDay());
      copy[selectedScheduleIndex] = { ...target, scheduleDetailData: newScheduleDetailData };
      return copy;
    });
  };
  const deleteDay = (idx:number) => {
    (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
      const copy = [...prev];
      const target = { ...copy[selectedScheduleIndex] };
      if (!target || !target.scheduleDetailData) return prev;
      if (target.scheduleDetailData.length > 1) {
        const newScheduleDetailData = [...target.scheduleDetailData];
        newScheduleDetailData.splice(idx, 1);
        copy[selectedScheduleIndex] = { ...target, scheduleDetailData: newScheduleDetailData };
        return copy;
      } else {
        alert('마지막 1일은 삭제할 수 없습니다.');
        return prev;
      }
    });
  };
  const moveDayUp = (idx:number) => {
    if (idx > 0) {
      (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
        const copy = [...prev];
        const target = { ...copy[selectedScheduleIndex] };
        if (!target || !target.scheduleDetailData) return prev;
        const newScheduleDetailData = [...target.scheduleDetailData];
        const tmp = newScheduleDetailData[idx];
        newScheduleDetailData[idx] = newScheduleDetailData[idx - 1];
        newScheduleDetailData[idx - 1] = tmp;
        copy[selectedScheduleIndex] = { ...target, scheduleDetailData: newScheduleDetailData };
        return copy;
      });
    } else {
      alert('맨 위 입니다.')
    }
  };
  const moveDayDown = (idx:number) => {
    (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
      const copy = [...prev];
      const target = { ...copy[selectedScheduleIndex] };
      if (!target || !target.scheduleDetailData) return prev;
      if (idx < target.scheduleDetailData.length - 1) {
        const newScheduleDetailData = [...target.scheduleDetailData];
        const tmp = newScheduleDetailData[idx];
        newScheduleDetailData[idx] = newScheduleDetailData[idx + 1];
        newScheduleDetailData[idx + 1] = tmp;
        copy[selectedScheduleIndex] = { ...target, scheduleDetailData: newScheduleDetailData };
        return copy;
      } else {
        alert('맨 아래 입니다.')
        return prev;
      }
    });
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


  
  // 일정 정보 등록 함수 -------------------------------------------------------------------------------------------------
  const currentdate = new Date();
  const revisetoday = formatDate(currentdate, 'yyyy-MM-dd');
  
  // mainContent의 탭, 줄바꿈, 큰따옴표를 이스케이프 처리하는 함수
  const escapeMainContent = (content: string | undefined | null): string => {
    if (!content || typeof content !== 'string') return '';
    // 백슬래시 먼저 이스케이프 (순서 중요)
    let escaped = content.replace(/\\/g, '\\\\');
    // 탭, 줄바꿈, 캐리지 리턴, 큰따옴표 이스케이프
    escaped = escaped.replace(/\t/g, '\\t');
    escaped = escaped.replace(/\n/g, '\\n');
    escaped = escaped.replace(/\r/g, '\\r');
    escaped = escaped.replace(/"/g, '\\"');
    return escaped;
  };
  
  // id 배열 생성 (새로운 형식: {id, idx, st})
  const getScheduleDetailIdArray = (scheduleList: ModalScheduleDetailProps[]) =>
    scheduleList.map(schedule => ({
      airlineData: schedule.airlineData,
      scheduleDetailData: schedule.scheduleDetailData.map((day:any) => {

        const scheduleDetail: Array<{ 
          id: number; 
          idx: number; 
          st: string; 
          isViewLocation?: boolean;
          isUseMainContent?: boolean;
          mainContent?: string;
          locationIcon?: string;
          locationDetail?: any[];
        } | { 
          text: string; 
          idx: number; 
          st: 'text'; 
          isViewLocation?: boolean;
          isUseMainContent?: boolean;
          mainContent?: string;
          locationIcon?: string;
        }> = [];
        
        // 순서를 유지하면서 각 항목을 개별적으로 처리 (idx는 순서 인덱스)
        // currentIdx를 사용하여 순차적으로 증가하는 idx 할당
        let currentIdx = 0;
        day.scheduleDetail.forEach((detail: any, detailIndex: number) => {
          const st = (detail?.st ?? detail?.sort ?? '').toString().trim();
          // isViewLocation 값 가져오기 (명시적으로 저장되어 있으면 그 값을 사용, 없으면 true 기본값)
          // false도 명시적으로 저장된 값이므로 그대로 사용
          const isViewLocation = detail?.isViewLocation !== undefined ? detail.isViewLocation : true;
          
          if (st === 'airline') {
            const rawId = detail?.airlineData?.id ?? detail?.id;
            if (rawId !== undefined && rawId !== null && rawId !== '' && rawId !== 0 && rawId !== '0') {
              const num = parseInt(String(rawId), 10);
              if (!Number.isNaN(num)) {
                // detail.st 값에서 \b 제거 (이전에 잘못 저장된 데이터 정리)
                const stValue = typeof detail?.st === 'string' ? detail.st.replace(/\\b/g, '') : 'airline';
                const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
                scheduleDetail.push({ 
                  id: num, 
                  idx: currentIdx++, 
                  st: stValue || 'airline', 
                  isViewLocation: isViewLocation !== false,
                  locationIcon: locationIconValue
                });
              }
            }
          } else if (st === 'train') {
            const rawId = detail?.trainData?.id ?? detail?.id;
            if (rawId !== undefined && rawId !== null && rawId !== '' && rawId !== 0 && rawId !== '0') {
              const num = parseInt(String(rawId), 10);
              if (!Number.isNaN(num)) {
                // detail.st 값에서 \b 제거 (이전에 잘못 저장된 데이터 정리)
                const stValue = typeof detail?.st === 'string' ? detail.st.replace(/\\b/g, '') : 'train';
                const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
                scheduleDetail.push({ 
                  id: num, 
                  idx: currentIdx++, 
                  st: stValue || 'train', 
                  isViewLocation: isViewLocation !== false,
                  locationIcon: locationIconValue
                });
              }
            }
          } else if (st === 'bus') {
            const rawId = detail?.busData?.id ?? detail?.id;
            if (rawId !== undefined && rawId !== null && rawId !== '' && rawId !== 0 && rawId !== '0') {
              const num = parseInt(String(rawId), 10);
              if (!Number.isNaN(num)) {
                // detail.st 값에서 \b 제거 (이전에 잘못 저장된 데이터 정리)
                const stValue = typeof detail?.st === 'string' ? detail.st.replace(/\\b/g, '') : 'bus';
                const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
                scheduleDetail.push({ 
                  id: num, 
                  idx: currentIdx++, 
                  st: stValue || 'bus', 
                  isViewLocation: isViewLocation !== false,
                  locationIcon: locationIconValue
                });
              }
            }
          } else if (st === 'ship') {
            const rawId = detail?.shipData?.id ?? detail?.id;
            if (rawId !== undefined && rawId !== null && rawId !== '' && rawId !== 0 && rawId !== '0') {
              const num = parseInt(String(rawId), 10);
              if (!Number.isNaN(num)) {
                // detail.st 값에서 \b 제거 (이전에 잘못 저장된 데이터 정리)
                const stValue = typeof detail?.st === 'string' ? detail.st.replace(/\\b/g, '') : 'ship';
                const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
                scheduleDetail.push({ 
                  id: num, 
                  idx: currentIdx++, 
                  st: stValue || 'ship', 
                  isViewLocation: isViewLocation !== false,
                  locationIcon: locationIconValue
                });
              }
            }
          } else if (st === 'location' || st === 'g' || st === 'p') {
            // st 값으로 대분류/소분류 구분
            // detail.st가 있으면 그 값을 사용, 없으면 기존 로직으로 판단
            // \b 제거 (이전에 잘못 저장된 데이터 정리)
            const stValueRaw = detail?.st;
            const stValue = typeof stValueRaw === 'string' ? stValueRaw.replace(/\\b/g, '') : stValueRaw;
            let locationIds: number[] = [];
            let finalStValue: 'p' | 'g' = 'g'; // 기본값은 대분류
            
            // st 값이 있으면 직접 사용
            if (stValue === 'p' || stValue === 'g') {
              finalStValue = stValue; // st 값이 명확하면 그대로 사용
              const rawId = detail?.id;
              const hasValidMainId = rawId !== undefined && rawId !== null && rawId !== '' && rawId !== 0 && rawId !== '0';
              
              if (stValue === 'p') {
                // 소분류: locationDetail[0].subLocationDetail[0].id를 저장
                if (detail?.locationDetail && Array.isArray(detail.locationDetail) && detail.locationDetail.length > 0) {
                  detail.locationDetail.forEach((ld: any) => {
                    if (ld?.subLocationDetail && Array.isArray(ld.subLocationDetail) && ld.subLocationDetail.length > 0) {
                      ld.subLocationDetail.forEach((subItem: any) => {
                        // 객체인 경우 id 필드에서 추출 (소분류)
                        if (subItem && typeof subItem === 'object' && subItem.id) {
                          const subId = parseInt(String(subItem.id), 10);
                          if (!Number.isNaN(subId) && subId !== 0) {
                            locationIds.push(subId);
                          }
                        }
                        // ID만 있는 경우도 처리 (이미 저장된 소분류)
                        else if (subItem && (typeof subItem === 'string' || typeof subItem === 'number')) {
                          const subId = parseInt(String(subItem), 10);
                          if (!Number.isNaN(subId) && subId !== 0) {
                            locationIds.push(subId);
                          }
                        }
                      });
                    }
                  });
                }
              } else if (stValue === 'g') {
                // 대분류: detail.id 사용
                if (hasValidMainId) {
                  const num = parseInt(String(rawId), 10);
                  if (!Number.isNaN(num) && num !== 0) {
                    locationIds.push(num);
                  }
                }
              }
            } else {
              // st 값이 없으면 기존 로직으로 판단 (하위 호환성)
              const rawId = detail?.id;
              const hasValidMainId = rawId !== undefined && rawId !== null && rawId !== '' && rawId !== 0 && rawId !== '0';
              
              // 소분류인지 확인: detail.id가 0이고 locationDetail에 소분류 객체가 있는 경우
              if (!hasValidMainId && detail?.locationDetail && Array.isArray(detail.locationDetail) && detail.locationDetail.length > 0) {
                // 소분류: locationDetail[0].subLocationDetail[0].id를 저장
                detail.locationDetail.forEach((ld: any) => {
                  if (ld?.subLocationDetail && Array.isArray(ld.subLocationDetail) && ld.subLocationDetail.length > 0) {
                    ld.subLocationDetail.forEach((subItem: any) => {
                      // 객체인 경우 id 필드에서 추출 (소분류)
                      if (subItem && typeof subItem === 'object' && subItem.id) {
                        const subId = parseInt(String(subItem.id), 10);
                        if (!Number.isNaN(subId) && subId !== 0) {
                          locationIds.push(subId);
                          finalStValue = 'p'; // 소분류로 표시
                        }
                      }
                      // ID만 있는 경우도 처리 (이미 저장된 소분류)
                      else if (subItem && (typeof subItem === 'string' || typeof subItem === 'number')) {
                        const subId = parseInt(String(subItem), 10);
                        if (!Number.isNaN(subId) && subId !== 0) {
                          locationIds.push(subId);
                          finalStValue = 'p'; // 소분류로 표시
                        }
                      }
                    });
                  }
                });
              }
              
              // 대분류인 경우: detail.id 사용
              if (locationIds.length === 0 && hasValidMainId) {
                const num = parseInt(String(rawId), 10);
                if (!Number.isNaN(num) && num !== 0) {
                  locationIds.push(num);
                  finalStValue = 'g'; // 대분류로 표시
                }
              }
            }
            
            // ID가 있으면 저장 (소분류 ID 또는 대분류 ID, st는 'g'(group) 또는 'p'(part))
            // 여러 개의 location ID가 있어도 각각 다른 idx를 할당
            if (locationIds.length > 0) {
              locationIds.forEach((id, idIndex) => {
                // locationDetail 배열 전체를 저장 (isUseContent, subLocationContent 포함)
                let locationDetailToSave: any[] = [];
                if (detail?.locationDetail && Array.isArray(detail.locationDetail)) {
                  locationDetailToSave = detail.locationDetail.map((ld: any) => ({
                    subLocation: ld.subLocation || '',
                    subLocationContent: ld.subLocationContent || '',
                    isUseContent: ld.isUseContent !== undefined ? ld.isUseContent : false,
                    subLocationDetail: Array.isArray(ld.subLocationDetail) 
                      ? ld.subLocationDetail.map((subItem: any) => {
                          // 객체인 경우 id만 추출
                          if (subItem && typeof subItem === 'object' && subItem.id) {
                            return subItem.id;
                          }
                          // ID만 있는 경우 그대로 반환
                          return subItem;
                        })
                      : []
                  }));
                }
                
                const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
                
                // mainContent 이스케이프 처리
                const mainContentEscaped = escapeMainContent(detail?.mainContent);
                
                const itemToSave = { 
                  id: id, 
                  idx: currentIdx++, 
                  st: finalStValue, // 이미 결정된 st 값 사용
                  isViewLocation: isViewLocation !== false,
                  isUseMainContent: detail?.isUseMainContent !== undefined ? detail.isUseMainContent : false,
                  mainContent: mainContentEscaped,
                  locationIcon: locationIconValue,
                  locationDetail: locationDetailToSave
                };
                console.log('💾 저장할 location 항목:', {
                  id: itemToSave.id,
                  idx: itemToSave.idx,
                  st: itemToSave.st,
                  detailSt: detail?.st,
                  stValueRaw: stValueRaw,
                  stValue: stValue,
                  finalStValue: finalStValue,
                  isUseMainContent: itemToSave.isUseMainContent,
                  mainContent: itemToSave.mainContent,
                  detailIsUseMainContent: detail?.isUseMainContent,
                  detailMainContent: detail?.mainContent
                });
                scheduleDetail.push(itemToSave);
              });
            }
          } else if (st === 'text' || (st === '' && (detail?.text || detail?.location))) {
            // st가 'text'이거나 빈 문자열이지만 텍스트가 있는 경우
            const value = (detail?.text ?? detail?.location ?? '').toString().trim();
            if (value) {
              // locationDetail이 비어있거나 없고, 텍스트만 있는 경우 텍스트로 처리
              const hasLocationDetail = detail?.locationDetail && Array.isArray(detail.locationDetail) && detail.locationDetail.length > 0;
              // locationDetail이 있어도 st가 'text'로 명시적으로 설정되어 있으면 텍스트로 저장
              // (묶음일정/상세일정과 텍스트가 함께 있는 경우는 제외)
              if (!hasLocationDetail || (hasLocationDetail && detail?.st === 'text')) {
                // detail.st 값에서 \b 제거 (이전에 잘못 저장된 데이터 정리)
                const stValue = typeof detail?.st === 'string' ? detail.st.replace(/\\b/g, '') : 'text';
                const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
                // mainContent 이스케이프 처리
                const mainContentEscaped = escapeMainContent(detail?.mainContent);
              // 텍스트는 각각 개별 항목으로 추가
              scheduleDetail.push({ 
                text: value, 
                idx: currentIdx++, 
                  st: stValue || 'text', 
                isViewLocation: isViewLocation !== false,
                isUseMainContent: detail?.isUseMainContent !== undefined ? detail.isUseMainContent : false,
                  mainContent: mainContentEscaped,
                  locationIcon: locationIconValue
                });
              }
            }
          } else {
            // 어떤 조건에도 맞지 않는 경우 (빈 항목 등)
            // 빈 항목은 저장하지 않음 (필터링)
            // 하지만 사용자가 입력한 항목은 반드시 저장되어야 하므로, 
            // st가 빈 문자열이고 id가 0이고 locationDetail이 비어있고 텍스트도 없는 경우만 제외
            const isEmpty = !detail?.id || detail.id === 0;
            const hasNoLocationDetail = !detail?.locationDetail || !Array.isArray(detail.locationDetail) || detail.locationDetail.length === 0;
            const hasNoText = !detail?.text && !detail?.location;
            const hasNoSt = !detail?.st || detail.st === '';
            
            // 완전히 빈 항목이 아닌 경우 (어떤 값이라도 있으면 저장)
            if (!(isEmpty && hasNoLocationDetail && hasNoText && hasNoSt)) {
              // 기본값으로 저장 (빈 항목도 유지) - 타입에 맞게 저장
              const locationIconValue = typeof detail?.locationIcon === 'string' ? detail.locationIcon.replace(/\\b/g, '') : (detail?.locationIcon || '');
              const mainContentEscaped = escapeMainContent(detail?.mainContent);
              
              // locationDetail이 있으면 location 타입으로 저장
              const hasLocationDetail = detail?.locationDetail && Array.isArray(detail.locationDetail) && detail.locationDetail.length > 0;
              if (hasLocationDetail) {
                let locationDetailToSave: any[] = [];
                if (detail?.locationDetail && Array.isArray(detail.locationDetail)) {
                  locationDetailToSave = detail.locationDetail.map((ld: any) => ({
                    subLocation: ld.subLocation || '',
                    subLocationContent: ld.subLocationContent || '',
                    isUseContent: ld.isUseContent !== undefined ? ld.isUseContent : false,
                    subLocationDetail: Array.isArray(ld.subLocationDetail) 
                      ? ld.subLocationDetail.map((subItem: any) => {
                          if (subItem && typeof subItem === 'object' && subItem.id) {
                            return subItem.id;
                          }
                          return subItem;
                        })
                      : []
                  }));
                }
                
                scheduleDetail.push({
                  id: detail?.id || 0,
                  idx: currentIdx++,
                  st: detail?.st || 'g',
                  isViewLocation: isViewLocation !== false,
                  locationIcon: locationIconValue,
                  isUseMainContent: detail?.isUseMainContent !== undefined ? detail.isUseMainContent : false,
                  mainContent: mainContentEscaped,
                  locationDetail: locationDetailToSave
                });
              } else {
                // 텍스트가 있으면 텍스트로 저장
                const textValue = detail?.text || detail?.location || '';
                if (textValue) {
                  scheduleDetail.push({
                    text: textValue,
                    idx: currentIdx++,
                    st: detail?.st || 'text',
                    isViewLocation: isViewLocation !== false,
                    locationIcon: locationIconValue,
                    isUseMainContent: detail?.isUseMainContent !== undefined ? detail.isUseMainContent : false,
                    mainContent: mainContentEscaped
                  });
                }
              }
            }
          }
        });

        // 데이터가 비어있는 경우 id: 0(location)으로 설정
        if (scheduleDetail.length === 0) {
          scheduleDetail.push({ id: 0, idx: 0, st: 'g' });
        }

        return {
          breakfast: day.breakfast,
          lunch: day.lunch,
          dinner: day.dinner,
          hotel: day.hotel,
          score: day.score,
          scheduleDetail
        };
      })
    }));

  // getParams 반환 타입 정의
  type ScheduleParams = {
    postId: string;
    isView: boolean;
      locationType: string;
    nation: string;
    tourLocation: string;
    landCompany: string;
    applyPackage: string;
    scheduleSort: string;
    tourPeriodData: string;
    productName: string;
    productNameMemo: string;
    productScheduleData: string;
    costType: string;
    depositPrice: string;
    specialPriceNote: string;
    scheduleOutline: string;
    includeNote: string;
    includeNoteText: string;
    notIncludeNote: string;
    notIncludeNoteText: string;
    cautionNote: string;
    scheduleDetail: string;
    reviseDate: string;
  };

  // JSON.stringify는 이미 제어 문자를 자동으로 이스케이프하므로
  // 별도의 sanitizeForJson 함수는 필요 없습니다.
  // JSON.stringify가 자동으로 처리하는 이스케이프:
  // - 큰따옴표 (")
  // - 백슬래시 (\)
  // - 제어 문자 (\n, \r, \t, \b, \f 등)

  // const getParams = (): ScheduleParams => {
  //   // scheduleDetail 저장 전 검증
  //   const scheduleDetailArray = getScheduleDetailIdArray(scheduleList);
  //   let scheduleDetailString = '';
    
  //   // 디버깅: scheduleDetail 저장 전 검증
  //   try {
  //     // JSON.stringify는 자동으로 제어 문자를 이스케이프하므로 그대로 사용
  //     scheduleDetailString = JSON.stringify(scheduleDetailArray);
  //     // 저장 전 JSON 유효성 검증
  //     JSON.parse(scheduleDetailString);
  //     console.log('✅ scheduleDetail JSON 검증 성공');
  //   } catch (e) {
  //     console.error('❌ scheduleDetail JSON 검증 실패:', e);
  //     console.error('scheduleDetailArray:', scheduleDetailArray);
  //     console.error('scheduleDetailString:', scheduleDetailString);
  //     throw new Error('일정 데이터 형식 오류가 발생했습니다. 다시 시도해주세요.');
  //   }

  //   return {
     
  //     scheduleDetail: scheduleDetailString,
  //     reviseDate : revisetoday
  //   };
  // };

  // const registerPost = async () => {

    
    
  //   // getParams 호출 시 검증 수행
  //   let params: ScheduleParams;
  //   try {
  //     params = getParams();
  //   } catch (e: any) {
  //     alert(e?.message || '일정 데이터 형식 오류가 발생했습니다. 다시 시도해주세요.');
  //     return;
  //   }
   
     
  //   axios 
  //     .post(`${AdminURL}/schedule/registerschedule`, params)
  //     .then(async (res) => {
  //       if (res.data.success) {
  //         alert('등록되었습니다.');
  //         if (props.restoreSearchState) {
  //           await props.restoreSearchState();
  //         }
          
  //       }
  //     })
  //     .catch(() => {
  //       console.log('실패함')
  //     })    
    
  // };
  // // 일정 정보 수정 함수 ----------------------------------------------
  // const reviseSchedule = async () => {

  //   if (!isViewProductName) {
  //     alert('상품명만들기를 클릭하여 상품명 만들기를 마무리 해주세요.');
  //     return;
  //   }
    
  //   // getParams 호출 시 검증 수행
  //   let params: ScheduleParams | null = null;
  //   try {
  //     params = getParams();
  //     params.postId = postId; // 수정 시 postId 설정
  //   } catch (e: any) {
  //     alert(e?.message || '일정 데이터 형식 오류가 발생했습니다. 다시 시도해주세요.');
  //     return;
  //   }
    
  //   if (!params) {
  //     alert('데이터 준비 중 오류가 발생했습니다.');
  //     return;
  //   }
    
  //   axios 
  //     .post(`${AdminURL}/schedule/reviseschedule`, params)
  //     .then(async (res) => {
  //       if (res.data) {
  //         alert('수정되었습니다.');
  //         if (props.restoreSearchState) {
  //           await props.restoreSearchState();
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('수정 실패:', error);
  //       console.error('요청 데이터:', params);
  //       alert('수정 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
  //     })
  // };

  // 처음 렌더링 시 일정 상세 데이터 받아오기 (2단계 fetch)
  const fetchScheduleDetailData = async (dataToFetch?: any) => {
    await fetchScheduleDetailDataExternal({
      dataToFetch,
      scheduleData : scheduleList[selectedScheduleIndex],
      propsScheduleInfo: props.scheduleInfo,
      setScheduleList: useRecoil ? setScheduleListWithRecoil : setScheduleList,
      setManageAirline:() => {},
      createEmptyDay,
      safeJsonParse,
      repairJsonString,
      isAddOrRevise : 'revise',
      hotelInfoPerDay: props.hotelInfoPerDay,
      cityInfoPerDay: props.cityInfoPerDay,
    });
  };

  useEffect(() => {
    // Recoil을 사용하는 경우
    if (useRecoil) {
      if (recoilScheduleInfoValue && recoilScheduleInfoValue.scheduleDetailData) {
        setScheduleList([recoilScheduleInfoValue]);
        setSelectedScheduleIndex(0);
        setLoading(false);
        // 선택된 일정 변경 알림
        if (props.onSelectedScheduleChange) {
          props.onSelectedScheduleChange(recoilScheduleInfoValue, 0);
        }
      } else if (props.scheduleInfo && props.scheduleInfo.scheduleDetailData) {
        // props.scheduleInfo가 있으면 Recoil에도 저장
        setScheduleList([props.scheduleInfo]);
        setRecoilScheduleInfo(props.scheduleInfo);
        setSelectedScheduleIndex(0);
        setLoading(false);
        if (props.onSelectedScheduleChange) {
          props.onSelectedScheduleChange(props.scheduleInfo, 0);
        }
      } else {
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
        fetchScheduleData();
      }
    }
  }, [props.scheduleInfo, props.id, useRecoil, recoilScheduleInfoValue, setRecoilScheduleInfo]);

  // scheduleList가 변경될 때마다 Recoil에 자동 저장 (useRecoil이 true일 때만)
  // 이전 scheduleList를 추적하여 무한 루프 방지
  const prevScheduleListRef = useRef<ModalScheduleDetailProps[]>(scheduleList);
  useEffect(() => {
    if (useRecoil && scheduleList && scheduleList.length > 0) {
      // 이전 값과 비교하여 실제로 변경되었을 때만 저장
      const prevSchedule = prevScheduleListRef.current;
      const hasChanged = JSON.stringify(prevSchedule) !== JSON.stringify(scheduleList);
      if (hasChanged) {
        setRecoilScheduleInfo(scheduleList[0]);
        prevScheduleListRef.current = scheduleList;
      }
    }
  }, [scheduleList, useRecoil, setRecoilScheduleInfo]);



  return (
    <div className='modal-addinput'>

    

      {/* 스케줄 ------------------------------------------------------------------------------------------------ */}

      <div className="schedule-layout-container">
        <div className="schedule-layout-left" style={{width:'100%'}}>
          <div className="schedule-resort_detail_mx__section">
            <div className="schedule-resort_detail_schedule_header__wrapper">
              <span className="schedule-header__main">추천 여행일정표</span>
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
                        
                        return schedule.scheduleDetailData.map((dayItem:any, dayIndex:any) => {
                          // 일정 데이터의 location 값에서 도시명 추출
                          let cityNameForDay: string | undefined = undefined;
                          // 호텔 정보 location 기반 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
                          let hotelNameForDay: string | undefined = undefined;
                          let hotelLevelForDay: string | undefined = undefined;
                          
                          // 마지막 day인지 확인
                          const isLastDay = dayIndex === schedule.scheduleDetailData.length - 1;
                          
                          // hotelInfoPerDay만 있을 때 (휴양지 경로) - 마지막 day가 아닐 때만 실행
                          if (!isLastDay && props.hotelInfoPerDay && !props.cityInfoPerDay) {
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
                          
            // 유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때 - 마지막 day가 아닐 때만 실행
            if (!isLastDay && props.cityInfoPerDay && dayItem.scheduleDetail && Array.isArray(dayItem.scheduleDetail)) {
              // scheduleDetail 배열에서 location 값을 찾기
              for (const detail of dayItem.scheduleDetail) {
                if (detail.location && typeof detail.location === 'string' && detail.location.trim()) {
                  const location = detail.location.trim();
                  // location에서 도시명만 추출 (예: "2일차 - 루체른" -> "루체른")
                  const locationParts = location.split('-').map((part: string) => part.trim());
                  const locationCityName = locationParts[locationParts.length - 1] || location;
                  
                  // 이미 매핑된 도시명인지 확인
                  // 단, 해당 도시가 이미 사용되었는지 확인해야 함 (1박인 경우 다음 day부터 다른 도시 사용)
                  let shouldUseMappedCity = false;
                  if (cityNameMap.has(locationCityName)) {
                    const mappedCityName = cityNameMap.get(locationCityName);
                    if (mappedCityName) {
                      // 매핑된 도시명이 cityInfoPerDay에서 사용되지 않은 항목인지 확인
                      const mappedCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                        cityInfo.cityName === mappedCityName && !usedCityIndices.has(idx)
                      );
                      // 사용되지 않은 도시만 재사용 (같은 도시가 여러 박인 경우)
                      if (mappedCityInfo) {
                        shouldUseMappedCity = true;
                        cityNameForDay = mappedCityName;
                        // 사용된 인덱스 추가
                        const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
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
                    const exactMatch = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                      !usedCityIndices.has(idx) &&
                      locationCityName === cityInfo.cityName
                    );
                    
                    if (exactMatch) {
                      const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                        cityInfo.dayIndex === exactMatch.dayIndex && cityInfo.cityName === exactMatch.cityName
                      );
                      if (matchedIndex !== -1) {
                        usedCityIndices.add(matchedIndex);
                        cityNameMap.set(locationCityName, exactMatch.cityName);
                        cityNameForDay = exactMatch.cityName;
                      }
                    } else {
                      // 정확한 매칭이 없으면 부분 매칭 시도
                      const matchedCity = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                        !usedCityIndices.has(idx) &&
                        (location.includes(cityInfo.cityName) || 
                         cityInfo.cityName.includes(locationCityName))
                      );
                      if (matchedCity) {
                        const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                          cityInfo.dayIndex === matchedCity.dayIndex && cityInfo.cityName === matchedCity.cityName
                        );
                        if (matchedIndex !== -1) {
                          usedCityIndices.add(matchedIndex);
                          cityNameMap.set(locationCityName, matchedCity.cityName);
                          cityNameForDay = matchedCity.cityName;
                        }
                      }
                    }
                  }
                  
                  // 호텔 정보 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
                  if (props.hotelInfoPerDay && cityNameForDay && !hotelNameForDay) {
                    const matchedCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }) => 
                      cityInfo.cityName === cityNameForDay
                    );
                    if (matchedCityInfo) {
                      const matchedHotel = props.hotelInfoPerDay.find((hotelInfo: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                        hotelInfo.dayIndex === matchedCityInfo.dayIndex
                      );
                      if (matchedHotel) {
                        hotelNameForDay = matchedHotel.hotelName;
                        hotelLevelForDay = matchedHotel.hotelLevel;
                      }
                    }
                  }
                }
              }
            }
                          
                          return (
                            <div className="schedule-schedule__table__wrapper" key={dayIndex}>
                              <div className="schedule-schedule__header" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                <div style={{display:'flex', alignItems:'center'}}>
                                  <span className="schedule-main__text">{dayIndex +1} DAY</span>
                                </div>
                                <div style={{display:'flex', gap:'6px'}}>
                                  <button
                                    type="button"
                                    style={{padding:'2px 8px', border:'1px solid #bbb', borderRadius:'4px', background:'#fff', cursor:'pointer'}}
                                    title="DAY 추가"
                                    onClick={() => addDay(dayIndex)}
                                  >+
                                  </button>
                                  <button
                                    type="button"
                                    style={{padding:'2px 8px', border:'1px solid #bbb', borderRadius:'4px', background:'#fff', cursor:'pointer'}}
                                    title="DAY 삭제"
                                    onClick={() => deleteDay(dayIndex)}
                                  >–
                                  </button>
                                  <button
                                    type="button"
                                    style={{padding:'2px 8px', border:'1px solid #bbb', borderRadius:'4px', background:'#fff', cursor:'pointer'}}
                                    title="DAY 위로"
                                    onClick={() => moveDayUp(dayIndex)}
                                  >▲
                                  </button>
                                  <button
                                    type="button"
                                    style={{padding:'2px 8px', border:'1px solid #bbb', borderRadius:'4px', background:'#fff', cursor:'pointer'}}
                                    title="DAY 아래로"
                                    onClick={() => moveDayDown(dayIndex)}
                                  >▼
                                  </button>
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
                                            ${(loctionItem.sort || loctionItem.st) === 'airline' || (loctionItem.sort || loctionItem.st) === 'train' || (loctionItem.sort || loctionItem.st) === 'bus' || (loctionItem.sort || loctionItem.st) === 'ship' ? 'traffic-wrapper' : ''}`}`}>
                                              <div style={{position: 'relative'}}>
                                                <button
                                                  type="button"
                                                  style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                  }}
                                                  onClick={() => {
                                                    const iconKey = `${dayIndex}-${locationIndex}`;
                                                    setIconSelectorOpen(prev => ({
                                                      ...prev,
                                                      [iconKey]: !prev[iconKey]
                                                    }));
                                                  }}
                                                >
                                                  {((loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'airline') ? (
                                                    <span style={{color: '#ff6b6b', fontSize: '30px', fontWeight: 'bold'}}>✈</span>
                                                  ) : ((loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'train') ? (
                                                    <img src={trainIcon} alt="train" style={{width: '24px', height: '24px', objectFit: 'contain'}}/>
                                                  ) : ((loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'bus') ? (
                                                    <img src={busIcon} alt="bus" style={{width: '24px', height: '24px', objectFit: 'contain'}}/>
                                                  ) : ((loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'ship') ? (
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
                                                </button>
                                                {iconSelectorOpen[`${dayIndex}-${locationIndex}`] && (
                                                  <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '0',
                                                    zIndex: 2000,
                                                    background: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    padding: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    display: 'flex',
                                                    gap: '8px',
                                                    marginTop: '4px',
                                                  }}>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background: '#fff',
                                                        border: (loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'airline' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '20px'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: 'airline' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >✈</button>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background: '#fff',
                                                        border: (loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'train' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: 'train' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >
                                                      <img src={trainIcon} alt="train" style={{width: '20px', height: '20px', objectFit: 'contain'}}/>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background: '#fff',
                                                        border: (loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'bus' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: 'bus' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >
                                                      <img src={busIcon} alt="bus" style={{width: '20px', height: '20px', objectFit: 'contain'}}/>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background: '#fff',
                                                        border: (loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'ship' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: 'ship' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >
                                                      <img src={shipIcon} alt="ship" style={{width: '20px', height: '20px', objectFit: 'contain'}}/>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background:'#5fb7ef',
                                                        border: (loctionItem.locationIcon || loctionItem.sort || loctionItem.st) === 'dot' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '40px',
                                                        height: '40px'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: 'dot' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >
                                                      <GoDotFill className="schedule-white-dot__icon" color='#fff'/>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background: '#fff',
                                                        border: (loctionItem.locationIcon || loctionItem.st) === '' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: '' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >
                                                      <img src={location1Icon} alt="location" style={{width: '20px', height: '20px', objectFit: 'contain'}}/>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      style={{
                                                        background: '#fff',
                                                        border: loctionItem.locationIcon === 'black' ? '1px solid #333' : '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '40px',
                                                        height: '40px'
                                                      }}
                                                      onClick={() => {
                                                        const iconKey = `${dayIndex}-${locationIndex}`;
                                                        (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                          const next = [...prev];
                                                          const schedule = next[selectedScheduleIndex];
                                                          const day = schedule?.scheduleDetailData?.[dayIndex];
                                                          const currentItem = day?.scheduleDetail?.[locationIndex];
                                                          if (!schedule || !day || !currentItem) return prev;
                                                          const newScheduleDetail = [...day.scheduleDetail];
                                                          const updatedItem = { ...currentItem, locationIcon: 'black' };
                                                          newScheduleDetail[locationIndex] = updatedItem;
                                                          const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                                                          const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                          newScheduleDetailData[dayIndex] = updatedDay;
                                                          next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                                                          return next;
                                                        });
                                                        setIconSelectorOpen(prev => ({ ...prev, [iconKey]: false }));
                                                      }}
                                                    >
                                                      <div className="schedule-absolute__wrapper">
                                                        <GoDotFill className="schedule-dot__icon"/>
                                                      </div>
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            )}
                                            <div style={{display:'flex', alignItems:'center', marginBottom:'10px', justifyContent:'flex-start', paddingLeft:'30px'}}>
                                              {((loctionItem.sort || loctionItem.st) !== 'airline' && (loctionItem.sort || loctionItem.st) !== 'train' && (loctionItem.sort || loctionItem.st) !== 'bus' && (loctionItem.sort || loctionItem.st) !== 'ship') &&
                                                <>
                                                  {loctionItem.isViewLocation !== false && (
                                                    <>
                                                      {/* 텍스트 입력창: 항상 활성화, 묶음일정/상세일정과 독립적으로 작동 */}
                                                      <input
                                                        className="inputdefault"
                                                        style={{
                                                          width:'300px', 
                                                          margin:'0'
                                                        }}
                                                        value={loctionItem.location || ''}
                                                        placeholder="텍스트를 입력하세요"
                                                        onChange={e => {
                                                          (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                            const next = [...prev];
                                                            const schedule = next[selectedScheduleIndex];
                                                            const day = schedule?.scheduleDetailData?.[dayIndex];
                                                            const currentItem = day?.scheduleDetail?.[locationIndex];

                                                            if (!schedule || !day || !currentItem) return prev;

                                                            const newScheduleDetail = [...day.scheduleDetail];
                                                            // 텍스트 입력 시 location과 text 모두 업데이트
                                                            // st와 locationDetail은 기존 값 유지 (묶음일정/상세일정 데이터 보존)
                                                            const updatedItem: any = { 
                                                              ...currentItem, 
                                                              location: e.target.value
                                                              // st와 locationDetail은 변경하지 않음 (기존 값 유지)
                                                            };
                                                            // locationDetail이 있으면 st를 변경하지 않음 (묶음일정/상세일정 보존)
                                                            // locationDetail이 없고 텍스트만 있으면 st를 'text'로 설정
                                                            if (!currentItem.locationDetail || currentItem.locationDetail.length === 0) {
                                                              if (e.target.value.trim() !== '') {
                                                                updatedItem.st = 'text';
                                                                // 텍스트만 입력한 경우 text 필드도 함께 설정 (저장 시 필요)
                                                                updatedItem.text = e.target.value;
                                                              } else if (currentItem.st === 'text') {
                                                                updatedItem.st = '';
                                                                // 텍스트가 비어있으면 text 필드 제거
                                                                delete updatedItem.text;
                                                              }
                                                            }
                                                            // locationDetail이 있으면 st는 기존 값 유지 (묶음일정/상세일정 보존)
                                                            newScheduleDetail[locationIndex] = updatedItem;

                                                            const updatedDay = { ...day, scheduleDetail: newScheduleDetail };

                                                            const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                            newScheduleDetailData[dayIndex] = updatedDay;

                                                            next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };

                                                            return next;
                                                          });
                                                        }}
                                                      />
                                                    </>
                                                  )}
                                                </>
                                              }
                                              {/* 버튼 그룹: ModalAddScheduleDetail.tsx와 동일한 구조/스타일 */}
                                              <div className="schedule-schedule__btns" style={{display:'flex', alignItems:'center', marginLeft:'4px'}}>
                                                <button
                                                  className="schedule-schedule__btn"
                                                  style={{padding:'2px 10px'}}
                                                  type="button"
                                                  onClick={() => {
                                                    // +: scheduleDetail 추가
                                                    (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                      const next = [...prev];
                                                      const schedule = { ...next[selectedScheduleIndex] };
                                                      const scheduleDetailData = [...schedule.scheduleDetailData];
                                                      const day = { ...scheduleDetailData[dayIndex] };
                                                      const scheduleDetail = [...day.scheduleDetail];
                                                      
                                                      // 새 항목 추가
                                                      scheduleDetail.splice(locationIndex + 1, 0, {
                                                      id: 0, 
                                                        st: "", 
                                                      locationIcon: '',
                                                      location: '', 
                                                      isUseMainContent: false,
                                                      mainContent: '',
                                                      isViewLocation: true,
                                                        locationDetail: [], // 빈 배열로 설정 (텍스트 입력 시 저장되도록)
                                                      airlineData: null
                                                    });
                                                      
                                                      // 불변성 유지하며 업데이트
                                                      const updatedDay = { ...day, scheduleDetail };
                                                      scheduleDetailData[dayIndex] = updatedDay;
                                                      schedule.scheduleDetailData = scheduleDetailData;
                                                      next[selectedScheduleIndex] = schedule;
                                                      
                                                      return next;
                                                    });
                                                  }}
                                                >+</button>
                                                <button
                                                  className="schedule-schedule__btn"
                                                  style={{padding:'2px 10px'}}
                                                  type="button"
                                                  onClick={() => {
                                                    // -: scheduleDetail 삭제
                                                    if (dayItem.scheduleDetail.length > 1) {
                                                      const copy = [...scheduleList];
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail.splice(locationIndex, 1);
                                                      (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                                    }
                                                  }}
                                                >–</button>
                                                <button
                                                  className="schedule-schedule__btn"
                                                  style={{padding:'2px 7px'}}
                                                  type="button"
                                                  onClick={() => {
                                                    // 위로 이동
                                                    if (locationIndex > 0) {
                                                      // 같은 day 내에서 위로 이동
                                                      const copy = [...scheduleList];
                                                      const temp = copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex];
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex] = copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex - 1];
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex - 1] = temp;
                                                      (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                                    } else if (dayIndex > 0) {
                                                      // 이전 day의 마지막 위치로 이동
                                                      const copy = [...scheduleList];
                                                      const currentItem = copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex];
                                                      const prevDay = copy[selectedScheduleIndex].scheduleDetailData[dayIndex - 1];
                                                      
                                                      // 현재 위치에서 제거
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail.splice(locationIndex, 1);
                                                      
                                                      // 이전 day의 마지막 위치에 추가
                                                      prevDay.scheduleDetail.push(currentItem);
                                                      
                                                      (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                                    } else {
                                                      alert('첫 번째 day의 첫 번째 위치입니다.')
                                                    }
                                                  }}
                                                ><TiArrowSortedUp /></button>
                                                <button
                                                  className="schedule-schedule__btn"
                                                  style={{padding:'2px 7px'}}
                                                  type="button"
                                                  onClick={() => {
                                                    // 아래로 이동
                                                    if (locationIndex < dayItem.scheduleDetail.length - 1) {
                                                      // 같은 day 내에서 아래로 이동
                                                      const copy = [...scheduleList];
                                                      const temp = copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex];
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex] = copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex + 1];
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex + 1] = temp;
                                                      (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                                    } else if (dayIndex < scheduleList[selectedScheduleIndex].scheduleDetailData.length - 1) {
                                                      // 다음 day의 첫 번째 위치로 이동
                                                      const copy = [...scheduleList];
                                                      const currentItem = copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail[locationIndex];
                                                      const nextDay = copy[selectedScheduleIndex].scheduleDetailData[dayIndex + 1];
                                                      
                                                      // 현재 위치에서 제거
                                                      copy[selectedScheduleIndex].scheduleDetailData[dayIndex].scheduleDetail.splice(locationIndex, 1);
                                                      
                                                      // 다음 day의 첫 번째 위치에 추가
                                                      if (nextDay.scheduleDetail.length === 0) {
                                                        nextDay.scheduleDetail.push(currentItem);
                                                      } else {
                                                        nextDay.scheduleDetail.unshift(currentItem);
                                                      }
                                                      
                                                      (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                                    } else {
                                                      alert('마지막 day의 마지막 위치입니다.')
                                                    }
                                                  }}
                                                ><TiArrowSortedDown /></button>
                                                <button
                                                  className="schedule-schedule__btn"
                                                  onClick={async ()=>{
                                                    setTrafficModalOpen({ dayIndex, locationIndex });
                                                    setSelectedTrafficTab('airline');
                                                    // 초기화
                                                    setAirlineList([]);
                                                    setTrainList([]);
                                                    setBusList([]);
                                                    setShipList([]);
                                                    setCurrentSearchAirportCode('');
                                                    setCurrentSearchTrainCity('');
                                                    setCurrentSearchBusCity('');
                                                    setCurrentSearchShipCity('');
                                                  }}
                                                >교통편추가</button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {/* mainContent 입력 영역 */}
                                        {loctionItem.isUseMainContent && (
                                          <div style={{
                                            padding: '12px 30px',
                                          }}>
                                            <textarea
                                              style={{
                                                width: '100%',
                                                minHeight: '80px',
                                                padding: '8px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                fontFamily: 'inherit',
                                                resize: 'vertical',
                                                lineHeight: '1.5'
                                              }}
                                              value={loctionItem.mainContent || ''}
                                              onChange={e => {
                                                (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                  const next = [...prev];
                                                  const schedule = next[selectedScheduleIndex];
                                                  const day = schedule?.scheduleDetailData?.[dayIndex];
                                                  const currentItem = day?.scheduleDetail?.[locationIndex];

                                                  if (!schedule || !day || !currentItem) return prev;

                                                  const newScheduleDetail = [...day.scheduleDetail];
                                                  const updatedItem = { ...currentItem, mainContent: e.target.value };
                                                  newScheduleDetail[locationIndex] = updatedItem;

                                                  const updatedDay = { ...day, scheduleDetail: newScheduleDetail };

                                                  const newScheduleDetailData = [...schedule.scheduleDetailData];
                                                  newScheduleDetailData[dayIndex] = updatedDay;

                                                  next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };

                                                  return next;
                                                });
                                              }}
                                            />
                                          </div>
                                        )}
                                        {/* 통합 교통편 모달 */}
                                        <ScheduleTrafficAdd
                                          trafficModalOpen={trafficModalOpen}
                                          setTrafficModalOpen={setTrafficModalOpen}
                                          selectedTrafficTab={selectedTrafficTab}
                                          setSelectedTrafficTab={setSelectedTrafficTab}
                                          airlineList={airlineList}
                                          setAirlineList={setAirlineList}
                                          trainList={trainList}
                                          setTrainList={setTrainList}
                                          busList={busList}
                                          setBusList={setBusList}
                                          shipList={shipList}
                                          setShipList={setShipList}
                                          currentSearchAirportCode={currentSearchAirportCode}
                                          setCurrentSearchAirportCode={setCurrentSearchAirportCode}
                                          currentSearchTrainCity={currentSearchTrainCity}
                                          setCurrentSearchTrainCity={setCurrentSearchTrainCity}
                                          currentSearchBusCity={currentSearchBusCity}
                                          setCurrentSearchBusCity={setCurrentSearchBusCity}
                                          currentSearchShipCity={currentSearchShipCity}
                                          setCurrentSearchShipCity={setCurrentSearchShipCity}
                                          isLoadingAirline={isLoadingAirline}
                                          setIsLoadingAirline={setIsLoadingAirline}
                                          isLoadingTrain={isLoadingTrain}
                                          setIsLoadingTrain={setIsLoadingTrain}
                                          isLoadingBus={isLoadingBus}
                                          setIsLoadingBus={setIsLoadingBus}
                                          isLoadingShip={isLoadingShip}
                                          setIsLoadingShip={setIsLoadingShip}
                                          searchAirlineData={searchAirlineData}
                                          searchTrainData={searchTrainData}
                                          searchBusData={searchBusData}
                                          searchShipData={searchShipData}
                                          scheduleList={scheduleList}
                                          setScheduleList={useRecoil ? setScheduleListWithRecoil : setScheduleList}
                                          selectedScheduleIndex={selectedScheduleIndex}
                                          createEmptyDetail={createEmptyDetail}
                                          safeJsonParse={safeJsonParse}
                                          searchInputRef={searchInputRef}
                                          dayIndex={dayIndex}
                                          locationIndex={locationIndex}
                                        />
                                        {((loctionItem.sort || loctionItem.st) === 'airline' && loctionItem.airlineData) ? (
                                          // 첨부 이미지 스타일의 항공편 정보 UI
                                          <div className="schedule__element__wrapper">
                                          <div className="schedule-flight__schedule__board__wrapper">
                                            <div className="schedule-flight__schedule__board">
                                                {loctionItem.airlineData && (loctionItem.sort || loctionItem.st) === 'airline' ? (
                                                // 항공편 표시 (직항/경유 구분 없이)
                                                <>
                                                  <div className="schedule-flight__info__wrapper">
                                                    {(() => {
                                                      const airlineCode = loctionItem.airlineData?.airlineCode?.slice(0, 2);
                                                      try {
                                                        return <img src={require(`../../../airlineLogos/${airlineCode}.png`)} alt="항공사로고" />;
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
                                              ) : (
                                                // 직항 항공편: 기존 표시 방식
                                                <>
                                                  <div className="schedule-flight__info__wrapper">
                                                    {(() => {
                                                      const airlineCode = loctionItem.airlineData?.airlineCode?.slice(0, 2);
                                                      try {
                                                        return <img src={require(`../../../airlineLogos/${airlineCode}.png`)} alt="항공사로고" />;
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
                                        {((loctionItem.sort || loctionItem.st) === 'train' && loctionItem.trainData) ? (
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
                                        {((loctionItem.sort || loctionItem.st) === 'bus' && loctionItem.busData) ? (
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
                                        {((loctionItem.sort || loctionItem.st) === 'ship' && loctionItem.shipData) ? (
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
                                        {((loctionItem.sort || loctionItem.st) === 'location' || (loctionItem.sort || loctionItem.st) === 'g' || (loctionItem.sort || loctionItem.st) === 'p') ? (
                                          // location 타입일 때의 기존 UI
                                          loctionItem.locationDetail.map((locationDetailItem:any, locationDetailIndex:number)=>{
                                            // 선택 상태 확인 (조건을 변수로 추출)
                                            const isSelected = selectedLocation?.dayIndex === dayIndex && 
                                                              selectedLocation?.locationIndex === locationIndex && 
                                                              selectedLocation?.locationDetailIndex === locationDetailIndex && 
                                                              selectedLocation?.tabType === '변경';
                                            
                                            return (
                                              <div 
                                                key={locationDetailIndex} 
                                                className="schedule-schedule__sub_element__wrapper"
                                                style={{
                                                  backgroundColor: isSelected ? 'rgb(218, 241, 255)' : 'transparent',
                                                  borderRadius: isSelected ? '8px' : '0',
                                                  padding: isSelected ? '4px' : '0',
                                                  transition: 'all 0.2s'
                                                }}
                                              >
                                                <div className="schedule-schedule__element__subTitle__wrapper">
                                                  <div className="schedule-schedule__element__subTitle">
                                                    <div className="schedule-absolute__wrapper">
                                                      <GoDotFill className="schedule-dot__icon"/>
                                                    </div>
                                                    <div className="schedule-schedule__text__wrapper">
                                                      <span>{locationDetailItem.subLocation ? locationDetailItem.subLocation.replace(/^\[|\]$/g, '') : ''}</span>
                                                      <div className="schedule-schedule__btns">
                                                        <button 
                                                          className="schedule-schedule__btn" 
                                                          title="추가"
                                                          style={{
                                                            marginLeft:'4px',
                                                            backgroundColor: '#fff',
                                                            color: '#333',
                                                            border: '1px solid #ddd',
                                                            transition: 'all 0.2s',
                                                            padding: '4px 8px',
                                                            fontSize: '14px',
                                                          }}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                              const newList = [...prev];
                                                              const schedule = newList[selectedScheduleIndex];
                                                              if (schedule && schedule.scheduleDetailData[dayIndex]) {
                                                                const locationItem = schedule.scheduleDetailData[dayIndex].scheduleDetail[locationIndex];
                                                                if (locationItem && locationItem.locationDetail) {
                                                                  const newLocationDetail = {
                                                                    subLocation: '',
                                                                    subLocationContent: '',
                                                                    subLocationDetail: [],
                                                                    isUseContent: false
                                                                  };
                                                                  locationItem.locationDetail = [
                                                                    ...locationItem.locationDetail.slice(0, locationDetailIndex + 1),
                                                                    newLocationDetail,
                                                                    ...locationItem.locationDetail.slice(locationDetailIndex + 1)
                                                                  ];
                                                                }
                                                              }
                                                              return newList;
                                                            });
                                                          }}
                                                        >+</button>
                                                        <button 
                                                          className="schedule-schedule__btn" 
                                                          title="삭제"
                                                          style={{
                                                            backgroundColor: '#fff',
                                                            color: '#333',
                                                            border: '1px solid #ddd',
                                                            transition: 'all 0.2s',
                                                            padding: '4px 8px',
                                                            fontSize: '14px',
                                                            opacity: loctionItem.locationDetail.length > 1 ? 1 : 0.5,
                                                            cursor: loctionItem.locationDetail.length > 1 ? 'pointer' : 'not-allowed'
                                                          }}
                                                          disabled={loctionItem.locationDetail.length <= 1}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (loctionItem.locationDetail.length <= 1) return;
                                                            (useRecoil ? setScheduleListWithRecoil : setScheduleList)(prev => {
                                                              const newList = [...prev];
                                                              const schedule = newList[selectedScheduleIndex];
                                                              if (schedule && schedule.scheduleDetailData[dayIndex]) {
                                                                const locationItem = schedule.scheduleDetailData[dayIndex].scheduleDetail[locationIndex];
                                                                if (locationItem && locationItem.locationDetail) {
                                                                  locationItem.locationDetail = locationItem.locationDetail.filter((_: any, idx: number) => idx !== locationDetailIndex);
                                                                }
                                                              }
                                                              return newList;
                                                            });
                                                          }}
                                                        >-</button>
                                                        <button className="schedule-schedule__btn" title="변경"
                                                          style={{
                                                            backgroundColor: isSelected ? '#5fb7ef' : '#fff',
                                                            color: isSelected ? '#fff' : '#333',
                                                            border: isSelected ? '1px solid #5fb7ef' : '1px solid #ddd',
                                                            transition: 'all 0.2s'
                                                          }}
                                                          onClick={() => {
                                                            // 이미 선택된 상태라면 해제, 아니면 선택
                                                            if (isSelected) {
                                                              setSelectedLocation(null);
                                                            } else {
                                                              // 선택 상태 설정
                                                              const newLocation = { dayIndex, locationIndex, locationDetailIndex, tabType: '변경' as const };
                                                              setSelectedLocation(newLocation);
                                                            }
                                                          }}>변경</button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                {/* isUseContent가 true인 경우 subLocationContent 표시 */}
                                                {locationDetailItem.isUseContent && locationDetailItem.subLocationContent && (
                                                  <div style={{width:'100%', padding:'20px', marginTop:'10px', marginBottom:'10px', borderRadius:'8px'}}>
                                                    <div 
                                                      style={{
                                                        fontSize:'15px', 
                                                        lineHeight:'1.8', 
                                                        color:'#333', 
                                                        whiteSpace:'pre-wrap'
                                                      }}
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
                                                        <div className="schedule-schedule__element__main__wrapper" >
                                                          <div className="schedule-table__wrapper">
                                                            <div className="schedule-table__header">
                                                              <span>{subDetailBoxItem.locationTitle}</span>
                                                            </div>
                                                            <div className="schedule-table__main"
                                                              dangerouslySetInnerHTML={{__html: subDetailBoxItem.locationContent}}
                                                            />                                                
                                                          </div>
                                                          <div className="schedule-image__wrapper">
                                                            <div style={{
                                                              display:'flex', 
                                                              width:'100%', 
                                                              justifyContent: (subDetailBoxItem.postImages && subDetailBoxItem.postImages.length === 2) ? 'flex-start' : 'space-between',
                                                              gap: (subDetailBoxItem.postImages && subDetailBoxItem.postImages.length === 2) ? '2%' : '0'
                                                            }}>
                                                              {subDetailBoxItem.postImages && subDetailBoxItem.postImages.length > 0 ? (
                                                                subDetailBoxItem.postImages.slice(0, 3).map((imgName: string, imgIdx: number) => (
                                                                  <img
                                                                    key={imgIdx}
                                                                    style={{width:'32%', aspectRatio:'4/3', objectFit:'cover', borderRadius:'8px'}}
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
                                    {/* 조식 */}
                                    <div className="schedule-meal__info__wrapper__text">
                                      <span>[조식]</span>
                                      {editMealRowIndex === dayIndex ? (
                                        <DropdownBox
                                          widthmain="150px"
                                          height="30px"
                                          selectedValue={dayItem.breakfast || '선택'}
                                          options={datmealOptions}
                                          handleChange={(e:any) => {
                                            const copy = [...scheduleList];
                                            if (copy[selectedScheduleIndex].scheduleDetailData && copy[selectedScheduleIndex].scheduleDetailData.length > 0) {
                                              copy[selectedScheduleIndex].scheduleDetailData[dayIndex].breakfast = e.target.value;
                                            }
                                            (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                          }}
                                        />
                                      ) : (
                                        <span style={{marginLeft:'10px'}}>{dayItem.breakfast || '없음'}</span>
                                      )}
                                    </div>
                                    {/* 중식 */}
                                    <div className="schedule-meal__info__wrapper__text">
                                      <span>[중식]</span>
                                      {editMealRowIndex === dayIndex ? (
                                        <DropdownBox
                                          widthmain="150px"
                                          height="30px"
                                          selectedValue={dayItem.lunch || '선택'}
                                          options={datmealOptions}
                                          handleChange={(e:any) => {
                                            const copy = [...scheduleList];
                                            if (copy[selectedScheduleIndex].scheduleDetailData && copy[selectedScheduleIndex].scheduleDetailData.length > 0) {
                                              copy[selectedScheduleIndex].scheduleDetailData[dayIndex].lunch = e.target.value;
                                            }
                                            (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                          }}
                                        />
                                      ) : (
                                        <span style={{marginLeft:'10px'}}>{dayItem.lunch || '없음'}</span>
                                      )}
                                    </div>
                                    {/* 석식 */}
                                    <div className="schedule-meal__info__wrapper__text">
                                      <span>[석식]</span>
                                      {editMealRowIndex === dayIndex ? (
                                        <DropdownBox
                                          widthmain="150px"
                                          height="30px"
                                          selectedValue={dayItem.dinner || '선택'}
                                          options={datmealOptions}
                                          handleChange={(e:any)  => {
                                            const copy = [...scheduleList];
                                            if (copy[selectedScheduleIndex].scheduleDetailData && copy[selectedScheduleIndex].scheduleDetailData.length > 0) {
                                              copy[selectedScheduleIndex].scheduleDetailData[dayIndex].dinner = e.target.value;
                                            }
                                            (useRecoil ? setScheduleListWithRecoil : setScheduleList)(copy);
                                          }}
                                        />
                                      ) : (
                                        <span style={{marginLeft:'10px'}}>{dayItem.dinner || '없음'}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="schedule-additional__btn__wrapper schedule-schedule__btns">
                                    {editMealRowIndex === dayIndex ? (
                                      <button className="schedule-schedule__btn" style={{marginLeft:'8px'}} onClick={() => setEditMealRowIndex(-1)} title="완료">완료</button>
                                    ) : (
                                      <button className="schedule-schedule__btn" style={{marginLeft:'8px'}} onClick={() => setEditMealRowIndex(dayIndex)} title="식사 변경">식사 변경</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="schedule-additional__schedule__wrapper">
                                <div className="schedule-index__wrapper">
                                  <span>호텔</span>
                                </div>
                                <div className="schedule-additional__schedule__wrapper__textbox">
                                  <div className="schedule-additional__info__wrapper" style={{marginLeft:'0'}}>
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
                  scheduleList[selectedScheduleIndex].scheduleDetailData.forEach((_: any, idx: number) => {
                    allDayIndices.add(idx);
                  });
                  console.log('🔓 모두보기 - 모든 day 인덱스:', Array.from(allDayIndices));
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
                    console.log('🔒 모두닫기');
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
          
          // 모든 day 데이터 수집
          const allDaysData: any[] = [];
          
          const dayElements = scheduleData.map((dayItem: any, dayIndex: number) => {
            // 일정 데이터의 location 값에서 도시명 추출 (여러 도시를 배열로 저장)
            const cityNamesForDay: string[] = [];
            // 호텔 정보 location 기반 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
            let hotelNameForDay: string | undefined = undefined;
            let hotelLevelForDay: string | undefined = undefined;
            
            // 마지막 day인지 확인
            const isLastDay = dayIndex === scheduleData.length - 1;
            
            if (!isLastDay && props.cityInfoPerDay && dayItem.scheduleDetail && Array.isArray(dayItem.scheduleDetail)) {
              // scheduleDetail 배열에서 location 값을 찾기 (모든 location을 순회)
              for (const detail of dayItem.scheduleDetail) {
                if (detail.location && typeof detail.location === 'string' && detail.location.trim()) {
                  const location = detail.location.trim();
                  // location에서 도시명만 추출 (예: "2일차 - 루체른" -> "루체른")
                  const locationParts = location.split('-').map((part: string) => part.trim());
                  const locationCityName = locationParts[locationParts.length - 1] || location;
                  
                  // 이미 매핑된 도시명인지 확인
                  // 단, 해당 도시가 이미 사용되었는지 확인해야 함 (1박인 경우 다음 day부터 다른 도시 사용)
                  let shouldUseMappedCity = false;
                  let matchedCityName: string | undefined = undefined;
                  
                  if (cityNameMap.has(locationCityName)) {
                    const mappedCityName = cityNameMap.get(locationCityName);
                    if (mappedCityName) {
                      // 매핑된 도시명이 cityInfoPerDay에서 사용되지 않은 항목인지 확인
                      const mappedCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                        cityInfo.cityName === mappedCityName && !usedCityIndices.has(idx)
                      );
                      // 사용되지 않은 도시만 재사용 (같은 도시가 여러 박인 경우)
                      if (mappedCityInfo) {
                        shouldUseMappedCity = true;
                        matchedCityName = mappedCityName;
                        // 사용된 인덱스 추가
                        const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
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
                    const exactMatch = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                      !usedCityIndices.has(idx) &&
                      locationCityName === cityInfo.cityName
                    );
                    
                    if (exactMatch) {
                      const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
                        cityInfo.dayIndex === exactMatch.dayIndex && cityInfo.cityName === exactMatch.cityName
                      );
                      if (matchedIndex !== -1) {
                        usedCityIndices.add(matchedIndex);
                        cityNameMap.set(locationCityName, exactMatch.cityName);
                        matchedCityName = exactMatch.cityName;
                      }
                    } else {
                      // 정확한 매칭이 없으면 부분 매칭 시도
                      const matchedCity = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                        !usedCityIndices.has(idx) &&
                        (location.includes(cityInfo.cityName) || 
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
                  }
                  
                  // 매칭된 도시명을 배열에 추가 (중복 제거)
                  if (matchedCityName && !cityNamesForDay.includes(matchedCityName)) {
                    cityNamesForDay.push(matchedCityName);
                  }
                  
                  // 호텔 정보 매칭 (유럽 경로: cityInfoPerDay와 hotelInfoPerDay가 모두 있을 때)
                  // 첫 번째로 매칭된 도시의 호텔 정보 사용
                  // 같은 도시가 여러 박인 경우, 사용되지 않은 항목 중에서 찾기
                  if (props.hotelInfoPerDay && matchedCityName && !hotelNameForDay) {
                    // 사용되지 않은 항목 중에서 해당 도시명을 가진 항목 찾기
                    const matchedCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                      cityInfo.cityName === matchedCityName && !usedCityIndices.has(idx)
                    );
                    if (matchedCityInfo) {
                      const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
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
            
            // hotelInfoPerDay만 있을 때 (휴양지 경로) - 마지막 day가 아닐 때만 실행
            if (!isLastDay && props.hotelInfoPerDay && !props.cityInfoPerDay) {
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
            // 상품명에 있는 도시 이름만 정확히 매칭
            const matchedCityNamesFromLocations: string[] = [];
            if (props.cityInfoPerDay && locations.length > 0) {
              locations.forEach((location: string) => {
                // location이 정확히 도시명과 일치하는지 확인
                // "루체른", "인터라켄", "파리" 같은 단순한 도시명만 매칭
                const foundCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }) => {
                  // 정확히 일치하는 경우
                  if (cityInfo.cityName === location || location === cityInfo.cityName) {
                    return true;
                  }
                  // location에서 도시명만 추출 (예: "2일차 - 루체른" -> "루체른")
                  const locationParts = location.split('-').map((part: string) => part.trim());
                  const locationCityName = locationParts[locationParts.length - 1] || location;
                  // 추출한 도시명이 정확히 일치하는 경우
                  return cityInfo.cityName === locationCityName || locationCityName === cityInfo.cityName;
                });
                
                // 정확히 일치하는 도시명만 추가
                if (foundCityInfo && !matchedCityNamesFromLocations.includes(foundCityInfo.cityName)) {
                  matchedCityNamesFromLocations.push(foundCityInfo.cityName);
                }
              });
            }
            
            // cityNamesForDay와 matchedCityNamesFromLocations를 합쳐서 중복 제거
            const allCityNamesSet = new Set<string>();
            cityNamesForDay.forEach(city => allCityNamesSet.add(city));
            matchedCityNamesFromLocations.forEach(city => allCityNamesSet.add(city));
            
            // cityInfoPerDay의 dayIndex 순서대로 정렬
            let allCityNames: string[] = [];
            if (props.cityInfoPerDay && allCityNamesSet.size > 0) {
              const cityInfoPerDay = props.cityInfoPerDay;
              // dayIndex 순서대로 도시명 정렬
              const sortedCities: string[] = [];
              cityInfoPerDay.forEach((cityInfo: { dayIndex: number; cityName: string }) => {
                if (allCityNamesSet.has(cityInfo.cityName) && !sortedCities.includes(cityInfo.cityName)) {
                  sortedCities.push(cityInfo.cityName);
                }
              });
              // cityInfoPerDay에 없는 도시는 뒤에 추가
              allCityNamesSet.forEach(city => {
                if (!sortedCities.includes(city)) {
                  sortedCities.push(city);
                }
              });
              allCityNames = sortedCities;
            } else {
              allCityNames = Array.from(allCityNamesSet);
            }
            
            // cityNamesForDay 배열을 하이픈으로 연결
            const cityNameForDay = allCityNames.length > 0 ? allCityNames.join(' - ') : undefined;
            
            // 호텔 정보 매칭 (같은 도시가 여러 박인 경우, 각 박마다 호텔 정보 매칭) - 마지막 day가 아닐 때만 실행
            // cityNameForDay가 하나이고, hotelNameForDay가 없으면 다시 매칭 시도
            if (!isLastDay && props.hotelInfoPerDay && props.cityInfoPerDay && cityNameForDay && !hotelNameForDay) {
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
                const matchedCityInfo = props.cityInfoPerDay.find((cityInfo: { dayIndex: number; cityName: string }, idx: number) => 
                  cityInfo.cityName === firstCityName && !usedCityIndices.has(idx)
                );
                
                if (matchedCityInfo) {
                  const matchedHotel = props.hotelInfoPerDay.find((hotelInfo: { dayIndex: number; hotelName: string; hotelLevel: string }) => 
                    hotelInfo.dayIndex === matchedCityInfo.dayIndex
                  );
                  if (matchedHotel) {
                    hotelNameForDay = matchedHotel.hotelName;
                    hotelLevelForDay = matchedHotel.hotelLevel;
                    // 사용된 인덱스 추가
                    const matchedIndex = props.cityInfoPerDay.findIndex((cityInfo: { dayIndex: number; cityName: string }) => 
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

          // day 데이터 수집
          allDaysData.push({
            dayIndex,
            dayNumber: dayIndex + 1,
            cityNameForDay,
            hotelNameForDay,
            hotelLevelForDay,
            displayHotelName,
            displayHotelLevel,
            locations,
            locationsCount: locations.length,
            isExpanded: expandedLocationDays.has(dayIndex),
            dayItemHotel: dayItem.hotel,
            dayItemScore: dayItem.score,
            scheduleDetail: dayItem.scheduleDetail?.map((detail: any) => ({
              location: detail.location,
              isViewLocation: detail.isViewLocation,
              sort: detail.sort,
              st: detail.st,
              locationIcon: detail.locationIcon
            })) || []
          });

          return (
            <div key={dayIndex} className="schedule-floating-box-item">
              {isFloatingBoxExpanded ? (
                <>
                  <div className="schedule-floating-box-row">
                    
                    <div className="schedule-floating-box-day">
                      <span className="schedule-main__text">{dayIndex + 1} DAY</span>
                    </div>

                    
                    <div className="schedule-floating-box-hotel">
                      <span className="schedule-floating-box-hotel-name">
                        {isLastDay 
                          ? '' 
                          : (props.cityInfoPerDay
                              ? (cityNameForDay || '')  // location이 없으면 공백
                              : (dayItem.hotel || '-'))}
                      </span>
                    </div>

                    
                    <div className="schedule-floating-box-buttons">
                      <button
                        type="button"
                        className="schedule-floating-box-btn"
                        title="DAY 추가"
                        onClick={() => addDay(dayIndex)}
                      >+
                      </button>
                      <button
                        type="button"
                        className="schedule-floating-box-btn"
                        title="DAY 삭제"
                        onClick={() => deleteDay(dayIndex)}
                      >–
                      </button>
                      <button
                        type="button"
                        className="schedule-floating-box-btn"
                        title="DAY 위로"
                        onClick={() => moveDayUp(dayIndex)}
                      >▲
                      </button>
                      <button
                        type="button"
                        className="schedule-floating-box-btn"
                        title="DAY 아래로"
                        onClick={() => moveDayDown(dayIndex)}
                      >▼
                      </button>
                      {locations.length > 0 && (
                        <button
                          type="button"
                          className="schedule-floating-box-btn"
                          title={expandedLocationDays.has(dayIndex) ? "상세정보 닫기" : "상세정보 열기"}
                          onClick={() => {
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
                      
                      {!isLastDay && displayHotelName && (
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
        
        // 모든 day 데이터를 하나로 묶어서 콘솔 출력
        console.log('📋 플로팅 박스 - 모든 DAY 데이터:', {
          productName: props.productInfo?.productName || '일정 정보',
          selectedScheduleIndex,
          totalDays: scheduleData.length,
          cityInfoPerDay: props.cityInfoPerDay,
          hotelInfoPerDay: props.hotelInfoPerDay,
          expandedLocationDays: Array.from(expandedLocationDays),
          daysData: allDaysData
        });
        
        return dayElements;
        })()}
      </div>
      )}
    
           
     
      
    </div>     
  )
}
