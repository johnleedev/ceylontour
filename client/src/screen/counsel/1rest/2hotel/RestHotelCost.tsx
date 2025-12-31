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
import scheduleImg1 from '../../../lastimages/counselrest/schedule/image.png';
import scheduleImg2 from '../../../lastimages/counselrest/schedule/image-1.png';
import scheduleImg3 from '../../../lastimages/counselrest/schedule/image-2.png';
import scheduleImg4 from '../../../lastimages/counselrest/schedule/image-3.png';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recoilSelectedHotelData, recoilCustomerInfoFormData, recoilExchangeRate } from '../../../../RecoilStore';

import { format } from 'date-fns';
import axios from 'axios';
import { calculateSalePrice } from '../hotelPriceManage/poolvillaPriceUtils';
import { calculatePoolvillaFinalPrice } from '../hotelPriceManage/poolvillaPriceCalculation';
import { calculateMinimumStayFinalPrice } from '../hotelPriceManage/minimumStayPriceCalculation';
import { calculatePerDayFinalPrice } from '../hotelPriceManage/perDayPriceCalculation';
// 분리된 컴포넌트 import
import {
  extractNightsNumber,
  formatDate,
  extractRoomTypes,
  getRoomTypesForCard,
  getPeriodType,
  getCurrentImages,
  isVideoFile,
  getRequiredHotelTypes,
  getProductNameFromSchedule
} from './HotelCostComponent/hotelCostUtils';
import {
  fetchLandCommission,
  fetchAllHotels,
  createHandleHotelChange,
  createHandleHotelSelect,
  fetchSelectedHotelsCosts
} from './HotelCostComponent/hotelCostHotelManagement';
import {
  calculatePoolvillaPrice,
  calculateMinimumStayPrice,
  calculatePerDayPrice,
  calculatePerDayPrices,
  calculateMinimumStayPrices,
  calculateFinalPricePerPerson,
  calculateFinalTotalPrice
} from './HotelCostComponent/hotelCostPriceCalculations';
import { createDebugInfo } from './HotelCostComponent/hotelCostDebug';
import { initializeHotels, updateScheduleCards } from './HotelCostComponent/hotelCostInitialization';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import ScheduleRederCustom from '../../../common/ScheduleRederCustom';


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
  
  // 기간변경 모달 관련 상태
  const [showPeriodChangeModal, setShowPeriodChangeModal] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);


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
  // 일정표 토글
  const [showScheduleBox, setShowScheduleBox] = React.useState<boolean>(false);
  const [showScheduleEdit, setShowScheduleEdit] = React.useState<boolean>(false);
  const [activeReservationTab, setActiveReservationTab] = React.useState<'reserve' | 'edit'>('reserve');
  // ScheduleRederBox에서 사용할 상품 ID (기간변경 시 업데이트)
  const [scheduleProductId, setScheduleProductId] = React.useState<string | null>(
    stateProps?.productInfo?.id ? String(stateProps.productInfo.id) : null
  );
  
  // 예약하기 폼 상태
  const [reservationForm, setReservationForm] = React.useState({
    name: '',
    travelType: '',
    productName: '',
    travelPeriod: '',
    airline: '',
    hotel: '',
    pricePerPerson: '',
    totalPrice: ''
  });

  // 수정하기 영역 내부 탭 상태
  const [hotelDetailTab, setHotelDetailTab] = React.useState<'hotel' | 'schedule'>('hotel');
  const [summaryMainTab, setSummaryMainTab] = React.useState<'상세일정' | '항공' | '식사' | '계약특전'>('상세일정');
  const [summarySubTab, setSummarySubTab] = React.useState<'전체' | '호텔베네핏' | '익스커션' | '강습/클래스' | '스파마사지' | '식사/다이닝' | '바/클럽' | '스냅촬영' | '차량/가이드' | '편의사항' | '기타'>('전체');
  // 기간변경 모드 상태
  const [isEditingPeriod, setIsEditingPeriod] = React.useState<boolean>(false);
  // 기간변경 모드 중 가격 계산용 원본 selectedNights 저장 (기간변경 모드일 때만 사용)
  const [originalSelectedNightsForPrice, setOriginalSelectedNightsForPrice] = React.useState<{ [key: number]: number }>({});
  // 상세일정 탭의 상세일정 리스트 데이터
  const [scheduleDetailList, setScheduleDetailList] = React.useState<any[]>([]);
  const [isLoadingScheduleDetail, setIsLoadingScheduleDetail] = React.useState<boolean>(false);

  // 각 탭별 데이터 개수 계산
  const tabCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    const definedTabs = ['호텔베네핏', '익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
    
    // 전체 개수
    counts['전체'] = scheduleDetailList.length;
    
    // 각 정의된 탭별 개수
    definedTabs.forEach(tab => {
      counts[tab] = scheduleDetailList.filter((item: any) => item.sort === tab).length;
    });
    
    // 기타: 정의된 탭에 속하지 않는 항목들
    counts['기타'] = scheduleDetailList.filter((item: any) => {
      return !definedTabs.includes(item.sort);
    }).length;
    
    return counts;
  }, [scheduleDetailList]);

  // 분리된 유틸리티 함수들 사용
  const getRoomTypesForCardCallback = React.useCallback((card: any): string[] => {
    return getRoomTypesForCard(
      card,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      hotelHotelCost,
      resortHotelCost,
      poolVillaHotelCost
    );
  }, [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost]);

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
    
    let newHotels: Array<{ hotel: any; hotelSort: string; hotelName: string }> = [];
    
    if (validHotels.length >= 2) {
      // 호텔이 2개 이상인 경우 탭 표시
      newHotels = validHotels.map((sh, index) => ({
        hotel: sh.hotel,
        hotelSort: sh.hotelSort,
        hotelName: sh.hotel.hotelNameKo || sh.hotelSort || `호텔 ${index + 1}`
      }));
    }

    // 실제로 변경되었을 때만 업데이트 (무한 루프 방지)
    setResortPoolvillaHotels(prev => {
      const prevHotelsIds = prev.map(h => h.hotel?.id).sort().join(',');
      const newHotelsIds = newHotels.map(h => h.hotel?.id).sort().join(',');
      
      if (prevHotelsIds !== newHotelsIds) {
        return newHotels;
      }
      return prev;
    });
  }, [selectedHotels]);

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

  // 분리된 호텔 관리 함수들 사용
  const fetchLandCommissionCallback = React.useCallback(async () => {
    await fetchLandCommission(
      productInfo,
      stateProps,
      setLandCommissionTotal,
      setLandDiscountDefaultTotal,
      setLandDiscountSpecialTotal,
      setLandCurrency
    );
  }, [productInfo?.landCompany, productInfo?.city, stateProps?.city]);

  const fetchAllHotelsCallback = React.useCallback(async () => {
    await fetchAllHotels(
      productInfo,
      stateProps,
      setAllHotels
    );
  }, [productInfo?.city, stateProps?.city]);

  const fetchSelectedHotelsCostsCallback = React.useCallback(async (selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => {
    await fetchSelectedHotelsCosts(
      customerInfo,
      productInfo,
      selectedHotels,
      setIsLoadingCost,
      setHotel1Cost,
      setHotel2Cost,
      setHotel3Cost,
      setHotel4Cost,
      setHotelHotelCost,
      setResortHotelCost,
      setPoolVillaHotelCost,
      selectedHotelsList
    );
  }, [customerInfo.reserveDate, customerInfo.travelPeriod, productInfo, selectedHotels]);

  const handleHotelChange = createHandleHotelChange(
    scheduleCards,
    allHotels,
    stateProps,
    setSelectedCardIndex,
    setShowHotelSelectModal,
    setHotelsWithFullData
  );

  const handleHotelSelect = createHandleHotelSelect(
    selectedCardIndex,
    scheduleCards,
    selectedHotels,
    resortPoolvillaHotels,
    selectedRoomTypes,
    getRoomTypesForCardCallback,
    setSelectedHotels,
    setScheduleCards,
    setShowHotelSelectModal,
    setSelectedCardIndex,
    setSelectedHotelTabIndex,
    setImageAllView,
    setImageRoomView,
    setImageEtcView,
    setRoomTypes,
    setHotelInfo,
    setSelectedMainImageIndex,
    setSelectedRoomTypes,
    fetchSelectedHotelsCostsCallback
  );


  // productInfo가 로드되면 랜드사 수수료 정보 가져오기 및 호텔 리스트 가져오기
  useEffect(() => {
    if (productInfo) {
      fetchLandCommissionCallback();
      fetchAllHotelsCallback();
    }
  }, [productInfo, fetchLandCommission, fetchAllHotels]);

  // 랜드사 수수료 상태 변경 시 필요한 부수 효과가 있다면 이곳에서 처리
  useEffect(() => {
    // 현재는 추가 처리 없음
  }, [landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency]);

  // fetchSelectedHotelsCosts 함수를 useRef로 저장 (stale closure 방지)
  const fetchSelectedHotelsCostsRef = React.useRef<((selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => Promise<void>) | null>(null);

  // fetchSelectedHotelsCosts 함수를 ref에 저장
  React.useEffect(() => {
    fetchSelectedHotelsCostsRef.current = fetchSelectedHotelsCostsCallback;
  }, [fetchSelectedHotelsCostsCallback]);

  // 초기화 완료 플래그 (한 번만 실행되도록)
  const initializationRef = React.useRef(false);

  // 페이지 로드 시 자동으로 호텔 선택 및 요금 정보 가져오기
  useEffect(() => {
    if (!hotelInfo || !productInfo) return;
    if (initializationRef.current) return; // 이미 초기화되었으면 실행하지 않음

    const runInitialization = async () => {
      initializationRef.current = true; // 초기화 시작 표시
      await initializeHotels(
        hotelInfo,
        productInfo,
        stateProps,
        setSelectedHotels,
        setHotelPriceStep,
        fetchSelectedHotelsCostsRef
      );
    };

    runInitialization();
  }, [hotelInfo, productInfo, stateProps]);

  // selectedHotels가 업데이트되면 scheduleCards의 호텔명 및 날짜 업데이트
  useEffect(() => {
    updateScheduleCards(
      selectedHotels,
      productInfo,
      customerInfo,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      hotelHotelCost,
      resortHotelCost,
      poolVillaHotelCost,
      selectedRoomTypes,
      selectedNights,
      setScheduleCards,
      setSelectedRoomTypes,
      setSelectedNights,
      getRoomTypesForCardCallback
    );
    // selectedRoomTypes와 selectedNights는 updateScheduleCards 내부에서 함수형 업데이트로 비교하므로 dependency에서 제거
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHotels, productInfo?.productScheduleData, customerInfo.travelPeriod, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost, getRoomTypesForCardCallback]);

  // 룸타입 정보가 로드되면 각 카드의 첫 번째 룸타입 자동 선택 및 nights 초기화
  useEffect(() => {
    if (scheduleCards.length === 0) return;
    if (!hotel1Cost && !hotel2Cost && !hotel3Cost && !hotel4Cost && !hotelHotelCost && !resortHotelCost && !poolVillaHotelCost) return;

    const newSelectedRoomTypes: { [key: number]: string } = {};
    const newSelectedNights: { [key: number]: number } = {};
    
    scheduleCards.forEach((card) => {
      const roomTypes = getRoomTypesForCardCallback(card);
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
  }, [scheduleCards, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost, getRoomTypesForCardCallback]);

  // 환율 정보 가져오기
  const usdRate = React.useMemo(() => {
    const raw = exchangeRate?.USDsend_KRW_tts;
    const rawStr = raw !== undefined && raw !== null ? String(raw) : '';
    const num = parseFloat(rawStr.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }, [exchangeRate]);

  // 분리된 가격 계산 함수들 사용 (useMemo로 감싸서 메모이제이션)
  // 기간변경 모드일 때는 원본 selectedNights를 사용하고, 아닐 때는 현재 selectedNights를 사용
  const nightsForPriceCalculation = isEditingPeriod ? originalSelectedNightsForPrice : selectedNights;
  
  const calculatedPoolvillaPrice = React.useMemo(() => {
    return calculatePoolvillaPrice(
      productInfo,
      scheduleCards,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      nightsForPriceCalculation,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate,
      getRoomTypesForCardCallback
    );
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    JSON.stringify(selectedRoomTypes),
    JSON.stringify(nightsForPriceCalculation),
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
    getRoomTypesForCardCallback
  ]);

  const calculatedMinimumStayPrice = React.useMemo(() => {
    return calculateMinimumStayPrice(
      productInfo,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      nightsForPriceCalculation,
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
    JSON.stringify(selectedRoomTypes),
    JSON.stringify(nightsForPriceCalculation),
    scheduleCards,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    exchangeRate
  ]);

  const calculatedPerDayPrice = React.useMemo(() => {
    return calculatePerDayPrice(
      productInfo,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      nightsForPriceCalculation,
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
    JSON.stringify(selectedRoomTypes),
    JSON.stringify(nightsForPriceCalculation),
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    exchangeRate
  ]);

  const perDayPrices = React.useMemo(() => {
    return calculatePerDayPrices(
      productInfo,
      scheduleCards,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      nightsForPriceCalculation,
      exchangeRate,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate
    );
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    JSON.stringify(selectedRoomTypes),
    JSON.stringify(nightsForPriceCalculation),
    scheduleCards,
    exchangeRate,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate
  ]);

  const minimumStayPrices = React.useMemo(() => {
    return calculateMinimumStayPrices(
      productInfo,
      scheduleCards,
      hotel1Cost,
      hotel2Cost,
      hotel3Cost,
      hotel4Cost,
      selectedRoomTypes,
      nightsForPriceCalculation,
      exchangeRate,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate
    );
  }, [
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    JSON.stringify(selectedRoomTypes),
    JSON.stringify(nightsForPriceCalculation),
    scheduleCards,
    exchangeRate,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate
  ]);

  const finalPricePerPerson = React.useMemo(() => {
    return calculateFinalPricePerPerson(
      productInfo,
      calculatedPoolvillaPrice,
      calculatedMinimumStayPrice,
      calculatedPerDayPrice,
      minimumStayPrices,
      perDayPrices,
      pricePerPerson
    );
  }, [
    productInfo?.costType,
    calculatedPoolvillaPrice,
    calculatedMinimumStayPrice,
    calculatedPerDayPrice,
    minimumStayPrices,
    perDayPrices,
    pricePerPerson
  ]);

  const finalTotalPrice = React.useMemo(() => {
    return calculateFinalTotalPrice(
      productInfo,
      minimumStayPrices,
      perDayPrices,
      finalPricePerPerson,
      guestCount
    );
  }, [productInfo?.costType, minimumStayPrices, perDayPrices, finalPricePerPerson, guestCount]);

  // productScheduleData를 파싱하여 호텔명 생성 (RestHotelDetail.tsx 참조)
  const getProductNameFromScheduleCallback = React.useCallback((): string => {
    return getProductNameFromSchedule(productInfo, selectedHotels, hotelInfo, allHotels);
  }, [productInfo, selectedHotels, hotelInfo, allHotels]);

  // 상세일정 데이터 조회
  const fetchScheduleDetailList = React.useCallback(async () => {
    try {
      const city = stateProps?.city || hotelInfo?.city;
      if (!city) {
        setScheduleDetailList([]);
        return;
      }

      setIsLoadingScheduleDetail(true);
      const response = await axios.post(`${AdminURL}/ceylontour/getdetailboxbycity`, { city });
      console.log('response', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setScheduleDetailList(response.data);
      } else {
        setScheduleDetailList([]);
      }
    } catch (error) {
      console.error('상세일정 데이터를 가져오는 중 오류 발생:', error);
      setScheduleDetailList([]);
    } finally {
      setIsLoadingScheduleDetail(false);
    }
  }, [stateProps?.city, hotelInfo?.city]);

  // 상세일정 데이터 로드
  useEffect(() => {
    const city = stateProps?.city || hotelInfo?.city;
    if (city) {
      fetchScheduleDetailList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelInfo?.city, stateProps?.city]);

  // 선택된 나라의 관련 여행상품(일정) 조회
  const fetchNationProducts = async () => {
    try {
      const city = stateProps?.city;
      if (!city) {
        setProducts([]);
        return;
      }
      const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city });
      if (response.data) {
        const copy = [...response.data];
        setProducts(copy);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('나라별 여행상품을 가져오는 중 오류 발생:', error);
      setProducts([]);
    }
  };

  // productScheduleData를 파싱하여 선택된 호텔 정보 생성 (RestHotelDetail.tsx 참조)
  const getSelectedHotelsFromSchedule = async (product: any): Promise<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>> => {
    const currentHotelType = hotelInfo?.hotelType || hotelInfo?.hotelSort;
    const currentHotel = hotelInfo;

    // 미니멈스테이인 경우 productScheduleData가 없어도 현재 호텔을 선택
    if (!product.productScheduleData) {
      if (product.costType === '미니멈스테이' && currentHotel) {
        const hotelSort = currentHotelType || '리조트';
        if (hotelSort === '리조트' || hotelSort === '호텔') {
          let hotelWithImages = currentHotel;
          if (currentHotel.id) {
            const hasImages = currentHotel.imageNamesAllView && 
                             currentHotel.imageNamesAllView !== '[]' && 
                             currentHotel.imageNamesAllView !== '';
            
            if (!hasImages) {
              let hotelWithFullData = allHotels.find((h: any) => h.id === currentHotel.id);
              
              if ((!hotelWithFullData || !hotelWithFullData.imageNamesAllView || hotelWithFullData.imageNamesAllView === '[]') && 
                  currentHotel.hotelNameKo && stateProps?.city) {
                try {
                  const hotelName = encodeURIComponent(currentHotel.hotelNameKo);
                  const city = encodeURIComponent(stateProps.city);
                  const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
                  if (res.data && res.data !== false) {
                    const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
                    if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
                      hotelWithFullData = hotelData;
                    }
                  }
                } catch (error) {
                  console.error('호텔 데이터 가져오기 오류:', error);
                }
              }
              
              if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
                hotelWithImages = hotelWithFullData;
              }
            }
          }

          hotelWithImages = {
            ...hotelWithImages,
            imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
            imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
            imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
            hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
          };

          return [{
            index: 0,
            hotelSort: hotelSort,
            dayNight: '3',
            hotel: hotelWithImages
          }];
        }
      }
      return [];
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        if (product.costType === '미니멈스테이' && currentHotel) {
          const hotelSort = currentHotelType || '리조트';
          if (hotelSort === '리조트' || hotelSort === '호텔') {
            let hotelWithImages = currentHotel;
            if (currentHotel.id) {
              const hasImages = currentHotel.imageNamesAllView && 
                               currentHotel.imageNamesAllView !== '[]' && 
                               currentHotel.imageNamesAllView !== '';
              
              if (!hasImages) {
                const hotelWithFullData = allHotels.find((h: any) => h.id === currentHotel.id);
                if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
                  hotelWithImages = hotelWithFullData;
                }
              }
            }

            hotelWithImages = {
              ...hotelWithImages,
              imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
              imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
              imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
              hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
            };

            return [{
              index: 0,
              hotelSort: hotelSort,
              dayNight: '3',
              hotel: hotelWithImages
            }];
          }
        }
        return [];
      }

      const hasResort = scheduleData.some((item: any) => item.hotelSort === '리조트');
      const hasPoolVilla = scheduleData.some((item: any) => item.hotelSort === '풀빌라');
      const isResortPoolVilla = scheduleData.length >= 2 && hasResort && hasPoolVilla;

      const usedHotelIds = new Set<string | number>();
      let currentHotelUsedIndex: number | null = null;

      for (let i = scheduleData.length - 1; i >= 0; i--) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        
        if (currentHotelType === hotelSort && currentHotel && currentHotelUsedIndex === null) {
          currentHotelUsedIndex = i;
          if (currentHotel.id !== null && currentHotel.id !== undefined) {
            usedHotelIds.add(currentHotel.id);
          }
          break;
        }
      }

      const selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }> = [];
      
      for (let i = 0; i < scheduleData.length && i < 4; i++) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';

        let selectedHotel: any | null = null;

        if (i === currentHotelUsedIndex && currentHotelType === hotelSort && currentHotel) {
          selectedHotel = currentHotel;
        } else if (isResortPoolVilla && currentHotelType === '풀빌라' && hotelSort === '리조트') {
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === '리조트' || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes('리조트'))) &&
                   !usedHotelIds.has(hotel.id);
          });

          if (matchingHotels.length > 0) {
            selectedHotel = matchingHotels[0];
            if (selectedHotel.id !== null && selectedHotel.id !== undefined) {
              usedHotelIds.add(selectedHotel.id);
            }
          }
        } else {
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === hotelSort || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes(hotelSort))) &&
                   !usedHotelIds.has(hotel.id);
          });

          if (matchingHotels.length > 0) {
            selectedHotel = matchingHotels[0];
            if (selectedHotel.id !== null && selectedHotel.id !== undefined) {
              usedHotelIds.add(selectedHotel.id);
            }
          }
        }

        let hotelWithImages = selectedHotel;
        
        if (selectedHotel && selectedHotel.id) {
          const hasImages = selectedHotel.imageNamesAllView && 
                           selectedHotel.imageNamesAllView !== '[]' && 
                           selectedHotel.imageNamesAllView !== '';
          
          if (!hasImages) {
            let hotelWithFullData = allHotels.find((h: any) => h.id === selectedHotel.id);
            
            if ((!hotelWithFullData || !hotelWithFullData.imageNamesAllView || hotelWithFullData.imageNamesAllView === '[]') && 
                selectedHotel.hotelNameKo && stateProps?.city) {
              try {
                const hotelName = encodeURIComponent(selectedHotel.hotelNameKo);
                const city = encodeURIComponent(stateProps.city);
                const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
                if (res.data && res.data !== false) {
                  const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
                  if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
                    hotelWithFullData = hotelData;
                  }
                }
              } catch (error) {
                console.error('호텔 데이터 가져오기 오류:', error);
              }
            }
            
            if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
              hotelWithImages = hotelWithFullData;
            }
          }
        }

        if (hotelWithImages) {
          hotelWithImages = {
            ...hotelWithImages,
            imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
            imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
            imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
            hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
          };
        }

        selectedHotels.push({
          index: i,
          hotelSort: hotelSort,
          dayNight: dayNight,
          hotel: hotelWithImages
        });
      }

      return selectedHotels;
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      if (product.costType === '미니멈스테이' && currentHotel) {
        const hotelSort = currentHotelType || '리조트';
        if (hotelSort === '리조트' || hotelSort === '호텔') {
          let hotelWithImages = currentHotel;
          if (currentHotel.id) {
            const hasImages = currentHotel.imageNamesAllView && 
                             currentHotel.imageNamesAllView !== '[]' && 
                             currentHotel.imageNamesAllView !== '';
            
            if (!hasImages) {
              let hotelWithFullData = allHotels.find((h: any) => h.id === currentHotel.id);
              
              if ((!hotelWithFullData || !hotelWithFullData.imageNamesAllView || hotelWithFullData.imageNamesAllView === '[]') && 
                  currentHotel.hotelNameKo && stateProps?.city) {
                try {
                  const hotelName = encodeURIComponent(currentHotel.hotelNameKo);
                  const city = encodeURIComponent(stateProps.city);
                  const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
                  if (res.data && res.data !== false) {
                    const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
                    if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
                      hotelWithFullData = hotelData;
                    }
                  }
                } catch (error) {
                  console.error('호텔 데이터 가져오기 오류:', error);
                }
              }
              
              if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
                hotelWithImages = hotelWithFullData;
              }
            }
          }

          hotelWithImages = {
            ...hotelWithImages,
            imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
            imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
            imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
            hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
          };

          return [{
            index: 0,
            hotelSort: hotelSort,
            dayNight: '3',
            hotel: hotelWithImages
          }];
        }
      }
      return [];
    }
  };

  // RestHotelDetail.tsx의 getProductNameFromSchedule 함수 (상품명 생성용)
  const getProductNameFromScheduleForModal = (product: any): string => {
    if (!product.productScheduleData) {
      return product.productName || product.scheduleName || product.hotelNameKo || '';
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return product.productName || product.scheduleName || product.hotelNameKo || '';
      }

      const currentHotelType = hotelInfo?.hotelType || hotelInfo?.hotelSort;
      const currentHotel = hotelInfo;

      const hasResort = scheduleData.some((item: any) => item.hotelSort === '리조트');
      const hasPoolVilla = scheduleData.some((item: any) => item.hotelSort === '풀빌라');
      const isResortPoolVilla = scheduleData.length >= 2 && hasResort && hasPoolVilla;

      const usedHotelIds = new Set<string | number>();
      let currentHotelUsedIndex: number | null = null;

      for (let i = scheduleData.length - 1; i >= 0; i--) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        
        if (currentHotelType === hotelSort && currentHotel && currentHotelUsedIndex === null) {
          currentHotelUsedIndex = i;
          if (currentHotel.id !== null && currentHotel.id !== undefined) {
            usedHotelIds.add(currentHotel.id);
          }
          break;
        }
      }

      const hotelNightsMap: { [key: string]: { hotelName: string; nights: number } } = {};
      
      for (let i = 0; i < scheduleData.length; i++) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';
        
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;

        let hotelName = hotelSort;
        let hotelId: string | number | null = null;

        if (i === currentHotelUsedIndex && currentHotelType === hotelSort && currentHotel) {
          hotelName = currentHotel.hotelNameKo || hotelSort;
          hotelId = currentHotel.id;
        } else if (isResortPoolVilla && currentHotelType === '풀빌라' && hotelSort === '리조트') {
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === '리조트' || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes('리조트'))) &&
                   !usedHotelIds.has(hotel.id);
          });

          if (matchingHotels.length > 0) {
            hotelName = matchingHotels[0].hotelNameKo || hotelSort;
            hotelId = matchingHotels[0].id;
            if (hotelId !== null) {
              usedHotelIds.add(hotelId);
            }
          }
        } else {
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === hotelSort || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes(hotelSort))) &&
                   !usedHotelIds.has(hotel.id);
          });

          if (matchingHotels.length > 0) {
            hotelName = matchingHotels[0].hotelNameKo || hotelSort;
            hotelId = matchingHotels[0].id;
            if (hotelId !== null) {
              usedHotelIds.add(hotelId);
            }
          }
        }

        const key = hotelId !== null ? `hotel_${hotelId}` : `item_${i}`;

        if (hotelNightsMap[key]) {
          hotelNightsMap[key].nights += nights;
        } else {
          hotelNightsMap[key] = {
            hotelName: hotelName,
            nights: nights
          };
        }
      }

      const parts: string[] = [];
      for (const { hotelName, nights } of Object.values(hotelNightsMap)) {
        if (nights > 0) {
          parts.push(`${hotelName} ${nights}박`);
        } else {
          parts.push(hotelName);
        }
      }

      return parts.join(' + ');
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return product.productName || product.scheduleName || product.hotelNameKo || '';
    }
  };

  // 최종 1인요금 / 총요금 및 사용되는 원시 요금 값 디버깅
  useEffect(() => {
    const debug = createDebugInfo(
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
      pricePerPerson,
      exchangeRate,
      landCommissionTotal,
      landDiscountDefaultTotal,
      landDiscountSpecialTotal,
      landCurrency,
      usdRate
    );

    // 디버깅 정보가 있으면 콘솔에 출력 (필요시)
    // console.log('Debug Info:', debug);
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
    pricePerPerson,
    exchangeRate,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate
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
           

            <div
              className="hotel-title-wrapper"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
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

              <button
                type="button"
                onClick={() => setShowScheduleBox(prev => !prev)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                {showScheduleBox ? '호텔정보 보기' : '일정보기'}
              </button>
            </div>



            {showScheduleBox ? (
              <div style={{ marginTop: '40px', position: 'relative' }}>
                {showScheduleEdit ? (
                  <ScheduleRederCustom
                    id={scheduleProductId}
                    productInfo={productInfo}
                  />
                ) : (
                  <ScheduleRederBox
                    id={scheduleProductId}
                  />
                )}
                <button 
                  onClick={() => {
                    setShowScheduleEdit(!showScheduleEdit);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid #333',
                    backgroundColor: '#333',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showScheduleEdit ? '일정보기' : '일정수정하기'}
                </button>
                
              </div>
            ) : (
              <>

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
                      const images = getCurrentImages(activeTab, imageAllView, imageRoomView, imageEtcView);
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
                    {getCurrentImages(activeTab, imageAllView, imageRoomView, imageEtcView).map((img: any, index: number) => {
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
              </>
            )}

            <div style={{height: '100px'}}></div>

          </div>
        </div>

        {/* 오른쪽 영역: 선택한 스케줄(여행상품) 정보 및 비용 */}
        <div className="right-section">
          <div className="hotel-cost-component">
              {/* 제품 정보 헤더 */}
              <div className="cost-header">
                <div className="cost-header-top">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', flexDirection: 'column' }}>
                    <div className="cost-badge">
                      {productInfo?.scheduleSort || productInfo?.costType || '패키지'}
                    </div>
                    <div className="cost-product-name">
                      {getProductNameFromScheduleCallback()} - 
                      {periodText && (
                        <span className="product-period">&nbsp;{periodText}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPeriodChangeModal(true);
                      fetchNationProducts();
                    }}
                    style={{
                      width:'100px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      backgroundColor: '#fff',
                      color: '#333',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    상품변경
                  </button>
                </div>
                
                {/* 예약하기 / 수정하기 탭 버튼 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveReservationTab('reserve')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid #333',
                      backgroundColor: activeReservationTab === 'reserve' ? '#333' : '#fff',
                      color: activeReservationTab === 'reserve' ? '#fff' : '#333',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    예약하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveReservationTab('edit')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid #ddd',
                      backgroundColor: activeReservationTab === 'edit' ? '#333' : '#fff',
                      color: activeReservationTab === 'edit' ? '#fff' : '#333',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    수정하기
                  </button>
                </div>
              </div>

              {/* 예약하기 탭: 입력 폼 */}
              {activeReservationTab === 'reserve' ? (
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    backgroundColor: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h3 style={{
                      margin: '0 0 20px 0',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#333'
                    }}>
                      예약 정보 입력
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* 성명 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          성명 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.name}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="성명을 입력하세요"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 여행형태 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          여행형태 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.travelType}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, travelType: e.target.value }))}
                          placeholder="여행형태를 입력하세요"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 상품명 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          상품명 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.productName}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, productName: e.target.value }))}
                          placeholder="상품명을 입력하세요"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 여행기간 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          여행기간 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.travelPeriod}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, travelPeriod: e.target.value }))}
                          placeholder="여행기간을 입력하세요 (예: 2024-01-01 ~ 2024-01-05)"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 이용항공 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          이용항공 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.airline}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, airline: e.target.value }))}
                          placeholder="이용항공을 입력하세요"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 이용호텔 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          이용호텔 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.hotel}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, hotel: e.target.value }))}
                          placeholder="이용호텔을 입력하세요"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 1인상품가 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          1인상품가 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.pricePerPerson}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, pricePerPerson: e.target.value }))}
                          placeholder="1인상품가를 입력하세요 (예: 1,500,000)"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 총요금 */}
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          총요금 *
                        </label>
                        <input
                          type="text"
                          value={reservationForm.totalPrice}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                          placeholder="총요금을 입력하세요 (예: 3,000,000)"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* 호텔구성/상세일정 탭 */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '20px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <button
                      type="button"
                      onClick={() => setHotelDetailTab('hotel')}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderBottom: hotelDetailTab === 'hotel' ? '2px solid #333' : '2px solid transparent',
                        backgroundColor: 'transparent',
                        color: hotelDetailTab === 'hotel' ? '#333' : '#999',
                        fontSize: '16px',
                        fontWeight: hotelDetailTab === 'hotel' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      호텔구성
                    </button>
                    <button
                      type="button"
                      onClick={() => setHotelDetailTab('schedule')}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderBottom: hotelDetailTab === 'schedule' ? '2px solid #333' : '2px solid transparent',
                        backgroundColor: 'transparent',
                        color: hotelDetailTab === 'schedule' ? '#333' : '#999',
                        fontSize: '16px',
                        fontWeight: hotelDetailTab === 'schedule' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      상세일정
                    </button>
                  </div>


                  {/* 호텔구성 탭 내용 */}
                  {hotelDetailTab === 'hotel' && (
                    <>
                      {/* 기간변경 버튼 */}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isEditingPeriod) {
                              // 기간변경 모드 시작: 현재 selectedNights를 원본으로 저장
                              setOriginalSelectedNightsForPrice({ ...selectedNights });
                              setIsEditingPeriod(true);
                            } else {
                              // 완료: 현재 selectedNights를 그대로 사용 (이미 변경된 값이므로)
                              setIsEditingPeriod(false);
                              // 원본 값은 초기화하지 않아도 되지만, 다음 기간변경을 위해 초기화
                              setOriginalSelectedNightsForPrice({});
                            }
                          }}
                          style={{
                            padding: '5px 15px',
                            border: '1px solid #333',
                            backgroundColor: isEditingPeriod ? '#333' : '#fff',
                            color: isEditingPeriod ? '#fff' : '#333',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isEditingPeriod ? '완료' : '기간변경'}
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
                                value={selectedRoomTypes[card.id] || (getRoomTypesForCardCallback(card)[0] || '')}
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
                                {getRoomTypesForCardCallback(card).map((roomType) => (
                                  <option key={roomType} value={roomType}>
                                    {roomType}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="cost-card-nights-control">
                              {isEditingPeriod && (
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
                              )}
                              <span className="nights-value">
                                {(selectedNights[card.id] || extractNightsNumber(card.nights || '') || 0)}박
                              </span>
                              {isEditingPeriod && (
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
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>

                    
                      {/* 가격 정보 */}
                      <div 
                        className="cost-price-section"
                        style={{
                          opacity: isEditingPeriod ? 0.2 : 1,
                          pointerEvents: isEditingPeriod ? 'none' : 'auto',
                          transition: 'opacity 0.2s ease'
                        }}
                      >
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
              
                      </div>
                    </>
                  )}

                  {/* 상세일정 탭 내용 */}
                  {hotelDetailTab === 'schedule' && (
                    <div className="schedule-summary-content" style={{ marginTop: '20px' }}>
                      <div className="summary-card">
                        <div className="summary-header">
                          <div className="summary-header-top">
                            <span className="summary-day">1일차</span>
                            <span className="summary-date">2025-03-02(일)</span>
                          </div>
                          <div className="summary-sub-tabs" style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '12px',
                            flexWrap: 'wrap'
                          }}>
                            {['전체','호텔베네핏','익스커션','강습/클래스','스파마사지','식사/다이닝','바/클럽','스냅촬영','차량/가이드','편의사항','기타'].map(label => (
                              <span
                                key={label}
                                className={`sub-tab ${summarySubTab === label ? 'active' : ''}`}
                                onClick={() => setSummarySubTab(label as typeof summarySubTab)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  backgroundColor: summarySubTab === label ? '#333' : '#f5f5f5',
                                  color: summarySubTab === label ? '#fff' : '#666',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
                                <span style={{ fontSize: '14px' }}>
                                  {tabCounts[label] || 0}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="summary-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '16px',
                          marginTop: '20px'
                        }}>
                          {isLoadingScheduleDetail ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                              로딩 중...
                            </div>
                          ) : scheduleDetailList.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                              상세일정이 없습니다.
                            </div>
                          ) : (
                            scheduleDetailList
                              .filter((item: any) => {
                                // '전체' 탭일 때는 모든 항목 표시
                                if (summarySubTab === '전체') {
                                  return true;
                                }
                                // '기타' 탭일 때는 정의된 탭에 속하지 않는 항목만 표시
                                if (summarySubTab === '기타') {
                                  const definedTabs = ['호텔베네핏', '익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
                                  return !definedTabs.includes(item.sort);
                                }
                                // 다른 탭일 때는 sort 값과 일치하는 항목만 필터링
                                return item.sort === summarySubTab;
                              })
                              .map((item: any) => {
                              // inputImage가 JSON 배열 문자열인 경우 파싱
                              let imageUrl = scheduleImg1; // 기본 이미지
                              if (item.inputImage) {
                                try {
                                  const imageArray = JSON.parse(item.inputImage);
                                  if (Array.isArray(imageArray) && imageArray.length > 0) {
                                    imageUrl = `${AdminURL}/images/scheduledetailboximages/${imageArray[0]}`;
                                  }
                                } catch (e) {
                                  // 파싱 실패 시 기본 이미지 사용
                                  console.error('이미지 파싱 오류:', e);
                                }
                              }
                              
                              return (
                                <div key={item.id} className="summary-item" style={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => {
                                  // 선택된 영역이 있는지 확인
                                  const addFunction = (window as any).__addDetailItemToSelectedLocation;
                                  if (addFunction && typeof addFunction === 'function') {
                                    addFunction(item);
                                  } else {
                                    alert('먼저 일정표에서 "묶음일정" 또는 "상세일정" 버튼을 클릭하여 추가할 위치를 선택해주세요.');
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#5fb7ef';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(95, 183, 239, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}>
                                  <img className="summary-item-image" alt={item.productName || '상세일정'} src={imageUrl} style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover'
                                  }} />
                                  <div className="summary-item-content" style={{ padding: '12px' }}>
                                    <p className="summary-item-title" style={{
                                      margin: '0 0 8px 0',
                                      fontSize: '16px',
                                      fontWeight: 700,
                                      color: '#333',
                                      lineHeight: '1.4'
                                    }}>
                                      {item.productName || '-'}
                                    </p>
                                    <div className="summary-item-rating" style={{
                                      marginBottom: '8px',
                                      fontSize: '13px',
                                      color: '#ff6b00'
                                    }}>★ {item.scores || '5.0'}</div>
                                    <div className="summary-item-price-row" style={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      gap: '4px'
                                    }}>
                                      <span className="summary-item-price" style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#333'
                                      }}>가격 문의</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="summary-footer" style={{
                          marginTop: '24px',
                          padding: '16px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px'
                        }}>
                          <div className="summary-footer-top" style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            color: '#333'
                          }}>선택된 세부일정 제목</div>
                          <div className="summary-footer-bottom" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div className="summary-footer-left" style={{
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center',
                              flexWrap: 'wrap'
                            }}>
                              <div className="summary-footer-field" style={{
                                fontSize: '13px',
                                color: '#666'
                              }}>날짜</div>
                              <div className="summary-footer-field" style={{
                                fontSize: '13px',
                                color: '#666'
                              }}>선택상품</div>
                              <div className="summary-footer-field price-field" style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#333'
                              }}>￦ 50,000 /1인</div>
                              <div className="summary-footer-field" style={{
                                fontSize: '13px',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <button style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  backgroundColor: '#fff',
                                  cursor: 'pointer'
                                }}>-</button>
                                <span>2명</span>
                                <button style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  backgroundColor: '#fff',
                                  cursor: 'pointer'
                                }}>+</button>
                              </div>
                            </div>
                            <div className="summary-footer-right" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end'
                            }}>
                              <div className="summary-total-label" style={{
                                fontSize: '12px',
                                color: '#999',
                                marginBottom: '4px'
                              }}>총요금</div>
                              <div className="summary-total-price" style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#333'
                              }}>￦100,000</div>
                            </div>
                          </div>
                          {/* <div className="cost-schedule-btn-wrapper" style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '16px'
                          }}>
                            <button
                              className="cost-schedule-btn"
                              style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #333',
                                backgroundColor: '#333',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                alert('일정이 담겼습니다.');
                              }}
                            >
                              일정담기
                            </button>
                            <button
                              className="cost-schedule-btn"
                              style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                backgroundColor: '#fff',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                navigate('/counsel/rest/flight', { state: productInfo });
                                window.scrollTo(0, 0);
                              }}
                            >
                              다음
                            </button>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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

      {/* 상품변경 모달 */}
      {showPeriodChangeModal && (
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
          setShowPeriodChangeModal(false);
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
                setShowPeriodChangeModal(false);
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
              여행상품 선택
            </h2>
            
            <div className="product-list" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {products.length === 0 ? (
                <div className="empty-message" style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  연관된 여행상품이 없습니다.
                </div>
              ) : (
                products.map((product: any) => {
                  const headerText =
                    product.headerText ||
                    `${product.nation || stateProps?.nation || ''} 추천상품`;
                  
                  const productName = getProductNameFromScheduleForModal(product);

                  const badgeType = product.badgeType || 'recommend';
                  const badgeText = product.badgeText || '추천상품';

                  return (
                    <div
                      key={product.id}
                      className="product-item"
                      onClick={async () => {
                        // 선택한 상품 기준으로 호텔/스케줄/요금 정보를 현재 페이지에서 갱신
                        const selectedHotels = await getSelectedHotelsFromSchedule(product);

                        // 상품 정보 갱신
                        setProductInfo(product);
                        setSelectedHotels(selectedHotels);

                        // 여행 기간 텍스트 갱신
                        if (product.tourPeriodData) {
                          try {
                            const periodData = JSON.parse(product.tourPeriodData);
                            const night = periodData.periodNight || '';
                            const day = periodData.periodDay || '';
                            const txt = `${night} ${day}`.trim();
                            setPeriodText(txt);
                          } catch {
                            setPeriodText('');
                          }
                        } else {
                          setPeriodText('');
                        }

                        // 포함/불포함 사항 갱신
                        try {
                          const includes = product.includeNote ? JSON.parse(product.includeNote) : [];
                          setIncludeItems(Array.isArray(includes) ? includes : []);
                        } catch {
                          setIncludeItems([]);
                        }

                        try {
                          const excludes = product.notIncludeNote ? JSON.parse(product.notIncludeNote) : [];
                          setExcludeItems(Array.isArray(excludes) ? excludes : []);
                        } catch {
                          setExcludeItems([]);
                        }

                        // 호텔 구성 카드용 스케줄 카드 갱신
                        try {
                          const sched = product.productScheduleData ? JSON.parse(product.productScheduleData) : [];

                          // Recoil에서 travelPeriod 시작 날짜 가져오기 (기존 로직 재사용)
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
                            const hotelSort = s.sort || s.hotelSort || '';
                            let hotelName = s.roomTypeName || hotelSort || '';

                            // 기간변경에서 계산한 selectedHotels를 우선 사용
                            const selectedHotel = selectedHotels.find(
                              (sh: { index: number }) => sh.index === idx
                            );
                            if (selectedHotel?.hotel?.hotelNameKo) {
                              hotelName = selectedHotel.hotel.hotelNameKo;
                            }

                            // 날짜 계산
                            let dayText = `${idx + 1}일차`;
                            if (currentDate) {
                              dayText = formatDate(currentDate);

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

                        // ScheduleRederBox에서 사용할 상품 ID도 함께 변경
                        setScheduleProductId(
                          product.id !== undefined && product.id !== null
                            ? String(product.id)
                            : null
                        );

                        setShowPeriodChangeModal(false);
                      }}
                      style={{
                        padding: '16px',
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
                      <div className="product-header" style={{
                        marginBottom: '8px'
                      }}>
                        <span className="product-header-text" style={{
                          fontSize: '12px',
                          color: '#999'
                        }}>{headerText}</span>
                      </div>
                      <div className="product-content">
                        <p className="product-name" style={{
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#333',
                          lineHeight: '1.4'
                        }}>
                          {productName}
                        </p>
                        <div className="product-badge-wrapper" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div className={`product-badge badge-${badgeType}`} style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: badgeType === 'recommend' ? '#5fb7ef' : '#ff6b00',
                            color: '#fff'
                          }}>
                            <span>{badgeText}</span>
                          </div>
                          {product.landCompany && (
                            <p className="product-land-company" style={{
                              margin: 0,
                              fontSize: '12px',
                              color: '#666'
                            }}>{product.landCompany}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

