import axios from 'axios';
import { format } from 'date-fns';
import { AdminURL } from '../../../../../MainURL';

// 랜드사 수수료/네고 정보 가져오기
export const fetchLandCommission = async (
  productInfo: any,
  stateProps: any,
  setLandCommissionTotal: React.Dispatch<React.SetStateAction<number>>,
  setLandDiscountDefaultTotal: React.Dispatch<React.SetStateAction<number>>,
  setLandDiscountSpecialTotal: React.Dispatch<React.SetStateAction<number>>,
  setLandCurrency: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
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
  } catch (e) {
    setLandCommissionTotal(0);
    setLandDiscountDefaultTotal(0);
    setLandDiscountSpecialTotal(0);
    setLandCurrency('₩');
  }
};

// 호텔 리스트 가져오기
export const fetchAllHotels = async (
  productInfo: any,
  stateProps: any,
  setAllHotels: React.Dispatch<React.SetStateAction<any[]>>
) => {
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
};

// 호텔 변경 핸들러
export const createHandleHotelChange = (
  scheduleCards: any[],
  allHotels: any[],
  stateProps: any,
  setSelectedCardIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setShowHotelSelectModal: React.Dispatch<React.SetStateAction<boolean>>,
  setHotelsWithFullData: React.Dispatch<React.SetStateAction<any[]>>
) => {
  return async (cardIndex: number) => {
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
};

// 호텔 선택 완료 핸들러
export const createHandleHotelSelect = (
  selectedCardIndex: number | null,
  scheduleCards: any[],
  selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>,
  resortPoolvillaHotels: Array<{ hotel: any; hotelSort: string; hotelName: string }>,
  selectedRoomTypes: { [key: number]: string },
  getRoomTypesForCard: (card: any) => string[],
  setSelectedHotels: React.Dispatch<React.SetStateAction<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>>>,
  setScheduleCards: React.Dispatch<React.SetStateAction<any[]>>,
  setShowHotelSelectModal: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedCardIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setSelectedHotelTabIndex: React.Dispatch<React.SetStateAction<number>>,
  setImageAllView: React.Dispatch<React.SetStateAction<any[]>>,
  setImageRoomView: React.Dispatch<React.SetStateAction<any[]>>,
  setImageEtcView: React.Dispatch<React.SetStateAction<any[]>>,
  setRoomTypes: React.Dispatch<React.SetStateAction<any[]>>,
  setHotelInfo: React.Dispatch<React.SetStateAction<any | null>>,
  setSelectedMainImageIndex: React.Dispatch<React.SetStateAction<number>>,
  setSelectedRoomTypes: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>,
  fetchSelectedHotelsCosts: (selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => Promise<void>
) => {
  return async (selectedHotel: any) => {
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
};

// 선택된 호텔들의 요금 정보 가져오기
export const fetchSelectedHotelsCosts = async (
  customerInfo: any,
  productInfo: any,
  selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>,
  setIsLoadingCost: React.Dispatch<React.SetStateAction<boolean>>,
  setHotel1Cost: React.Dispatch<React.SetStateAction<any>>,
  setHotel2Cost: React.Dispatch<React.SetStateAction<any>>,
  setHotel3Cost: React.Dispatch<React.SetStateAction<any>>,
  setHotel4Cost: React.Dispatch<React.SetStateAction<any>>,
  setHotelHotelCost: React.Dispatch<React.SetStateAction<any>>,
  setResortHotelCost: React.Dispatch<React.SetStateAction<any>>,
  setPoolVillaHotelCost: React.Dispatch<React.SetStateAction<any>>,
  selectedHotelsList?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>
) => {
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
              const parts = travelPeriod.split('~').map((part: string) => part.trim());
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
          console.log(costInputRes.data);
          
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
};

