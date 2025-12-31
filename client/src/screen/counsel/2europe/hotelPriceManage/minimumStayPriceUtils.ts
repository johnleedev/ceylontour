// 미니멈스테이 계산 유틸리티 함수들

// 조합 규칙 정의 (리조트 박수 조합)
export const resortComboRules2 = [
	{ key: 'R_1_2', nights: [1, 2] },
	{ key: 'R_1_3', nights: [1, 3] },
	{ key: 'R_1_4', nights: [1, 4] },
	{ key: 'R_1_5', nights: [1, 5] },
	{ key: 'R_2_2', nights: [2, 2] },
	{ key: 'R_2_3', nights: [2, 3] },
	{ key: 'R_2_4', nights: [2, 4] },
	{ key: 'R_3_2', nights: [3, 2] },
	{ key: 'R_3_3', nights: [3, 3] },
	{ key: 'R_4_2', nights: [4, 2] }
];

export const resortComboRules3 = [
	{ key: 'R_1_1_1', nights: [1, 1, 1] },
	{ key: 'R_1_1_2', nights: [1, 1, 2] },
	{ key: 'R_1_1_3', nights: [1, 1, 3] },
	{ key: 'R_1_1_4', nights: [1, 1, 4] },
	{ key: 'R_1_2_1', nights: [1, 2, 1] },
	{ key: 'R_1_2_2', nights: [1, 2, 2] },
	{ key: 'R_1_2_3', nights: [1, 2, 3] },
	{ key: 'R_2_1_1', nights: [2, 1, 1] },
	{ key: 'R_2_1_2', nights: [2, 1, 2] },
	{ key: 'R_2_1_3', nights: [2, 1, 3] },
	{ key: 'R_2_2_1', nights: [2, 2, 1] },
	{ key: 'R_2_2_2', nights: [2, 2, 2] }
];

// 숫자 포맷터
export const formatNumber = (n: number) => n.toLocaleString('ko-KR');

// 문자열 금액 -> number
export const parseAmount = (v: any): number => {
	if (v === null || v === undefined || v === '') return 0;
	const num = parseFloat(String(v).replace(/,/g, ''));
	return isNaN(num) ? 0 : num;
};

// nights 문자열 -> number (예: "2박" -> 2)
export const parseNights = (str: string | undefined): number => {
	if (!str) return 0;
	const m = str.match(/(\d+)/);
	return m ? parseInt(m[1], 10) : 0;
};

// 가격 텍스트에서 숫자와 통화 추출
export const parsePriceFromText = (text: string) => {
	if (!text) return { num: 0, currency: '₩' };
	const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
	const currencyMatch = text.match(/₩|\$/);
	return {
		num: isNaN(num) ? 0 : num,
		currency: currencyMatch ? currencyMatch[0] : '₩'
	};
};

