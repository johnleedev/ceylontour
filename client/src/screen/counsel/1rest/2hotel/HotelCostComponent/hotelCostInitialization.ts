import axios from 'axios';
import { AdminURL } from '../../../../../MainURL';
import { extractNightsNumber, formatDate } from './hotelCostUtils';

// 호텔 초기화 함수
export const initializeHotels = async (
  hotelInfo: any,
  productInfo: any,
  stateProps: any,
  setSelectedHotels: React.Dispatch<React.SetStateAction<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>>>,
  setHotelPriceStep: React.Dispatch<React.SetStateAction<1 | 2>>,
  fetchSelectedHotelsCostsRef: React.MutableRefObject<((selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => Promise<void>) | null>
): Promise<void> => {
  if (!hotelInfo || !productInfo) return;

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
  }
};

// scheduleCards 업데이트 함수
export const updateScheduleCards = (
  selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>,
  productInfo: any,
  customerInfo: any,
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  hotelHotelCost: any,
  resortHotelCost: any,
  poolVillaHotelCost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  setScheduleCards: React.Dispatch<React.SetStateAction<any[]>>,
  setSelectedRoomTypes: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>,
  setSelectedNights: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>,
  getRoomTypesForCard: (card: any) => string[]
): void => {
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
            const parts = travelPeriod.split('~').map((part: string) => part.trim());
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
        const parts = travelPeriod.split('~').map((part: string) => part.trim());
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
      
      // 새로운 선택값이 있을 때만 업데이트 (실제로 변경되었을 때만)
      if (Object.keys(newSelectedRoomTypes).length > 0) {
        setSelectedRoomTypes(prev => {
          // 실제로 변경된 값이 있는지 확인
          const hasChanges = Object.keys(newSelectedRoomTypes).some(key => {
            const cardId = parseInt(key);
            return prev[cardId] !== newSelectedRoomTypes[cardId];
          });
          
          if (hasChanges) {
            const updated = { ...prev, ...newSelectedRoomTypes };
            return updated;
          }
          return prev;
        });
      }
      if (Object.keys(newSelectedNights).length > 0) {
        setSelectedNights(prev => {
          // 실제로 변경된 값이 있는지 확인
          const hasChanges = Object.keys(newSelectedNights).some(key => {
            const cardId = parseInt(key);
            return prev[cardId] !== newSelectedNights[cardId];
          });
          
          if (hasChanges) {
            const updated = { ...prev, ...newSelectedNights };
            return updated;
          }
          return prev;
        });
      }
    }
  } catch (e) {
    // scheduleCards 업데이트 오류 시 기존 카드 유지
  }
};

