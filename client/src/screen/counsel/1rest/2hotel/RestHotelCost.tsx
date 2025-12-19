import React from 'react';
import './RestHotelCost.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle76 from '../../../lastimages/counselrest/hotel/detail/rectangle-76.png';
import rectangle665 from '../../../lastimages/counselrest/hotel/detail/rectangle-665.png';
import rectangle664 from '../../../lastimages/counselrest/hotel/detail/rectangle-664.png';
import rectangle663 from '../../../lastimages/counselrest/hotel/detail/rectangle-663.png';
import rectangle580 from '../../../lastimages/counselrest/hotel/detail/rectangle-580.png';
import rectangle662 from '../../../lastimages/counselrest/hotel/detail/rectangle-662.png';
import rectangle661 from '../../../lastimages/counselrest/hotel/detail/rectangle-661.png';
import rectangle619 from '../../../lastimages/counselrest/hotel/detail/rectangle-619.png';
import reviewimage from '../../../lastimages/counselrest/hotel/detail/review.png';
import RatingBoard from '../../../common/RatingBoard';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recoilSelectedHotelData, recoilCustomerInfoFormData, recoilExchangeRate } from '../../../../RecoilStore';

import { format } from 'date-fns';
import axios from 'axios';
import { calculateSalePrice, comboRules } from '../hotelPriceManage/poolvillaPriceUtils';
import { calculatePoolvillaFinalPrice } from '../hotelPriceManage/poolvillaPriceCalculation';
import { calculateMinimumStayFinalPrice } from '../hotelPriceManage/minimumStayPriceCalculation';
import { calculatePerDayFinalPrice } from '../hotelPriceManage/perDayPriceCalculation';


