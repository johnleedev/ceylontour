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
	periodType?: string // "3+2" 형식의 기간타입
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

	// 리조트 + 풀빌라 구조 처리
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

	// 조합 요금 계산 (리조트+풀빌라)
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