// 랜드사 수수료/할인 금액 변환 (통화 변환)
export const convertLandAmount = (value: number, baseCurrency: string, landCurrency: string, usdRate: number) => {
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

// 박수에 따른 요금 키 반환
export const getNightCostKey = (n: number): string | null => {
	if (n === 1) return 'oneNightCost';
	if (n === 2) return 'twoNightCost';
	if (n === 3) return 'threeNightCost';
	if (n === 4) return 'fourNightCost';
	if (n === 5) return 'fiveNightCost';
	if (n === 6) return 'sixNightCost';
	return null;
};

// 미니멈스테이 단일 호텔 검색 결과 계산
export const calculateMinimumStaySearchResult = (
	hotelCost: any,
	selectedRoomType: string,
	selectedPeriodType: string, // "1박", "2박", "3박", "4박", "5박", "6박", "1박추가"
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
						let hasPeriod = false;
						if (selectedPeriodType === '1박' && rt.oneNightCost && rt.oneNightCost !== '') hasPeriod = true;
						if (selectedPeriodType === '2박' && rt.twoNightCost && rt.twoNightCost !== '') hasPeriod = true;
						if (selectedPeriodType === '3박' && rt.threeNightCost && rt.threeNightCost !== '') hasPeriod = true;
						if (selectedPeriodType === '4박' && rt.fourNightCost && rt.fourNightCost !== '') hasPeriod = true;
						if (selectedPeriodType === '5박' && rt.fiveNightCost && rt.fiveNightCost !== '') hasPeriod = true;
						if (selectedPeriodType === '6박' && rt.sixNightCost && rt.sixNightCost !== '') hasPeriod = true;
						if (selectedPeriodType === '1박추가' && rt.oneNightAdd && rt.oneNightAdd !== '') hasPeriod = true;
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
					
					let priceText = '';
					if (selectedPeriodType) {
						if (selectedPeriodType === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
							priceText = `1박: ${formatPrice(matchingRoom.oneNightCost)}`;
						} else if (selectedPeriodType === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
							priceText = `2박: ${formatPrice(matchingRoom.twoNightCost)}`;
						} else if (selectedPeriodType === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
							priceText = `3박: ${formatPrice(matchingRoom.threeNightCost)}`;
						} else if (selectedPeriodType === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
							priceText = `4박: ${formatPrice(matchingRoom.fourNightCost)}`;
						} else if (selectedPeriodType === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
							priceText = `5박: ${formatPrice(matchingRoom.fiveNightCost)}`;
						} else if (selectedPeriodType === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
							priceText = `6박: ${formatPrice(matchingRoom.sixNightCost)}`;
						} else if (selectedPeriodType === '1박추가' && matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
							priceText = `1박추가: ${formatPrice(matchingRoom.oneNightAdd)}`;
						}
					} else {
						const parts: string[] = [];
						if (matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') parts.push(`1박: ${formatPrice(matchingRoom.oneNightCost)}`);
						if (matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') parts.push(`2박: ${formatPrice(matchingRoom.twoNightCost)}`);
						if (matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') parts.push(`3박: ${formatPrice(matchingRoom.threeNightCost)}`);
						if (matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') parts.push(`4박: ${formatPrice(matchingRoom.fourNightCost)}`);
						if (matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') parts.push(`5박: ${formatPrice(matchingRoom.fiveNightCost)}`);
						if (matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') parts.push(`6박: ${formatPrice(matchingRoom.sixNightCost)}`);
						if (matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') parts.push(`1박추가: ${formatPrice(matchingRoom.oneNightAdd)}`);
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

// 미니멈스테이 조합 검색 결과 계산 (리조트 2개 이상)
export const calculateCombinedResortSearchResult = (
	scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }>,
	resortSearchData: Array<{ hotelCost: any; selectedRoomType: string; selectedPeriodType: string }>,
	exchangeRate: any
): { priceText: string; reserveType: string; reservePeriod: string; roomType: string } | null => {
	const resortHotels = scheduledHotels.filter((h) => h.hotelSort === '리조트');
	if (resortHotels.length < 2) return null;

	let totalPrice = 0;
	let currency = '';
	let exchangeRateValue = 0;

	resortHotels.forEach((resortHotel, idx) => {
		const searchData = resortSearchData.find((data, i) => i === idx);
		if (!searchData || !resortHotel.hotelCost) return;

		const { hotelCost, selectedRoomType, selectedPeriodType } = searchData;
		if (!hotelCost || !hotelCost.costInput) return;

		hotelCost.costInput.forEach((cost: any) => {
			try {
				const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
				if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
					const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
						if (selectedRoomType && rt.roomType !== selectedRoomType) return false;
						if (selectedPeriodType) {
							let hasPeriod = false;
							if (selectedPeriodType === '1박' && rt.oneNightCost && rt.oneNightCost !== '') hasPeriod = true;
							if (selectedPeriodType === '2박' && rt.twoNightCost && rt.twoNightCost !== '') hasPeriod = true;
							if (selectedPeriodType === '3박' && rt.threeNightCost && rt.threeNightCost !== '') hasPeriod = true;
							if (selectedPeriodType === '4박' && rt.fourNightCost && rt.fourNightCost !== '') hasPeriod = true;
							if (selectedPeriodType === '5박' && rt.fiveNightCost && rt.fiveNightCost !== '') hasPeriod = true;
							if (selectedPeriodType === '6박' && rt.sixNightCost && rt.sixNightCost !== '') hasPeriod = true;
							if (selectedPeriodType === '1박추가' && rt.oneNightAdd && rt.oneNightAdd !== '') hasPeriod = true;
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

						let priceNum = 0;
						if (selectedPeriodType) {
							if (selectedPeriodType === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
								priceNum = parseAmount(matchingRoom.oneNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							} else if (selectedPeriodType === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
								priceNum = parseAmount(matchingRoom.twoNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							} else if (selectedPeriodType === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
								priceNum = parseAmount(matchingRoom.threeNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							} else if (selectedPeriodType === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
								priceNum = parseAmount(matchingRoom.fourNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							} else if (selectedPeriodType === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
								priceNum = parseAmount(matchingRoom.fiveNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							} else if (selectedPeriodType === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
								priceNum = parseAmount(matchingRoom.sixNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
							} else if (selectedPeriodType === '1박추가' && matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
								priceNum = parseAmount(matchingRoom.oneNightAdd) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
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

	const firstResort = resortHotels[0];
	if (firstResort && firstResort.hotelCost && firstResort.hotelCost.costInput && firstResort.hotelCost.costInput.length > 0) {
		const firstCost = firstResort.hotelCost.costInput[0];
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

// 리조트 박수 조합 요금 계산 (콤보 요금 텍스트 반환)
export const calculateResortComboPrice = (
	productScheduleData: string,
	hotel1Cost: any | null,
	hotel2Cost: any | null,
	hotel3Cost: any | null,
	hotel4Cost: any | null,
	selectedRoomTypesByIndex: { [index: number]: string }
): string => {
	if (!productScheduleData) return '';
	
	let scheduleData: any[] = [];
	try {
		scheduleData = JSON.parse(productScheduleData);
	} catch {
		return '';
	}
	if (!Array.isArray(scheduleData) || scheduleData.length === 0) return '';

	const resortSchedules = scheduleData.filter((item: any) => item.hotelSort === '리조트');
	if (resortSchedules.length < 2) return '';

	const allHotels = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost].filter(h => h !== null);
	const resortHotels: { hotelSort: string; hotelCost: any; index: number }[] = [];
	
	scheduleData.slice(0, 4).forEach((item: any, index: number) => {
		if (item.hotelSort === '리조트' && allHotels[index]) {
			resortHotels.push({
				hotelSort: item.hotelSort || '',
				hotelCost: allHotels[index],
				index: index + 1
			});
		}
	});

	if (resortHotels.length !== resortSchedules.length) return '';

	const nightsArr = resortSchedules.map((s: any) => parseNights(s.dayNight));
	
	const calcSumForPattern = (pattern: number[]): string => {
		let total = 0;
		let currency = '';

		for (let i = 0; i < pattern.length; i++) {
			const nights = pattern[i];
			const key = getNightCostKey(nights);
			if (!key) return '';

			const resortHotel = resortHotels[i];
			if (!resortHotel || !resortHotel.hotelCost) return '';

			try {
				const input = resortHotel.hotelCost.costInput?.[0];
				if (!input) return '';
				const parsed = input.inputDefault
					? typeof input.inputDefault === 'string'
						? JSON.parse(input.inputDefault)
						: input.inputDefault
					: null;
				const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
				const roomList = defaultsArr.flatMap((def: any) =>
					Array.isArray(def.costByRoomType) ? def.costByRoomType : []
				);
				if (roomList.length === 0) return '';

				const selectedRoomTypeForThisResort = selectedRoomTypesByIndex[resortHotel.index] || '';
				const room =
					(selectedRoomTypeForThisResort &&
						roomList.find((r: any) => r.roomType === selectedRoomTypeForThisResort)) ||
					roomList[0];
				if (!room) return '';

				const val = parseAmount((room as any)[key]);
				if (val === 0) return '';
				if (!currency) currency = room.currency || '';
				total += val;
			} catch {
				return '';
			}
		}

		if (total === 0) return '';
		const cur = currency || '₩';
		return `${cur}${formatNumber(total)}${cur === '₩' ? '원' : ''}`;
	};

	if (resortSchedules.length === 2) {
		const rule = resortComboRules2.find(
			(r) => r.nights[0] === nightsArr[0] && r.nights[1] === nightsArr[1]
		);
		if (!rule) return '';
		return calcSumForPattern(rule.nights);
	}

	if (resortSchedules.length === 3) {
		const rule = resortComboRules3.find(
			(r) =>
				r.nights[0] === nightsArr[0] &&
				r.nights[1] === nightsArr[1] &&
				r.nights[2] === nightsArr[2]
		);
		if (!rule) return '';
		return calcSumForPattern(rule.nights);
	}

	return '';
};
