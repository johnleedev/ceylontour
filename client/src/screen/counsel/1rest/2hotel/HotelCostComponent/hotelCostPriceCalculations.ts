import { calculatePoolvillaFinalPrice } from '../../hotelPriceManage/poolvillaPriceCalculation';
import { calculateMinimumStayFinalPrice } from '../../hotelPriceManage/minimumStayPriceCalculation';
import { calculatePerDayFinalPrice } from '../../hotelPriceManage/perDayPriceCalculation';
import { calculateSalePrice } from '../../hotelPriceManage/poolvillaPriceUtils';
import { extractNightsNumber } from './hotelCostUtils';

// 팩요금 가격 계산
export const calculatePoolvillaPrice = (
  productInfo: any,
  scheduleCards: any[],
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number,
  getRoomTypesForCard: (card: any) => string[]
): number | null => {
  if (productInfo?.costType !== '팩요금') return null;
  if (!productInfo?.productScheduleData) return null;
  if (scheduleCards.length === 0) return null;

  const result = calculatePoolvillaFinalPrice(
    productInfo.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    calculateSalePrice,
    getRoomTypesForCard
  );

  return result;
};

// 미니멈스테이 가격 계산
export const calculateMinimumStayPrice = (
  productInfo: any,
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  scheduleCards: any[],
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number,
  exchangeRate: any
): number | null => {
  return calculateMinimumStayFinalPrice(
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    scheduleCards,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    exchangeRate
  );
};

// 박당 가격 계산
export const calculatePerDayPrice = (
  productInfo: any,
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number,
  exchangeRate: any
): number | null => {
  return calculatePerDayFinalPrice(
    productInfo?.costType,
    productInfo?.productScheduleData,
    hotel1Cost,
    hotel2Cost,
    hotel3Cost,
    hotel4Cost,
    selectedRoomTypes,
    selectedNights,
    landCommissionTotal,
    landDiscountDefaultTotal,
    landDiscountSpecialTotal,
    landCurrency,
    usdRate,
    exchangeRate
  );
};

// 박당 가격 상세 계산 (perDayPrices)
export const calculatePerDayPrices = (
  productInfo: any,
  scheduleCards: any[],
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  exchangeRate: any,
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number
): { totalBasePriceInKRW: number; calculatedSalePrice: number } | null => {
    if (productInfo?.costType !== '박당') return null;
    
    const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
    const hotels: any[] = [];
    const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
      ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
          ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
          : Number(exchangeRate.USDsend_KRW_tts))
      : 0;

    scheduleCards.forEach((card, cardIndex) => {
      let hotelCost: any | null = null;
      let hotelIndex = -1;

      if (productInfo?.productScheduleData) {
        try {
          const scheduleData = JSON.parse(productInfo.productScheduleData);
          if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } catch {
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }
      } else {
        hotelIndex = cardIndex;
        hotelCost = allHotelCosts[hotelIndex];
      }

      if (hotelCost) {
        const roomType = selectedRoomTypes[card.id] || '';
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
        let rawFieldValue: any = null;
        let fieldValueInKRW: number | null = null;

        if (nights > 0) {
          if (Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
            const firstCost = hotelCost.costInput[0];
            let parsed: any = firstCost.inputDefault;
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch {
                // ignore
              }
            }
            const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
            const roomList = defaultsArr.flatMap((def: any) =>
              Array.isArray(def.costByRoomType) ? def.costByRoomType : []
            );
            const room =
              (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
              roomList[0] ||
              null;
            if (room && room.dayPersonCost !== undefined && room.dayPersonCost !== '') {
              rawFieldValue = room.dayPersonCost;
              
              let currency: string = '';
              currency = room.currency || '';
              if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                currency = parsed.currency || '';
              }
              if (!currency && firstCost && typeof firstCost === 'object') {
                currency = firstCost.currency || '';
              }

              const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
              if (rawFieldValue && rawFieldValue !== '') {
                const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                if (!isNaN(usdAmount)) {
                  // dayPersonCost에 박수를 곱함
                  const dayPersonCostInKRW = isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)
                    ? Math.round(usdAmount * exchangeRateValue)
                    : Math.round(usdAmount);
                  fieldValueInKRW = dayPersonCostInKRW * nights;
                }
              }
            }
          }
        }

        if (fieldValueInKRW !== null) {
          hotels.push({ fieldValueInKRW });
        }
      }
    });

    if (hotels.length === 0) return null;

    const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
      return sum + (hotel.fieldValueInKRW || 0);
    }, 0);

    // 랜드사 수수료/할인 적용 계산
    const basePriceText = `₩${totalBasePriceInKRW.toLocaleString('ko-KR')}원`;
    const parsePriceFromText = (text: string) => {
      if (!text) return { num: 0, currency: '₩' };
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      const currencyMatch = text.match(/₩|\$/);
      return {
        num: isNaN(num) ? 0 : num,
        currency: currencyMatch ? currencyMatch[0] : '₩'
      };
    };
    const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
      if (baseCurrency === '₩') {
        if (landCurrency === '$' && usdRate > 0) return value * usdRate;
        return value;
      }
      if (baseCurrency === '$') {
        if (landCurrency === '$') return value;
        if (landCurrency === '₩' && usdRate > 0) return value / usdRate;
      }
      return value;
    };
    const { num: baseNum, currency: baseCurrency } = parsePriceFromText(basePriceText);
    const commissionAdj = convertLandAmount(landCommissionTotal, baseCurrency, landCurrency, usdRate);
    const defaultAdj = convertLandAmount(landDiscountDefaultTotal, baseCurrency, landCurrency, usdRate);
    const specialAdj = convertLandAmount(landDiscountSpecialTotal, baseCurrency, landCurrency, usdRate);
    const calculatedSalePrice = Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);

    return {
      totalBasePriceInKRW,
      calculatedSalePrice
    };
};

