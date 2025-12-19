// 박당 계산 유틸리티 함수들

// 숫자 포맷터
export const formatNumber = (n: number) => n.toLocaleString('ko-KR');

// 문자열 금액 -> number
export const parseAmount = (v: any): number => {
	if (v === null || v === undefined || v === '') return 0;
	const num = parseFloat(String(v).replace(/,/g, ''));
	return isNaN(num) ? 0 : num;
};

// 가격 텍스트에서 숫자와 통화 추출
export const parsePriceFromText = (text: string) => {
	if (!text) return { num: 0, currency: '₩' };
	
	// 통화 기호를 찾을 때, ₩를 우선적으로 찾고, 없으면 $를 찾음
	let currency = '₩';
	let currencyIndex = -1;
	
	const wonIndex = text.indexOf('₩');
	const dollarIndex = text.indexOf('$');
	
	// ₩가 있으면 ₩를 우선 사용, 없으면 $ 사용
	if (wonIndex !== -1) {
		currency = '₩';
		currencyIndex = wonIndex;
	} else if (dollarIndex !== -1) {
		currency = '$';
		currencyIndex = dollarIndex;
	}
	
	let num = 0;
	if (currencyIndex !== -1) {
		// 통화 기호 뒤의 문자열에서 숫자만 추출
		const afterCurrency = text.substring(currencyIndex + 1);
		const numStr = afterCurrency.replace(/[^0-9]/g, '');
		num = parseInt(numStr, 10);
	} else {
		// 통화 기호가 없으면 모든 숫자 추출 (fallback)
		num = parseInt(text.replace(/[^0-9]/g, ''), 10);
	}
	
	return {
		num: isNaN(num) ? 0 : num,
		currency: currency
	};
};

// 랜드사 수수료/할인 금액 변환 (통화 변환)
export const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
	// 최종 판매가는 항상 원화로 표시되므로, 랜드사 수수료가 달러인 경우 무조건 원화로 변환
	if (landCurrency === '$' && usdRate > 0) {
		return value * usdRate;
	}
	
	// 랜드사 수수료가 원화인 경우 그대로 반환
	return value;
};

// 판매가 계산 (기본 요금 + 랜드사 수수료 - 기본 네고 - 특별 네고)
export const calculateSalePrice = (
	basePriceText: string,
	landCommissionTotal: number,
	landDiscountDefaultTotal: number,
	landDiscountSpecialTotal: number,
	landCurrency: string,
	usdRate: number
): number => {
	const { num: baseNum, currency } = parsePriceFromText(basePriceText);
	if (baseNum === 0) return 0;
	
	const commissionAdj = convertLandAmount(landCommissionTotal, currency, landCurrency, usdRate);
	const defaultAdj = convertLandAmount(landDiscountDefaultTotal, currency, landCurrency, usdRate);
	const specialAdj = convertLandAmount(landDiscountSpecialTotal, currency, landCurrency, usdRate);
	
	return Math.max(0, baseNum + commissionAdj - defaultAdj - specialAdj);
};

