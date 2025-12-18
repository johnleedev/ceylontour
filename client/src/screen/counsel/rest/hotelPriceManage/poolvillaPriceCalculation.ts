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
	periodType?: string // "2+2", "1+3", "3+2" 등의 형식
): string => {
	// poolvillaPriceUtils의 calculateComboPrice 사용
	const result = calculateComboPrice(
		productScheduleData,
		hotel1Cost,
		hotel2Cost,
		hotel3Cost,
		hotel4Cost,
		selectedRoomType,
		periodType // periodType 전달
	);
	
	return result;
};

// 풀빌라 검색 결과 계산 (단일 호텔)
export const calculatePoolvillaSearchResult = (
	hotelCost: any,
	selectedRoomType: string,
	selectedPeriodType: string, // "2+2", "1+3", "3", "4"
	scheduledHotels: Array<{ hotelSort: string; hotelCost: any; index: number }>
): { priceText: string; reserveType: string; reservePeriod: string; roomType: string } | null => {
	if (!hotelCost || !hotelCost.costInput) return null;

	// 콤보 선택(리조트+풀빌라 조합) 시 풀빌라 요금으로 계산
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

	// 풀빌라 카드 찾기
	const poolVillaCard = scheduleCards.find(card => card.badge === '풀빌라');
	if (!poolVillaCard) {
		return null;
	}

	// 풀빌라 룸타입 추출
	const availableRoomTypes = getRoomTypesForCard(poolVillaCard);
	const poolVillaRoomType = selectedRoomTypes[poolVillaCard.id] || (availableRoomTypes[0] || '');

	// 기간타입 결정 (리조트+풀빌라 조합: 2+2, 1+3, 3+2 등, 또는 풀빌라만: 3, 4)
	let resortNights = 0;
	let poolVillaNights = 0;
	
	scheduleCards.forEach((card) => {
		const nights = selectedNights[card.id] || extractNightsNumber(card.nights || '');
		if (card.badge === '리조트') {
			resortNights += nights;
		} else if (card.badge === '풀빌라') {
			poolVillaNights += nights;
		}
	});
	
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

	if (!poolVillaRoomType && !periodType) {
		return null;
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
			periodType // periodType 전달
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
			scheduledHotels
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

