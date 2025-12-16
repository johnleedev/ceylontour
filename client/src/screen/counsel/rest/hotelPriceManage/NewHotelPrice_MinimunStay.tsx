import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { recoilExchangeRate, recoilCustomerInfoFormData } from '../../../../RecoilStore';
import { DateBoxDouble } from '../../../../boxs/DateBoxDouble';
import { DateBoxSingle } from '../../../../boxs/DateBoxSingle';

// 풀빌라 전용 호텔 요금 리스트 컴포넌트
interface HotelCostListMinimunStayProps {
	hotelCost: {
		hotel: {
			hotelNameKo: string;
		};
		costInput: any[];
	} | null;
	title: string;
	highlightedCosts: Set<number>;
	isPoolVilla?: boolean;
}

function HotelCostList_MinimunStay({ hotelCost, title, highlightedCosts, isPoolVilla = false }: HotelCostListMinimunStayProps) {
	if (!hotelCost) return null;

	return (
		<div style={{
			border: '1px solid #e0e0e0',
			borderRadius: '8px',
			padding: '20px',
			backgroundColor: '#fafafa'
		}}>
			<h4 style={{
				margin: '0 0 15px 0',
				fontSize: '16px',
				fontWeight: 'bold',
				color: '#333',
				paddingBottom: '10px',
				borderBottom: '2px solid #5fb7ef'
			}}>
				{title}: {hotelCost.hotel.hotelNameKo}
			</h4>
			{hotelCost.costInput.length > 0 ? (
				<div style={{
					maxHeight: '400px',
					overflowY: 'auto',
					border: '1px solid #e0e0e0',
					borderRadius: '4px'
				}}>
					<table style={{width: '100%', borderCollapse: 'collapse', fontSize: '16px'}}>
						<thead>
							<tr style={{background: '#f8f9fa'}}>
								<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>예약유형</th>
								<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>예약기간</th>
								<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>{isPoolVilla ? '기간' : '숙박기간'}</th>
								<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>선투숙포함</th>
								<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>룸타입별 요금</th>
							</tr>
						</thead>
						<tbody>
							{hotelCost.costInput.map((cost: any, idx: number) => {
								const isHighlighted = highlightedCosts.has(idx);
								return (
									<tr key={idx} style={{
										backgroundColor: isHighlighted ? '#e3f2fd' : (idx % 2 === 0 ? '#fff' : '#f8f9fa'),
										border: isHighlighted ? '2px solid #5fb7ef' : '1px solid transparent',
										boxShadow: isHighlighted ? '0 0 0 1px #5fb7ef' : 'none'
									}}>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
											{(() => {
												const type = (cost.reserveType || '').toString().trim();
												if (!type) return '-';
												if (type === 'earlyPeriod') return '얼리버드';
												if (type === 'default') return '기본';
												return type;
											})()}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
											{cost.reservePeriod ? (() => {
												try {
													const raw = cost.reservePeriod;
													const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
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
												return '-';
											})() : '-'}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
											{cost.inputDefault ? (() => {
												try {
													const raw = cost.inputDefault;
													const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
													if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.period) {
														const periodArr = Array.isArray(parsed.period) ? parsed.period : [];
														if (periodArr.length > 0 && periodArr[0].start && periodArr[0].end) {
															const formatDateStr = (d: string) => {
																const [y, m, day] = d.split('-');
																return `${y.slice(2)}년${m}월${day}일`;
															};
															return `${formatDateStr(periodArr[0].start)} ~ ${formatDateStr(periodArr[0].end)}`;
														}
													}
												} catch (e) {
													// ignore
												}
												return '-';
											})() : '-'}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
											{cost.inputDefault ? (() => {
												try {
													const raw = cost.inputDefault;
													const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
													if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
														const preStayRaw = (parsed.preStay ?? '').toString();
														if (!preStayRaw) return '-';
														if (preStayRaw === 'true') return '예';
														if (preStayRaw === 'false') return '아니오';
														return preStayRaw;
													}
												} catch (e) {
													// ignore
												}
												return '-';
											})() : '-'}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
											{cost.inputDefault ? (() => {
												try {
													const raw = cost.inputDefault;
													const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
													
													if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.costByRoomType) {
														const roomList = Array.isArray(parsed.costByRoomType) ? parsed.costByRoomType : [];
														if (roomList.length === 0) return '-';
														return (
															<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2}}>
																{roomList.map((rt: any, i: number) => {
																	const roomType = rt.roomType || '-';
																	const currency = rt.currency || '';
																	const formatPrice = (v: any) => {
																		if (!v || v === '') return '';
																		const num = parseInt(String(v).replace(/,/g, ''), 10);
																		const formatted = isNaN(num) ? String(v) : num.toLocaleString('ko-KR');
																		const suffix = currency === '₩' ? '원' : '';
																		return `${currency}${formatted}${suffix}`;
																	};
																	const parts: string[] = [];
																	// 미니멈스테이 형식: 1박, 2박, 3박, 4박, 5박, 6박, 1박추가
																	if (rt.oneNightCost && rt.oneNightCost !== '') parts.push(`1박: ${formatPrice(rt.oneNightCost)}`);
																	if (rt.twoNightCost && rt.twoNightCost !== '') parts.push(`2박: ${formatPrice(rt.twoNightCost)}`);
																	if (rt.threeNightCost && rt.threeNightCost !== '') parts.push(`3박: ${formatPrice(rt.threeNightCost)}`);
																	if (rt.fourNightCost && rt.fourNightCost !== '') parts.push(`4박: ${formatPrice(rt.fourNightCost)}`);
																	if (rt.fiveNightCost && rt.fiveNightCost !== '') parts.push(`5박: ${formatPrice(rt.fiveNightCost)}`);
																	if (rt.sixNightCost && rt.sixNightCost !== '') parts.push(`6박: ${formatPrice(rt.sixNightCost)}`);
																	if (rt.oneNightAdd && rt.oneNightAdd !== '') parts.push(`1박추가: ${formatPrice(rt.oneNightAdd)}`);
																	const priceText = parts.length > 0 ? parts.join(' / ') : '';
																	return (
																		<div key={i} style={{whiteSpace: 'nowrap', textAlign: 'left'}}>
																			<span style={{fontWeight: 600}}>{roomType}</span>
																			{priceText && <span style={{marginLeft: 4}}> - {priceText}</span>}
																		</div>
																	);
																})}
															</div>
														);
													}
													
													if (Array.isArray(parsed) && parsed.length > 0) {
														return parsed.map((item: any) => item.roomType || '-').join(', ');
													}
													return '-';
												} catch (e) {
													// ignore
													return cost.inputDefault;
												}
											})() : '-'}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			) : (
				<div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
					등록된 요금 정보가 없습니다.
				</div>
			)}
		</div>
	);
}

