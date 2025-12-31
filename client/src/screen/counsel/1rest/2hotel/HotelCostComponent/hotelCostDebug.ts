import { comboRules } from '../../hotelPriceManage/poolvillaPriceUtils';
import { extractNightsNumber, getPeriodType } from './hotelCostUtils';

// 디버깅 정보 생성 함수
export const createDebugInfo = (
  productInfo: any,
  finalPricePerPerson: number,
  guestCount: number,
  hotel1Cost: any,
  hotel2Cost: any,
  hotel3Cost: any,
  hotel4Cost: any,
  selectedRoomTypes: { [key: number]: string },
  selectedNights: { [key: number]: number },
  scheduleCards: any[],
  calculatedPoolvillaPrice: number | null,
  calculatedMinimumStayPrice: number | null,
  calculatedPerDayPrice: number | null,
  pricePerPerson: number,
  exchangeRate: any,
  landCommissionTotal: number,
  landDiscountDefaultTotal: number,
  landDiscountSpecialTotal: number,
  landCurrency: string,
  usdRate: number
): any => {
  if (!productInfo) return null;
  
  // 팩요금인 경우 finalPricePerPerson이 0이어도 디버깅 로그 출력
  const isPackCost = productInfo.costType === '팩요금';
  if (!isPackCost && finalPricePerPerson <= 0) return null;

  const totalPrice = finalPricePerPerson > 0 ? finalPricePerPerson * guestCount : 0;

  const debug: any = {
    costType: productInfo.costType,
    finalPricePerPerson,
    guestCount,
    totalPrice,
    selectedRoomTypes,
    selectedNights,
    scheduleCards: scheduleCards.map(c => ({ id: c.id, badge: c.badge, title: c.title })),
    calculatedPoolvillaPrice,
    calculatedMinimumStayPrice,
    calculatedPerDayPrice,
    pricePerPerson,
    hotelCosts: {
      hotel1Cost: hotel1Cost ? { hasCostInput: !!hotel1Cost.costInput, costInputLength: hotel1Cost.costInput?.length || 0 } : null,
      hotel2Cost: hotel2Cost ? { hasCostInput: !!hotel2Cost.costInput, costInputLength: hotel2Cost.costInput?.length || 0 } : null,
      hotel3Cost: hotel3Cost ? { hasCostInput: !!hotel3Cost.costInput, costInputLength: hotel3Cost.costInput?.length || 0 } : null,
      hotel4Cost: hotel4Cost ? { hasCostInput: !!hotel4Cost.costInput, costInputLength: hotel4Cost.costInput?.length || 0 } : null,
    }
  };

  // 팩요금(풀빌라 콤보)의 경우, 어떤 호텔/룸타입/필드(twoTwoDayCost 등)를 사용했는지 추적
  if (productInfo.costType === '팩요금') {
    try {
      const periodType = getPeriodType(scheduleCards, selectedNights); // 예: '2+2', '1+3'
      const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
      const hotels: any[] = [];

      // 첫 번째 리조트와 풀빌라의 박수만 사용 (3개 조합의 경우)
      const resortCards = scheduleCards.filter(card => card.badge === '리조트');
      const poolCards = scheduleCards.filter(card => card.badge === '풀빌라');
      const firstResortCard = resortCards[0];
      const firstPoolCard = poolCards[0];
      
      let resortNights = 0;
      let poolNights = 0;
      if (firstResortCard) {
        resortNights = selectedNights[firstResortCard.id] || extractNightsNumber(firstResortCard.nights || '');
      }
      if (firstPoolCard) {
        poolNights = selectedNights[firstPoolCard.id] || extractNightsNumber(firstPoolCard.nights || '');
      }

      // comboRules에서 사용한 baseKey(twoTwoDayCost, oneThreeDayCost 등) 찾기
      const rule = comboRules.find(r => r.resortNights === resortNights && r.poolNights === poolNights);

      // scheduleCards와 hotelCosts를 매칭하여 각 호텔 정보 수집
      scheduleCards.forEach((card, cardIndex) => {
        // productScheduleData를 기반으로 호텔 인덱스 찾기
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
            // 파싱 실패 시 인덱스 기반으로 매칭
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } else {
          // productScheduleData가 없으면 인덱스 기반으로 매칭
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }

        if (hotelCost) {
          const roomType = selectedRoomTypes[card.id] || '';
          const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');

          let rawFieldKey: string | null = null;
          let rawFieldValue: any = null;
          let currency: string = '';

          if (card.badge === '리조트') {
            // 리조트의 경우: 첫 번째 리조트는 dayAddCost, 추가 리조트는 forPreAddCost 사용
            const resortCards = scheduleCards.filter(c => c.badge === '리조트');
            const isFirstResort = resortCards.indexOf(card) === 0;
            
            if (isFirstResort) {
              // 첫 번째 리조트: dayAddCost 사용
              rawFieldKey = 'dayAddCost';
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
                const list = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                if (list.length > 0) {
                  rawFieldValue = list[0].dayAddCost;
                  currency = list[0].currency || '';
                }
              }
            } else {
              // 추가 리조트: dayAddCost 사용
              rawFieldKey = 'dayAddCost';
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
                const list = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                if (list.length > 0) {
                  rawFieldValue = list[0].dayAddCost;
                  currency = list[0].currency || '';
                }
              }
            }
          } else if (card.badge === '풀빌라') {
            // 풀빌라의 경우: 
            // '리조트 + 풀빌라1 + 풀빌라2' 조합에서
            // - 풀빌라1(첫 번째, 중간): forPreAddCost 사용
            // - 풀빌라2(두 번째, 맨뒤): baseKey 사용 (리조트와 풀빌라2의 조합)
            const poolVillaCards = scheduleCards.filter(c => c.badge === '풀빌라');
            const isFirstPoolVilla = poolVillaCards.indexOf(card) === 0;
            const isSecondPoolVilla = poolVillaCards.indexOf(card) === 1;
            
            // 리조트가 있고 풀빌라가 2개인 경우 (리조트 + 풀빌라1 + 풀빌라2 조합)
            const resortCards = scheduleCards.filter(c => c.badge === '리조트');
            if (resortCards.length === 1 && poolVillaCards.length === 2) {
              if (isFirstPoolVilla) {
                // 풀빌라1(중간): preStay 값에 따라 요금 필드 결정
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
                  
                  // preStay 값 확인 (첫 번째 요소의 preStay 사용)
                  const firstDef = defaultsArr[0] || {};
                  const preStay = firstDef.preStay;
                  
                  // preStay에 따라 필드 키 결정
                  if (preStay === 'true' || preStay === true) {
                    // preStay가 true인 경우: forPreAddCost 사용
                    rawFieldKey = 'forPreAddCost';
                  } else {
                    // preStay가 false인 경우: 박수에 따라 필드 결정
                    if (nights === 2) {
                      rawFieldKey = 'twoTwoDayCost';
                    } else if (nights === 3) {
                      rawFieldKey = 'oneThreeDayCost';
                    } else if (nights === 4) {
                      rawFieldKey = 'fourDayCost';
                    } else {
                      // 기본값으로 forPreAddCost 사용
                      rawFieldKey = 'forPreAddCost';
                    }
                  }
                  
                  const roomList = defaultsArr.flatMap((def: any) =>
                    Array.isArray(def.costByRoomType) ? def.costByRoomType : []
                  );
                  const room =
                    (roomType && roomList.find((r: any) => r.roomType === roomType)) ||
                    roomList[0] ||
                    null;
                  
                  if (room && rawFieldKey && room[rawFieldKey] !== undefined && room[rawFieldKey] !== '') {
                    rawFieldValue = room[rawFieldKey];
                    currency = room.currency || '';
                  }
                }
              } else if (isSecondPoolVilla && rule) {
                // 풀빌라2(맨뒤): baseKey 사용
                rawFieldKey = rule.baseKey;
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
                  if (room && rule.baseKey && room[rule.baseKey] !== undefined) {
                    rawFieldValue = room[rule.baseKey];
                    currency = room.currency || '';
                  }
                }
              }
            } else if (isFirstPoolVilla && rule) {
              // 일반 조합 (리조트 + 풀빌라): baseKey 사용
              rawFieldKey = rule.baseKey;
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
                if (room && rule.baseKey && room[rule.baseKey] !== undefined) {
                  rawFieldValue = room[rule.baseKey];
                  currency = room.currency || '';
                }
              }
            }
          }

          hotels.push({
            hotelId: hotelCost.hotel?.id ?? null,
            hotelName: hotelCost.hotel?.hotelNameKo ?? null,
            hotelSort: card.badge || null,
            roomType: roomType || null,
            nights: nights || null,
            fieldKey: rawFieldKey,
            fieldValue: rawFieldValue,
            currency: currency || null
          });
        }
      });

      if (hotels.length > 0) {
        debug.periodType = periodType;
        debug.resortNights = resortNights;
        debug.poolNights = poolNights;
        debug.hotels = hotels;
        
        // 하위 호환성을 위해 단일 호텔인 경우 최상위에도 추가
        if (hotels.length === 1) {
          debug.hotelId = hotels[0].hotelId;
          debug.hotelName = hotels[0].hotelName;
          debug.roomType = hotels[0].roomType;
          debug.fieldKey = hotels[0].fieldKey;
          debug.fieldValue = hotels[0].fieldValue;
        }
      }
    } catch (e) {
      // 디버깅용이므로 실패해도 앱 동작에는 영향 없음
    }
  }

  // 미니멈스테이의 경우, 어떤 호텔/룸타입/필드(oneNightCost, twoNightCost 등)를 사용했는지 추적
  if (productInfo.costType === '미니멈스테이') {
    try {
      const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
      const hotels: any[] = [];

      // 박수에 따른 필드 키 매핑
      const getNightCostKey = (n: number): string | null => {
        if (n === 1) return 'oneNightCost';
        if (n === 2) return 'twoNightCost';
        if (n === 3) return 'threeNightCost';
        if (n === 4) return 'fourNightCost';
        if (n === 5) return 'fiveNightCost';
        if (n === 6) return 'sixNightCost';
        return null;
      };

      // 환율 정보 가져오기
      const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
        ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
            ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
            : Number(exchangeRate.USDsend_KRW_tts))
        : 0;

      // scheduleCards와 hotelCosts를 매칭
      scheduleCards.forEach((card, cardIndex) => {
        // productScheduleData를 기반으로 호텔 인덱스 찾기
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
            // 파싱 실패 시 인덱스 기반으로 매칭
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } else {
          // productScheduleData가 없으면 인덱스 기반으로 매칭
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }

        if (hotelCost) {
          const roomType = selectedRoomTypes[card.id] || '';
          const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');

          let rawFieldKey: string | null = null;
          let rawFieldValue: any = null;
          let currency: string = '';
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
                
                // 통화 정보 확인
                currency = room.currency || '';
                if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                  currency = parsed.currency || '';
                }
                if (!currency && firstCost && typeof firstCost === 'object') {
                  currency = firstCost.currency || '';
                }

                // 달러인 경우 환율 적용해서 원화로 변환
                const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
                if (rawFieldValue && rawFieldValue !== '') {
                  const usdAmount = parseFloat(String(rawFieldValue).replace(/,/g, ''));
                  if (!isNaN(usdAmount)) {
                    if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
                      fieldValueInKRW = Math.round(usdAmount * exchangeRateValue);
                    } else {
                      // 이미 원화인 경우
                      fieldValueInKRW = Math.round(usdAmount);
                    }
                  }
                }
              }
            }
          }

          hotels.push({
            hotelId: hotelCost.hotel?.id ?? null,
            hotelName: hotelCost.hotel?.hotelNameKo ?? null,
            roomType: roomType || null,
            nights: nights || null,
            fieldKey: rawFieldKey,
            fieldValue: rawFieldValue,
            currency: currency || null,
            exchangeRate: exchangeRateValue > 0 ? exchangeRateValue : null,
            fieldValueInKRW: fieldValueInKRW
          });
        }
      });

      if (hotels.length > 0) {
        debug.hotels = hotels;
        // 전체 환율 정보 추가
        const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
          ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
              ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
              : Number(exchangeRate.USDsend_KRW_tts))
          : 0;
        if (exchangeRateValue > 0) {
          debug.exchangeRate = exchangeRateValue;
        }

        // 각 호텔의 원화 요금 합계 계산
        const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
          return sum + (hotel.fieldValueInKRW || 0);
        }, 0);
        debug.totalBasePriceInKRW = totalBasePriceInKRW;

        // 랜드사 수수료/할인 정보 추가
        debug.landCommissionTotal = landCommissionTotal;
        debug.landDiscountDefaultTotal = landDiscountDefaultTotal;
        debug.landDiscountSpecialTotal = landDiscountSpecialTotal;
        debug.landCurrency = landCurrency;
        debug.usdRate = usdRate;

        // 랜드사 수수료/할인 적용 계산 (실제 계산 로직과 동일하게)
        // calculateSalePrice 로직을 재현
        // basePriceText는 "₩1,858,629원" 형식이라고 가정
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
        debug.calculatedSalePrice = calculatedSalePrice;
        debug.calculationBreakdown = {
          basePrice: baseNum,
          commissionAdj,
          defaultDiscountAdj: defaultAdj,
          specialDiscountAdj: specialAdj,
          finalPrice: calculatedSalePrice
        };
        
        // 단일 호텔인 경우 하위 호환성을 위해 최상위에도 추가
        if (hotels.length === 1) {
          debug.hotelId = hotels[0].hotelId;
          debug.hotelName = hotels[0].hotelName;
          debug.roomType = hotels[0].roomType;
          debug.nights = hotels[0].nights;
          debug.fieldKey = hotels[0].fieldKey;
          debug.fieldValue = hotels[0].fieldValue;
          debug.currency = hotels[0].currency;
          debug.exchangeRate = hotels[0].exchangeRate;
          debug.fieldValueInKRW = hotels[0].fieldValueInKRW;
        }
      }
    } catch (e) {
      // 디버깅용이므로 실패해도 앱 동작에는 영향 없음
    }
  }

  // 박당의 경우, 어떤 호텔/룸타입/필드(dayPersonCost 등)를 사용했는지 추적
  if (productInfo.costType === '박당') {
    try {
      const allHotelCosts = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost];
      const hotels: any[] = [];

      // 환율 정보 가져오기
      const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
        ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
            ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
            : Number(exchangeRate.USDsend_KRW_tts))
        : 0;

      // scheduleCards와 hotelCosts를 매칭
      scheduleCards.forEach((card, cardIndex) => {
        // productScheduleData를 기반으로 호텔 인덱스 찾기
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
            // 파싱 실패 시 인덱스 기반으로 매칭
            hotelIndex = cardIndex;
            hotelCost = allHotelCosts[hotelIndex];
          }
        } else {
          // productScheduleData가 없으면 인덱스 기반으로 매칭
          hotelIndex = cardIndex;
          hotelCost = allHotelCosts[hotelIndex];
        }

        if (hotelCost) {
          const roomType = selectedRoomTypes[card.id] || '';
          const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');

          let rawFieldKey: string | null = 'dayPersonCost';
          let rawFieldValue: any = null;
          let currency: string = '';
          let fieldValueInKRW: number | null = null;

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
            if (room && rawFieldKey && room[rawFieldKey] !== undefined && room[rawFieldKey] !== '') {
              rawFieldValue = room[rawFieldKey];
              
              // 통화 정보 확인
              currency = room.currency || '';
              if (!currency && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                currency = parsed.currency || '';
              }
              if (!currency && firstCost && typeof firstCost === 'object') {
                currency = firstCost.currency || '';
              }

              // 달러인 경우 환율 적용해서 원화로 변환
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

          hotels.push({
            hotelId: hotelCost.hotel?.id ?? null,
            hotelName: hotelCost.hotel?.hotelNameKo ?? null,
            roomType: roomType || null,
            nights: nights || null,
            fieldKey: rawFieldKey,
            fieldValue: rawFieldValue,
            currency: currency || null,
            exchangeRate: exchangeRateValue > 0 ? exchangeRateValue : null,
            fieldValueInKRW: fieldValueInKRW
          });
        }
      });

      if (hotels.length > 0) {
        debug.hotels = hotels;
        // 전체 환율 정보 추가
        const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
          ? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
              ? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
              : Number(exchangeRate.USDsend_KRW_tts))
          : 0;
        if (exchangeRateValue > 0) {
          debug.exchangeRate = exchangeRateValue;
        }

        // 각 호텔의 원화 요금 합계 계산
        const totalBasePriceInKRW = hotels.reduce((sum, hotel) => {
          return sum + (hotel.fieldValueInKRW || 0);
        }, 0);
        debug.totalBasePriceInKRW = totalBasePriceInKRW;

        // 랜드사 수수료/할인 정보 추가
        debug.landCommissionTotal = landCommissionTotal;
        debug.landDiscountDefaultTotal = landDiscountDefaultTotal;
        debug.landDiscountSpecialTotal = landDiscountSpecialTotal;
        debug.landCurrency = landCurrency;
        debug.usdRate = usdRate;

        // 랜드사 수수료/할인 적용 계산 (실제 계산 로직과 동일하게)
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
        debug.calculatedSalePrice = calculatedSalePrice;
        debug.calculationBreakdown = {
          basePrice: baseNum,
          commissionAdj,
          defaultDiscountAdj: defaultAdj,
          specialDiscountAdj: specialAdj,
          finalPrice: calculatedSalePrice
        };
        
        // 단일 호텔인 경우 하위 호환성을 위해 최상위에도 추가
        if (hotels.length === 1) {
          debug.hotelId = hotels[0].hotelId;
          debug.hotelName = hotels[0].hotelName;
          debug.roomType = hotels[0].roomType;
          debug.nights = hotels[0].nights;
          debug.fieldKey = hotels[0].fieldKey;
          debug.fieldValue = hotels[0].fieldValue;
          debug.currency = hotels[0].currency;
          debug.exchangeRate = hotels[0].exchangeRate;
          debug.fieldValueInKRW = hotels[0].fieldValueInKRW;
        }
      }
    } catch (e) {
      // 디버깅용이므로 실패해도 앱 동작에는 영향 없음
    }
  }

  return debug;
};