// 박당 단일 호텔 검색 결과 계산
export const calculatePerDaySearchResult = (
	hotelCost: any,
	selectedRoomType: string,
	selectedPeriodType: string, // "1박", "2박", "3박", "4박", "5박", "6박"
	exchangeRate: any
): { priceText: string; reserveType: string; reservePeriod: string; roomType: string } | null => {
	if (!hotelCost || !hotelCost.costInput) return null;

	for (const cost of hotelCost.costInput) {
		try {
			const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
			if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
				const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
					if (selectedRoomType && rt.roomType !== selectedRoomType) return false;
					if (selectedPeriodType) {
						// 박수 선택 시 dayPersonCost가 있으면 필터링 통과
						let hasPeriod = false;
						if (rt.dayPersonCost && rt.dayPersonCost !== '') {
							// 1박~6박 선택 시 dayPersonCost가 있으면 통과
							if (['1박', '2박', '3박', '4박', '5박', '6박'].includes(selectedPeriodType)) {
								hasPeriod = true;
							}
						}
						if (!hasPeriod) return false;
					}
					return true;
				});

				if (matchingRoom) {
					let currency = matchingRoom.currency || '';
					if (!currency && inputDefault && typeof inputDefault === 'object' && !Array.isArray(inputDefault)) {
						currency = inputDefault.currency || '';
					}
					if (!currency && cost && typeof cost === 'object') {
						currency = cost.currency || '';
					}
					
					const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
					const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
						? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
							? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
							: Number(exchangeRate.USDsend_KRW_tts))
						: 0;
					
					const formatPrice = (v: any) => {
						if (!v || v === '') return '';
						let num = parseFloat(String(v).replace(/,/g, ''));
						if (isNaN(num)) return String(v);
						
						if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
							num = num * exchangeRateValue;
						}
						
						const formatted = Math.round(num).toLocaleString('ko-KR');
						return `₩${formatted}원`;
					};
					
					// 선택한 박수 추출 (1박, 2박, 3박, 4박, 5박, 6박)
					let nights = 1; // 기본값
					if (selectedPeriodType) {
						const nightsMatch = selectedPeriodType.match(/(\d+)박/);
						if (nightsMatch) {
							nights = parseInt(nightsMatch[1], 10);
						}
					}

					// dayPersonCost가 있으면 선택한 박수에 곱하기
					let priceText = '';
					if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
						const dayPersonCostNum = parseFloat(String(matchingRoom.dayPersonCost).replace(/,/g, ''));
						if (!isNaN(dayPersonCostNum)) {
							const totalCost = dayPersonCostNum * nights;
							priceText = `${nights}박: ${formatPrice(String(totalCost))}`;
						}
					} else {
						// dayPersonCost가 없으면 기존 방식 사용
						const parts: string[] = [];
						if (matchingRoom.dayStayCost && matchingRoom.dayStayCost !== '') {
							parts.push(`1박: ${formatPrice(matchingRoom.dayStayCost)}`);
						}
						if (matchingRoom.dayStayCostAll && matchingRoom.dayStayCostAll !== '') {
							parts.push(`합계: ${formatPrice(matchingRoom.dayStayCostAll)}`);
						}
						if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
							parts.push(`1인: ${formatPrice(matchingRoom.dayPersonCost)}`);
						}
						priceText = parts.join(' / ');
					}

					const formatReservePeriod = (reservePeriod: any): string => {
						if (!reservePeriod) return '-';
						try {
							const parsed = typeof reservePeriod === 'string' ? JSON.parse(reservePeriod) : reservePeriod;
							if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.start && parsed.end) {
								const formatDateStr = (d: string) => {
									const [y, m, day] = d.split('-');
									return `${y.slice(2)}년${m}월${day}일`;
								};
								return `${formatDateStr(parsed.start)} ~ ${formatDateStr(parsed.end)}`;
							}
							if (Array.isArray(parsed) && parsed.length >= 2) {
								const formatDateStr = (d: string) => {
									const [y, m, day] = d.split('-');
									return `${y.slice(2)}년${m}월${day}일`;
								};
								return `${formatDateStr(parsed[0])} ~ ${formatDateStr(parsed[1])}`;
							}
						} catch (e) {
							// ignore
						}
						return String(reservePeriod);
					};

					return {
						reserveType: cost.reserveType === 'earlyPeriod' ? '얼리버드' : cost.reserveType === 'default' ? '기본' : cost.reserveType || '-',
						reservePeriod: formatReservePeriod(cost.reservePeriod),
						roomType: matchingRoom.roomType || '-',
						priceText: priceText
					};
				}
			}
		} catch (e) {
			// ignore
		}
	}

	return null;
};

