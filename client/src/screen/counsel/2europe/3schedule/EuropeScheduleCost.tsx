import React, { useState, useEffect, useMemo, useRef } from 'react';
import './EuropeScheduleCost.scss';
import '../../backup/3hotel/EuropeHotelPage.scss';
import '../2city/EuropeCityDetail.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImLocation } from 'react-icons/im';
import { IoIosArrowBack, IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { FaRegCircle } from 'react-icons/fa6';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import ScheduleRederCustom from '../../../common/ScheduleRederCustom';
import GoogleMap from '../../../common/GoogleMap';
import axios from 'axios';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recoilSelectedScheduleData, recoilCustomerInfoFormData, recoilProductName, recoilScheduleInfo, recoilSelectedHotelData, recoilSelectedScheduleProduct, recoilHotelListData, recoilCityCart } from '../../../../RecoilStore';

// 호텔 페이지 이미지
import HotelImage1 from '../../../lastimages/counseltour/hotel/image.png';
import StarIcon from '../../../lastimages/counseltour/hotel/star-4-5.svg';
import LocationIcon from '../../../lastimages/counseltour/hotel/vector-301-5.svg';
import SearchIcon from '../../../lastimages/counseltour/hotel/vector.svg';

// 오른쪽 패널 상세 정보 이미지
import StarIconDetail from '../../../lastimages/counseltour/hotel/rightsection/star-4.svg';
import LocationIconDetail from '../../../lastimages/counseltour/hotel/rightsection/vector-301.svg';
import DropdownIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-302.svg';
import DateIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-337.svg';
import WifiIcon from '../../../lastimages/counseltour/hotel/rightsection/vector.svg';
import PoolIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-1.svg';
import FitnessIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-2.svg';
import ShuttleIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-3.svg';
import MediaImage from '../../../lastimages/counseltour/hotel/rightsection/rectangle-585.png';
import VideoIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-235.svg';
import PhotoIcon1 from '../../../lastimages/counseltour/hotel/rightsection/vector-236.svg';
import PhotoIcon2 from '../../../lastimages/counseltour/hotel/rightsection/vector-237.svg';

// 일정표 우측 패널 카드용 이미지 (투어 전용)
import scheduleImg1 from '../../../lastimages/counseltour/schedule/image1.png';

// 도시 상세 페이지용 이미지
import rectangle76 from '../../../lastimages/counselrest/hotel/detail/rectangle-76.png';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle619 from '../../../lastimages/counselrest/hotel/detail/rectangle-619.png';
import rectangle580 from '../../../lastimages/counselrest/hotel/detail/rectangle-580.png';
import roomIcon from '../../../images/counsel/rest/hotel/Rooms.png';

