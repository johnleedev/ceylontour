// 팩요금 계산 함수 (NewHotelPrice_Poolvilla.tsx의 계산 로직을 함수로만 추출)

import { comboRules, formatNumber, parseAmount, parseNights, calculateComboPrice } from './poolvillaPriceUtils';

// nights 문자열에서 숫자 추출 (예: "2박" -> 2)
const extractNightsNumber = (nightsStr: string): number => {
	if (!nightsStr) return 0;
	const match = nightsStr.match(/(\d+)/);
	return match ? parseInt(match[1], 10) : 0;
};

// 조합 요금 계산 (리조트 + 풀빌라 전용) - poolvillaPriceUtils의 calculateComboPrice 사용
export const calculatePoolvillaComboPrice = (
	productScheduleData: string,
	hotel1Cost: any | null,
	hotel2Cost: any | null,
	hotel3Cost: any | null,
	hotel4Cost: any | null,
	selectedRoomType: string,
	scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }>,
	periodType?: string, // "2+2", "1+3", "3+2" 등의 형식
	selectedRoomTypes?: { [key: number]: string }, // 각 호텔별 룸타입 (3개 조합용)
	scheduleCards?: any[] // 각 호텔별 카드 정보 (3개 조합용)
): string => {
	// poolvillaPriceUtils의 calculateComboPrice 사용
	const result = calculateComboPrice(
		productScheduleData,
		hotel1Cost,
		hotel2Cost,
		hotel3Cost,
		hotel4Cost,
		selectedRoomType,
		periodType, // periodType 전달
		selectedRoomTypes, // 각 호텔별 룸타입 전달
		scheduleCards // 각 호텔별 카드 정보 전달
	);
	
	return result;
};

