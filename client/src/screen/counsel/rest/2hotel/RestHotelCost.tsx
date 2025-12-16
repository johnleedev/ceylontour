import React from 'react';
import './RestHotelCost.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle565 from '../../../lastimages/counselrest/hotel/detail/rectangle-565.png';
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

import NewHotelPrice_Poolvilla from '../hotelPriceManage/NewHotelPrice_Poolvilla';
import NewHotelPrice_PerDay from '../hotelPriceManage/NewHotelPrice_PerDay';
import NewHotelPrice_MinimunStay from '../hotelPriceManage/NewHotelPrice_MinimunStay';
import { format } from 'date-fns';
import axios from 'axios';


export default function RestHotelCost() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  console.log('stateProps', stateProps);
  
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
  const getRoomTypesForCard = (card: any): string[] => {
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
  };

  // 기간타입 결정 (2+2, 1+3, 3, 4)
  const getPeriodType = (): string | null => {
    if (!scheduleCards || scheduleCards.length === 0) return null;
    
    let resortNights = 0;
    let poolVillaNights = 0;
    
    scheduleCards.forEach((card) => {
      const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
      if (card.badge === '리조트') {
        resortNights += nights;
      } else if (card.badge === '풀빌라') {
        poolVillaNights += nights;
      }
    });
    
    // 기간타입 결정
    if (resortNights === 2 && poolVillaNights === 2) {
      return '2+2';
    } else if (resortNights === 1 && poolVillaNights === 3) {
      return '1+3';
    } else if (resortNights === 0 && poolVillaNights === 3) {
      return '3';
    } else if (resortNights === 0 && poolVillaNights === 4) {
      return '4';
    }
    
    return null;
  };

  // 오른쪽 패널의 선택값을 NewHotelPrice_Poolvilla에 전달하기 위한 외부 선택값
  const poolVillaCardForExternal = scheduleCards.find(card => card.badge === '풀빌라');
  const externalPoolVillaRoomType =
    poolVillaCardForExternal
      ? (selectedRoomTypes[poolVillaCardForExternal.id] || (getRoomTypesForCard(poolVillaCardForExternal)[0] || ''))
      : '';
  const externalPoolVillaPeriodType = getPeriodType() || '';

  // 풀빌라 카드에서 선택된 룸타입 가져오기
  const getSelectedPoolVillaRoomType = (): string | null => {
    const poolVillaCard = scheduleCards.find(card => card.badge === '풀빌라');
    if (!poolVillaCard) return null;
    return selectedRoomTypes[poolVillaCard.id] || null;
  };

  // 요금 계산 함수 (HotelPriceInfo_Poolvilla의 검색 로직 참고)
  const calculatePrice = (): number => {
    if (!poolVillaHotelCost || !poolVillaHotelCost.costInput) return 0;
    
    const periodType = getPeriodType();
    const selectedRoomType = getSelectedPoolVillaRoomType();
    
    if (!periodType || !selectedRoomType) return 0;
    
    // costInput 배열에서 조건에 맞는 항목 찾기
    for (const cost of poolVillaHotelCost.costInput) {
      try {
        const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
        if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
          const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
            if (rt.roomType !== selectedRoomType) return false;
            
            // 기간타입에 맞는 요금이 있는지 확인
            if (periodType === '2+2' && rt.twoTwoDayCost) return true;
            if (periodType === '1+3' && rt.oneThreeDayCost) return true;
            if (periodType === '3' && rt.threeDayCost && rt.threeDayCost !== '') return true;
            if (periodType === '4' && rt.fourDayCost) return true;
            
            return false;
          });
          
          if (matchingRoom) {
            // 기간타입에 맞는 요금 가져오기
            let priceStr = '';
            if (periodType === '2+2' && matchingRoom.twoTwoDayCost) {
              priceStr = String(matchingRoom.twoTwoDayCost);
            } else if (periodType === '1+3' && matchingRoom.oneThreeDayCost) {
              priceStr = String(matchingRoom.oneThreeDayCost);
            } else if (periodType === '3' && matchingRoom.threeDayCost && matchingRoom.threeDayCost !== '') {
              priceStr = String(matchingRoom.threeDayCost);
            } else if (periodType === '4' && matchingRoom.fourDayCost) {
              priceStr = String(matchingRoom.fourDayCost);
            }
            
            // 문자열에서 숫자 추출 (쉼표 제거 후 숫자로 변환)
            const priceNum = parseInt(priceStr.replace(/,/g, ''), 10);
            if (!isNaN(priceNum)) {
              return priceNum;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    
    return 0;
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
      // 초기에는 productScheduleData만 사용, 나중에 selectedHotelForType이 업데이트되면 호텔명과 날짜로 업데이트됨
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
        
        const cards = (Array.isArray(sched) ? sched : []).map((s: any, idx: number) => {
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
            badge: s.sort || s.hotelSort || '',
            title: s.roomTypeName || s.hotelSort || '',
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
    console.log('🔍 fetchLandCommission 호출:', {
      landCompany: productInfo?.landCompany,
      city: stateProps.city,
      productInfo: productInfo
    });
    
   
    try {
      const url = `${AdminURL}/landcompany/getlandcompanyone/${stateProps.city}/${productInfo.landCompany}`;
      console.log('📡 API 호출:', url);
      
      const res = await axios.get(url);
      console.log('📥 API 응답:', res.data);
      
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const lc = res.data[0];
        console.log('✅ 랜드사 정보:', lc);
        
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
          console.log('💰 commissionParsed:', commissionParsed);
        } catch (e) {
          console.error('❌ commission 파싱 오류:', e, '원본:', lc.commission);
          commissionParsed = [];
        }
        
        try {
          discountDefaultParsed = typeof lc.discountDefault === 'string' ? JSON.parse(lc.discountDefault) : (Array.isArray(lc.discountDefault) ? lc.discountDefault : []);
          console.log('💸 discountDefaultParsed:', discountDefaultParsed);
        } catch (e) {
          console.error('❌ discountDefault 파싱 오류:', e, '원본:', lc.discountDefault);
          discountDefaultParsed = [];
        }
        
        try {
          discountSpecialParsed = typeof lc.discountSpecial === 'string' ? JSON.parse(lc.discountSpecial) : (Array.isArray(lc.discountSpecial) ? lc.discountSpecial : []);
          console.log('🎁 discountSpecialParsed:', discountSpecialParsed);
        } catch (e) {
          console.error('❌ discountSpecial 파싱 오류:', e, '원본:', lc.discountSpecial);
          discountSpecialParsed = [];
        }
        
        if (Array.isArray(commissionParsed) && commissionParsed.length > 0) {
          commissionParsed.forEach((item: any) => {
            const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
            console.log('  - 수수료 항목:', item, 'chargeNum:', chargeNum);
            if (!isNaN(chargeNum)) commissionTotal += chargeNum;
          });
        }
        console.log('💰 최종 commissionTotal:', commissionTotal);
        setLandCommissionTotal(commissionTotal);
        
        if (Array.isArray(discountDefaultParsed) && discountDefaultParsed.length > 0) {
          discountDefaultParsed.forEach((item: any) => {
            const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
            console.log('  - 기본 네고 항목:', item, 'chargeNum:', chargeNum);
            if (!isNaN(chargeNum)) discountDefaultTotal += chargeNum;
          });
        }
        console.log('💸 최종 discountDefaultTotal:', discountDefaultTotal);
        setLandDiscountDefaultTotal(discountDefaultTotal);
        
        if (Array.isArray(discountSpecialParsed) && discountSpecialParsed.length > 0) {
          discountSpecialParsed.forEach((item: any) => {
            const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
            console.log('  - 특별 네고 항목:', item, 'chargeNum:', chargeNum);
            if (!isNaN(chargeNum)) discountSpecialTotal += chargeNum;
          });
        }
        console.log('🎁 최종 discountSpecialTotal:', discountSpecialTotal);
        setLandDiscountSpecialTotal(discountSpecialTotal);
        
        console.log('✅ 랜드사 수수료 정보 설정 완료:', {
          commissionTotal,
          discountDefaultTotal,
          discountSpecialTotal,
          currency
        });
      } else {
        console.warn('⚠️ 랜드사 정보가 없거나 배열이 아님:', res.data);
        setLandCommissionTotal(0);
        setLandDiscountDefaultTotal(0);
        setLandDiscountSpecialTotal(0);
        setLandCurrency('₩');
      }
    } catch (e) {
      console.error('❌ 랜드사 수수료 정보 가져오기 오류:', e);
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
      console.error('호텔 리스트 가져오기 오류:', error);
      setAllHotels([]);
    }
  }, [productInfo?.city, stateProps?.city]);

  // productInfo가 로드되면 랜드사 수수료 정보 가져오기 및 호텔 리스트 가져오기
  useEffect(() => {
    if (productInfo) {
      console.log('🔄 productInfo 변경됨, fetchLandCommission 호출');
      fetchLandCommission();
      fetchAllHotels();
    }
  }, [productInfo, fetchLandCommission, fetchAllHotels]);

  // 랜드사 수수료 상태 변경 디버깅
  useEffect(() => {
    console.log('📊 랜드사 수수료 상태 업데이트:', {
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency
    });
  }, [landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency]);

  // 호텔 변경 핸들러
  const handleHotelChange = (cardIndex: number) => {
    setSelectedCardIndex(cardIndex);
    setShowHotelSelectModal(true);
  };

  // 호텔 선택 완료 핸들러
  const handleHotelSelect = async (selectedHotel: any) => {
    if (selectedCardIndex === null) return;
    
    const card = scheduleCards.find(c => c.id === selectedCardIndex);
    if (!card) return;
    
    console.log('🏨 호텔 선택:', {
      selectedCardIndex,
      card,
      selectedHotel,
      currentSelectedHotels: selectedHotels
    });
    
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
    
    console.log('🔍 호텔 인덱스 찾기:', {
      hotelIndex,
      cardId: card.id,
      targetIndex: targetIndex,
      cardBadge: card.badge,
      selectedHotels: selectedHotels.map(sh => ({ index: sh.index, hotelSort: sh.hotelSort, hotelName: sh.hotel?.hotelNameKo }))
    });
    
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
    
    console.log('✅ 업데이트된 selectedHotels:', updatedSelectedHotels.map(sh => ({
      index: sh.index,
      hotelSort: sh.hotelSort,
      hotelName: sh.hotel?.hotelNameKo
    })));
    
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
    
    // 요금 정보 다시 가져오기 (이것이 hotel1Cost, hotel2Cost 등을 업데이트함)
    console.log('📡 요금 정보 다시 가져오기 시작...');
    await fetchSelectedHotelsCosts(updatedSelectedHotels);
    console.log('✅ 요금 정보 가져오기 완료');
    
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
        console.error('productScheduleData 파싱 오류:', e);
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
      
      console.log('📋 fetchSelectedHotelsCosts 호출:', {
        hotelsToFetch: hotelsToFetch.map(h => ({
          index: h.index,
          hotelSort: h.hotelSort,
          hotelName: h.hotel?.hotelNameKo,
          hotelId: h.hotel?.id
        }))
      });
      
      const costPromises = hotelsToFetch.map(async ({ index, hotel }) => {
        if (!hotel) {
          console.log(`⚠️ 호텔 ${index} 없음`);
          return { index, hotel: null, costInput: [] };
        }
        
        try {
          console.log(`📡 호텔 ${index} 요금 정보 가져오기:`, hotel.hotelNameKo, hotel.id);
          const costInputRes = await axios.post(`${AdminURL}/hotel/gethotelcostbyfilters`, {
            postId: hotel.id,
            dateStart: '',
            dateEnd: '',
            reserveDate: today,
            landCompany: productInfo?.landCompany && productInfo.landCompany !== '전체' ? productInfo.landCompany : ''
          });
          
          const costInputData = costInputRes.data && costInputRes.data !== false 
            ? (Array.isArray(costInputRes.data) ? costInputRes.data : [costInputRes.data])
            : [];
          
          console.log(`✅ 호텔 ${index} 요금 정보 가져오기 완료:`, {
            hotelName: hotel.hotelNameKo,
            costInputCount: costInputData.length
          });
          
          return {
            index,
            hotel,
            costInput: costInputData
          };
        } catch (error) {
          console.error(`❌ 호텔 ${index + 1} 요금 정보 가져오기 오류:`, error);
          return {
            index,
            hotel,
            costInput: []
          };
        }
      });
      
      const costs = await Promise.all(costPromises);
      
      console.log('💰 모든 호텔 요금 정보 가져오기 완료:', costs.map(c => ({
        index: c.index,
        hotelName: c.hotel?.hotelNameKo,
        costInputCount: c.costInput?.length || 0
      })));
      
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
          console.log(`🔧 호텔 요금 정보 설정: index=${index}, hotelName=${hotel?.hotelNameKo}, hotelId=${hotel?.id}`);
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
      
      console.log('📊 업데이트할 호텔 요금 정보:', {
        hotelCosts: Object.keys(hotelCosts).map(k => ({
          index: parseInt(k),
          hotelName: hotelCosts[parseInt(k)]?.hotel?.hotelNameKo
        })),
        newResortHotelCost: newResortHotelCost?.hotel?.hotelNameKo,
        newPoolVillaHotelCost: newPoolVillaHotelCost?.hotel?.hotelNameKo
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
      
      console.log('✅ 모든 호텔 요금 정보 상태 업데이트 완료:', {
        hotel1Cost: hotelCosts[0]?.hotel?.hotelNameKo || 'null',
        hotel2Cost: hotelCosts[1]?.hotel?.hotelNameKo || 'null',
        hotel3Cost: hotelCosts[2]?.hotel?.hotelNameKo || 'null',
        hotel4Cost: hotelCosts[3]?.hotel?.hotelNameKo || 'null',
        resortHotelCost: newResortHotelCost?.hotel?.hotelNameKo || 'null',
        poolVillaHotelCost: newPoolVillaHotelCost?.hotel?.hotelNameKo || 'null'
      });
      
      console.log('🎉 모든 호텔 요금 정보 설정 완료');
    } catch (error) {
      console.error('❌ 호텔 요금 정보 가져오기 오류:', error);
    } finally {
      setIsLoadingCost(false);
    }
  }, [today, productInfo]); // selectedHotels 의존성 제거 (파라미터로 받고 있음)

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
          console.error('productScheduleData 파싱 오류:', e);
        }
      }
      
      // 미니멈스테이인 경우 리조트/호텔 추가
      if (productInfo.costType === '미니멈스테이' && scheduleItems.length === 0) {
        scheduleItems = [{
          index: 0,
          hotelSort: '리조트',
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
        if ((hotelSort === item.hotelSort || hotelType === item.hotelSort) && !initialSelectedHotels[i].hotel) {
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
        console.error('호텔 가져오기 오류:', error);
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
            // 이미 선택된 값이 없을 때만 첫 번째 룸타입으로 설정
            if (!selectedRoomTypes[card.id]) {
              newSelectedRoomTypes[card.id] = roomTypes[0];
            } else {
              // 기존 선택값 유지 (단, 해당 룸타입이 여전히 유효한 경우)
              if (roomTypes.includes(selectedRoomTypes[card.id])) {
                newSelectedRoomTypes[card.id] = selectedRoomTypes[card.id];
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
      console.error('scheduleCards 업데이트 오류:', e);
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
        // 이미 선택된 값이 없을 때만 첫 번째 룸타입으로 설정
        if (!selectedRoomTypes[card.id]) {
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
  }, [scheduleCards, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost]);


  // productScheduleData를 파싱하여 호텔명 생성 (RestHotelDetail.tsx 참조)
  const getProductNameFromSchedule = React.useCallback((): string => {
    if (!productInfo?.productScheduleData) {
      // productScheduleData가 없으면 기존 방식 사용
      return productInfo?.productName || '';
    }

    try {
      const scheduleData = JSON.parse(productInfo.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return productInfo?.productName || '';
      }

      const parts: string[] = [];
      
      for (let i = 0; i < scheduleData.length; i++) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';
        const nights = dayNight ? `${dayNight}박` : '';

        // selectedHotels에서 해당 인덱스의 호텔명 가져오기
        const selectedHotel = selectedHotels.find(sh => sh.index === i);
        let hotelName = hotelSort; // 기본값은 hotelSort

        if (selectedHotel?.hotel?.hotelNameKo) {
          hotelName = selectedHotel.hotel.hotelNameKo;
        }

        parts.push(`${hotelName}${nights ? ` ${nights}` : ''}`);
      }

      return parts.join(' + ');
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return productInfo?.productName || '';
    }
  }, [productInfo?.productScheduleData, productInfo?.productName, selectedHotels]);

  // 최종 1인요금 (각 요금 컴포넌트에서 계산된 판매가를 그대로 사용)
  const finalPricePerPerson = pricePerPerson;

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
            {/* 호텔별 요금 관리 섹션 - 상단에 배치 */}
            <div style={{
              marginBottom: '40px',
              paddingBottom: '30px',
              borderBottom: '2px solid #e0e0e0',
              backgroundColor: '#fafafa',
              padding: '20px',
              borderRadius: '8px'
            }}>
              {/* 랜드사 요금 정보 표시 */}
              {productInfo?.landCompany && productInfo.landCompany !== '전체' && (
                <div style={{
                  marginBottom: '20px',
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #ddd'
                  }}>
                    랜드사 요금 정보 {productInfo.landCompany && `(${productInfo.landCompany})`}
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '14px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#666', fontWeight: 500 }}>랜드사 수수료:</span>
                      <span style={{ fontWeight: 600, color: '#333' }}>
                        {landCurrency}{(landCommissionTotal || 0).toLocaleString('ko-KR')}{landCurrency === '₩' ? '원' : ''}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#666', fontWeight: 500 }}>기본 네고:</span>
                      <span style={{ fontWeight: 600, color: '#28a745' }}>
                        -{landCurrency}{(landDiscountDefaultTotal || 0).toLocaleString('ko-KR')}{landCurrency === '₩' ? '원' : ''}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#666', fontWeight: 500 }}>특별 네고:</span>
                      <span style={{ fontWeight: 600, color: '#28a745' }}>
                        -{landCurrency}{(landDiscountSpecialTotal || 0).toLocaleString('ko-KR')}{landCurrency === '₩' ? '원' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* costType에 따라 바로 해당 컴포넌트 표시 */}
              {productInfo?.costType === '팩요금' ? (
                <NewHotelPrice_Poolvilla
                  key={`poolvilla-${hotel1Cost?.hotel?.id || 'null'}-${hotel2Cost?.hotel?.id || 'null'}-${hotel3Cost?.hotel?.id || 'null'}-${hotel4Cost?.hotel?.id || 'null'}`}
                  hotel1Cost={hotel1Cost}
                  hotel2Cost={hotel2Cost}
                  hotel3Cost={hotel3Cost}
                  hotel4Cost={hotel4Cost}
                  isLoadingCost={isLoadingCost}
                  priceModalData={{
                    productName: productInfo?.productName || '',
                    tourLocation: productInfo?.city || '',
                    tourPeriodData: productInfo?.tourPeriodData || '',
                    productScheduleData: productInfo?.productScheduleData || '',
                    landCompany: productInfo?.landCompany || ''
                  }}
                  onBack={() => {}}
                  today={today}
                  landCommissionTotal={landCommissionTotal}
                  landDiscountDefaultTotal={landDiscountDefaultTotal}
                  landDiscountSpecialTotal={landDiscountSpecialTotal}
                  landCurrency={landCurrency}
                  // 오른쪽 패널에서 선택한 룸타입/박수(팩요금용)를 전달
                  externalRoomType={externalPoolVillaRoomType}
                  externalPeriodType={externalPoolVillaPeriodType}
                  onPriceUpdate={(price: number) => {
                    console.log('💰 팩요금 가격 업데이트:', price);
                    setPricePerPerson(price);
                  }}
                />
              ) : productInfo?.costType === '미니멈스테이' ? (
                <NewHotelPrice_MinimunStay
                  hotel1Cost={hotel1Cost}
                  hotel2Cost={hotel2Cost}
                  hotel3Cost={hotel3Cost}
                  hotel4Cost={hotel4Cost}
                  isLoadingCost={isLoadingCost}
                  priceModalData={{
                    productName: productInfo?.productName || '',
                    tourLocation: productInfo?.city || '',
                    tourPeriodData: productInfo?.tourPeriodData || '',
                    productScheduleData: productInfo?.productScheduleData || '',
                    landCompany: productInfo?.landCompany || ''
                  }}
                  onBack={() => {}}
                  today={today}
                  landCommissionTotal={landCommissionTotal}
                  landDiscountDefaultTotal={landDiscountDefaultTotal}
                  landDiscountSpecialTotal={landDiscountSpecialTotal}
                  landCurrency={landCurrency}
                  onPriceUpdate={(price: number) => {
                    console.log('💰 미니멈스테이 가격 업데이트:', price);
                    setPricePerPerson(price);
                  }}
                />
              ) : productInfo?.costType === '박당' ? (
                <NewHotelPrice_PerDay
                  hotel1Cost={hotel1Cost}
                  hotel2Cost={hotel2Cost}
                  hotel3Cost={hotel3Cost}
                  hotel4Cost={hotel4Cost}
                  isLoadingCost={isLoadingCost}
                  priceModalData={{
                    productName: productInfo?.productName || '',
                    tourLocation: productInfo?.city || '',
                    tourPeriodData: productInfo?.tourPeriodData || '',
                    productScheduleData: productInfo?.productScheduleData || '',
                    landCompany: productInfo?.landCompany || ''
                  }}
                  onBack={() => {}}
                  today={today}
                  landCommissionTotal={landCommissionTotal}
                  landDiscountDefaultTotal={landDiscountDefaultTotal}
                  landDiscountSpecialTotal={landDiscountSpecialTotal}
                  landCurrency={landCurrency}
                  onPriceUpdate={(price: number) => {
                    console.log('💰 박당 가격 업데이트:', price);
                    setPricePerPerson(price);
                  }}
                />
              )   
              : (
                <div>
                  <h3>호텔별 요금</h3>
                </div>
              )
              }
              
            </div>
                {/* (
              
                 hotelPriceStep === 1 && (
                   <PriceHotelSelected
              //       priceModalData={{
              //         productName: productInfo?.productName || '',
              //         tourLocation: productInfo?.city || '',
              //         tourPeriodData: productInfo?.tourPeriodData || '',
              //         productScheduleData: productInfo?.productScheduleData || '',
              //         landCompany: productInfo?.landCompany || ''
              //       }}
              //       initialSelectedHotels={selectedHotelForType}
              //       onNext={(selectedHotels) => {
              //         setSelectedHotelForType(selectedHotels);
              //         setHotelPriceStep(2);
              //         fetchSelectedHotelsCosts(selectedHotels);
              //       }}
              //     />
              //   )
              // ) */}

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
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.borderColor = '#bbb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
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
                            console.log('룸타입 변경:', {
                              cardId: card.id,
                              cardBadge: card.badge,
                              oldRoomType: selectedRoomTypes[card.id],
                              newRoomType: newRoomType,
                              card: card
                            });
                            
                            setSelectedRoomTypes(prev => {
                              const updated = {
                                ...prev,
                                [card.id]: newRoomType
                              };
                              console.log('업데이트된 selectedRoomTypes:', updated);
                              return updated;
                            });
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
              <div className="cost-benefits">
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
              </div>

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
                    {finalPricePerPerson > 0 ? (
                      `${finalPricePerPerson.toLocaleString()}원`
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>요금이 없습니다</span>
                    )}
                  </div>
                  {finalPricePerPerson > 0 && <div className="cost-price-unit">/1인</div>}
                </div>
                <div className="cost-price-row">
                  <div className="cost-price-label">총요금</div>
                  <div className="cost-price-total">
                    {finalPricePerPerson > 0 ? (
                      `₩${(finalPricePerPerson * guestCount).toLocaleString()}`
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
              
              // 해당 타입의 호텔만 필터링
              const filteredHotels = allHotels.filter((hotel: any) => {
                const hotelType = hotel.hotelType || hotel.hotelSort;
                return hotelType === card.badge || 
                       (hotel.hotelType && hotel.hotelType.split(' ').includes(card.badge));
              });
              
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {filteredHotels.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      해당 타입의 호텔이 없습니다.
                    </div>
                  ) : (
                    filteredHotels.map((hotel: any) => (
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

