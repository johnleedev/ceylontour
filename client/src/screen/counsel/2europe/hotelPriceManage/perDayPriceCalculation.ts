// 박당 최종 가격 계산 래퍼
// RestHotelCost.tsx에서 사용하기 위해 perDayPriceUtils의 유틸들을 묶어서 한 번에 계산

import {
  calculateSalePrice as calculatePerDaySalePrice,
  calculatePerDaySearchResult,
  calculateCombinedHotelSearchResult
} from './perDayPriceUtils';

// 박당 최종 판매가 계산
export const calculatePerDayFinalPrice = (
  costType: string | undefined,
  productScheduleData: string | undefined,
  hotel1Cost: any | null,
  hotel2Cost: any | null,
  hotel3Cost: any | null,
  hotel4Cost: any | null,
  selectedRoomTypes: { [index: number]: string },
  selectedNights: { [index: number]: number },
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number,
  exchangeRate: any
): number | null => {
  if (costType !== '박당') return null;
  if (!hotel1Cost && !hotel2Cost && !hotel3Cost && !hotel4Cost) return null;
  if (!productScheduleData) return null;

  // productScheduleData를 기반으로 호텔 분류
  let scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }> = [];
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
    }
  } catch (e) {
    return null;
  }

  // 호텔이 2개 이상인 경우 조합 검색
  if (scheduledHotels.length >= 2) {
    const hotelSearchData = scheduledHotels.map(({ hotelCost, index }) => {
      const roomType = selectedRoomTypes[index] || '';
      const nights = selectedNights[index] || 0;
      return {
        hotelCost,
        selectedRoomType: roomType,
        selectedPeriodType: nights > 0 ? `${nights}박` : ''
      };
    });

    const combinedResult = calculateCombinedHotelSearchResult(
      scheduledHotels,
      hotelSearchData,
      exchangeRate
    );

    if (combinedResult && combinedResult.priceText) {
      const salePrice = calculatePerDaySalePrice(
        combinedResult.priceText,
        landCommissionTotal,
        landDiscountDefaultTotal,
        landDiscountSpecialTotal,
        landCurrency,
        usdRate
      );
      return salePrice;
    }
  } else if (scheduledHotels.length === 1) {
    // 호텔이 1개인 경우 단일 검색
    const firstHotel = scheduledHotels[0];
    if (firstHotel && firstHotel.hotelCost) {
      const roomType = selectedRoomTypes[firstHotel.index] || '';
      const nights = selectedNights[firstHotel.index] || 0;

      const searchResult = calculatePerDaySearchResult(
        firstHotel.hotelCost,
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

        const salePrice = calculatePerDaySalePrice(
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
