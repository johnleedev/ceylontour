import React, { useState, useEffect } from 'react';
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
	hotelHotelCost: any | null;
	resortHotelCost: any | null;
	poolVillaHotelCost: any | null;
	isLoadingCost: boolean;
	priceModalData: PriceModalDataProps | null;
	onBack: () => void;
	today: string;
}

export default function HotelPriceInfo_PerDay({
	hotelHotelCost,
	resortHotelCost,
	poolVillaHotelCost,
	isLoadingCost,
	priceModalData,
	onBack,
	today
}: HotelPriceInfo_PerDayProps) {
	// 환율 정보 가져오기
	const exchangeRate = useRecoilValue(recoilExchangeRate);
	// Recoil에서 여행기간 가져오기
	const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
	
	// 호텔 또는 리조트 중 하나 선택 (리조트 우선, 없으면 호텔)
	const preStayHotelCost = resortHotelCost || hotelHotelCost;
	// 풀빌라 호텔 요금
	const poolVilla1HotelCost = poolVillaHotelCost;
	
	// 선투숙 검색 관련 상태
	const [preStayReserveDate, setPreStayReserveDate] = useState<string>(today);
	const [preStaySearchDateStart, setPreStaySearchDateStart] = useState<string>('');
	const [preStaySearchDateEnd, setPreStaySearchDateEnd] = useState<string>('');
	const [preStaySelectedRoomType, setPreStaySelectedRoomType] = useState<string>('');
	const [preStaySelectedPeriodType, setPreStaySelectedPeriodType] = useState<string>('');
	const [preStayHighlightedCosts, setPreStayHighlightedCosts] = useState<Set<number>>(new Set());
	const [preStayFinalSearchResult, setPreStayFinalSearchResult] = useState<{
		reserveType: string;
		reservePeriod: string;
		roomType: string;
		priceText: string;
		originalPriceText: string;
		exchangeRate: number;
	} | null>(null);

	// 풀빌라1 검색 관련 상태
	const [poolVilla1ReserveDate, setPoolVilla1ReserveDate] = useState<string>(today);
	const [poolVilla1SearchDateStart, setPoolVilla1SearchDateStart] = useState<string>('');
	const [poolVilla1SearchDateEnd, setPoolVilla1SearchDateEnd] = useState<string>('');
	const [poolVilla1SelectedRoomType, setPoolVilla1SelectedRoomType] = useState<string>('');
	const [poolVilla1SelectedPeriodType, setPoolVilla1SelectedPeriodType] = useState<string>('');
	const [poolVilla1HighlightedCosts, setPoolVilla1HighlightedCosts] = useState<Set<number>>(new Set());
	const [poolVilla1FinalSearchResult, setPoolVilla1FinalSearchResult] = useState<{
		reserveType: string;
		reservePeriod: string;
		roomType: string;
		priceText: string;
		originalPriceText: string;
		exchangeRate: number;
	} | null>(null);

	// travelPeriod를 파싱하여 날짜 범위 설정
	useEffect(() => {
		if (customerInfo.travelPeriod) {
			const travelPeriod = customerInfo.travelPeriod.trim();
			
			// "YYYY-MM-DD ~ YYYY-MM-DD" 형식인 경우
			if (travelPeriod.includes('~')) {
				const parts = travelPeriod.split('~').map(part => part.trim());
				if (parts.length === 2) {
					const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
					if (dateRegex.test(parts[0]) && dateRegex.test(parts[1])) {
						setPreStaySearchDateStart(parts[0]);
						setPreStaySearchDateEnd(parts[1]);
						setPoolVilla1SearchDateStart(parts[0]);
						setPoolVilla1SearchDateEnd(parts[1]);
					}
				}
			} else {
				// 단일 날짜인 경우
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (dateRegex.test(travelPeriod)) {
					setPreStaySearchDateStart(travelPeriod);
					setPreStaySearchDateEnd(travelPeriod);
					setPoolVilla1SearchDateStart(travelPeriod);
					setPoolVilla1SearchDateEnd(travelPeriod);
				}
			}
		}
	}, [customerInfo.travelPeriod]);

	// 예약일자 초기값을 Recoil에서 가져오기
	useEffect(() => {
		if (customerInfo.reserveDate) {
			setPreStayReserveDate(customerInfo.reserveDate);
			setPoolVilla1ReserveDate(customerInfo.reserveDate);
		}
	}, [customerInfo.reserveDate]);

	// productScheduleData에서 필요한 호텔 타입 추출
	const getRequiredHotelTypes = () => {
		if (!priceModalData?.productScheduleData) return [];
		
		try {
			const scheduleData = JSON.parse(priceModalData.productScheduleData);
			if (!Array.isArray(scheduleData) || scheduleData.length === 0) return [];
			
			const hotelTypes = new Set<string>();
			for (const item of scheduleData) {
				if (item.hotelSort && typeof item.hotelSort === 'string') {
					hotelTypes.add(item.hotelSort);
				}
			}
			
			return Array.from(hotelTypes);
		} catch (e) {
			return [];
		}
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

	// 선투숙 검색
	const handlePreStaySearch = () => {
		if (!preStayHotelCost || !preStayHotelCost.costInput) {
			setPreStayHighlightedCosts(new Set());
			setPreStayFinalSearchResult(null);
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

		preStayHotelCost.costInput.forEach((cost: any, idx: number) => {
			let matches = true;

			if (preStaySearchDateStart && preStaySearchDateEnd) {
				try {
					// inputDefault 안의 period가 선택일자 (실제 숙박 기간)
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					
					if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
						// period 배열에서 날짜 범위 확인
						let hasMatchingPeriod = false;
						const searchStartDate = new Date(preStaySearchDateStart);
						const searchEndDate = new Date(preStaySearchDateEnd);
						
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

			if (matches && (preStaySelectedRoomType || preStaySelectedPeriodType)) {
				try {
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
						const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
							if (preStaySelectedRoomType && rt.roomType !== preStaySelectedRoomType) return false;
							if (preStaySelectedPeriodType) {
								// 박당 요금 구조에 맞게 필터링 (dayStayCost가 있으면 1박 선택 가능)
								let hasPeriod = false;
								if (preStaySelectedPeriodType === '1박' && rt.dayStayCost && rt.dayStayCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '합계' && rt.dayStayCostAll && rt.dayStayCostAll !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '1인' && rt.dayPersonCost && rt.dayPersonCost !== '') hasPeriod = true;
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
								if (preStaySelectedPeriodType === '1박' && matchingRoom.dayStayCost && matchingRoom.dayStayCost !== '') {
									priceText = `1박: ${formatPrice(matchingRoom.dayStayCost)}`;
									originalPriceText = `1박: ${formatOriginalPrice(matchingRoom.dayStayCost)}`;
								} else if (preStaySelectedPeriodType === '합계' && matchingRoom.dayStayCostAll && matchingRoom.dayStayCostAll !== '') {
									priceText = `합계: ${formatPrice(matchingRoom.dayStayCostAll)}`;
									originalPriceText = `합계: ${formatOriginalPrice(matchingRoom.dayStayCostAll)}`;
								} else if (preStaySelectedPeriodType === '1인' && matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
									priceText = `1인: ${formatPrice(matchingRoom.dayPersonCost)}`;
									originalPriceText = `1인: ${formatOriginalPrice(matchingRoom.dayPersonCost)}`;
								} else {
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

		setPreStayHighlightedCosts(highlighted);
		setPreStayFinalSearchResult(finalResult);
	};

	// 풀빌라 검색
	const handlePoolVilla1Search = () => {
		if (!poolVilla1HotelCost || !poolVilla1HotelCost.costInput) {
			setPoolVilla1HighlightedCosts(new Set());
			setPoolVilla1FinalSearchResult(null);
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

		poolVilla1HotelCost.costInput.forEach((cost: any, idx: number) => {
			let matches = true;

			if (poolVilla1SearchDateStart && poolVilla1SearchDateEnd) {
				try {
					// inputDefault 안의 period가 선택일자 (실제 숙박 기간)
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					
					if (inputDefault && inputDefault.period && Array.isArray(inputDefault.period) && inputDefault.period.length > 0) {
						// period 배열에서 날짜 범위 확인
						let hasMatchingPeriod = false;
						const searchStartDate = new Date(poolVilla1SearchDateStart);
						const searchEndDate = new Date(poolVilla1SearchDateEnd);
						
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

			if (matches && (poolVilla1SelectedRoomType || poolVilla1SelectedPeriodType)) {
				try {
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
						const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
							if (poolVilla1SelectedRoomType && rt.roomType !== poolVilla1SelectedRoomType) return false;
							if (poolVilla1SelectedPeriodType) {
								// 박당 요금 구조에 맞게 필터링 (dayStayCost가 있으면 1박 선택 가능)
								let hasPeriod = false;
								if (poolVilla1SelectedPeriodType === '1박' && rt.dayStayCost && rt.dayStayCost !== '') hasPeriod = true;
								if (poolVilla1SelectedPeriodType === '합계' && rt.dayStayCostAll && rt.dayStayCostAll !== '') hasPeriod = true;
								if (poolVilla1SelectedPeriodType === '1인' && rt.dayPersonCost && rt.dayPersonCost !== '') hasPeriod = true;
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
								if (poolVilla1SelectedPeriodType === '1박' && matchingRoom.dayStayCost && matchingRoom.dayStayCost !== '') {
									priceText = `1박: ${formatPrice(matchingRoom.dayStayCost)}`;
									originalPriceText = `1박: ${formatOriginalPrice(matchingRoom.dayStayCost)}`;
								} else if (poolVilla1SelectedPeriodType === '합계' && matchingRoom.dayStayCostAll && matchingRoom.dayStayCostAll !== '') {
									priceText = `합계: ${formatPrice(matchingRoom.dayStayCostAll)}`;
									originalPriceText = `합계: ${formatOriginalPrice(matchingRoom.dayStayCostAll)}`;
								} else if (poolVilla1SelectedPeriodType === '1인' && matchingRoom.dayPersonCost && matchingRoom.dayPersonCost !== '') {
									priceText = `1인: ${formatPrice(matchingRoom.dayPersonCost)}`;
									originalPriceText = `1인: ${formatOriginalPrice(matchingRoom.dayPersonCost)}`;
								} else {
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

		setPoolVilla1HighlightedCosts(highlighted);
		setPoolVilla1FinalSearchResult(finalResult);
	};

	
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
					{/* 선투숙 호텔 요금 */}
					{preStayHotelCost && (
						<HotelCostList_PerDay
							hotelCost={preStayHotelCost}
							title={(() => {
								const types = getRequiredHotelTypes();
								const hotelType = types.find(t => t === '호텔' || t === '리조트');
								return hotelType || '호텔';
							})()}
							highlightedCosts={preStayHighlightedCosts}
							isPoolVilla={false}
						/>
					)}
					
					{/* 검색 영역 - 선투숙 호텔 */}
					{preStayHotelCost && (
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
								gap: '12px',
								flexWrap: 'wrap',
								alignItems: 'center'
							}}>
								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>예약일자</span>
								<DateBoxSingle
									date={preStayReserveDate ? new Date(preStayReserveDate) : new Date(today)}
									setSelectDate={(dateStr: string) => {
										if (dateStr) {
											setPreStayReserveDate(dateStr);
										}
									}}
								/>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>선택일자</span>
								<DateBoxDouble
									dateStart={preStaySearchDateStart ? new Date(preStaySearchDateStart) : null}
									dateEnd={preStaySearchDateEnd ? new Date(preStaySearchDateEnd) : null}
									setSelectStartDate={setPreStaySearchDateStart}
									setSelectEndDate={setPreStaySearchDateEnd}
								/>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
								<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
									{extractRoomTypes(preStayHotelCost.costInput).map((rt) => (
										<button
											key={rt}
											onClick={() => setPreStaySelectedRoomType(preStaySelectedRoomType === rt ? '' : rt)}
											style={{
												padding: '6px 12px',
												borderRadius: '4px',
												border: `1px solid ${preStaySelectedRoomType === rt ? '#5fb7ef' : '#ddd'}`,
												backgroundColor: preStaySelectedRoomType === rt ? '#5fb7ef' : '#fff',
												color: preStaySelectedRoomType === rt ? '#fff' : '#333',
												cursor: 'pointer',
												fontSize: '16px',
												fontWeight: preStaySelectedRoomType === rt ? '600' : '400'
											}}
										>
											{rt}
										</button>
									))}
								</div>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>기간타입</span>
								<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
									{['1박', '합계', '1인'].map((pt) => (
										<button
											key={pt}
											onClick={() => setPreStaySelectedPeriodType(preStaySelectedPeriodType === pt ? '' : pt)}
											style={{
												padding: '6px 12px',
												borderRadius: '4px',
												border: `1px solid ${preStaySelectedPeriodType === pt ? '#5fb7ef' : '#ddd'}`,
												backgroundColor: preStaySelectedPeriodType === pt ? '#5fb7ef' : '#fff',
												color: preStaySelectedPeriodType === pt ? '#fff' : '#333',
												cursor: 'pointer',
												fontSize: '16px',
												fontWeight: preStaySelectedPeriodType === pt ? '600' : '400'
											}}
										>
											{pt}
										</button>
									))}
								</div>

								<button
									onClick={handlePreStaySearch}
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

							{preStayFinalSearchResult && (
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
										<span style={{fontWeight: 500}}>{preStayFinalSearchResult.reserveType}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>예약기간:</span>
										<span style={{fontWeight: 500}}>{preStayFinalSearchResult.reservePeriod}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>룸타입:</span>
										<span style={{fontWeight: 500}}>{preStayFinalSearchResult.roomType}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>원래요금(달러):</span>
										<span style={{fontWeight: 500}}>{preStayFinalSearchResult.originalPriceText || '-'}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>환율정보:</span>
										<span style={{fontWeight: 500}}>1 USD = {preStayFinalSearchResult.exchangeRate?.toLocaleString('ko-KR') || '-'} KRW</span>
									</div>
									<div>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>요금:</span>
										<span style={{fontWeight: 500}}>{preStayFinalSearchResult.priceText}</span>
									</div>
								</div>
							)}
						</div>
					)}
					
					{/* 풀빌라 호텔 요금 */}
					{poolVilla1HotelCost && (
						<HotelCostList_PerDay
							hotelCost={poolVilla1HotelCost}
							title="풀빌라"
							highlightedCosts={poolVilla1HighlightedCosts}
							isPoolVilla={true}
						/>
					)}
					
					{/* 검색 영역 - 풀빌라 */}
					{poolVilla1HotelCost && (
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
								gap: '12px',
								flexWrap: 'wrap',
								alignItems: 'center'
							}}>
								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>예약일자</span>
								<DateBoxSingle
									date={poolVilla1ReserveDate ? new Date(poolVilla1ReserveDate) : new Date(today)}
									setSelectDate={(dateStr: string) => {
										if (dateStr) {
											setPoolVilla1ReserveDate(dateStr);
										}
									}}
								/>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>선택일자</span>
								<DateBoxDouble
									dateStart={poolVilla1SearchDateStart ? new Date(poolVilla1SearchDateStart) : null}
									dateEnd={poolVilla1SearchDateEnd ? new Date(poolVilla1SearchDateEnd) : null}
									setSelectStartDate={setPoolVilla1SearchDateStart}
									setSelectEndDate={setPoolVilla1SearchDateEnd}
								/>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
								<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
									{extractRoomTypes(poolVilla1HotelCost.costInput).map((rt) => (
										<button
											key={rt}
											onClick={() => setPoolVilla1SelectedRoomType(poolVilla1SelectedRoomType === rt ? '' : rt)}
											style={{
												padding: '6px 12px',
												borderRadius: '4px',
												border: `1px solid ${poolVilla1SelectedRoomType === rt ? '#5fb7ef' : '#ddd'}`,
												backgroundColor: poolVilla1SelectedRoomType === rt ? '#5fb7ef' : '#fff',
												color: poolVilla1SelectedRoomType === rt ? '#fff' : '#333',
												cursor: 'pointer',
												fontSize: '16px',
												fontWeight: poolVilla1SelectedRoomType === rt ? '600' : '400'
											}}
										>
											{rt}
										</button>
									))}
								</div>

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>기간타입</span>
								<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
									{['1박', '합계', '1인'].map((pt) => (
										<button
											key={pt}
											onClick={() => setPoolVilla1SelectedPeriodType(poolVilla1SelectedPeriodType === pt ? '' : pt)}
											style={{
												padding: '6px 12px',
												borderRadius: '4px',
												border: `1px solid ${poolVilla1SelectedPeriodType === pt ? '#5fb7ef' : '#ddd'}`,
												backgroundColor: poolVilla1SelectedPeriodType === pt ? '#5fb7ef' : '#fff',
												color: poolVilla1SelectedPeriodType === pt ? '#fff' : '#333',
												cursor: 'pointer',
												fontSize: '16px',
												fontWeight: poolVilla1SelectedPeriodType === pt ? '600' : '400'
											}}
										>
											{pt}
										</button>
									))}
								</div>

								<button
									onClick={handlePoolVilla1Search}
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

							{poolVilla1FinalSearchResult && (
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
										<span style={{fontWeight: 500}}>{poolVilla1FinalSearchResult.reserveType}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>예약기간:</span>
										<span style={{fontWeight: 500}}>{poolVilla1FinalSearchResult.reservePeriod}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>룸타입:</span>
										<span style={{fontWeight: 500}}>{poolVilla1FinalSearchResult.roomType}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>원래요금(달러):</span>
										<span style={{fontWeight: 500}}>{poolVilla1FinalSearchResult.originalPriceText || '-'}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>환율정보:</span>
										<span style={{fontWeight: 500}}>1 USD = {poolVilla1FinalSearchResult.exchangeRate?.toLocaleString('ko-KR') || '-'} KRW</span>
									</div>
									<div>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>요금:</span>
										<span style={{fontWeight: 500}}>{poolVilla1FinalSearchResult.priceText}</span>
									</div>
								</div>
							)}
						</div>
					)}
					
					{!preStayHotelCost && !poolVilla1HotelCost && (
						<div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
							요금 정보가 없습니다.
						</div>
					)}
				</div>
			)}
		</div>
	);
}