// 풀빌라 검색 결과 계산 (단일 호텔)
export const calculatePoolvillaSearchResult = (
	hotelCost: any,
	selectedRoomType: string,
	selectedPeriodType: string, // "2+2", "1+3", "3", "4"
	scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }>,
	selectedRoomTypes?: { [key: number]: string }, // 각 호텔별 룸타입 (3개 조합용)
	scheduleCards?: any[] // 각 호텔별 카드 정보 (3개 조합용)
): { priceText: string; reserveType: string; reservePeriod: string; roomType: string } | null => {
	if (!hotelCost || !hotelCost.costInput) return null;

	// 3개 조합 처리: '리조트1 + 리조트2 + 풀빌라'
	const resortHotels = scheduledHotels.filter((h) => h.hotelSort === '리조트');
	const poolHotels = scheduledHotels.filter((h) => h.hotelSort === '풀빌라');
	
	if (resortHotels.length === 2 && poolHotels.length === 1) {
		const resort1Cost = resortHotels[0]?.hotelCost;
		const resort2Cost = resortHotels[1]?.hotelCost;
		const poolCost = poolHotels[0]?.hotelCost;
		
		if (resort1Cost && resort2Cost && poolCost) {
			let resort1Nights = 2;
			let resort2Nights = 2;
			let poolNights = 2;
			
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
				// 각 호텔의 룸타입 가져오기 (3개 조합용)
				let poolRoomType = selectedRoomType;
				if (selectedRoomTypes && scheduleCards) {
					const poolCard = scheduleCards.find(c => c.badge === '풀빌라' && c.id === 3);
					if (poolCard && selectedRoomTypes[poolCard.id]) {
						poolRoomType = selectedRoomTypes[poolCard.id];
					}
				}
				
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
			let resortNights = 2;
			let pool1Nights = 2;
			let pool2Nights = 2;
			
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
			
			const rule = comboRules.find((r) => r.resortNights === resortNights && r.poolNights === pool2Nights);
			if (rule) {
				// 각 호텔의 룸타입 가져오기 (3개 조합용)
				let pool1RoomType = selectedRoomType;
				let pool2RoomType = selectedRoomType;
				if (selectedRoomTypes && scheduleCards) {
					const pool1Card = scheduleCards.find(c => c.badge === '풀빌라' && c.id === 2);
					const pool2Card = scheduleCards.find(c => c.badge === '풀빌라' && c.id === 3);
					if (pool1Card && selectedRoomTypes[pool1Card.id]) {
						pool1RoomType = selectedRoomTypes[pool1Card.id];
					}
					if (pool2Card && selectedRoomTypes[pool2Card.id]) {
						pool2RoomType = selectedRoomTypes[pool2Card.id];
					}
				}
				
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
								(pool2RoomType &&
									roomList.find((r: any) => r.roomType === pool2RoomType)) ||
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

	// 콤보 선택(리조트+풀빌라 조합) 시 풀빌라 요금으로 계산 - 2개 조합
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
					if (poolBase === 0) return null;

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

	// 일반 검색 (풀빌라 단독)
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

	return null;
};

// 팩요금 최종 판매가 계산 (selectedRoomTypes와 selectedNights를 받아서 계산)
export const calculatePoolvillaFinalPrice = (
	productScheduleData: string,
	hotel1Cost: any | null,
	hotel2Cost: any | null,
	hotel3Cost: any | null,
	hotel4Cost: any | null,
	selectedRoomTypes: { [key: number]: string },
	selectedNights: { [key: number]: number },
	scheduleCards: any[],
	landCommissionTotal: number,
	landDiscountDefaultTotal: number,
	landDiscountSpecialTotal: number,
	landCurrency: string,
	usdRate: number,
	calculateSalePrice: (basePriceText: string, landCommissionTotal: number, landDiscountDefaultTotal: number, landDiscountSpecialTotal: number, landCurrency: string, usdRate: number) => number,
	getRoomTypesForCard: (card: any) => string[]
): number | null => {
	if (!productScheduleData) return null;
	if (!hotel1Cost && !hotel2Cost && !hotel3Cost && !hotel4Cost) return null;
	if (scheduleCards.length === 0) return null;

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

	// 풀빌라 카드 찾기 (3개 조합의 경우 마지막 풀빌라 사용)
	const poolCards = scheduleCards.filter(card => card.badge === '풀빌라');
	const poolVillaCard = poolCards.length > 0 ? poolCards[poolCards.length - 1] : scheduleCards.find(card => card.badge === '풀빌라');
	if (!poolVillaCard) {
		return null;
	}

	// 풀빌라 룸타입 추출 (룸타입이 없으면 첫 번째 룸타입 자동 선택)
	const availableRoomTypes = getRoomTypesForCard(poolVillaCard);
	let poolVillaRoomType = selectedRoomTypes[poolVillaCard.id] || '';
	
	// 풀빌라 룸타입이 없으면 첫 번째 룸타입 사용
	if (!poolVillaRoomType && availableRoomTypes.length > 0) {
		poolVillaRoomType = availableRoomTypes[0];
	}

	// 기간타입 결정 (리조트+풀빌라 조합: 2+2, 1+3, 3+2 등, 또는 풀빌라만: 3, 4)
	// 첫 번째 리조트와 풀빌라의 박수만 사용 (3개 조합의 경우)
	const resortCards = scheduleCards.filter(card => card.badge === '리조트');
	// poolCards는 이미 위에서 선언됨
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
	
	let periodType: string | null = null;
	// 리조트와 풀빌라가 모두 있는 경우: "리조트박수+풀빌라박수" 형식
	if (resortNights > 0 && poolVillaNights > 0) {
		periodType = `${resortNights}+${poolVillaNights}`;
	} else if (resortNights === 0 && poolVillaNights > 0) {
		// 리조트가 없고 풀빌라만 있는 경우: "3", "4" 형식
		if (poolVillaNights === 3) {
			periodType = '3';
		} else if (poolVillaNights === 4) {
			periodType = '4';
		}
	}

	// 풀빌라 룸타입이 없어도 periodType이 있으면 요금 계산 시도 (리조트는 룸타입 없이도 가능)
	if (!poolVillaRoomType && !periodType) {
		return null;
	}
	
	// 풀빌라 룸타입이 없으면 첫 번째 룸타입 자동 선택 시도
	if (!poolVillaRoomType && availableRoomTypes.length > 0) {
		poolVillaRoomType = availableRoomTypes[0];
	}

	// 조합 요금 계산 (리조트+풀빌라) - periodType이 "+"를 포함하는 경우
	if (periodType && periodType.includes('+')) {
		const comboPrice = calculatePoolvillaComboPrice(
			productScheduleData,
			hotel1Cost,
			hotel2Cost,
			hotel3Cost,
			hotel4Cost,
			poolVillaRoomType,
			scheduledHotels,
			periodType, // periodType 전달
			selectedRoomTypes, // 각 호텔별 룸타입 전달
			scheduleCards // 각 호텔별 카드 정보 전달
		);

		if (comboPrice) {
			const salePrice = calculateSalePrice(
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

	// 일반 검색 결과 계산
	const poolVillaHotel = scheduledHotels.find(h => h.hotelSort === '풀빌라');
	if (poolVillaHotel && poolVillaHotel.hotelCost) {
		const searchResult = calculatePoolvillaSearchResult(
			poolVillaHotel.hotelCost,
			poolVillaRoomType,
			periodType || '',
			scheduledHotels,
			selectedRoomTypes, // 각 호텔별 룸타입 전달
			scheduleCards // 각 호텔별 카드 정보 전달
		);
		
		if (searchResult && searchResult.priceText) {
			// priceText에서 실제 가격 추출 (예: "2+2: ₩1,000,000원" -> "₩1,000,000원")
			let priceTextToUse = searchResult.priceText;
			if (priceTextToUse.includes(':')) {
				const parts = priceTextToUse.split(':');
				if (parts.length > 1) {
					priceTextToUse = parts.slice(1).join(':').trim();
				}
			}
			
			const salePrice = calculateSalePrice(
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

	return null;
};