// 미니멈스테이 가격 상세 계산 (minimumStayPrices)
export const calculateMinimumStayPrices = (
  productInfo: any,
  scheduleCards: any[],
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  exchangeRate: any,
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number
): { totalBasePriceInKRW: number; calculatedSalePrice: number } | null => {
    if (productInfo?.costType !== '미니멈스테이') return null;
    
    const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
    const hotels: any[] = [];
    const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
      ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
          ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
          : Number(exchangeRate.USDsend_KRW_tts))
      : 0;

    const getNightCostKey = (n: number): string | null => {
      if (n === 1) return 'oneNightCost';
      if (n === 2) return 'twoNightCost';
      if (n === 3) return 'threeNightCost';
      if (n === 4) return 'fourNightCost';
      if (n === 5) return 'fiveNightCost';
      if (n === 6) return 'sixNightCost';
      return null;
    };

    scheduleCards.forEach((card, cardIndex) => {
      let hotelCost: any | null = null;
      let hotelIndex = -1;

      if (productInfo?.productScheduleData) {
        try {
          const scheduleData = JSON.parse(productInfo.productScheduleData);
          if (Array.isArray(scheduleData) && scheduleData.length > cardIndex) {
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } catch {
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }
      } else {
        hotelIndex = cardIndex;
        hotelCost = allHotelCosts[hotelIndex];
      }

      if (hotelCost) {
        const roomType = selectedRoomTypes[card.id] || '';
        const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
        let rawFieldKey: string | null = null;
        let rawFieldValue: any = null;
        let fieldValueInKRW: number | null = null;

        if (nights > 0) {
          rawFieldKey = getNightCostKey(nights);
          
          if (rawFieldKey && Array.isArray(hotelCost.costInput) && hotelCost.costInput.length > 0) {
            const firstCost = hotelCost.costInput[0];
            let parsed: any = firstCost.inputDefault;
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch {
                // ignore
              }
            }
            const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
            const roomList = defaultsArr.flatMap((def: any) =>
              Array.isArray(def.costByRoomType) ? def.costByRoomType : []
            );
            const room =
              (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
              roomList[0] ||
              null;
            if (room && rawFieldKey && room[rawFieldKey] !== undefined) {
              rawFieldValue = room[rawFieldKey];
              
              let currency: string = '';
              currency = room.currency || '';
              if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                currency = parsed.currency || '';
              }
              if (!currency && firstCost && typeof firstCost === 'object') {
                currency = firstCost.currency || '';
              }

              const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
              if (rawFieldValue && rawFieldValue !== '') {
                const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                if (!isNaN(usdAmount)) {
                  if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
                    fieldValueInKRW = Math.round(usdAmount * exchangeRateValue);
                  } else {
                    fieldValueInKRW = Math.round(usdAmount);
                  }
                }
              }
            }
          }
        }

        if (fieldValueInKRW !== null) {
          hotels.push({ fieldValueInKRW });
        }
      }
    });

    if (hotels.length === 0) return null;

    const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
      return sum + (hotel.fieldValueInKRW || 0);
    }, 0);

    // 랜드사 수수료/할인 적용 계산
    const basePriceText = `₩${totalBasePriceInKRW.toLocaleString('ko-KR')}원`;
    const parsePriceFromText = (text: string) => {
      if (!text) return { num: 0, currency: '₩' };
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      const currencyMatch = text.match(/₩|\$/);
      return {
        num: isNaN(num) ? 0 : num,
        currency: currencyMatch ? currencyMatch[0] : '₩'
      };
    };
    const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
      if (baseCurrency === '₩') {
        if (landCurrency === '$' && usdRate > 0) return value * usdRate;
        return value;
      }
      if (baseCurrency === '$') {
        if (landCurrency === '$') return value;
        if (landCurrency === '₩' && usdRate > 0) return value / usdRate;
      }
      return value;
    };
    const { num: baseNum, currency: baseCurrency } = parsePriceFromText(basePriceText);
    const commissionAdj = convertLandAmount(landCommissionTotal, baseCurrency, landCurrency, usdRate);
    const defaultAdj = convertLandAmount(landDiscountDefaultTotal, baseCurrency, landCurrency, usdRate);
    const specialAdj = convertLandAmount(landDiscountSpecialTotal, baseCurrency, landCurrency, usdRate);
    const calculatedSalePrice = Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);

    return {
      totalBasePriceInKRW,
      calculatedSalePrice
    };
};

