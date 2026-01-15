import React, { useState, useEffect, useMemo, useRef } from 'react';
import './EuropeScheduleCost.scss';
import '../../backup/3hotel/EuropeHotelPage.scss';
import '../2city/EuropeCityDetail.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImLocation } from 'react-icons/im';
import { IoIosArrowBack, IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
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
  const selectedScheduleProduct = useRecoilValue(recoilSelectedScheduleProduct);
  const hotelListData = useRecoilValue(recoilHotelListData);
  const setHotelListData = useSetRecoilState(recoilHotelListData);
  const cityCart = useRecoilValue(recoilCityCart);
  
  // stateProps는 location.state가 있으면 사용하고, 없으면 Recoil의 selectedScheduleProduct 사용
  const stateProps = location.state || selectedScheduleProduct;
  
  const [mainTab, setMainTab] = useState<string>('여행도시');
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [summaryMainTab, setSummaryMainTab] = React.useState<'상세일정' | '항공' | '식사' | '계약특전'>('상세일정');
  const [summarySubTab, setSummarySubTab] = React.useState<'전체' | '호텔베네핏' | '익스커션' | '강습/클래스' | '스파마사지' | '식사/다이닝' | '바/클럽' | '스냅촬영' | '차량/가이드' | '편의사항' | '기타'>('전체');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleDetail, setScheduleDetail] = useState<any>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);
  const [cityInfoMap, setCityInfoMap] = useState<Record<string, any>>({});
  const [loadingCityInfo, setLoadingCityInfo] = useState<boolean>(false);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  
  // 도시 이미지 탭 관련 상태
  const [cityImageTab, setCityImageTab] = useState<number>(0); // 0: 소개, 1: 가이드투어, 2: 입장/체험, 3: 경기/공연, 4: 레스토랑/카페
  const [imageNotice, setImageNotice] = useState<any[]>([]); // 소개
  const [imageGuide, setImageGuide] = useState<any[]>([]); // 가이드투어
  const [imageEnt, setImageEnt] = useState<any[]>([]); // 입장/체험
  const [imageEvent, setImageEvent] = useState<any[]>([]); // 경기/공연
  const [imageCafe, setImageCafe] = useState<any[]>([]); // 레스토랑/카페
  
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
  
  // 플로팅 박스용 상태
  const [expandedLocationDays, setExpandedLocationDays] = React.useState<Set<number>>(new Set());
  
  // 도시 편집 관련 상태
  const [isEditingPeriod, setIsEditingPeriod] = React.useState<boolean>(false);
  const [cityCards, setCityCards] = React.useState<Array<{ id: number; city: string; travelPeriod: string; nights: number }>>([]);
  const [selectedNights, setSelectedNights] = React.useState<{ [key: number]: number }>({});

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
  
  // 필터링된 상세일정 리스트
  const filteredScheduleDetailList = React.useMemo(() => {
    if (summarySubTab === '전체') {
      return scheduleDetailList;
    }
    if (summarySubTab === '기타') {
      const definedTabs = ['호텔베네핏', '익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
      return scheduleDetailList.filter((item: any) => !definedTabs.includes(item.sort));
    }
    return scheduleDetailList.filter((item: any) => item.sort === summarySubTab);
  }, [scheduleDetailList, summarySubTab]);
  
  // productScheduleData에서 도시 목록 추출 (Recoil의 cityCart 우선 사용)
  const cities = React.useMemo(() => {
    // Recoil의 cityCart에서 도시 목록 추출 (우선순위 1)
    if (cityCart && cityCart.length > 0) {
      const cityList = cityCart
        .map((item) => item.cityKo)
        .filter((city: string) => city && city.trim() !== '');
      if (cityList.length > 0) {
        return Array.from(new Set(cityList));
      }
    }
    
    // productScheduleData가 있으면 사용 (우선순위 2)
    if (stateProps?.productScheduleData) {
      try {
        const scheduleData = JSON.parse(stateProps.productScheduleData);
        if (Array.isArray(scheduleData)) {
          const cityList = scheduleData
            .map((item: any) => item.city)
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
  }, [cityCart, stateProps?.productScheduleData, stateProps?.selectedCities, stateProps?.cityCart]);

  // productScheduleData에서 일차별 도시 정보 추출
  const cityInfoPerDay = React.useMemo(() => {
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
  }, [stateProps?.cityInfoPerDay, stateProps?.productScheduleData]);

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
  }, [stateProps?.productScheduleData, customerInfo.travelPeriodStart]);

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
    if (cityCards.length === 0) return;

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

    const newCard = {
      id: Math.max(...cityCards.map(c => c.id), 0) + 1,
      city: '도시 선택 필요',
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
    
    updateProductNameFromCards(updatedCards, { ...selectedNights, [newCard.id]: 1 });
  }, [cityCards, selectedNights, customerInfo.travelPeriodStart, updateProductNameFromCards]);

  // 각 도시 정보 가져오기
  const fetchCityInfo = async (cityName: string) => {
    try {
      const response = await axios.get(`${AdminURL}/ceylontour/getcityinfobycity/${cityName}`);
      if (response.data && response.data !== false && response.data.length > 0) {
        // 첫 번째 항목을 도시 정보로 사용
        console.log('response.data[0]', response.data[0]);
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
    } else {
      setImageNotice([]);
      setImageGuide([]);
      setImageEnt([]);
      setImageEvent([]);
      setImageCafe([]);
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
    if (mainTab === '일정표') {
      // 일정표 탭일 때만 Recoil에 저장
      if (stateProps?.isFromMakeButton && stateProps?.customScheduleInfo) {
        setScheduleInfo(stateProps.customScheduleInfo);
      } else if (scheduleProductId) {
        // scheduleProductId가 있으면 나중에 ScheduleRederBox에서 로드될 데이터를 기다림
        // 일단 null로 설정 (ScheduleRederBox에서 로드 후 업데이트)
        setScheduleInfo(null);
      }
    }
  }, [mainTab, stateProps?.isFromMakeButton, stateProps?.customScheduleInfo, setScheduleInfo, scheduleProductId]);

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

  const highlightItems = [
    { image: rectangle76, title: '주요 명소' },
    { image: rectangle78, title: '문화 유산' },
    { image: rectangle76, title: '맛집 추천' },
    { image: rectangle78, title: '쇼핑 명소' },
    { image: rectangle76, title: '야경 명소' },
  ];

  const benefitItems = [
    {
      title: '주요 명소',
      text: '도시의 대표적인 관광 명소와 역사적 장소',
      image: rectangle76,
    },
    {
      title: '문화 유산',
      text: '유네스코 세계문화유산과 박물관',
      image: rectangle78,
    },
    {
      title: '맛집 추천',
      text: '현지 맛집과 미슐랭 레스토랑',
      image: rectangle76,
    },
    {
      title: '쇼핑 명소',
      text: '명품 쇼핑몰과 현지 시장',
      image: rectangle619,
    },
  ];

  return (
    <div className="europe-schedule-cost-page">
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
            <div className="panel-header">
              <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <h2>{savedProductName || stateProps?.productName || ''} - {stateProps?.tourPeriodData?.periodNight} {stateProps?.tourPeriodData?.periodDay}</h2>
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
                className={`btn-tap ${mainTab === '호텔' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('호텔');
                  setRightPanelSubTab('호텔');
                }}
              >
                호텔
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

                    <div className="highlight-section">
                      <div className="section-title">핵심 포인트</div>
                      <div className="highlight-list">
                        {highlightItems.map(({ image, title }) => (
                          <div className="highlight-item" key={title}>
                            <div className="highlight-image-wrap">
                              <img src={image} alt={title} />
                            </div>
                            <div className="highlight-item-title">{title}</div>
                            <div className="highlight-item-desc">
                              도시의 주요 관광 명소와 문화적 가치
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`benefit-section`}>
                      <div className="section-title">베네핏 & 포함사항</div>
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

                    <div className="location-info-section">
                      <div className="section-title">위치</div>
                      <div className="location-content-wrapper">
                        <div className="location-map-placeholder">
                          <GoogleMap />
                        </div>
                      </div>
                    </div>

                    {selectedCityInfo.courseImage && (
                      <div className="city-basic-images">
                        <img src={`${AdminURL}/images/citymapinfo/${selectedCityInfo.courseImage}`} alt={selectedCityInfo.cityKo} />
                      </div>
                    )}

                    <ScheduleRederBox 
                      id={stateProps?.isFromMakeButton ? undefined : scheduleProductId}
                      scheduleInfo={stateProps?.isFromMakeButton ? stateProps?.customScheduleInfo : undefined}
                      useRecoil={true}
                      onSelectedScheduleChange={(schedule, index) => {
                        setSelectedSchedule(schedule);
                        setSelectedScheduleIndex(index);
                      }}
                    />

                   
                  </>
                )}

                {/* 왼쪽 패널 하단 버튼들 */}
                <div className="left-panel-bottom-buttons">
                  <button
                    type="button"
                    className="bottom-btn bottom-btn-estimate"
                    onClick={() => {
                      setShowRightPanel(true);
                      setRightPanelTopTab('예약하기');
                    }}
                  >
                    견적보기
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
                    className="bottom-btn bottom-btn-edit"
                    onClick={() => {
                      setShowRightPanel(true);
                      setRightPanelTopTab('수정하기');
                    }}
                  >
                    수정
                  </button>
                </div>

                <div style={{height: '100px'}}></div>
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
              <div style={{ marginTop: '20px', position: 'relative' }}>
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
                      {/* 헤더 */}
                      <div className="hotel-header">
                        <h1 className="element">{savedProductName || stateProps?.productName || ''} &nbsp;&nbsp; {stateProps?.tourPeriodData?.periodNight} {stateProps?.tourPeriodData?.periodDay}</h1>
                      </div>

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
                                          }}
                                        >
                                          <img
                                            className="hotel-image"
                                            alt={hotel.hotelNameKo}
                                            src={mainImage || HotelImage1}
                                          />
                                          
                                          <div className="hotel-card-content">
                                            <div className="hotel-card-content-left">
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
                                                {hotel.hotelIntro ||
                                                  '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.'}
                                              </p>
                                            </div>

                                            <div className="hotel-card-content-right">
                                              <div className="hotel-price">{priceText}</div>
                                            </div>
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
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setRightPanelTopTab('예약하기')}
                  style={{
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
                  예약하기
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTopTab('수정하기')}
                  style={{
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
                  수정하기
                </button>
              </div>

              {/* 하위 탭: 예약정보 / 여행도시 / 여행루트 / 일정 / 호텔 */}
              <div className="city-tab-buttons-left" style={{ marginBottom: '20px' }}>
                {['예약정보','여행도시', '여행루트', '호텔', '일정' ].map((tab) => (
                  <button
                    key={tab}
                    className={`city-tab-btn-left ${rightPanelSubTab === tab ? 'active' : ''}`}
                    onClick={() => {
                      setRightPanelSubTab(tab as typeof rightPanelSubTab);
                      // 우측 패널 탭이 변경되면 좌측 패널 탭도 업데이트 (예약정보, 호텔 제외)
                      if (tab === '여행도시') {
                        setMainTab('여행도시');
                      } else if (tab === '여행루트') {
                        setMainTab('여행루트');
                      } else if (tab === '일정') {
                        setMainTab('일정표');
                      } else if (tab === '호텔') {
                        setMainTab('호텔');
                      }
                      // 예약정보 탭은 좌측 패널 탭 변경 없음
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* 탭별 컨텐츠 */}
              {rightPanelSubTab === '여행도시' && (
                <div style={{ marginTop: '20px' }}>
                  <div className="selected-cities-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>여행 도시</h3>
                    {(cityCards.length > 0 ? cityCards : citiesWithInfo).length === 0 ? (
                      <div className="no-selected-cities" style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999',
                        border: '1px dashed #e0e0e0',
                        borderRadius: '4px'
                      }}>여행 도시가 없습니다</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {(cityCards.length > 0 ? cityCards : citiesWithInfo).map((cityInfo, index) => {
                          const cardId = cityInfo.id || index + 1;
                          const currentNights = cityCards.length > 0 
                            ? (selectedNights[cardId] || cityInfo.nights || 1)
                            : cityInfo.nights;
                          
                          return (
                            <div key={cardId} className="selected-city-card" style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '20px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '10px',
                              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <span className="city-name" style={{ fontSize: '14px', fontWeight: 500, minWidth: '100px' }}>{cityInfo.city}</span>
                                <span className="travel-period" style={{ fontSize: '14px', color: '#666', flex: 1, textAlign: 'center' }}>{cityInfo.travelPeriod}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {isEditingPeriod && (
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
                                        border: '1px solid #ddd',
                                        backgroundColor: currentNights <= 1 ? '#f5f5f5' : '#fff',
                                        color: currentNights <= 1 ? '#ccc' : '#333',
                                        fontSize: '12px',
                                        cursor: currentNights <= 1 ? 'not-allowed' : 'pointer',
                                        borderRadius: '4px',
                                        minWidth: '28px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >-</button>
                                  )}
                                  <span className="nights" style={{ fontSize: '14px', fontWeight: 500, color: '#333', minWidth: '40px', textAlign: 'center' }}>
                                    {currentNights}박
                                  </span>
                                  {isEditingPeriod && (
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
                                        border: '1px solid #ddd',
                                        backgroundColor: '#fff',
                                        color: '#333',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        minWidth: '28px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >+</button>
                                  )}
                                </div>
                              </div>
                              {isEditingPeriod && (
                                <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCardUp(cardId)}
                                    disabled={index === 0}
                                    style={{
                                      padding: '4px 8px',
                                      border: '1px solid #ddd',
                                      backgroundColor: index === 0 ? '#f5f5f5' : '#fff',
                                      color: index === 0 ? '#ccc' : '#333',
                                      fontSize: '12px',
                                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                                      borderRadius: '4px',
                                      transition: 'all 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '28px',
                                      height: '24px'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (index > 0) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (index > 0) {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                      }
                                    }}
                                    title="위로 이동"
                                  >
                                    <IoIosArrowUp />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCardDown(cardId)}
                                    disabled={index === (cityCards.length > 0 ? cityCards : citiesWithInfo).length - 1}
                                    style={{
                                      padding: '4px 8px',
                                      border: '1px solid #ddd',
                                      backgroundColor: index === (cityCards.length > 0 ? cityCards : citiesWithInfo).length - 1 ? '#f5f5f5' : '#fff',
                                      color: index === (cityCards.length > 0 ? cityCards : citiesWithInfo).length - 1 ? '#ccc' : '#333',
                                      fontSize: '12px',
                                      cursor: index === (cityCards.length > 0 ? cityCards : citiesWithInfo).length - 1 ? 'not-allowed' : 'pointer',
                                      borderRadius: '4px',
                                      transition: 'all 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '28px',
                                      height: '24px'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (index < (cityCards.length > 0 ? cityCards : citiesWithInfo).length - 1) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (index < (cityCards.length > 0 ? cityCards : citiesWithInfo).length - 1) {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                      }
                                    }}
                                    title="아래로 이동"
                                  >
                                    <IoIosArrowDown />
                                  </button>
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
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* 기간변경 버튼 */}
                    {cityCards.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                        {isEditingPeriod && (
                          <button
                            type="button"
                            onClick={handleAddCity}
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
                            도시 추가
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPeriod(!isEditingPeriod);
                            if (!isEditingPeriod) {
                              // 편집 모드 시작
                            } else {
                              // 완료: 상품명 업데이트
                              updateProductNameFromCards(cityCards, selectedNights);
                            }
                          }}
                          style={{
                            width: '150px',
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
                          {isEditingPeriod ? '완료' : '기간&도시변경'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {rightPanelSubTab === '여행루트' && (
                <div style={{ marginTop: '20px' }}>
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

              {rightPanelSubTab === '일정' && (
                <>
                  {/* 도시 탭 버튼들 */}
                  {cities.length > 0 && (
                    <div className="city-tab-buttons" style={{ marginBottom: '20px' }}>
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
                  <div className="schedule-summary-content" style={{ marginTop: '20px' }}>
                    <div className="summary-card">
                      <div className="summary-header">
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
                                style={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => handleScheduleDetailItemClick(item)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#5fb7ef';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(95, 183, 239, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
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
                    </div>
                  </div>
                </>
              )}


              {rightPanelSubTab === '호텔' && (
                <div style={{ marginTop: '20px' }} className="tour-hotel-page-wrapper">
                  <div className="tour-hotel-container">
                    <div className="right-section">
                      <div className="hotel-detail-wrapper">
                    {selectedHotel ? (
                      <>
                        {/* 호텔 헤더 */}
                        <div className="hotel-detail-header">
                          <div className="hotel-header-left">
                            <div className="hotel-detail-title">
                              {selectedHotel.hotelNameKo || '선택된 호텔'}
                            </div>
                            
                            <div className="hotel-detail-rating">
                              {Array.from(
                                {
                                  length:
                                    selectedHotel.hotelLevel &&
                                    !isNaN(parseInt(selectedHotel.hotelLevel, 10))
                                      ? parseInt(selectedHotel.hotelLevel, 10)
                                      : 4,
                                },
                                (_, i) => (
                                  <img
                                    key={i}
                                    className="star"
                                    alt="Star"
                                    src={StarIconDetail}
                                  />
                                )
                              )}
                            </div>

                            <div className="hotel-detail-location">
                              <span>
                                {(selectedHotel.nation || selectedHotel._cityFromSchedule || '')}
                                &nbsp;&gt;&nbsp;
                                {selectedHotel.city}
                              </span>
                            </div>
                          </div>

                          <div className="hotel-header-right">
                            <button className="media-button-header">
                              <img className="media-icon" alt="Vector" src={VideoIcon} />
                              <span>동영상보기</span>
                            </button>
                            <button 
                              className="media-button-header"
                              onClick={() => setShowPhotoGallery(!showPhotoGallery)}
                            >
                              <div className="media-icon-group">
                                <img className="media-icon" alt="Vector" src={PhotoIcon1} />
                                <img className="media-icon" alt="Vector" src={PhotoIcon2} />
                              </div>
                              <span>{showPhotoGallery ? '호텔목록보기' : '호텔사진보기'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 호텔 메인 이미지 */}
                        <div className="media-section">
                          <img
                            className="media-image"
                            alt={selectedHotel.hotelNameKo || 'Hotel'}
                            src={(() => {
                              if (selectedHotel.imageNamesAllView) {
                                try {
                                  const imageCopy = JSON.parse(selectedHotel.imageNamesAllView);
                                  return `${AdminURL}/images/hotelimages/${imageCopy[0]?.imageName || ''}`;
                                } catch (e) {
                                  console.error('선택 호텔 이미지 파싱 오류:', e);
                                }
                              }
                              return MediaImage;
                            })()}
                          />
                        </div>

                        {/* 호텔 위치 */}
                        <div className="location-section">
                          <button className="location-button">
                            <span>호텔 위치 보기</span>
                          </button>
                          <p className="location-address">
                            {selectedHotel.hotelAddress ||
                              '상세 주소는 추후 제공될 예정입니다.'}
                          </p>
                          <div className="location-distances">
                            <p>
                              {selectedHotel.hotelLocation ||
                                `${selectedHotel.city || '도시'} 주변 대표 관광지 정보는 추후 입력될 예정입니다.`}
                            </p>
                          </div>
                        </div>

                        {/* 호텔 소개 */}
                        <div className="description-section">
                          <p className="description-text">
                            {selectedHotel.hotelNotice
                              ? selectedHotel.hotelNotice
                              : selectedHotel.hotelIntro
                              ? selectedHotel.hotelIntro
                              : (
                                <>
                                  선택된 호텔의 상세 소개가 들어갈 영역입니다.
                                  <br />
                                  관리자 페이지에서 호텔 소개 문구를 등록하면 이곳에 노출됩니다.
                                </>
                              )}
                          </p>
                        </div>

                        {/* 추천포인트 */}
                        <div className="recommendations-section">
                          <div className="recommendations-title">추천 포인트</div>
                          <p className="recommendations-text">
                            {selectedHotel.hotelRecommendPoint
                              ? selectedHotel.hotelRecommendPoint
                              : '여행 중 특별한 휴식을 즐길 수 있는 추천 포인트가 들어갈 영역입니다.'}
                          </p>
                        </div>

                        {/* 부대시설 */}
                        <div className="facilities-section">
                          {(() => {
                            let convenienceList: string[] = [];
                            try {
                              if (selectedHotel.hotelConvenience && selectedHotel.hotelConvenience !== '[]') {
                                convenienceList = JSON.parse(selectedHotel.hotelConvenience);
                              }
                            } catch (e) {
                              console.error('호텔 부대시설 파싱 오류:', e);
                            }

                            if (!convenienceList || convenienceList.length === 0) {
                              return null;
                            }

                            const getIconByIndex = (index: number) => {
                              const icons = [WifiIcon, PoolIcon, FitnessIcon, ShuttleIcon];
                              return icons[index % icons.length];
                            };

                            return (
                              <div className="facilities-grid">
                                {convenienceList.map((item, index) => (
                                  <div className="facility-item" key={`${item}-${index}`}>
                                    <img
                                      className="facility-icon"
                                      alt={item}
                                      src={getIconByIndex(index)}
                                    />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                      </>
                    ) : (
                      <div className="hotel-detail-empty">
                        호텔을 선택하면 상세 정보가 이곳에 표시됩니다.
                      </div>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelSubTab === '예약정보' && (
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

                  
                </div>
              )}
            </div>

            {/* 가격 정보 */}
            <div className="summary-footer">
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
            </div>
            <div 
              className="cost-price-section"
              style={{
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
              >예역하기</button>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};
