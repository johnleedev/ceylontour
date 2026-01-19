import React from 'react';
import './RestHotelCost.scss';
import { IoIosArrowForward, IoIosArrowBack, IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
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
import { recoilSelectedHotelData, recoilCustomerInfoFormData, recoilExchangeRate, recoilProductName, recoilScheduleInfo, recoilSelectedScheduleData } from '../../../../RecoilStore';

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
import { FaRegCircle } from 'react-icons/fa6';


export default function RestHotelCost() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
 
  const setSelectedHotelData = useSetRecoilState(recoilSelectedHotelData);
  const selectedHotelData = useRecoilValue(recoilSelectedHotelData);
  const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
  const exchangeRate = useRecoilValue(recoilExchangeRate);
  const savedProductName = useRecoilValue(recoilProductName);
  const setSavedProductName = useSetRecoilState(recoilProductName);
  const scheduleInfo = useRecoilValue(recoilScheduleInfo);
  const setScheduleInfo = useSetRecoilState(recoilScheduleInfo);
  const setSelectedScheduleData = useSetRecoilState(recoilSelectedScheduleData);

  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [imageMainPoint, setImageMainPoint] = React.useState<any[]>([]);
  const [imageBenefit, setImageBenefit] = React.useState<any[]>([]);
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
  // 드래그 앤 드롭 관련 state
  const [draggedCardId, setDraggedCardId] = React.useState<number | null>(null);
  const [dragOverCardId, setDragOverCardId] = React.useState<number | null>(null);
  // 일정표 토글
  const [showScheduleBox, setShowScheduleBox] = React.useState<boolean>(false);
  const [showScheduleEdit, setShowScheduleEdit] = React.useState<boolean>(false);
  const [activeReservationTab, setActiveReservationTab] = React.useState<'reserve' | 'edit'>('reserve');
  // 오른쪽 패널 토글
  const [showRightPanel, setShowRightPanel] = React.useState<boolean>(false);
  // ScheduleRederBox에서 사용할 상품 ID (기간변경 시 업데이트)
  const [scheduleProductId, setScheduleProductId] = React.useState<string | null>(
    stateProps?.productInfo?.id ? String(stateProps.productInfo.id) : null
  );
  // 일차별 호텔 정보 (상품변경 시 업데이트)
  const [hotelInfoPerDay, setHotelInfoPerDay] = React.useState<Array<{ dayIndex: number; hotelName: string; hotelLevel: string }>>(
    stateProps?.hotelInfoPerDay || []
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
  const [summarySubTab, setSummarySubTab] = React.useState<'전체' | '익스커션' | '강습/클래스' | '스파마사지' | '식사/다이닝' | '바/클럽' | '스냅촬영' | '차량/가이드' | '편의사항' | '기타'>('전체');
  // 기간변경 모드 상태 (항상 편집 모드)
  const [isEditingPeriod, setIsEditingPeriod] = React.useState<boolean>(true);
  // 기간변경 모드 중 가격 계산용 원본 selectedNights 저장 (기간변경 모드일 때만 사용)
  const [originalSelectedNightsForPrice, setOriginalSelectedNightsForPrice] = React.useState<{ [key: number]: number }>({});
  // 상세일정 탭의 상세일정 리스트 데이터
  const [scheduleDetailList, setScheduleDetailList] = React.useState<any[]>([]);
  const [isLoadingScheduleDetail, setIsLoadingScheduleDetail] = React.useState<boolean>(false);
  // 플로팅 박스용 상태
  const [expandedLocationDays, setExpandedLocationDays] = React.useState<Set<number>>(new Set());
  // 본래 일정 저장 (페이지 진입 시 초기 일정)
  const [originalScheduleInfo, setOriginalScheduleInfo] = React.useState<any | null>(null);
  // 본래 호텔 카드 정보 저장 (페이지 진입 시 초기 호텔 구성)
  const [originalScheduleCards, setOriginalScheduleCards] = React.useState<any[]>([]);
  const [originalSelectedHotels, setOriginalSelectedHotels] = React.useState<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>>([]);
  const [originalSelectedNights, setOriginalSelectedNights] = React.useState<{ [key: number]: number }>({});
  const [originalSelectedRoomTypes, setOriginalSelectedRoomTypes] = React.useState<{ [key: number]: string }>({});

  // 각 탭별 데이터 개수 계산
  const tabCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    const definedTabs = ['익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
    
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
  
  // 필터링된 상세일정 리스트
  const filteredScheduleDetailList = React.useMemo(() => {
    if (summarySubTab === '전체') {
      return scheduleDetailList;
    }
    if (summarySubTab === '기타') {
      const definedTabs = ['익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
      return scheduleDetailList.filter((item: any) => !definedTabs.includes(item.sort));
    }
    return scheduleDetailList.filter((item: any) => item.sort === summarySubTab);
  }, [scheduleDetailList, summarySubTab]);

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
        const mainPoint = h.imageNamesMainPoint ? JSON.parse(h.imageNamesMainPoint) : [];
        setImageMainPoint(Array.isArray(mainPoint) ? mainPoint : []);
      } catch {
        setImageMainPoint([]);
      }

      try {
        const benefit = h.imageNamesBenefit ? JSON.parse(h.imageNamesBenefit) : [];
        setImageBenefit(Array.isArray(benefit) ? benefit : []);
      } catch {
        setImageBenefit([]);
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
        if (customerInfo.travelPeriodStart) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
            startDate = new Date(customerInfo.travelPeriodStart.trim());
          }
        }
        
        let currentDate = startDate ? new Date(startDate) : null;
        
        // stateProps에서 전달받은 selectedHotels 확인
        const initialSelectedHotels = stateProps?.selectedHotels || [];
        
        // selectedHotels가 있으면 그것을 기준으로 카드 생성, 없으면 productScheduleData 사용
        let cards = [];
        
        if (initialSelectedHotels.length > 0) {
          // selectedHotels를 기준으로 카드 생성
          for (let idx = 0; idx < initialSelectedHotels.length; idx++) {
            const selectedHotel = initialSelectedHotels[idx];
            const s = sched[idx] || {};
            
            const hotelSort = selectedHotel?.hotelSort || s.sort || s.hotelSort || '';
            const hotelName = selectedHotel?.hotel?.hotelNameKo || s.roomTypeName || hotelSort || '';
            const dayNight = selectedHotel?.dayNight || s.dayNight || '';
            
            // 날짜 계산
            let dayText = `${idx + 1}일차`; // 기본값
            if (currentDate) {
              dayText = formatDate(currentDate);
              
              // 다음 카드를 위한 날짜 계산 (현재 카드의 nights 일수 추가)
              const nights = extractNightsNumber(dayNight);
              if (nights > 0) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() + nights);
                currentDate = nextDate;
              }
            }
            
            cards.push({
              id: idx + 1,
              day: dayText,
              badge: hotelSort,
              title: hotelName,
              nights: dayNight,
            });
          }
        } else {
          // selectedHotels가 없으면 productScheduleData 사용
          cards = (Array.isArray(sched) ? sched : []).map((s: any, idx: number) => {
            const hotelSort = s.sort || s.hotelSort || '';
            let hotelName = s.roomTypeName || hotelSort || '';
            
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
        }
        
        setScheduleCards(cards);
      } catch {
        setScheduleCards([]);
      }
    }
  }, [stateProps, customerInfo.travelPeriodStart]);

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
      const mainPoint = h.imageNamesMainPoint ? JSON.parse(h.imageNamesMainPoint) : [];
      setImageMainPoint(Array.isArray(mainPoint) ? mainPoint : []);
    } catch {
      setImageMainPoint([]);
    }

    try {
      const benefit = h.imageNamesBenefit ? JSON.parse(h.imageNamesBenefit) : [];
      setImageBenefit(Array.isArray(benefit) ? benefit : []);
    } catch {
      setImageBenefit([]);
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
    if (customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd) {
      setTravelPeriodDisplay(`${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`);
    } else if (periodText) {
      // travelPeriod가 없으면 기존 periodText 사용
      setTravelPeriodDisplay(periodText);
    }
  }, [customerInfo.travelPeriodStart, customerInfo.travelPeriodEnd, periodText]);

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
  }, [customerInfo.reserveDate, customerInfo.travelPeriodStart, productInfo, selectedHotels]);

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
  }, [selectedHotels, productInfo?.productScheduleData, customerInfo.travelPeriodStart, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, hotelHotelCost, resortHotelCost, poolVillaHotelCost, getRoomTypesForCardCallback]);

  // scheduleCards가 업데이트될 때 원래 호텔 카드 정보 저장 (초기 로드 시에만)
  useEffect(() => {
    if (scheduleCards.length > 0 && originalScheduleCards.length === 0) {
      // 원래 호텔 카드 정보 저장 (깊은 복사)
      setOriginalScheduleCards(JSON.parse(JSON.stringify(scheduleCards)));
      setOriginalSelectedHotels(JSON.parse(JSON.stringify(selectedHotels)));
      setOriginalSelectedNights(JSON.parse(JSON.stringify(selectedNights)));
      setOriginalSelectedRoomTypes(JSON.parse(JSON.stringify(selectedRoomTypes)));
    }
  }, [scheduleCards, selectedHotels, selectedNights, selectedRoomTypes]);

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
  // 항상 편집 모드이므로 현재 selectedNights를 사용
  const nightsForPriceCalculation = selectedNights;
  
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

  // scheduleCards와 selectedNights를 기반으로 상품명 생성 및 RecoilStore에 저장
  const updateProductNameFromCards = React.useCallback((cards: any[], nights: { [key: number]: number }) => {
    if (cards.length === 0) return;
    
    const nameParts = cards.map((card) => {
      const nightsValue = nights[card.id] || extractNightsNumber(card.nights || '') || 1;
      return `${card.title} ${nightsValue}박`;
    });
    
    const newProductName = nameParts.join(' + ');
    setSavedProductName(newProductName);
  }, [setSavedProductName]);

  // 호텔 추가 함수
  const handleAddHotel = React.useCallback(() => {
    if (scheduleCards.length === 0) return;

    // 마지막 카드의 정보를 기반으로 새 카드 생성
    const lastCard = scheduleCards[scheduleCards.length - 1];
    const lastCardNights = selectedNights[lastCard.id] || extractNightsNumber(lastCard.nights || '') || 1;
    
    // 마지막 카드의 날짜 계산
    let currentDate: Date | null = null;
    if (customerInfo.travelPeriodStart) {
      try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          currentDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      } catch {
        currentDate = null;
      }
    }

    // 모든 카드의 nights를 합산하여 새 카드의 날짜 계산
    let totalDays = 0;
    scheduleCards.forEach((card) => {
      const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '') || 1;
      totalDays += nights;
      if (currentDate) {
        currentDate.setDate(currentDate.getDate() + nights);
      }
    });

    // 새 카드의 인덱스 (selectedHotels 배열의 인덱스와 일치시켜야 함)
    const newIndex = selectedHotels.length;
    const newId = newIndex + 1; // 카드 ID는 인덱스 + 1로 설정 (updateScheduleCards 로직과 일치)
    let dayText = `${scheduleCards.length + 1}일차`;
    if (currentDate) {
      dayText = formatDate(currentDate);
    }

    const newCard = {
      id: newId,
      day: dayText,
      badge: lastCard.badge || '',
      title: '호텔 선택 필요',
      nights: '2박'
    };

    const updatedCards = [...scheduleCards, newCard];
    setScheduleCards(updatedCards);
    
    // selectedHotels에도 새로운 항목 추가 (이것이 중요!)
    setSelectedHotels(prev => [
      ...prev,
      {
        index: newIndex,
        hotelSort: lastCard.badge || '',
        dayNight: '2',
        hotel: null
      }
    ]);
    
    // 새 카드의 기본 nights 설정
    const newNights = { ...selectedNights, [newId]: 1 };
    setSelectedNights(newNights);

    // scheduleInfo.scheduleDetailData에 마지막 day의 내용을 복사해서 새로운 day에 추가하고, 마지막 day를 빈 일정으로 초기화
    if (scheduleInfo && scheduleInfo.scheduleDetailData && Array.isArray(scheduleInfo.scheduleDetailData)) {
      const newScheduleInfo = { 
        ...scheduleInfo,
        airlineData: scheduleInfo.airlineData || { sort: '', airlineCode: [] }
      };
      const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
      
      // 마지막 day가 있는 경우
      if (newScheduleDetailData.length > 0) {
        const lastDayIndex = newScheduleDetailData.length - 1;
        const lastDay = newScheduleDetailData[lastDayIndex];
        
        // 마지막 day의 내용을 깊은 복사하여 새로운 day로 추가
        const copiedDay = JSON.parse(JSON.stringify(lastDay));
        newScheduleDetailData.push(copiedDay);
        
        // 마지막 day를 빈 일정으로 초기화
        newScheduleDetailData[lastDayIndex] = createEmptyDay();
      } else {
        // 일정이 없으면 빈 day 1개 추가
        newScheduleDetailData.push(createEmptyDay());
      }
      
      newScheduleInfo.scheduleDetailData = newScheduleDetailData;
      setScheduleInfo(newScheduleInfo);
    } else {
      // scheduleInfo가 없으면 기본 구조를 만들고 빈 day 1개 추가
      const newScheduleInfo = {
        airlineData: scheduleInfo?.airlineData || { sort: '', airlineCode: [] },
        scheduleDetailData: scheduleInfo?.scheduleDetailData && Array.isArray(scheduleInfo.scheduleDetailData) && scheduleInfo.scheduleDetailData.length > 0
          ? [...scheduleInfo.scheduleDetailData, createEmptyDay()]
          : [createEmptyDay()]
      };
      setScheduleInfo(newScheduleInfo);
    }

    // 상품명 업데이트
    updateProductNameFromCards(updatedCards, newNights);
  }, [scheduleCards, selectedNights, selectedHotels, customerInfo.travelPeriodStart, updateProductNameFromCards, scheduleInfo]);

  // 카드 순서 변경 함수 (위로 이동)
  const handleMoveCardUp = React.useCallback((cardId: number) => {
    const cardIndex = scheduleCards.findIndex(c => c.id === cardId);
    if (cardIndex <= 0) return; // 첫 번째 카드이면 이동 불가

    const updatedCards = [...scheduleCards];
    [updatedCards[cardIndex - 1], updatedCards[cardIndex]] = [updatedCards[cardIndex], updatedCards[cardIndex - 1]];
    
    // selectedHotels도 함께 이동
    setSelectedHotels(prev => {
      const newHotels = [...prev];
      if (newHotels.length > cardIndex) {
        [newHotels[cardIndex - 1], newHotels[cardIndex]] = [newHotels[cardIndex], newHotels[cardIndex - 1]];
      }
      return newHotels;
    });
    
    // 날짜 재계산
    let currentDate: Date | null = null;
    if (customerInfo.travelPeriodStart) {
      try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          currentDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      } catch {
        currentDate = null;
      }
    }

    const cardsWithUpdatedDates = updatedCards.map((card, idx) => {
      if (currentDate) {
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '') || 1;
        const dayText = formatDate(currentDate);
        currentDate.setDate(currentDate.getDate() + nights);
        return { ...card, day: dayText };
      } else {
        return { ...card, day: `${idx + 1}일차` };
      }
    });

    setScheduleCards(cardsWithUpdatedDates);
    updateProductNameFromCards(cardsWithUpdatedDates, selectedNights);
  }, [scheduleCards, selectedNights, customerInfo.travelPeriodStart, updateProductNameFromCards]);

  // 카드 순서 변경 함수 (아래로 이동)
  const handleMoveCardDown = React.useCallback((cardId: number) => {
    const cardIndex = scheduleCards.findIndex(c => c.id === cardId);
    if (cardIndex < 0 || cardIndex >= scheduleCards.length - 1) return; // 마지막 카드이면 이동 불가

    const updatedCards = [...scheduleCards];
    [updatedCards[cardIndex], updatedCards[cardIndex + 1]] = [updatedCards[cardIndex + 1], updatedCards[cardIndex]];
    
    // selectedHotels도 함께 이동
    setSelectedHotels(prev => {
      const newHotels = [...prev];
      if (newHotels.length > cardIndex + 1) {
        [newHotels[cardIndex], newHotels[cardIndex + 1]] = [newHotels[cardIndex + 1], newHotels[cardIndex]];
      }
      return newHotels;
    });
    
    // 날짜 재계산
    let currentDate: Date | null = null;
    if (customerInfo.travelPeriodStart) {
      try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          currentDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      } catch {
        currentDate = null;
      }
    }

    const cardsWithUpdatedDates = updatedCards.map((card, idx) => {
      if (currentDate) {
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '') || 1;
        const dayText = formatDate(currentDate);
        currentDate.setDate(currentDate.getDate() + nights);
        return { ...card, day: dayText };
      } else {
        return { ...card, day: `${idx + 1}일차` };
      }
    });

    setScheduleCards(cardsWithUpdatedDates);
    updateProductNameFromCards(cardsWithUpdatedDates, selectedNights);
  }, [scheduleCards, selectedNights, customerInfo.travelPeriodStart, updateProductNameFromCards]);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = React.useCallback((e: React.DragEvent, cardId: number) => {
    if (!isEditingPeriod) return;
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  }, [isEditingPeriod]);

  const handleDragOver = React.useCallback((e: React.DragEvent, cardId: number) => {
    if (!isEditingPeriod || draggedCardId === null || draggedCardId === cardId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCardId(cardId);
  }, [isEditingPeriod, draggedCardId]);

  const handleDragLeave = React.useCallback(() => {
    setDragOverCardId(null);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent, targetCardId: number) => {
    e.preventDefault();
    if (!isEditingPeriod || draggedCardId === null || draggedCardId === targetCardId) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    const draggedIndex = scheduleCards.findIndex(c => c.id === draggedCardId);
    const targetIndex = scheduleCards.findIndex(c => c.id === targetCardId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    const updatedCards = [...scheduleCards];
    const [draggedCard] = updatedCards.splice(draggedIndex, 1);
    updatedCards.splice(targetIndex, 0, draggedCard);

    // selectedHotels도 함께 이동
    setSelectedHotels(prev => {
      const newHotels = [...prev];
      if (newHotels.length > draggedIndex && newHotels.length > targetIndex) {
        const [draggedHotel] = newHotels.splice(draggedIndex, 1);
        newHotels.splice(targetIndex, 0, draggedHotel);
      }
      return newHotels;
    });

    // 날짜 재계산
    let currentDate: Date | null = null;
    if (customerInfo.travelPeriodStart) {
      try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          currentDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      } catch {
        currentDate = null;
      }
    }

    const cardsWithUpdatedDates = updatedCards.map((card, idx) => {
      if (currentDate) {
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '') || 1;
        const dayText = formatDate(currentDate);
        currentDate.setDate(currentDate.getDate() + nights);
        return { ...card, day: dayText };
      } else {
        return { ...card, day: `${idx + 1}일차` };
      }
    });

    setScheduleCards(cardsWithUpdatedDates);
    updateProductNameFromCards(cardsWithUpdatedDates, selectedNights);
    setDraggedCardId(null);
    setDragOverCardId(null);
  }, [isEditingPeriod, draggedCardId, scheduleCards, selectedNights, customerInfo.travelPeriodStart, updateProductNameFromCards]);

  const handleDragEnd = React.useCallback(() => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  }, []);

  // 호텔 구성 카드 삭제 함수
  const handleDeleteCard = React.useCallback((cardId: number) => {
    if (scheduleCards.length <= 1) {
      alert('최소 1개의 호텔은 유지해야 합니다.');
      return;
    }

    const cardIndex = scheduleCards.findIndex(c => c.id === cardId);
    if (cardIndex < 0) return;

    const cardToDelete = scheduleCards[cardIndex];
    const nightsToDelete = selectedNights[cardToDelete.id] || extractNightsNumber(cardToDelete.nights || '') || 1;
    
    // scheduleCards에서 삭제
    const updatedCards = scheduleCards.filter((_, i) => i !== cardIndex);
    setScheduleCards(updatedCards);
    
    // selectedHotels에서 삭제
    setSelectedHotels(prev => prev.filter((_, i) => i !== cardIndex));
    
    // selectedNights에서 삭제
    const newNights = { ...selectedNights };
    delete newNights[cardToDelete.id];
    setSelectedNights(newNights);
    
    // selectedRoomTypes에서 삭제
    setSelectedRoomTypes(prev => {
      const newRoomTypes = { ...prev };
      delete newRoomTypes[cardToDelete.id];
      return newRoomTypes;
    });
    
    // scheduleInfo.scheduleDetailData에서 해당 호텔의 박수만큼 day 삭제
    if (scheduleInfo && scheduleInfo.scheduleDetailData) {
      // 각 호텔 카드가 담당하는 day 범위 계산 (삭제 전 상태 기준)
      let currentDayIndex = 0;
      let deleteStartDay = -1;
      let daysToDelete = 0;
      
      scheduleCards.forEach((card, idx) => {
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '') || 1;
        const isFirstHotel = idx === 0;
        const nextHotel = idx < scheduleCards.length - 1 ? selectedHotels[idx + 1] : null;
        
        let startDay: number;
        let endDay: number;
        
        if (isFirstHotel) {
          startDay = currentDayIndex;
          endDay = currentDayIndex + nights - 1;
          if (nextHotel) {
            currentDayIndex = currentDayIndex + nights + 1; // 전환일 포함
          } else {
            currentDayIndex = endDay + 1;
          }
        } else {
          startDay = currentDayIndex;
          endDay = currentDayIndex + nights - 1;
          if (nextHotel) {
            currentDayIndex = currentDayIndex + nights + 1; // 전환일 포함
          } else {
            currentDayIndex = endDay + 1;
          }
        }
        
        // 삭제할 호텔의 범위 찾기
        if (idx === cardIndex) {
          deleteStartDay = startDay;
          daysToDelete = endDay - startDay + 1;
          // 다음 호텔이 있으면 전환일도 포함
          if (nextHotel) {
            daysToDelete += 1; // 전환일 포함
          }
        }
      });
      
      // day 삭제
      if (deleteStartDay >= 0 && daysToDelete > 0) {
        const newScheduleInfo = { ...scheduleInfo };
        const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
        newScheduleDetailData.splice(deleteStartDay, daysToDelete);
        newScheduleInfo.scheduleDetailData = newScheduleDetailData;
        setScheduleInfo(newScheduleInfo);
      }
    }
    
    // 상품명 업데이트
    updateProductNameFromCards(updatedCards, newNights);
  }, [scheduleCards, selectedNights, selectedHotels, updateProductNameFromCards, scheduleInfo]);

  // productScheduleData를 파싱하여 호텔명 생성 (RestHotelDetail.tsx 참조)
  const getProductNameFromScheduleCallback = React.useCallback((): string => {
    // RecoilStore에 저장된 상품명이 있으면 우선 사용
    if (savedProductName) {
      return savedProductName;
    }
    // 없으면 기존 로직 사용
    return getProductNameFromSchedule(productInfo, selectedHotels, hotelInfo, allHotels);
  }, [savedProductName, productInfo, selectedHotels, hotelInfo, allHotels]);

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

  // 상세일정 아이템 클릭 핸들러
  const handleScheduleDetailItemClick = (item: any) => {
    // 선택된 영역이 있는지 확인
    const addFunction = (window as any).__addDetailItemToSelectedLocation;
    if (addFunction && typeof addFunction === 'function') {
      addFunction(item);
    } else {
      alert('먼저 일정표에서 "변경" 버튼을 클릭하여 추가할 위치를 선택해주세요.');
    }
  };

  // 플로팅 박스용 헬퍼 함수들
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

  // 일정 데이터를 Recoil에 저장 (페이지 진입 시 자동 로드)
  useEffect(() => {
    const loadScheduleData = async () => {
      // isFromMakeButton이면 customScheduleInfo 사용
      if (stateProps?.isFromMakeButton && stateProps?.customScheduleInfo) {
        setScheduleInfo(stateProps.customScheduleInfo);
        // 본래 일정이 아직 저장되지 않았으면 저장 (깊은 복사)
        if (!originalScheduleInfo) {
          setOriginalScheduleInfo(JSON.parse(JSON.stringify(stateProps.customScheduleInfo)));
        }
        return;
      }
      
      // scheduleProductId가 있으면 서버에서 데이터 가져오기
      if (scheduleProductId) {
        try {
          const response = await fetch(`${AdminURL}/ceylontour/getschedulebyid/${scheduleProductId}`);
          const data = await response.json();
          const scheduleData = data[0];
          
          if (scheduleData) {
            // fetchScheduleDetailDataExternal을 사용하여 상세 데이터 가져오기
            const { fetchScheduleDetailDataExternal } = await import('../../../common/ScheduleDetailRedering');
            
            // 임시 setScheduleList 함수 (실제로는 Recoil에 저장)
            const tempSetScheduleList = (scheduleList: any[]) => {
              if (scheduleList && scheduleList.length > 0) {
                const loadedSchedule = scheduleList[0];
                setScheduleInfo(loadedSchedule);
                // 본래 일정이 아직 저장되지 않았으면 저장 (깊은 복사)
                if (!originalScheduleInfo) {
                  setOriginalScheduleInfo(JSON.parse(JSON.stringify(loadedSchedule)));
                }
              }
            };
            
            await fetchScheduleDetailDataExternal({
              dataToFetch: scheduleData,
              scheduleData: null,
              propsScheduleInfo: undefined,
              setScheduleList: tempSetScheduleList,
              setManageAirline: () => {},
              createEmptyDay: createEmptyDay,
              safeJsonParse: (str: string, defaultValue: any) => {
                try {
                  return JSON.parse(str);
                } catch {
                  return defaultValue;
                }
              },
              repairJsonString: (str: string) => str,
              isAddOrRevise: 'add',
              hotelInfoPerDay: hotelInfoPerDay,
              cityInfoPerDay: stateProps?.cityInfoPerDay,
            });
          }
        } catch (error) {
          console.error('일정 데이터를 가져오는 중 오류 발생:', error);
          // 에러 발생 시 기본 구조 설정
          const defaultSchedule = {
            airlineData: { sort: '', airlineCode: [] },
            scheduleDetailData: [createEmptyDay()]
          };
          setScheduleInfo(defaultSchedule);
          // 본래 일정이 아직 저장되지 않았으면 기본 구조 저장
          if (!originalScheduleInfo) {
            setOriginalScheduleInfo(JSON.parse(JSON.stringify(defaultSchedule)));
          }
        }
      }
    };
    
    loadScheduleData();
  }, [scheduleProductId, stateProps?.isFromMakeButton, stateProps?.customScheduleInfo, stateProps?.cityInfoPerDay, hotelInfoPerDay, setScheduleInfo]);

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

  // 일정표 추가, 삭제, 이동 함수 (Recoil 상태 수정)
  const addDay = (idx: number) => {
    if (!scheduleInfo || !scheduleInfo.scheduleDetailData) return;
    const newScheduleInfo = { ...scheduleInfo };
    const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
    newScheduleDetailData.splice(idx + 1, 0, createEmptyDay());
    newScheduleInfo.scheduleDetailData = newScheduleDetailData;
    setScheduleInfo(newScheduleInfo);
    
    // scheduleCards에도 반영: 해당 위치에 새 호텔 카드 추가
    const newCard = {
      id: scheduleCards.length + 1,
      day: `${idx + 2}일차`,
      badge: scheduleCards[idx]?.badge || '',
      title: '호텔 선택 필요',
      nights: '1박'
    };
    const updatedCards = [...scheduleCards];
    updatedCards.splice(idx + 1, 0, newCard);
    setScheduleCards(updatedCards);
    
    // selectedHotels에도 추가
    setSelectedHotels(prev => {
      const newHotels = [...prev];
      newHotels.splice(idx + 1, 0, {
        index: idx + 1,
        hotelSort: scheduleCards[idx]?.badge || '',
        dayNight: '1',
        hotel: null
      });
      return newHotels;
    });
    
    // selectedNights에도 추가
    setSelectedNights(prev => ({
      ...prev,
      [newCard.id]: 1
    }));
  };

  const deleteDay = (idx: number) => {
    if (!scheduleInfo || !scheduleInfo.scheduleDetailData) return;
    if (scheduleInfo.scheduleDetailData.length > 1) {
      const newScheduleInfo = { ...scheduleInfo };
      const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
      newScheduleDetailData.splice(idx, 1);
      newScheduleInfo.scheduleDetailData = newScheduleDetailData;
      setScheduleInfo(newScheduleInfo);
      
      // scheduleCards에도 반영: 해당 카드 삭제
      if (scheduleCards.length > idx) {
        const cardToDelete = scheduleCards[idx];
        const updatedCards = scheduleCards.filter((_, i) => i !== idx);
        setScheduleCards(updatedCards);
        
        // selectedHotels에서도 삭제
        setSelectedHotels(prev => prev.filter((_, i) => i !== idx));
        
        // selectedNights에서도 삭제
        setSelectedNights(prev => {
          const newNights = { ...prev };
          delete newNights[cardToDelete.id];
          return newNights;
        });
      }
    } else {
      alert('마지막 1일은 삭제할 수 없습니다.');
    }
  };

  // 일정 요약 박스의 위/아래 버튼: 일정 정보만 변경 (호텔 정보는 그대로)
  const moveDayUp = (idx: number) => {
    if (idx > 0 && scheduleInfo && scheduleInfo.scheduleDetailData) {
      const newScheduleInfo = { ...scheduleInfo };
      const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
      // 일정 정보만 교환 (호텔 정보는 그대로 유지)
      const tmp = newScheduleDetailData[idx];
      newScheduleDetailData[idx] = newScheduleDetailData[idx - 1];
      newScheduleDetailData[idx - 1] = tmp;
      newScheduleInfo.scheduleDetailData = newScheduleDetailData;
      setScheduleInfo(newScheduleInfo);
    } else {
      alert('맨 위 입니다.');
    }
  };

  const moveDayDown = (idx: number) => {
    if (scheduleInfo && scheduleInfo.scheduleDetailData && idx < scheduleInfo.scheduleDetailData.length - 1) {
      const newScheduleInfo = { ...scheduleInfo };
      const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
      // 일정 정보만 교환 (호텔 정보는 그대로 유지)
      const tmp = newScheduleDetailData[idx];
      newScheduleDetailData[idx] = newScheduleDetailData[idx + 1];
      newScheduleDetailData[idx + 1] = tmp;
      newScheduleInfo.scheduleDetailData = newScheduleDetailData;
      setScheduleInfo(newScheduleInfo);
    } else {
      alert('맨 아래 입니다.');
    }
  };

  // 호텔 구성 카드 변경 시 scheduleInfo 동기화
  useEffect(() => {
    if (!scheduleInfo || !scheduleInfo.scheduleDetailData || scheduleCards.length === 0) return;
    
    // 각 호텔 카드가 담당하는 day 범위 계산 (겹치는 부분 고려)
    let currentDayIndex = 0;
    const cardDayRanges: Array<{ cardIndex: number; startDay: number; endDay: number; hotel: any; card: any; nextHotel?: any; nextCard?: any; transitionDay?: number | null }> = [];
    
    scheduleCards.forEach((card, cardIndex) => {
      const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '') || 1;
      const isFirstHotel = cardIndex === 0;
      
      const nextHotel = cardIndex < scheduleCards.length - 1 ? selectedHotels[cardIndex + 1] : null;
      const nextCard = cardIndex < scheduleCards.length - 1 ? scheduleCards[cardIndex + 1] : null;
      
      let startDay: number;
      let endDay: number;
      let transitionDay: number | null = null;
      
      if (isFirstHotel) {
        // 첫 번째 호텔: nights일 (day 0~nights-1)
        startDay = currentDayIndex;
        endDay = currentDayIndex + nights - 1;
        // 다음 호텔이 있으면 전환일
        if (nextHotel) {
          transitionDay = currentDayIndex + nights;
        }
        // 다음 호텔이 있으면 전환일 다음부터, 없으면 마지막 날 다음
        currentDayIndex = nextHotel ? transitionDay! + 1 : endDay + 1;
      } else {
        // 이후 호텔: currentDayIndex부터 시작 (이전 호텔의 전환일 다음 날)
        startDay = currentDayIndex;
        endDay = currentDayIndex + nights - 1;
        // 다음 호텔이 있으면 전환일
        if (nextHotel) {
          transitionDay = currentDayIndex + nights;
        }
        // 다음 호텔이 있으면 전환일 다음부터, 없으면 마지막 날 다음
        currentDayIndex = nextHotel ? transitionDay! + 1 : endDay + 1;
      }
      
      cardDayRanges.push({
        cardIndex,
        startDay,
        endDay,
        hotel: selectedHotels[cardIndex],
        card,
        nextHotel,
        nextCard,
        transitionDay
      });
    });
    
    // 실제로 변경이 필요한지 확인
    let hasChanges = false;
    const newScheduleDetailData = scheduleInfo.scheduleDetailData.map((dayItem: any, dayIndex: number) => {
      // 전환일인지 먼저 확인 (다음 호텔의 시작일)
      const transitionRange = cardDayRanges.find(range => 
        range.transitionDay !== null && dayIndex === range.transitionDay
      );
      
      if (transitionRange) {
        // 전환일: "호텔1 - 호텔2" 형식
        const { hotel, card, nextHotel, nextCard } = transitionRange;
        const currentHotelName = hotel?.hotel?.hotelNameKo || card.title || '';
        const nextHotelName = nextHotel?.hotel?.hotelNameKo || nextCard?.title || '';
        const newHotelName = `${currentHotelName} - ${nextHotelName}`;
        const newHotelLevel = hotel?.hotel?.hotelLevel || '';
        
        if (dayItem.hotel !== newHotelName || dayItem.score !== newHotelLevel) {
          hasChanges = true;
          return {
            ...dayItem,
            hotel: newHotelName,
            score: newHotelLevel
          };
        }
        return dayItem;
      }
      
      // 일반 날짜: 이 dayIndex에 해당하는 호텔 카드 찾기
      const matchingCardRange = cardDayRanges.find(range => 
        dayIndex >= range.startDay && dayIndex <= range.endDay
      );
      
      if (matchingCardRange) {
        const { hotel, card } = matchingCardRange;
        const newHotelLevel = hotel?.hotel?.hotelLevel || '';
        const newHotelName = hotel?.hotel?.hotelNameKo || card.title || '';
        
        // 변경이 필요한지 확인
        if (dayItem.hotel !== newHotelName || dayItem.score !== newHotelLevel) {
          hasChanges = true;
          // dayItem 복사본 생성 (읽기 전용 속성 에러 방지)
          return {
            ...dayItem,
            hotel: newHotelName,
            score: newHotelLevel
          };
        }
      }
      
      return dayItem; // 변경 없음
    });
    
    // 실제로 변경이 있을 때만 업데이트
    if (hasChanges) {
      const newScheduleInfo = {
        ...scheduleInfo,
        scheduleDetailData: newScheduleDetailData
      };
      setScheduleInfo(newScheduleInfo);
    }
  }, [scheduleCards, selectedHotels, selectedNights]);

  // 선택된 호텔 정보를 일차별로 파싱하여 반환 (RestHotelDetail.tsx 참조)
  const getHotelInfoPerDay = (hotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => {
    const hotelInfoPerDayResult: Array<{ dayIndex: number; hotelName: string; hotelLevel: string }> = [];
    
    if (hotels.length === 0) {
      return hotelInfoPerDayResult;
    }

    let currentDay = 0;

    // 각 호텔에 대해 일정 생성
    hotels.forEach((hotelItem, hotelIndex) => {
      const nights = parseInt(hotelItem.dayNight || '1', 10);
      const hotelName = hotelItem.hotel?.hotelNameKo || hotelItem.hotelSort || '';
      const hotelLevel = hotelItem.hotel?.hotelLevel || '';
      const nextHotel = hotelIndex < hotels.length - 1 ? hotels[hotelIndex + 1] : null;
      const nextHotelName = nextHotel?.hotel?.hotelNameKo || nextHotel?.hotelSort || '';
      const isFirstHotel = hotelIndex === 0;

      // 첫 번째 호텔: nights일 + 전환 1일 = nights + 1일
      // 이후 호텔: (nights - 1)일 + 전환 1일 = nights일 (첫 날은 이미 전환일에 포함)
      const daysToAdd = isFirstHotel ? nights : nights - 1;
      
      // 현재 호텔의 날짜 추가
      for (let i = 0; i < daysToAdd; i++) {
        hotelInfoPerDayResult.push({
          dayIndex: currentDay,
          hotelName: hotelName,
          hotelLevel: hotelLevel
        });
        currentDay++;
      }

      // 다음 호텔이 있으면 전환 날 추가
      if (nextHotel) {
        hotelInfoPerDayResult.push({
          dayIndex: currentDay,
          hotelName: `${hotelName} - ${nextHotelName}`,
          hotelLevel: hotelLevel
        });
        currentDay++;
      } else {
        // 마지막 호텔인 경우 마지막 날 추가 (nights + 1일이므로)
        hotelInfoPerDayResult.push({
          dayIndex: currentDay,
          hotelName: hotelName,
          hotelLevel: hotelLevel
        });
      }
    });

    return hotelInfoPerDayResult;
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

  // 핵심 포인트 아이템 생성 (데이터에서 가져온 이미지 사용)
  const highlightItems = imageMainPoint.map((item: any) => ({
    image: `${AdminURL}/images/hotelimages/${item.imageName}`,
    title: item.title || '',
    notice: item.notice || '',
  }));

  // 베네핏 아이템 생성 (데이터에서 가져온 이미지 사용)
  const benefitItems = imageBenefit.map((item: any) => ({
    title: item.title || '',
    text: item.notice || '',
    image: `${AdminURL}/images/hotelimages/${item.imageName}`,
  }));

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
      <div className="hotel-cost-container">
        {/* 오른쪽 패널 토글 버튼 */}
        {!showRightPanel && (
          <button
            type="button"
            className="right-panel-toggle-btn"
            onClick={() => setShowRightPanel(true)}
          >
            <IoIosArrowBack />
          </button>
        )}

        <div className={`hotel-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
          {/* 왼쪽 영역: 기존 내용 */}
          <div className="left-section">
            <div className="hotel-center-wrapper">
            

              <div
                className="hotel-title-left-wrapper"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IoIosArrowBack
                    className="arrow-back"
                    onClick={() => navigate(-1)}
                  />
                  <div className="cost-title-header" style={{ marginLeft: '10px' }}>
                    <div className="cost-product-name">
                      {getProductNameFromScheduleCallback()} - 
                      {periodText && (
                        <span className="product-period">&nbsp;{periodText}</span>
                      )}
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
                      id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                      productInfo={stateProps?.productInfo}
                      scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                      useRecoil={true}
                      hotelInfoPerDay={hotelInfoPerDay}
                      hideFloatingBox={false}
                    />
                  ) : (
                    <ScheduleRederBox
                      id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                      scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                      useRecoil={true}
                      hotelInfoPerDay={hotelInfoPerDay}
                      productInfo={productInfo}
                    />
                  )}
                  {/* 포함/불포함  ----------------------------------------------------------------------------------  */}
                  <div className="schedule_add_info_section_cover">
                    <div className="included__items__section__wrapper">
                      <div className="single__header__main">포함/불포함</div>
                      <div className="included__items__wrapper">
                        <div className="index__title__wrapper">
                          <span className="included__icon"><FaRegCircle size={14}/></span>
                          <span>포함사항</span>
                        </div>
                        <div className="elements__wrapper">
                          {
                            stateProps?.productInfo?.includeNote && (() => {
                              const includeNote = typeof stateProps?.productInfo?.includeNote === 'string' ? JSON.parse(stateProps?.productInfo?.includeNote) : stateProps?.productInfo?.includeNote;
                              return includeNote.map((item: any, index: any) => {
                                return (
                                  <span key={index}>- {item}</span>
                                )
                              })
                            })()
                          }
                          {stateProps?.productInfo?.includeNoteText && <span>- {stateProps?.productInfo?.includeNoteText}</span>}
                        </div>
                        <div className="index__title__wrapper">
                          <span className="unincluded__icon"><IoMdClose size={18}/></span>
                          <span>불포함사항</span>
                        </div>
                        <div className="elements__wrapper">
                          {
                            stateProps?.productInfo?.notIncludeNote && (() => {
                              const notIncludeNote = typeof stateProps?.productInfo?.notIncludeNote === 'string' ? JSON.parse(stateProps?.productInfo?.notIncludeNote) : stateProps?.productInfo?.notIncludeNote;
                              return notIncludeNote.map((item: any, index: any) => {
                                return (
                                  <span key={index}>- {item}</span>
                                )
                              })
                            })()
                          }
                          {stateProps?.productInfo?.notIncludeNoteText && <span>- {stateProps?.productInfo?.notIncludeNoteText}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="must__read__section__wrapper">
                      <div className="single__header__main">필독사항</div>
                      <div className="must__read__wrapper">
                        {stateProps?.productInfo?.cautionNote && stateProps?.productInfo?.cautionNote !== '' && (
                          <span style={{whiteSpace: 'pre-wrap'}}>{stateProps?.productInfo?.cautionNote}</span>
                        )}
                        <span>
                          - 상기일정은 항공 및 현지사정으로 인하여 변경될 수 있습니다.
                        </span>
                        <span>- 환율변동에 의해 요금이 가/감 될 수 있습니다.</span>
                        <span>
                          - 취소시 항공 및 호텔(리조트, 풀빌라 등)의 취소 수수료가 발생하는
                          상품입니다.
                        </span>
                        <span>
                          - 예약시 여권상의 정확한 영문이름으로 예약하셔야 하며 여권
                          유효기간은 출발일 기준 6개월 이상 남아있어야 합니다.
                        </span>
                        <span>
                          - 외국/이중 국적자의 해외여행은 도착지국가의 출입국 정책이
                          상이하므로, 반드시 여행자 본인이 해당국의 대사관에 확인하셔야
                          합니다.
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (showScheduleEdit) {
                        // 저장&일정보기: 편집한 일정 저장
                        // Recoil에서 최신 일정 데이터 가져오기
                        const latestScheduleInfo = scheduleInfo;
                        if (latestScheduleInfo) {
                          // Recoil에 저장된 일정 데이터 확인
                          console.log('일정 저장:', latestScheduleInfo);
                          // 필요시 서버에 저장하는 API 호출을 여기에 추가할 수 있습니다
                          // 예: await saveScheduleToServer(latestScheduleInfo);
                          alert('일정이 저장되었습니다.');
                        } else {
                          alert('저장할 일정 데이터가 없습니다.');
                        }
                      }
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
                    {showScheduleEdit ? '저장&일정보기' : '일정수정하기'}
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

                  <div className="hotel-intro-section">
                    <div className="hotel-intro-rating">
                      <RatingBoard
                        ratingSize={30}
                        rating={
                          hotelInfo && hotelInfo.hotelLevel
                            ? Math.max(0, Math.min(5, parseInt(String(hotelInfo.hotelLevel), 10) || 0))
                            : 0
                        }
                      />
                    </div>
                    <div className="hotel-intro-tagline">
                      프라이빗 비치와 세심한 서비스가 완성하는 품격있는 휴식
                    </div>
                    {hotelInfo?.logoImage && (
                      <div className="hotel-intro-logo">
                        <img 
                          src={`${AdminURL}/images/hotellogos/${hotelInfo.logoImage}`} 
                          alt="호텔 로고"
                        />
                      </div>
                    )}
                    <div className="hotel-intro-entitle">
                      <p>{hotelInfo?.hotelNameEn || ''}</p>
                    </div>
                    <div className="hotel-intro-description">
                      <p>정교한 설계와 세심한 서비스는 허니문 동안 럭셔리 그 자체를 선사합니다.</p>
                      <p>2017년 새롭게 단장을 마치고 모던 럭셔리를 지향하는 호텔로 거듭났습니다.</p>
                      <p>모든 객실에 자쿠지와 개인용 풀장이 설치되어 있는 것이 특징입니다.</p>
                    </div>
                  </div>

                  {highlightItems.length > 0 && (
                    <div className="highlight-section">
                      <div className="highlight-title">핵심 포인트</div>
                      <div className="highlight-list">
                        {highlightItems.map(({ image, title, notice }, index) => (
                          <div className="highlight-item" key={`${title}-${index}`}>
                            <div className="highlight-image-wrap">
                              <img src={image} alt={title} />
                            </div>
                            <div className="highlight-item-title">{title}</div>
                            <div className="highlight-item-desc">
                              {notice || '세계적 평가의 St. Regis 브랜드 &amp; 발리 최고급 서비스'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {benefitItems.length > 0 && (
                    <div className={`benefit-section`}>
                      <div className="div-wrapper">
                        <div className="text-wrapper">베네핏 포함사항</div>
                      </div>
              
                      <div className="benefit-items">
                        {benefitItems.map(({ title, text, image }, index) => (
                          <div key={`${title}-${index}`} className="benefit-item">
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
                  )}

                  {/* 후기 및 평점 섹션 */}
                  {/* <div className='review-cover'>
                
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
                                  <RatingBoard ratingSize={20} rating={review.rating} />
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

                  </div> */}

                  <ScheduleRederBox
                      id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                      scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                      useRecoil={true}
                      hotelInfoPerDay={hotelInfoPerDay}
                    />

                  {/* 포함/불포함  ----------------------------------------------------------------------------------  */}
                  <div className="schedule_add_info_section_cover">
                    <div className="included__items__section__wrapper">
                      <div className="single__header__main">포함/불포함</div>
                      <div className="included__items__wrapper">
                        <div className="index__title__wrapper">
                          <span className="included__icon"><FaRegCircle size={14}/></span>
                          <span>포함사항</span>
                        </div>
                        <div className="elements__wrapper">
                          {
                            stateProps?.productInfo?.includeNote && (() => {
                              const includeNote = typeof stateProps?.productInfo?.includeNote === 'string' ? JSON.parse(stateProps?.productInfo?.includeNote) : stateProps?.productInfo?.includeNote;
                              return includeNote.map((item: any, index: any) => {
                                return (
                                  <span key={index}>- {item}</span>
                                )
                              })
                            })()
                          }
                          {stateProps?.productInfo?.includeNoteText && <span>- {stateProps?.productInfo?.includeNoteText}</span>}
                        </div>
                        <div className="index__title__wrapper">
                          <span className="unincluded__icon"><IoMdClose size={18}/></span>
                          <span>불포함사항</span>
                        </div>
                        <div className="elements__wrapper">
                          {
                            stateProps?.productInfo?.notIncludeNote && (() => {
                              const notIncludeNote = typeof stateProps?.productInfo?.notIncludeNote === 'string' ? JSON.parse(stateProps?.productInfo?.notIncludeNote) : stateProps?.productInfo?.notIncludeNote;
                              return notIncludeNote.map((item: any, index: any) => {
                                return (
                                  <span key={index}>- {item}</span>
                                )
                              })
                            })()
                          }
                          {stateProps?.productInfo?.notIncludeNoteText && <span>- {stateProps?.productInfo?.notIncludeNoteText}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="must__read__section__wrapper">
                      <div className="single__header__main">필독사항</div>
                      <div className="must__read__wrapper">
                        {stateProps?.productInfo?.cautionNote && stateProps?.productInfo?.cautionNote !== '' && (
                          <span style={{whiteSpace: 'pre-wrap'}}>{stateProps?.productInfo?.cautionNote}</span>
                        )}
                        <span>
                          - 상기일정은 항공 및 현지사정으로 인하여 변경될 수 있습니다.
                        </span>
                        <span>- 환율변동에 의해 요금이 가/감 될 수 있습니다.</span>
                        <span>
                          - 취소시 항공 및 호텔(리조트, 풀빌라 등)의 취소 수수료가 발생하는
                          상품입니다.
                        </span>
                        <span>
                          - 예약시 여권상의 정확한 영문이름으로 예약하셔야 하며 여권
                          유효기간은 출발일 기준 6개월 이상 남아있어야 합니다.
                        </span>
                        <span>
                          - 외국/이중 국적자의 해외여행은 도착지국가의 출입국 정책이
                          상이하므로, 반드시 여행자 본인이 해당국의 대사관에 확인하셔야
                          합니다.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 왼쪽 패널 하단 버튼들 */}
              <div className="left-panel-bottom-buttons">
                <button
                  type="button"
                  className="bottom-btn bottom-btn-edit"
                  onClick={() => {
                    setShowRightPanel(true);
                    setActiveReservationTab('edit');
                  }}
                >
                  일정수정
                </button>
                {/* 플로팅 Top 버튼 */}
                <button
                  type="button"
                  className="floating-top-btn"
                  onClick={() => {
                    const leftSection = document.querySelector('.RestHotelCost .left-section');
                    if (leftSection) {
                      leftSection.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <IoIosArrowUp />
                </button>
                <button
                  type="button"
                  className="bottom-btn bottom-btn-estimate"
                  onClick={() => {
                    // productInfo에 상품명 업데이트 (savedProductName이 있으면 사용)
                    const updatedProductInfo = savedProductName 
                      ? { ...productInfo, productName: savedProductName }
                      : productInfo;

                    // 호텔 데이터를 Recoil에 저장
                    setSelectedHotelData({
                      hotelInfo: hotelInfo,
                      productInfo: updatedProductInfo,
                      scheduleCards: scheduleCards,
                      selectedHotels: selectedHotels,
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
                        pricePerPerson: finalPricePerPerson || 0,
                        totalPrice: finalTotalPrice || 0,
                        guestCount: guestCount
                      }
                    });

                    // 일정 데이터를 Recoil에 저장
                    const scheduleDataToSave = stateProps?.isFromMakeButton 
                      ? stateProps?.customScheduleInfo 
                      : scheduleInfo;
                    
                    if (scheduleDataToSave) {
                      setSelectedScheduleData({
                        productInfo: updatedProductInfo,
                        selectedSchedule: scheduleDataToSave,
                        totalPrice: finalTotalPrice || 0,
                        guestCount: guestCount
                      });
                    } else {
                      // scheduleInfo가 없으면 상품 ID만 저장
                      setSelectedScheduleData({
                        productInfo: updatedProductInfo,
                        selectedSchedule: null,
                        totalPrice: finalTotalPrice || 0,
                        guestCount: guestCount
                      });
                    }

                    navigate('/counsel/rest/estimate', { state: updatedProductInfo });
                    window.scrollTo(0, 0);
                  }}
                >
                  예약하기
                </button>
              </div>

              <div style={{height: '100px'}}></div>

            </div>
          </div>

          {/* 오른쪽 영역: 선택한 스케줄(여행상품) 정보 및 비용 */}
          {showRightPanel && (
            <div className="right-section">
              {/* 닫기 버튼 */}
              <button
                type="button"
                className="right-panel-close-btn"
                onClick={() => setShowRightPanel(false)}
              >
                <IoMdClose />
              </button>
              
              <div className="hotel-cost-component">
                {/* 제품 정보 헤더 */}
                <div className="cost-header">
                  <div className="cost-header-top">
                    <div className="hotel-title-right-wrapper">
                      <div className="text-title-wrapper">
                        <div className="text-title">{hotelInfo?.hotelNameKo || '호텔명'}</div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPeriodChangeModal(true);
                            fetchNationProducts();
                          }}
                          className='change-product-btn'
                        >
                          상품변경
                        </button>
                      </div>
                      <div className="text-subtitle-rating-location-wrapper">
                        <div className="text-subtitle">
                          {hotelInfo?.hotelNameEn || ''}
                        </div>
                        <RatingBoard
                          ratingSize={14}
                          rating={
                            hotelInfo && hotelInfo.hotelLevel
                              ? Math.max(0, Math.min(5, parseInt(String(hotelInfo.hotelLevel), 10) || 0))
                              : 0
                          }
                        />
                      </div>
                      <div className="text-location">
                        <p>{hotelInfo?.nation || ''}</p>
                        <IoIosArrowForward />
                        <p>{hotelInfo?.city || ''}</p>
                      </div>
                    </div>
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
                        width: '100px',
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
                      견적
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveReservationTab('edit')}
                      style={{
                        width: '100px',
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
                      수정
                    </button>
                  </div>
                </div>

                {/* 예약하기 탭: 정보 표시 */}
                {activeReservationTab === 'reserve' ? (
                  <div className="reservation-info-section">
                    <h3 className="reservation-info-title">
                      예약 정보
                    </h3>
                    
                    <div className="cost-hotel-cards">
                      {/* 성명 */}
                      <div className="cost-hotel-card">
                        <label>성명</label>
                        <div className="reservation-info-value">
                          {customerInfo.customer1Name || customerInfo.customer2Name || '-'}
                        </div>
                      </div>

                      {/* 여행형태 */}
                      <div className="cost-hotel-card">
                        <label>여행형태</label>
                        <div className="reservation-info-value">
                          {customerInfo.theme && customerInfo.theme.length > 0
                            ? customerInfo.theme.map((t: string) => {
                                const themeMap: { [key: string]: string } = {
                                  'honeymoon': '허니문',
                                  'family': '가족여행',
                                  'fit': 'FIT',
                                  'corporate': '기업/워크샵'
                                };
                                return themeMap[t] || t;
                              }).join(', ')
                            : '-'}
                        </div>
                      </div>

                      {/* 상품명 */}
                      <div className="cost-hotel-card">
                        <label>상품명</label>
                        <div className="reservation-info-value">
                          {savedProductName || '-'}
                        </div>
                      </div>

                      {/* 여행기간 */}
                      <div className="cost-hotel-card">
                        <label>여행기간</label>
                        <div className="reservation-info-value">
                          {customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd
                            ? `${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`
                            : '-'}
                        </div>
                      </div>

                      {/* 이용항공 */}
                      <div className="cost-hotel-card">
                        <label>이용항공</label>
                        <div className="reservation-info-value">
                          {customerInfo.flightStyle && customerInfo.flightStyle.length > 0
                            ? customerInfo.flightStyle.join(', ')
                            : '-'}
                        </div>
                      </div>

                      {/* 이용호텔 */}
                      <div className="cost-hotel-card">
                        <label>이용호텔</label>
                        <div className="reservation-info-value">
                          {selectedHotels && selectedHotels.length > 0
                            ? selectedHotels
                                .filter((sh: any) => sh.hotel && sh.hotel.hotelNameKo)
                                .map((sh: any) => sh.hotel.hotelNameKo)
                                .join(', ') || '-'
                            : '-'}
                        </div>
                      </div>

                      {/* 계약특전 */}
                      <div className="cost-hotel-card">
                        <label>계약특전</label>
                        <div className="reservation-info-value">
                          {selectedHotelData?.benefitItems && selectedHotelData.benefitItems.length > 0
                            ? selectedHotelData.benefitItems.map((item: any, index: number) => (
                                <div key={index} style={{ marginBottom: index < selectedHotelData.benefitItems!.length - 1 ? '4px' : '0' }}>
                                  - {item.title}
                                </div>
                              ))
                            : (benefitItems && benefitItems.length > 0
                              ? benefitItems.map((item: any, index: number) => (
                                  <div key={index} style={{ marginBottom: index < benefitItems.length - 1 ? '4px' : '0' }}>
                                    - {item.title}
                                  </div>
                                ))
                              : '-')}
                        </div>
                      </div>

                      {/* 1인상품가 */}
                      <div className="cost-hotel-card">
                        <label>1인상품가</label>
                        <div className="reservation-info-value">
                          {finalPricePerPerson && finalPricePerPerson > 0
                            ? `${finalPricePerPerson.toLocaleString()}원`
                            : '-'}
                        </div>
                      </div>

                      {/* 총요금 */}
                      <div className="cost-hotel-card">
                        <label>총요금</label>
                        <div className="reservation-info-value">
                          {finalTotalPrice && finalTotalPrice > 0
                            ? `${finalTotalPrice.toLocaleString()}원`
                            : '-'}
                        </div>
                      </div>
                    </div>

                    {/* 프로모션 및 할인 섹션 */}
                    <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e0e0e0' }}>
                      {/* 프로모션 적용사항 */}
                      <div style={{ marginBottom: '30px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
                          프로모션 적용사항
                        </div>
                        <div style={{ 
                          padding: '12px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '4px',
                          minHeight: '100px',
                          color: '#666',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-line'
                        }}>
                          내용을 적는 곳입니다.
                          {'\n'}내용을 적는 곳입니다.
                          {'\n'}내용을 적는 곳입니다.
                          {'\n'}내용을 적는 곳입니다.
                        </div>
                      </div>

                      {/* 박람회 특가 */}
                      <div style={{ marginBottom: '30px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
                          박람회 특가
                        </div>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span>당일계약</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span>할인요금</span>
                          </label>
                        </div>
                      </div>

                      {/* 할인 이벤트 */}
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
                          할인 이벤트
                        </div>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span>계약리뷰</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span>후기리뷰</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span>여행 후 평점 참여</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span>블로그 작성</span>
                          </label>
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
                      
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowScheduleBox(false);
                          setHotelDetailTab('hotel');
                        }}
                        style={{
                          width: '50%',
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
                        호텔
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowScheduleBox(true);
                          setHotelDetailTab('schedule');
                        }}
                        style={{
                          width: '50%',
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
                        상세
                      </button>
                    </div>

                    {/* 호텔구성 탭 내용 */}
                    {hotelDetailTab === 'hotel' && (
                      <>
                        {/* 호텔 구성 카드들 - productScheduleData 기반 */}
                        <div className="cost-hotel-cards">
                        {(scheduleCards.length > 0 ? scheduleCards : []).map((card, index) => (
                          <div 
                            key={card.id} 
                            className="cost-hotel-card" 
                            style={{ 
                              position: 'relative',
                              opacity: draggedCardId === card.id ? 0.5 : 1,
                              transform: dragOverCardId === card.id ? 'translateY(10px)' : 'translateY(0)',
                              transition: draggedCardId === null ? 'all 0.2s' : 'none',
                              borderTop: dragOverCardId === card.id && draggedCardId !== card.id ? '3px solid #5fb7ef' : 'none',
                              cursor: isEditingPeriod ? 'move' : 'default'
                            }}
                            draggable={isEditingPeriod}
                            onDragStart={(e) => handleDragStart(e, card.id)}
                            onDragOver={(e) => handleDragOver(e, card.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, card.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="cost-card-header">
                              <div className="cost-card-date-badge-wrapper">
                                <div className="cost-card-date" style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {(() => {
                                    // card.day가 이미 날짜 형식인지 확인
                                    if (card.day && !card.day.includes('일차')) {
                                      return card.day;
                                    }
                                    
                                    // 날짜 형식이 아니면 계산
                                    let startDate: Date | null = null;
                                    if (customerInfo.travelPeriodStart) {
                                      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                                      if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
                                        startDate = new Date(customerInfo.travelPeriodStart.trim());
                                      }
                                    }
                                    
                                    if (!startDate) {
                                      return `호텔${index + 1}`;
                                    }
                                    
                                    // 현재 카드까지의 일수 계산
                                    let currentDate = new Date(startDate);
                                    for (let i = 0; i < index; i++) {
                                      const prevCard = scheduleCards[i];
                                      if (prevCard) {
                                        const nights = selectedNights[prevCard.id] || extractNightsNumber(prevCard.nights || '') || 1;
                                        currentDate.setDate(currentDate.getDate() + nights);
                                      }
                                    }
                                    
                                    // 날짜 포맷팅
                                    const year = currentDate.getFullYear();
                                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                                    const day = String(currentDate.getDate()).padStart(2, '0');
                                    
                                    return `${year}-${month}-${day}`;
                                  })()}
                                </div>
                                <div className="cost-card-badge"
                                  onClick={() => isEditingPeriod ? handleHotelChange(card.id) : null}
                                  style={{
                                    cursor: isEditingPeriod ? 'pointer' : 'default',
                                    userSelect: 'none',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (isEditingPeriod) {
                                      e.currentTarget.style.opacity = '0.8';
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (isEditingPeriod) {
                                      e.currentTarget.style.opacity = '1';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }
                                  }}
                                >
                                  {card.badge}
                                </div>
                              </div>
                              <div className="cost-card-title">{card.title}</div>
                            </div>
                            <div className="cost-card-content">
                              <div className="cost-card-roomtype" style={{ width: isEditingPeriod ? '100%' : 'auto'}}>
                                {(() => {
                                  // selectedHotels에서 해당 카드의 호텔 정보 찾기
                                  const cardIndex = card.id - 1; // card.id는 1부터 시작
                                  // index 속성으로 찾기 (더 안전)
                                  const selectedHotel = selectedHotels.find(sh => sh.index === cardIndex) || selectedHotels[cardIndex];
                                  const hotel = selectedHotel?.hotel;
                                  
                                  // 호텔의 hotelRoomTypes에서 룸타입 추출
                                  let roomTypes: string[] = [];
                                  
                                  if (hotel && hotel.hotelRoomTypes) {
                                    try {
                                      const roomTypesData = JSON.parse(hotel.hotelRoomTypes);
                                      if (Array.isArray(roomTypesData)) {
                                        roomTypes = roomTypesData
                                          .map((rt: any) => rt.roomTypeName)
                                          .filter((name: string) => name && name.trim() !== '');
                                      }
                                    } catch (e) {
                                      console.error('hotelRoomTypes 파싱 오류:', e);
                                    }
                                  }
                                  
                                  // hotelRoomTypes가 없으면 기존 방식 사용
                                  if (roomTypes.length === 0) {
                                    roomTypes = getRoomTypesForCardCallback(card);
                                  }
                                  
                                  const currentRoomType = selectedRoomTypes[card.id] || (roomTypes[0] || '');
                                  
                                  return isEditingPeriod ? (
                                    <select
                                      value={currentRoomType}
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
                                      {roomTypes.length > 0 ? (
                                        roomTypes.map((roomType) => (
                                          <option key={roomType} value={roomType}>
                                            {roomType}
                                          </option>
                                        ))
                                      ) : (
                                        <option value="">룸타입 없음</option>
                                      )}
                                    </select>
                                  ) : (
                                    <p>{currentRoomType || '룸타입 없음'}</p>
                                  );
                                })()}
                              </div>
                              <div className="cost-card-nights-control">
                                {isEditingPeriod && (
                                  <button 
                                    className="nights-btn"
                                    onClick={() => {
                                      const currentNights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
                                      if (currentNights > 1) {
                                        const previousNights = currentNights;
                                        const newNightsValue = currentNights - 1;
                                        
                                        setSelectedNights(prev => {
                                          const newNights = {
                                            ...prev,
                                            [card.id]: newNightsValue
                                          };
                                          // 박수 변경 시 상품명 업데이트
                                          updateProductNameFromCards(scheduleCards, newNights);
                                          
                                          // 박수 감소 시 일정표에서 day 삭제
                                          if (scheduleInfo && scheduleInfo.scheduleDetailData) {
                                            // 각 호텔 카드의 day 범위 계산 (이전 박수 기준)
                                            let currentDayIndex = 0;
                                            let targetCardEndDay = -1;
                                            const nextHotel = index < scheduleCards.length - 1 ? selectedHotels[index + 1] : null;
                                            
                                            scheduleCards.forEach((c, cIdx) => {
                                              const nights = cIdx === index 
                                                ? previousNights 
                                                : (prev[c.id] || extractNightsNumber(c.nights || '') || 1);
                                              const isFirstHotel = cIdx === 0;
                                              const cNextHotel = cIdx < scheduleCards.length - 1 ? selectedHotels[cIdx + 1] : null;
                                              
                                              if (isFirstHotel) {
                                                const endDay = currentDayIndex + nights - 1;
                                                if (cIdx === index) {
                                                  targetCardEndDay = endDay;
                                                }
                                                if (cNextHotel) {
                                                  currentDayIndex = currentDayIndex + nights + 1;
                                                } else {
                                                  currentDayIndex = endDay + 1;
                                                }
                                              } else {
                                                const endDay = currentDayIndex + nights - 1;
                                                if (cIdx === index) {
                                                  targetCardEndDay = endDay;
                                                }
                                                if (cNextHotel) {
                                                  currentDayIndex = currentDayIndex + nights + 1;
                                                } else {
                                                  currentDayIndex = endDay + 1;
                                                }
                                              }
                                            });
                                            
                                            // 삭제할 day 개수
                                            const daysToDelete = previousNights - newNightsValue;
                                            if (daysToDelete > 0 && targetCardEndDay >= 0) {
                                              const newScheduleInfo = { ...scheduleInfo };
                                              const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
                                              // targetCardEndDay 다음부터 daysToDelete 개 삭제
                                              // 다음 호텔이 있으면 전환일이 있으므로 targetCardEndDay + 2부터 삭제
                                              // 다음 호텔이 없으면 targetCardEndDay + 1부터 삭제
                                              const deleteStartIndex = nextHotel ? targetCardEndDay + 2 : targetCardEndDay + 1;
                                              
                                              if (deleteStartIndex < newScheduleDetailData.length && deleteStartIndex >= 0) {
                                                const actualDeleteCount = Math.min(daysToDelete, newScheduleDetailData.length - deleteStartIndex);
                                                if (actualDeleteCount > 0) {
                                                  newScheduleDetailData.splice(deleteStartIndex, actualDeleteCount);
                                                  newScheduleInfo.scheduleDetailData = newScheduleDetailData;
                                                  setScheduleInfo(newScheduleInfo);
                                                }
                                              }
                                            }
                                          }
                                          
                                          return newNights;
                                        });
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
                                      const previousNights = currentNights;
                                      const newNightsValue = currentNights + 1;
                                      
                                      setSelectedNights(prev => {
                                        const newNights = {
                                          ...prev,
                                          [card.id]: newNightsValue
                                        };
                                        // 박수 변경 시 상품명 업데이트
                                        updateProductNameFromCards(scheduleCards, newNights);
                                        
                                        // 박수 증가 시 일정표에 day 추가
                                        if (scheduleInfo && scheduleInfo.scheduleDetailData) {
                                          // 각 호텔 카드의 day 범위 계산 (이전 박수 기준)
                                          let currentDayIndex = 0;
                                          let targetCardEndDay = -1;
                                          const nextHotel = index < scheduleCards.length - 1 ? selectedHotels[index + 1] : null;
                                          
                                          scheduleCards.forEach((c, cIdx) => {
                                            const nights = cIdx === index 
                                              ? previousNights 
                                              : (prev[c.id] || extractNightsNumber(c.nights || '') || 1);
                                            const isFirstHotel = cIdx === 0;
                                            const cNextHotel = cIdx < scheduleCards.length - 1 ? selectedHotels[cIdx + 1] : null;
                                            
                                            if (isFirstHotel) {
                                              const endDay = currentDayIndex + nights - 1;
                                              if (cIdx === index) {
                                                targetCardEndDay = endDay;
                                              }
                                              if (cNextHotel) {
                                                currentDayIndex = currentDayIndex + nights + 1;
                                              } else {
                                                currentDayIndex = endDay + 1;
                                              }
                                            } else {
                                              const endDay = currentDayIndex + nights - 1;
                                              if (cIdx === index) {
                                                targetCardEndDay = endDay;
                                              }
                                              if (cNextHotel) {
                                                currentDayIndex = currentDayIndex + nights + 1;
                                              } else {
                                                currentDayIndex = endDay + 1;
                                              }
                                            }
                                          });
                                          
                                          // 추가할 day 개수
                                          const daysToAdd = newNightsValue - previousNights;
                                          if (daysToAdd > 0 && targetCardEndDay >= 0) {
                                            const newScheduleInfo = { ...scheduleInfo };
                                            const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
                                            // targetCardEndDay 다음에 빈 day 추가
                                            // 다음 호텔이 있으면 전환일이 있으므로 targetCardEndDay + 2 위치에 추가
                                            // 다음 호텔이 없으면 targetCardEndDay + 1 위치에 추가
                                            const insertIndex = nextHotel ? targetCardEndDay + 2 : targetCardEndDay + 1;
                                            
                                            // insertIndex가 유효한 범위인지 확인
                                            if (insertIndex >= 0 && insertIndex <= newScheduleDetailData.length) {
                                              for (let i = 0; i < daysToAdd; i++) {
                                                newScheduleDetailData.splice(insertIndex, 0, createEmptyDay());
                                              }
                                              newScheduleInfo.scheduleDetailData = newScheduleDetailData;
                                              setScheduleInfo(newScheduleInfo);
                                            }
                                          }
                                        }
                                        
                                        return newNights;
                                      });
                                    }}
                                  >+</button>
                                )}
                                {isEditingPeriod && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('이 호텔을 삭제하시겠습니까?')) {
                                        handleDeleteCard(card.id);
                                      }
                                    }}
                                    disabled={scheduleCards.length <= 1}
                                    style={{
                                      border: '1px solid #ddd',
                                      backgroundColor: scheduleCards.length <= 1 ? '#f5f5f5' : '#fff',
                                      color: scheduleCards.length <= 1 ? '#ccc' : '#e74c3c',
                                      fontSize: '10px',
                                      cursor: scheduleCards.length <= 1 ? 'not-allowed' : 'pointer',
                                      borderRadius: '4px',
                                      transition: 'all 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '20px',
                                      height: '24px',
                                      zIndex: 10
                                    }}
                                    onMouseEnter={(e) => {
                                      if (scheduleCards.length > 1) {
                                        e.currentTarget.style.backgroundColor = '#fee';
                                        e.currentTarget.style.borderColor = '#e74c3c';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (scheduleCards.length > 1) {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.borderColor = '#ddd';
                                      }
                                    }}
                                    title="삭제"
                                  >
                                    <IoMdClose />
                                  </button>
                                )}
                              </div>
                              
                            </div>
                          </div>
                        ))}
                        </div>

                        {/* 호텔 추가 버튼 */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                          <button
                            type="button"
                            onClick={handleAddHotel}
                            style={{
                              padding: '5px 15px',
                              border: '1px solid #333',
                              backgroundColor: '#fff',
                              color: '#333',
                              fontSize: '15px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fff';
                            }}
                          >
                            + 호텔 추가
                          </button>
                        </div>
                      </>
                    )}

                    

                    {/* 상세일정 탭 내용 */}
                    {hotelDetailTab === 'schedule' && (
                      <div className="schedule-summary-content">
                        <div className="summary-card">
                          <div className="summary-header">
                            <div className="summary-sub-tabs" style={{
                              display: 'flex',
                              gap: '12px',
                              marginTop: '12px',
                              flexWrap: 'wrap'
                            }}>
                              {['전체','익스커션','강습/클래스','스파마사지','식사/다이닝','바/클럽','스냅촬영','차량/가이드','편의사항','기타'].map(label => (
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
                          
                          <div className="summary-grid">
                            {isLoadingScheduleDetail ? (
                              <div style={{ padding: '40px', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                                로딩 중...
                              </div>
                            ) : filteredScheduleDetailList.length === 0 ? (
                              <div style={{ padding: '40px', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                                상세일정이 없습니다.
                              </div>
                            ) : (
                              filteredScheduleDetailList.map((item: any) => {
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
                                  <div
                                    key={item.id}
                                    className="summary-item"
                                    onClick={() => handleScheduleDetailItemClick(item)}
                                  >
                                    <img className="summary-item-image" alt={item.productName || '상세일정'} src={imageUrl} />
                                    <div className="summary-item-content">
                                      <p className="summary-item-title">
                                        {item.productName || '-'}
                                      </p>
                                      <RatingBoard rating={parseInt(item.scores) || 0} ratingSize={16} />
                                      <div className="summary-item-price-row">
                                        <span className="summary-item-price">{item.price}/1인</span>
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

                    
                  </>
                )}
              </div>
              {/* 가격 정보 */}
              {/* <div className="summary-footer">
                <div className="summary-footer-top">선택된 세부일정 제목</div>
                <div className="summary-footer-bottom">
                  <div className="summary-footer-left">
                    <div className="summary-footer-field">날짜</div>
                    <div className="summary-footer-field">선택상품</div>
                    <div className="summary-footer-field price-field">￦ 50,000 /1인</div>
                    <div className="summary-footer-field summary-footer-field-counter">
                      <button className="summary-counter-btn">-</button>
                      <span>2명</span>
                      <button className="summary-counter-btn">+</button>
                    </div>
                  </div>
                  <div className="summary-footer-right">
                    <div className="summary-total-label">총요금</div>
                    <div className="summary-total-price">￦100,000</div>
                  </div>
                </div>
              </div> */}
              <div 
                className="cost-price-section"
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
              <div className="cost-schedule-btn-wrapper">
                <button className="cost-schedule-btn cost-schedule-btn-prev"
                  onClick={() => {
                    navigate('/counsel/rest/schedule', { state : productInfo})
                    window.scrollTo(0, 0);
                  }}
                >이전</button>
                <button className="cost-schedule-btn cost-schedule-btn-prev"
                  onClick={() => {
                    setShowScheduleBox(prev => !prev);
                  }}
                >{showScheduleBox ? '호텔보기' : '일정보기'}</button>
                <button className="cost-schedule-btn cost-schedule-btn-next"
                  onClick={() => {
                    // productInfo에 상품명 업데이트 (savedProductName이 있으면 사용)
                    const updatedProductInfo = savedProductName 
                      ? { ...productInfo, productName: savedProductName }
                      : productInfo;

                    // 호텔 데이터를 Recoil에 저장
                    setSelectedHotelData({
                      hotelInfo: hotelInfo,
                      productInfo: updatedProductInfo,
                      scheduleCards: scheduleCards,
                      selectedHotels: selectedHotels,
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
                        pricePerPerson: finalPricePerPerson || 0,
                        totalPrice: finalTotalPrice || 0,
                        guestCount: guestCount
                      }
                    });

                    // 일정 데이터를 Recoil에 저장
                    const scheduleDataToSave = stateProps?.isFromMakeButton 
                      ? stateProps?.customScheduleInfo 
                      : scheduleInfo;
                    
                    if (scheduleDataToSave) {
                      setSelectedScheduleData({
                        productInfo: updatedProductInfo,
                        selectedSchedule: scheduleDataToSave,
                        totalPrice: finalTotalPrice || 0,
                        guestCount: guestCount
                      });
                    } else {
                      // scheduleInfo가 없으면 상품 ID만 저장
                      setSelectedScheduleData({
                        productInfo: updatedProductInfo,
                        selectedSchedule: null,
                        totalPrice: finalTotalPrice || 0,
                        guestCount: guestCount
                      });
                    }

                    navigate('/counsel/rest/estimate', { state: updatedProductInfo });
                    window.scrollTo(0, 0);
                  }}
                >예약하기</button>
              </div>
            </div>
          )}
          
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
              maxWidth: '900px',
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
                margin: '0 0 24px 0',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000'
              }}>
                동급 다른 호텔
              </h2>
              
              {(() => {
                const card = scheduleCards.find(c => c.id === selectedCardIndex);
                if (!card) return null;
                
                return (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    {hotelsWithFullData.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                        해당 타입의 호텔이 없습니다.
                      </div>
                    ) : (
                      hotelsWithFullData.map((hotel: any) => {
                        // 호텔 이미지 가져오기
                        let hotelImage = '';
                        if (hotel.imageNamesAllView) {
                          try {
                            const images = JSON.parse(hotel.imageNamesAllView);
                            if (images && images.length > 0) {
                              const imageName = typeof images[0] === 'string' ? images[0] : images[0].imageName;
                              if (imageName) {
                                hotelImage = `${AdminURL}/images/hotelimages/${imageName}`;
                              }
                            }
                          } catch (e) {
                            console.error('Failed to parse hotel images:', e);
                          }
                        }
                        
                        // 평점 계산
                        const rating = hotel.hotelLevel 
                          ? Math.max(0, Math.min(5, parseInt(String(hotel.hotelLevel), 10) || 0))
                          : 0;
                        
                        // 가격 정보
                        const pricePerNight = hotel.lowestPrice 
                          ? Number(hotel.lowestPrice).toLocaleString()
                          : '문의요청';
                        
                        // 선택된 카드의 박수 정보
                        const nights = selectedNights[card.id] || card.nights || '';
                        const nightsText = nights ? (typeof nights === 'number' ? `${nights}박` : nights) : '';
                        
                        return (
                          <div
                            key={hotel.id}
                            style={{
                              display: 'flex',
                              gap: '20px',
                              padding: '24px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '12px',
                              backgroundColor: '#fff',
                              boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.15)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            {/* 호텔 이미지 */}
                            <div style={{
                              width: '280px',
                              height: '200px',
                              flexShrink: 0,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: '#f5f5f5'
                            }}>
                              {hotelImage ? (
                                <img 
                                  src={hotelImage} 
                                  alt={hotel.hotelNameKo || '호텔 이미지'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#999',
                                  fontSize: '14px'
                                }}>
                                  이미지 없음
                                </div>
                              )}
                            </div>
                            
                            {/* 호텔 정보 */}
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              {/* 호텔명 */}
                              <div style={{
                                fontWeight: 'bold',
                                fontSize: '20px',
                                color: '#000',
                                lineHeight: '1.4'
                              }}>
                                {hotel.hotelNameKo || '호텔명'}
                              </div>
                              
                              {/* 별점 */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <RatingBoard
                                  ratingSize={20}
                                  rating={rating}
                                />
                                <span style={{
                                  fontSize: '14px',
                                  color: '#666',
                                  marginLeft: '4px'
                                }}>
                                  ★ {hotel.tripAdviser || hotel.customerScore || rating || '5.0'}
                                </span>
                              </div>
                              
                              {/* 특징 리스트 */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}>
                                {hotel.hotelRoomTypes && (() => {
                                  try {
                                    const roomTypes = JSON.parse(hotel.hotelRoomTypes);
                                    if (Array.isArray(roomTypes) && roomTypes.length > 0) {
                                      return roomTypes.slice(0, 4).map((room: any, idx: number) => (
                                        <div key={idx} style={{
                                          fontSize: '14px',
                                          color: '#333',
                                          lineHeight: '1.6'
                                        }}>
                                          -{room.roomTypeName || room} {nightsText}
                                        </div>
                                      ));
                                    }
                                  } catch (e) {
                                    console.error('Failed to parse room types:', e);
                                  }
                                  return null;
                                })()}
                                {hotel.hotelIntro && (
                                  <div style={{
                                    fontSize: '14px',
                                    color: '#333',
                                    lineHeight: '1.6'
                                  }}>
                                    -{hotel.hotelIntro.length > 50 ? hotel.hotelIntro.substring(0, 50) + '...' : hotel.hotelIntro}
                                  </div>
                                )}
                              </div>
                              
                              {/* 가격 및 선택 버튼 */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                marginTop: 'auto',
                                gap: '16px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}>
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#666'
                                  }}>
                                    1박(1인)
                                  </div>
                                  <div style={{
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: '#000'
                                  }}>
                                    {pricePerNight === '문의요청' ? pricePerNight : `₩${pricePerNight}~`}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleHotelSelect(hotel);
                                  }}
                                  style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#333';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#000';
                                  }}
                                >
                                  선택하기
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
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

                          // 상품명을 RecoilStore에 저장
                          const productNameFromModal = getProductNameFromScheduleForModal(product);
                          setSavedProductName(productNameFromModal);

                          // 상품 정보 갱신
                          setProductInfo(product);
                          setSelectedHotels(selectedHotels);

                          // 일차별 호텔 정보 갱신
                          const updatedHotelInfoPerDay = getHotelInfoPerDay(selectedHotels);
                          setHotelInfoPerDay(updatedHotelInfoPerDay);

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
                            if (customerInfo.travelPeriodStart) {
                              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                              if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
                                startDate = new Date(customerInfo.travelPeriodStart.trim());
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

                          // Recoil 상태 초기화 (새로운 상품의 일정을 로드하기 위해)
                          setScheduleInfo(null);

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
    </div>
  );
};

