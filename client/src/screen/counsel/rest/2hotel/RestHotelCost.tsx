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
import PriceHotelSelected from '../hotelPriceManage/PriceHotelSelected';
import HotelPriceInfo_Poolvilla from '../hotelPriceManage/HotelPriceInfo_Poolvilla';
import HotelPriceInfo_PerDay from '../hotelPriceManage/HotelPriceInfo_PerDay';
import HotelPriceInfo_MinimunStay from '../hotelPriceManage/HotelPriceInfo_MinimunStay';
import { format } from 'date-fns';
import axios from 'axios';


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
  const [selectedHotelForType, setSelectedHotelForType] = React.useState<{ [key: string]: any | null }>({
    '호텔': null,
    '리조트': null,
    '풀빌라': null
  });
  const [hotelHotelCost, setHotelHotelCost] = React.useState<any>(null);
  const [resortHotelCost, setResortHotelCost] = React.useState<any>(null);
  const [poolVillaHotelCost, setPoolVillaHotelCost] = React.useState<any>(null);
  const [isLoadingCost, setIsLoadingCost] = React.useState(false);
  const today = customerInfo.reserveDate || format(new Date(), 'yyyy-MM-dd');


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

  // 선택된 호텔들의 요금 정보 가져오기
  const fetchSelectedHotelsCosts = React.useCallback(async (selectedHotelsForType?: { [key: string]: any | null }) => {
    setIsLoadingCost(true);
    try {
      const requiredHotelTypes = getRequiredHotelTypes();
      const hotelsToFetch: { type: string; hotel: any }[] = [];
      const hotels = selectedHotelsForType || selectedHotelForType;
      
      requiredHotelTypes.forEach(type => {
        if (hotels[type]) {
          hotelsToFetch.push({
            type,
            hotel: hotels[type]!
          });
        }
      });
      
      const costPromises = hotelsToFetch.map(async ({ type, hotel }) => {
        try {
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
          
          return {
            type,
            hotel,
            costInput: costInputData
          };
        } catch (error) {
          console.error(`${type} 호텔 요금 정보 가져오기 오류:`, error);
          return {
            type,
            hotel,
            costInput: []
          };
        }
      });
      
      const costs = await Promise.all(costPromises);
      
      // 상태 초기화
      setHotelHotelCost(null);
      setResortHotelCost(null);
      setPoolVillaHotelCost(null);
      
      // 호텔, 리조트, 풀빌라별로 분리하여 상태 업데이트
      costs.forEach(({ type, hotel, costInput }) => {
        if (type === '호텔') {
          setHotelHotelCost({
            hotel,
            costInput
          });
        } else if (type === '리조트') {
          setResortHotelCost({
            hotel,
            costInput
          });
        } else if (type === '풀빌라') {
          setPoolVillaHotelCost({
            hotel,
            costInput
          });
        }
      });
    } catch (error) {
      console.error('호텔 요금 정보 가져오기 오류:', error);
    } finally {
      setIsLoadingCost(false);
    }
  }, [getRequiredHotelTypes, today, productInfo]);

  // 페이지 로드 시 자동으로 호텔 선택 및 요금 정보 가져오기
  useEffect(() => {
    if (!hotelInfo || !productInfo) return;

    const initializeHotels = async () => {
      const requiredHotelTypes = getRequiredHotelTypes();
      if (requiredHotelTypes.length === 0) return;

      const initialSelectedHotels: { [key: string]: any | null } = {
        '호텔': null,
        '리조트': null,
        '풀빌라': null
      };

      const hotelSort = hotelInfo.hotelSort;
      const hotelType = hotelInfo.hotelType;

      // 현재 호텔이 풀빌라인 경우 자동 선택
      if ((hotelSort === '풀빌라' || hotelType === '풀빌라') && requiredHotelTypes.includes('풀빌라')) {
        initialSelectedHotels['풀빌라'] = hotelInfo;
      }
      // 현재 호텔이 호텔/리조트인 경우 자동 선택
      else if ((hotelSort === '호텔' || hotelType === '호텔') && requiredHotelTypes.includes('호텔')) {
        initialSelectedHotels['호텔'] = hotelInfo;
      }
      else if ((hotelSort === '리조트' || hotelType === '리조트') && requiredHotelTypes.includes('리조트')) {
        initialSelectedHotels['리조트'] = hotelInfo;
      }

      // 리조트가 필요하고 아직 선택되지 않은 경우 랜덤으로 선택
      if (requiredHotelTypes.includes('리조트') && !initialSelectedHotels['리조트']) {
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

          const resortHotels = hotels.filter((hotel: any) => 
            (hotel.hotelType === '리조트' || hotel.hotelSort === '리조트')
          );

          if (resortHotels.length > 0) {
            const randomResort = resortHotels[Math.floor(Math.random() * resortHotels.length)];
            initialSelectedHotels['리조트'] = randomResort;
          }
        } catch (error) {
          console.error('리조트 호텔 가져오기 오류:', error);
        }
      }

      // 풀빌라가 필요하고 아직 선택되지 않은 경우 랜덤으로 선택 (미니멈스테이 등)
      if (requiredHotelTypes.includes('풀빌라') && !initialSelectedHotels['풀빌라']) {
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

          const poolVillaHotels = hotels.filter((hotel: any) => 
            (hotel.hotelType === '풀빌라' || hotel.hotelSort === '풀빌라')
          );

          if (poolVillaHotels.length > 0) {
            const randomPoolVilla = poolVillaHotels[Math.floor(Math.random() * poolVillaHotels.length)];
            initialSelectedHotels['풀빌라'] = randomPoolVilla;
          }
        } catch (error) {
          console.error('풀빌라 호텔 가져오기 오류:', error);
        }
      }

      // 선택된 호텔이 있으면 요금 정보 가져오기 및 바로 2단계로 이동
      const hasSelectedHotel = Object.values(initialSelectedHotels).some(hotel => hotel !== null);
      if (hasSelectedHotel) {
        setSelectedHotelForType(initialSelectedHotels);
        // costType에 따라 바로 2단계로 이동
        setHotelPriceStep(2);
        await fetchSelectedHotelsCosts(initialSelectedHotels);
        
        // 요금 정보가 로드된 후 각 카드의 첫 번째 룸타입 자동 선택
        // 이 부분은 fetchSelectedHotelsCosts가 완료된 후 실행되므로
        // 별도의 useEffect에서 처리됨
      }
    };

    initializeHotels();
  }, [hotelInfo, productInfo, getRequiredHotelTypes, fetchSelectedHotelsCosts]);

  // selectedHotelForType이 업데이트되면 scheduleCards의 호텔명 및 날짜 업데이트
  useEffect(() => {
    // 미니멈스테이인 경우 productScheduleData가 없어도 풀빌라 카드를 생성해야 함
    if (productInfo?.costType !== '미니멈스테이' && (!productInfo?.productScheduleData || Object.values(selectedHotelForType).every(hotel => hotel === null))) {
      return;
    }
    
    // 미니멈스테이인 경우 리조트나 호텔이 선택되어 있지 않으면 return
    if (productInfo?.costType === '미니멈스테이' && !selectedHotelForType['리조트'] && !selectedHotelForType['호텔']) {
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
          const hotelType = selectedHotelForType['리조트'] ? '리조트' : '호텔';
          const hotelInfo = selectedHotelForType['리조트'] || selectedHotelForType['호텔'];
          const hotelName = hotelInfo?.hotelNameKo || hotelType;
          
          if (hotelInfo) {
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
        
        // selectedHotelForType에서 해당 타입의 호텔명 가져오기
        if (selectedHotelForType[hotelSort]) {
          hotelName = selectedHotelForType[hotelSort].hotelNameKo || hotelName;
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
      if (hotelHotelCost || resortHotelCost || poolVillaHotelCost) {
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
  }, [selectedHotelForType, productInfo?.productScheduleData, customerInfo.travelPeriod, hotelHotelCost, resortHotelCost, poolVillaHotelCost]);

  // 룸타입 정보가 로드되면 각 카드의 첫 번째 룸타입 자동 선택 및 nights 초기화
  useEffect(() => {
    if (scheduleCards.length === 0) return;
    if (!hotelHotelCost && !resortHotelCost && !poolVillaHotelCost) return;

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
  }, [scheduleCards, hotelHotelCost, resortHotelCost, poolVillaHotelCost]);

  // 룸타입 또는 박수 변경 시 요금 재계산 (팩요금인 경우)
  useEffect(() => {
    if (productInfo?.costType !== '팩요금' || !poolVillaHotelCost || !poolVillaHotelCost.costInput) {
      console.log('요금 계산 조건 불만족 (팩요금):', {
        costType: productInfo?.costType,
        hasPoolVillaCost: !!poolVillaHotelCost,
        hasCostInput: !!(poolVillaHotelCost?.costInput)
      });
      return;
    }
    if (scheduleCards.length === 0) {
      console.log('scheduleCards가 비어있음');
      return;
    }
    
    // 풀빌라 카드 찾기
    const poolVillaCard = scheduleCards.find(card => card.badge === '풀빌라');
    if (!poolVillaCard) {
      console.log('풀빌라 카드를 찾을 수 없음');
      return;
    }
    
    // 풀빌라 룸타입 확인 (기본값도 확인)
    const availableRoomTypes = getRoomTypesForCard(poolVillaCard);
    const selectedPoolVillaRoomType = selectedRoomTypes[poolVillaCard.id] || availableRoomTypes[0];
    if (!selectedPoolVillaRoomType) {
      console.log('풀빌라 룸타입이 선택되지 않음', {
        selectedRoomTypes,
        poolVillaCardId: poolVillaCard.id,
        availableRoomTypes
      });
      return;
    }
    
    // 기간타입 결정
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
    
    console.log('기간타입 계산:', {
      resortNights,
      poolVillaNights,
      selectedNights,
      scheduleCards: scheduleCards.map(c => ({ id: c.id, badge: c.badge, nights: c.nights }))
    });
    
    // 기간타입 결정
    let periodType: string | null = null;
    if (resortNights === 2 && poolVillaNights === 2) {
      periodType = '2+2';
    } else if (resortNights === 1 && poolVillaNights === 3) {
      periodType = '1+3';
    } else if (resortNights === 0 && poolVillaNights === 3) {
      periodType = '3';
    } else if (resortNights === 0 && poolVillaNights === 4) {
      periodType = '4';
    }
    
    if (!periodType) {
      console.log('기간타입을 결정할 수 없음:', { resortNights, poolVillaNights });
      return;
    }
    
    console.log('요금 계산 시작:', {
      selectedPoolVillaRoomType,
      periodType,
      costInputLength: poolVillaHotelCost.costInput.length
    });
    
    // 요금 계산 (HotelPriceInfo_Poolvilla의 검색 로직과 동일)
    let calculatedPrice = 0;
    for (const cost of poolVillaHotelCost.costInput) {
      try {
        const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
        if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
          const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
            if (rt.roomType !== selectedPoolVillaRoomType) return false;
            
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
            
            console.log('✅ 매칭된 룸타입 요금 발견!');
            console.log('  - 기간타입:', periodType);
            console.log('  - 요금 문자열:', priceStr);
            console.log('  - 매칭된 룸타입 정보:', matchingRoom);
            
            // 문자열에서 숫자 추출 (쉼표 제거 후 숫자로 변환)
            const priceNum = parseInt(priceStr.replace(/,/g, ''), 10);
            if (!isNaN(priceNum)) {
              calculatedPrice = priceNum;
              console.log('💰 최종 계산된 요금:', calculatedPrice.toLocaleString(), '원');
              break; // 첫 번째 매칭 항목 사용
            } else {
              console.warn('⚠️ 요금 문자열을 숫자로 변환 실패:', priceStr);
            }
          }
        }
      } catch (e) {
        console.error('요금 계산 오류:', e);
      }
    }
    
    if (calculatedPrice > 0) {
      console.log('✅ 요금 업데이트 성공:', calculatedPrice.toLocaleString(), '원');
      console.log('=== 요금 계산 완료 ===');
      setPricePerPerson(calculatedPrice);
    } else {
      console.warn('❌ 요금을 찾을 수 없음 - 매칭되는 요금 정보가 없습니다.');
      console.log('=== 요금 계산 실패 ===');
    }
  }, [
    JSON.stringify(selectedRoomTypes), 
    JSON.stringify(selectedNights), 
    scheduleCards, 
    poolVillaHotelCost, 
    productInfo?.costType, 
    hotelHotelCost, 
    resortHotelCost
  ]);

  // 룸타입 또는 박수 변경 시 요금 재계산 (미니멈스테이인 경우)
  useEffect(() => {
    if (productInfo?.costType !== '미니멈스테이') {
      return;
    }
    
    // 미니멈스테이는 리조트 우선, 없으면 호텔에서 요금을 가져옴
    const minimumStayHotelCost = resortHotelCost || hotelHotelCost;
    if (!minimumStayHotelCost || !minimumStayHotelCost.costInput) {
      console.log('요금 계산 조건 불만족 (미니멈스테이):', {
        costType: productInfo?.costType,
        hasMinimumStayCost: !!minimumStayHotelCost,
        hasCostInput: !!(minimumStayHotelCost?.costInput),
        hasResortCost: !!resortHotelCost,
        hasHotelCost: !!hotelHotelCost
      });
      return;
    }
    
    if (scheduleCards.length === 0) {
      console.log('scheduleCards가 비어있음 (미니멈스테이)');
      return;
    }
    
    // 리조트 또는 호텔 카드 찾기 (리조트 우선)
    const hotelCard = scheduleCards.find(card => card.badge === '리조트') || scheduleCards.find(card => card.badge === '호텔');
    if (!hotelCard) {
      console.log('리조트/호텔 카드를 찾을 수 없음 (미니멈스테이)');
      return;
    }
    
    // 리조트/호텔 룸타입 확인 (기본값도 확인)
    const availableRoomTypes = getRoomTypesForCard(hotelCard);
    const selectedHotelRoomType = selectedRoomTypes[hotelCard.id] || availableRoomTypes[0];
    if (!selectedHotelRoomType) {
      console.log('리조트/호텔 룸타입이 선택되지 않음 (미니멈스테이)', {
        selectedRoomTypes,
        hotelCardId: hotelCard.id,
        availableRoomTypes
      });
      return;
    }
    
    // 리조트/호텔 박수 확인
    const hotelNights = selectedNights[hotelCard.id] || extractNightsNumber(hotelCard.nights || '');
    if (hotelNights <= 0) {
      console.log('리조트/호텔 박수가 0 이하 (미니멈스테이):', hotelNights);
      return;
    }
    
    // 기간타입 결정 (1박, 2박, 3박, 4박, 5박, 6박, 1박추가)
    let periodType: string | null = null;
    if (hotelNights === 1) {
      periodType = '1박';
    } else if (hotelNights === 2) {
      periodType = '2박';
    } else if (hotelNights === 3) {
      periodType = '3박';
    } else if (hotelNights === 4) {
      periodType = '4박';
    } else if (hotelNights === 5) {
      periodType = '5박';
    } else if (hotelNights === 6) {
      periodType = '6박';
    } else if (hotelNights > 6) {
      // 6박 초과인 경우 6박 + 1박추가 형태로 계산할 수도 있지만, 일단 6박으로 처리
      periodType = '6박';
    }
    
    if (!periodType) {
      console.log('기간타입을 결정할 수 없음 (미니멈스테이):', { hotelNights });
      return;
    }
    
    console.log('=== 미니멈스테이 요금 계산 시작 ===');
    console.log('선택된 리조트/호텔 룸타입:', selectedHotelRoomType);
    console.log('기간타입:', periodType);
    console.log('리조트/호텔 박수:', hotelNights);
    console.log('요금 정보 개수:', minimumStayHotelCost.costInput.length);
    
    // 요금 계산 (HotelPriceInfo_MinimunStay의 검색 로직과 동일)
    let calculatedPrice = 0;
    for (const cost of minimumStayHotelCost.costInput) {
      try {
        const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
        if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
          const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
            if (rt.roomType !== selectedHotelRoomType) return false;
            
            // 기간타입에 맞는 요금이 있는지 확인
            if (periodType === '1박' && rt.oneNightCost && rt.oneNightCost !== '') return true;
            if (periodType === '2박' && rt.twoNightCost && rt.twoNightCost !== '') return true;
            if (periodType === '3박' && rt.threeNightCost && rt.threeNightCost !== '') return true;
            if (periodType === '4박' && rt.fourNightCost && rt.fourNightCost !== '') return true;
            if (periodType === '5박' && rt.fiveNightCost && rt.fiveNightCost !== '') return true;
            if (periodType === '6박' && rt.sixNightCost && rt.sixNightCost !== '') return true;
            
            return false;
          });
          
          if (matchingRoom) {
            // 기간타입에 맞는 요금 가져오기
            let priceStr = '';
            if (periodType === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
              priceStr = String(matchingRoom.oneNightCost);
            } else if (periodType === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
              priceStr = String(matchingRoom.twoNightCost);
            } else if (periodType === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
              priceStr = String(matchingRoom.threeNightCost);
            } else if (periodType === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
              priceStr = String(matchingRoom.fourNightCost);
            } else if (periodType === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
              priceStr = String(matchingRoom.fiveNightCost);
            } else if (periodType === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
              priceStr = String(matchingRoom.sixNightCost);
            }
            
            console.log('✅ 매칭된 룸타입 요금 발견! (미니멈스테이)');
            console.log('  - 기간타입:', periodType);
            console.log('  - 요금 문자열:', priceStr);
            console.log('  - 매칭된 룸타입 정보:', matchingRoom);
            
            // 통화 정보 찾기: matchingRoom -> inputDefault -> cost 순서로 확인
            let currency = matchingRoom.currency || '';
            if (!currency && inputDefault && typeof inputDefault === 'object' && !Array.isArray(inputDefault)) {
              currency = inputDefault.currency || '';
            }
            if (!currency && cost && typeof cost === 'object') {
              currency = cost.currency || '';
            }
            
            // 통화 정보가 없으면 기본적으로 달러로 가정 (환율 적용)
            const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
            // 환율을 숫자로 변환 (문자열일 수 있음)
            const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
              ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
                  ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
                  : Number(exchangeRate.USDsend_KRW_tts))
              : 0;
            
            // 문자열에서 숫자 추출 (쉼표 제거 후 숫자로 변환)
            let priceNum = parseFloat(priceStr.replace(/,/g, ''));
            if (!isNaN(priceNum)) {
              // 달러인 경우 원화로 변환
              if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
                priceNum = priceNum * exchangeRateValue;
              }
              calculatedPrice = Math.round(priceNum);
              console.log('💰 최종 계산된 요금 (미니멈스테이):', calculatedPrice.toLocaleString(), '원');
              console.log('  - 원래 요금:', priceStr, currency || 'USD');
              console.log('  - 환율:', exchangeRateValue);
              console.log('  - 환율 적용 여부:', isUSD);
              break; // 첫 번째 매칭 항목 사용
            } else {
              console.warn('⚠️ 요금 문자열을 숫자로 변환 실패 (미니멈스테이):', priceStr);
            }
          }
        }
      } catch (e) {
        console.error('요금 계산 오류 (미니멈스테이):', e);
      }
    }
    
    if (calculatedPrice > 0) {
      console.log('✅ 요금 업데이트 성공 (미니멈스테이):', calculatedPrice.toLocaleString(), '원');
      console.log('=== 미니멈스테이 요금 계산 완료 ===');
      setPricePerPerson(calculatedPrice);
    } else {
      console.warn('❌ 요금을 찾을 수 없음 (미니멈스테이) - 매칭되는 요금 정보가 없습니다.');
      console.log('=== 미니멈스테이 요금 계산 실패 ===');
    }
  }, [
    JSON.stringify(selectedRoomTypes), 
    JSON.stringify(selectedNights), 
    scheduleCards, 
    productInfo?.costType, 
    hotelHotelCost, 
    resortHotelCost,
    exchangeRate
  ]);

  // 룸타입 또는 박수 변경 시 요금 재계산 (박당인 경우)
  useEffect(() => {
    if (productInfo?.costType !== '박당') {
      return;
    }
    
    // 박당은 풀빌라 우선, 없으면 선투숙(리조트/호텔)에서 요금을 가져옴
    const perDayHotelCost = poolVillaHotelCost || resortHotelCost || hotelHotelCost;
    if (!perDayHotelCost || !perDayHotelCost.costInput) {
      console.log('요금 계산 조건 불만족 (박당):', {
        costType: productInfo?.costType,
        hasPerDayCost: !!perDayHotelCost,
        hasCostInput: !!(perDayHotelCost?.costInput)
      });
      return;
    }
    
    if (scheduleCards.length === 0) {
      console.log('scheduleCards가 비어있음 (박당)');
      return;
    }
    
    // 풀빌라 카드 우선, 없으면 리조트/호텔 카드
    const hotelCard = scheduleCards.find(card => card.badge === '풀빌라') 
      || scheduleCards.find(card => card.badge === '리조트') 
      || scheduleCards.find(card => card.badge === '호텔');
    if (!hotelCard) {
      console.log('호텔 카드를 찾을 수 없음 (박당)');
      return;
    }
    
    // 호텔 룸타입 확인 (기본값도 확인)
    const availableRoomTypes = getRoomTypesForCard(hotelCard);
    const selectedHotelRoomType = selectedRoomTypes[hotelCard.id] || availableRoomTypes[0];
    if (!selectedHotelRoomType) {
      console.log('호텔 룸타입이 선택되지 않음 (박당)', {
        selectedRoomTypes,
        hotelCardId: hotelCard.id,
        availableRoomTypes
      });
      return;
    }
    
    // 박수 확인
    const hotelNights = selectedNights[hotelCard.id] || extractNightsNumber(hotelCard.nights || '');
    if (hotelNights <= 0) {
      console.log('호텔 박수가 0 이하 (박당):', hotelNights);
      return;
    }
    
    // Recoil에서 예약일자와 여행기간 가져오기
    const reserveDate = customerInfo.reserveDate || today;
    let searchDateStart = '';
    let searchDateEnd = '';
    
    if (customerInfo.travelPeriod) {
      const travelPeriod = customerInfo.travelPeriod.trim();
      if (travelPeriod.includes('~')) {
        const parts = travelPeriod.split('~').map(part => part.trim());
        if (parts.length === 2) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(parts[0]) && dateRegex.test(parts[1])) {
            searchDateStart = parts[0];
            searchDateEnd = parts[1];
          }
        }
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(travelPeriod)) {
          searchDateStart = travelPeriod;
          searchDateEnd = travelPeriod;
        }
      }
    }
    
    if (!searchDateStart || !searchDateEnd) {
      console.log('여행기간이 유효하지 않음 (박당)');
      return;
    }
    
    console.log('=== 박당 요금 계산 시작 ===');
    console.log('선택된 호텔 룸타입:', selectedHotelRoomType);
    console.log('호텔 박수:', hotelNights);
    console.log('예약일자:', reserveDate);
    console.log('검색 기간:', searchDateStart, '~', searchDateEnd);
    console.log('요금 정보 개수:', perDayHotelCost.costInput.length);
    
    // 요금 계산 (HotelPriceInfo_PerDay의 검색 로직과 동일)
    let calculatedPrice = 0;
    for (const cost of perDayHotelCost.costInput) {
      try {
        // 예약일자 확인 (reserveDate와 cost.reserveDate 비교)
        // 여기서는 cost.reservePeriod를 확인하여 예약기간 내에 있는지 확인
        let matchesDate = true;
        if (searchDateStart && searchDateEnd) {
          try {
            const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
            if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
              let hasMatchingPeriod = false;
              const searchStartDate = new Date(searchDateStart);
              const searchEndDate = new Date(searchDateEnd);
              
              for (const periodItem of inputDefault.period) {
                if (periodItem.start && periodItem.end) {
                  const periodStartDate = new Date(periodItem.start);
                  const periodEndDate = new Date(periodItem.end);
                  
                  if (!isNaN(searchStartDate.getTime()) && !isNaN(searchEndDate.getTime()) && 
                      !isNaN(periodStartDate.getTime()) && !isNaN(periodEndDate.getTime())) {
                    const overlaps = !(searchStartDate.getTime() > periodEndDate.getTime() || searchEndDate.getTime() < periodStartDate.getTime());
                    if (overlaps) {
                      hasMatchingPeriod = true;
                      break;
                    }
                  }
                }
              }
              
              if (!hasMatchingPeriod) {
                matchesDate = false;
              }
            }
          } catch (e) {
            // ignore
          }
        }
        
        if (!matchesDate) continue;
        
        const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
        if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
          const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
            if (rt.roomType !== selectedHotelRoomType) return false;
            // 박당 요금 구조: dayStayCost(1박), dayStayCostAll(합계), dayPersonCost(1인)
            return rt.dayStayCost || rt.dayStayCostAll || rt.dayPersonCost;
          });
          
          if (matchingRoom) {
            // 통화 정보 찾기
            let currency = matchingRoom.currency || '';
            if (!currency && inputDefault && typeof inputDefault === 'object' && !Array.isArray(inputDefault)) {
              currency = inputDefault.currency || '';
            }
            if (!currency && cost && typeof cost === 'object') {
              currency = cost.currency || '';
            }
            
            // 통화 정보가 없으면 기본적으로 달러로 가정 (환율 적용)
            const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
            const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
              ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
                  ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
                  : Number(exchangeRate.USDsend_KRW_tts))
              : 0;
            
            // 요금 계산: 합계(dayStayCostAll) 우선, 없으면 1박당 * 박수, 또는 1인당 * 박수 * 인원수
            let priceNum = 0;
            
            if (matchingRoom.dayStayCostAll && matchingRoom.dayStayCostAll !== '') {
              // 합계가 있으면 합계 사용
              priceNum = parseFloat(String(matchingRoom.dayStayCostAll).replace(/,/g, ''));
            } else if (matchingRoom.dayStayCost && matchingRoom.dayStayCost !== '') {
              // 1박당 요금 * 박수
              const dayStayCost = parseFloat(String(matchingRoom.dayStayCost).replace(/,/g, ''));
              priceNum = dayStayCost * hotelNights;
            } else if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
              // 1인당 요금 * 박수 * 인원수
              const dayPersonCost = parseFloat(String(matchingRoom.dayPersonCost).replace(/,/g, ''));
              priceNum = dayPersonCost * hotelNights * guestCount;
            }
            
            if (!isNaN(priceNum) && priceNum > 0) {
              // 달러인 경우 원화로 변환
              if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
                priceNum = priceNum * exchangeRateValue;
              }
              calculatedPrice = Math.round(priceNum);
              console.log('✅ 매칭된 룸타입 요금 발견! (박당)');
              console.log('  - 룸타입:', selectedHotelRoomType);
              console.log('  - 박수:', hotelNights);
              console.log('  - 원래 요금:', priceNum / (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1), currency || 'USD');
              console.log('  - 환율:', exchangeRateValue);
              console.log('💰 최종 계산된 요금 (박당):', calculatedPrice.toLocaleString(), '원');
              break; // 첫 번째 매칭 항목 사용
            }
          }
        }
      } catch (e) {
        console.error('요금 계산 오류 (박당):', e);
      }
    }
    
    if (calculatedPrice > 0) {
      console.log('✅ 요금 업데이트 성공 (박당):', calculatedPrice.toLocaleString(), '원');
      console.log('=== 박당 요금 계산 완료 ===');
      setPricePerPerson(calculatedPrice);
    } else {
      console.warn('❌ 요금을 찾을 수 없음 (박당) - 매칭되는 요금 정보가 없습니다.');
      console.log('=== 박당 요금 계산 실패 ===');
      setPricePerPerson(0);
    }
  }, [
    JSON.stringify(selectedRoomTypes), 
    JSON.stringify(selectedNights), 
    scheduleCards, 
    productInfo?.costType, 
    hotelHotelCost, 
    resortHotelCost,
    poolVillaHotelCost,
    exchangeRate,
    customerInfo.reserveDate,
    customerInfo.travelPeriod,
    guestCount
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
            {/* 호텔별 요금 관리 섹션 - 상단에 배치 */}
            <div style={{
              marginBottom: '40px',
              paddingBottom: '30px',
              borderBottom: '2px solid #e0e0e0',
              backgroundColor: '#fafafa',
              padding: '20px',
              borderRadius: '8px'
            }}>
             

              {/* costType에 따라 바로 해당 컴포넌트 표시 */}
              {productInfo?.costType === '팩요금' ? (
                <HotelPriceInfo_Poolvilla
                  hotelHotelCost={hotelHotelCost}
                  resortHotelCost={resortHotelCost}
                  poolVillaHotelCost={poolVillaHotelCost}
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
                />
              ) : productInfo?.costType === '미니멈스테이' ? (
                <HotelPriceInfo_MinimunStay
                  hotelHotelCost={hotelHotelCost}
                  resortHotelCost={resortHotelCost}
                  poolVillaHotelCost={poolVillaHotelCost}
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
                />
              ) : productInfo?.costType === '박당' ? (
                <HotelPriceInfo_PerDay
                  hotelHotelCost={hotelHotelCost}
                  resortHotelCost={resortHotelCost}
                  poolVillaHotelCost={poolVillaHotelCost}
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
                    {productInfo?.productName || ''} - 
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
                      <div className={`cost-card-badge`}>{card.badge}</div>
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
                    {pricePerPerson > 0 ? (
                      `${pricePerPerson.toLocaleString()}원`
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>요금이 없습니다</span>
                    )}
                  </div>
                  {pricePerPerson > 0 && <div className="cost-price-unit">/1인</div>}
                </div>
                <div className="cost-price-row">
                  <div className="cost-price-label">총요금</div>
                  <div className="cost-price-total">
                    {pricePerPerson > 0 ? (
                      `₩${(pricePerPerson * guestCount).toLocaleString()}`
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
    </div>
  );
};

