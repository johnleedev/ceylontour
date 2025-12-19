// 팩요금 계산 유틸리티 함수들

// 조합 규칙 정의
export const comboRules = [
	{ key: 'resortPool_1_3', resortNights: 1, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 0 },
	{ key: 'resortPool_2_2', resortNights: 2, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 0 },
	{ key: 'resortPool_3_2', resortNights: 3, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 1 },
	{ key: 'resortPool_4_2', resortNights: 4, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 2 },
	{ key: 'resortPool_2_3', resortNights: 2, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 1 },
	{ key: 'resortPool_3_3', resortNights: 3, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 2 },
	{ key: 'resortPool_5_2', resortNights: 5, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 3 },
	{ key: 'resortPool_4_3', resortNights: 4, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 3 }
];

// 숫자 포맷터
export const formatNumber = (n: number) => n.toLocaleString('ko-KR');

// 문자열 금액 -> number
export const parseAmount = (v: any): number => {
	if (v === null || v === undefined) return 0;
	const num = parseInt(String(v).replace(/,/g, ''), 10);
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

// 조합 요금 계산 (리조트 + 풀빌라)
export const calculateComboPrice = (
	productScheduleData: string,
	hotel1Cost: any | null,
	hotel2Cost: any | null,
	hotel3Cost: any | null,
	hotel4Cost: any | null,
	selectedRoomType: string,
	periodType?: string, // "3+2" 형식의 기간타입
	selectedRoomTypes?: { [key: number]: string }, // 각 호텔별 룸타입 (3개 조합용)
	scheduleCards?: any[] // 각 호텔별 카드 정보 (3개 조합용)
): string => {
	if (!productScheduleData) return '';
	
	let scheduleData: any[] = [];
	try {
		scheduleData = JSON.parse(productScheduleData);
	} catch {
		return '';
	}
	if (!Array.isArray(scheduleData) || scheduleData.length === 0) return '';

	const first = scheduleData[0];
	const second = scheduleData[1];
	const third = scheduleData[2];

	// productScheduleData 순서대로 호텔 매칭
	const allHotels = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost].filter(h => h !== null);
	const scheduledHotels: { hotelSort: string; hotelCost: any; index: number }[] = [];
	
	scheduleData.slice(0, 4).forEach((item: any, index: number) => {
		if (allHotels[index]) {
			scheduledHotels.push({
				hotelSort: item.hotelSort || '',
				hotelCost: allHotels[index],
				index: index + 1
			});
		}
	});

	// 리조트 단독 4박 처리
	if (first && !second && first.hotelSort === '리조트') {
		const resortNightsOnly = parseNights(first.dayNight);
		if (resortNightsOnly === 4) {
			const resortCostOnly = scheduledHotels.find((h) => h.hotelSort === '리조트')?.hotelCost;
			if (!resortCostOnly) return '';

			let preAdd = 0;
			let currencyOnly = '';
			try {
				const resortInput = resortCostOnly.costInput?.[0];
				if (resortInput) {
					const parsed = resortInput.inputDefault
						? typeof resortInput.inputDefault === 'string'
							? JSON.parse(resortInput.inputDefault)
							: resortInput.inputDefault
						: null;
					const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
					const roomList = defaultsArr.flatMap((def: any) =>
						Array.isArray(def.costByRoomType) ? def.costByRoomType : []
					);
					if (roomList.length > 0) {
						const room =
							(selectedRoomType &&
								roomList.find((r: any) => r.roomType === selectedRoomType)) ||
							roomList[0];
						currencyOnly = room.currency || '';
						preAdd = parseAmount(room.forPreAddCost);
					}
				}
			} catch (e) {
				console.error('리조트 단독 4박 forPreAddCost 파싱 오류', e);
			}

			if (preAdd === 0) return '';
			const totalOnly = preAdd * 4;
			const currency = currencyOnly || '₩';
			return `${currency}${formatNumber(totalOnly)}${currency === '₩' ? '원' : ''}`;
		}
	}

	// 3개 조합 처리: '리조트1 + 리조트2 + 풀빌라'
	if (first && second && third && 
		first.hotelSort === '리조트' && 
		second.hotelSort === '리조트' && 
		third.hotelSort === '풀빌라') {
		
		const resort1Nights = parseNights(first.dayNight);
		const resort2Nights = parseNights(second.dayNight);
		const poolNights = parseNights(third.dayNight);

		// 리조트1과 풀빌라의 조합 요금 계산
		const rule = comboRules.find(
			(r) => r.resortNights === resort1Nights && r.poolNights === poolNights
		);
		if (!rule) return '';

		const resort1Cost = scheduledHotels[0]?.hotelCost;
		const poolCost = scheduledHotels[2]?.hotelCost;
		if (!resort1Cost || !poolCost) return '';

		// 각 호텔의 룸타입 가져오기 (3개 조합용)
		let poolRoomType = selectedRoomType;
		let resort1RoomType = selectedRoomType;
		let resort2RoomType = selectedRoomType;
		
		if (selectedRoomTypes && scheduleCards) {
			const poolCard = scheduleCards.find(c => c.badge === '풀빌라' && c.id === 3);
			const resort1Card = scheduleCards.find(c => c.badge === '리조트' && c.id === 1);
			const resort2Card = scheduleCards.find(c => c.badge === '리조트' && c.id === 2);
			
			if (poolCard && selectedRoomTypes[poolCard.id]) {
				poolRoomType = selectedRoomTypes[poolCard.id];
			}
			if (resort1Card && selectedRoomTypes[resort1Card.id]) {
				resort1RoomType = selectedRoomTypes[resort1Card.id];
			}
			if (resort2Card && selectedRoomTypes[resort2Card.id]) {
				resort2RoomType = selectedRoomTypes[resort2Card.id];
			}
		}

		// 풀빌라 기본 요금 추출
		let poolBase = 0;
		let poolCurrency = '';
		try {
			const poolInput = poolCost.costInput?.[0];
			if (poolInput) {
				const parsed = poolInput.inputDefault
					? typeof poolInput.inputDefault === 'string'
						? JSON.parse(poolInput.inputDefault)
						: poolInput.inputDefault
					: null;
				const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
				const roomList = defaultsArr.flatMap((def: any) =>
					Array.isArray(def.costByRoomType) ? def.costByRoomType : []
				);
				if (roomList.length > 0) {
					const room =
						(poolRoomType &&
							roomList.find((r: any) => r.roomType === poolRoomType)) ||
						roomList[0];
					poolCurrency = room.currency || '';
					poolBase = parseAmount(room[rule.baseKey]);
				}
			}
		} catch (e) {
			console.error('풀빌라 기본 요금 파싱 오류', e);
		}
		if (poolBase === 0) return '';

		// 리조트1 추가요금 추출
		let resort1Add = 0;
		try {
			const resort1Input = resort1Cost.costInput?.[0];
			if (resort1Input) {
				const parsed = resort1Input.inputDefault
					? typeof resort1Input.inputDefault === 'string'
						? JSON.parse(resort1Input.inputDefault)
						: resort1Input.inputDefault
					: null;
				const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
				if (list.length > 0) {
					resort1Add = parseAmount(list[0].dayAddCost);
					if (!poolCurrency) poolCurrency = list[0].currency || '';
				}
			}
		} catch (e) {
			console.error('리조트1 추가 요금 파싱 오류', e);
		}

		// 리조트2 추가요금 추출 (dayAddCost 사용)
		const resort2Cost = scheduledHotels[1]?.hotelCost;
		if (!resort2Cost) return '';
		let resort2Add = 0;
		try {
			const resort2Input = resort2Cost.costInput?.[0];
			if (resort2Input) {
				const parsed = resort2Input.inputDefault
					? typeof resort2Input.inputDefault === 'string'
						? JSON.parse(resort2Input.inputDefault)
						: resort2Input.inputDefault
					: null;
				const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
				if (list.length > 0) {
					resort2Add = parseAmount(list[0].dayAddCost);
					if (!poolCurrency) poolCurrency = list[0].currency || '';
				}
			}
		} catch (e) {
			console.error('리조트2 추가 요금 파싱 오류', e);
		}

		// 리조트1+풀빌라 조합 요금 + 리조트2 추가요금
		const total = poolBase + resort1Add * rule.extraTimes + resort2Add * resort2Nights;
		const currency = poolCurrency || '₩';
		return `${currency}${formatNumber(total)}${currency === '₩' ? '원' : ''}`;
	}

	// 3개 조합 처리: '리조트 + 풀빌라1 + 풀빌라2'
	if (first && second && third && 
		first.hotelSort === '리조트' && 
		second.hotelSort === '풀빌라' && 
		third.hotelSort === '풀빌라') {
		
		// periodType이 있으면 사용, 없으면 productScheduleData의 dayNight 사용
		let resortNights: number;
		let pool1Nights: number;
		let pool2Nights: number;
		
		if (periodType && periodType.includes('+')) {
			const parts = periodType.split('+').map((p) => parseInt(p.trim(), 10));
			if (parts.length >= 2 && !parts.some((n) => isNaN(n))) {
				resortNights = parts[0];
				if (parts.length === 3) {
					pool1Nights = parts[1];
					pool2Nights = parts[2];
				} else {
					pool2Nights = parts[1];
					pool1Nights = parseNights(second.dayNight);
				}
			} else {
				resortNights = parseNights(first.dayNight);
				pool1Nights = parseNights(second.dayNight);
				pool2Nights = parseNights(third.dayNight);
			}
		} else {
			resortNights = parseNights(first.dayNight);
			pool1Nights = parseNights(second.dayNight);
			pool2Nights = parseNights(third.dayNight);
		}

		// 리조트와 풀빌라2의 조합 요금 계산
		const rule = comboRules.find(
			(r) => r.resortNights === resortNights && r.poolNights === pool2Nights
		);
		if (!rule) return '';

		const resortCost = scheduledHotels[0]?.hotelCost;
		const pool2Cost = scheduledHotels[2]?.hotelCost;
		if (!resortCost || !pool2Cost) return '';

		// 각 호텔의 룸타입 가져오기 (3개 조합용)
		let pool1RoomType = selectedRoomType;
		let pool2RoomType = selectedRoomType;
		let resortRoomType = selectedRoomType;
		
		if (selectedRoomTypes && scheduleCards) {
			const pool1Card = scheduleCards.find(c => c.badge === '풀빌라' && c.id === 2);
			const pool2Card = scheduleCards.find(c => c.badge === '풀빌라' && c.id === 3);
			const resortCard = scheduleCards.find(c => c.badge === '리조트' && c.id === 1);
			
			if (pool1Card && selectedRoomTypes[pool1Card.id]) {
				pool1RoomType = selectedRoomTypes[pool1Card.id];
			}
			if (pool2Card && selectedRoomTypes[pool2Card.id]) {
				pool2RoomType = selectedRoomTypes[pool2Card.id];
			}
			if (resortCard && selectedRoomTypes[resortCard.id]) {
				resortRoomType = selectedRoomTypes[resortCard.id];
			}
		}

		// 풀빌라2 기본 요금 추출
		let pool2Base = 0;
		let poolCurrency = '';
		try {
			const pool2Input = pool2Cost.costInput?.[0];
			if (pool2Input) {
				const parsed = pool2Input.inputDefault
					? typeof pool2Input.inputDefault === 'string'
						? JSON.parse(pool2Input.inputDefault)
						: pool2Input.inputDefault
					: null;
				const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
				const roomList = defaultsArr.flatMap((def: any) =>
					Array.isArray(def.costByRoomType) ? def.costByRoomType : []
				);
				if (roomList.length > 0) {
					const room =
						(pool2RoomType &&
							roomList.find((r: any) => r.roomType === pool2RoomType)) ||
						roomList[0];
					poolCurrency = room.currency || '';
					pool2Base = parseAmount(room[rule.baseKey]);
				}
			}
		} catch (e) {
			console.error('풀빌라2 기본 요금 파싱 오류', e);
		}
		if (pool2Base === 0) return '';

		// 리조트 추가요금 추출
		let resortAdd = 0;
		try {
			const resortInput = resortCost.costInput?.[0];
			if (resortInput) {
				const parsed = resortInput.inputDefault
					? typeof resortInput.inputDefault === 'string'
						? JSON.parse(resortInput.inputDefault)
						: resortInput.inputDefault
					: null;
				const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
				if (list.length > 0) {
					resortAdd = parseAmount(list[0].dayAddCost);
					if (!poolCurrency) poolCurrency = list[0].currency || '';
				}
			}
		} catch (e) {
			console.error('리조트 추가 요금 파싱 오류', e);
		}

		// 풀빌라1 추가요금 추출
		const pool1Cost = scheduledHotels[1]?.hotelCost;
		if (!pool1Cost) return '';
		let pool1Add = 0;
		try {
			const pool1Input = pool1Cost.costInput?.[0];
			if (pool1Input) {
				const parsed = pool1Input.inputDefault
					? typeof pool1Input.inputDefault === 'string'
						? JSON.parse(pool1Input.inputDefault)
						: pool1Input.inputDefault
					: null;
				const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
				const roomList = defaultsArr.flatMap((def: any) =>
					Array.isArray(def.costByRoomType) ? def.costByRoomType : []
				);
				if (roomList.length > 0) {
					const room =
						(pool1RoomType &&
							roomList.find((r: any) => r.roomType === pool1RoomType)) ||
						roomList[0];
					if (!poolCurrency) poolCurrency = room.currency || '';
					pool1Add = parseAmount(room.forPreAddCost);
				}
			}
		} catch (e) {
			console.error('풀빌라1 추가 요금 파싱 오류', e);
		}

		// 리조트+풀빌라2 조합 요금 + 풀빌라1 추가요금
		const total = pool2Base + resortAdd * rule.extraTimes + pool1Add * pool1Nights;
		const currency = poolCurrency || '₩';
		return `${currency}${formatNumber(total)}${currency === '₩' ? '원' : ''}`;
	}

	// 리조트 + 풀빌라 구조 처리 (2개 조합)
	if (!first || !second) return '';
	if (first.hotelSort !== '리조트' || second.hotelSort !== '풀빌라') return '';

	// periodType이 있으면 사용, 없으면 productScheduleData의 dayNight 사용
	let resortNights: number;
	let poolNights: number;
	
	if (periodType && periodType.includes('+')) {
		const parts = periodType.split('+').map((p) => parseInt(p.trim(), 10));
		if (parts.length === 2 && !parts.some((n) => isNaN(n))) {
			[resortNights, poolNights] = parts;
		} else {
			return '';
		}
	} else {
		resortNights = parseNights(first.dayNight);
		poolNights = parseNights(second.dayNight);
	}

	const rule = comboRules.find(
		(r) => r.resortNights === resortNights && r.poolNights === poolNights
	);
	if (!rule) {
		return '';
	}

	const resortCost = scheduledHotels.find((h) => h.hotelSort === '리조트')?.hotelCost;
	const poolCost = scheduledHotels.find((h) => h.hotelSort === '풀빌라')?.hotelCost;
	if (!resortCost || !poolCost) return '';

	// 풀빌라 기본 요금 추출
	let poolBase = 0;
	let poolCurrency = '';
	try {
		const poolInput = poolCost.costInput?.[0];
		if (poolInput) {
			const parsed = poolInput.inputDefault
				? typeof poolInput.inputDefault === 'string'
					? JSON.parse(poolInput.inputDefault)
					: poolInput.inputDefault
				: null;
			const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
			const roomList = defaultsArr.flatMap((def: any) =>
				Array.isArray(def.costByRoomType) ? def.costByRoomType : []
			);
			if (roomList.length > 0) {
				const room =
					(selectedRoomType &&
						roomList.find((r: any) => r.roomType === selectedRoomType)) ||
					roomList[0];
				poolCurrency = room.currency || '';
				poolBase = parseAmount(room[rule.baseKey]);
			}
		}
	} catch (e) {
		console.error('풀빌라 기본 요금 파싱 오류', e);
	}
	if (poolBase === 0) return '';

	// 리조트 추가요금 추출
	let resortAdd = 0;
	try {
		const resortInput = resortCost.costInput?.[0];
		if (resortInput) {
			const parsed = resortInput.inputDefault
				? typeof resortInput.inputDefault === 'string'
					? JSON.parse(resortInput.inputDefault)
					: resortInput.inputDefault
				: null;
			const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
			if (list.length > 0) {
				resortAdd = parseAmount(list[0].dayAddCost);
				if (!poolCurrency) poolCurrency = list[0].currency || '';
			}
		}
	} catch (e) {
		console.error('리조트 추가 요금 파싱 오류', e);
	}

	const total = poolBase + resortAdd * rule.extraTimes;
	const currency = poolCurrency || '₩';
	return `${currency}${formatNumber(total)}${currency === '₩' ? '원' : ''}`;
};

