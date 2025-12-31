// 미니멈스테이 최종 가격 계산 래퍼
// RestHotelCost.tsx에서 사용하기 위해 minimumStayPriceUtils의 유틸들을 묶어서 한 번에 계산

import {
  calculateSalePrice as calculateMinimumStaySalePrice,
  calculateMinimumStaySearchResult,
  calculateCombinedResortSearchResult,
  calculateResortComboPrice
} from './minimumStayPriceUtils';

// 미니멈스테이 최종 판매가 계산
export const calculateMinimumStayFinalPrice = (
  costType: string | undefined,
  productScheduleData: string | undefined,
  hotel1Cost: any | null,
  hotel2Cost: any | null,
  hotel3Cost: any | null,
  hotel4Cost: any | null,
  selectedRoomTypes: { [index: number]: string },
  selectedNights: { [index: number]: number },
  scheduleCards: Array<{ id: number }>,
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number,
  exchangeRate: any
): number | null => {
  if (costType !== '미니멈스테이') return null;
  if (!hotel1Cost && !hotel2Cost && !hotel3Cost && !hotel4Cost) return null;

  // productScheduleData를 기반으로 호텔 분류
  let scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }> = [];

  // productScheduleData가 없으면 hotel1Cost 사용 (미니멈스테이인 경우)
  if (!productScheduleData) {
    if (hotel1Cost) {
      const hotelType = hotel1Cost.hotel?.hotelType || hotel1Cost.hotel?.hotelSort || '리조트';
      const hotelSort = (hotelType === '리조트' || hotelType === '호텔') ? hotelType : '리조트';
      scheduledHotels = [{
        hotelSort,
        hotelCost: hotel1Cost,
        index: 1
      }];
    } else {
      return null;
    }
  } else {
    try {
      const scheduleData = JSON.parse(productScheduleData);
      if (Array.isArray(scheduleData) && scheduleData.length > 0) {
        const allHotels = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost].filter(h => h !== null);
        scheduleData.slice(0, 4).forEach((item: any, index: number) => {
          if (allHotels[index]) {
            scheduledHotels.push({
              hotelSort: item.hotelSort || '',
              hotelCost: allHotels[index],
              index: index + 1
            });
          }
        });
      } else {
        // 빈 배열인 경우 hotel1Cost 사용
        if (hotel1Cost) {
          const hotelType = hotel1Cost.hotel?.hotelType || hotel1Cost.hotel?.hotelSort || '리조트';
          const hotelSort = (hotelType === '리조트' || hotelType === '호텔') ? hotelType : '리조트';
          scheduledHotels = [{
            hotelSort,
            hotelCost: hotel1Cost,
            index: 1
          }];
        }
      }
    } catch (e) {
      // 파싱 오류인 경우 hotel1Cost 사용
      if (hotel1Cost) {
        const hotelType = hotel1Cost.hotel?.hotelType || hotel1Cost.hotel?.hotelSort || '리조트';
        const hotelSort = (hotelType === '리조트' || hotelType === '호텔') ? hotelType : '리조트';
        scheduledHotels = [{
          hotelSort,
          hotelCost: hotel1Cost,
          index: 1
        }];
      } else {
        return null;
      }
    }
  }

  if (scheduledHotels.length === 0) return null;

  const resortHotels = scheduledHotels.filter(h => h.hotelSort === '리조트' || h.hotelSort === '호텔');

  // 리조트가 2개 이상인 경우 조합 요금 계산
  if (resortHotels.length >= 2) {
    // productScheduleData가 있으면 조합 요금 계산 시도
    if (productScheduleData) {
      const selectedRoomTypesByIndex: { [index: number]: string } = {};
      scheduleCards.forEach((card) => {
        const idx = card.id;
        if (selectedRoomTypes[card.id]) {
          selectedRoomTypesByIndex[idx] = selectedRoomTypes[card.id];
        }
      });

      const comboPrice = calculateResortComboPrice(
        productScheduleData,
        hotel1Cost,
        hotel2Cost,
        hotel3Cost,
        hotel4Cost,
        selectedRoomTypesByIndex
      );

      if (comboPrice) {
        const salePrice = calculateMinimumStaySalePrice(
          comboPrice,
          landCommissionTotal,
          landDiscountDefaultTotal,
          landDiscountSpecialTotal,
          landCurrency,
          usdRate
        );
        return salePrice;
      }
    }

    // 조합 요금이 없으면 각 리조트별 검색 결과 합산
    const resortSearchData = resortHotels.map(({ hotelCost, index }) => {
      const roomType = selectedRoomTypes[index] || '';
      const nights = selectedNights[index] || 0;
      return {
        hotelCost,
        selectedRoomType: roomType,
        selectedPeriodType: nights > 0 ? `${nights}박` : ''
      };
    });

    const combinedResult = calculateCombinedResortSearchResult(
      scheduledHotels,
      resortSearchData,
      exchangeRate
    );

    if (combinedResult && combinedResult.priceText) {
      const salePrice = calculateMinimumStaySalePrice(
        combinedResult.priceText,
        landCommissionTotal,
        landDiscountDefaultTotal,
        landDiscountSpecialTotal,
        landCurrency,
        usdRate
      );
      return salePrice;
    }
  } else if (resortHotels.length === 1) {
    // 리조트가 1개인 경우 단일 검색
    const firstResort = resortHotels[0];
    if (firstResort && firstResort.hotelCost) {
      const roomType = selectedRoomTypes[firstResort.index] || '';
      const nights = selectedNights[firstResort.index] || 0;

      const searchResult = calculateMinimumStaySearchResult(
        firstResort.hotelCost,
        roomType,
        nights > 0 ? `${nights}박` : '',
        exchangeRate
      );

      if (searchResult && searchResult.priceText) {
        // "2박: ₩1,000,000원" -> "₩1,000,000원" 형태로 변환
        let priceTextToUse = searchResult.priceText;
        if (priceTextToUse.includes(':')) {
          const parts = priceTextToUse.split(':');
          if (parts.length > 1) {
            priceTextToUse = parts.slice(1).join(':').trim();
          }
        }

        const salePrice = calculateMinimumStaySalePrice(
          priceTextToUse,
          landCommissionTotal,
          landDiscountDefaultTotal,
          landDiscountSpecialTotal,
          landCurrency,
          usdRate
        );
        return salePrice;
      }
    }
  }

  return null;
};