export default function EuropeScheduleCost() {
  const navigate = useNavigate();     
  const location = useLocation();
  
  const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
  const setSelectedScheduleData = useSetRecoilState(recoilSelectedScheduleData);
  const savedProductName = useRecoilValue(recoilProductName);
  const setSavedProductName = useSetRecoilState(recoilProductName);
  const scheduleInfo = useRecoilValue(recoilScheduleInfo);
  const setScheduleInfo = useSetRecoilState(recoilScheduleInfo);
  const setSelectedHotelData = useSetRecoilState(recoilSelectedHotelData);
  const selectedHotelData = useRecoilValue(recoilSelectedHotelData);
  const selectedScheduleProduct = useRecoilValue(recoilSelectedScheduleProduct);
  const hotelListData = useRecoilValue(recoilHotelListData);
  const setHotelListData = useSetRecoilState(recoilHotelListData);
  const cityCart = useRecoilValue(recoilCityCart);
  
  // stateProps는 location.state가 있으면 사용하고, 없으면 Recoil의 selectedScheduleProduct 사용
  const stateProps = location.state || selectedScheduleProduct;
  console.log('stateProps', stateProps);

  
  const [mainTab, setMainTab] = useState<string>('여행도시');
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [summaryMainTab, setSummaryMainTab] = React.useState<'상세일정' | '항공' | '식사' | '계약특전'>('상세일정');
  const [summarySubTab, setSummarySubTab] = React.useState<'전체' | '익스커션' | '강습/클래스' | '스파마사지' | '식사/다이닝' | '바/클럽' | '스냅촬영' | '차량/가이드' | '편의사항' | '기타'>('전체');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleDetail, setScheduleDetail] = useState<any>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);
  const [cityInfoMap, setCityInfoMap] = useState<Record<string, any>>({});
  const [loadingCityInfo, setLoadingCityInfo] = useState<boolean>(false);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  
  // 각 객실 타입 섹션에 대한 ref를 Map으로 관리
  const roomTypeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  
  // 도시 이미지 탭 관련 상태
  const [cityImageTab, setCityImageTab] = useState<number>(0); // 0: 소개, 1: 가이드투어, 2: 입장/체험, 3: 경기/공연, 4: 레스토랑/카페
  const [imageNotice, setImageNotice] = useState<any[]>([]); // 소개
  const [imageGuide, setImageGuide] = useState<any[]>([]); // 가이드투어
  const [imageEnt, setImageEnt] = useState<any[]>([]); // 입장/체험
  const [imageEvent, setImageEvent] = useState<any[]>([]); // 경기/공연
  const [imageCafe, setImageCafe] = useState<any[]>([]); // 레스토랑/카페
  const [imageMainPoint, setImageMainPoint] = useState<any[]>([]);
  const [imageBenefit, setImageBenefit] = useState<any[]>([]);
  
  // 일정표 편집 모드
  const [showScheduleEdit, setShowScheduleEdit] = React.useState<boolean>(false);
  const [scheduleProductId, setScheduleProductId] = React.useState<string | null>(
    stateProps?.id ? String(stateProps.id) : null
  );
  
  // 상세일정 탭의 상세일정 리스트 데이터
  const [scheduleDetailList, setScheduleDetailList] = React.useState<any[]>([]);
  const [isLoadingScheduleDetail, setIsLoadingScheduleDetail] = React.useState<boolean>(false);
  
  // 우측 패널 탭 상태
  const [rightPanelTopTab, setRightPanelTopTab] = React.useState<'예약하기' | '수정하기'>('예약하기');
  const [rightPanelSubTab, setRightPanelSubTab] = React.useState<'여행도시' | '여행루트' | '일정' | '예약정보' | '호텔'>('예약정보');
  
  // 예약하기 탭일 때는 예약정보, 수정하기 탭일 때는 여행도시를 기본값으로 설정
  React.useEffect(() => {
    if (rightPanelTopTab === '예약하기') {
      setRightPanelSubTab('예약정보');
    } else if (rightPanelTopTab === '수정하기') {
      setRightPanelSubTab('여행도시');
    }
  }, [rightPanelTopTab]);
  
  // 플로팅 박스용 상태
  const [expandedLocationDays, setExpandedLocationDays] = React.useState<Set<number>>(new Set());
  
  const [cityCards, setCityCards] = React.useState<Array<{ id: number; city: string; travelPeriod: string; nights: number }>>([]);
  const [selectedNights, setSelectedNights] = React.useState<{ [key: number]: number }>({});
  // 드래그 앤 드롭 관련 state
  const [draggedCardId, setDraggedCardId] = React.useState<number | null>(null);
  const [dragOverCardId, setDragOverCardId] = React.useState<number | null>(null);
  // 도시 추가 로딩 상태
  const [isAddingCity, setIsAddingCity] = React.useState<boolean>(false);
  // 도시 선택 모달 관련 상태
  const [showCitySelectModal, setShowCitySelectModal] = React.useState<boolean>(false);
  const [selectedCardIndex, setSelectedCardIndex] = React.useState<number | null>(null);
  const [availableCities, setAvailableCities] = React.useState<Array<{ cityKo: string; cityEn?: string; nation?: string; id?: number }>>([]);
  const [allCities, setAllCities] = React.useState<Array<{ cityKo: string; cityEn?: string; nation?: string; id?: number }>>([]);
  const [nations, setNations] = React.useState<Array<{ id: number; name: string }>>([]);
  const [selectedNationFilter, setSelectedNationFilter] = React.useState<string>('');

  // 호텔 페이지 관련 상태 - Recoil에서 가져오기
  const [hotelLoading, setHotelLoading] = useState<boolean>(true);
  
  // Recoil에서 호텔 데이터 가져오기
  const hotels = hotelListData.hotels;
  const hotelCities = hotelListData.hotelCities;
  const activeHotelCity = hotelListData.activeHotelCity;
  const selectedHotel = hotelListData.selectedHotel;
  const showPhotoGallery = hotelListData.showPhotoGallery;
  const activePhotoTab = hotelListData.activePhotoTab;
  const selectedMainImageIndex = hotelListData.selectedMainImageIndex;
  const imageAllView = hotelListData.imageAllView;
  const imageRoomView = hotelListData.imageRoomView;
  const imageEtcView = hotelListData.imageEtcView;
  
  // 호텔 데이터 업데이트 함수들
  const updateHotelListData = (updates: Partial<typeof hotelListData>) => {
    setHotelListData(prev => ({ ...prev, ...updates }));
  };
  
  const setHotels = (newHotels: any[]) => updateHotelListData({ hotels: newHotels });
  const setHotelCities = (newCities: string[]) => updateHotelListData({ hotelCities: newCities });
  const setActiveHotelCity = (city: string | null) => updateHotelListData({ activeHotelCity: city });
  const setSelectedHotel = (hotel: any | null) => updateHotelListData({ selectedHotel: hotel });
  const setShowPhotoGallery = (show: boolean) => updateHotelListData({ showPhotoGallery: show });
  const setActivePhotoTab = (tab: number) => updateHotelListData({ activePhotoTab: tab });
  const setSelectedMainImageIndex = (index: number) => updateHotelListData({ selectedMainImageIndex: index });
  const setImageAllView = (images: any[]) => updateHotelListData({ imageAllView: images });
  const setImageRoomView = (images: any[]) => updateHotelListData({ imageRoomView: images });
  const setImageEtcView = (images: any[]) => updateHotelListData({ imageEtcView: images });
  
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

  // Recoil에서 상품명을 읽어서 예약 폼 초기화
  useEffect(() => {
    if (savedProductName) {
      setReservationForm(prev => ({
        ...prev,
        productName: savedProductName
      }));
    } else if (stateProps?.productName) {
      setReservationForm(prev => ({
        ...prev,
        productName: stateProps.productName
      }));
      // stateProps에서 가져온 상품명도 Recoil에 저장
      setSavedProductName(stateProps.productName);
    }
  }, [savedProductName, stateProps?.productName, setSavedProductName]);
  
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
  
  // productScheduleData에서 도시 목록 추출 (스케줄 선택 시 productScheduleData 우선 사용)
  const cities = React.useMemo(() => {
    // cityCards가 있으면 우선 사용 (편집 중인 경우)
    if (cityCards.length > 0) {
      const cityList = cityCards
        .map((card) => card.city)
        .filter((city: string) => city && city.trim() !== '' && city !== '도시 선택 필요');
      if (cityList.length > 0) {
        return Array.from(new Set(cityList));
      }
    }
    
    // stateProps의 productScheduleData가 있으면 우선 사용 (스케줄에서 선택한 경우)
    if (stateProps?.productScheduleData) {
      try {
        const scheduleData = JSON.parse(stateProps.productScheduleData);
        if (Array.isArray(scheduleData)) {
          const cityList = scheduleData
            .map((item: any) => item.city || item.cityKo || '')
            .filter((city: string) => city && city.trim() !== '');
          // 중복 제거
          if (cityList.length > 0) {
            return Array.from(new Set(cityList));
          }
        }
      } catch (e) {
        console.error('productScheduleData 파싱 오류:', e);
      }
    }
    
    // Recoil의 cityCart에서 도시 목록 추출 (장바구니에서 온 경우)
    if (cityCart && cityCart.length > 0) {
      const cityList = cityCart
        .map((item) => item.cityKo)
        .filter((city: string) => city && city.trim() !== '');
      if (cityList.length > 0) {
        return Array.from(new Set(cityList));
      }
    }
    
    // productScheduleData가 없으면 selectedCities에서 추출 (우선순위 3)
    if (stateProps?.selectedCities && Array.isArray(stateProps.selectedCities)) {
      const cityList = stateProps.selectedCities
        .map((city: any) => city?.cityKo || city?.city || '')
        .filter((city: string) => city && city.trim() !== '');
      if (cityList.length > 0) {
        return Array.from(new Set(cityList));
      }
    }
    
    // stateProps의 cityCart에서 추출 (우선순위 4)
    if (stateProps?.cityCart && Array.isArray(stateProps.cityCart)) {
      const cityList = stateProps.cityCart
        .map((item: any) => item?.cityKo || item?.city || '')
        .filter((city: string) => city && city.trim() !== '');
      if (cityList.length > 0) {
        return Array.from(new Set(cityList));
      }
    }
    
    return [];
  }, [cityCards, cityCart, stateProps?.productScheduleData, stateProps?.selectedCities, stateProps?.cityCart]);

  // productScheduleData에서 일차별 도시 정보 추출
  const cityInfoPerDay = React.useMemo(() => {
    // cityCards가 있으면 우선 사용 (편집 중인 경우)
    if (cityCards.length > 0) {
      const cityInfo: Array<{ dayIndex: number; cityName: string }> = [];
      let currentDay = 0;
      cityCards.forEach((card) => {
        const city = card.city || '';
        if (city && city !== '도시 선택 필요') {
          const nights = selectedNights[card.id] || card.nights || 1;
          for (let i = 0; i < nights; i++) {
            cityInfo.push({
              dayIndex: currentDay,
              cityName: city
            });
            currentDay++;
          }
        }
      });
      if (cityInfo.length > 0) {
        return cityInfo;
      }
    }
    
    // stateProps에서 cityInfoPerDay가 있으면 사용
    if (stateProps?.cityInfoPerDay) {
      return stateProps.cityInfoPerDay;
    }
    
    // productScheduleData에서 cityInfoPerDay 생성
    if (stateProps?.productScheduleData) {
      try {
        const scheduleData = JSON.parse(stateProps.productScheduleData);
        if (Array.isArray(scheduleData)) {
          const cityInfo: Array<{ dayIndex: number; cityName: string }> = [];
          let currentDay = 0;
          scheduleData.forEach((item: any) => {
            const city = item.city || '';
            const dayNight = item.dayNight || '';
            const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
            for (let i = 0; i < nights; i++) {
              cityInfo.push({
                dayIndex: currentDay,
                cityName: city
              });
              currentDay++;
            }
          });
          return cityInfo;
        }
      } catch (e) {
        console.error('productScheduleData 파싱 오류:', e);
      }
    }
    return undefined;
  }, [cityCards, selectedNights, stateProps?.cityInfoPerDay, stateProps?.productScheduleData]);

  // 각 도시별 첫 번째 호텔 정보를 일차별로 추출 (유럽 일정용)
  const hotelInfoPerDay = React.useMemo(() => {
    if (!cityInfoPerDay || !hotels || hotels.length === 0) {
      return undefined;
    }

    const hotelInfo: Array<{ dayIndex: number; hotelName: string; hotelLevel: string }> = [];
    
    // 각 도시별 첫 번째 호텔을 찾기 위한 맵 생성
    const firstHotelByCity = new Map<string, any>();
    hotels.forEach((hotel: any) => {
      const city = hotel.city || hotel._cityFromSchedule || '';
      if (city && !firstHotelByCity.has(city)) {
        firstHotelByCity.set(city, hotel);
      }
    });

    // cityInfoPerDay를 기반으로 각 일차별 호텔 정보 생성
    cityInfoPerDay.forEach((cityInfo: { dayIndex: number; cityName: string }) => {
      const firstHotel = firstHotelByCity.get(cityInfo.cityName);
      if (firstHotel) {
        hotelInfo.push({
          dayIndex: cityInfo.dayIndex,
          hotelName: firstHotel.hotelNameKo || '',
          hotelLevel: firstHotel.hotelLevel || ''
        });
      }
    });

    return hotelInfo.length > 0 ? hotelInfo : undefined;
  }, [cityInfoPerDay, hotels]);

  // productScheduleData에서 도시 정보 (도시명, 여행기간, 박수) 추출
  const citiesWithInfo = React.useMemo(() => {
    // cityCards가 있으면 우선 사용 (편집 중인 경우)
    if (cityCards.length > 0) {
      return cityCards.map((card) => ({
        id: card.id,
        city: card.city,
        travelPeriod: card.travelPeriod,
        nights: selectedNights[card.id] || card.nights || 1
      }));
    }
    
    if (!stateProps?.productScheduleData) return [];
    try {
      const scheduleData = JSON.parse(stateProps.productScheduleData);
      if (!Array.isArray(scheduleData)) return [];

      // 시작 날짜 계산
      let startDate: Date | null = null;
      if (customerInfo.travelPeriodStart) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          startDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      }
      
      if (!startDate) {
        startDate = new Date();
      }

      let currentDate = new Date(startDate);

      return scheduleData.map((item: any, index: number) => {
        const city = item.city || '';
        const dayNight = item.dayNight || '';
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
        
        const arrivalDate = new Date(currentDate);
        const departureDate = new Date(currentDate);
        
        if (nights > 0) {
          departureDate.setDate(departureDate.getDate() + nights);
        }
        
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const travelPeriod = `${formatDate(arrivalDate)} ~ ${formatDate(departureDate)}`;
        
        currentDate = new Date(departureDate);
        
        return {
          id: index + 1,
          city,
          travelPeriod,
          nights
        };
      });
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return [];
    }
  }, [cityCards, selectedNights, stateProps?.productScheduleData, customerInfo.travelPeriodStart]);

  // cityCards 초기화 (citiesWithInfo가 변경될 때)
  useEffect(() => {
    if (citiesWithInfo.length > 0 && cityCards.length === 0) {
      setCityCards(citiesWithInfo.map((item, index) => ({
        id: item.id || index + 1,
        city: item.city,
        travelPeriod: item.travelPeriod,
        nights: item.nights
      })));
      
      // selectedNights 초기화
      const initialNights: { [key: number]: number } = {};
      citiesWithInfo.forEach((item, index) => {
        const cardId = item.id || index + 1;
        initialNights[cardId] = item.nights;
      });
      setSelectedNights(initialNights);
    }
  }, [citiesWithInfo]);

  // 박수 추출 헬퍼 함수
  const extractNightsNumber = (nightsStr: string | number): number => {
    if (typeof nightsStr === 'number') return nightsStr;
    if (!nightsStr) return 0;
    const match = nightsStr.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // 상품명 업데이트 함수
  const updateProductNameFromCards = React.useCallback((cards: any[], nights: { [key: number]: number }) => {
    if (cards.length === 0) return;
    
    const nameParts = cards.map((card) => {
      const nightsValue = nights[card.id] || card.nights || 1;
      return `${card.city} ${nightsValue}박`;
    });
    
    const newProductName = nameParts.join(' + ');
    setSavedProductName(newProductName);
  }, [setSavedProductName]);

  // 카드 순서 변경 함수 (위로 이동)
  const handleMoveCardUp = React.useCallback((cardId: number) => {
    const cardIndex = cityCards.findIndex(c => c.id === cardId);
    if (cardIndex <= 0) return;

    const updatedCards = [...cityCards];
    [updatedCards[cardIndex - 1], updatedCards[cardIndex]] = [updatedCards[cardIndex], updatedCards[cardIndex - 1]];
    setCityCards(updatedCards);
    updateProductNameFromCards(updatedCards, selectedNights);
  }, [cityCards, selectedNights, updateProductNameFromCards]);

  // 카드 순서 변경 함수 (아래로 이동)
  const handleMoveCardDown = React.useCallback((cardId: number) => {
    const cardIndex = cityCards.findIndex(c => c.id === cardId);
    if (cardIndex < 0 || cardIndex >= cityCards.length - 1) return;

    const updatedCards = [...cityCards];
    [updatedCards[cardIndex], updatedCards[cardIndex + 1]] = [updatedCards[cardIndex + 1], updatedCards[cardIndex]];
    setCityCards(updatedCards);
    updateProductNameFromCards(updatedCards, selectedNights);
  }, [cityCards, selectedNights, updateProductNameFromCards]);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = React.useCallback((e: React.DragEvent, cardId: number) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent, cardId: number) => {
    if (draggedCardId === null || draggedCardId === cardId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCardId(cardId);
  }, [draggedCardId]);

  const handleDragLeave = React.useCallback(() => {
    setDragOverCardId(null);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent, targetCardId: number) => {
    e.preventDefault();
    if (draggedCardId === null || draggedCardId === targetCardId) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    const draggedIndex = cityCards.findIndex(c => c.id === draggedCardId);
    const targetIndex = cityCards.findIndex(c => c.id === targetCardId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    const updatedCards = [...cityCards];
    const [draggedCard] = updatedCards.splice(draggedIndex, 1);
    updatedCards.splice(targetIndex, 0, draggedCard);

    setCityCards(updatedCards);
    updateProductNameFromCards(updatedCards, selectedNights);
    setDraggedCardId(null);
    setDragOverCardId(null);
  }, [draggedCardId, cityCards, selectedNights, updateProductNameFromCards]);

  const handleDragEnd = React.useCallback(() => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  }, []);

  // 도시 카드 삭제 함수
  const handleDeleteCard = React.useCallback((cardId: number) => {
    if (cityCards.length <= 1) {
      alert('최소 1개의 도시는 유지해야 합니다.');
      return;
    }

    const cardIndex = cityCards.findIndex(c => c.id === cardId);
    if (cardIndex < 0) return;

    const updatedCards = cityCards.filter(c => c.id !== cardId);
    setCityCards(updatedCards);
    
    // selectedNights에서도 제거
    setSelectedNights(prev => {
      const newNights = { ...prev };
      delete newNights[cardId];
      return newNights;
    });
    
    updateProductNameFromCards(updatedCards, selectedNights);
  }, [cityCards, selectedNights, updateProductNameFromCards]);

  // 도시 추가 함수
  const handleAddCity = React.useCallback(() => {
    if (cityCards.length === 0 || isAddingCity) return;

    setIsAddingCity(true);

    try {
      const lastCard = cityCards[cityCards.length - 1];
      const lastCardNights = selectedNights[lastCard.id] || lastCard.nights || 1;
      
      // 마지막 카드의 날짜 계산
      let startDate: Date | null = null;
      if (customerInfo.travelPeriodStart) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          startDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      }
      
      if (!startDate) {
        startDate = new Date();
      }

      // 마지막 카드의 출발일 계산
      let currentDate = new Date(startDate);
      cityCards.forEach((card, index) => {
        const nights = selectedNights[card.id] || card.nights || 1;
        if (index < cityCards.length - 1) {
          currentDate.setDate(currentDate.getDate() + nights);
        } else {
          currentDate.setDate(currentDate.getDate() + nights);
        }
      });

      const arrivalDate = new Date(currentDate);
      const departureDate = new Date(currentDate);
      departureDate.setDate(departureDate.getDate() + 1);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // 현재 상품에 포함된 도시 목록
      const currentProductCities = cityCards.map(card => card.city).filter(city => city && city !== '도시 선택 필요');
      
      // 장바구니에서 현재 상품에 없는 도시 찾기
      let cityToAdd: string | null = null;
      if (cityCart && cityCart.length > 0) {
        const cartCityNames = cityCart.map(item => item.cityKo).filter(Boolean);
        const missingCity = cartCityNames.find(cartCity => {
          // 현재 상품에 포함되어 있지 않은 도시 찾기
          return !currentProductCities.some(productCity => {
            const productCityTrimmed = productCity.trim();
            const cartCityTrimmed = cartCity.trim();
            return productCityTrimmed === cartCityTrimmed || 
                   productCityTrimmed.includes(cartCityTrimmed) || 
                   cartCityTrimmed.includes(productCityTrimmed);
          });
        });
        
        if (missingCity) {
          cityToAdd = missingCity;
        }
      }

      const newCard = {
        id: Math.max(...cityCards.map(c => c.id), 0) + 1,
        city: cityToAdd || '도시 선택 필요',
        travelPeriod: `${formatDate(arrivalDate)} ~ ${formatDate(departureDate)}`,
        nights: 1
      };

      const updatedCards = [...cityCards, newCard];
      setCityCards(updatedCards);
      
      // selectedNights에 새 카드 추가
      setSelectedNights(prev => ({
        ...prev,
        [newCard.id]: 1
      }));
      
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
      
      updateProductNameFromCards(updatedCards, { ...selectedNights, [newCard.id]: 1 });
    } finally {
      setIsAddingCity(false);
    }
  }, [cityCards, selectedNights, customerInfo.travelPeriodStart, updateProductNameFromCards, cityCart, scheduleInfo, setScheduleInfo, isAddingCity]);

  // 도시 선택 모달 열기
  const handleCityNameClick = React.useCallback(async (cardId: number) => {
    setSelectedCardIndex(cardId);
    setShowCitySelectModal(true);
    setSelectedNationFilter(''); // 국가 필터 초기화
    
    // 모든 도시 목록 가져오기
    const availableCityList: Array<{ cityKo: string; cityEn?: string; nation?: string; id?: number }> = [];
    const nationList: Array<{ id: number; name: string }> = [];
    
    try {
      // 유럽의 모든 국가 리스트 가져오기
      const locationType = '유럽';
      const nationsResponse = await axios.get(`${AdminURL}/ceylontour/getnationlisttour/${locationType}`);
      
      if (nationsResponse.data && Array.isArray(nationsResponse.data)) {
        const filteredNations = nationsResponse.data.filter((nation: any) => nation.isView === 'true');
        
        // 국가 리스트 저장
        filteredNations.forEach((nation: any) => {
          nationList.push({
            id: nation.id,
            name: nation.nationKo || nation.nation || ''
          });
        });
        setNations(nationList);
        
        // 각 국가의 도시 데이터 가져오기
        for (const nation of filteredNations) {
          if (nation.cities && Array.isArray(nation.cities)) {
            nation.cities.forEach((city: any) => {
              if (city.isView === 'true' && city.cityKo) {
                // 중복 체크
                if (!availableCityList.find(c => c.id === city.id)) {
                  availableCityList.push({
                    cityKo: city.cityKo,
                    cityEn: city.cityEn,
                    nation: nation.nationKo || nation.nation,
                    id: city.id
                  });
                }
              }
            });
          }
        }
      }
      
      // 장바구니의 도시도 추가 (중복 제거)
      if (cityCart && cityCart.length > 0) {
        cityCart.forEach((item) => {
          if (item.cityKo && !availableCityList.find(c => c.id === item.id)) {
            availableCityList.push({
              cityKo: item.cityKo,
              cityEn: item.cityEn,
              nation: item.nation || item.nationKo,
              id: item.id
            });
          }
        });
      }
      
      // cityInfoMap에서도 추가 (이미 가져온 도시 정보)
      Object.entries(cityInfoMap).forEach(([cityName, cityInfo]) => {
        if (!availableCityList.find(c => c.id === cityInfo.id)) {
          availableCityList.push({
            cityKo: cityName,
            cityEn: cityInfo.cityEn,
            nation: cityInfo.nation,
            id: cityInfo.id
          });
        }
      });
      
      setAllCities(availableCityList);
      setAvailableCities(availableCityList);
    } catch (error) {
      console.error('도시 목록을 가져오는 중 오류 발생:', error);
      // 에러 발생 시 기존 로직 사용
      const fallbackCityList: Array<{ cityKo: string; cityEn?: string; nation?: string; id?: number }> = [];
      
      if (cityCart && cityCart.length > 0) {
        cityCart.forEach((item) => {
          if (item.cityKo && !fallbackCityList.find(c => c.id === item.id)) {
            fallbackCityList.push({
              cityKo: item.cityKo,
              cityEn: item.cityEn,
              nation: item.nation || item.nationKo,
              id: item.id
            });
          }
        });
      }
      
      Object.entries(cityInfoMap).forEach(([cityName, cityInfo]) => {
        if (!fallbackCityList.find(c => c.id === cityInfo.id)) {
          fallbackCityList.push({
            cityKo: cityName,
            cityEn: cityInfo.cityEn,
            nation: cityInfo.nation,
            id: cityInfo.id
          });
        }
      });
      
      setAllCities(fallbackCityList);
      setAvailableCities(fallbackCityList);
    }
  }, [cityCart, cityInfoMap]);

  // 국가 필터 변경 핸들러
  const handleNationFilterChange = React.useCallback((nationName: string) => {
    setSelectedNationFilter(nationName);
    
    if (nationName === '') {
      // 전체 도시 표시
      setAvailableCities(allCities);
    } else {
      // 선택된 국가의 도시만 필터링
      const filtered = allCities.filter(city => city.nation === nationName);
      setAvailableCities(filtered);
    }
  }, [allCities]);

  // 도시 선택 핸들러
  const handleCitySelect = React.useCallback((selectedCity: { cityKo: string; cityEn?: string; nation?: string; id?: number }) => {
    if (selectedCardIndex === null) return;
    
    const cardIndex = cityCards.findIndex(c => c.id === selectedCardIndex);
    if (cardIndex < 0) return;
    
    const updatedCards = [...cityCards];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      city: selectedCity.cityKo
    };
    
    setCityCards(updatedCards);
    updateProductNameFromCards(updatedCards, selectedNights);
    
    setShowCitySelectModal(false);
    setSelectedCardIndex(null);
  }, [selectedCardIndex, cityCards, selectedNights, updateProductNameFromCards]);

  // 각 도시 정보 가져오기
  const fetchCityInfo = async (cityName: string) => {
    try {
      const response = await axios.get(`${AdminURL}/ceylontour/getcityinfobyname/${cityName}`);
      if (response.data && response.data !== false && response.data.length > 0) {
        // 첫 번째 항목을 도시 정보로 사용
        console.log(`${cityName} 도시 정보:`, response.data[0]);
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error(`${cityName} 도시 정보를 가져오는 중 오류 발생:`, error);
      return null;
    }
  };

  // 모든 도시 정보 가져오기
  useEffect(() => {
    const fetchAllCityInfo = async () => {
      if (cities.length === 0) return;
      
      setLoadingCityInfo(true);
      const cityInfoPromises = cities.map(async (city: string) => {
        const info = await fetchCityInfo(city);
        return { city, info };
      });

      try {
        const results = await Promise.all(cityInfoPromises);
        const infoMap: Record<string, any> = {};
        results.forEach(({ city, info }) => {
          if (info) {
            infoMap[city] = info;
          }
        });
        setCityInfoMap(infoMap);
      } catch (error) {
        console.error('도시 정보를 가져오는 중 오류 발생:', error);
      } finally {
        setLoadingCityInfo(false);
      }
    };

    fetchAllCityInfo();
  }, [cities]);

  // 첫 번째 도시를 기본값으로 설정
  const [selectedCity, setSelectedCity] = useState<string>('');

  // cities가 변경되면 첫 번째 도시를 자동으로 선택
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity]);

  // 도시 탭 변경 시 이미지 최상단으로 스크롤
  useEffect(() => {
    if (previewContentRef.current) {
      previewContentRef.current.scrollTop = 0;
    }
  }, [selectedCity]);

  // 선택된 도시의 정보 - Recoil의 cityCart에서 먼저 찾고, 없으면 cityInfoMap에서 찾기
  const selectedCityInfo = React.useMemo(() => {
    if (!selectedCity) return null;
    
    // Recoil의 cityCart에서 도시 찾기 (cityKo로 매칭)
    const cityFromCart = cityCart.find((item) => item.cityKo === selectedCity);
    if (cityFromCart) {
      return cityFromCart;
    }
    
    // cityCart에 없으면 cityInfoMap에서 찾기
    return cityInfoMap[selectedCity] || null;
  }, [selectedCity, cityInfoMap, cityCart]);

  // 첫 번째 도시의 국가 정보 (배지 표시용)
  const firstCityNation = React.useMemo(() => {
    if (cities.length === 0) return null;
    
    const firstCity = cities[0];
    
    // Recoil의 cityCart에서 도시 찾기 (cityKo로 매칭)
    const cityFromCart = cityCart.find((item) => item.cityKo === firstCity);
    if (cityFromCart && (cityFromCart.nation || cityFromCart.nationKo)) {
      return cityFromCart.nation || cityFromCart.nationKo;
    }
    
    // cityCart에 없으면 cityInfoMap에서 찾기
    const cityFromMap = cityInfoMap[firstCity];
    if (cityFromMap && (cityFromMap.nation || cityFromMap.nationKo)) {
      return cityFromMap.nation || cityFromMap.nationKo;
    }
    
    return null;
  }, [cities, cityCart, cityInfoMap]);

  // 선택된 도시의 이미지 파싱
  useEffect(() => {
    if (selectedCityInfo) {
      // 소개 이미지 파싱
      try {
        const noticeImages = JSON.parse(selectedCityInfo.imageNamesNotice || '[]');
        setImageNotice(Array.isArray(noticeImages) ? noticeImages : []);
      } catch (e) {
        setImageNotice([]);
      }

      // 가이드투어 이미지 파싱
      try {
        const guideImages = JSON.parse(selectedCityInfo.imageNamesGuide || '[]');
        setImageGuide(Array.isArray(guideImages) ? guideImages : []);
      } catch (e) {
        setImageGuide([]);
      }

      // 입장/체험 이미지 파싱
      try {
        const entImages = JSON.parse(selectedCityInfo.imageNamesEnt || '[]');
        setImageEnt(Array.isArray(entImages) ? entImages : []);
      } catch (e) {
        setImageEnt([]);
      }

      // 경기/공연 이미지 파싱
      try {
        const eventImages = JSON.parse(selectedCityInfo.imageNamesEvent || '[]');
        setImageEvent(Array.isArray(eventImages) ? eventImages : []);
      } catch (e) {
        setImageEvent([]);
      }

      // 레스토랑/카페 이미지 파싱
      try {
        const cafeImages = JSON.parse(selectedCityInfo.imageNamesCafe || '[]');
        setImageCafe(Array.isArray(cafeImages) ? cafeImages : []);
      } catch (e) {
        setImageCafe([]);
      }

      // 핵심 포인트 이미지 파싱
      try {
        const mainPoint = JSON.parse(selectedCityInfo.imageNamesMainPoint || '[]');
        setImageMainPoint(Array.isArray(mainPoint) ? mainPoint : []);
      } catch (e) {
        setImageMainPoint([]);
      }

      // 베네핏 이미지 파싱
      try {
        const benefit = JSON.parse(selectedCityInfo.imageNamesBenefit || '[]');
        setImageBenefit(Array.isArray(benefit) ? benefit : []);
      } catch (e) {
        setImageBenefit([]);
      }
    } else {
      setImageNotice([]);
      setImageGuide([]);
      setImageEnt([]);
      setImageEvent([]);
      setImageCafe([]);
      setImageMainPoint([]);
      setImageBenefit([]);
    }
  }, [selectedCityInfo]);

  // 이미지 탭 변경 시 스크롤 리셋
  useEffect(() => {
    if (previewContentRef.current) {
      previewContentRef.current.scrollTop = 0;
    }
  }, [cityImageTab]);

  // recoilScheduleInfo 초기화 및 관리
  useEffect(() => {
    const loadScheduleData = async () => {
      // isFromMakeButton이면 customScheduleInfo 사용
      if (stateProps?.isFromMakeButton && stateProps?.customScheduleInfo) {
        setScheduleInfo(stateProps.customScheduleInfo);
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
              cityInfoPerDay: cityInfoPerDay,
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
        }
      } else {
        // scheduleProductId가 없고 scheduleInfo도 없으면 기본 구조 설정
        // 단, 이미 초기화된 경우는 제외 (무한 루프 방지)
        setScheduleInfo(prev => {
          if (!prev) {
            return {
              airlineData: { sort: '', airlineCode: [] },
              scheduleDetailData: [createEmptyDay()]
            };
          }
          return prev;
        });
      }
    };
    
    loadScheduleData();
  }, [scheduleProductId, stateProps?.isFromMakeButton, stateProps?.customScheduleInfo, setScheduleInfo]);

  // 상세일정 데이터 조회 (도시 기준)
  const fetchScheduleDetailList = React.useCallback(async () => {
    try {
      if (!selectedCity) {
        setScheduleDetailList([]);
        return;
      }

      setIsLoadingScheduleDetail(true);
      const response = await axios.post(`${AdminURL}/ceylontour/getdetailboxbycity`, { city: selectedCity });
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
  }, [selectedCity]);

  // 상세일정 데이터 로드
  useEffect(() => {
    if (selectedCity) {
      fetchScheduleDetailList();
    }
  }, [selectedCity, fetchScheduleDetailList]);

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

  // 일정표 추가, 삭제, 이동 함수 (Recoil 상태 수정)
  const addDay = (idx: number) => {
    if (!scheduleInfo || !scheduleInfo.scheduleDetailData) return;
    const newScheduleInfo = { ...scheduleInfo };
    const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
    newScheduleDetailData.splice(idx + 1, 0, createEmptyDay());
    newScheduleInfo.scheduleDetailData = newScheduleDetailData;
    setScheduleInfo(newScheduleInfo);
  };

  const deleteDay = (idx: number) => {
    if (!scheduleInfo || !scheduleInfo.scheduleDetailData) return;
    if (scheduleInfo.scheduleDetailData.length > 1) {
      const newScheduleInfo = { ...scheduleInfo };
      const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
      newScheduleDetailData.splice(idx, 1);
      newScheduleInfo.scheduleDetailData = newScheduleDetailData;
      setScheduleInfo(newScheduleInfo);
    } else {
      alert('마지막 1일은 삭제할 수 없습니다.');
    }
  };

  const moveDayUp = (idx: number) => {
    if (idx > 0 && scheduleInfo && scheduleInfo.scheduleDetailData) {
      const newScheduleInfo = { ...scheduleInfo };
      const newScheduleDetailData = [...newScheduleInfo.scheduleDetailData];
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
      const tmp = newScheduleDetailData[idx];
      newScheduleDetailData[idx] = newScheduleDetailData[idx + 1];
      newScheduleDetailData[idx + 1] = tmp;
      newScheduleInfo.scheduleDetailData = newScheduleDetailData;
      setScheduleInfo(newScheduleInfo);
    } else {
      alert('맨 아래 입니다.');
    }
  };

  // 도시간 이동 교통 정보 렌더링 함수
  const renderTransportSection = () => {
    if (!stateProps?.productScheduleData) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          일정 데이터가 없습니다.
        </div>
      );
    }
    try {
      const scheduleData = JSON.parse(stateProps.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            일정 데이터가 없습니다.
          </div>
        );
      }

      // 시작 날짜 계산
      let startDate: Date | null = null;
      if (customerInfo.travelPeriodStart) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
          startDate = new Date(customerInfo.travelPeriodStart.trim());
        }
      }
      
      // 시작 날짜가 없으면 현재 날짜 사용
      if (!startDate) {
        startDate = new Date();
      }

      let currentDate = new Date(startDate);

      return (
        <div className="transport-section">
          <div className="transport-header">
            <h3>도시간 이동 교통</h3>
          </div>
          <div className="transport-list">
            {scheduleData.map((item: any, index: number) => {
              const city = item.city || '';
              const dayNight = item.dayNight || '';
              const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
              
              // 첫 번째 도시는 시작 날짜, 이후 도시는 이전 도시의 출발 날짜
              const arrivalDate = new Date(currentDate);
              const departureDate = new Date(currentDate);
              
              // 박수가 있으면 출발 날짜 계산
              if (nights > 0) {
                departureDate.setDate(departureDate.getDate() + nights);
              }
              
              const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                const weekday = weekdays[date.getDay()];
                return `${year}-${month}-${day}(${weekday})`;
              };
              
              // 다음 도시의 도착 날짜는 현재 도시의 출발 날짜
              currentDate = new Date(departureDate);
              
              // 이동 수단 (API에서 가져오거나 기본값)
              const transportType = item.transportType || item.traffic || (index < scheduleData.length - 1 ? ['버스', '국내선', '기차'][index % 3] : '');
              const transportIcon = transportType === '버스' ? '🚌' : transportType === '국내선' ? '✈️' : transportType === '기차' ? '🚂' : '';
              
              // 도착/출발 시간 (API에서 가져오거나 기본값)
              const arrivalTime = item.arrivalTime || (index === 0 ? '17:00' : '11:00');
              const departureTime = item.departureTime || '09:00';
              
              return (
                <React.Fragment key={index}>
                  <div className="transport-city-card">
                    <div className="transport-city-header">
                      <div className="transport-city-name">{city}</div>
                      <div className="transport-city-nights">
                        <span className="nights-value">{nights}박</span>
                      </div>
                    </div>
                    <div className="transport-city-details">
                      <div className="transport-detail-row">
                        <span className="transport-label">도착</span>
                        <span className="transport-value arrival">{formatDate(arrivalDate)} {arrivalTime}</span>
                      </div>
                      <div className="transport-detail-row">
                        <span className="transport-label">출발</span>
                        <span className="transport-value departure">{formatDate(departureDate)} {departureTime}</span>
                      </div>
                    </div>
                  </div>
                  {index < scheduleData.length - 1 && (
                    <div className="transport-connector">
                      <div className="transport-line"></div>
                      <div className="transport-icon">{transportIcon}</div>
                      <div className="transport-type">{transportType}</div>
                      <div className="transport-line"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="transport-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '20px'
          }}>
            <button 
              className="add-destination-btn"
              style={{
                padding: '8px 16px',
                border: '1px solid #333',
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              여행지 추가 +
            </button>
          </div>
        </div>
      );
    } catch (e) {
      console.error('일정 데이터 파싱 오류:', e);
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          일정 데이터를 불러올 수 없습니다.
        </div>
      );
    }
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // 호텔 페이지 관련 로직 (EuropeHotelPage에서 가져옴)
  const productScheduleData = stateProps?.productScheduleData;
  const parsedProductScheduleData = productScheduleData ? JSON.parse(productScheduleData) : [];

  // 일정에 포함된 도시별로 호텔 리스트를 API에서 가져오기 (일정표에서 호텔 정보 표시를 위해 항상 가져옴)
  useEffect(() => {
    const fetchHotelsByNation = async () => {
      try {
        if (!parsedProductScheduleData || parsedProductScheduleData.length === 0) {
          setHotels([]);
          setHotelLoading(false);
          return;
        }

        setHotelLoading(true);

        // 일정 배열에서 city 값만 추출 후 중복 제거
        const cityList: string[] = Array.from(
          new Set(
            parsedProductScheduleData
              .map((item: any) => item.city)
              .filter((c: any) => typeof c === 'string' && c.trim() !== '')
          )
        );
          console.log('cityList', cityList);
        if (cityList.length === 0) {
          setHotels([]);
          setHotelLoading(false);
          return;
        }

        // 탭에 사용할 도시 목록 저장
        setHotelCities(cityList);
        if (!activeHotelCity && cityList.length > 0) {
          setActiveHotelCity(cityList[0]);
        }

        const requests = cityList.map((city) =>
          axios.post(`${AdminURL}/ceylontour/gethotelsbycity`, { city })
        );

        const responses = await Promise.all(requests);
        console.log('responses', responses);

        const merged: any[] = [];
        responses.forEach((response, index) => {
          const city = cityList[index];
          if (response.data && response.data !== false) {
            response.data.forEach((hotel: any) => {
              merged.push({
                ...hotel,
                _cityFromSchedule: city,
              });
            });
          }
        });

        setHotels(merged);
      } catch (error) {
        console.error('투어 호텔 리스트를 가져오는 중 오류 발생:', error);
        setHotels([]);
      } finally {
        setHotelLoading(false);
      }
    };

    fetchHotelsByNation();
  }, [productScheduleData, activeHotelCity]);

  // 도시/호텔 목록 변경 시, 현재 도시의 첫 번째 호텔을 자동 선택
  useEffect(() => {
    if (mainTab !== '호텔') return;
    if (!hotels || hotels.length === 0) {
      setSelectedHotel(null);
      return;
    }

    const filtered =
      activeHotelCity
        ? hotels.filter(
            (hotel: any) =>
              hotel.city === activeHotelCity ||
              hotel._cityFromSchedule === activeHotelCity
          )
        : hotels;

    setSelectedHotel(filtered[0] || null);
  }, [hotels, activeHotelCity, mainTab]);

  // 선택된 호텔의 이미지 데이터 파싱
  useEffect(() => {
    if (mainTab !== '호텔' || !selectedHotel) {
      setImageAllView([]);
      setImageRoomView([]);
      setImageEtcView([]);
      return;
    }

    try {
      if (selectedHotel.imageNamesAllView) {
        const parsed = JSON.parse(selectedHotel.imageNamesAllView);
        setImageAllView(Array.isArray(parsed) ? parsed : []);
      } else {
        setImageAllView([]);
      }
    } catch (e) {
      console.error('전경 이미지 파싱 오류:', e);
      setImageAllView([]);
    }

    try {
      if (selectedHotel.imageNamesRoomView) {
        const parsed = JSON.parse(selectedHotel.imageNamesRoomView);
        setImageRoomView(Array.isArray(parsed) ? parsed : []);
      } else {
        setImageRoomView([]);
      }
    } catch (e) {
      console.error('객실 이미지 파싱 오류:', e);
      setImageRoomView([]);
    }

    try {
      if (selectedHotel.imageNamesEtcView) {
        const parsed = JSON.parse(selectedHotel.imageNamesEtcView);
        setImageEtcView(Array.isArray(parsed) ? parsed : []);
      } else {
        setImageEtcView([]);
      }
    } catch (e) {
      console.error('부대시설 이미지 파싱 오류:', e);
      setImageEtcView([]);
    }
  }, [selectedHotel, mainTab]);

  // 현재 탭에 따른 이미지 리스트 (전경 / 객실 / 부대시설)
  const getHotelCurrentImages = () => {
    if (activePhotoTab === 0) return imageAllView; // 전경
    if (activePhotoTab === 1) return imageRoomView; // 객실
    return imageEtcView; // 부대시설
  };

  // 객실 타입별 이미지 필터링 함수
  const getImagesByRoomType = (roomTypeName: string) => {
    return imageRoomView.filter((img: any) => {
      return img.roomTypeName === roomTypeName || img.title === roomTypeName;
    });
  };

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    if (mainTab === '호텔') {
      setSelectedMainImageIndex(0);
    }
  }, [activePhotoTab, mainTab]);

  // 사진 갤러리 탭 버튼
  const photoTabButtons = [
    { text: '전경' },
    { text: '객실' },
    { text: '부대시설' },
  ];

  // 현재 탭에 따른 이미지 리스트
  const getCurrentImages = () => {
    if (cityImageTab === 0) return imageNotice; // 소개
    if (cityImageTab === 1) return imageGuide; // 가이드투어
    if (cityImageTab === 2) return imageEnt; // 입장/체험
    if (cityImageTab === 3) return imageEvent; // 경기/공연
    return imageCafe; // 레스토랑/카페
  };

  const btnSolids = [
    { text: '소개' },
    { text: '가이드투어' },
    { text: '입장/체험' },
    { text: '경기/공연' },
    { text: '레스토랑/카페' }
  ];

  // 핵심 포인트 아이템 생성 (데이터에서 가져온 이미지 사용)
  const highlightItems = imageMainPoint.map((item: any) => ({
    image: `${AdminURL}/images/cityimages/${item.imageName}`,
    title: item.title || '',
    notice: item.notice || '',
  }));

  // 베네핏 아이템 생성 (데이터에서 가져온 이미지 사용)
  const benefitItems = imageBenefit.map((item: any) => ({
    title: item.title || '',
    text: item.notice || '',
    image: `${AdminURL}/images/cityimages/${item.imageName}`,
  }));

  return (
    <div className="europe-schedule-cost-page">
      <div className="europe-schedule-cost-page-container">
        
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

      {/* 메인 컨텐츠 */}
      <div className={`schedule-main ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 좌측 패널 - 도시 정보 */}
        <div className="left-panel">
          <div className="panel-content">
            {/* 패널 헤더 */}
            <div className="hotel-title-left-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IoIosArrowBack
                  className="arrow-back"
                  onClick={() => navigate(-1)}
                />
                <div className="cost-title-header" style={{ marginLeft: '10px' }}>
                  <div className="cost-product-name">
                    {savedProductName || stateProps?.productName || ''} - {stateProps?.tourPeriodData?.periodNight} {stateProps?.tourPeriodData?.periodDay}
                  </div>
                </div>
              </div>
            </div>

            {/* 메인 탭 버튼들 */}
            <div className="main-tab-buttons" style={{ marginBottom: '20px' }}>
              <button 
                className={`btn-tap ${mainTab === '여행도시' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('여행도시');
                  setRightPanelSubTab('여행도시');
                }}
              >
                여행도시
              </button>
              <button 
                className={`btn-tap ${mainTab === '여행루트' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('여행루트');
                  setRightPanelSubTab('여행루트');
                }}
              >
                여행루트
              </button>
              <button 
                className={`btn-tap ${mainTab === '일정표' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('일정표');
                  setRightPanelSubTab('일정');
                }}
              >
                일정표
              </button>
              <button 
                className={`btn-tap ${mainTab === '호텔' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('호텔');
                  setRightPanelSubTab('호텔');
                  setActivePhotoTab(0); // 전경 탭 활성화
                }}
              >
                호텔
              </button>
            </div>

            {/* 탭별 콘텐츠 렌더링 */}
            {mainTab === '여행도시' && (
              <>
                {/* 도시 탭 버튼들 */}
                {cities.length > 0 && (
                  <div className="city-tab-buttons-left" style={{ marginBottom: '20px' }}>
                    {cities.map((city: string) => (
                      <button
                        key={city}
                        className={`city-tab-btn-left ${selectedCity === city ? 'active' : ''}`}
                        onClick={() => setSelectedCity(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}

               

                {selectedCityInfo && (
                  <>
                   {/* imageNotice 이미지 전부 표시 */}
                   <div className="tab-preview-images">
                      {imageNotice && imageNotice.length > 0 ? (
                        imageNotice.map((img: any, index: number) => {
                          const imageName = typeof img === 'string' ? img : img.imageName;
                          const title = typeof img === 'object' && img.title ? img.title : '';
                          const isVideo = isVideoFile(imageName);
                          return (
                            <div key={`notice-${index}`} className="preview-image-item">
                              <div className="preview-image-wrapper">
                                {isVideo ? (
                                  <video
                                    className="preview-image"
                                    controls
                                    src={`${AdminURL}/images/cityimages/${imageName}`}
                                  >
                                    브라우저가 비디오 태그를 지원하지 않습니다.
                                  </video>
                                ) : (
                                  <img
                                    className="preview-image"
                                    alt={title || `소개 이미지 ${index + 1}`}
                                    src={`${AdminURL}/images/cityimages/${imageName}`}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '400px',
                          color: '#999',
                          fontSize: '16px',
                          fontWeight: 400,
                          width: '100%'
                        }}>
                          이미지가 없습니다.
                        </div>
                      )}
                    </div>
                    <div className="city-intro-section">
                      <div className="city-intro-tagline">
                        유럽의 아름다운 문화와 역사를 경험할 수 있는 최고의 여행지
                      </div>
                      <div className="city-intro-name">
                        {selectedCityInfo?.cityEn || selectedCityInfo?.cityKo || '도시명'}
                      </div>
                      <div className="city-intro-description">
                        <p>중세 시대의 건축물과 현대적인 시설이 조화롭게 어우러져 있어 방문객들에게 잊을 수 없는 추억을 선사합니다.</p>
                        <p>특히 구시가지는 유네스코 세계문화유산으로 지정되어 있어 역사적 가치가 높습니다.</p>
                        <p>다양한 문화 행사와 축제가 연중 개최되어 활기찬 분위기를 자랑합니다.</p>
                      </div>
                    </div>

                    {highlightItems.length > 0 && (
                      <div className="highlight-section">
                        <div className="section-title">핵심 포인트</div>
                        <div className="highlight-list">
                          {highlightItems.map(({ image, title, notice }, index) => (
                            <div className="highlight-item" key={`${title}-${index}`}>
                              <div className="highlight-image-wrap">
                                <img src={image} alt={title} />
                              </div>
                              <div className="highlight-item-title">{title}</div>
                              <div className="highlight-item-desc">
                                {notice || '도시의 주요 관광 명소와 문화적 가치'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {benefitItems.length > 0 && (
                      <div className={`benefit-section`}>
                        <div className="section-title">베네핏 & 포함사항</div>
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

                    {/* <div className="location-info-section">
                      <div className="section-title">위치</div>
                      <div className="location-content-wrapper">
                        <div className="location-map-placeholder">
                          <GoogleMap />
                        </div>
                      </div>
                    </div> */}

                    {selectedCityInfo.courseImage && (
                      <div className="city-basic-images">
                        <img src={`${AdminURL}/images/citymapinfo/${selectedCityInfo.courseImage}`} alt={selectedCityInfo.cityKo} />
                      </div>
                    )}

                    <ScheduleRederBox 
                      id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                      scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                      useRecoil={true}
                      productInfo={stateProps?.productInfo || stateProps}
                      cityInfoPerDay={cityInfoPerDay}
                      hotelInfoPerDay={hotelInfoPerDay}
                      onSelectedScheduleChange={(schedule, index) => {
                        setSelectedSchedule(schedule);
                        setSelectedScheduleIndex(index);
                      }}
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
              </>
            )}

            {mainTab === '여행루트' && (
              <div className="route-content">
                <img 
                  src={`${AdminURL}/images/tourmapinfo/${stateProps?.tourmapImage}`} 
                  alt="여행 루트" 
                  className="route-image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            {mainTab === '일정표' && (
              <div style={{ position: 'relative' }}>
                {showScheduleEdit ? (
                  <ScheduleRederCustom
                    id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                    productInfo={stateProps?.productInfo || stateProps}
                    scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                    useRecoil={true}
                    cityInfoPerDay={cityInfoPerDay}
                    hotelInfoPerDay={hotelInfoPerDay}
                    hideFloatingBox={false}
                  />
                ) : (
                  <ScheduleRederBox 
                    id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                    scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                    useRecoil={true}
                    productInfo={stateProps?.productInfo || stateProps}
                    cityInfoPerDay={cityInfoPerDay}
                    hotelInfoPerDay={hotelInfoPerDay}
                    onSelectedScheduleChange={(schedule, index) => {
                      setSelectedSchedule(schedule);
                      setSelectedScheduleIndex(index);
                    }}
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
            )}

            {mainTab === '호텔' && (
              <div className="tour-hotel-page-wrapper" style={{ marginTop: '0', padding: '0' }}>
                <div className="tour-hotel-container detail-open">
                  {/* 왼쪽 영역: 헤더 + 호텔 리스트만 */}
                  <div className="left-section">
                    <div className="hotel-list-wrapper">
                      {/* 호텔 사진 갤러리 및 상세 정보 */}
                      {selectedHotel ? (
                        <>
                          <div className="room-container-wrapper">
                            <div className="room-container-left">
                              {photoTabButtons.map(({ text }, index) => (
                                <button
                                  key={text}
                                  type="button"
                                  className={`roomtabsort ${activePhotoTab === index ? 'active' : ''}`}
                                  onClick={() => setActivePhotoTab(index)}
                                >
                                  {text}
                                </button>
                              ))}
                            </div>
                            <div className="room-container-right">
                              {selectedHotel.hotelRoomTypes && 
                               JSON.parse(selectedHotel.hotelRoomTypes || '[]').length > 0 ? (
                                JSON.parse(selectedHotel.hotelRoomTypes).map((room: any, index: number, arr: any[]) => (
                                  <React.Fragment key={room.roomTypeName || index}>
                                    <span className="roomtype-text">{room.roomTypeName}</span>
                                    {index < arr.length - 1 && (
                                      <span className="roomtype-separator"></span>
                                    )}
                                  </React.Fragment>
                                ))
                              ) : null}
                            </div>
                          </div>

                          {/* 객실 탭일 때는 RestHotelDetail.tsx와 동일한 구조로 표시 */}
                          {activePhotoTab === 1 ? (
                            <>
                              {/* Rooms 아이콘 */}
                              <div className="rooms-title" style={{ 
                                fontSize: '32px', 
                                fontWeight: 'bold', 
                                marginBottom: '20px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '30px'
                              }}>
                                <img src={roomIcon} alt="Rooms" style={{ width: '200px' }} />
                              </div>
                              
                              {/* 객실 타입 텍스트 표시 (클릭 가능) */}
                              {selectedHotel.hotelRoomTypes && 
                               JSON.parse(selectedHotel.hotelRoomTypes || '[]').length > 0 && (
                                <div className="room-type-tabs" style={{
                                  display: 'flex',
                                  marginBottom: '32px',
                                  flexWrap: 'wrap',
                                  paddingBottom: '16px',
                                  justifyContent: 'center'
                                }}>
                                  {JSON.parse(selectedHotel.hotelRoomTypes).map((room: any, index: number) => (
                                    <span
                                      key={room.roomTypeName || index}
                                      onClick={() => {
                                        const roomTypeName = room.roomTypeName;
                                        const ref = roomTypeRefs.current.get(roomTypeName);
                                        if (ref) {
                                          ref.scrollIntoView({ 
                                            behavior: 'smooth', 
                                            block: 'start' 
                                          });
                                        }
                                      }}
                                      style={{
                                        fontSize: '16px',
                                        fontWeight: '400',
                                        color: '#666',
                                        borderBottom: index < JSON.parse(selectedHotel.hotelRoomTypes).length - 1 ? 'none' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#333';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#666';
                                      }}
                                    >
                                      <span style={{ fontSize: '16px', fontWeight: '400', color: 'inherit', marginRight: '0' }}>{room.roomTypeName}</span>
                                      {index < JSON.parse(selectedHotel.hotelRoomTypes).length - 1 && (
                                        <span style={{ color: '#ccc', margin:'0 15px' }}>|</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* 모든 객실의 이미지들을 리스트로 표시 */}
                              <div className="room-images-grid" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '48px',
                                width: '100%'
                              }}>
                                {selectedHotel.hotelRoomTypes && 
                                 JSON.parse(selectedHotel.hotelRoomTypes || '[]').map((room: any) => {
                                  const roomImages = getImagesByRoomType(room.roomTypeName);
                                  
                                  if (roomImages.length === 0) {
                                    return null;
                                  }
                                  
                                  return (
                                    <div 
                                      key={room.roomTypeName} 
                                      ref={(el) => {
                                        if (el) {
                                          roomTypeRefs.current.set(room.roomTypeName, el);
                                        } else {
                                          roomTypeRefs.current.delete(room.roomTypeName);
                                        }
                                      }}
                                      style={{ width: '100%' }}
                                    >
                                      {/* 객실 이름 */}
                                      <div style={{
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        marginBottom: '24px',
                                        textAlign: 'center'
                                      }}>
                                        {room.roomTypeName}
                                      </div>
                                      
                                      {/* 해당 객실의 이미지들 */}
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '24px'
                                      }}>
                                        {roomImages.map((img: any, imgIndex: number) => {
                                          const isVideo = isVideoFile(img.imageName);
                                          
                                          if (isVideo) {
                                            return (
                                              <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                                <video
                                                  className="photo-main-image"
                                                  controls
                                                  src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                                  style={{ width: '100%' }}
                                                >
                                                  브라우저가 비디오 태그를 지원하지 않습니다.
                                                </video>
                                              </div>
                                            );
                                          }
                                          
                                          return (
                                            <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                              <img
                                                className="photo-main-image"
                                                alt={img.title || `${room.roomTypeName} 이미지 ${imgIndex + 1}`}
                                                src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                                style={{ width: '100%' }}
                                              />
                                              {img.notice && <div className="photo-main-notice">{img.notice}</div>}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            /* 전경 또는 부대시설 탭일 때는 기존 갤러리 형태로 표시 */
                            <div className="photo-gallery">
                              <div className="photo-main">
                                {(() => {
                                  const images = getHotelCurrentImages();
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
                                      src={MediaImage}
                                    />
                                  );
                                })()}
                              </div>

                              <div className="photo-thumbnails">
                                {getHotelCurrentImages().map((img: any, index: number) => {
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
                          )}

                          <div className="hotel-intro-section">
                            <div className="hotel-intro-rating">
                              <RatingBoard
                                ratingSize={30}
                                rating={
                                  selectedHotel && selectedHotel.hotelLevel
                                    ? Math.max(0, Math.min(5, parseInt(String(selectedHotel.hotelLevel), 10) || 0))
                                    : 0
                                }
                              />
                            </div>
                            <div className="hotel-intro-tagline">
                              프라이빗 비치와 세심한 서비스가 완성하는 품격있는 휴식
                            </div>
                            {selectedHotel.logoImage && (
                              <div className="hotel-intro-logo">
                                <img 
                                  src={`${AdminURL}/images/hotellogos/${selectedHotel.logoImage}`} 
                                  alt="호텔 로고"
                                />
                              </div>
                            )}
                            <div className="hotel-intro-entitle">
                              <p>{selectedHotel.hotelNameEn || ''}</p>
                            </div>
                            <div className="hotel-intro-description">
                              {(() => {
                                const description = selectedHotel.hotelIntro || selectedHotel.hotelNotice || '정교한 설계와 세심한 서비스는 허니문 동안 럭셔리 그 자체를 선사합니다.';
                                // 줄바꿈 문자(\n)로 분리하여 각각 <p> 태그로 렌더링
                                const lines = description.split('\n').filter((line: string) => line.trim() !== '');
                                return lines.map((line: string, index: number) => (
                                  <p key={index}>{line.trim()}</p>
                                ));
                              })()}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="empty-message">호텔을 선택하면 사진을 볼 수 있습니다.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 왼쪽 패널 하단 버튼들 */}
            <div className="left-panel-bottom-buttons">
              <button
                type="button"
                className="bottom-btn bottom-btn-edit"
                onClick={() => {
                  setShowRightPanel(true);
                  setRightPanelTopTab('수정하기');
                  setRightPanelSubTab('여행도시');
                }}
              >
                일정수정
              </button>
              {/* 플로팅 Top 버튼 */}
              <button
                type="button"
                className="floating-top-btn"
                onClick={() => {
                  const leftPanel = document.querySelector('.europe-schedule-cost-page .left-panel');
                  if (leftPanel) {
                    leftPanel.scrollTo({ top: 0, behavior: 'smooth' });
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
                    ? { ...stateProps, productName: savedProductName }
                    : stateProps;

                  // 호텔 데이터를 Recoil에 저장
                  if (selectedHotel) {
                    // 일정에서 도시별 호텔 정보 추출하여 scheduleCards 생성
                    const scheduleCards: any[] = [];
                    if (parsedProductScheduleData && Array.isArray(parsedProductScheduleData)) {
                      parsedProductScheduleData.forEach((scheduleItem: any) => {
                        if (scheduleItem.city === selectedHotel.city || scheduleItem.city === selectedHotel._cityFromSchedule) {
                          scheduleCards.push({
                            id: scheduleCards.length + 1,
                            title: selectedHotel.hotelNameKo || '',
                            nights: stateProps?.tourPeriodData?.periodNight || '1박',
                            city: scheduleItem.city || selectedHotel.city,
                            badge: '객실'
                          });
                        }
                      });
                    }

                    setSelectedHotelData({
                      hotelInfo: selectedHotel,
                      productInfo: {
                        id: stateProps?.id,
                        productName: savedProductName || stateProps?.productName,
                        scheduleSort: stateProps?.scheduleSort,
                        costType: stateProps?.costType,
                        tourPeriodData: stateProps?.tourPeriodData,
                        includeNote: stateProps?.includeNote,
                        notIncludeNote: stateProps?.notIncludeNote,
                        productScheduleData: stateProps?.productScheduleData
                      },
                      scheduleCards: scheduleCards.length > 0 ? scheduleCards : [],
                      selectedHotels: selectedHotel ? [{
                        index: 0,
                        hotelSort: '',
                        hotel: selectedHotel
                      }] : [],
                      periodText: stateProps?.tourPeriodData?.periodNight 
                        ? `${stateProps.tourPeriodData.periodNight} ${stateProps.tourPeriodData.periodDay}`
                        : '',
                      includeItems: stateProps?.includeNote 
                        ? stateProps.includeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      excludeItems: stateProps?.notIncludeNote 
                        ? stateProps.notIncludeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      travelPeriod: customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd
                        ? `${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`
                        : '',
                      reserveDate: customerInfo.reserveDate || '',
                      benefitItems: benefitItems && benefitItems.length > 0
                        ? benefitItems.map((item: any) => ({
                            title: item.title,
                            text: item.text,
                            image: item.image
                          }))
                        : [],
                      priceInfo: {
                        pricePerPerson: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) : 0,
                        totalPrice: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                        guestCount: 2
                      }
                    });
                  } else {
                    // 호텔이 선택되지 않은 경우에도 기본 데이터 저장
                    setSelectedHotelData({
                      hotelInfo: null,
                      productInfo: {
                        id: stateProps?.id,
                        productName: savedProductName || stateProps?.productName,
                        scheduleSort: stateProps?.scheduleSort,
                        costType: stateProps?.costType,
                        tourPeriodData: stateProps?.tourPeriodData,
                        includeNote: stateProps?.includeNote,
                        notIncludeNote: stateProps?.notIncludeNote,
                        productScheduleData: stateProps?.productScheduleData
                      },
                      scheduleCards: [],
                      selectedHotels: [],
                      periodText: stateProps?.tourPeriodData?.periodNight 
                        ? `${stateProps.tourPeriodData.periodNight} ${stateProps.tourPeriodData.periodDay}`
                        : '',
                      includeItems: stateProps?.includeNote 
                        ? stateProps.includeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      excludeItems: stateProps?.notIncludeNote 
                        ? stateProps.notIncludeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      travelPeriod: customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd
                        ? `${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`
                        : '',
                      reserveDate: customerInfo.reserveDate || '',
                      benefitItems: benefitItems && benefitItems.length > 0
                        ? benefitItems.map((item: any) => ({
                            title: item.title,
                            text: item.text,
                            image: item.image
                          }))
                        : [],
                      priceInfo: {
                        pricePerPerson: 0,
                        totalPrice: 0,
                        guestCount: 2
                      }
                    });
                  }

                  // 일정 데이터를 Recoil에 저장
                  const scheduleDataToSave = stateProps?.isFromMakeButton 
                    ? stateProps?.customScheduleInfo 
                    : (selectedSchedule || scheduleInfo);
                  
                  if (scheduleDataToSave) {
                    setSelectedScheduleData({
                      productInfo: updatedProductInfo,
                      selectedSchedule: scheduleDataToSave,
                      totalPrice: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                      guestCount: 2
                    });
                  } else {
                    // scheduleInfo가 없으면 상품 ID만 저장
                    setSelectedScheduleData({
                      productInfo: updatedProductInfo,
                      selectedSchedule: null,
                      totalPrice: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                      guestCount: 2
                    });
                  }

                  navigate('/counsel/europe/estimate', { state: updatedProductInfo });
                  window.scrollTo(0, 0);
                }}
              >
                예약하기
              </button>
            </div>

            <div style={{height: '100px'}}></div>
            
          </div>
        </div>

        {/* 우측 패널 */}
        {showRightPanel && (
          <div className="right-panel-wrapper">
          <div className="right-panel">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>
            
            <div className="panel-content">
              {/* 제품 정보 헤더 */}
              <div className="cost-header">
                <div className="cost-header-top">
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', flexDirection: 'column' }}>
                    <div className="cost-badge">
                      {firstCityNation || stateProps?.scheduleSort || stateProps?.costType || '패키지'}
                    </div>
                    <div className="cost-product-name">
                      {savedProductName || stateProps?.productName || ''}
                      {stateProps?.tourPeriodData?.periodNight && stateProps?.tourPeriodData?.periodDay && (
                        <span className="product-period">&nbsp;- {stateProps.tourPeriodData.periodNight} {stateProps.tourPeriodData.periodDay}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 최상단 탭: 예약하기 / 수정하기 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                marginTop: '8px',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelTopTab('예약하기');
                    setRightPanelSubTab('예약정보');
                  }}
                  style={{
                    width: '100px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid #333',
                    backgroundColor: rightPanelTopTab === '예약하기' ? '#333' : '#fff',
                    color: rightPanelTopTab === '예약하기' ? '#fff' : '#333',
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
                  onClick={() => {
                    setRightPanelTopTab('수정하기');
                    setRightPanelSubTab('여행도시');
                  }}
                  style={{
                    width: '100px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid #ddd',
                    backgroundColor: rightPanelTopTab === '수정하기' ? '#333' : '#fff',
                    color: rightPanelTopTab === '수정하기' ? '#fff' : '#333',
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

              {/* 하위 탭: 여행도시 / 여행루트 / 호텔 / 일정 (수정하기 탭일 때만 표시) */}
              {rightPanelTopTab === '수정하기' && (
                <div className="city-tab-buttons-left" style={{ marginBottom: '10px' }}>
                  {['여행도시', '여행루트', '일정', '호텔'].map((tab) => (
                    <button
                      key={tab}
                      className={`city-tab-btn-left ${rightPanelSubTab === tab ? 'active' : ''}`}
                      onClick={() => {
                        setRightPanelSubTab(tab as typeof rightPanelSubTab);
                        // 우측 패널 탭이 변경되면 좌측 패널 탭도 업데이트
                        if (tab === '여행도시') {
                          setMainTab('여행도시');
                        } else if (tab === '여행루트') {
                          setMainTab('여행루트');
                        } else if (tab === '일정') {
                          setMainTab('일정표');
                        } else if (tab === '호텔') {
                          setMainTab('호텔');
                        }
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* 탭별 컨텐츠 */}
              {rightPanelTopTab === '예약하기' && rightPanelSubTab === '예약정보' && (
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
                        {savedProductName || stateProps?.productName || '-'}
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
                        {selectedHotel?.hotelNameKo || '-'}
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
                        {selectedHotel?.lowestPrice 
                          ? `${Number(selectedHotel.lowestPrice).toLocaleString()}원`
                          : '-'}
                      </div>
                    </div>

                    {/* 총요금 */}
                    <div className="cost-hotel-card">
                      <label>총요금</label>
                      <div className="reservation-info-value">
                        {selectedHotel?.lowestPrice 
                          ? `${(Number(selectedHotel.lowestPrice) * 2).toLocaleString()}원`
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
              )}

              {rightPanelTopTab === '수정하기' && rightPanelSubTab === '여행도시' && (
                <div>
                  <div className="selected-cities-section" style={{ marginBottom: '15px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>여행 도시</h3>
                    {(cityCards.length > 0 ? cityCards : citiesWithInfo).length === 0 ? (
                      <div className="no-selected-cities" style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999',
                        border: '1px dashed #e0e0e0',
                        borderRadius: '4px',
                      }}>여행 도시가 없습니다</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {(cityCards.length > 0 ? cityCards : citiesWithInfo).map((cityInfo, index) => {
                          const cardId = cityInfo.id || index + 1;
                          const currentNights = cityCards.length > 0 
                            ? (selectedNights[cardId] || cityInfo.nights || 1)
                            : cityInfo.nights;
                          
                          return (
                            <div 
                              key={cardId} 
                              className="selected-city-card" 
                              style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '20px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '10px',
                              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                                position: 'relative',
                                opacity: draggedCardId === cardId ? 0.5 : 1,
                                transform: dragOverCardId === cardId ? 'translateY(10px)' : 'translateY(0)',
                                transition: draggedCardId === null ? 'all 0.2s' : 'none',
                                borderTop: dragOverCardId === cardId && draggedCardId !== cardId ? '3px solid #5fb7ef' : 'none',
                                cursor: 'move'
                              }}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, cardId)}
                              onDragOver={(e) => handleDragOver(e, cardId)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, cardId)}
                              onDragEnd={handleDragEnd}
                            >
                              <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span 
                                  className="city-name" 
                                  style={{ 
                                    width: '20%',
                                    fontSize: '14px', 
                                    fontWeight: 500, 
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleCityNameClick(cardId)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.8';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                  }}
                                >
                                  {cityInfo.city}
                                </span>
                                <span className="travel-period" style={{ 
                                  width: '30%', fontSize: '14px', color: '#666', flex: 1, textAlign: 'center' }}>{cityInfo.travelPeriod}</span>
                                <div style={{ width: '25%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      if (currentNights > 1) {
                                        const newNights = currentNights - 1;
                                        setSelectedNights(prev => {
                                          const newNightsState = { ...prev, [cardId]: newNights };
                                          updateProductNameFromCards(cityCards, newNightsState);
                                          return newNightsState;
                                        });
                                      }
                                    }}
                                    disabled={currentNights <= 1}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: currentNights <= 1 ? '#f5f5f5' : '#fff',
                                      color: currentNights <= 1 ? '#ccc' : '#333',
                                      fontSize: '12px',
                                      cursor: currentNights <= 1 ? 'not-allowed' : 'pointer',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: 'none'
                                    }}
                                  >-</button>
                                  <span className="nights" style={{ fontSize: '14px', fontWeight: 500, color: '#333', textAlign: 'center' }}>
                                    {currentNights}박
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newNights = currentNights + 1;
                                      setSelectedNights(prev => {
                                        const newNightsState = { ...prev, [cardId]: newNights };
                                        updateProductNameFromCards(cityCards, newNightsState);
                                        return newNightsState;
                                      });
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#fff',
                                      color: '#333',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: 'none'
                                    }}
                                  >+</button>
                                </div>
                              </div>
                              <div style={{width: '10%', display: 'flex', gap: '4px', marginLeft: '12px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm('이 도시를 삭제하시겠습니까?')) {
                                      handleDeleteCard(cardId);
                                    }
                                  }}
                                  disabled={(cityCards.length > 0 ? cityCards : citiesWithInfo).length <= 1}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid #ddd',
                                    backgroundColor: (cityCards.length > 0 ? cityCards : citiesWithInfo).length <= 1 ? '#f5f5f5' : '#fff',
                                    color: (cityCards.length > 0 ? cityCards : citiesWithInfo).length <= 1 ? '#ccc' : '#e74c3c',
                                    fontSize: '12px',
                                    cursor: (cityCards.length > 0 ? cityCards : citiesWithInfo).length <= 1 ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '28px',
                                    height: '24px'
                                  }}
                                  onMouseEnter={(e) => {
                                    if ((cityCards.length > 0 ? cityCards : citiesWithInfo).length > 1) {
                                      e.currentTarget.style.backgroundColor = '#fee';
                                      e.currentTarget.style.borderColor = '#e74c3c';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if ((cityCards.length > 0 ? cityCards : citiesWithInfo).length > 1) {
                                      e.currentTarget.style.backgroundColor = '#fff';
                                      e.currentTarget.style.borderColor = '#ddd';
                                    }
                                  }}
                                  title="삭제"
                                >
                                  <IoMdClose />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* 도시 추가 버튼 */}
                  {cityCards.length > 0 && (
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                        <button
                          type="button"
                          onClick={handleAddCity}
                          disabled={isAddingCity}
                          style={{
                            padding: '5px 15px',
                            border: '1px solid #333',
                            backgroundColor: isAddingCity ? '#f5f5f5' : '#fff',
                            color: isAddingCity ? '#999' : '#333',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: isAddingCity ? 'not-allowed' : 'pointer',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: isAddingCity ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isAddingCity) {
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isAddingCity) {
                              e.currentTarget.style.backgroundColor = '#fff';
                            }
                          }}
                        >
                          {isAddingCity ? (
                            <>
                              <span className="city-add-loading-spinner"></span>
                              추가 중...
                            </>
                          ) : (
                            '+ 도시 추가'
                          )}
                        </button>
                      </div>
                    )}
                </div>
              )}


              {rightPanelTopTab === '수정하기' && rightPanelSubTab === '여행루트' && (
                <div >
                  <div className="selected-cities-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>여행 루트</h3>
                    {(() => {
                      if (!stateProps?.productScheduleData) {
                        return (
                          <div className="no-selected-cities" style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#999',
                            border: '1px dashed #e0e0e0',
                            borderRadius: '4px'
                          }}>여행 도시가 없습니다</div>
                        );
                      }
                      try {
                        const scheduleData = JSON.parse(stateProps.productScheduleData);
                        if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
                          return (
                            <div className="no-selected-cities" style={{
                              padding: '40px',
                              textAlign: 'center',
                              color: '#999',
                              border: '1px dashed #e0e0e0',
                              borderRadius: '4px'
                            }}>여행 도시가 없습니다</div>
                          );
                        }

                        // 시작 날짜 계산
                        let startDate: Date | null = null;
                        if (customerInfo.travelPeriodStart) {
                          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                          if (dateRegex.test(customerInfo.travelPeriodStart.trim())) {
                            startDate = new Date(customerInfo.travelPeriodStart.trim());
                          }
                        }
                        
                        if (!startDate) {
                          startDate = new Date();
                        }

                        let currentDate = new Date(startDate);

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {scheduleData.map((item: any, index: number) => {
                              const city = item.city || '';
                              const dayNight = item.dayNight || '';
                              const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
                              
                              const arrivalDate = new Date(currentDate);
                              const departureDate = new Date(currentDate);
                              
                              if (nights > 0) {
                                departureDate.setDate(departureDate.getDate() + nights);
                              }
                              
                              const formatDate = (date: Date) => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                                const weekday = weekdays[date.getDay()];
                                return `${year}-${month}-${day}(${weekday})`;
                              };
                              
                              currentDate = new Date(departureDate);
                              
                              const arrivalTime = item.arrivalTime || (index === 0 ? '17:00' : '11:00');
                              const departureTime = item.departureTime || '09:00';
                              
                              // 이동 수단
                              const transportType = item.transportType || item.traffic || (index < scheduleData.length - 1 ? ['버스', '국내선', '기차'][index % 3] : '');
                              const transportIcon = transportType === '버스' ? '🚌' : transportType === '국내선' ? '✈️' : transportType === '기차' ? '🚂' : '';

                              return (
                                <React.Fragment key={index}>
                                  <div className="selected-city-card" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px 20px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    marginBottom: index < scheduleData.length - 1 ? '0' : '0'
                                  }}>
                                    <span className="city-name" style={{ fontSize: '14px', fontWeight: 500, minWidth: '80px' }}>{city}</span>
                                    <span className="nights" style={{ fontSize: '14px', fontWeight: 500, color: '#333', minWidth: '40px' }}>{nights}박</span>
                                    <span className="arrival-time" style={{ fontSize: '14px', color: '#666', minWidth: '120px' }}>{formatDate(arrivalDate)} {arrivalTime}</span>
                                    <span className="departure-time" style={{ fontSize: '14px', color: '#666', minWidth: '120px', textAlign: 'right' }}>{formatDate(departureDate)} {departureTime}</span>
                                  </div>
                                  {index < scheduleData.length - 1 && (
                                    <div className="transport-connector" style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      margin: '12px 0',
                                      padding: '0 24px'
                                    }}>
                                      <div style={{
                                        flex: 1,
                                        height: 0,
                                        borderTop: '2px dashed #ccc'
                                      }}></div>
                                      <div style={{
                                        fontSize: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '44px',
                                        height: '44px',
                                        backgroundColor: '#fff',
                                        borderRadius: '50%',
                                        border: '1px solid #ddd',
                                        flexShrink: 0
                                      }}>{transportIcon}</div>
                                      <div style={{
                                        fontSize: '13px',
                                        color: '#333',
                                        padding: '6px 12px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '8px',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 400
                                      }}>{transportType}</div>
                                      <div style={{
                                        flex: 1,
                                        height: 0,
                                        borderTop: '2px dashed #ccc'
                                      }}></div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        );
                      } catch (e) {
                        console.error('일정 데이터 파싱 오류:', e);
                        return (
                          <div className="no-selected-cities" style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#999',
                            border: '1px dashed #e0e0e0',
                            borderRadius: '4px'
                          }}>여행 도시가 없습니다</div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {rightPanelTopTab === '수정하기' && rightPanelSubTab === '일정' && (
                <>
                  {/* 도시 탭 버튼들 */}
                  {cities.length > 0 && (
                    <div className="city-tab-buttons" >
                      {cities.map((city: string) => (
                        <button
                          key={city}
                          className={`city-tab-btn ${selectedCity === city ? 'active' : ''}`}
                          onClick={() => setSelectedCity(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 상세일정 그리드 */}
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
                </>
              )}


              {rightPanelTopTab === '수정하기' && rightPanelSubTab === '호텔' && (
                <div className="tour-hotel-page-wrapper">
                  <div className="tour-hotel-container detail-open">
                    {/* 왼쪽 영역: 헤더 + 호텔 리스트만 */}
                    <div className="left-section">
                      <div className="hotel-list-wrapper">

                        {!showPhotoGallery ? (
                          <>
                            {/* 검색 영역 */}
                            <div className="search-section">
                              <div className="search-input-wrapper">
                                <img className="search-icon" alt="Search" src={SearchIcon} />
                                <input type="text" className="search-input" placeholder="Search" />
                                <div className="search-divider" />
                              </div>
                            </div>

                            {/* 지역 필터 탭 - 일정에서 가져온 도시 기준 */}
                            <div className="region-tabs">
                              {hotelCities.map((city) => (
                                <div
                                  key={city}
                                  className={`region-tab ${activeHotelCity === city ? 'active' : ''}`}
                                  onClick={() => setActiveHotelCity(city)}
                                >
                                  {city}
                                </div>
                              ))}
                            </div>

                            {/* 각 도시별 현재 선택한 호텔 표시 */}
                            {hotelInfoPerDay && hotelInfoPerDay.length > 0 && hotelCities.length > 0 && (
                              <div style={{
                                marginBottom: '20px',
                                padding: '16px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                              }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: '#333',
                                  marginBottom: '12px'
                                }}>
                                  현재 선택한 호텔
                                </div>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px'
                                }}>
                                  {hotelCities.map((city) => {
                                    // 해당 도시의 첫 번째 호텔 찾기
                                    const cityHotels = hotels.filter((hotel: any) =>
                                      (hotel.city === city || hotel._cityFromSchedule === city)
                                    );
                                    const firstHotel = cityHotels.length > 0 ? cityHotels[0] : null;
                                    
                                    // hotelInfoPerDay에서 해당 도시의 호텔 정보 찾기
                                    const cityInfo = cityInfoPerDay?.find((info: { dayIndex: number; cityName: string }) => info.cityName === city);
                                    const hotelInfo = cityInfo ? hotelInfoPerDay.find((info: { dayIndex: number; hotelName: string; hotelLevel: string }) => info.dayIndex === cityInfo.dayIndex) : null;
                                    
                                    const displayHotel = hotelInfo ? 
                                      hotels.find((h: any) => h.hotelNameKo === hotelInfo.hotelName) : 
                                      firstHotel;

                                    if (!displayHotel) return null;

                                    return (
                                      <div key={city} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        backgroundColor: '#fff',
                                        borderRadius: '6px',
                                        border: '1px solid #e0e0e0'
                                      }}>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: 500,
                                          color: '#666',
                                          minWidth: '60px'
                                        }}>
                                          {city}
                                        </div>
                                        <div style={{
                                          flex: 1,
                                          fontSize: '14px',
                                          fontWeight: 500,
                                          color: '#333'
                                        }}>
                                          {displayHotel.hotelNameKo || '-'}
                                        </div>
                                        {displayHotel.hotelLevel && (
                                          <div style={{
                                            display: 'flex',
                                            gap: '2px'
                                          }}>
                                            {Array.from({ length: parseInt(displayHotel.hotelLevel) || 0 }).map((_, i) => (
                                              <img
                                                key={i}
                                                src={StarIcon}
                                                alt="Star"
                                                style={{
                                                  width: '14px',
                                                  height: '14px'
                                                }}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* 호텔 카드 리스트 */}
                            <div className="hotel-cards-list">
                              {hotelLoading ? (
                                <div className="loading-message">로딩 중...</div>
                              ) : (
                                ((): JSX.Element => {
                                  const filteredHotels =
                                    activeHotelCity
                                      ? hotels.filter(
                                          (hotel: any) =>
                                            hotel.city === activeHotelCity ||
                                            hotel._cityFromSchedule === activeHotelCity
                                        )
                                      : hotels;

                                  if (!filteredHotels || filteredHotels.length === 0) {
                                    return <div className="empty-message">호텔이 없습니다.</div>;
                                  }

                                  return (
                                    <>
                                      {filteredHotels.map((hotel: any, index: number) => {
                                        // 메인 이미지 (전경)
                                        let mainImage: string | null = null;
                                        if (hotel.imageNamesAllView) {
                                          try {
                                            const imageCopy = JSON.parse(hotel.imageNamesAllView);
                                            mainImage = `${AdminURL}/images/hotelimages/${imageCopy[0]?.imageName || ''}`;
                                          } catch (e) {
                                            console.error('투어 호텔 이미지 파싱 오류:', e);
                                          }
                                        }

                                        // 별점
                                        const levelNum =
                                          hotel.hotelLevel && !isNaN(parseInt(hotel.hotelLevel, 10))
                                            ? parseInt(hotel.hotelLevel, 10)
                                            : 4;

                                        const isSelected =
                                          selectedHotel && selectedHotel.id === hotel.id;

                                        // 가격 텍스트 (있으면 사용, 없으면 기본 문구)
                                        const priceText = hotel.lowestPrice
                                          ? `${Number(hotel.lowestPrice).toLocaleString()}원~`
                                          : '문의요청';

                                        return (
                                          <div
                                            key={hotel.id}
                                            className={`hotel-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => {
                                              setSelectedHotel(hotel);
                                              setRightPanelSubTab('호텔');
                                              setActivePhotoTab(0); // 전경 탭 활성화
                                            }}
                                          >
                                            <img
                                              className="hotel-image"
                                              alt={hotel.hotelNameKo}
                                              src={mainImage || HotelImage1}
                                            />
                                            
                                            <div className="hotel-card-content">
                                              <h3 className="hotel-title">{hotel.hotelNameKo}</h3>
                                              <div className="hotel-info">
                                                <div className="hotel-location">
                                                  <span className="location-text">
                                                    {(hotel.nation || hotel._nationFromSchedule || '')}
                                                  </span>
                                                  <img
                                                    className="location-icon"
                                                    alt="Location"
                                                    src={LocationIcon}
                                                  />
                                                  <span className="location-text">
                                                    {hotel.city}
                                                  </span>
                                                </div>
                                                <div className="hotel-rating">
                                                  {Array.from({ length: levelNum }).map((_, i) => (
                                                    <img
                                                      key={i}
                                                      className="star-icon"
                                                      alt="Star"
                                                      src={StarIcon}
                                                    />
                                                  ))}
                                                </div>
                                              </div>

                                              <p className="hotel-description">
                                                {hotel.hotelNameEn ||
                                                  ''}
                                              </p>

                                            </div>
                                          </div>
                                        );
                                      })}
                                    </>
                                  );
                                })()
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* 호텔 사진 갤러리 */}
                            {selectedHotel ? (
                              <>
                                <div className="room-container-wrapper">
                                  <div className="room-container-left">
                                    {photoTabButtons.map(({ text }, index) => (
                                      <button
                                        key={text}
                                        type="button"
                                        className={`roomtabsort ${activePhotoTab === index ? 'active' : ''}`}
                                        onClick={() => setActivePhotoTab(index)}
                                      >
                                        {text}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="room-container-right">
                                    {selectedHotel.hotelRoomTypes && 
                                     JSON.parse(selectedHotel.hotelRoomTypes || '[]').length > 0 ? (
                                      JSON.parse(selectedHotel.hotelRoomTypes).map((room: any, index: number, arr: any[]) => (
                                        <React.Fragment key={room.roomTypeName || index}>
                                          <span className="roomtype-text">{room.roomTypeName}</span>
                                          {index < arr.length - 1 && (
                                            <span className="roomtype-separator"></span>
                                          )}
                                        </React.Fragment>
                                      ))
                                    ) : null}
                                  </div>
                                </div>

                                <div className="photo-gallery">
                                  <div className="photo-main">
                                    {(() => {
                                      const images = getHotelCurrentImages();
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
                                          src={MediaImage}
                                        />
                                      );
                                    })()}
                                  </div>

                                  <div className="photo-thumbnails">
                                    {getHotelCurrentImages().map((img: any, index: number) => {
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
                              </>
                            ) : (
                              <div className="empty-message">호텔을 선택하면 사진을 볼 수 있습니다.</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* 가격 정보 */}
            {/* <div className="summary-footer">
              <div className="summary-footer-top">선택된 세부일정 제목</div>
              <div className="summary-footer-bottom">
                <div className="summary-footer-left">
                  <div className="summary-footer-field">날짜</div>
                  <div className="summary-footer-field">선택상품</div>
                  <div className="summary-footer-field price-field">
                    {selectedHotel?.lowestPrice 
                      ? `￦ ${Number(selectedHotel.lowestPrice).toLocaleString()} /1인`
                      : '요금 문의'}
                  </div>
                  <div className="summary-footer-field summary-footer-field-counter">
                    <button className="summary-counter-btn">-</button>
                    <span>2명</span>
                    <button className="summary-counter-btn">+</button>
                  </div>
                </div>
                <div className="summary-footer-right">
                  <div className="summary-total-label">총요금</div>
                  <div className="summary-total-price">
                    {selectedHotel?.lowestPrice 
                      ? `￦${(Number(selectedHotel.lowestPrice) * 2).toLocaleString()}`
                      : '요금 문의'}
                  </div>
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
                    value={customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd
                      ? `${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`
                      : ''}
                    readOnly
                  />
                  <span className="cost-price-calendar-icon">📅</span>
                </div>
              </div>
              <div className="cost-price-row">
                <div className="cost-price-label">
                  {selectedHotel?.lowestPrice && Number(selectedHotel.lowestPrice) > 0 ? (
                    `${Number(selectedHotel.lowestPrice).toLocaleString()}원`
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>요금이 없습니다</span>
                  )}
                </div>
                {selectedHotel?.lowestPrice && Number(selectedHotel.lowestPrice) > 0 && (
                  <div className="cost-price-unit">/1인</div>
                )}
              </div>
              <div className="cost-price-row">
                <div className="cost-price-label">총요금</div>
                <div className="cost-price-total">
                  {selectedHotel?.lowestPrice && Number(selectedHotel.lowestPrice) > 0 ? (
                    `₩${(Number(selectedHotel.lowestPrice) * 2).toLocaleString()}`
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>요금이 없습니다</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 하단 버튼 */}
            <div className="cost-schedule-btn-wrapper">
              <button className="cost-schedule-btn cost-schedule-btn-prev"
                onClick={() => {
                  navigate(-1);
                  window.scrollTo(0, 0);
                }}
              >이전</button>
              {rightPanelTopTab === '수정하기' && (() => {
                const tabs = ['여행도시', '여행루트', '호텔', '일정'];
                const currentIndex = tabs.indexOf(rightPanelSubTab);
                const nextIndex = currentIndex + 1;
                const hasNext = nextIndex < tabs.length;
                const nextTab = hasNext ? tabs[nextIndex] : null;
                
                const getButtonText = () => {
                  switch (rightPanelSubTab) {
                    case '여행도시':
                      return '여행루트보기';
                    case '여행루트':
                      return '호텔보기';
                    case '호텔':
                      return '일정보기';
                    case '일정':
                      return '';
                    default:
                      return '';
                  }
                };

                const handleNextTab = () => {
                  if (!nextTab) return;
                  
                  setRightPanelSubTab(nextTab as typeof rightPanelSubTab);
                  
                  // 우측 패널 탭이 변경되면 좌측 패널 탭도 업데이트
                  if (nextTab === '여행도시') {
                    setMainTab('여행도시');
                  } else if (nextTab === '여행루트') {
                    setMainTab('여행루트');
                  } else if (nextTab === '일정') {
                    setMainTab('일정표');
                  } else if (nextTab === '호텔') {
                    setMainTab('호텔');
                  }
                };

                if (!hasNext) return null;

                return (
                  <button 
                    className="cost-schedule-btn cost-schedule-btn-prev"
                    onClick={handleNextTab}
                  >
                    {getButtonText()}
                  </button>
                );
              })()}
              <button className="cost-schedule-btn cost-schedule-btn-next"
                onClick={() => {
                  // productInfo에 상품명 업데이트 (savedProductName이 있으면 사용)
                  const updatedProductInfo = savedProductName 
                    ? { ...stateProps, productName: savedProductName }
                    : stateProps;

                  // 호텔 데이터를 Recoil에 저장
                  if (selectedHotel) {
                    // 일정에서 도시별 호텔 정보 추출하여 scheduleCards 생성
                    const scheduleCards: any[] = [];
                    if (parsedProductScheduleData && Array.isArray(parsedProductScheduleData)) {
                      parsedProductScheduleData.forEach((scheduleItem: any) => {
                        if (scheduleItem.city === selectedHotel.city || scheduleItem.city === selectedHotel._cityFromSchedule) {
                          scheduleCards.push({
                            id: scheduleCards.length + 1,
                            title: selectedHotel.hotelNameKo || '',
                            nights: stateProps?.tourPeriodData?.periodNight || '1박',
                            city: scheduleItem.city || selectedHotel.city,
                            badge: '객실'
                          });
                        }
                      });
                    }

                    setSelectedHotelData({
                      hotelInfo: selectedHotel,
                      productInfo: {
                        id: stateProps?.id,
                        productName: savedProductName || stateProps?.productName,
                        scheduleSort: stateProps?.scheduleSort,
                        costType: stateProps?.costType,
                        tourPeriodData: stateProps?.tourPeriodData,
                        includeNote: stateProps?.includeNote,
                        notIncludeNote: stateProps?.notIncludeNote,
                        productScheduleData: stateProps?.productScheduleData
                      },
                      scheduleCards: scheduleCards.length > 0 ? scheduleCards : [],
                      selectedHotels: selectedHotel ? [{
                        index: 0,
                        hotelSort: '',
                        hotel: selectedHotel
                      }] : [],
                      periodText: stateProps?.tourPeriodData?.periodNight 
                        ? `${stateProps.tourPeriodData.periodNight} ${stateProps.tourPeriodData.periodDay}`
                        : '',
                      includeItems: stateProps?.includeNote 
                        ? stateProps.includeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      excludeItems: stateProps?.notIncludeNote 
                        ? stateProps.notIncludeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      travelPeriod: customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd
                        ? `${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`
                        : '',
                      reserveDate: customerInfo.reserveDate || '',
                      benefitItems: benefitItems && benefitItems.length > 0
                        ? benefitItems.map((item: any) => ({
                            title: item.title,
                            text: item.text,
                            image: item.image
                          }))
                        : [],
                      priceInfo: {
                        pricePerPerson: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) : 0,
                        totalPrice: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                        guestCount: 2
                      }
                    });
                  } else {
                    // 호텔이 선택되지 않은 경우에도 기본 데이터 저장
                    setSelectedHotelData({
                      hotelInfo: null,
                      productInfo: {
                        id: stateProps?.id,
                        productName: savedProductName || stateProps?.productName,
                        scheduleSort: stateProps?.scheduleSort,
                        costType: stateProps?.costType,
                        tourPeriodData: stateProps?.tourPeriodData,
                        includeNote: stateProps?.includeNote,
                        notIncludeNote: stateProps?.notIncludeNote,
                        productScheduleData: stateProps?.productScheduleData
                      },
                      scheduleCards: [],
                      selectedHotels: [],
                      periodText: stateProps?.tourPeriodData?.periodNight 
                        ? `${stateProps.tourPeriodData.periodNight} ${stateProps.tourPeriodData.periodDay}`
                        : '',
                      includeItems: stateProps?.includeNote 
                        ? stateProps.includeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      excludeItems: stateProps?.notIncludeNote 
                        ? stateProps.notIncludeNote.split('\n').filter((item: string) => item.trim())
                        : [],
                      travelPeriod: customerInfo.travelPeriodStart && customerInfo.travelPeriodEnd
                        ? `${customerInfo.travelPeriodStart} ~ ${customerInfo.travelPeriodEnd}`
                        : '',
                      reserveDate: customerInfo.reserveDate || '',
                      benefitItems: benefitItems && benefitItems.length > 0
                        ? benefitItems.map((item: any) => ({
                            title: item.title,
                            text: item.text,
                            image: item.image
                          }))
                        : [],
                      priceInfo: {
                        pricePerPerson: 0,
                        totalPrice: 0,
                        guestCount: 2
                      }
                    });
                  }

                  // 일정 데이터를 Recoil에 저장
                  const scheduleDataToSave = stateProps?.isFromMakeButton 
                    ? stateProps?.customScheduleInfo 
                    : (selectedSchedule || scheduleInfo);
                  
                  if (scheduleDataToSave) {
                    setSelectedScheduleData({
                      productInfo: updatedProductInfo,
                      selectedSchedule: scheduleDataToSave,
                      totalPrice: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                      guestCount: 2
                    });
                  } else {
                    // scheduleInfo가 없으면 상품 ID만 저장
                    setSelectedScheduleData({
                      productInfo: updatedProductInfo,
                      selectedSchedule: null,
                      totalPrice: selectedHotel?.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                      guestCount: 2
                    });
                  }

                  navigate('/counsel/europe/estimate', { state: updatedProductInfo });
                  window.scrollTo(0, 0);
                }}
              >예약하기</button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* 도시 선택 모달 */}
      {showCitySelectModal && selectedCardIndex !== null && (
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
          setShowCitySelectModal(false);
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
                setShowCitySelectModal(false);
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
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              gap: '20px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000'
              }}>
                도시 선택
              </h2>
              {nations.length > 0 && (
                <select
                  value={selectedNationFilter}
                  onChange={(e) => handleNationFilterChange(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    color: '#333',
                    cursor: 'pointer',
                    minWidth: '150px',
                    outline: 'none'
                  }}
                >
                  <option value="">전체 국가</option>
                  {nations.map((nation: any) => (
                    <option key={nation.id} value={nation.name}>
                      {nation.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {(() => {
              const card = cityCards.find(c => c.id === selectedCardIndex);
              if (!card) return null;
              
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {availableCities.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      선택 가능한 도시가 없습니다.
                    </div>
                  ) : (
                    availableCities.map((city) => {
                      // 도시 이미지 가져오기 (cityInfoMap에서)
                      let cityImage = '';
                      const cityInfo = cityInfoMap[city.cityKo];
                      if (cityInfo && cityInfo.imageNamesNotice) {
                        try {
                          const images = JSON.parse(cityInfo.imageNamesNotice);
                          if (images && images.length > 0) {
                            const imageName = typeof images[0] === 'string' ? images[0] : images[0].imageName;
                            if (imageName) {
                              cityImage = `${AdminURL}/images/cityimages/${imageName}`;
                            }
                          }
                        } catch (e) {
                          console.error('Failed to parse city images:', e);
                        }
                      }
                      
                      // 현재 선택된 도시인지 확인
                      const isSelected = card.city === city.cityKo;
                      
                      return (
                        <div
                          key={city.cityKo}
                          style={{
                            display: 'flex',
                            gap: '20px',
                            padding: '20px',
                            border: isSelected ? '2px solid #5fb7ef' : '1px solid #e0e0e0',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? '#f0f8ff' : '#fff',
                            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.15)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                          onClick={() => handleCitySelect(city)}
                        >
                          {/* 도시 이미지 */}
                          <div style={{
                            width: '200px',
                            height: '150px',
                            flexShrink: 0,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5'
                          }}>
                            {cityImage ? (
                              <img 
                                src={cityImage} 
                                alt={city.cityKo || '도시 이미지'}
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
                          
                          {/* 도시 정보 */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            justifyContent: 'center'
                          }}>
                            {/* 도시명 */}
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: '20px',
                              color: '#000',
                              lineHeight: '1.4'
                            }}>
                              {city.cityKo || '도시명'}
                            </div>
                            
                            {/* 영문명 */}
                            {city.cityEn && (
                              <div style={{
                                fontSize: '14px',
                                color: '#666',
                                lineHeight: '1.4'
                              }}>
                                {city.cityEn}
                              </div>
                            )}
                            
                            {/* 국가 */}
                            {city.nation && (
                              <div style={{
                                fontSize: '14px',
                                color: '#999',
                                lineHeight: '1.4'
                              }}>
                                {city.nation}
                              </div>
                            )}
                          </div>
                          
                          {/* 선택 버튼 */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCitySelect(city);
                              }}
                              style={{
                                padding: '12px 24px',
                                backgroundColor: isSelected ? '#5fb7ef' : '#000',
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
                                e.currentTarget.style.backgroundColor = isSelected ? '#4aa3d9' : '#333';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isSelected ? '#5fb7ef' : '#000';
                              }}
                            >
                              {isSelected ? '선택됨' : '선택하기'}
                            </button>
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
      </div>
    </div>
  );
};