// 호텔 검색 결과 계산 (풀빌라 단독 또는 조합)
export const calculateHotelSearchResult = (
	hotelCost: any,
	isResort: boolean,
	selectedRoomType: string,
	selectedPeriodType: string,
	scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }>
): { priceText: string; reserveType: string; reservePeriod: string; roomType: string } | null => {
	if (!hotelCost || !hotelCost.costInput) return null;

	// 3개 조합 처리: '리조트1 + 리조트2 + 풀빌라'
	const resortHotels = scheduledHotels.filter((h) => h.hotelSort === '리조트');
	const poolHotels = scheduledHotels.filter((h) => h.hotelSort === '풀빌라');
	
	if (resortHotels.length === 2 && poolHotels.length === 1) {
		// 리조트1과 풀빌라의 조합 요금 계산
		const resort1Cost = resortHotels[0]?.hotelCost;
		const resort2Cost = resortHotels[1]?.hotelCost;
		const poolCost = poolHotels[0]?.hotelCost;
		
		if (resort1Cost && resort2Cost && poolCost) {
			// periodType이나 scheduledHotels에서 박수 추출 (간단히 첫 번째 리조트와 풀빌라의 박수 사용)
			// 실제로는 productScheduleData에서 박수를 가져와야 하지만, 여기서는 기본 로직만 구현
			let resort1Nights = 2; // 기본값
			let resort2Nights = 2; // 기본값
			let poolNights = 2; // 기본값
			
			if (selectedPeriodType && selectedPeriodType.includes('+')) {
				const parts = selectedPeriodType.split('+').map((p) => parseInt(p.trim(), 10));
				if (parts.length >= 2 && !parts.some((n) => isNaN(n))) {
					resort1Nights = parts[0];
					if (parts.length === 3) {
						resort2Nights = parts[1];
						poolNights = parts[2];
					} else {
						poolNights = parts[1];
					}
				}
			}
			
			const rule = comboRules.find((r) => r.resortNights === resort1Nights && r.poolNights === poolNights);
			if (rule) {
				let poolBase = 0;
				let poolCurrency = '';
				let poolRoomType = '';
				try {
					const poolInput = poolCost.costInput?.[0];
					if (poolInput) {
						const parsed = poolInput.inputDefault
							? typeof poolInput.inputDefault === 'string'
								? JSON.parse(poolInput.inputDefault)
								: poolInput.inputDefault
							: null;
						const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
						const roomList = defaultsArr.flatMap((def: any) =>
							Array.isArray(def.costByRoomType) ? def.costByRoomType : []
						);
						if (roomList.length > 0) {
							const room =
								(selectedRoomType &&
									roomList.find((r: any) => r.roomType === selectedRoomType)) ||
								roomList[0];
							poolCurrency = room.currency || '';
							poolRoomType = room.roomType || '';
							poolBase = parseAmount(room[rule.baseKey]);
						}
					}
				} catch (e) {
					console.error('풀빌라 기본 요금 파싱 오류', e);
				}
				if (poolBase > 0) {
					let resort1Add = 0;
					try {
						const resort1Input = resort1Cost.costInput?.[0];
						if (resort1Input) {
							const parsed = resort1Input.inputDefault
								? typeof resort1Input.inputDefault === 'string'
									? JSON.parse(resort1Input.inputDefault)
									: resort1Input.inputDefault
								: null;
							const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
							if (list.length > 0) {
								resort1Add = parseAmount(list[0].dayAddCost);
								if (!poolCurrency) poolCurrency = list[0].currency || '';
							}
						}
					} catch (e) {
						console.error('리조트1 추가 요금 파싱 오류', e);
					}
					
					let resort2Add = 0;
					try {
						const resort2Input = resort2Cost.costInput?.[0];
						if (resort2Input) {
							const parsed = resort2Input.inputDefault
								? typeof resort2Input.inputDefault === 'string'
									? JSON.parse(resort2Input.inputDefault)
									: resort2Input.inputDefault
								: null;
							const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
							if (list.length > 0) {
								resort2Add = parseAmount(list[0].dayAddCost);
								if (!poolCurrency) poolCurrency = list[0].currency || '';
							}
						}
					} catch (e) {
						console.error('리조트2 추가 요금 파싱 오류', e);
					}
					
					const total = poolBase + resort1Add * rule.extraTimes + resort2Add * resort2Nights;
					const currency = poolCurrency || '₩';
					const priceText = `${currency}${formatNumber(total)}${currency === '₩' ? '원' : ''}`;
					
					const poolReservePeriod = (() => {
						try {
							const poolInput = poolCost.costInput?.[0];
							const rp = poolInput?.reservePeriod;
							if (!rp) return '-';
							const parsed = typeof rp === 'string' ? JSON.parse(rp) : rp;
							if (parsed?.start && parsed?.end) {
								const fmt = (d: string) => {
									const [y, m, day] = d.split('-');
									return `${y.slice(2)}년${m}월${day}일`;
								};
								return `${fmt(parsed.start)} ~ ${fmt(parsed.end)}`;
							}
						} catch {}
						return '-';
					})();
					
					return {
						reserveType: '조합',
						reservePeriod: poolReservePeriod,
						roomType: poolRoomType || '-',
						priceText
					};
				}
			}
		}
	}
	
	// 3개 조합 처리: '리조트 + 풀빌라1 + 풀빌라2'
	if (resortHotels.length === 1 && poolHotels.length === 2) {
		const resortCost = resortHotels[0]?.hotelCost;
		const pool1Cost = poolHotels[0]?.hotelCost;
		const pool2Cost = poolHotels[1]?.hotelCost;
		
		if (resortCost && pool1Cost && pool2Cost) {
			let resortNights = 2; // 기본값
			let pool1Nights = 2; // 기본값
			let pool2Nights = 2; // 기본값
			
			if (selectedPeriodType && selectedPeriodType.includes('+')) {
				const parts = selectedPeriodType.split('+').map((p) => parseInt(p.trim(), 10));
				if (parts.length >= 2 && !parts.some((n) => isNaN(n))) {
					resortNights = parts[0];
					if (parts.length === 3) {
						pool1Nights = parts[1];
						pool2Nights = parts[2];
					} else {
						pool2Nights = parts[1];
					}
				}
			}
			
			// 리조트와 풀빌라2의 조합 요금 계산
			const rule = comboRules.find((r) => r.resortNights === resortNights && r.poolNights === pool2Nights);
			if (rule) {
				let pool2Base = 0;
				let poolCurrency = '';
				let poolRoomType = '';
				try {
					const pool2Input = pool2Cost.costInput?.[0];
					if (pool2Input) {
						const parsed = pool2Input.inputDefault
							? typeof pool2Input.inputDefault === 'string'
								? JSON.parse(pool2Input.inputDefault)
								: pool2Input.inputDefault
							: null;
						const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
						const roomList = defaultsArr.flatMap((def: any) =>
							Array.isArray(def.costByRoomType) ? def.costByRoomType : []
						);
						if (roomList.length > 0) {
							const room =
								(selectedRoomType &&
									roomList.find((r: any) => r.roomType === selectedRoomType)) ||
								roomList[0];
							poolCurrency = room.currency || '';
							poolRoomType = room.roomType || '';
							pool2Base = parseAmount(room[rule.baseKey]);
						}
					}
				} catch (e) {
					console.error('풀빌라2 기본 요금 파싱 오류', e);
				}
				if (pool2Base > 0) {
					let resortAdd = 0;
					try {
						const resortInput = resortCost.costInput?.[0];
						if (resortInput) {
							const parsed = resortInput.inputDefault
								? typeof resortInput.inputDefault === 'string'
									? JSON.parse(resortInput.inputDefault)
									: resortInput.inputDefault
								: null;
							const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
							if (list.length > 0) {
								resortAdd = parseAmount(list[0].dayAddCost);
								if (!poolCurrency) poolCurrency = list[0].currency || '';
							}
						}
					} catch (e) {
						console.error('리조트 추가 요금 파싱 오류', e);
					}
					
					let pool1Add = 0;
					try {
						const pool1Input = pool1Cost.costInput?.[0];
						if (pool1Input) {
							const parsed = pool1Input.inputDefault
								? typeof pool1Input.inputDefault === 'string'
									? JSON.parse(pool1Input.inputDefault)
									: pool1Input.inputDefault
								: null;
							const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
							const roomList = defaultsArr.flatMap((def: any) =>
								Array.isArray(def.costByRoomType) ? def.costByRoomType : []
							);
							if (roomList.length > 0) {
								const room =
									(selectedRoomType &&
										roomList.find((r: any) => r.roomType === selectedRoomType)) ||
									roomList[0];
								if (!poolCurrency) poolCurrency = room.currency || '';
								pool1Add = parseAmount(room.forPreAddCost);
							}
						}
					} catch (e) {
						console.error('풀빌라1 추가 요금 파싱 오류', e);
					}
					
					const total = pool2Base + resortAdd * rule.extraTimes + pool1Add * pool1Nights;
					const currency = poolCurrency || '₩';
					const priceText = `${currency}${formatNumber(total)}${currency === '₩' ? '원' : ''}`;
					
					const poolReservePeriod = (() => {
						try {
							const pool2Input = pool2Cost.costInput?.[0];
							const rp = pool2Input?.reservePeriod;
							if (!rp) return '-';
							const parsed = typeof rp === 'string' ? JSON.parse(rp) : rp;
							if (parsed?.start && parsed?.end) {
								const fmt = (d: string) => {
									const [y, m, day] = d.split('-');
									return `${y.slice(2)}년${m}월${day}일`;
								};
								return `${fmt(parsed.start)} ~ ${fmt(parsed.end)}`;
							}
						} catch {}
						return '-';
					})();
					
					return {
						reserveType: '조합',
						reservePeriod: poolReservePeriod,
						roomType: poolRoomType || '-',
						priceText
					};
				}
			}
		}
	}

	// 조합 요금 계산 (리조트+풀빌라) - 2개 조합
	if (selectedPeriodType && selectedPeriodType.includes('+')) {
		const parts = selectedPeriodType.split('+').map((p) => parseInt(p, 10));
		if (parts.length === 2 && !parts.some((n) => isNaN(n))) {
			const [resortN, poolN] = parts;
			const rule = comboRules.find((r) => r.resortNights === resortN && r.poolNights === poolN);
			if (rule) {
				const resortCost = scheduledHotels.find((h) => h.hotelSort === '리조트')?.hotelCost;
				const poolCost = scheduledHotels.find((h) => h.hotelSort === '풀빌라')?.hotelCost;
				if (resortCost && poolCost) {
					let poolBase = 0;
					let poolCurrency = '';
					let poolRoomType = '';
					try {
						const poolInput = poolCost.costInput?.[0];
						if (poolInput) {
							const parsed = poolInput.inputDefault
								? typeof poolInput.inputDefault === 'string'
									? JSON.parse(poolInput.inputDefault)
									: poolInput.inputDefault
								: poolInput.inputDefault;
							const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
							const roomList = defaultsArr.flatMap((def: any) =>
								Array.isArray(def.costByRoomType) ? def.costByRoomType : []
							);
							if (roomList.length > 0) {
								const room =
									(selectedRoomType &&
										roomList.find((r: any) => r.roomType === selectedRoomType)) ||
									roomList[0];
								poolCurrency = room.currency || '';
								poolRoomType = room.roomType || '';
								poolBase = parseAmount(room[rule.baseKey]);
							}
						}
					} catch (e) {
						console.error('풀빌라 기본 요금 파싱 오류', e);
					}
					if (poolBase > 0) {
						let resortAdd = 0;
						try {
							const resortInput = resortCost.costInput?.[0];
							if (resortInput) {
								const parsed = resortInput.inputDefault
									? typeof resortInput.inputDefault === 'string'
										? JSON.parse(resortInput.inputDefault)
										: resortInput.inputDefault
									: null;
								const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
								if (list.length > 0) {
									resortAdd = parseAmount(list[0].dayAddCost);
									if (!poolCurrency) poolCurrency = list[0].currency || '';
								}
							}
						} catch (e) {
							console.error('리조트 추가 요금 파싱 오류', e);
						}

						const total = poolBase + resortAdd * rule.extraTimes;
						const currency = poolCurrency || '₩';
						const priceText = `${currency}${formatNumber(total)}${currency === '₩' ? '원' : ''}`;

						const poolReservePeriod = (() => {
							try {
								const poolInput = poolCost.costInput?.[0];
								const rp = poolInput?.reservePeriod;
								if (!rp) return '-';
								const parsed = typeof rp === 'string' ? JSON.parse(rp) : rp;
								if (parsed?.start && parsed?.end) {
									const fmt = (d: string) => {
										const [y, m, day] = d.split('-');
										return `${y.slice(2)}년${m}월${day}일`;
									};
									return `${fmt(parsed.start)} ~ ${fmt(parsed.end)}`;
								}
							} catch {}
							return '-';
						})();

						return {
							reserveType: '조합',
							reservePeriod: poolReservePeriod,
							roomType: poolRoomType || '-',
							priceText
						};
					}
				}
			}
		}
	}

	// 일반 검색 로직 (풀빌라 단독)
	if (!isResort && hotelCost.costInput && hotelCost.costInput.length > 0) {
		for (const cost of hotelCost.costInput) {
			try {
				const inputDefaultRaw = cost.inputDefault
					? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault)
					: null;
				const defaultsArr = Array.isArray(inputDefaultRaw) ? inputDefaultRaw : (inputDefaultRaw ? [inputDefaultRaw] : []);
				
				const allRooms = defaultsArr.flatMap((def: any) =>
					Array.isArray(def.costByRoomType) ? def.costByRoomType : []
				);
				const matchingRoom = allRooms.find((rt: any) => {
					if (selectedRoomType && rt.roomType !== selectedRoomType) {
						return false;
					}
					
					if (selectedPeriodType) {
						let hasPeriod = false;
						if (selectedPeriodType === '2+2' && rt.twoTwoDayCost) hasPeriod = true;
						if (selectedPeriodType === '1+3' && rt.oneThreeDayCost) hasPeriod = true;
						if (selectedPeriodType === '3' && rt.threeDayCost && rt.threeDayCost !== '') hasPeriod = true;
						if (selectedPeriodType === '4' && rt.fourDayCost) hasPeriod = true;
						
						if (!hasPeriod) {
							return false;
						}
					}
					return true;
				});

				if (matchingRoom) {
					const currency = matchingRoom.currency || '';
					const formatPrice = (v: any) => {
						if (!v) return '';
						const num = parseInt(String(v).replace(/,/g, ''), 10);
						const formatted = isNaN(num) ? String(v) : num.toLocaleString('ko-KR');
						const suffix = currency === '₩' ? '원' : '';
						return `${currency}${formatted}${suffix}`;
					};
					
					let priceText = '';
					if (selectedPeriodType === '2+2' && matchingRoom.twoTwoDayCost) {
						priceText = `2+2: ${formatPrice(matchingRoom.twoTwoDayCost)}`;
					} else if (selectedPeriodType === '1+3' && matchingRoom.oneThreeDayCost) {
						priceText = `1+3: ${formatPrice(matchingRoom.oneThreeDayCost)}`;
					} else if (selectedPeriodType === '3' && matchingRoom.threeDayCost && matchingRoom.threeDayCost !== '') {
						priceText = `3only: ${formatPrice(matchingRoom.threeDayCost)}`;
					} else if (selectedPeriodType === '4' && matchingRoom.fourDayCost) {
						priceText = `4only: ${formatPrice(matchingRoom.fourDayCost)}`;
					} else {
						const parts: string[] = [];
						if (matchingRoom.twoTwoDayCost) parts.push(`2+2: ${formatPrice(matchingRoom.twoTwoDayCost)}`);
						if (matchingRoom.oneThreeDayCost) parts.push(`1+3: ${formatPrice(matchingRoom.oneThreeDayCost)}`);
						if (matchingRoom.threeDayCost && matchingRoom.threeDayCost !== '') parts.push(`3only: ${formatPrice(matchingRoom.threeDayCost)}`);
						if (matchingRoom.fourDayCost) parts.push(`4only: ${formatPrice(matchingRoom.fourDayCost)}`);
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
			} catch (e) {
				// ignore
			}
		}
	}

	return null;
};

