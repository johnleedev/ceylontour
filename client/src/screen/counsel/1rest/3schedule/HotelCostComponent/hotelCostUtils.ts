// nights 문자열에서 숫자 추출 함수 (예: "2박" -> 2, "3박" -> 3)
export const extractNightsNumber = (nightsStr: string): number => {
  if (!nightsStr) return 0;
  const match = nightsStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// 날짜 포맷팅 함수 (YYYY-MM-DD)
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 룸타입 목록 추출 함수 (HotelPriceInfo 컴포넌트와 동일한 로직)
export const extractRoomTypes = (costInputArr: any[]): string[] => {
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
export const getRoomTypesForCard = (
  card: any,
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  hotelHotelCost: any,
  resortHotelCost: any,
  poolVillaHotelCost: any
): string[] => {
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

// 기간타입 결정 (리조트+풀빌라 조합: 2+2, 1+3, 3+2 등, 또는 풀빌라만: 3, 4)
export const getPeriodType = (
  scheduleCards: any[],
  selectedNights: { [key: number]: number }
): string | null => {
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
export const getCurrentImages = (
  activeTab: number,
  imageAllView: any[],
  imageRoomView: any[],
  imageEtcView: any[]
) => {
  if (activeTab === 0) return imageAllView; // 전경
  if (activeTab === 1) return imageRoomView; // 객실
  return imageEtcView; // 수영장/다이닝/기타 → 부대시설 이미지 공통 사용
};

// 파일이 동영상인지 확인
export const isVideoFile = (fileName: string): boolean => {
  if (!fileName) return false;
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
  const lowerFileName = fileName.toLowerCase();
  return videoExtensions.some(ext => lowerFileName.endsWith(ext));
};

// productScheduleData에서 필요한 호텔 타입 추출
export const getRequiredHotelTypes = (
  productInfo: any
): string[] => {
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
};

// productScheduleData를 파싱하여 호텔명 생성
export const getProductNameFromSchedule = (
  productInfo: any,
  selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>,
  hotelInfo: any,
  allHotels: any[]
): string => {
  // 미니멈스테이인 경우 productScheduleData가 없어도 selectedHotels에서 호텔명 가져오기
  if (!productInfo?.productScheduleData) {
    if (productInfo?.costType === '미니멈스테이' && selectedHotels.length > 0) {
      const parts: string[] = [];
      selectedHotels.forEach((selectedHotel) => {
        if (selectedHotel.hotel) {
          const hotelName = selectedHotel.hotel.hotelNameKo || selectedHotel.hotelSort;
          const dayNight = selectedHotel.dayNight || '';
          const nights = dayNight ? (dayNight.includes('박') ? dayNight : `${dayNight}박`) : '';
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
      const nights = dayNight ? (dayNight.includes('박') ? dayNight : `${dayNight}박`) : '';

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
          const dayNight = selectedHotel.dayNight || '';
          const nights = dayNight ? (dayNight.includes('박') ? dayNight : `${dayNight}박`) : '';
          parts.push(`${hotelName}${nights ? ` ${nights}` : ''}`);
        }
      });
      if (parts.length > 0) {
        return parts.join(' + ');
      }
    }
    return productInfo?.productName || '';
  }
};