// 최종 1인요금 계산
export const calculateFinalPricePerPerson = (
  productInfo: any,
  calculatedPoolvillaPrice: number | null,
  calculatedMinimumStayPrice: number | null,
  calculatedPerDayPrice: number | null,
  minimumStayPrices: { totalBasePriceInKRW: number; calculatedSalePrice: number } | null,
  perDayPrices: { totalBasePriceInKRW: number; calculatedSalePrice: number } | null,
  pricePerPerson: number
): number => {
  if (productInfo?.costType === '팩요금') {
    const price = calculatedPoolvillaPrice ?? pricePerPerson;
    return price;
  } else if (productInfo?.costType === '미니멈스테이') {
    // 미니멈스테이의 경우 totalBasePriceInKRW를 1인요금으로 사용
    if (minimumStayPrices && minimumStayPrices.totalBasePriceInKRW > 0) {
      return minimumStayPrices.totalBasePriceInKRW;
    }
    return calculatedMinimumStayPrice ?? 0;
  } else if (productInfo?.costType === '박당') {
    // 박당의 경우 totalBasePriceInKRW를 1인요금으로 사용
    if (perDayPrices && perDayPrices.totalBasePriceInKRW > 0) {
      return perDayPrices.totalBasePriceInKRW;
    }
    return calculatedPerDayPrice ?? 0;
  }
  return pricePerPerson;
};

// 최종 총요금 계산
export const calculateFinalTotalPrice = (
  productInfo: any,
  minimumStayPrices: { totalBasePriceInKRW: number; calculatedSalePrice: number } | null,
  perDayPrices: { totalBasePriceInKRW: number; calculatedSalePrice: number } | null,
  finalPricePerPerson: number,
  guestCount: number
): number => {
  if (productInfo?.costType === '미니멈스테이' && minimumStayPrices && minimumStayPrices.calculatedSalePrice > 0) {
    return minimumStayPrices.calculatedSalePrice;
  }
  if (productInfo?.costType === '박당' && perDayPrices && perDayPrices.calculatedSalePrice > 0) {
    return perDayPrices.calculatedSalePrice;
  }
  // 요금이 없으면 0 반환
  if (finalPricePerPerson <= 0) {
    return 0;
  }
  return finalPricePerPerson * guestCount;
};