export default function RestHotelCost() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;

  
  const setSelectedHotelData = useSetRecoilState(recoilSelectedHotelData);
  const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
  const exchangeRate = useRecoilValue(recoilExchangeRate);

  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
  const [productInfo, setProductInfo] = React.useState<any | null>(null);
  const [includeItems, setIncludeItems] = React.useState<string[]>([]);
  const [excludeItems, setExcludeItems] = React.useState<string[]>([]);
  const [scheduleCards, setScheduleCards] = React.useState<any[]>([]);
  const [periodText, setPeriodText] = React.useState<string>('');
  const [guestCount, setGuestCount] = React.useState<number>(2);
  const [pricePerPerson, setPricePerPerson] = React.useState<number>(0);
  const [travelPeriodDisplay, setTravelPeriodDisplay] = React.useState<string>('');
  // 각 카드별 선택된 룸타입 상태 (카드 ID를 키로 사용)
  const [selectedRoomTypes, setSelectedRoomTypes] = React.useState<{ [key: number]: string }>({});
  // 각 카드별 숙박 일수 상태 (카드 ID를 키로 사용)
  const [selectedNights, setSelectedNights] = React.useState<{ [key: number]: number }>({});

  // 호텔별 요금 관리 관련 상태
  const [hotelPriceStep, setHotelPriceStep] = React.useState<1 | 2>(1);
  const [selectedHotels, setSelectedHotels] = React.useState<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>>([]);
  const [hotel1Cost, setHotel1Cost] = React.useState<any>(null);
  const [hotel2Cost, setHotel2Cost] = React.useState<any>(null);
  const [hotel3Cost, setHotel3Cost] = React.useState<any>(null);
  const [hotel4Cost, setHotel4Cost] = React.useState<any>(null);
  const [isLoadingCost, setIsLoadingCost] = React.useState(false);
  const today = customerInfo.reserveDate || format(new Date(), 'yyyy-MM-dd');
  
  // 기존 호텔별 상태 (하위 호환성을 위해 유지)
  const [hotelHotelCost, setHotelHotelCost] = React.useState<any>(null);
  const [resortHotelCost, setResortHotelCost] = React.useState<any>(null);
  const [poolVillaHotelCost, setPoolVillaHotelCost] = React.useState<any>(null);
  
  // 랜드사 수수료/네고 정보 상태
  const [landCommissionTotal, setLandCommissionTotal] = React.useState<number>(0);
  const [landDiscountDefaultTotal, setLandDiscountDefaultTotal] = React.useState<number>(0);
  const [landDiscountSpecialTotal, setLandDiscountSpecialTotal] = React.useState<number>(0);
  const [landCurrency, setLandCurrency] = React.useState<string>('₩');
  
  // 호텔 변경 관련 상태
  const [allHotels, setAllHotels] = React.useState<any[]>([]);
  const [showHotelSelectModal, setShowHotelSelectModal] = React.useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = React.useState<number | null>(null);


  const btnSolids = [
    { text: '전경' },
    { text: '객실' },
    { text: '부대시설' }
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  // 리조트 + 풀빌라 조합에서 선택된 호텔 인덱스 (0: 리조트, 1: 풀빌라)
  const [selectedHotelTabIndex, setSelectedHotelTabIndex] = React.useState<number>(0);
  // 리조트 + 풀빌라 조합의 호텔 정보 저장
  const [resortPoolvillaHotels, setResortPoolvillaHotels] = React.useState<Array<{ hotel: any; hotelSort: string; hotelName: string }>>([]);
  // 호텔 선택 모달에서 사용할 호텔 리스트 (이미지 데이터 포함)
  const [hotelsWithFullData, setHotelsWithFullData] = React.useState<any[]>([]);

  // nights 문자열에서 숫자 추출 함수 (예: "2박" -> 2, "3박" -> 3)
  const extractNightsNumber = (nightsStr: string): number => {
    if (!nightsStr) return 0;
    const match = nightsStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // 날짜 포맷팅 함수 (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 룸타입 목록 추출 함수 (HotelPriceInfo 컴포넌트와 동일한 로직)
  const extractRoomTypes = (costInputArr: any[]): string[] => {
    const roomTypes = new Set<string>();
    costInputArr.forEach((cost: any) => {
      try {
        const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
        if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
          inputDefault.costByRoomType.forEach((rt: any) => {
            if (rt.roomType) roomTypes.add(rt.roomType);
          });
        }
      } catch (e) {
        // ignore
      }
    });
    return Array.from(roomTypes);
  };

  // 카드의 호텔 타입에 따라 해당하는 룸타입 목록 가져오기
  const getRoomTypesForCard = React.useCallback((card: any): string[] => {
    const hotelSort = card.badge; // '호텔', '리조트', '풀빌라'
    const cardIndex = card.id - 1; // card.id는 1부터 시작, 배열 인덱스는 0부터
    
    // 새로운 구조에서 인덱스별로 찾기
    const hotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
    if (cardIndex >= 0 && cardIndex < hotelCosts.length && hotelCosts[cardIndex] && hotelCosts[cardIndex].costInput) {
      return extractRoomTypes(hotelCosts[cardIndex].costInput);
    }
    
    // 하위 호환성을 위해 기존 방식도 지원
    if (hotelSort === '호텔' && hotelHotelCost && hotelHotelCost.costInput) {
      return extractRoomTypes(hotelHotelCost.costInput);
    } else if (hotelSort === '리조트' && resortHotelCost && resortHotelCost.costInput) {
      return extractRoomTypes(resortHotelCost.costInput);
    } else if (hotelSort === '풀빌라' && poolVillaHotelCost && poolVillaHotelCost.costInput) {
      return extractRoomTypes(poolVillaHotelCost.costInput);
    }
    
    return [];
  }, [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost]);

  // 기간타입 결정 (리조트+풀빌라 조합: 2+2, 1+3, 3+2 등, 또는 풀빌라만: 3, 4)
  const getPeriodType = (): string | null => {
    if (!scheduleCards || scheduleCards.length === 0) return null;
    
    // 첫 번째 리조트와 풀빌라의 박수만 사용 (3개 조합의 경우)
    const resortCards = scheduleCards.filter(card => card.badge === '리조트');
    const poolCards = scheduleCards.filter(card => card.badge === '풀빌라');
    const firstResortCard = resortCards[0];
    const firstPoolCard = poolCards[0];
    
    let resortNights = 0;
    let poolVillaNights = 0;
    
    if (firstResortCard) {
      resortNights = selectedNights[firstResortCard.id] || extractNightsNumber(firstResortCard.nights || '');
    }
    if (firstPoolCard) {
      poolVillaNights = selectedNights[firstPoolCard.id] || extractNightsNumber(firstPoolCard.nights || '');
    }
    
    // 리조트와 풀빌라가 모두 있는 경우: "리조트박수+풀빌라박수" 형식
    if (resortNights > 0 && poolVillaNights > 0) {
      return `${resortNights}+${poolVillaNights}`;
    }
    
    // 리조트가 없고 풀빌라만 있는 경우: "3", "4" 형식 (기존 호환성 유지)
    if (resortNights === 0 && poolVillaNights > 0) {
      if (poolVillaNights === 3) {
        return '3';
      } else if (poolVillaNights === 4) {
        return '4';
      }
    }
    
    return null;
  };




  // 현재 탭에 따른 이미지 리스트 (전경 / 객실 / 부대시설)
  const getCurrentImages = () => {
    if (activeTab === 0) return imageAllView; // 전경
    if (activeTab === 1) return imageRoomView; // 객실
    return imageEtcView; // 수영장/다이닝/기타 → 부대시설 이미지 공통 사용
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  useEffect(() => {
    if (!stateProps) return;

    const h = stateProps.hotelInfo;
    const p = stateProps.productInfo;

    // 호텔 정보 설정
    setHotelInfo(h);

    // 호텔 이미지 및 객실 타입 파싱
    if (h) {
      try {
        const allView = h.imageNamesAllView ? JSON.parse(h.imageNamesAllView) : [];
        setImageAllView(Array.isArray(allView) ? allView : []);
      } catch {
        setImageAllView([]);
      }

      try {
        const roomView = h.imageNamesRoomView ? JSON.parse(h.imageNamesRoomView) : [];
        setImageRoomView(Array.isArray(roomView) ? roomView : []);
      } catch {
        setImageRoomView([]);
      }

      try {
        const etcView = h.imageNamesEtcView ? JSON.parse(h.imageNamesEtcView) : [];
        setImageEtcView(Array.isArray(etcView) ? etcView : []);
      } catch {
        setImageEtcView([]);
      }

      try {
        const roomTypesCopy = h.hotelRoomTypes ? JSON.parse(h.hotelRoomTypes) : [];
        setRoomTypes(Array.isArray(roomTypesCopy) ? roomTypesCopy : []);
      } catch {
        setRoomTypes([]);
      }
    }

    // 상품 정보 설정
    setProductInfo(p);

    if (p) {
      // 여행 기간 파싱
      if (p.tourPeriodData) {
        try {
          const periodData = JSON.parse(p.tourPeriodData);
          const night = periodData.periodNight || '';
          const day = periodData.periodDay || '';
          const txt = `${night} ${day}`.trim();
          setPeriodText(txt);
        } catch {
          setPeriodText('');
        }
      }

      // 포함 사항
      try {
        const includes = p.includeNote ? JSON.parse(p.includeNote) : [];
        setIncludeItems(Array.isArray(includes) ? includes : []);
      } catch {
        setIncludeItems([]);
      }

      // 불포함 사항
      try {
        const excludes = p.notIncludeNote ? JSON.parse(p.notIncludeNote) : [];
        setExcludeItems(Array.isArray(excludes) ? excludes : []);
      } catch {
        setExcludeItems([]);
      }

      // 호텔 구성 카드용 스케줄 파싱 (productScheduleData)
      // stateProps에서 전달받은 selectedHotels가 있으면 우선 사용하여 호텔명 설정
      try {
        const sched = p.productScheduleData ? JSON.parse(p.productScheduleData) : [];
        
        // Recoil에서 travelPeriod 시작 날짜 가져오기
        let startDate: Date | null = null;
        if (customerInfo.travelPeriod) {
          const travelPeriod = customerInfo.travelPeriod.trim();
          if (travelPeriod.includes('~')) {
            const parts = travelPeriod.split('~').map(part => part.trim());
            if (parts.length === 2) {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(parts[0])) {
                startDate = new Date(parts[0]);
              }
            }
          } else {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(travelPeriod)) {
              startDate = new Date(travelPeriod);
            }
          }
        }
        
        let currentDate = startDate ? new Date(startDate) : null;
        
        // stateProps에서 전달받은 selectedHotels 확인
        const initialSelectedHotels = stateProps?.selectedHotels || [];
        
        const cards = (Array.isArray(sched) ? sched : []).map((s: any, idx: number) => {
          const hotelSort = s.sort || s.hotelSort || '';
          let hotelName = s.roomTypeName || hotelSort || '';
          
          // stateProps에서 전달받은 selectedHotels에서 해당 인덱스의 호텔명 가져오기
          const selectedHotel = initialSelectedHotels.find((sh: { index: number; hotelSort: string; dayNight?: string; hotel: any | null }) => sh.index === idx);
          if (selectedHotel?.hotel?.hotelNameKo) {
            hotelName = selectedHotel.hotel.hotelNameKo;
          }
          
          // 날짜 계산
          let dayText = `${idx + 1}일차`; // 기본값
          if (currentDate) {
            dayText = formatDate(currentDate);
            
            // 다음 카드를 위한 날짜 계산 (현재 카드의 nights 일수 추가)
            const nights = extractNightsNumber(s.dayNight || '');
            if (nights > 0) {
              const nextDate = new Date(currentDate);
              nextDate.setDate(nextDate.getDate() + nights);
              currentDate = nextDate;
            }
          }
          
          return {
            id: idx + 1,
            day: dayText,
            badge: hotelSort,
            title: hotelName,
            nights: s.dayNight || '',
          };
        });
        
        setScheduleCards(cards);
      } catch {
        setScheduleCards([]);
      }
    }
  }, [stateProps, customerInfo.travelPeriod]);

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 호텔이 2개 이상일 때 탭 표시를 위한 호텔 정보 저장
  useEffect(() => {
    // selectedHotels에서 호텔이 2개 이상인지 확인
    const validHotels = selectedHotels.filter(sh => sh.hotel && sh.hotel.id);
    
    if (validHotels.length >= 2) {
      // 호텔이 2개 이상인 경우 탭 표시
      const hotels = validHotels.map((sh, index) => ({
        hotel: sh.hotel,
        hotelSort: sh.hotelSort,
        hotelName: sh.hotel.hotelNameKo || sh.hotelSort || `호텔 ${index + 1}`
      }));
      
      setResortPoolvillaHotels(hotels);
      // 기본적으로 첫 번째 호텔 선택
      setSelectedHotelTabIndex(0);
      return;
    }

    // selectedHotels에서 찾지 못한 경우 scheduleCards에서 확인
    if (scheduleCards && scheduleCards.length >= 2) {
      const validCards = scheduleCards.filter(card => {
        const hotel = selectedHotels?.find(sh => sh.index === card.id - 1 && sh.hotel);
        return hotel && hotel.hotel;
      });

      if (validCards.length >= 2) {
        const hotels = validCards.map(card => {
          const hotel = selectedHotels?.find(sh => sh.index === card.id - 1 && sh.hotel);
          return {
            hotel: hotel?.hotel,
            hotelSort: card.badge,
            hotelName: hotel?.hotel?.hotelNameKo || card.title || card.badge
          };
        }).filter(h => h.hotel); // hotel이 있는 것만 필터링

        if (hotels.length >= 2) {
          setResortPoolvillaHotels(hotels);
          setSelectedHotelTabIndex(0);
          return;
        }
      }
    }

    // 호텔이 2개 미만인 경우
    setResortPoolvillaHotels([]);
  }, [selectedHotels, scheduleCards]);

  // resortPoolvillaHotels가 변경될 때 selectedHotelTabIndex 초기화
  useEffect(() => {
    if (resortPoolvillaHotels.length > 0 && selectedHotelTabIndex >= resortPoolvillaHotels.length) {
      setSelectedHotelTabIndex(0);
    }
  }, [resortPoolvillaHotels]);

  // 선택된 호텔 탭에 따라 이미지 업데이트
  useEffect(() => {
    if (resortPoolvillaHotels.length === 0) {
      // 리조트 + 풀빌라 조합이 아니면 기존 로직 유지
      return;
    }

    const selectedHotel = resortPoolvillaHotels[selectedHotelTabIndex];
    if (!selectedHotel?.hotel) return;

    const h = selectedHotel.hotel;

    try {
      const allView = h.imageNamesAllView ? JSON.parse(h.imageNamesAllView) : [];
      setImageAllView(Array.isArray(allView) ? allView : []);
    } catch {
      setImageAllView([]);
    }

    try {
      const roomView = h.imageNamesRoomView ? JSON.parse(h.imageNamesRoomView) : [];
      setImageRoomView(Array.isArray(roomView) ? roomView : []);
    } catch {
      setImageRoomView([]);
    }

    try {
      const etcView = h.imageNamesEtcView ? JSON.parse(h.imageNamesEtcView) : [];
      setImageEtcView(Array.isArray(etcView) ? etcView : []);
    } catch {
      setImageEtcView([]);
    }

    try {
      const roomTypesCopy = h.hotelRoomTypes ? JSON.parse(h.hotelRoomTypes) : [];
      setRoomTypes(Array.isArray(roomTypesCopy) ? roomTypesCopy : []);
    } catch {
      setRoomTypes([]);
    }

    // 호텔 정보도 업데이트
    setHotelInfo(h);
  }, [selectedHotelTabIndex, resortPoolvillaHotels]);

  // 호텔 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [selectedHotelTabIndex]);

  // Recoil에서 travelPeriod를 가져와서 여행기간 표시 필드에 설정
  useEffect(() => {
    if (customerInfo.travelPeriod) {
      setTravelPeriodDisplay(customerInfo.travelPeriod);
    } else if (periodText) {
      // travelPeriod가 없으면 기존 periodText 사용
      setTravelPeriodDisplay(periodText);
    }
  }, [customerInfo.travelPeriod, periodText]);

  // 랜드사 수수료/네고 정보 가져오기
  const fetchLandCommission = React.useCallback(async () => {
    try {
      const url = `${AdminURL}/landcompany/getlandcompanyone/${stateProps.city}/${productInfo.landCompany}`;
      const res = await axios.get(url);
      
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const lc = res.data[0];
        
        const currency = lc.applyCurrency || '₩';
        setLandCurrency(currency || '₩');
        
        let commissionParsed: any[] = [];
        let discountDefaultParsed: any[] = [];
        let discountSpecialParsed: any[] = [];
        let commissionTotal = 0;
        let discountDefaultTotal = 0;
        let discountSpecialTotal = 0;
        
        try {
          commissionParsed = typeof lc.commission === 'string' ? JSON.parse(lc.commission) : (Array.isArray(lc.commission) ? lc.commission : []);
        } catch (e) {
          commissionParsed = [];
        }
        
        try {
          discountDefaultParsed = typeof lc.discountDefault === 'string' ? JSON.parse(lc.discountDefault) : (Array.isArray(lc.discountDefault) ? lc.discountDefault : []);
        } catch (e) {
          discountDefaultParsed = [];
        }
        
        try {
          discountSpecialParsed = typeof lc.discountSpecial === 'string' ? JSON.parse(lc.discountSpecial) : (Array.isArray(lc.discountSpecial) ? lc.discountSpecial : []);
        } catch (e) {
          discountSpecialParsed = [];
        }
        
        if (Array.isArray(commissionParsed) && commissionParsed.length > 0) {
          commissionParsed.forEach((item: any) => {
            const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
            if (!isNaN(chargeNum)) commissionTotal += chargeNum;
          });
        }
        setLandCommissionTotal(commissionTotal);
        
        if (Array.isArray(discountDefaultParsed) && discountDefaultParsed.length > 0) {
          discountDefaultParsed.forEach((item: any) => {
            const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
            if (!isNaN(chargeNum)) discountDefaultTotal += chargeNum;
          });
        }
        setLandDiscountDefaultTotal(discountDefaultTotal);
        
        if (Array.isArray(discountSpecialParsed) && discountSpecialParsed.length > 0) {
          discountSpecialParsed.forEach((item: any) => {
            const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
            if (!isNaN(chargeNum)) discountSpecialTotal += chargeNum;
          });
        }
        setLandDiscountSpecialTotal(discountSpecialTotal);
        
      } else {
        setLandCommissionTotal(0);
        setLandDiscountDefaultTotal(0);
        setLandDiscountSpecialTotal(0);
        setLandCurrency('₩');
      }
    } catch (e) {
      setLandCommissionTotal(0);
      setLandDiscountDefaultTotal(0);
      setLandDiscountSpecialTotal(0);
      setLandCurrency('₩');
    }
  }, [productInfo?.landCompany, productInfo?.city]);

  // 호텔 리스트 가져오기
  const fetchAllHotels = React.useCallback(async () => {
    try {
      let hotels: any[] = [];
      
      if (productInfo?.city || stateProps?.city) {
        const city = productInfo?.city || stateProps?.city;
        const res = await axios.get(`${AdminURL}/hotel/gethotelcity/${city}`);
        if (res.data && res.data !== false) {
          hotels = Array.isArray(res.data) ? res.data : [res.data];
        }
      } else {
        const res = await axios.get(`${AdminURL}/hotel/gethotelsall`);
        if (res.data && res.data !== false) {
          hotels = Array.isArray(res.data) ? res.data : [res.data];
        }
      }
      
      setAllHotels(hotels);
    } catch (error) {
      setAllHotels([]);
    }
  }, [productInfo?.city, stateProps?.city]);

  // productInfo가 로드되면 랜드사 수수료 정보 가져오기 및 호텔 리스트 가져오기
  useEffect(() => {
    if (productInfo) {
      fetchLandCommission();
      fetchAllHotels();
    }
  }, [productInfo, fetchLandCommission, fetchAllHotels]);

  // 랜드사 수수료 상태 변경 시 필요한 부수 효과가 있다면 이곳에서 처리
  useEffect(() => {
    // 현재는 추가 처리 없음
  }, [landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency]);

  // 호텔 변경 핸들러
  const handleHotelChange = async (cardIndex: number) => {
    setSelectedCardIndex(cardIndex);
    setShowHotelSelectModal(true);
    
    // 모달이 열릴 때 해당 타입의 호텔 데이터 가져오기
    const card = scheduleCards.find(c => c.id === cardIndex);
    if (!card) return;
    
    // 해당 타입의 호텔만 필터링
    const filteredHotels = allHotels.filter((hotel: any) => {
      const hotelType = hotel.hotelType || hotel.hotelSort;
      return hotelType === card.badge || 
             (hotel.hotelType && hotel.hotelType.split(' ').includes(card.badge));
    });
    
    // 이미지 데이터가 없는 호텔들을 API로 가져오기
    const hotelsWithImages = await Promise.all(
      filteredHotels.map(async (hotel: any) => {
        const hasImages = hotel.imageNamesAllView && 
                         hotel.imageNamesAllView !== '[]' && 
                         hotel.imageNamesAllView !== '';
        
        if (!hasImages && hotel.hotelNameKo && stateProps?.city) {
        try {
          const hotelName = encodeURIComponent(hotel.hotelNameKo);
          const city = encodeURIComponent(stateProps.city);
          const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
          if (res.data && res.data !== false) {
            const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
            if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
              return hotelData;
            }
          }
        } catch (error) {
          // 이미지 정보 로딩 실패는 치명적이지 않으므로 무시
        }
        }
        
        return hotel;
      })
    );
    
    setHotelsWithFullData(hotelsWithImages);
  };

  // 호텔 선택 완료 핸들러
  const handleHotelSelect = async (selectedHotel: any) => {
    if (selectedCardIndex === null) return;
    
    const card = scheduleCards.find(c => c.id === selectedCardIndex);
    if (!card) return;
    
    // selectedHotels 업데이트
    // card.id - 1을 인덱스로 사용하되, productScheduleData의 순서와 일치하도록 처리
    const targetIndex = card.id - 1;
    const updatedSelectedHotels = [...selectedHotels];
    
    // 인덱스로 먼저 찾기
    let hotelIndex = updatedSelectedHotels.findIndex(sh => sh.index === targetIndex);
    
    // 인덱스로 찾지 못하면 hotelSort와 badge로 찾기
    if (hotelIndex < 0) {
      hotelIndex = updatedSelectedHotels.findIndex(sh => sh.hotelSort === card.badge);
    }
    
    if (hotelIndex >= 0) {
      // 기존 항목 업데이트
      updatedSelectedHotels[hotelIndex] = {
        ...updatedSelectedHotels[hotelIndex],
        hotel: selectedHotel,
        index: targetIndex // 인덱스도 업데이트
      };
    } else {
      // 새로운 항목 추가
      updatedSelectedHotels.push({
        index: targetIndex,
        hotelSort: card.badge,
        dayNight: card.nights?.replace('박', ''),
        hotel: selectedHotel
      });
    }
    
    // 인덱스 순서대로 정렬
    updatedSelectedHotels.sort((a, b) => a.index - b.index);
    
    // scheduleCards 즉시 업데이트 (호텔명 변경)
    const updatedCards = scheduleCards.map(c => 
      c.id === card.id ? { ...c, title: selectedHotel.hotelNameKo || c.title } : c
    );
    setScheduleCards(updatedCards);
    
    // selectedHotels 업데이트
    setSelectedHotels(updatedSelectedHotels);
    
    // 모달 닫기
    setShowHotelSelectModal(false);
    setSelectedCardIndex(null);
    
    // 선택된 호텔이 현재 표시 중인 호텔인 경우 이미지 업데이트
    // 리조트 + 풀빌라 조합인 경우
    if (resortPoolvillaHotels.length > 0) {
      const selectedIndex = resortPoolvillaHotels.findIndex(h => h.hotel.id === selectedHotel.id);
      if (selectedIndex >= 0) {
        setSelectedHotelTabIndex(selectedIndex);
      }
    } else {
      // 단일 호텔인 경우 이미지 직접 업데이트
      if (selectedHotel.imageNamesAllView && selectedHotel.imageNamesAllView !== '[]') {
        try {
          const allView = selectedHotel.imageNamesAllView ? JSON.parse(selectedHotel.imageNamesAllView) : [];
          setImageAllView(Array.isArray(allView) ? allView : []);
        } catch {
          setImageAllView([]);
        }

        try {
          const roomView = selectedHotel.imageNamesRoomView ? JSON.parse(selectedHotel.imageNamesRoomView) : [];
          setImageRoomView(Array.isArray(roomView) ? roomView : []);
        } catch {
          setImageRoomView([]);
        }

        try {
          const etcView = selectedHotel.imageNamesEtcView ? JSON.parse(selectedHotel.imageNamesEtcView) : [];
          setImageEtcView(Array.isArray(etcView) ? etcView : []);
        } catch {
          setImageEtcView([]);
        }

        try {
          const roomTypesCopy = selectedHotel.hotelRoomTypes ? JSON.parse(selectedHotel.hotelRoomTypes) : [];
          setRoomTypes(Array.isArray(roomTypesCopy) ? roomTypesCopy : []);
        } catch {
          setRoomTypes([]);
        }

        // 호텔 정보도 업데이트
        setHotelInfo(selectedHotel);
        setSelectedMainImageIndex(0);
      }
    }
    
    // 요금 정보 다시 가져오기 (이것이 hotel1Cost, hotel2Cost 등을 업데이트함)
    await fetchSelectedHotelsCosts(updatedSelectedHotels);
    
    // 룸타입 초기화 (새 호텔의 룸타입에 맞춰) - 요금 정보 로드 후 실행
    setTimeout(() => {
      const newSelectedRoomTypes: { [key: number]: string } = {};
      updatedCards.forEach((c) => {
        const roomTypes = getRoomTypesForCard(c);
        if (roomTypes.length > 0) {
          // 기존 선택값이 새 호텔에 유효한지 확인
          const currentRoomType = selectedRoomTypes[c.id];
          if (currentRoomType && roomTypes.includes(currentRoomType)) {
            newSelectedRoomTypes[c.id] = currentRoomType;
          } else {
            newSelectedRoomTypes[c.id] = roomTypes[0];
          }
        }
      });
      
      if (Object.keys(newSelectedRoomTypes).length > 0) {
        setSelectedRoomTypes(prev => ({ ...prev, ...newSelectedRoomTypes }));
      }
    }, 500); // 요금 정보 로드 후 실행
  };

  // productScheduleData에서 필요한 호텔 타입 추출
  const getRequiredHotelTypes = React.useCallback(() => {
    const hotelTypes = new Set<string>();
    
    // productScheduleData에서 호텔 타입 추출
    if (productInfo?.productScheduleData) {
    try {
      const scheduleData = JSON.parse(productInfo.productScheduleData);
      if (Array.isArray(scheduleData) && scheduleData.length > 0) {
        for (const item of scheduleData) {
          if (item.hotelSort && typeof item.hotelSort === 'string') {
            hotelTypes.add(item.hotelSort);
          }
        }
      }
    } catch (e) {
      // productScheduleData 파싱 오류는 무시하고 기본 타입만 사용
    }
    }
    
    // 미니멈스테이의 경우 리조트나 호텔이 필요 (productScheduleData에 없어도 추가)
    if (productInfo?.costType === '미니멈스테이') {
      if (!hotelTypes.has('리조트') && !hotelTypes.has('호텔')) {
        // 리조트 우선, 없으면 호텔
        hotelTypes.add('리조트');
      }
    }
    
    return Array.from(hotelTypes);
  }, [productInfo?.productScheduleData, productInfo?.costType]);

  // fetchSelectedHotelsCosts 함수를 useRef로 저장 (stale closure 방지)
  const fetchSelectedHotelsCostsRef = React.useRef<((selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => Promise<void>) | null>(null);

  // 선택된 호텔들의 요금 정보 가져오기
  const fetchSelectedHotelsCosts = React.useCallback(async (selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => {
    setIsLoadingCost(true);
    try {
      const hotelsToFetch = selectedHotelsList || selectedHotels;
      
      const costPromises = hotelsToFetch.map(async ({ index, hotel }) => {
        if (!hotel) {
          return { index, hotel: null, costInput: [] };
        }
        
        try {
          // Recoil에서 예약일자와 선택기간 가져오기
          const reserveDate = customerInfo.reserveDate || format(new Date(), 'yyyy-MM-dd');
          
          // travelPeriod에서 시작일과 종료일 파싱 (예: "2025-01-01 ~ 2025-01-10")
          let dateStart = '';
          let dateEnd = '';
          if (customerInfo.travelPeriod) {
            const travelPeriod = customerInfo.travelPeriod.trim();
            if (travelPeriod.includes('~')) {
              const parts = travelPeriod.split('~').map(part => part.trim());
              if (parts.length === 2) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (dateRegex.test(parts[0])) {
                  dateStart = parts[0];
                }
                if (dateRegex.test(parts[1])) {
                  dateEnd = parts[1];
                }
              }
            } else {
              // ~가 없으면 단일 날짜로 처리
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(travelPeriod)) {
                dateStart = travelPeriod;
                dateEnd = travelPeriod;
              }
            }
          }
          
          const costInputRes = await axios.post(`${AdminURL}/hotel/gethotelcostbyfilters`, {
            postId: hotel.id,
            // dateStart: dateStart,
            // dateEnd: dateEnd,
            // reserveDate: reserveDate,
            landCompany: productInfo?.landCompany && productInfo.landCompany !== '전체' ? productInfo.landCompany : ''
          });
          
          // API 응답이 false인 경우 빈 배열 반환
          if (costInputRes.data === false) {
            return {
              index,
              hotel,
              costInput: []
            };
          }
          
          const costInputData = costInputRes.data 
            ? (Array.isArray(costInputRes.data) ? costInputRes.data : [costInputRes.data])
            : [];
          
          return {
            index,
            hotel,
            costInput: costInputData
          };
        } catch (error) {
          return {
            index,
            hotel,
            costInput: []
          };
        }
      });
      
      const costs = await Promise.all(costPromises);
      
      // 상태를 한 번에 업데이트 (배치 업데이트)
      const hotelCosts: { [key: number]: any } = {};
      let newHotelHotelCost: any = null;
      let newResortHotelCost: any = null;
      let newPoolVillaHotelCost: any = null;
      
      costs.forEach(({ index, hotel, costInput }) => {
        const hotelCostData = hotel ? {
          hotel,
          costInput
        } : null;
        
        if (hotelCostData) {
          hotelCosts[index] = hotelCostData;
        }
        
        // 하위 호환성을 위해 타입별로도 설정
        if (hotel) {
          const hotelType = hotel.hotelType || hotel.hotelSort;
          if (hotelType === '호텔') {
            newHotelHotelCost = hotelCostData;
          } else if (hotelType === '리조트') {
            newResortHotelCost = hotelCostData;
          } else if (hotelType === '풀빌라') {
            newPoolVillaHotelCost = hotelCostData;
          }
        }
      });
      
      // 인덱스별로 호텔 요금 정보 설정 (직접 업데이트)
      // React의 상태 업데이트는 배치 처리되므로 순서대로 호출해도 문제 없음
      setHotel1Cost(hotelCosts[0] || null);
      setHotel2Cost(hotelCosts[1] || null);
      setHotel3Cost(hotelCosts[2] || null);
      setHotel4Cost(hotelCosts[3] || null);
      setHotelHotelCost(newHotelHotelCost);
      setResortHotelCost(newResortHotelCost);
      setPoolVillaHotelCost(newPoolVillaHotelCost);
    } catch (error) {
      // 호텔 요금 정보 가져오기 실패 시 로딩만 해제
    } finally {
      setIsLoadingCost(false);
    }
  }, [customerInfo.reserveDate, customerInfo.travelPeriod, productInfo]); // customerInfo의 reserveDate와 travelPeriod를 의존성에 추가

  // fetchSelectedHotelsCosts 함수를 ref에 저장
  React.useEffect(() => {
    fetchSelectedHotelsCostsRef.current = fetchSelectedHotelsCosts;
  }, [fetchSelectedHotelsCosts]);

  // 초기화 완료 플래그 (한 번만 실행되도록)
  const initializationRef = React.useRef(false);

  // 페이지 로드 시 자동으로 호텔 선택 및 요금 정보 가져오기
  useEffect(() => {
    if (!hotelInfo || !productInfo) return;
    if (initializationRef.current) return; // 이미 초기화되었으면 실행하지 않음

    const initializeHotels = async () => {
      initializationRef.current = true; // 초기화 시작 표시
      
      // stateProps에서 전달받은 selectedHotels가 있으면 우선 사용
      if (stateProps?.selectedHotels && Array.isArray(stateProps.selectedHotels) && stateProps.selectedHotels.length > 0) {
        const hasSelectedHotel = stateProps.selectedHotels.some((item: { index: number; hotelSort: string; dayNight?: string; hotel: any | null }) => item.hotel !== null);
        if (hasSelectedHotel) {
          setSelectedHotels(stateProps.selectedHotels);
          // costType에 따라 바로 2단계로 이동
          setHotelPriceStep(2);
          if (fetchSelectedHotelsCostsRef.current) {
            await fetchSelectedHotelsCostsRef.current(stateProps.selectedHotels);
          }
          return;
        }
      }

      // productScheduleData에서 스케줄 정보 추출
      let scheduleItems: Array<{ index: number; hotelSort: string; dayNight?: string }> = [];
      if (productInfo.productScheduleData) {
        try {
          const scheduleData = JSON.parse(productInfo.productScheduleData);
          if (Array.isArray(scheduleData) && scheduleData.length > 0) {
            scheduleItems = scheduleData.slice(0, 4).map((item: any, index: number) => ({
              index,
              hotelSort: item.hotelSort || '',
              dayNight: item.dayNight
            }));
          }
        } catch (e) {
          // productScheduleData 파싱 오류 시 scheduleItems는 빈 배열로 유지
        }
      }
      
      // 미니멈스테이인 경우 리조트/호텔 추가
      if (productInfo.costType === '미니멈스테이' && scheduleItems.length === 0) {
        // 현재 호텔의 타입을 우선 사용, 없으면 리조트
        const currentHotelSort = hotelInfo.hotelSort || hotelInfo.hotelType || '리조트';
        const hotelSortForMinimumStay = (currentHotelSort === '리조트' || currentHotelSort === '호텔') ? currentHotelSort : '리조트';
        scheduleItems = [{
          index: 0,
          hotelSort: hotelSortForMinimumStay,
          dayNight: '3'
        }];
      }

      if (scheduleItems.length === 0) return;

      const initialSelectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }> = 
        scheduleItems.map(item => ({ ...item, hotel: null }));

      const hotelSort = hotelInfo.hotelSort;
      const hotelType = hotelInfo.hotelType;

      // 현재 호텔을 적절한 인덱스에 자동 선택
      for (let i = 0; i < scheduleItems.length; i++) {
        const item = scheduleItems[i];
        // 미니멈스테이인 경우 현재 호텔이 리조트나 호텔이면 무조건 선택
        if (productInfo.costType === '미니멈스테이' && (hotelSort === '리조트' || hotelSort === '호텔' || hotelType === '리조트' || hotelType === '호텔')) {
          if ((hotelSort === item.hotelSort || hotelType === item.hotelSort || 
               (item.hotelSort === '리조트' && (hotelSort === '리조트' || hotelType === '리조트')) ||
               (item.hotelSort === '호텔' && (hotelSort === '호텔' || hotelType === '호텔'))) && 
              !initialSelectedHotels[i].hotel) {
            initialSelectedHotels[i].hotel = hotelInfo;
            break;
          }
        } else if ((hotelSort === item.hotelSort || hotelType === item.hotelSort) && !initialSelectedHotels[i].hotel) {
          initialSelectedHotels[i].hotel = hotelInfo;
          break;
        }
      }

      // 나머지 호텔들을 랜덤으로 선택
      try {
        let hotels: any[] = [];
        
        if (productInfo.city) {
          const res = await axios.get(`${AdminURL}/hotel/gethotelcity/${productInfo.city}`);
          if (res.data && res.data !== false) {
            hotels = Array.isArray(res.data) ? res.data : [res.data];
          }
        } else {
          const res = await axios.get(`${AdminURL}/hotel/gethotelsall`);
          if (res.data && res.data !== false) {
            hotels = Array.isArray(res.data) ? res.data : [res.data];
          }
        }

        for (let i = 0; i < initialSelectedHotels.length; i++) {
          if (!initialSelectedHotels[i].hotel) {
            const requiredType = initialSelectedHotels[i].hotelSort;
            const matchingHotels = hotels.filter((hotel: any) => {
              const hotelType = hotel.hotelType || hotel.hotelSort;
              return hotelType === requiredType || 
                     (hotel.hotelType && hotel.hotelType.split(' ').includes(requiredType));
            });

            if (matchingHotels.length > 0) {
              const randomHotel = matchingHotels[Math.floor(Math.random() * matchingHotels.length)];
              initialSelectedHotels[i].hotel = randomHotel;
            }
          }
        }
      } catch (error) {
        // 호텔 정보 가져오기 오류는 초기 자동 선택만 건너뜀
      }

      // 선택된 호텔이 있으면 요금 정보 가져오기 및 바로 2단계로 이동
      const hasSelectedHotel = initialSelectedHotels.some(item => item.hotel !== null);
      if (hasSelectedHotel) {
        setSelectedHotels(initialSelectedHotels);
        // costType에 따라 바로 2단계로 이동
        setHotelPriceStep(2);
        if (fetchSelectedHotelsCostsRef.current) {
          await fetchSelectedHotelsCostsRef.current(initialSelectedHotels);
        }
        
        // 요금 정보가 로드된 후 각 카드의 첫 번째 룸타입 자동 선택
        // 이 부분은 fetchSelectedHotelsCosts가 완료된 후 실행되므로
        // 별도의 useEffect에서 처리됨
      }
    };

    initializeHotels();
  }, [hotelInfo, productInfo, stateProps]); // fetchSelectedHotelsCosts 의존성 제거

  // selectedHotels가 업데이트되면 scheduleCards의 호텔명 및 날짜 업데이트
  useEffect(() => {
    // 미니멈스테이인 경우 productScheduleData가 없어도 리조트/호텔 카드를 생성해야 함
    if (productInfo?.costType !== '미니멈스테이' && (!productInfo?.productScheduleData || selectedHotels.length === 0)) {
      return;
    }
    
    // 미니멈스테이인 경우 리조트나 호텔이 선택되어 있지 않으면 return
    if (productInfo?.costType === '미니멈스테이' && !selectedHotels.some(sh => sh.hotel && (sh.hotelSort === '리조트' || sh.hotelSort === '호텔'))) {
      return;
    }

    try {
      const sched = productInfo?.productScheduleData ? JSON.parse(productInfo.productScheduleData) : [];
      if (!Array.isArray(sched)) {
        // 미니멈스테이인 경우 리조트/호텔 카드 생성
        if (productInfo?.costType === '미니멈스테이') {
          const startDate = customerInfo.travelPeriod ? (() => {
            const travelPeriod = customerInfo.travelPeriod.trim();
            if (travelPeriod.includes('~')) {
              const parts = travelPeriod.split('~').map(part => part.trim());
              if (parts.length === 2) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (dateRegex.test(parts[0])) {
                  return new Date(parts[0]);
                }
              }
            } else {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (dateRegex.test(travelPeriod)) {
                return new Date(travelPeriod);
              }
            }
            return null;
          })() : null;
          
          const hotelDayText = startDate ? formatDate(startDate) : '1일차';
          // 리조트 우선, 없으면 호텔
          const selectedHotel = selectedHotels.find(sh => sh.hotel && (sh.hotelSort === '리조트' || sh.hotelSort === '호텔'));
          const hotelType = selectedHotel?.hotelSort || '리조트';
          const hotelName = selectedHotel?.hotel?.hotelNameKo || hotelType;
          
          if (selectedHotel?.hotel) {
            setScheduleCards([{
              id: 1,
              day: hotelDayText,
              badge: hotelType,
              title: hotelName,
              nights: '3박',
            }]);
          }
        }
        return;
      }

      // Recoil에서 travelPeriod 시작 날짜 가져오기
      let startDate: Date | null = null;
      if (customerInfo.travelPeriod) {
        const travelPeriod = customerInfo.travelPeriod.trim();
        if (travelPeriod.includes('~')) {
          const parts = travelPeriod.split('~').map(part => part.trim());
          if (parts.length === 2) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(parts[0])) {
              startDate = new Date(parts[0]);
            }
          }
        } else {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(travelPeriod)) {
            startDate = new Date(travelPeriod);
          }
        }
      }

      let currentDate = startDate ? new Date(startDate) : null;

      const updatedCards = sched.map((s: any, idx: number) => {
        const hotelSort = s.sort || s.hotelSort || '';
        let hotelName = s.roomTypeName || hotelSort || '';
        
        // selectedHotels에서 해당 인덱스의 호텔명 가져오기
        const selectedHotel = selectedHotels.find(sh => sh.index === idx);
        if (selectedHotel?.hotel) {
          hotelName = selectedHotel.hotel.hotelNameKo || hotelName;
        }
        
        // 날짜 계산
        let dayText = `${idx + 1}일차`; // 기본값
        if (currentDate) {
          dayText = formatDate(currentDate);
          
          // 다음 카드를 위한 날짜 계산 (현재 카드의 nights 일수 추가)
          const nights = extractNightsNumber(s.dayNight || '');
          if (nights > 0) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + nights);
            currentDate = nextDate;
          }
        }
        
        return {
          id: idx + 1,
          day: dayText,
          badge: hotelSort,
          title: hotelName,
          nights: s.dayNight || '',
        };
      });
      
      setScheduleCards(updatedCards);

      // 각 카드의 첫 번째 룸타입 자동 선택 및 초기 nights 값 설정 (룸타입 정보가 로드된 후에만 실행)
      if (hotel1Cost || hotel2Cost || hotel3Cost || hotel4Cost || hotelHotelCost || resortHotelCost || poolVillaHotelCost) {
        const newSelectedRoomTypes: { [key: number]: string } = {};
        const newSelectedNights: { [key: number]: number } = {};
        updatedCards.forEach((card) => {
          const roomTypes = getRoomTypesForCard(card);
          if (roomTypes.length > 0) {
            // 이미 선택된 값이 없거나 null인 경우 첫 번째 룸타입으로 설정
            const currentRoomType = selectedRoomTypes[card.id];
            if (!currentRoomType || currentRoomType === null || currentRoomType === '') {
              newSelectedRoomTypes[card.id] = roomTypes[0];
            } else {
              // 기존 선택값 유지 (단, 해당 룸타입이 여전히 유효한 경우)
              if (roomTypes.includes(currentRoomType)) {
                newSelectedRoomTypes[card.id] = currentRoomType;
              } else {
                // 기존 선택값이 유효하지 않으면 첫 번째 룸타입으로 설정
                newSelectedRoomTypes[card.id] = roomTypes[0];
              }
            }
          }

          // nights 값 초기화 (이미 설정된 값이 없을 때만)
          if (!selectedNights[card.id]) {
            const nights = extractNightsNumber(card.nights || '');
            if (nights > 0) {
              newSelectedNights[card.id] = nights;
            }
          } else {
            // 기존 값 유지
            newSelectedNights[card.id] = selectedNights[card.id];
          }
        });
        
        // 새로운 선택값이 있을 때만 업데이트
        if (Object.keys(newSelectedRoomTypes).length > 0) {
          setSelectedRoomTypes(prev => {
            const updated = { ...prev, ...newSelectedRoomTypes };
            return updated;
          });
        }
        if (Object.keys(newSelectedNights).length > 0) {
          setSelectedNights(prev => {
            const updated = { ...prev, ...newSelectedNights };
            return updated;
          });
        }
      }
    } catch (e) {
      // scheduleCards 업데이트 오류 시 기존 카드 유지
    }
  }, [selectedHotels, productInfo?.productScheduleData, customerInfo.travelPeriod, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost]);

  // 룸타입 정보가 로드되면 각 카드의 첫 번째 룸타입 자동 선택 및 nights 초기화
  useEffect(() => {
    if (scheduleCards.length === 0) return;
    if (!hotel1Cost && !hotel2Cost && !hotel3Cost && !hotel4Cost && !hotelHotelCost && !resortHotelCost && !poolVillaHotelCost) return;

    const newSelectedRoomTypes: { [key: number]: string } = {};
    const newSelectedNights: { [key: number]: number } = {};
    
    scheduleCards.forEach((card) => {
      const roomTypes = getRoomTypesForCard(card);
      if (roomTypes.length > 0) {
        // 현재 선택된 룸타입 확인
        const currentRoomType = selectedRoomTypes[card.id];
        
        // 선택된 값이 없거나, null이거나, 빈 문자열이거나, 유효하지 않은 경우 첫 번째 룸타입으로 설정
        const needsUpdate = !currentRoomType || 
                           currentRoomType === null || 
                           currentRoomType === '' || 
                           !roomTypes.includes(currentRoomType);
        
        if (needsUpdate) {
          newSelectedRoomTypes[card.id] = roomTypes[0];
        }
      }

      // nights 값 초기화 (이미 설정된 값이 없을 때만)
      if (!selectedNights[card.id]) {
        const nights = extractNightsNumber(card.nights || '');
        if (nights > 0) {
          newSelectedNights[card.id] = nights;
        }
      }
    });

    // 새로운 선택값이 있을 때만 업데이트
    if (Object.keys(newSelectedRoomTypes).length > 0) {
      setSelectedRoomTypes(prev => {
        const updated = { ...prev, ...newSelectedRoomTypes };
        return updated;
      });
    }
    if (Object.keys(newSelectedNights).length > 0) {
      setSelectedNights(prev => {
        const updated = { ...prev, ...newSelectedNights };
        return updated;
      });
    }
  }, [scheduleCards, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost, getRoomTypesForCard]);


  // productScheduleData를 파싱하여 호텔명 생성 (RestHotelDetail.tsx 참조)
  const getProductNameFromSchedule = React.useCallback((): string => {
    // 미니멈스테이인 경우 productScheduleData가 없어도 selectedHotels에서 호텔명 가져오기
    if (!productInfo?.productScheduleData) {
      if (productInfo?.costType === '미니멈스테이' && selectedHotels.length > 0) {
        const parts: string[] = [];
        selectedHotels.forEach((selectedHotel) => {
          if (selectedHotel.hotel) {
            const hotelName = selectedHotel.hotel.hotelNameKo || selectedHotel.hotelSort;
            const nights = selectedHotel.dayNight ? `${selectedHotel.dayNight}박` : '';
            parts.push(`${hotelName}${nights ? ` ${nights}` : ''}`);
          }
        });
        if (parts.length > 0) {
          return parts.join(' + ');
        }
      }
      // productScheduleData가 없으면 기존 방식 사용
      return productInfo?.productName || '';
    }

    try {
      const scheduleData = JSON.parse(productInfo.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        // 미니멈스테이인 경우 빈 배열이어도 selectedHotels에서 호텔명 가져오기
        if (productInfo?.costType === '미니멈스테이' && selectedHotels.length > 0) {
          const parts: string[] = [];
          selectedHotels.forEach((selectedHotel) => {
            if (selectedHotel.hotel) {
              const hotelName = selectedHotel.hotel.hotelNameKo || selectedHotel.hotelSort;
              const nights = selectedHotel.dayNight ? `${selectedHotel.dayNight}박` : '';
              parts.push(`${hotelName}${nights ? ` ${nights}` : ''}`);
            }
          });
          if (parts.length > 0) {
            return parts.join(' + ');
          }
        }
        return productInfo?.productName || '';
      }

      // selectedHotels를 우선 사용하여 각 인덱스별로 별도 처리
      // 박수 합산 없이 각 인덱스를 별도로 표시
      const parts: string[] = [];
      
      // 이미 사용된 호텔 ID를 추적 (중복 방지)
      const usedHotelIds = new Set<string | number>();
      
      for (let i = 0; i < scheduleData.length; i++) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';
        const nights = dayNight ? `${dayNight}박` : '';

        // selectedHotels에서 해당 인덱스의 호텔을 먼저 확인
        const selectedHotel = selectedHotels.find(sh => sh.index === i);
        let hotelName = hotelSort; // 기본값은 hotelSort

        if (selectedHotel?.hotel?.hotelNameKo) {
          // selectedHotels에 호텔 정보가 있으면 우선 사용
          hotelName = selectedHotel.hotel.hotelNameKo;
          if (selectedHotel.hotel.id !== null && selectedHotel.hotel.id !== undefined) {
            usedHotelIds.add(selectedHotel.hotel.id);
          }
        } else {
          // selectedHotels에 없으면 hotelInfo를 확인 (현재 페이지의 호텔)
          const currentHotel = hotelInfo;
          const currentHotelType = hotelInfo?.hotelType || hotelInfo?.hotelSort;
          
          if (currentHotelType === hotelSort && currentHotel) {
            hotelName = currentHotel.hotelNameKo || hotelSort;
            if (currentHotel.id !== null && currentHotel.id !== undefined) {
              usedHotelIds.add(currentHotel.id);
            }
          } else {
            // allHotels에서 해당 타입의 호텔 찾기 (이미 사용된 호텔 제외)
            const matchingHotels = allHotels.filter((hotel: any) => {
              const hotelType = hotel.hotelType || hotel.hotelSort;
              return (hotelType === hotelSort || 
                     (hotel.hotelType && hotel.hotelType.split(' ').includes(hotelSort))) &&
                     !usedHotelIds.has(hotel.id); // 이미 사용된 호텔 제외
            });

            if (matchingHotels.length > 0) {
              hotelName = matchingHotels[0].hotelNameKo || hotelSort;
              if (matchingHotels[0].id !== null && matchingHotels[0].id !== undefined) {
                usedHotelIds.add(matchingHotels[0].id);
              }
            }
          }
        }

        parts.push(`${hotelName}${nights ? ` ${nights}` : ''}`);
      }

      return parts.join(' + ');
    } catch (e) {
      // productScheduleData 파싱 오류가 발생해도 selectedHotels에서 호텔명 가져오기
      if (productInfo?.costType === '미니멈스테이' && selectedHotels.length > 0) {
        const parts: string[] = [];
        selectedHotels.forEach((selectedHotel) => {
          if (selectedHotel.hotel) {
            const hotelName = selectedHotel.hotel.hotelNameKo || selectedHotel.hotelSort;
            const nights = selectedHotel.dayNight ? `${selectedHotel.dayNight}박` : '';
            parts.push(`${hotelName}${nights ? ` ${nights}` : ''}`);
          }
        });
        if (parts.length > 0) {
          return parts.join(' + ');
        }
      }
      return productInfo?.productName || '';
    }
  }, [productInfo?.productScheduleData, productInfo?.productName, productInfo?.costType, selectedHotels, hotelInfo, allHotels]);

  // 환율 정보 가져오기 (이미 위에서 선언됨)
  const usdRate = React.useMemo(() => {
    const raw = exchangeRate?.USDsend_KRW_tts;
    const rawStr = raw !== undefined && raw !== null ? String(raw) : '';
    const num = parseFloat(rawStr.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }, [exchangeRate]);

  // selectedRoomTypes와 selectedNights를 직렬화하여 useMemo가 변경을 감지하도록 함
  const selectedRoomTypesKey = React.useMemo(() => JSON.stringify(selectedRoomTypes), [selectedRoomTypes]);
  const selectedNightsKey = React.useMemo(() => JSON.stringify(selectedNights), [selectedNights]);

  // 팩요금인 경우 직접 판매가 계산 (NewHotelPrice_Poolvilla의 계산 함수 사용)
  const calculatedPoolvillaPrice = React.useMemo(() => {
    if (productInfo?.costType !== '팩요금') return null;
    if (!productInfo?.productScheduleData) return null;
    if (scheduleCards.length === 0) return null;

    const result = calculatePoolvillaFinalPrice(
      productInfo.productScheduleData,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      selectedNights,
      scheduleCards,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate,
      calculateSalePrice,
      getRoomTypesForCard
    );

    return result;
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    selectedRoomTypesKey, // 직렬화된 키 사용
    selectedNightsKey, // 직렬화된 키 사용
    scheduleCards,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    getRoomTypesForCard,
    calculateSalePrice
  ]);

  // 미니멈스테이 가격 계산
  const calculatedMinimumStayPrice = React.useMemo(() => {
    return calculateMinimumStayFinalPrice(
      productInfo?.costType,
      productInfo?.productScheduleData,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      selectedNights,
      scheduleCards,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate,
      exchangeRate
    );
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    exchangeRate
  ]);

  // 박당 가격 계산
  const calculatedPerDayPrice = React.useMemo(() => {
    return calculatePerDayFinalPrice(
      productInfo?.costType,
      productInfo?.productScheduleData,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      selectedNights,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate,
      exchangeRate
    );
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    exchangeRate
  ]);

  // 박당의 경우 totalBasePriceInKRW와 calculatedSalePrice 계산
  const perDayPrices = React.useMemo(() => {
    if (productInfo?.costType !== '박당') return null;
    
    const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
    const hotels: any[] = [];
    const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
      ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
          ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
          : Number(exchangeRate.USDsend_KRW_tts))
      : 0;

    scheduleCards.forEach((card, cardIndex) => {
      let hotelCost: any | null = null;
      let hotelIndex = -1;

      if (productInfo?.productScheduleData) {
        try {
          const scheduleData = JSON.parse(productInfo.productScheduleData);
          if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } catch {
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }
      } else {
        hotelIndex = cardIndex;
        hotelCost = allHotelCosts[hotelIndex];
      }

      if (hotelCost) {
        const roomType = selectedRoomTypes[card.id] || '';
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
        let rawFieldValue: any = null;
        let fieldValueInKRW: number | null = null;

        if (nights > 0) {
          if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
            const firstCost = hotelCost.costInput[0];
            let parsed: any = firstCost.inputDefault;
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch {
                // ignore
              }
            }
            const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
            const roomList = defaultsArr.flatMap((def: any) =>
              Array.isArray(def.costByRoomType) ? def.costByRoomType : []
            );
            const room =
              (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
              roomList[0] ||
              null;
            if (room && room.dayPersonCost !== undefined && room.dayPersonCost !== '') {
              rawFieldValue = room.dayPersonCost;
              
              let currency: string = '';
              currency = room.currency || '';
              if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                currency = parsed.currency || '';
              }
              if (!currency && firstCost && typeof firstCost === 'object') {
                currency = firstCost.currency || '';
              }

              const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
              if (rawFieldValue && rawFieldValue !== '') {
                const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                if (!isNaN(usdAmount)) {
                  // dayPersonCost에 박수를 곱함
                  const dayPersonCostInKRW = isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)
                    ? Math.round(usdAmount * exchangeRateValue)
                    : Math.round(usdAmount);
                  fieldValueInKRW = dayPersonCostInKRW * nights;
                }
              }
            }
          }
        }

        if (fieldValueInKRW !== null) {
          hotels.push({ fieldValueInKRW });
        }
      }
    });

    if (hotels.length === 0) return null;

    const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
      return sum + (hotel.fieldValueInKRW || 0);
    }, 0);

    // 랜드사 수수료/할인 적용 계산
    const basePriceText = `₩${totalBasePriceInKRW.toLocaleString('ko-KR')}원`;
    const parsePriceFromText = (text: string) => {
      if (!text) return { num: 0, currency: '₩' };
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      const currencyMatch = text.match(/₩|\$/);
      return {
        num: isNaN(num) ? 0 : num,
        currency: currencyMatch ? currencyMatch[0] : '₩'
      };
    };
    const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
      if (baseCurrency === '₩') {
        if (landCurrency === '$' && usdRate > 0) return value * usdRate;
        return value;
      }
      if (baseCurrency === '$') {
        if (landCurrency === '$') return value;
        if (landCurrency === '₩' && usdRate > 0) return value / usdRate;
      }
      return value;
    };
    const { num: baseNum, currency: baseCurrency } = parsePriceFromText(basePriceText);
    const commissionAdj = convertLandAmount(landCommissionTotal, baseCurrency, landCurrency, usdRate);
    const defaultAdj = convertLandAmount(landDiscountDefaultTotal, baseCurrency, landCurrency, usdRate);
    const specialAdj = convertLandAmount(landDiscountSpecialTotal, baseCurrency, landCurrency, usdRate);
    const calculatedSalePrice = Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);

    return {
      totalBasePriceInKRW,
      calculatedSalePrice
    };
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    exchangeRate,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate
  ]);

  // 미니멈스테이의 경우 totalBasePriceInKRW와 calculatedSalePrice 계산
  const minimumStayPrices = React.useMemo(() => {
    if (productInfo?.costType !== '미니멈스테이') return null;
    
    const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
    const hotels: any[] = [];
    const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
      ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
          ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
          : Number(exchangeRate.USDsend_KRW_tts))
      : 0;

    const getNightCostKey = (n: number): string | null => {
      if (n === 1) return 'oneNightCost';
      if (n === 2) return 'twoNightCost';
      if (n === 3) return 'threeNightCost';
      if (n === 4) return 'fourNightCost';
      if (n === 5) return 'fiveNightCost';
      if (n === 6) return 'sixNightCost';
      return null;
    };

    scheduleCards.forEach((card, cardIndex) => {
      let hotelCost: any | null = null;
      let hotelIndex = -1;

      if (productInfo?.productScheduleData) {
        try {
          const scheduleData = JSON.parse(productInfo.productScheduleData);
          if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } catch {
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }
      } else {
        hotelIndex = cardIndex;
        hotelCost = allHotelCosts[hotelIndex];
      }

      if (hotelCost) {
        const roomType = selectedRoomTypes[card.id] || '';
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
        let rawFieldKey: string | null = null;
        let rawFieldValue: any = null;
        let fieldValueInKRW: number | null = null;

        if (nights > 0) {
          rawFieldKey = getNightCostKey(nights);
          
          if (rawFieldKey && Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
            const firstCost = hotelCost.costInput[0];
            let parsed: any = firstCost.inputDefault;
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch {
                // ignore
              }
            }
            const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
            const roomList = defaultsArr.flatMap((def: any) =>
              Array.isArray(def.costByRoomType) ? def.costByRoomType : []
            );
            const room =
              (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
              roomList[0] ||
              null;
            if (room && rawFieldKey && room[rawFieldKey] !== undefined) {
              rawFieldValue = room[rawFieldKey];
              
              let currency: string = '';
              currency = room.currency || '';
              if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                currency = parsed.currency || '';
              }
              if (!currency && firstCost && typeof firstCost === 'object') {
                currency = firstCost.currency || '';
              }

              const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
              if (rawFieldValue && rawFieldValue !== '') {
                const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                if (!isNaN(usdAmount)) {
                  if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
                    fieldValueInKRW = Math.round(usdAmount * exchangeRateValue);
                  } else {
                    fieldValueInKRW = Math.round(usdAmount);
                  }
                }
              }
            }
          }
        }

        if (fieldValueInKRW !== null) {
          hotels.push({ fieldValueInKRW });
        }
      }
    });

    if (hotels.length === 0) return null;

    const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
      return sum + (hotel.fieldValueInKRW || 0);
    }, 0);

    // 랜드사 수수료/할인 적용 계산
    const basePriceText = `₩${totalBasePriceInKRW.toLocaleString('ko-KR')}원`;
    const parsePriceFromText = (text: string) => {
      if (!text) return { num: 0, currency: '₩' };
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      const currencyMatch = text.match(/₩|\$/);
      return {
        num: isNaN(num) ? 0 : num,
        currency: currencyMatch ? currencyMatch[0] : '₩'
      };
    };
    const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
      if (baseCurrency === '₩') {
        if (landCurrency === '$' && usdRate > 0) return value * usdRate;
        return value;
      }
      if (baseCurrency === '$') {
        if (landCurrency === '$') return value;
        if (landCurrency === '₩' && usdRate > 0) return value / usdRate;
      }
      return value;
    };
    const { num: baseNum, currency: baseCurrency } = parsePriceFromText(basePriceText);
    const commissionAdj = convertLandAmount(landCommissionTotal, baseCurrency, landCurrency, usdRate);
    const defaultAdj = convertLandAmount(landDiscountDefaultTotal, baseCurrency, landCurrency, usdRate);
    const specialAdj = convertLandAmount(landDiscountSpecialTotal, baseCurrency, landCurrency, usdRate);
    const calculatedSalePrice = Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);

    return {
      totalBasePriceInKRW,
      calculatedSalePrice
    };
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    exchangeRate,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate
  ]);

  // 팩요금인 경우 계산된 가격 사용, 아니면 기존 pricePerPerson 사용
  const finalPricePerPerson = React.useMemo(() => {
    if (productInfo?.costType === '팩요금') {
      const price = calculatedPoolvillaPrice ?? pricePerPerson;
      return price;
    } else if (productInfo?.costType === '미니멈스테이') {
      // 미니멈스테이의 경우 totalBasePriceInKRW를 1인요금으로 사용
      // minimumStayPrices가 null이거나 totalBasePriceInKRW가 0이면 0 반환
      if (minimumStayPrices && minimumStayPrices.totalBasePriceInKRW > 0) {
        return minimumStayPrices.totalBasePriceInKRW;
      }
      // calculatedMinimumStayPrice가 있으면 사용, 없으면 0
      return calculatedMinimumStayPrice ?? 0;
    } else if (productInfo?.costType === '박당') {
      // 박당의 경우 totalBasePriceInKRW를 1인요금으로 사용
      // perDayPrices가 null이거나 totalBasePriceInKRW가 0이면 0 반환
      if (perDayPrices && perDayPrices.totalBasePriceInKRW > 0) {
        return perDayPrices.totalBasePriceInKRW;
      }
      // calculatedPerDayPrice가 있으면 사용, 없으면 0
      return calculatedPerDayPrice ?? 0;
    }
    return pricePerPerson;
  }, [
    productInfo?.costType,
    calculatedPoolvillaPrice,
    calculatedMinimumStayPrice,
    calculatedPerDayPrice,
    minimumStayPrices,
    perDayPrices,
    selectedRoomTypes,
    selectedNights,
    pricePerPerson
  ]);

  // 미니멈스테이/박당의 경우 총요금은 calculatedSalePrice 사용
  const finalTotalPrice = React.useMemo(() => {
    if (productInfo?.costType === '미니멈스테이' && minimumStayPrices && minimumStayPrices.calculatedSalePrice > 0) {
      return minimumStayPrices.calculatedSalePrice;
    }
    if (productInfo?.costType === '박당' && perDayPrices && perDayPrices.calculatedSalePrice > 0) {
      return perDayPrices.calculatedSalePrice;
    }
    // 요금이 없으면 0 반환
    if (finalPricePerPerson <= 0) {
      return 0;
    }
    return finalPricePerPerson * guestCount;
  }, [productInfo?.costType, minimumStayPrices, perDayPrices, finalPricePerPerson, guestCount]);

  // 최종 1인요금 / 총요금 및 사용되는 원시 요금 값 디버깅
  useEffect(() => {
    if (!productInfo) return;
    
    // 팩요금인 경우 finalPricePerPerson이 0이어도 디버깅 로그 출력
    const isPackCost = productInfo.costType === '팩요금';
    if (!isPackCost && finalPricePerPerson <= 0) return;

    const totalPrice = finalPricePerPerson > 0 ? finalPricePerPerson * guestCount : 0;

    const debug: any = {
      costType: productInfo.costType,
      finalPricePerPerson,
      guestCount,
      totalPrice,
      selectedRoomTypes,
      selectedNights,
      scheduleCards: scheduleCards.map(c => ({ id: c.id, badge: c.badge, title: c.title })),
      calculatedPoolvillaPrice,
      calculatedMinimumStayPrice,
      calculatedPerDayPrice,
      pricePerPerson,
      hotelCosts: {
        hotel1Cost: hotel1Cost ? { hasCostInput: !!hotel1Cost.costInput, costInputLength: hotel1Cost.costInput?.length || 0 } : null,
        hotel2Cost: hotel2Cost ? { hasCostInput: !!hotel2Cost.costInput, costInputLength: hotel2Cost.costInput?.length || 0 } : null,
        hotel3Cost: hotel3Cost ? { hasCostInput: !!hotel3Cost.costInput, costInputLength: hotel3Cost.costInput?.length || 0 } : null,
        hotel4Cost: hotel4Cost ? { hasCostInput: !!hotel4Cost.costInput, costInputLength: hotel4Cost.costInput?.length || 0 } : null,
      }
    };

    // 팩요금(풀빌라 콤보)의 경우, 어떤 호텔/룸타입/필드(twoTwoDayCost 등)를 사용했는지 추적
    if (productInfo.costType === '팩요금') {
      try {
        const periodType = getPeriodType(); // 예: '2+2', '1+3'
        const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
        const hotels: any[] = [];

        // 첫 번째 리조트와 풀빌라의 박수만 사용 (3개 조합의 경우)
        const resortCards = scheduleCards.filter(card => card.badge === '리조트');
        const poolCards = scheduleCards.filter(card => card.badge === '풀빌라');
        const firstResortCard = resortCards[0];
        const firstPoolCard = poolCards[0];
        
        let resortNights = 0;
        let poolNights = 0;
        if (firstResortCard) {
          resortNights = selectedNights[firstResortCard.id] || extractNightsNumber(firstResortCard.nights || '');
        }
        if (firstPoolCard) {
          poolNights = selectedNights[firstPoolCard.id] || extractNightsNumber(firstPoolCard.nights || '');
        }

        // comboRules에서 사용한 baseKey(twoTwoDayCost, oneThreeDayCost 등) 찾기
        const rule = comboRules.find(r => r.resortNights === resortNights && r.poolNights === poolNights);

        // scheduleCards와 hotelCosts를 매칭하여 각 호텔 정보 수집
        scheduleCards.forEach((card, cardIndex) => {
          // productScheduleData를 기반으로 호텔 인덱스 찾기
          let hotelCost: any | null = null;
          let hotelIndex = -1;

          if (productInfo?.productScheduleData) {
            try {
              const scheduleData = JSON.parse(productInfo.productScheduleData);
              if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
                hotelIndex = cardIndex;
                hotelCost = allHotelCosts[hotelIndex];
              }
            } catch {
              // 파싱 실패 시 인덱스 기반으로 매칭
              hotelIndex = cardIndex;
              hotelCost = allHotelCosts[hotelIndex];
            }
          } else {
            // productScheduleData가 없으면 인덱스 기반으로 매칭
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }

          if (hotelCost) {
            const roomType = selectedRoomTypes[card.id] || '';
            const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');

            let rawFieldKey: string | null = null;
            let rawFieldValue: any = null;
            let currency: string = '';

            if (card.badge === '리조트') {
              // 리조트의 경우: 첫 번째 리조트는 dayAddCost, 추가 리조트는 forPreAddCost 사용
              const resortCards = scheduleCards.filter(c => c.badge === '리조트');
              const isFirstResort = resortCards.indexOf(card) === 0;
              
              if (isFirstResort) {
                // 첫 번째 리조트: dayAddCost 사용
                rawFieldKey = 'dayAddCost';
                if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
                  const firstCost = hotelCost.costInput[0];
                  let parsed: any = firstCost.inputDefault;
                  if (typeof parsed === 'string') {
                    try {
                      parsed = JSON.parse(parsed);
                    } catch {
                      // ignore
                    }
                  }
                  const list = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                  if (list.length > 0) {
                    rawFieldValue = list[0].dayAddCost;
                    currency = list[0].currency || '';
                  }
                }
              } else {
                // 추가 리조트: dayAddCost 사용
                rawFieldKey = 'dayAddCost';
                if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
                  const firstCost = hotelCost.costInput[0];
                  let parsed: any = firstCost.inputDefault;
                  if (typeof parsed === 'string') {
                    try {
                      parsed = JSON.parse(parsed);
                    } catch {
                      // ignore
                    }
                  }
                  const list = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                  if (list.length > 0) {
                    rawFieldValue = list[0].dayAddCost;
                    currency = list[0].currency || '';
                  }
                }
              }
            } else if (card.badge === '풀빌라') {
              // 풀빌라의 경우: 
              // '리조트 + 풀빌라1 + 풀빌라2' 조합에서
              // - 풀빌라1(첫 번째, 중간): forPreAddCost 사용
              // - 풀빌라2(두 번째, 맨뒤): baseKey 사용 (리조트와 풀빌라2의 조합)
              const poolVillaCards = scheduleCards.filter(c => c.badge === '풀빌라');
              const isFirstPoolVilla = poolVillaCards.indexOf(card) === 0;
              const isSecondPoolVilla = poolVillaCards.indexOf(card) === 1;
              
              // 리조트가 있고 풀빌라가 2개인 경우 (리조트 + 풀빌라1 + 풀빌라2 조합)
              const resortCards = scheduleCards.filter(c => c.badge === '리조트');
              if (resortCards.length === 1 && poolVillaCards.length === 2) {
                if (isFirstPoolVilla) {
                  // 풀빌라1(중간): forPreAddCost 사용
                  rawFieldKey = 'forPreAddCost';
                  if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
                    const firstCost = hotelCost.costInput[0];
                    let parsed: any = firstCost.inputDefault;
                    if (typeof parsed === 'string') {
                      try {
                        parsed = JSON.parse(parsed);
                      } catch {
                        // ignore
                      }
                    }
                    const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                    const roomList = defaultsArr.flatMap((def: any) =>
                      Array.isArray(def.costByRoomType) ? def.costByRoomType : []
                    );
                    const room =
                      (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
                      roomList[0] ||
                      null;
                    if (room && room.forPreAddCost !== undefined) {
                      rawFieldValue = room.forPreAddCost;
                      currency = room.currency || '';
                    }
                  }
                } else if (isSecondPoolVilla && rule) {
                  // 풀빌라2(맨뒤): baseKey 사용
                  rawFieldKey = rule.baseKey;
                  if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
                    const firstCost = hotelCost.costInput[0];
                    let parsed: any = firstCost.inputDefault;
                    if (typeof parsed === 'string') {
                      try {
                        parsed = JSON.parse(parsed);
                      } catch {
                        // ignore
                      }
                    }
                    const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                    const roomList = defaultsArr.flatMap((def: any) =>
                      Array.isArray(def.costByRoomType) ? def.costByRoomType : []
                    );
                    const room =
                      (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
                      roomList[0] ||
                      null;
                    if (room && rule.baseKey && room[rule.baseKey] !== undefined) {
                      rawFieldValue = room[rule.baseKey];
                      currency = room.currency || '';
                    }
                  }
                }
              } else if (isFirstPoolVilla && rule) {
                // 일반 조합 (리조트 + 풀빌라): baseKey 사용
                rawFieldKey = rule.baseKey;
                if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
                  const firstCost = hotelCost.costInput[0];
                  let parsed: any = firstCost.inputDefault;
                  if (typeof parsed === 'string') {
                    try {
                      parsed = JSON.parse(parsed);
                    } catch {
                      // ignore
                    }
                  }
                  const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                  const roomList = defaultsArr.flatMap((def: any) =>
                    Array.isArray(def.costByRoomType) ? def.costByRoomType : []
                  );
                  const room =
                    (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
                    roomList[0] ||
                    null;
                  if (room && rule.baseKey && room[rule.baseKey] !== undefined) {
                    rawFieldValue = room[rule.baseKey];
                    currency = room.currency || '';
                  }
                }
              }
            }

            hotels.push({
              hotelId: hotelCost.hotel?.id ?? null,
              hotelName: hotelCost.hotel?.hotelNameKo ?? null,
              hotelSort: card.badge || null,
              roomType: roomType || null,
              nights: nights || null,
              fieldKey: rawFieldKey,
              fieldValue: rawFieldValue,
              currency: currency || null
            });
          }
        });

        if (hotels.length > 0) {
          debug.periodType = periodType;
          debug.resortNights = resortNights;
          debug.poolNights = poolNights;
          debug.hotels = hotels;
          
          // 하위 호환성을 위해 단일 호텔인 경우 최상위에도 추가
          if (hotels.length === 1) {
            debug.hotelId = hotels[0].hotelId;
            debug.hotelName = hotels[0].hotelName;
            debug.roomType = hotels[0].roomType;
            debug.fieldKey = hotels[0].fieldKey;
            debug.fieldValue = hotels[0].fieldValue;
          }
        }
      } catch (e) {
        // 디버깅용이므로 실패해도 앱 동작에는 영향 없음
      }
    }

    // 미니멈스테이의 경우, 어떤 호텔/룸타입/필드(oneNightCost, twoNightCost 등)를 사용했는지 추적
    if (productInfo.costType === '미니멈스테이') {
      try {
        const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
        const hotels: any[] = [];

        // 박수에 따른 필드 키 매핑
        const getNightCostKey = (n: number): string | null => {
          if (n === 1) return 'oneNightCost';
          if (n === 2) return 'twoNightCost';
          if (n === 3) return 'threeNightCost';
          if (n === 4) return 'fourNightCost';
          if (n === 5) return 'fiveNightCost';
          if (n === 6) return 'sixNightCost';
          return null;
        };

        // 환율 정보 가져오기
        const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
          ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
              ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
              : Number(exchangeRate.USDsend_KRW_tts))
          : 0;

        // scheduleCards와 hotelCosts를 매칭
        scheduleCards.forEach((card, cardIndex) => {
          // productScheduleData를 기반으로 호텔 인덱스 찾기
          let hotelCost: any | null = null;
          let hotelIndex = -1;

          if (productInfo?.productScheduleData) {
            try {
              const scheduleData = JSON.parse(productInfo.productScheduleData);
              if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
                hotelIndex = cardIndex;
                hotelCost = allHotelCosts[hotelIndex];
              }
            } catch {
              // 파싱 실패 시 인덱스 기반으로 매칭
              hotelIndex = cardIndex;
              hotelCost = allHotelCosts[hotelIndex];
            }
          } else {
            // productScheduleData가 없으면 인덱스 기반으로 매칭
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }

          if (hotelCost) {
            const roomType = selectedRoomTypes[card.id] || '';
            const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');

            let rawFieldKey: string | null = null;
            let rawFieldValue: any = null;
            let currency: string = '';
            let fieldValueInKRW: number | null = null;

            if (nights > 0) {
              rawFieldKey = getNightCostKey(nights);
              
              if (rawFieldKey && Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
                const firstCost = hotelCost.costInput[0];
                let parsed: any = firstCost.inputDefault;
                if (typeof parsed === 'string') {
                  try {
                    parsed = JSON.parse(parsed);
                  } catch {
                    // ignore
                  }
                }
                const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                const roomList = defaultsArr.flatMap((def: any) =>
                  Array.isArray(def.costByRoomType) ? def.costByRoomType : []
                );
                const room =
                  (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
                  roomList[0] ||
                  null;
                if (room && rawFieldKey && room[rawFieldKey] !== undefined) {
                  rawFieldValue = room[rawFieldKey];
                  
                  // 통화 정보 확인
                  currency = room.currency || '';
                  if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    currency = parsed.currency || '';
                  }
                  if (!currency && firstCost && typeof firstCost === 'object') {
                    currency = firstCost.currency || '';
                  }

                  // 달러인 경우 환율 적용해서 원화로 변환
                  const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
                  if (rawFieldValue && rawFieldValue !== '') {
                    const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                    if (!isNaN(usdAmount)) {
                      if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
                        fieldValueInKRW = Math.round(usdAmount * exchangeRateValue);
                      } else {
                        // 이미 원화인 경우
                        fieldValueInKRW = Math.round(usdAmount);
                      }
                    }
                  }
                }
              }
            }

            hotels.push({
              hotelId: hotelCost.hotel?.id ?? null,
              hotelName: hotelCost.hotel?.hotelNameKo ?? null,
              roomType: roomType || null,
              nights: nights || null,
              fieldKey: rawFieldKey,
              fieldValue: rawFieldValue,
              currency: currency || null,
              exchangeRate: exchangeRateValue > 0 ? exchangeRateValue : null,
              fieldValueInKRW: fieldValueInKRW
            });
          }
        });

        if (hotels.length > 0) {
          debug.hotels = hotels;
          // 전체 환율 정보 추가
          const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
            ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
                ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
                : Number(exchangeRate.USDsend_KRW_tts))
            : 0;
          if (exchangeRateValue > 0) {
            debug.exchangeRate = exchangeRateValue;
          }

          // 각 호텔의 원화 요금 합계 계산
          const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
            return sum + (hotel.fieldValueInKRW || 0);
          }, 0);
          debug.totalBasePriceInKRW = totalBasePriceInKRW;

          // 랜드사 수수료/할인 정보 추가
          debug.landCommissionTotal = landCommissionTotal;
          debug.landDiscountDefaultTotal = landDiscountDefaultTotal;
          debug.landDiscountSpecialTotal = landDiscountSpecialTotal;
          debug.landCurrency = landCurrency;
          debug.usdRate = usdRate;

          // 랜드사 수수료/할인 적용 계산 (실제 계산 로직과 동일하게)
          // calculateSalePrice 로직을 재현
          // basePriceText는 "₩1,858,629원" 형식이라고 가정
          const basePriceText = `₩${totalBasePriceInKRW.toLocaleString('ko-KR')}원`;
          const parsePriceFromText = (text: string) => {
            if (!text) return { num: 0, currency: '₩' };
            const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
            const currencyMatch = text.match(/₩|\$/);
            return {
              num: isNaN(num) ? 0 : num,
              currency: currencyMatch ? currencyMatch[0] : '₩'
            };
          };
          const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
            if (baseCurrency === '₩') {
              if (landCurrency === '$' && usdRate > 0) return value * usdRate;
              return value;
            }
            if (baseCurrency === '$') {
              if (landCurrency === '$') return value;
              if (landCurrency === '₩' && usdRate > 0) return value / usdRate;
            }
            return value;
          };
          const { num: baseNum, currency: baseCurrency } = parsePriceFromText(basePriceText);
          const commissionAdj = convertLandAmount(landCommissionTotal, baseCurrency, landCurrency, usdRate);
          const defaultAdj = convertLandAmount(landDiscountDefaultTotal, baseCurrency, landCurrency, usdRate);
          const specialAdj = convertLandAmount(landDiscountSpecialTotal, baseCurrency, landCurrency, usdRate);
          const calculatedSalePrice = Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);
          debug.calculatedSalePrice = calculatedSalePrice;
          debug.calculationBreakdown = {
            basePrice: baseNum,
            commissionAdj,
            defaultDiscountAdj: defaultAdj,
            specialDiscountAdj: specialAdj,
            finalPrice: calculatedSalePrice
          };
          
          // 단일 호텔인 경우 하위 호환성을 위해 최상위에도 추가
          if (hotels.length === 1) {
            debug.hotelId = hotels[0].hotelId;
            debug.hotelName = hotels[0].hotelName;
            debug.roomType = hotels[0].roomType;
            debug.nights = hotels[0].nights;
            debug.fieldKey = hotels[0].fieldKey;
            debug.fieldValue = hotels[0].fieldValue;
            debug.currency = hotels[0].currency;
            debug.exchangeRate = hotels[0].exchangeRate;
            debug.fieldValueInKRW = hotels[0].fieldValueInKRW;
          }
        }
      } catch (e) {
        // 디버깅용이므로 실패해도 앱 동작에는 영향 없음
      }
    }

    // 박당의 경우, 어떤 호텔/룸타입/필드(dayPersonCost 등)를 사용했는지 추적
    if (productInfo.costType === '박당') {
      try {
        const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
        const hotels: any[] = [];

        // 환율 정보 가져오기
        const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
          ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
              ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
              : Number(exchangeRate.USDsend_KRW_tts))
          : 0;

        // scheduleCards와 hotelCosts를 매칭
        scheduleCards.forEach((card, cardIndex) => {
          // productScheduleData를 기반으로 호텔 인덱스 찾기
          let hotelCost: any | null = null;
          let hotelIndex = -1;

          if (productInfo?.productScheduleData) {
            try {
              const scheduleData = JSON.parse(productInfo.productScheduleData);
              if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
                hotelIndex = cardIndex;
                hotelCost = allHotelCosts[hotelIndex];
              }
            } catch {
              // 파싱 실패 시 인덱스 기반으로 매칭
              hotelIndex = cardIndex;
              hotelCost = allHotelCosts[hotelIndex];
            }
          } else {
            // productScheduleData가 없으면 인덱스 기반으로 매칭
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }

          if (hotelCost) {
            const roomType = selectedRoomTypes[card.id] || '';
            const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');

            let rawFieldKey: string | null = 'dayPersonCost';
            let rawFieldValue: any = null;
            let currency: string = '';
            let fieldValueInKRW: number | null = null;

            if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
              const firstCost = hotelCost.costInput[0];
              let parsed: any = firstCost.inputDefault;
              if (typeof parsed === 'string') {
                try {
                  parsed = JSON.parse(parsed);
                } catch {
                  // ignore
                }
              }
              const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
              const roomList = defaultsArr.flatMap((def: any) =>
                Array.isArray(def.costByRoomType) ? def.costByRoomType : []
              );
              const room =
                (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
                roomList[0] ||
                null;
              if (room && rawFieldKey && room[rawFieldKey] !== undefined && room[rawFieldKey] !== '') {
                rawFieldValue = room[rawFieldKey];
                
                // 통화 정보 확인
                currency = room.currency || '';
                if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                  currency = parsed.currency || '';
                }
                if (!currency && firstCost && typeof firstCost === 'object') {
                  currency = firstCost.currency || '';
                }

                // 달러인 경우 환율 적용해서 원화로 변환
                const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
                if (rawFieldValue && rawFieldValue !== '') {
                  const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                  if (!isNaN(usdAmount)) {
                    // dayPersonCost에 박수를 곱함
                    const dayPersonCostInKRW = isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)
                      ? Math.round(usdAmount * exchangeRateValue)
                      : Math.round(usdAmount);
                    fieldValueInKRW = dayPersonCostInKRW * nights;
                  }
                }
              }
            }

            hotels.push({
              hotelId: hotelCost.hotel?.id ?? null,
              hotelName: hotelCost.hotel?.hotelNameKo ?? null,
              roomType: roomType || null,
              nights: nights || null,
              fieldKey: rawFieldKey,
              fieldValue: rawFieldValue,
              currency: currency || null,
              exchangeRate: exchangeRateValue > 0 ? exchangeRateValue : null,
              fieldValueInKRW: fieldValueInKRW
            });
          }
        });

        if (hotels.length > 0) {
          debug.hotels = hotels;
          // 전체 환율 정보 추가
          const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
            ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
                ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
                : Number(exchangeRate.USDsend_KRW_tts))
            : 0;
          if (exchangeRateValue > 0) {
            debug.exchangeRate = exchangeRateValue;
          }

          // 각 호텔의 원화 요금 합계 계산
          const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
            return sum + (hotel.fieldValueInKRW || 0);
          }, 0);
          debug.totalBasePriceInKRW = totalBasePriceInKRW;

          // 랜드사 수수료/할인 정보 추가
          debug.landCommissionTotal = landCommissionTotal;
          debug.landDiscountDefaultTotal = landDiscountDefaultTotal;
          debug.landDiscountSpecialTotal = landDiscountSpecialTotal;
          debug.landCurrency = landCurrency;
          debug.usdRate = usdRate;

          // 랜드사 수수료/할인 적용 계산 (실제 계산 로직과 동일하게)
          const basePriceText = `₩${totalBasePriceInKRW.toLocaleString('ko-KR')}원`;
          const parsePriceFromText = (text: string) => {
            if (!text) return { num: 0, currency: '₩' };
            const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
            const currencyMatch = text.match(/₩|\$/);
            return {
              num: isNaN(num) ? 0 : num,
              currency: currencyMatch ? currencyMatch[0] : '₩'
            };
          };
          const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
            if (baseCurrency === '₩') {
              if (landCurrency === '$' && usdRate > 0) return value * usdRate;
              return value;
            }
            if (baseCurrency === '$') {
              if (landCurrency === '$') return value;
              if (landCurrency === '₩' && usdRate > 0) return value / usdRate;
            }
            return value;
          };
          const { num: baseNum, currency: baseCurrency } = parsePriceFromText(basePriceText);
          const commissionAdj = convertLandAmount(landCommissionTotal, baseCurrency, landCurrency, usdRate);
          const defaultAdj = convertLandAmount(landDiscountDefaultTotal, baseCurrency, landCurrency, usdRate);
          const specialAdj = convertLandAmount(landDiscountSpecialTotal, baseCurrency, landCurrency, usdRate);
          const calculatedSalePrice = Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);
          debug.calculatedSalePrice = calculatedSalePrice;
          debug.calculationBreakdown = {
            basePrice: baseNum,
            commissionAdj,
            defaultDiscountAdj: defaultAdj,
            specialDiscountAdj: specialAdj,
            finalPrice: calculatedSalePrice
          };
          
          // 단일 호텔인 경우 하위 호환성을 위해 최상위에도 추가
          if (hotels.length === 1) {
            debug.hotelId = hotels[0].hotelId;
            debug.hotelName = hotels[0].hotelName;
            debug.roomType = hotels[0].roomType;
            debug.nights = hotels[0].nights;
            debug.fieldKey = hotels[0].fieldKey;
            debug.fieldValue = hotels[0].fieldValue;
            debug.currency = hotels[0].currency;
            debug.exchangeRate = hotels[0].exchangeRate;
            debug.fieldValueInKRW = hotels[0].fieldValueInKRW;
          }
        }
      } catch (e) {
        // 디버깅용이므로 실패해도 앱 동작에는 영향 없음
      }
    }

    // 각 호텔의 첫 번째 요금 항목에서 원시 요금 필드 확인 (예: twoTwoDayCost 등)
    const extractRawPriceFields = (hotelCost: any) => {
      if (!hotelCost || !Array.isArray(hotelCost.costInput) || hotelCost.costInput.length === 0) return null;
      const first = hotelCost.costInput[0];
      let parsed: any = first.inputDefault;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // 문자열 파싱 실패 시 그대로 사용
        }
      }
      return parsed;
    };

  }, [
    productInfo,
    finalPricePerPerson,
    guestCount,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    calculatedPoolvillaPrice,
    calculatedMinimumStayPrice,
    calculatedPerDayPrice,
    pricePerPerson
  ]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!hotelInfo || !productInfo) {
    return null;
  }

  const highlightItems = [
    { image: rectangle661, title: '초럭셔리 체험' },
    { image: rectangle662, title: '버틀러 시스템' },
    { image: rectangle663, title: '프라이빗 비치' },
    { image: rectangle664, title: '턴다운 서비스' },
    { image: rectangle665, title: '허니문 인기' },
  ];

  const benefitItems = [
    {
      title: '초럭셔리 체험',
      text: '세계적 평가의 St. Regis 브랜드 & 발리 최고급 서비스',
      image: rectangle76,
    },
    {
      title: '버틀러 시스템',
      text: '짐 언패킹, 패킹, 커피/티 서비스 예약대행',
      image: rectangle78,
    },
    {
      title: '턴다운 서비스',
      text: '매일 밤 방을 편안하게 정리해주는 감동 포인트',
      image: rectangle76,
    },
    {
      title: '프라이빗 비치',
      text: '게이티드 누사두아의 조용하고 품격 높은 해변',
      image: rectangle619,
    },
  ];

  const reviewItems = [
    {
      id: 1,
      title: '후기제목을 적는 곳입니다',
      rating: 5.0,
      image: reviewimage,
      text: `발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
설비를 갖춘 다섯 성급 리조트입니다.
전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
열자마자 행복....`
    },
    {
      id: 2,
      title: '후기제목을 적는 곳입니다',
      rating: 5.0,
      image: reviewimage,
      text: `발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
설비를 갖춘 다섯 성급 리조트입니다.
전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
열자마자 행복....`
    },
  ];

  return (
    <div className="RestHotelCost">
      <div className="hotel-container with-right-panel">
        {/* 왼쪽 영역: 기존 내용 */}
        <div className="left-section">
          <div className="hotel-center-wrapper">
           

            <div className="hotel-title-wrapper">
              <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <div className="hotel-title">
                <div className="text-title">{hotelInfo?.hotelNameKo || '호텔명'}</div>
                <div className="text-subtitle">
                  {hotelInfo?.hotelNameEn || ''}
                </div>
                <RatingBoard
                  rating={
                    hotelInfo && (hotelInfo.tripAdviser || hotelInfo.customerScore)
                      ? parseFloat(hotelInfo.tripAdviser || hotelInfo.customerScore)
                      : 0
                  }
                />

                <div className="text-location">
                  <p>{hotelInfo?.nation || ''}</p>
                  <IoIosArrowForward />
                  <p>{hotelInfo?.city || ''}</p>
                </div>
              </div>
            </div>


             {/* 리조트 + 풀빌라 조합인 경우 호텔 탭 버튼 */}
             {resortPoolvillaHotels.length > 0 && (
              <div className="right-tab-container" style={{ marginBottom: '20px' }}>
                <div className="right-tab-left">
                  {resortPoolvillaHotels.map((hotelInfo, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`right-tab-button ${selectedHotelTabIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedHotelTabIndex(index)}
                    >
                      {hotelInfo.hotelName}
                    </button>
                  ))}
                </div>
              </div>
            )}
   

            <div className="room-container-wrapper">
              <div className="room-container-left">
                {btnSolids.map(({ text }, index) => (
                  <button
                    key={text}
                    type="button"
                    className={`roomtabsort ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <div className="room-container-right">
                {roomTypes.map((room: any, index: number) => (
                  <React.Fragment key={room.roomTypeName || index}>
                    <span className="roomtype-text">{room.roomTypeName}</span>
                    {index < roomTypes.length - 1 && (
                      <span className="roomtype-separator"></span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

           

            <div className="photo-gallery">
              <div className="photo-main">
                {(() => {
                  const images = getCurrentImages();
                  if (images && images.length > 0) {
                    const main = images[selectedMainImageIndex];
                    const isVideo = isVideoFile(main.imageName);
                    
                    if (isVideo) {
                      return (
                        <video
                          className="photo-main-image"
                          controls
                          src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                        >
                          브라우저가 비디오 태그를 지원하지 않습니다.
                        </video>
                      );
                    }
                    
                    return (
                      <img
                        className="photo-main-image"
                        alt={main.title || '메인 이미지'}
                        src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                      />
                    );
                  }
                  return (
                    <img
                      className="photo-main-image"
                      alt="메인 이미지"
                      src={rectangle580}
                    />
                  );
                })()}
              </div>

              <div className="photo-thumbnails">
                {getCurrentImages().map((img: any, index: number) => {
                  const isVideo = isVideoFile(img.imageName);
                  return (
                    <div
                      className={`photo-thumbnail ${selectedMainImageIndex === index ? 'active' : ''} ${isVideo ? 'video-thumbnail' : ''}`}
                      key={index}
                      onClick={() => setSelectedMainImageIndex(index)}
                    >
                      {isVideo ? (
                        <div className="thumbnail-video-wrapper">
                          <video
                            className="thumbnail-video"
                            src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                            muted
                            preload="metadata"
                          />
                          <div className="video-play-icon">▶</div>
                        </div>
                      ) : (
                        <img
                          src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                          alt={img.title || `썸네일 ${index + 1}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="location-info">
              <div className="section-titlebox">
                <span className="location-title">호텔위치</span>
                <span className="text-wrapper-11">호텔 위치 보기</span>
              </div>

              <p className="text-wrapper-10">
                {hotelInfo?.hotelAddress || ''}
              </p>

              <div className="flexcontainer">
                <p className="text">
                  <span className="span">누사두아 게이티드 지역의 고급 라인업</span>
                </p>

                <p className="text">
                  <span className="span">공항 → 20~25분</span>
                </p>

                <p className="text">
                  <span className="span">발리 컬렉션 쇼핑센터 → 차량 5분</span>
                </p>

                <p className="text">
                  <span className="span">
                    주변: 무려프 비치클럽·워터블로우·BTDC 산책로
                  </span>
                </p>
              </div>
            </div>

            <div className="highlight-section">
              <div className="highlight-title">핵심 포인트</div>
              <div className="highlight-list">
                {highlightItems.map(({ image, title }) => (
                  <div className="highlight-item" key={title}>
                    <div className="highlight-image-wrap">
                      <img src={image} alt={title} />
                    </div>
                    <div className="highlight-item-title">{title}</div>
                    <div className="highlight-item-desc">
                      세계적 평가의 St. Regis 브랜드 &amp; 발리 최고급 서비스
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`benefit-section`}>
              <div className="div-wrapper">
                <div className="text-wrapper">베네핏 포함사항</div>
              </div>
      
              <div className="benefit-items">
                {benefitItems.map(({ title, text, image }, index) => (
                  <div key={title} className="benefit-item">
                    <img className="rectangle" alt="Rectangle" src={image} />
                    <div className={`benefit-card benefit-card-${index + 1}`}>
                      <div className="benefit-title">{title}</div>
                      <div className="benefit-text">{text}</div>
                    </div>
                    <div className={`benefit-ribbon benefit-ribbon-${index + 1}`}>
                      실론투어
                      <br />
                      단독특전2
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='review-cover'>
              {/* 후기 및 평점 섹션 */}
              <div className="review-section">
                <h2 className="section-title">후기 및 평점</h2>
                
                <div className="review-list">
                  {reviewItems.map((review) => (
                    <div key={review.id} className="review-item">
                      <img className="review-image" alt="후기 이미지" src={review.image} />
                      <div className="review-content">
                        <div className="review-header">
                          <h3 className="review-title">{review.title}</h3>
                          <div className="review-rating">
                            <RatingBoard rating={review.rating} />
                          </div>
                        </div>
                        
                        <p className="review-text">
                          {review.text.split('\n').map((line, index, arr) => (
                            <React.Fragment key={index}>
                              {line}
                              {index < arr.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{height: '100px'}}></div>

          </div>
        </div>

        {/* 오른쪽 영역: 선택한 스케줄(여행상품) 정보 및 비용 */}
        <div className="right-section">
          <div className="hotel-cost-component">
              {/* 제품 정보 헤더 */}
              <div className="cost-header">
                <div className="cost-header-top">
                  <div className="cost-badge">
                    {productInfo?.scheduleSort || productInfo?.costType || '패키지'}
                  </div>
                  <div className="cost-product-name">
                    {getProductNameFromSchedule()} - 
                    {periodText && (
                      <span className="product-period">&nbsp;{periodText}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 호텔구성 타이틀 및 일정보기 버튼 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                marginTop: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  호텔구성
                </h3>
                <button
                  onClick={() => {
                    navigate('/counsel/rest/schedule', { state: productInfo });
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    backgroundColor: '#333',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.borderColor = '#8B8B8B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.borderColor = '#ddd';
                  }}
                >
                  일정보기
                </button>
              </div>

              {/* 호텔 구성 카드들 - productScheduleData 기반 */}
              <div className="cost-hotel-cards">
                {(scheduleCards.length > 0 ? scheduleCards : []).map((card) => (
                  <div key={card.id} className="cost-hotel-card">
                    <div className="cost-card-date">{card.day}</div>
                    <div className="cost-card-header">
                      <div 
                        className={`cost-card-badge`}
                        onClick={() => handleHotelChange(card.id)}
                        style={{
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {card.badge}
                      </div>
                      <div className="cost-card-title">{card.title}</div>
                    </div>
                    <div className="cost-card-content">
                      <div className="cost-card-roomtype">
                        <select
                          value={selectedRoomTypes[card.id] || (getRoomTypesForCard(card)[0] || '')}
                          onChange={(e) => {
                            const newRoomType = e.target.value;
                            setSelectedRoomTypes(prev => ({
                              ...prev,
                              [card.id]: newRoomType
                            }));
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            backgroundColor: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          {getRoomTypesForCard(card).map((roomType) => (
                            <option key={roomType} value={roomType}>
                              {roomType}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="cost-card-nights-control">
                        <button 
                          className="nights-btn"
                          onClick={() => {
                            const currentNights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
                            if (currentNights > 1) {
                              setSelectedNights(prev => ({
                                ...prev,
                                [card.id]: currentNights - 1
                              }));
                            }
                          }}
                        >-</button>
                        <span className="nights-value">
                          {(selectedNights[card.id] || extractNightsNumber(card.nights || '') || 0)}박
                        </span>
                        <button 
                          className="nights-btn"
                          onClick={() => {
                            const currentNights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
                            setSelectedNights(prev => ({
                              ...prev,
                              [card.id]: currentNights + 1
                            }));
                          }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 리조트 포함/불포함 사항 */}
              {/* <div className="cost-benefits">
                <div className="cost-benefits-title">리조트 포함사항 및 베네핏</div>
                <div className="cost-benefits-list">
                  {includeItems.map((text, index) => (
                    <div className="cost-benefit-item" key={`include-${index}`}>
                      <span className="benefit-icon">✔</span>
                      <span className="benefit-text">{text}</span>
                    </div>
                  ))}
                  {excludeItems.map((text, index) => (
                    <div className="cost-benefit-item" key={`exclude-${index}`}>
                      <span className="benefit-icon">✖</span>
                      <span className="benefit-text">{text}</span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* 가격 정보 */}
              <div className="cost-price-section">
                <div className="cost-price-row">
                  <div className="cost-price-label">여행기간</div>
                  <div className="cost-price-input-wrapper">
                    <input
                      type="text"
                      className="cost-price-input"
                      value={travelPeriodDisplay}
                      readOnly
                    />
                    <span className="cost-price-calendar-icon">📅</span>
                  </div>
                </div>
                <div className="cost-price-row">
                  <div className="cost-price-label">
                    {finalPricePerPerson && finalPricePerPerson > 0 ? (
                      `${finalPricePerPerson.toLocaleString()}원`
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>요금이 없습니다</span>
                    )}
                  </div>
                  {finalPricePerPerson && finalPricePerPerson > 0 && <div className="cost-price-unit">/1인</div>}
                </div>
                <div className="cost-price-row">
                  <div className="cost-price-label">총요금</div>
                  <div className="cost-price-total">
                    {finalPricePerPerson && finalPricePerPerson > 0 && finalTotalPrice && finalTotalPrice > 0 ? (
                      `₩${finalTotalPrice.toLocaleString()}`
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>요금이 없습니다</span>
                    )}
                  </div>
                </div>
                {/* <div className="cost-price-guests">
                  <button 
                    className="guests-btn"
                    onClick={() => {
                      if (guestCount > 1) {
                        setGuestCount(guestCount - 1);
                      }
                    }}
                  >-</button>
                  <span className="guests-value">{guestCount}명</span>
                  <button 
                    className="guests-btn"
                    onClick={() => {
                      setGuestCount(guestCount + 1);
                    }}
                  >+</button>
                </div> */}
                <div className="cost-schedule-btn-wrapper">
                  <button className="cost-schedule-btn"
                    onClick={() => {
                      setSelectedHotelData({
                        hotelInfo: hotelInfo,
                        productInfo: productInfo,
                        scheduleCards: scheduleCards,
                        periodText: periodText,
                        includeItems: includeItems,
                        excludeItems: excludeItems,
                      selectedRoomTypes: selectedRoomTypes,
                      selectedNights: selectedNights,
                      travelPeriod: travelPeriodDisplay,
                      reserveDate: customerInfo.reserveDate,
                      locationInfo: {
                        address: hotelInfo?.hotelAddress || '',
                        details: [
                          '누사두아 게이티드 지역의 고급 라인업',
                          '공항 → 20~25분',
                          '발리 컬렉션 쇼핑센터 → 차량 5분',
                          '주변: 무려프 비치클럽·워터블로우·BTDC 산책로'
                        ]
                      },
                      benefitItems: benefitItems.map((item) => ({
                        title: item.title,
                        text: item.text,
                        image: item.image
                      })),
                        priceInfo: {
                          pricePerPerson: pricePerPerson,
                          totalPrice: pricePerPerson * guestCount,
                          guestCount: guestCount
                        }
                      });
                      alert('호텔이 담겼습니다.');
                    }}
                  >호텔담기</button>
                  <button className="cost-schedule-btn"
                    onClick={() => {
                      navigate('/counsel/rest/schedule', { state : productInfo})
                      window.scrollTo(0, 0);
                    }}
                  >일정보기</button>
                </div>
              </div>
            </div>
        </div>
        
      </div>
      
      {/* 호텔 선택 모달 */}
      {showHotelSelectModal && selectedCardIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => {
          setShowHotelSelectModal(false);
          setSelectedCardIndex(null);
        }}
        >
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowHotelSelectModal(false);
                setSelectedCardIndex(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              호텔 변경
            </h2>
            
            {(() => {
              const card = scheduleCards.find(c => c.id === selectedCardIndex);
              if (!card) return null;
              
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {hotelsWithFullData.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      해당 타입의 호텔이 없습니다.
                    </div>
                  ) : (
                    hotelsWithFullData.map((hotel: any) => (
                      <div
                        key={hotel.id}
                        onClick={() => handleHotelSelect(hotel)}
                        style={{
                          padding: '15px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: '#fff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                          e.currentTarget.style.borderColor = '#5fb7ef';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                      >
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: '#333',
                          marginBottom: '5px'
                        }}>
                          {hotel.hotelNameKo}
                        </div>
                        {hotel.hotelNameEn && (
                          <div style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '5px'
                          }}>
                            {hotel.hotelNameEn}
                          </div>
                        )}
                        <div style={{
                          fontSize: '12px',
                          color: '#999'
                        }}>
                          {hotel.city || ''} {hotel.nation || ''}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

