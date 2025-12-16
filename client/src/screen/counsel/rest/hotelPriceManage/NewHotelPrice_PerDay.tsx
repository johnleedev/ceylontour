import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { recoilExchangeRate, recoilCustomerInfoFormData } from '../../../../RecoilStore';
import { DateBoxDouble } from '../../../../boxs/DateBoxDouble';
import { DateBoxSingle } from '../../../../boxs/DateBoxSingle';

// 풀빌라 전용 호텔 요금 리스트 컴포넌트
interface HotelCostListPerDayProps {
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



function HotelCostList_PerDay({ hotelCost, title, highlightedCosts, isPoolVilla = false }: HotelCostListPerDayProps) {
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
																		if (!v) return '';
																		const num = parseInt(String(v).replace(/,/g, ''), 10);
																		const formatted = isNaN(num) ? String(v) : num.toLocaleString('ko-KR');
																		const suffix = currency === '₩' ? '원' : '';
																		return `${currency}${formatted}${suffix}`;
																	};
																	const parts: string[] = [];
																	// 박당 요금 구조: dayStayCost(1박), dayStayCostAll(합계), dayPersonCost(1인)
																	if (rt.dayStayCost && rt.dayStayCost !== '') parts.push(`1박: ${formatPrice(rt.dayStayCost)}`);
																	if (rt.dayStayCostAll && rt.dayStayCostAll !== '') parts.push(`합계: ${formatPrice(rt.dayStayCostAll)}`);
																	if (rt.dayPersonCost && rt.dayPersonCost !== '') parts.push(`1인: ${formatPrice(rt.dayPersonCost)}`);
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

interface HotelPriceInfo_PerDayProps {
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

export default function HotelPriceInfo_PerDay({
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
}: HotelPriceInfo_PerDayProps) {
	// 환율 정보 가져오기
	const exchangeRate = useRecoilValue(recoilExchangeRate);
	// Recoil에서 여행기간 가져오기
	const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
	
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

	// 넘어오는 호텔 / 모달 데이터 콘솔 확인용
	useEffect(() => {
		console.log('=== HotelPriceInfo_PerDay 호텔 데이터 ===');
		console.log('hotel1Cost:', hotel1Cost);
		console.log('hotel2Cost:', hotel2Cost);
		console.log('hotel3Cost:', hotel3Cost);
		console.log('hotel4Cost:', hotel4Cost);
		console.log('priceModalData:', priceModalData);
		console.log('isLoadingCost:', isLoadingCost);
		console.log('scheduledHotels:', scheduledHotels);
		console.log('=============================================');
	}, [hotel1Cost, hotel2Cost, hotel3Cost, hotel4Cost, priceModalData, isLoadingCost, scheduledHotels]);

	// 검색 관련 상태 (각 호텔별로 관리)
	const [hotelReserveDate, setHotelReserveDate] = useState<string>(today);
	const [hotelSearchDateStart, setHotelSearchDateStart] = useState<string>('');
	const [hotelSearchDateEnd, setHotelSearchDateEnd] = useState<string>('');

	// travelPeriod를 파싱하여 날짜 범위 설정
	useEffect(() => {
		console.log('📅 travelPeriod 파싱 시작 (박당):', customerInfo.travelPeriod);
		if (customerInfo.travelPeriod) {
			const travelPeriod = customerInfo.travelPeriod.trim();
			
			// "YYYY-MM-DD ~ YYYY-MM-DD" 형식인 경우
			if (travelPeriod.includes('~')) {
				const parts = travelPeriod.split('~').map(part => part.trim());
				console.log('📅 날짜 범위 파싱 (박당):', parts);
				if (parts.length === 2) {
					const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
					if (dateRegex.test(parts[0]) && dateRegex.test(parts[1])) {
						console.log('✅ 날짜 범위 설정 (박당):', parts[0], '~', parts[1]);
						setHotelSearchDateStart(parts[0]);
						setHotelSearchDateEnd(parts[1]);
					} else {
						console.warn('⚠️ 날짜 형식이 올바르지 않음 (박당):', parts);
					}
				}
			} else {
				// 단일 날짜인 경우
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (dateRegex.test(travelPeriod)) {
					console.log('✅ 단일 날짜 설정 (박당):', travelPeriod);
					setHotelSearchDateStart(travelPeriod);
					setHotelSearchDateEnd(travelPeriod);
				} else {
					console.warn('⚠️ 날짜 형식이 올바르지 않음 (박당):', travelPeriod);
				}
			}
		} else {
			console.log('⚠️ travelPeriod가 없음 (박당)');
		}
	}, [customerInfo.travelPeriod]);

	// 예약일자 초기값을 Recoil에서 가져오기
	useEffect(() => {
		if (customerInfo.reserveDate) {
			setHotelReserveDate(customerInfo.reserveDate);
		}
	}, [customerInfo.reserveDate]);
	// 단일(기존) 선택 상태
	const [hotelSelectedRoomType, setHotelSelectedRoomType] = useState<string>('');
	const [hotelSelectedPeriodType, setHotelSelectedPeriodType] = useState<string>('');
	// 호텔 2개 이상일 때, 호텔별 선택 상태
	const [hotelSelectedRoomTypeByIndex, setHotelSelectedRoomTypeByIndex] = useState<{ [index: number]: string }>({});
	const [hotelSelectedPeriodTypeByIndex, setHotelSelectedPeriodTypeByIndex] = useState<{ [index: number]: string }>({});
	const [hotelHighlightedCosts, setHotelHighlightedCosts] = useState<Set<number>>(new Set());
	const [hotelFinalSearchResult, setHotelFinalSearchResult] = useState<{
		reserveType: string;
		reservePeriod: string;
		roomType: string;
		priceText: string;
		originalPriceText: string;
		exchangeRate: number;
		hotelDetails?: Array<{
			hotelIndex: number;
			hotelName: string;
			roomType: string;
			periodType: string;
			priceText: string;
			originalPriceText: string;
		}>;
	} | null>(null);

	const formatNumber = (n: number) => n.toLocaleString('ko-KR');
	const parsePriceFromText = (text: string) => {
		if (!text) return { num: 0, currency: '₩' };
		console.log('parsePriceFromText 입력:', text);
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
		
		console.log('parsePriceFromText 통화 추출:', { wonIndex, dollarIndex, currency, currencyIndex });
		
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
		
		console.log('parsePriceFromText 결과:', { num, currency });
		return {
			num: isNaN(num) ? 0 : num,
			currency: currency
		};
	};
	const usdRate = useMemo(() => {
		const raw = exchangeRate?.USDsend_KRW_tts;
		const rawStr = raw !== undefined && raw !== null ? String(raw) : '';
		const num = parseFloat(rawStr.replace(/,/g, ''));
		const result = isNaN(num) ? 0 : num;
		console.log('usdRate 계산:', { raw, rawStr, num, result });
		return result;
	}, [exchangeRate]);
	const convertLandAmount = (value: number, baseCurrency: string) => {
		console.log('convertLandAmount 호출:', { value, baseCurrency, landCurrency, usdRate });
		
		// 최종 판매가는 항상 원화로 표시되므로, 랜드사 수수료가 달러인 경우 무조건 원화로 변환
		if (landCurrency === '$' && usdRate > 0) {
			const result = value * usdRate;
			console.log('환율 적용 (달러->원화):', { value, usdRate, result });
			return result;
		}
		
		// 랜드사 수수료가 원화인 경우 그대로 반환
		console.log('환율 적용 안함 (원화->원화):', value);
		return value;
	};

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


	// 호텔 검색
	const handleHotelSearch = (hotelCost: any) => {
		if (!hotelCost || !hotelCost.costInput) {
			setHotelHighlightedCosts(new Set());
			setHotelFinalSearchResult(null);
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
			if (hotelReserveDate) {
				try {
					const reserveDate = new Date(hotelReserveDate);
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
			if (matches && hotelSearchDateStart && hotelSearchDateEnd) {
				try {
					// inputDefault 안의 period가 선택일자 (실제 숙박 기간)
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					
					if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
						// period 배열에서 날짜 범위 확인
						let hasMatchingPeriod = false;
						const searchStartDate = new Date(hotelSearchDateStart);
						const searchEndDate = new Date(hotelSearchDateEnd);
						
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

			if (matches && (hotelSelectedRoomType || hotelSelectedPeriodType)) {
				try {
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
						const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
							if (hotelSelectedRoomType && rt.roomType !== hotelSelectedRoomType) return false;
							if (hotelSelectedPeriodType) {
								// 박수 선택 시 dayPersonCost가 있으면 필터링 통과
								let hasPeriod = false;
								if (rt.dayPersonCost && rt.dayPersonCost !== '') {
									// 1박~6박 선택 시 dayPersonCost가 있으면 통과
									if (['1박', '2박', '3박', '4박', '5박', '6박'].includes(hotelSelectedPeriodType)) {
										hasPeriod = true;
									}
								}
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
								
								// 선택한 박수 추출 (1박, 2박, 3박, 4박, 5박, 6박)
								let nights = 1; // 기본값
								if (hotelSelectedPeriodType) {
									const nightsMatch = hotelSelectedPeriodType.match(/(\d+)박/);
									if (nightsMatch) {
										nights = parseInt(nightsMatch[1], 10);
									}
								}

								// dayPersonCost가 있으면 선택한 박수에 곱하기
								let priceText = '';
								let originalPriceText = '';
								if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
									const dayPersonCostNum = parseFloat(String(matchingRoom.dayPersonCost).replace(/,/g, ''));
									if (!isNaN(dayPersonCostNum)) {
										const totalCost = dayPersonCostNum * nights;
										priceText = `${nights}박: ${formatPrice(String(totalCost))}`;
										originalPriceText = `${nights}박: ${formatOriginalPrice(String(totalCost))}`;
									}
								} else {
									// dayPersonCost가 없으면 기존 방식 사용
									const parts: string[] = [];
									const originalParts: string[] = [];
									if (matchingRoom.dayStayCost && matchingRoom.dayStayCost !== '') {
										parts.push(`1박: ${formatPrice(matchingRoom.dayStayCost)}`);
										originalParts.push(`1박: ${formatOriginalPrice(matchingRoom.dayStayCost)}`);
									}
									if (matchingRoom.dayStayCostAll && matchingRoom.dayStayCostAll !== '') {
										parts.push(`합계: ${formatPrice(matchingRoom.dayStayCostAll)}`);
										originalParts.push(`합계: ${formatOriginalPrice(matchingRoom.dayStayCostAll)}`);
									}
									if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
										parts.push(`1인: ${formatPrice(matchingRoom.dayPersonCost)}`);
										originalParts.push(`1인: ${formatOriginalPrice(matchingRoom.dayPersonCost)}`);
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

		setHotelHighlightedCosts(highlighted);
		setHotelFinalSearchResult(finalResult);
	};

	// 호텔이 2개 이상일 때 각 호텔별 검색 수행
	const handleCombinedHotelSearch = (hotelSearchData: Array<{ hotelCost: any; selectedRoomType: string; selectedPeriodType: string }>) => {
		if (scheduledHotels.length < 2) return;

		const hotelDetails: Array<{
			hotelIndex: number;
			hotelName: string;
			roomType: string;
			periodType: string;
			priceText: string;
			originalPriceText: string;
		}> = [];

		let totalPrice = 0;
		let totalOriginalPrice = 0;
		let currency = '';
		let exchangeRateValue = 0;

		// 각 호텔별로 검색 수행
		scheduledHotels.forEach((hotel, idx) => {
			const searchData = hotelSearchData.find((data, i) => i === idx);
			if (!searchData || !hotel.hotelCost) return;

			const { hotelCost, selectedRoomType, selectedPeriodType } = searchData;
			if (!hotelCost || !hotelCost.costInput) return;

			// 해당 호텔의 요금 정보 찾기
			hotelCost.costInput.forEach((cost: any) => {
				let matches = true;

				// 예약일자 필터링
				if (hotelReserveDate) {
					try {
						const reserveDate = new Date(hotelReserveDate);
						if (!isNaN(reserveDate.getTime())) {
							const reservePeriod = cost.reservePeriod ? (typeof cost.reservePeriod === 'string' ? JSON.parse(cost.reservePeriod) : cost.reservePeriod) : null;
							
							if (reservePeriod) {
								let matchesReserveDate = false;
								
								if (reservePeriod.start && reservePeriod.end) {
									const periodStart = new Date(reservePeriod.start);
									const periodEnd = new Date(reservePeriod.end);
									
									if (!isNaN(periodStart.getTime()) && !isNaN(periodEnd.getTime())) {
										matchesReserveDate = reserveDate.getTime() >= periodStart.getTime() && reserveDate.getTime() <= periodEnd.getTime();
									}
								} else if (Array.isArray(reservePeriod) && reservePeriod.length >= 2) {
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

				// 선택일자 필터링
				if (matches && hotelSearchDateStart && hotelSearchDateEnd) {
					try {
						const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
						
						if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
							let hasMatchingPeriod = false;
							const searchStartDate = new Date(hotelSearchDateStart);
							const searchEndDate = new Date(hotelSearchDateEnd);
							
							for (const periodItem of inputDefault.period) {
								if (periodItem.start && periodItem.end) {
									const periodStartDate = new Date(periodItem.start);
									const periodEndDate = new Date(periodItem.end);
									
									if (!isNaN(searchStartDate.getTime()) && !isNaN(searchEndDate.getTime()) && 
										!isNaN(periodStartDate.getTime()) && !isNaN(periodEndDate.getTime())) {
										
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

							// 선택한 박수 추출 (1박, 2박, 3박, 4박, 5박, 6박)
							let nights = 1; // 기본값
							if (selectedPeriodType) {
								const nightsMatch = selectedPeriodType.match(/(\d+)박/);
								if (nightsMatch) {
									nights = parseInt(nightsMatch[1], 10);
								}
							}

							let priceText = '';
							let originalPriceText = '';
							let priceNum = 0;
							let originalPriceNum = 0;

							if (matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
								const dayPersonCostNum = parseFloat(String(matchingRoom.dayPersonCost).replace(/,/g, ''));
								if (!isNaN(dayPersonCostNum)) {
									const totalCost = dayPersonCostNum * nights;
									priceText = `${nights}박: ${formatPrice(String(totalCost))}`;
									originalPriceText = `${nights}박: ${formatOriginalPrice(String(totalCost))}`;
									priceNum = totalCost * (isUSD && exchangeRateValue > 0 ? exchangeRateValue : 1);
									originalPriceNum = totalCost;
								}
							}

							if (priceText) {
								hotelDetails.push({
									hotelIndex: hotel.index,
									hotelName: hotel.hotelCost?.hotel?.hotelNameKo || `호텔 ${hotel.index}`,
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

		// 첫 번째 호텔의 정보를 기본으로 사용
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

			setHotelFinalSearchResult({
				reserveType: firstCost.reserveType === 'earlyPeriod' ? '얼리버드' : firstCost.reserveType === 'default' ? '기본' : firstCost.reserveType || '-',
				reservePeriod: formatReservePeriod(firstCost.reservePeriod),
				roomType: hotelDetails.map(d => d.roomType).join(', ') || '-',
				priceText: totalPriceText,
				originalPriceText: totalOriginalPriceText,
				exchangeRate: exchangeRateValue,
				hotelDetails: hotelDetails
			});
		}
	};

	// 검색 결과가 변경될 때마다 부모 컴포넌트에 가격 업데이트
	useEffect(() => {
		if (hotelFinalSearchResult && onPriceUpdate) {
			const { num: priceNum } = parsePriceFromText(hotelFinalSearchResult.priceText || '');
			if (priceNum > 0) {
				// 판매가 계산 (랜드사 수수료/할인 포함)
				const { currency } = parsePriceFromText(hotelFinalSearchResult.priceText || '');
				const commissionAdj = convertLandAmount(landCommissionTotal, currency);
				const defaultAdj = convertLandAmount(landDiscountDefaultTotal, currency);
				const specialAdj = convertLandAmount(landDiscountSpecialTotal, currency);
				const saleNum = Math.max(0, priceNum + commissionAdj - defaultAdj - specialAdj);
				onPriceUpdate(saleNum);
			}
		}
	}, [hotelFinalSearchResult, onPriceUpdate, landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency, usdRate]);

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
				<h3 style={{
					margin: 0,
					fontSize: '18px',
					fontWeight: 'bold',
					color: '#333'
				}}>
					2단계: 호텔 요금 정보
				</h3>
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
							<HotelCostList_PerDay
								hotelCost={hotelCost}
								title={hotelSort || `호텔${idx + 1}`}
								highlightedCosts={hotelHighlightedCosts}
								isPoolVilla={hotelSort === '풀빌라'}
							/>
						</div>
					))}
					
					{/* 검색 영역 - 하나만 표시 */}
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
										date={hotelReserveDate ? new Date(hotelReserveDate) : new Date(today)}
										setSelectDate={(dateStr: string) => {
											if (dateStr) {
												setHotelReserveDate(dateStr);
											}
										}}
									/>

									<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>선택일자</span>
									<DateBoxDouble
										dateStart={hotelSearchDateStart ? new Date(hotelSearchDateStart) : null}
										dateEnd={hotelSearchDateEnd ? new Date(hotelSearchDateEnd) : null}
										setSelectStartDate={setHotelSearchDateStart}
										setSelectEndDate={setHotelSearchDateEnd}
									/>
								</div>

								{/* 호텔이 1개인 경우: 기존 방식 */}
								{scheduledHotels.length <= 1 && (
									<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
										<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
										<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
											{extractRoomTypes(scheduledHotels[0].hotelCost.costInput).map((rt) => (
												<button
													key={rt}
													onClick={() => setHotelSelectedRoomType(hotelSelectedRoomType === rt ? '' : rt)}
													style={{
														padding: '6px 12px',
														borderRadius: '4px',
														border: `1px solid ${hotelSelectedRoomType === rt ? '#5fb7ef' : '#ddd'}`,
														backgroundColor: hotelSelectedRoomType === rt ? '#5fb7ef' : '#fff',
														color: hotelSelectedRoomType === rt ? '#fff' : '#333',
														cursor: 'pointer',
														fontSize: '16px',
														fontWeight: hotelSelectedRoomType === rt ? '600' : '400'
													}}
												>
													{rt}
												</button>
											))}
										</div>

										<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>기간타입</span>
										<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
											{['1박', '2박', '3박', '4박', '5박', '6박'].map((pt) => (
												<button
													key={pt}
													onClick={() => setHotelSelectedPeriodType(hotelSelectedPeriodType === pt ? '' : pt)}
													style={{
														padding: '6px 12px',
														borderRadius: '4px',
														border: `1px solid ${hotelSelectedPeriodType === pt ? '#5fb7ef' : '#ddd'}`,
														backgroundColor: hotelSelectedPeriodType === pt ? '#5fb7ef' : '#fff',
														color: hotelSelectedPeriodType === pt ? '#fff' : '#333',
														cursor: 'pointer',
														fontSize: '16px',
														fontWeight: hotelSelectedPeriodType === pt ? '600' : '400'
													}}
												>
													{pt}
												</button>
											))}
										</div>

										<button
											onClick={() => handleHotelSearch(scheduledHotels[0].hotelCost)}
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

								{/* 호텔이 2개 이상인 경우: 각 호텔별 룸타입/기간타입 선택 */}
								{scheduledHotels.length > 1 && (
									<div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
										{scheduledHotels.map(({ hotelSort, hotelCost, index }) => {
											const hotelIndex = index; // getHotelsBySchedule에서 1부터 시작
											const selectedRoom = hotelSelectedRoomTypeByIndex[hotelIndex] || '';
											const selectedPeriod = hotelSelectedPeriodTypeByIndex[hotelIndex] || '';
											return (
												<div key={hotelIndex} style={{borderTop: '1px solid #eee', paddingTop: '8px'}}>
													<div style={{marginBottom: '4px', fontWeight: 600, color: '#666'}}>
														{hotelSort || `호텔`} {hotelIndex}
													</div>
													<div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
														<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
														<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
															{extractRoomTypes(hotelCost.costInput).map((rt: string) => (
																<button
																	key={rt}
																	onClick={() =>
																		setHotelSelectedRoomTypeByIndex(prev => ({
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
															{['1박', '2박', '3박', '4박', '5박', '6박'].map((pt) => (
																<button
																	key={pt}
																	onClick={() =>
																		setHotelSelectedPeriodTypeByIndex(prev => ({
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
										
										{/* 호텔 2개 이상인 경우: 맨 하단에 검색 버튼 하나만 */}
										<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '12px'}}>
											<button
												onClick={() => {
													// 각 호텔별 검색 데이터 수집
													const hotelSearchData = scheduledHotels.map(({ hotelCost, index }) => ({
														hotelCost,
														selectedRoomType: hotelSelectedRoomTypeByIndex[index] || '',
														selectedPeriodType: hotelSelectedPeriodTypeByIndex[index] || ''
													}));
													handleCombinedHotelSearch(hotelSearchData);
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

							{hotelFinalSearchResult && (
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
										<span style={{fontWeight: 500}}>{hotelFinalSearchResult.reserveType}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>예약기간:</span>
										<span style={{fontWeight: 500}}>{hotelFinalSearchResult.reservePeriod}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>룸타입:</span>
										<span style={{fontWeight: 500}}>{hotelFinalSearchResult.roomType}</span>
									</div>
									
									{/* 각 호텔별 상세 정보 */}
									{hotelFinalSearchResult.hotelDetails && hotelFinalSearchResult.hotelDetails.length > 0 && (
										<div style={{
											marginTop: '16px',
											padding: '12px',
											backgroundColor: '#fff',
											borderRadius: '4px',
											border: '1px solid #ddd'
										}}>
											<div style={{fontWeight: 600, color: '#333', marginBottom: '12px', fontSize: '17px'}}>
												각 호텔별 요금 정보
											</div>
											{hotelFinalSearchResult.hotelDetails.map((detail, idx) => (
												<div key={idx} style={{
													marginBottom: idx < hotelFinalSearchResult.hotelDetails!.length - 1 ? '12px' : '0',
													paddingBottom: idx < hotelFinalSearchResult.hotelDetails!.length - 1 ? '12px' : '0',
													borderBottom: idx < hotelFinalSearchResult.hotelDetails!.length - 1 ? '1px solid #eee' : 'none'
												}}>
													<div style={{fontWeight: 600, color: '#5fb7ef', marginBottom: '6px'}}>
														{detail.hotelName} (호텔 {detail.hotelIndex})
													</div>
													<div style={{marginLeft: '12px', fontSize: '15px'}}>
														<div style={{marginBottom: '4px'}}>
															<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>룸타입:</span>
															<span style={{fontWeight: 500}}>{detail.roomType}</span>
														</div>
														<div style={{marginBottom: '4px'}}>
															<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>기간타입:</span>
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
										<span style={{fontWeight: 500}}>{hotelFinalSearchResult.originalPriceText || '-'}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>환율정보:</span>
										<span style={{fontWeight: 500}}>1 USD = {hotelFinalSearchResult.exchangeRate?.toLocaleString('ko-KR') || '-'} KRW</span>
									</div>
									<div>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>합산 요금:</span>
										<span style={{fontWeight: 500, fontSize: '17px', color: '#5fb7ef'}}>{hotelFinalSearchResult.priceText}</span>
									</div>
									{(() => {
										const { num: baseNum, currency } = parsePriceFromText(hotelFinalSearchResult.priceText || '');
										if (!baseNum) return null;
										
										// 디버깅용 콘솔 로그
										console.log('=== 판매가 계산 (박당) ===');
										console.log('priceText:', hotelFinalSearchResult.priceText);
										console.log('baseNum:', baseNum);
										console.log('currency:', currency);
										console.log('landCommissionTotal:', landCommissionTotal);
										console.log('landDiscountDefaultTotal:', landDiscountDefaultTotal);
										console.log('landDiscountSpecialTotal:', landDiscountSpecialTotal);
										console.log('landCurrency:', landCurrency);
										console.log('usdRate:', usdRate);
										
										const commissionAdj = convertLandAmount(landCommissionTotal, currency);
										const defaultAdj = convertLandAmount(landDiscountDefaultTotal, currency);
										const specialAdj = convertLandAmount(landDiscountSpecialTotal, currency);
										
										console.log('commissionAdj:', commissionAdj);
										console.log('defaultAdj:', defaultAdj);
										console.log('specialAdj:', specialAdj);
										
										const saleNum = Math.max(
											0,
											baseNum + commissionAdj - defaultAdj - specialAdj
										);
										
										console.log('saleNum:', saleNum);
										console.log('==================');
										
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