// 박당 조합 검색 결과 계산 (호텔 2개 이상)
export const calculateCombinedHotelSearchResult = (
	scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }>,
	hotelSearchData: Array<{ hotelCost: any; selectedRoomType: string; selectedPeriodType: string }>,
	exchangeRate: any
): { priceText: string; reserveType: string; reservePeriod: string; roomType: string } | null => {
	if (scheduledHotels.length < 2) return null;

	let totalPrice = 0;
	let currency = '';
	let exchangeRateValue = 0;

	scheduledHotels.forEach((hotel, idx) => {
		const searchData = hotelSearchData.find((data, i) => i === idx);
		if (!searchData || !hotel.hotelCost) return;

		const { hotelCost, selectedRoomType, selectedPeriodType } = searchData;
		if (!hotelCost || !hotelCost.costInput) return;

		hotelCost.costInput.forEach((cost: any) => {
			try {
				const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
				if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
					const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
						if (selectedRoomType && rt.roomType !== selectedRoomType) return false;
						if (selectedPeriodType) {
							// 박수 선택 시 dayPersonCost가 있으면 필터링 통과
							let hasPeriod = false;
							if (rt.dayPersonCost && rt.dayPersonCost !== '') {
								// 1박~6박 선택 시 dayPersonCost가 있으면 통과
								if (['1박', '2박', '3박', '4박', '5박', '6박'].includes(selectedPeriodType)) {
									hasPeriod = true;
								}
							}
							if (!hasPeriod) return false;
						}
						return true;
					});

					if (matchingRoom) {
						let currCurrency = matchingRoom.currency || '';
						if (!currCurrency && inputDefault && typeof inputDefault === 'object' && !Array.isArray(inputDefault)) {
							currCurrency = inputDefault.currency || '';
						}
						if (!currency) currency = currCurrency || '';

						const isUSD = currCurrency === '$' || currCurrency === 'USD' || currCurrency === 'US$' || currCurrency === '';
						if (!exchangeRateValue) {
							exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
								? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
									? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
									: Number(exchangeRate.USDsend_KRW_tts))
								: 0;
						}

						// 선택한 박수 추출 (1박, 2박, 3박, 4박, 5박, 6박)
						let nights = 1; // 기본값
						if (selectedPeriodType) {
							const nightsMatch = selectedPeriodType.match(/(\d+)박/);
							if (nightsMatch) {
								nights = parseInt(nightsMatch[1], 10);
							}
						}

						let priceNum = 0;
						if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
							const dayPersonCostNum = parseFloat(String(matchingRoom.dayPersonCost).replace(/,/g, ''));
							if (!isNaN(dayPersonCostNum)) {
								const totalCost = dayPersonCostNum * nights;
								priceNum = totalCost * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							}
						}

						if (priceNum > 0) {
							totalPrice += priceNum;
						}
					}
				}
			} catch (e) {
				// ignore
			}
		});
	});

	if (totalPrice === 0) return null;

	const cur = currency || '₩';
	const totalPriceText = `${cur}${formatNumber(Math.round(totalPrice))}${cur === '₩' ? '원' : ''}`;

	const firstHotel = scheduledHotels[0];
	if (firstHotel && firstHotel.hotelCost && firstHotel.hotelCost.costInput && firstHotel.hotelCost.costInput.length > 0) {
		const firstCost = firstHotel.hotelCost.costInput[0];
		const formatReservePeriod = (reservePeriod: any): string => {
			if (!reservePeriod) return '-';
			try {
				const parsed = typeof reservePeriod === 'string' ? JSON.parse(reservePeriod) : reservePeriod;
				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.start && parsed.end) {
					const formatDateStr = (d: string) => {
						const [y, m, day] = d.split('-');
						return `${y.slice(2)}년${m}월${day}일`;
					};
					return `${formatDateStr(parsed.start)} ~ ${formatDateStr(parsed.end)}`;
				}
			} catch (e) {
				// ignore
			}
			return String(reservePeriod);
		};

		return {
			reserveType: firstCost.reserveType === 'earlyPeriod' ? '얼리버드' : firstCost.reserveType === 'default' ? '기본' : firstCost.reserveType || '-',
			reservePeriod: formatReservePeriod(firstCost.reservePeriod),
			roomType: '-',
			priceText: totalPriceText
		};
	}

	return null;
};

