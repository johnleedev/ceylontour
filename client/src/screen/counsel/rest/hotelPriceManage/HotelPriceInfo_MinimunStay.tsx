import React, { useState, useEffect } from 'react';
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
	hotelHotelCost: any | null;
	resortHotelCost: any | null;
	poolVillaHotelCost: any | null;
	isLoadingCost: boolean;
	priceModalData: PriceModalDataProps | null;
	onBack: () => void;
	today: string;
}

export default function HotelPriceInfo_MinimunStay({
	hotelHotelCost,
	resortHotelCost,
	poolVillaHotelCost,
	isLoadingCost,
	priceModalData,
	onBack,
	today
}: HotelPriceInfo_MinimunStayProps) {
	// 환율 정보 가져오기
	const exchangeRate = useRecoilValue(recoilExchangeRate);
	// Recoil에서 여행기간 가져오기
	const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
	
	// 호텔 또는 리조트 중 하나 선택 (리조트 우선, 없으면 호텔)
	const preStayHotelCost = resortHotelCost || hotelHotelCost;
	// 미니멈스테이 호텔 요금
	const minimumStayHotelCost = poolVillaHotelCost;
	
	
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

	// 미니멈스테이 검색 관련 상태
	const [minimumStayReserveDate, setMinimumStayReserveDate] = useState<string>(today);
	const [minimumStaySearchDateStart, setMinimumStaySearchDateStart] = useState<string>('');
	const [minimumStaySearchDateEnd, setMinimumStaySearchDateEnd] = useState<string>('');
	const [minimumStaySelectedRoomType, setMinimumStaySelectedRoomType] = useState<string>('');
	const [minimumStaySelectedPeriodType, setMinimumStaySelectedPeriodType] = useState<string>('');
	const [minimumStayHighlightedCosts, setMinimumStayHighlightedCosts] = useState<Set<number>>(new Set());
	const [minimumStayFinalSearchResult, setMinimumStayFinalSearchResult] = useState<{
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
						setMinimumStaySearchDateStart(parts[0]);
						setMinimumStaySearchDateEnd(parts[1]);
					}
				}
			} else {
				// 단일 날짜인 경우
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (dateRegex.test(travelPeriod)) {
					setPreStaySearchDateStart(travelPeriod);
					setPreStaySearchDateEnd(travelPeriod);
					setMinimumStaySearchDateStart(travelPeriod);
					setMinimumStaySearchDateEnd(travelPeriod);
				}
			}
		}
	}, [customerInfo.travelPeriod]);

	// 예약일자 초기값을 Recoil에서 가져오기
	useEffect(() => {
		if (customerInfo.reserveDate) {
			setPreStayReserveDate(customerInfo.reserveDate);
			setMinimumStayReserveDate(customerInfo.reserveDate);
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

			// 날짜 검색 조건 확인
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

			// 룸타입 또는 기간타입이 선택된 경우만 검색 결과 생성
			if (matches && (preStaySelectedRoomType || preStaySelectedPeriodType)) {
				try {
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
						const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
							// 룸타입 필터링
							if (preStaySelectedRoomType && rt.roomType !== preStaySelectedRoomType) {
								return false;
							}
							
							// 기간타입 필터링
							if (preStaySelectedPeriodType) {
								let hasPeriod = false;
								if (preStaySelectedPeriodType === '1박' && rt.oneNightCost && rt.oneNightCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '2박' && rt.twoNightCost && rt.twoNightCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '3박' && rt.threeNightCost && rt.threeNightCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '4박' && rt.fourNightCost && rt.fourNightCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '5박' && rt.fiveNightCost && rt.fiveNightCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '6박' && rt.sixNightCost && rt.sixNightCost !== '') hasPeriod = true;
								if (preStaySelectedPeriodType === '1박추가' && rt.oneNightAdd && rt.oneNightAdd !== '') hasPeriod = true;
								
								if (!hasPeriod) {
									return false;
								}
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
								if (preStaySelectedPeriodType) {
									// 선택된 기간 타입에 해당하는 요금 표시
									if (preStaySelectedPeriodType === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
										priceText = `1박: ${formatPrice(matchingRoom.oneNightCost)}`;
										originalPriceText = `1박: ${formatOriginalPrice(matchingRoom.oneNightCost)}`;
									} else if (preStaySelectedPeriodType === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
										priceText = `2박: ${formatPrice(matchingRoom.twoNightCost)}`;
										originalPriceText = `2박: ${formatOriginalPrice(matchingRoom.twoNightCost)}`;
									} else if (preStaySelectedPeriodType === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
										priceText = `3박: ${formatPrice(matchingRoom.threeNightCost)}`;
										originalPriceText = `3박: ${formatOriginalPrice(matchingRoom.threeNightCost)}`;
									} else if (preStaySelectedPeriodType === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
										priceText = `4박: ${formatPrice(matchingRoom.fourNightCost)}`;
										originalPriceText = `4박: ${formatOriginalPrice(matchingRoom.fourNightCost)}`;
									} else if (preStaySelectedPeriodType === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
										priceText = `5박: ${formatPrice(matchingRoom.fiveNightCost)}`;
										originalPriceText = `5박: ${formatOriginalPrice(matchingRoom.fiveNightCost)}`;
									} else if (preStaySelectedPeriodType === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
										priceText = `6박: ${formatPrice(matchingRoom.sixNightCost)}`;
										originalPriceText = `6박: ${formatOriginalPrice(matchingRoom.sixNightCost)}`;
									} else if (preStaySelectedPeriodType === '1박추가' && matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
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
			} else {
				if (matches) {
					// 날짜 조건만 맞는 경우 하이라이트만
					highlighted.add(idx);
				}
			}
		});

		setPreStayHighlightedCosts(highlighted);
		setPreStayFinalSearchResult(finalResult);
	};

	// 미니멈스테이 검색
	const handleMinimumStaySearch = () => {
		if (!minimumStayHotelCost || !minimumStayHotelCost.costInput) {
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

		minimumStayHotelCost.costInput.forEach((cost: any, idx: number) => {
			let matches = true;

			if (minimumStaySearchDateStart && minimumStaySearchDateEnd) {
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

			if (matches && (minimumStaySelectedRoomType || minimumStaySelectedPeriodType)) {
				try {
					const inputDefault = cost.inputDefault ? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault) : null;
					if (inputDefault && inputDefault.costByRoomType && Array.isArray(inputDefault.costByRoomType)) {
						const matchingRoom = inputDefault.costByRoomType.find((rt: any) => {
							// 룸타입 필터링
							if (minimumStaySelectedRoomType && rt.roomType !== minimumStaySelectedRoomType) {
								return false;
							}
							// 기간타입 필터링
							if (minimumStaySelectedPeriodType) {
								let hasPeriod = false;
								if (minimumStaySelectedPeriodType === '1박' && rt.oneNightCost && rt.oneNightCost !== '') hasPeriod = true;
								if (minimumStaySelectedPeriodType === '2박' && rt.twoNightCost && rt.twoNightCost !== '') hasPeriod = true;
								if (minimumStaySelectedPeriodType === '3박' && rt.threeNightCost && rt.threeNightCost !== '') hasPeriod = true;
								if (minimumStaySelectedPeriodType === '4박' && rt.fourNightCost && rt.fourNightCost !== '') hasPeriod = true;
								if (minimumStaySelectedPeriodType === '5박' && rt.fiveNightCost && rt.fiveNightCost !== '') hasPeriod = true;
								if (minimumStaySelectedPeriodType === '6박' && rt.sixNightCost && rt.sixNightCost !== '') hasPeriod = true;
								if (minimumStaySelectedPeriodType === '1박추가' && rt.oneNightAdd && rt.oneNightAdd !== '') hasPeriod = true;
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
								if (minimumStaySelectedPeriodType) {
									// 선택된 기간 타입에 해당하는 요금 표시
									if (minimumStaySelectedPeriodType === '1박' && matchingRoom.oneNightCost && matchingRoom.oneNightCost !== '') {
										priceText = `1박: ${formatPrice(matchingRoom.oneNightCost)}`;
										originalPriceText = `1박: ${formatOriginalPrice(matchingRoom.oneNightCost)}`;
									} else if (minimumStaySelectedPeriodType === '2박' && matchingRoom.twoNightCost && matchingRoom.twoNightCost !== '') {
										priceText = `2박: ${formatPrice(matchingRoom.twoNightCost)}`;
										originalPriceText = `2박: ${formatOriginalPrice(matchingRoom.twoNightCost)}`;
									} else if (minimumStaySelectedPeriodType === '3박' && matchingRoom.threeNightCost && matchingRoom.threeNightCost !== '') {
										priceText = `3박: ${formatPrice(matchingRoom.threeNightCost)}`;
										originalPriceText = `3박: ${formatOriginalPrice(matchingRoom.threeNightCost)}`;
									} else if (minimumStaySelectedPeriodType === '4박' && matchingRoom.fourNightCost && matchingRoom.fourNightCost !== '') {
										priceText = `4박: ${formatPrice(matchingRoom.fourNightCost)}`;
										originalPriceText = `4박: ${formatOriginalPrice(matchingRoom.fourNightCost)}`;
									} else if (minimumStaySelectedPeriodType === '5박' && matchingRoom.fiveNightCost && matchingRoom.fiveNightCost !== '') {
										priceText = `5박: ${formatPrice(matchingRoom.fiveNightCost)}`;
										originalPriceText = `5박: ${formatOriginalPrice(matchingRoom.fiveNightCost)}`;
									} else if (minimumStaySelectedPeriodType === '6박' && matchingRoom.sixNightCost && matchingRoom.sixNightCost !== '') {
										priceText = `6박: ${formatPrice(matchingRoom.sixNightCost)}`;
										originalPriceText = `6박: ${formatOriginalPrice(matchingRoom.sixNightCost)}`;
									} else if (minimumStaySelectedPeriodType === '1박추가' && matchingRoom.oneNightAdd && matchingRoom.oneNightAdd !== '') {
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
						<HotelCostList_MinimunStay
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
									{['1박', '2박', '3박', '4박', '5박', '6박', '1박추가'].map((pt) => (
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
					
					{/* 미니멈스테이 호텔 요금 */}
					{minimumStayHotelCost && (
						<HotelCostList_MinimunStay
							hotelCost={minimumStayHotelCost}
							title="미니멈스테이"
							highlightedCosts={minimumStayHighlightedCosts}
							isPoolVilla={false}
						/>
					)}
					
					{/* 검색 영역 - 미니멈스테이 */}
					{minimumStayHotelCost && (
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

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
								<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
									{extractRoomTypes(minimumStayHotelCost.costInput).map((rt) => (
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
									onClick={handleMinimumStaySearch}
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
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>원래요금(달러):</span>
										<span style={{fontWeight: 500}}>{minimumStayFinalSearchResult.originalPriceText || '-'}</span>
									</div>
									<div style={{marginBottom: '8px'}}>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>환율정보:</span>
										<span style={{fontWeight: 500}}>1 USD = {minimumStayFinalSearchResult.exchangeRate?.toLocaleString('ko-KR') || '-'} KRW</span>
									</div>
									<div>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>요금:</span>
										<span style={{fontWeight: 500}}>{minimumStayFinalSearchResult.priceText}</span>
									</div>
								</div>
							)}
						</div>
					)}
					
					{!preStayHotelCost && !minimumStayHotelCost && (
						<div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
							요금 정보가 없습니다.
						</div>
					)}
				</div>
			)}
		</div>
	);
}