interface PriceModalDataProps {
	productName: string;
	tourLocation?: string;
	tourPeriodData?: string;
	productScheduleData?: string;
	landCompany?: string;
}

interface HotelPriceInfo_MinimunStayProps {
	hotel1Cost: any | null;
	hotel2Cost: any | null;
	hotel3Cost: any | null;
	hotel4Cost: any | null;
	isLoadingCost: boolean;
	priceModalData: PriceModalDataProps | null;
	onBack: () => void;
	today: string;
	landCommissionTotal?: number;
	landDiscountDefaultTotal?: number;
	landDiscountSpecialTotal?: number;
	landCurrency?: string;
	onPriceUpdate?: (price: number) => void;
}

export default function HotelPriceInfo_MinimunStay({
	hotel1Cost,
	hotel2Cost,
	hotel3Cost,
	hotel4Cost,
	isLoadingCost,
	priceModalData,
	onBack,
	today,
	landCommissionTotal = 0,
	landDiscountDefaultTotal = 0,
	landDiscountSpecialTotal = 0,
	landCurrency = '₩',
	onPriceUpdate
}: HotelPriceInfo_MinimunStayProps) {
	// 환율 정보 가져오기
	const exchangeRate = useRecoilValue(recoilExchangeRate);
	// Recoil에서 여행기간 가져오기
	const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
	
	// 넘어오는 호텔 / 모달 데이터 콘솔 확인용
	useEffect(() => {
		console.log('=== HotelPriceInfo_MinimunStay 호텔 데이터 ===');
		console.log('hotel1Cost:', hotel1Cost);
		console.log('hotel2Cost:', hotel2Cost);
		console.log('hotel3Cost:', hotel3Cost);
		console.log('hotel4Cost:', hotel4Cost);
		console.log('priceModalData:', priceModalData);
		console.log('isLoadingCost:', isLoadingCost);
		console.log('=============================================');
	}, [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, priceModalData, isLoadingCost]);
	
	// productScheduleData를 기반으로 호텔 분류 (useMemo로 자동 재계산)
	const scheduledHotels = useMemo(() => {
		if (!priceModalData?.productScheduleData) return [];
		
		try {
			const scheduleData = JSON.parse(priceModalData.productScheduleData);
			if (!Array.isArray(scheduleData) || scheduleData.length === 0) return [];
			
			const hotels: { hotelSort: string; hotelCost: any; index: number }[] = [];
			const allHotels = [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost].filter(h => h !== null);
			
			// productScheduleData 순서대로 호텔 매칭
			scheduleData.slice(0, 4).forEach((item: any, index: number) => {
				if (allHotels[index]) {
					hotels.push({
						hotelSort: item.hotelSort || '',
						hotelCost: allHotels[index],
						index: index + 1
					});
				}
			});
			
			return hotels;
		} catch (e) {
			return [];
		}
	}, [priceModalData?.productScheduleData, hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost]);


	

	// 미니멈스테이 검색 관련 상태 (각 호텔별로 관리)
	const [minimumStayReserveDate, setMinimumStayReserveDate] = useState<string>(today);
	const [minimumStaySearchDateStart, setMinimumStaySearchDateStart] = useState<string>('');
	const [minimumStaySearchDateEnd, setMinimumStaySearchDateEnd] = useState<string>('');

	// travelPeriod를 파싱하여 날짜 범위 설정
	useEffect(() => {
		console.log('📅 travelPeriod 파싱 시작 (미니멈스테이):', customerInfo.travelPeriod);
		if (customerInfo.travelPeriod) {
			const travelPeriod = customerInfo.travelPeriod.trim();
			
			// "YYYY-MM-DD ~ YYYY-MM-DD" 형식인 경우
			if (travelPeriod.includes('~')) {
				const parts = travelPeriod.split('~').map(part => part.trim());
				console.log('📅 날짜 범위 파싱 (미니멈스테이):', parts);
				if (parts.length === 2) {
					const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
					if (dateRegex.test(parts[0]) && dateRegex.test(parts[1])) {
						console.log('✅ 날짜 범위 설정 (미니멈스테이):', parts[0], '~', parts[1]);
						setMinimumStaySearchDateStart(parts[0]);
						setMinimumStaySearchDateEnd(parts[1]);
					} else {
						console.warn('⚠️ 날짜 형식이 올바르지 않음 (미니멈스테이):', parts);
					}
				}
			} else {
				// 단일 날짜인 경우
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (dateRegex.test(travelPeriod)) {
					console.log('✅ 단일 날짜 설정 (미니멈스테이):', travelPeriod);
					setMinimumStaySearchDateStart(travelPeriod);
					setMinimumStaySearchDateEnd(travelPeriod);
				} else {
					console.warn('⚠️ 날짜 형식이 올바르지 않음 (미니멈스테이):', travelPeriod);
				}
			}
		} else {
			console.log('⚠️ travelPeriod가 없음 (미니멈스테이)');
		}
	}, [customerInfo.travelPeriod]);

	// 예약일자 초기값을 Recoil에서 가져오기
	useEffect(() => {
		if (customerInfo.reserveDate) {
			setMinimumStayReserveDate(customerInfo.reserveDate);
		}
	}, [customerInfo.reserveDate]);
	// 단일(기존) 선택 상태
	const [minimumStaySelectedRoomType, setMinimumStaySelectedRoomType] = useState<string>('');
	const [minimumStaySelectedPeriodType, setMinimumStaySelectedPeriodType] = useState<string>('');
	// 리조트 2개 이상일 때, 리조트별 선택 상태
	const [minimumStaySelectedRoomTypeByIndex, setMinimumStaySelectedRoomTypeByIndex] = useState<{ [index: number]: string }>({});
	const [minimumStaySelectedPeriodTypeByIndex, setMinimumStaySelectedPeriodTypeByIndex] = useState<{ [index: number]: string }>({});
	const [minimumStayHighlightedCosts, setMinimumStayHighlightedCosts] = useState<Set<number>>(new Set());
	const [minimumStayFinalSearchResult, setMinimumStayFinalSearchResult] = useState<{
		reserveType: string;
		reservePeriod: string;
		roomType: string;
		priceText: string;
		originalPriceText: string;
		exchangeRate: number;
		resortDetails?: Array<{
			resortIndex: number;
			resortName: string;
			roomType: string;
			periodType: string;
			priceText: string;
			originalPriceText: string;
		}>;
	} | null>(null);

	const formatNumber = (n: number) => n.toLocaleString('ko-KR');
	const parsePriceFromText = (text: string) => {
		const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
		const currencyMatch = text.match(/₩|\$/);
		return {
			num: isNaN(num) ? 0 : num,
			currency: currencyMatch ? currencyMatch[0] : '₩'
		};
	};
	const usdRate = useMemo(() => {
		const raw = exchangeRate?.USDsend_KRW_tts;
		const rawStr = raw !== undefined && raw !== null ? String(raw) : '';
		const num = parseFloat(rawStr.replace(/,/g, ''));
		return isNaN(num) ? 0 : num;
	}, [exchangeRate]);
	const convertLandAmount = (value: number, baseCurrency: string) => {
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

	// 조합 계산용: 문자열 박수 -> 숫자
	const parseNights = (str: string | undefined): number => {
		if (!str) return 0;
		const m = str.match(/(\d+)/);
		return m ? parseInt(m[1], 10) : 0;
	};

	// 조합 규칙 정의 (리조트 박수 조합)
	const resortComboRules2 = [
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

	const resortComboRules3 = [
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

	const parseAmount = (v: any): number => {
		if (v === null || v === undefined || v === '') return 0;
		const num = parseFloat(String(v).replace(/,/g, ''));
		return isNaN(num) ? 0 : num;
	};

	const getNightCostKey = (n: number): keyof any | null => {
		if (n === 1) return 'oneNightCost';
		if (n === 2) return 'twoNightCost';
		if (n === 3) return 'threeNightCost';
		if (n === 4) return 'fourNightCost';
		if (n === 5) return 'fiveNightCost';
		if (n === 6) return 'sixNightCost';
		return null;
	};

	// 리조트 박수 조합 요금 (상단 배너용)
	const comboPriceText = useMemo(() => {
		if (!priceModalData?.productScheduleData) return '';
		let scheduleData: any[] = [];
		try {
			scheduleData = JSON.parse(priceModalData.productScheduleData);
		} catch {
			return '';
		}
		if (!Array.isArray(scheduleData) || scheduleData.length === 0) return '';

		// 스케줄 중 리조트만 추출 (순서 보존)
		const resortSchedules = scheduleData.filter((item: any) => item.hotelSort === '리조트');
		if (resortSchedules.length < 2) return ''; // 리조트 1개인 경우는 기존 검색만 사용

		// scheduledHotels 중 리조트만 추출 (순서 보존)
		const resortHotels = scheduledHotels.filter((h) => h.hotelSort === '리조트');
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

					// 각 리조트의 인덱스에 해당하는 선택된 룸타입 사용
					const selectedRoomTypeForThisResort = minimumStaySelectedRoomTypeByIndex[resortHotel.index] || '';
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
	}, [priceModalData?.productScheduleData, scheduledHotels, minimumStaySelectedRoomType, minimumStaySelectedRoomTypeByIndex, formatNumber]);

	// 룸타입 목록 추출 (공통)
	const extractRoomTypes = (costInputArr: any[]) => {
		const roomTypes = new Set<string>();
		costInputArr.forEach((cost: any) => {
			try {
				const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
				if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
					inputDefault.costByRoomType.forEach((rt: any) => {
						if (rt.roomType) roomTypes.add(rt.roomType);
					});
				}
			} catch (e) {
				// ignore
			}
		});
		return Array.from(roomTypes);
	};


	// 미니멈스테이 검색
	const handleMinimumStaySearch = (hotelCost: any, selectedRoomTypeOverride?: string, selectedPeriodTypeOverride?: string) => {
		if (!hotelCost || !hotelCost.costInput) {
			setMinimumStayHighlightedCosts(new Set());
			setMinimumStayFinalSearchResult(null);
			return;
		}

		const highlighted = new Set<number>();
		let finalResult: {
			reserveType: string;
			reservePeriod: string;
			roomType: string;
			priceText: string;
			originalPriceText: string;
			exchangeRate: number;
		} | null = null;

		const roomTypeFilter = selectedRoomTypeOverride !== undefined ? selectedRoomTypeOverride : minimumStaySelectedRoomType;
		const periodTypeFilter = selectedPeriodTypeOverride !== undefined ? selectedPeriodTypeOverride : minimumStaySelectedPeriodType;

		// 예약기간 포맷팅 함수
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

		hotelCost.costInput.forEach((cost: any, idx: number) => {
			let matches = true;

			// 예약일자 필터링 (reservePeriod와 비교)
			if (minimumStayReserveDate) {
				try {
					const reserveDate = new Date(minimumStayReserveDate);
					if (!isNaN(reserveDate.getTime())) {
						const reservePeriod = cost.reservePeriod ? (typeof cost.reservePeriod === 'string' ? JSON.parse(cost.reservePeriod) : cost.reservePeriod) : null;
						
						if (reservePeriod) {
							let matchesReserveDate = false;
							
							// reservePeriod가 {start, end} 형태인 경우
							if (reservePeriod.start && reservePeriod.end) {
								const periodStart = new Date(reservePeriod.start);
								const periodEnd = new Date(reservePeriod.end);
								
								if (!isNaN(periodStart.getTime()) && !isNaN(periodEnd.getTime())) {
									// 예약일자가 예약기간 안에 포함되는지 확인
									matchesReserveDate = reserveDate.getTime() >= periodStart.getTime() && reserveDate.getTime() <= periodEnd.getTime();
								}
							}
							// reservePeriod가 배열 형태인 경우
							else if (Array.isArray(reservePeriod) && reservePeriod.length >= 2) {
								const periodStart = new Date(reservePeriod[0]);
								const periodEnd = new Date(reservePeriod[1]);
								
								if (!isNaN(periodStart.getTime()) && !isNaN(periodEnd.getTime())) {
									matchesReserveDate = reserveDate.getTime() >= periodStart.getTime() && reserveDate.getTime() <= periodEnd.getTime();
								}
							}
							
							if (!matchesReserveDate) {
								matches = false;
							}
						}
					}
				} catch (e) {
					// ignore
				}
			}

			// 선택일자 필터링 (inputDefault.period와 비교)
			if (matches && minimumStaySearchDateStart && minimumStaySearchDateEnd) {
				try {
					// inputDefault 안의 period가 선택일자 (실제 숙박 기간)
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					
					if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
						// period 배열에서 날짜 범위 확인
						let hasMatchingPeriod = false;
						const searchStartDate = new Date(minimumStaySearchDateStart);
						const searchEndDate = new Date(minimumStaySearchDateEnd);
						
						for (const periodItem of inputDefault.period) {
							if (periodItem.start && periodItem.end) {
								const periodStartDate = new Date(periodItem.start);
								const periodEndDate = new Date(periodItem.end);
								
								if (!isNaN(searchStartDate.getTime()) && !isNaN(searchEndDate.getTime()) && 
									!isNaN(periodStartDate.getTime()) && !isNaN(periodEndDate.getTime())) {
									
									// 두 날짜 범위가 겹치는지 확인
									const overlaps = !(searchStartDate.getTime() > periodEndDate.getTime() || searchEndDate.getTime() < periodStartDate.getTime());
									
									if (overlaps) {
										hasMatchingPeriod = true;
										break;
									}
								}
							}
						}
						
						if (!hasMatchingPeriod) {
							matches = false;
						}
					}
				} catch (e) {
					// ignore
				}
			}

			if (matches && (roomTypeFilter || periodTypeFilter)) {
				try {
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
						const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
							// 룸타입 필터링
							if (roomTypeFilter && rt.roomType !== roomTypeFilter) {
								return false;
							}
							// 기간타입 필터링
							if (periodTypeFilter) {
								let hasPeriod = false;
								if (periodTypeFilter === '1박' && rt.oneNightCost && rt.oneNightCost !== '') hasPeriod = true;
								if (periodTypeFilter === '2박' && rt.twoNightCost && rt.twoNightCost !== '') hasPeriod = true;
								if (periodTypeFilter === '3박' && rt.threeNightCost && rt.threeNightCost !== '') hasPeriod = true;
								if (periodTypeFilter === '4박' && rt.fourNightCost && rt.fourNightCost !== '') hasPeriod = true;
								if (periodTypeFilter === '5박' && rt.fiveNightCost && rt.fiveNightCost !== '') hasPeriod = true;
								if (periodTypeFilter === '6박' && rt.sixNightCost && rt.sixNightCost !== '') hasPeriod = true;
								if (periodTypeFilter === '1박추가' && rt.oneNightAdd && rt.oneNightAdd !== '') hasPeriod = true;
								if (!hasPeriod) return false;
							}
							return true;
						});

						if (matchingRoom) {
							highlighted.add(idx);
							if (!finalResult) {
								// 통화 정보 찾기: matchingRoom -> inputDefault -> cost 순서로 확인
								let currency = matchingRoom.currency || '';
								if (!currency && inputDefault && typeof inputDefault === 'object' && !Array.isArray(inputDefault)) {
									currency = inputDefault.currency || '';
								}
								if (!currency && cost && typeof cost === 'object') {
									currency = cost.currency || '';
								}
								
								// 통화 정보가 없으면 기본적으로 달러로 가정 (환율 적용)
								const isUSD = currency === '$' || currency === 'USD' || currency === 'US$' || currency === '';
								// 환율을 숫자로 변환 (문자열일 수 있음)
								const exchangeRateValue = exchangeRate?.USDsend_KRW_tts 
									? (typeof exchangeRate.USDsend_KRW_tts === 'string' 
										? parseFloat(String(exchangeRate.USDsend_KRW_tts).replace(/,/g, '')) 
										: Number(exchangeRate.USDsend_KRW_tts))
									: 0;
								
								// 원래 요금 포맷팅 함수 (달러, 환율 적용 전)
								const formatOriginalPrice = (v: any) => {
									if (!v || v === '') return '';
									const num = parseFloat(String(v).replace(/,/g, ''));
									if (isNaN(num)) return String(v);
									const formatted = num.toLocaleString('ko-KR');
									return `$${formatted}`;
								};
								
								const formatPrice = (v: any) => {
									if (!v || v === '') return '';
									let num = parseFloat(String(v).replace(/,/g, ''));
									if (isNaN(num)) return String(v);
									
									// 달러인 경우 원화로 변환
									if (isUSD && exchangeRateValue > 0 && !isNaN(exchangeRateValue)) {
										num = num * exchangeRateValue;
									}
									
									const formatted = Math.round(num).toLocaleString('ko-KR');
									return `₩${formatted}원`;
								};
								let priceText = '';
								let originalPriceText = '';
								if (periodTypeFilter) {
									// 선택된 기간 타입에 해당하는 요금 표시
									if (periodTypeFilter === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
										priceText = `1박: ${formatPrice(matchingRoom.oneNightCost)}`;
										originalPriceText = `1박: ${formatOriginalPrice(matchingRoom.oneNightCost)}`;
									} else if (periodTypeFilter === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
										priceText = `2박: ${formatPrice(matchingRoom.twoNightCost)}`;
										originalPriceText = `2박: ${formatOriginalPrice(matchingRoom.twoNightCost)}`;
									} else if (periodTypeFilter === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
										priceText = `3박: ${formatPrice(matchingRoom.threeNightCost)}`;
										originalPriceText = `3박: ${formatOriginalPrice(matchingRoom.threeNightCost)}`;
									} else if (periodTypeFilter === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
										priceText = `4박: ${formatPrice(matchingRoom.fourNightCost)}`;
										originalPriceText = `4박: ${formatOriginalPrice(matchingRoom.fourNightCost)}`;
									} else if (periodTypeFilter === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
										priceText = `5박: ${formatPrice(matchingRoom.fiveNightCost)}`;
										originalPriceText = `5박: ${formatOriginalPrice(matchingRoom.fiveNightCost)}`;
									} else if (periodTypeFilter === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
										priceText = `6박: ${formatPrice(matchingRoom.sixNightCost)}`;
										originalPriceText = `6박: ${formatOriginalPrice(matchingRoom.sixNightCost)}`;
									} else if (periodTypeFilter === '1박추가' && matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
										priceText = `1박추가: ${formatPrice(matchingRoom.oneNightAdd)}`;
										originalPriceText = `1박추가: ${formatOriginalPrice(matchingRoom.oneNightAdd)}`;
									}
								} else {
									// 기간 타입이 선택되지 않은 경우 모든 요금 표시
									const parts: string[] = [];
									const originalParts: string[] = [];
									if (matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
										parts.push(`1박: ${formatPrice(matchingRoom.oneNightCost)}`);
										originalParts.push(`1박: ${formatOriginalPrice(matchingRoom.oneNightCost)}`);
									}
									if (matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
										parts.push(`2박: ${formatPrice(matchingRoom.twoNightCost)}`);
										originalParts.push(`2박: ${formatOriginalPrice(matchingRoom.twoNightCost)}`);
									}
									if (matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
										parts.push(`3박: ${formatPrice(matchingRoom.threeNightCost)}`);
										originalParts.push(`3박: ${formatOriginalPrice(matchingRoom.threeNightCost)}`);
									}
									if (matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
										parts.push(`4박: ${formatPrice(matchingRoom.fourNightCost)}`);
										originalParts.push(`4박: ${formatOriginalPrice(matchingRoom.fourNightCost)}`);
									}
									if (matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
										parts.push(`5박: ${formatPrice(matchingRoom.fiveNightCost)}`);
										originalParts.push(`5박: ${formatOriginalPrice(matchingRoom.fiveNightCost)}`);
									}
									if (matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
										parts.push(`6박: ${formatPrice(matchingRoom.sixNightCost)}`);
										originalParts.push(`6박: ${formatOriginalPrice(matchingRoom.sixNightCost)}`);
									}
									if (matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
										parts.push(`1박추가: ${formatPrice(matchingRoom.oneNightAdd)}`);
										originalParts.push(`1박추가: ${formatOriginalPrice(matchingRoom.oneNightAdd)}`);
									}
									priceText = parts.join(' / ');
									originalPriceText = originalParts.join(' / ');
								}
								
								finalResult = {
									reserveType: cost.reserveType === 'earlyPeriod' ? '얼리버드' : cost.reserveType === 'default' ? '기본' : cost.reserveType || '-',
									reservePeriod: formatReservePeriod(cost.reservePeriod),
									roomType: matchingRoom.roomType || '-',
									priceText: priceText,
									originalPriceText: originalPriceText,
									exchangeRate: exchangeRateValue
								};
							}
						}
					}
				} catch (e) {
					// ignore
				}
			} else if (matches) {
				highlighted.add(idx);
			}
		});

		setMinimumStayHighlightedCosts(highlighted);
		setMinimumStayFinalSearchResult(finalResult);
	};

	// 리조트가 2개 이상일 때 각 리조트별 검색 수행
	const handleCombinedResortSearch = (resortSearchData: Array<{ hotelCost: any; selectedRoomType: string; selectedPeriodType: string }>) => {
		const resortHotels = scheduledHotels.filter((h) => h.hotelSort === '리조트');
		if (resortHotels.length < 2) return;

		const resortDetails: Array<{
			resortIndex: number;
			resortName: string;
			roomType: string;
			periodType: string;
			priceText: string;
			originalPriceText: string;
		}> = [];

		let totalPrice = 0;
		let totalOriginalPrice = 0;
		let currency = '';
		let exchangeRateValue = 0;

		// 각 리조트별로 검색 수행
		resortHotels.forEach((resortHotel, idx) => {
			const searchData = resortSearchData.find((data, i) => i === idx);
			if (!searchData || !resortHotel.hotelCost) return;

			const { hotelCost, selectedRoomType, selectedPeriodType } = searchData;
			if (!hotelCost || !hotelCost.costInput) return;

			// 해당 리조트의 요금 정보 찾기
			hotelCost.costInput.forEach((cost: any) => {
				let matches = true;

				// 예약일자 필터링 (reservePeriod와 비교)
				if (minimumStayReserveDate) {
					try {
						const reserveDate = new Date(minimumStayReserveDate);
						if (!isNaN(reserveDate.getTime())) {
							const reservePeriod = cost.reservePeriod ? (typeof cost.reservePeriod === 'string' ? JSON.parse(cost.reservePeriod) : cost.reservePeriod) : null;
							
							if (reservePeriod) {
								let matchesReserveDate = false;
								
								// reservePeriod가 {start, end} 형태인 경우
								if (reservePeriod.start && reservePeriod.end) {
									const periodStart = new Date(reservePeriod.start);
									const periodEnd = new Date(reservePeriod.end);
									
									if (!isNaN(periodStart.getTime()) && !isNaN(periodEnd.getTime())) {
										// 예약일자가 예약기간 안에 포함되는지 확인
										matchesReserveDate = reserveDate.getTime() >= periodStart.getTime() && reserveDate.getTime() <= periodEnd.getTime();
									}
								}
								// reservePeriod가 배열 형태인 경우
								else if (Array.isArray(reservePeriod) && reservePeriod.length >= 2) {
									const periodStart = new Date(reservePeriod[0]);
									const periodEnd = new Date(reservePeriod[1]);
									
									if (!isNaN(periodStart.getTime()) && !isNaN(periodEnd.getTime())) {
										matchesReserveDate = reserveDate.getTime() >= periodStart.getTime() && reserveDate.getTime() <= periodEnd.getTime();
									}
								}
								
								if (!matchesReserveDate) {
									matches = false;
								}
							}
						}
					} catch (e) {
						// ignore
					}
				}

				// 선택일자 필터링 (inputDefault.period와 비교)
				if (matches && minimumStaySearchDateStart && minimumStaySearchDateEnd) {
					try {
						const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
						
						if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
							let hasMatchingPeriod = false;
							const searchStartDate = new Date(minimumStaySearchDateStart);
							const searchEndDate = new Date(minimumStaySearchDateEnd);
							
							for (const periodItem of inputDefault.period) {
								if (periodItem.start && periodItem.end) {
									const periodStartDate = new Date(periodItem.start);
									const periodEndDate = new Date(periodItem.end);
									
									if (!isNaN(searchStartDate.getTime()) && !isNaN(searchEndDate.getTime()) && 
										!isNaN(periodStartDate.getTime()) && !isNaN(periodEndDate.getTime())) {
										
										// 두 날짜 범위가 겹치는지 확인
										const overlaps = !(searchStartDate.getTime() > periodEndDate.getTime() || searchEndDate.getTime() < periodStartDate.getTime());
										
										if (overlaps) {
											hasMatchingPeriod = true;
											break;
										}
									}
								}
							}
							
							if (!hasMatchingPeriod) {
								matches = false;
							}
						}
					} catch (e) {
						// ignore
					}
				}

				if (!matches) return;

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

							const formatOriginalPrice = (v: any) => {
								if (!v || v === '') return '';
								const num = parseFloat(String(v).replace(/,/g, ''));
								if (isNaN(num)) return String(v);
								const formatted = num.toLocaleString('ko-KR');
								return `$${formatted}`;
							};

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
							let originalPriceText = '';
							let priceNum = 0;
							let originalPriceNum = 0;

							if (selectedPeriodType) {
								if (selectedPeriodType === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
									priceText = `1박: ${formatPrice(matchingRoom.oneNightCost)}`;
									originalPriceText = `1박: ${formatOriginalPrice(matchingRoom.oneNightCost)}`;
									priceNum = parseAmount(matchingRoom.oneNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.oneNightCost);
								} else if (selectedPeriodType === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
									priceText = `2박: ${formatPrice(matchingRoom.twoNightCost)}`;
									originalPriceText = `2박: ${formatOriginalPrice(matchingRoom.twoNightCost)}`;
									priceNum = parseAmount(matchingRoom.twoNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.twoNightCost);
								} else if (selectedPeriodType === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
									priceText = `3박: ${formatPrice(matchingRoom.threeNightCost)}`;
									originalPriceText = `3박: ${formatOriginalPrice(matchingRoom.threeNightCost)}`;
									priceNum = parseAmount(matchingRoom.threeNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.threeNightCost);
								} else if (selectedPeriodType === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
									priceText = `4박: ${formatPrice(matchingRoom.fourNightCost)}`;
									originalPriceText = `4박: ${formatOriginalPrice(matchingRoom.fourNightCost)}`;
									priceNum = parseAmount(matchingRoom.fourNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.fourNightCost);
								} else if (selectedPeriodType === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
									priceText = `5박: ${formatPrice(matchingRoom.fiveNightCost)}`;
									originalPriceText = `5박: ${formatOriginalPrice(matchingRoom.fiveNightCost)}`;
									priceNum = parseAmount(matchingRoom.fiveNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.fiveNightCost);
								} else if (selectedPeriodType === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
									priceText = `6박: ${formatPrice(matchingRoom.sixNightCost)}`;
									originalPriceText = `6박: ${formatOriginalPrice(matchingRoom.sixNightCost)}`;
									priceNum = parseAmount(matchingRoom.sixNightCost) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.sixNightCost);
								} else if (selectedPeriodType === '1박추가' && matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
									priceText = `1박추가: ${formatPrice(matchingRoom.oneNightAdd)}`;
									originalPriceText = `1박추가: ${formatOriginalPrice(matchingRoom.oneNightAdd)}`;
									priceNum = parseAmount(matchingRoom.oneNightAdd) * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = parseAmount(matchingRoom.oneNightAdd);
								}
							}

							if (priceText) {
								resortDetails.push({
									resortIndex: resortHotel.index,
									resortName: resortHotel.hotelCost?.hotel?.hotelNameKo || `리조트 ${resortHotel.index}`,
									roomType: matchingRoom.roomType || '-',
									periodType: selectedPeriodType || '-',
									priceText: priceText,
									originalPriceText: originalPriceText
								});

								totalPrice += priceNum;
								totalOriginalPrice += originalPriceNum;
							}
						}
					}
				} catch (e) {
					// ignore
				}
			});
		});

		// 합산 요금 포맷팅
		const cur = currency || '₩';
		const totalPriceText = `${cur}${formatNumber(Math.round(totalPrice))}${cur === '₩' ? '원' : ''}`;
		const totalOriginalPriceText = `$${formatNumber(Math.round(totalOriginalPrice))}`;

		// 첫 번째 리조트의 정보를 기본으로 사용
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

			setMinimumStayFinalSearchResult({
				reserveType: firstCost.reserveType === 'earlyPeriod' ? '얼리버드' : firstCost.reserveType === 'default' ? '기본' : firstCost.reserveType || '-',
				reservePeriod: formatReservePeriod(firstCost.reservePeriod),
				roomType: resortDetails.map(d => d.roomType).join(', ') || '-',
				priceText: totalPriceText,
				originalPriceText: totalOriginalPriceText,
				exchangeRate: exchangeRateValue,
				resortDetails: resortDetails
			});
		}
	};

	// 검색 결과가 변경될 때마다 부모 컴포넌트에 가격 업데이트
	useEffect(() => {
		if (minimumStayFinalSearchResult && onPriceUpdate) {
			const { num: priceNum } = parsePriceFromText(minimumStayFinalSearchResult.priceText || '');
			if (priceNum > 0) {
				// 판매가 계산 (랜드사 수수료/할인 포함)
				const { currency } = parsePriceFromText(minimumStayFinalSearchResult.priceText || '');
				const commissionAdj = convertLandAmount(landCommissionTotal, currency);
				const defaultAdj = convertLandAmount(landDiscountDefaultTotal, currency);
				const specialAdj = convertLandAmount(landDiscountSpecialTotal, currency);
				const saleNum = Math.max(0, priceNum + commissionAdj - defaultAdj - specialAdj);
				onPriceUpdate(saleNum);
			}
		}
	}, [minimumStayFinalSearchResult, onPriceUpdate, landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency, usdRate, convertLandAmount, parsePriceFromText]);

	return (
		<div style={{
			marginTop: '30px',
			paddingTop: '20px',
			borderTop: '2px solid #e0e0e0'
		}}>
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '20px'
			}}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<h3 style={{
						margin: 0,
						fontSize: '18px',
						fontWeight: 'bold',
						color: '#333'
					}}>
						2단계: 호텔 요금 정보
					</h3>
					{comboPriceText && (
						<div style={{
							marginLeft: '16px',
							padding: '8px 12px',
							borderRadius: '6px',
							backgroundColor: '#e3f2fd',
							color: '#333',
							fontSize: '15px',
							border: '1px solid #5fb7ef'
						}}>
							<strong>조합 요금(리조트 박수 조합):</strong> {comboPriceText}
						</div>
					)}
				</div>
				<button
					onClick={onBack}
					style={{
						padding: '8px 16px',
						borderRadius: '4px',
						border: '1px solid #ddd',
						backgroundColor: '#fff',
						color: '#666',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: '500'
					}}
				>
					이전
				</button>
			</div>
			
			{isLoadingCost ? (
				<div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
					요금 정보를 불러오는 중...
				</div>
			) : (
				<div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
					{/* productScheduleData 순서대로 호텔 표시 */}
					{scheduledHotels.map(({ hotelSort, hotelCost }, idx) => (
						<div key={idx}>
							<HotelCostList_MinimunStay
								hotelCost={hotelCost}
								title={hotelSort || `호텔${idx + 1}`}
								highlightedCosts={minimumStayHighlightedCosts}
								isPoolVilla={false}
							/>
						</div>
					))}
					
					{/* 검색 영역 */}
					{scheduledHotels.length > 0 && scheduledHotels[0].hotelCost && (
						<div style={{
							marginTop: '30px',
							paddingTop: '20px',
							borderTop: '2px solid #e0e0e0'
						}}>
							<h4 style={{
								margin: '0 0 15px 0',
								fontSize: '16px',
								fontWeight: 'bold',
								color: '#333',
								paddingBottom: '10px',
								borderBottom: '2px solid #5fb7ef'
							}}>
								검색
							</h4>
							<div style={{
								padding: '12px',
								border: '1px solid #e0e0e0',
								borderRadius: '6px',
								backgroundColor: '#fff',
								display: 'flex',
								flexDirection: 'column',
								gap: '12px'
							}}>
								<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>예약일자</span>
								<DateBoxSingle
									date={minimumStayReserveDate ? new Date(minimumStayReserveDate) : new Date(today)}
									setSelectDate={(dateStr: string) => {
										if (dateStr) {
											setMinimumStayReserveDate(dateStr);
										}
									}}
								/>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>선택일자</span>
								<DateBoxDouble
									dateStart={minimumStaySearchDateStart ? new Date(minimumStaySearchDateStart) : null}
									dateEnd={minimumStaySearchDateEnd ? new Date(minimumStaySearchDateEnd) : null}
									setSelectStartDate={setMinimumStaySearchDateStart}
									setSelectEndDate={setMinimumStaySearchDateEnd}
								/>
								</div>

								{/* 리조트가 1개인 경우: 기존 방식 */}
								{scheduledHotels.filter(h => h.hotelSort === '리조트').length <= 1 && (
									<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
										<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
										<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
											{extractRoomTypes(scheduledHotels[0].hotelCost.costInput).map((rt) => (
												<button
													key={rt}
													onClick={() => setMinimumStaySelectedRoomType(minimumStaySelectedRoomType === rt ? '' : rt)}
													style={{
														padding: '6px 12px',
														borderRadius: '4px',
														border: `1px solid ${minimumStaySelectedRoomType === rt ? '#5fb7ef' : '#ddd'}`,
														backgroundColor: minimumStaySelectedRoomType === rt ? '#5fb7ef' : '#fff',
														color: minimumStaySelectedRoomType === rt ? '#fff' : '#333',
														cursor: 'pointer',
														fontSize: '16px',
														fontWeight: minimumStaySelectedRoomType === rt ? '600' : '400'
													}}
												>
													{rt}
												</button>
											))}
										</div>

										<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>기간타입</span>
										<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
											{['1박', '2박', '3박', '4박', '5박', '6박', '1박추가'].map((pt) => (
												<button
													key={pt}
													onClick={() => setMinimumStaySelectedPeriodType(minimumStaySelectedPeriodType === pt ? '' : pt)}
													style={{
														padding: '6px 12px',
														borderRadius: '4px',
														border: `1px solid ${minimumStaySelectedPeriodType === pt ? '#5fb7ef' : '#ddd'}`,
														backgroundColor: minimumStaySelectedPeriodType === pt ? '#5fb7ef' : '#fff',
														color: minimumStaySelectedPeriodType === pt ? '#fff' : '#333',
														cursor: 'pointer',
														fontSize: '16px',
														fontWeight: minimumStaySelectedPeriodType === pt ? '600' : '400'
													}}
												>
													{pt}
												</button>
											))}
										</div>

										<button
											onClick={() => handleMinimumStaySearch(scheduledHotels[0].hotelCost, minimumStaySelectedRoomType, minimumStaySelectedPeriodType)}
											style={{
												padding: '8px 16px',
												borderRadius: '4px',
												border: '1px solid #5fb7ef',
												backgroundColor: '#5fb7ef',
												color: '#fff',
												cursor: 'pointer',
												fontSize: '16px',
												fontWeight: 600
											}}
										>
											검색
										</button>
									</div>
								)}

								{/* 리조트가 2개 이상인 경우: 각 리조트별 룸타입/박수 선택 */}
								{scheduledHotels.filter(h => h.hotelSort === '리조트').length > 1 && (
									<div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
										{scheduledHotels.filter(h => h.hotelSort === '리조트').map(({ hotelSort, hotelCost, index }) => {
											const hotelIndex = index; // getHotelsBySchedule에서 1부터 시작
											const selectedRoom = minimumStaySelectedRoomTypeByIndex[hotelIndex] || '';
											const selectedPeriod = minimumStaySelectedPeriodTypeByIndex[hotelIndex] || '';
											return (
												<div key={hotelIndex} style={{borderTop: '1px solid #eee', paddingTop: '8px'}}>
													<div style={{marginBottom: '4px', fontWeight: 600, color: '#666'}}>
														{hotelSort} {hotelIndex}
													</div>
													<div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
														<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
														<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
															{extractRoomTypes(hotelCost.costInput).map((rt: string) => (
																<button
																	key={rt}
																	onClick={() =>
																		setMinimumStaySelectedRoomTypeByIndex(prev => ({
																			...prev,
																			[hotelIndex]: prev[hotelIndex] === rt ? '' : rt
																		}))
																	}
																	style={{
																		padding: '6px 12px',
																		borderRadius: '4px',
																		border: `1px solid ${selectedRoom === rt ? '#5fb7ef' : '#ddd'}`,
																		backgroundColor: selectedRoom === rt ? '#5fb7ef' : '#fff',
																		color: selectedRoom === rt ? '#fff' : '#333',
																		cursor: 'pointer',
																		fontSize: '16px',
																		fontWeight: selectedRoom === rt ? '600' : '400'
																	}}
																>
																	{rt}
																</button>
															))}
														</div>

														<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>기간타입</span>
														<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
															{['1박', '2박', '3박', '4박', '5박', '6박', '1박추가'].map((pt) => (
																<button
																	key={pt}
																	onClick={() =>
																		setMinimumStaySelectedPeriodTypeByIndex(prev => ({
																			...prev,
																			[hotelIndex]: prev[hotelIndex] === pt ? '' : pt
																		}))
																	}
																	style={{
																		padding: '6px 12px',
																		borderRadius: '4px',
																		border: `1px solid ${selectedPeriod === pt ? '#5fb7ef' : '#ddd'}`,
																		backgroundColor: selectedPeriod === pt ? '#5fb7ef' : '#fff',
																		color: selectedPeriod === pt ? '#fff' : '#333',
																		cursor: 'pointer',
																		fontSize: '16px',
																		fontWeight: selectedPeriod === pt ? '600' : '400'
																	}}
																>
																	{pt}
																</button>
															))}
														</div>
													</div>
												</div>
											);
										})}
										
										{/* 리조트 2개 이상인 경우: 맨 하단에 검색 버튼 하나만 */}
										<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '12px'}}>
											<button
												onClick={() => {
													// 각 리조트별 검색 데이터 수집
													const resortSearchData = scheduledHotels.filter(h => h.hotelSort === '리조트').map(({ hotelCost, index }) => ({
														hotelCost,
														selectedRoomType: minimumStaySelectedRoomTypeByIndex[index] || '',
														selectedPeriodType: minimumStaySelectedPeriodTypeByIndex[index] || ''
													}));
													handleCombinedResortSearch(resortSearchData);
												}}
												style={{
													padding: '8px 16px',
													borderRadius: '4px',
													border: '1px solid #5fb7ef',
													backgroundColor: '#5fb7ef',
													color: '#fff',
													cursor: 'pointer',
													fontSize: '16px',
													fontWeight: 600
												}}
											>
												검색
											</button>
										</div>
									</div>
								)}
							</div>

							{minimumStayFinalSearchResult && (
								<div style={{
									marginTop: '12px',
									padding: '12px',
									border: '1px solid #5fb7ef',
									borderRadius: '6px',
									backgroundColor: '#e3f2fd',
									color: '#333',
									fontSize: '16px'
								}}>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>예약유형:</span>
										<span style={{fontWeight: 500}}>{minimumStayFinalSearchResult.reserveType}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>예약기간:</span>
										<span style={{fontWeight: 500}}>{minimumStayFinalSearchResult.reservePeriod}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>룸타입:</span>
										<span style={{fontWeight: 500}}>{minimumStayFinalSearchResult.roomType}</span>
									</div>
									
									{/* 각 리조트별 상세 정보 */}
									{minimumStayFinalSearchResult.resortDetails && minimumStayFinalSearchResult.resortDetails.length > 0 && (
										<div style={{
											marginTop: '16px',
											padding: '12px',
											backgroundColor: '#fff',
											borderRadius: '4px',
											border: '1px solid #ddd'
										}}>
											<div style={{fontWeight: 600, color: '#333', marginBottom: '12px', fontSize: '17px'}}>
												각 리조트별 요금 정보
											</div>
											{minimumStayFinalSearchResult.resortDetails.map((detail, idx) => (
												<div key={idx} style={{
													marginBottom: idx < minimumStayFinalSearchResult.resortDetails!.length - 1 ? '12px' : '0',
													paddingBottom: idx < minimumStayFinalSearchResult.resortDetails!.length - 1 ? '12px' : '0',
													borderBottom: idx < minimumStayFinalSearchResult.resortDetails!.length - 1 ? '1px solid #eee' : 'none'
												}}>
													<div style={{fontWeight: 600, color: '#5fb7ef', marginBottom: '6px'}}>
														{detail.resortName} (리조트 {detail.resortIndex})
													</div>
													<div style={{marginLeft: '12px', fontSize: '15px'}}>
														<div style={{marginBottom: '4px'}}>
															<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>룸타입:</span>
															<span style={{fontWeight: 500}}>{detail.roomType}</span>
														</div>
														<div style={{marginBottom: '4px'}}>
															<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>박수:</span>
															<span style={{fontWeight: 500}}>{detail.periodType}</span>
														</div>
														<div style={{marginBottom: '4px'}}>
															<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>원래요금(달러):</span>
															<span style={{fontWeight: 500}}>{detail.originalPriceText || '-'}</span>
														</div>
														<div>
															<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>요금:</span>
															<span style={{fontWeight: 500}}>{detail.priceText}</span>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
									
									<div style={{marginTop: '12px', marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>원래요금(달러):</span>
										<span style={{fontWeight: 500}}>{minimumStayFinalSearchResult.originalPriceText || '-'}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>환율정보:</span>
										<span style={{fontWeight: 500}}>1 USD = {minimumStayFinalSearchResult.exchangeRate?.toLocaleString('ko-KR') || '-'} KRW</span>
									</div>
									<div>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>합산 요금:</span>
										<span style={{fontWeight: 500, fontSize: '17px', color: '#5fb7ef'}}>{minimumStayFinalSearchResult.priceText}</span>
									</div>
									{(() => {
										const { num: baseNum, currency } = parsePriceFromText(minimumStayFinalSearchResult.priceText || '');
										if (!baseNum) return null;
										const commissionAdj = convertLandAmount(landCommissionTotal, currency);
										const defaultAdj = convertLandAmount(landDiscountDefaultTotal, currency);
										const specialAdj = convertLandAmount(landDiscountSpecialTotal, currency);
										const saleNum = Math.max(
											0,
											baseNum + commissionAdj - defaultAdj - specialAdj
										);
										const suffix = currency === '₩' ? '원' : '';
										const saleText = `${currency}${formatNumber(saleNum)}${suffix}`;
										
										return (
											<div style={{marginTop: '8px'}}>
												<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>판매가:</span>
												<span style={{fontWeight: 500}}>{saleText}</span>
											</div>
										);
									})()}
								</div>
							)}
						</div>
					)}
					
					{scheduledHotels.length === 0 && (
						<div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
							요금 정보가 없습니다.
						</div>
					)}
				</div>
			)}
		</div>
	);
}

