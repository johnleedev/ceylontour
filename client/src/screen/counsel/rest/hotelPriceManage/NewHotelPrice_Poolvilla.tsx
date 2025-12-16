import React, { useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { recoilExchangeRate, recoilCustomerInfoFormData } from '../../../../RecoilStore';
import { DateBoxDouble } from '../../../../boxs/DateBoxDouble';
import { DateBoxSingle } from '../../../../boxs/DateBoxSingle';

// 풀빌라/리조트 호텔 요금 리스트 컴포넌트
interface HotelCostListPoolvillaProps {
	hotelCost: {
		hotel: {
			hotelNameKo: string;
		};
		costInput: any[];
	} | null;
	title: string;
	highlightedCosts: Set<number>;
	isPoolVilla?: boolean;
	isResort?: boolean;
}



function HotelCostList_Poolvilla({ hotelCost, title, highlightedCosts, isPoolVilla = false, isResort = false }: HotelCostListPoolvillaProps) {
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
								{isResort ? (
									<>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>기간</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>룸타입</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>미니멈/박</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>화폐</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>1박요금</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>특전</th>
									</>
								) : (
									<>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>{isPoolVilla ? '기간' : '숙박기간'}</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>선투숙포함</th>
										<th style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>룸타입별 요금</th>
									</>
								)}
							</tr>
						</thead>
						<tbody>
							{hotelCost.costInput.map((cost: any, idx: number) => {
								const isHighlighted = highlightedCosts.has(idx);
								
						// 리조트인 경우 inputDefault가 배열(또는 단일 객체)이므로 각 항목을 별도 행으로 표시
								if (isResort) {
									try {
										const raw = cost.inputDefault;
										const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
								const parsedList = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
										
								if (parsedList.length > 0) {
									return parsedList.map((item: any, itemIdx: number) => {
												const formatDateStr = (d: string) => {
													if (!d) return '';
													const [y, m, day] = d.split('-');
													return `${y.slice(2)}년${m}월${day}일`;
												};
												
												// 예약기간 포맷팅
												let reservePeriodText = '-';
										if (cost.reservePeriod) {
													try {
														const reservePeriodRaw = cost.reservePeriod;
														const reservePeriodParsed = typeof reservePeriodRaw === 'string' ? JSON.parse(reservePeriodRaw) : reservePeriodRaw;
														if (reservePeriodParsed && typeof reservePeriodParsed === 'object' && !Array.isArray(reservePeriodParsed) && reservePeriodParsed.start && reservePeriodParsed.end) {
															reservePeriodText = `${formatDateStr(reservePeriodParsed.start)} ~ ${formatDateStr(reservePeriodParsed.end)}`;
														}
													} catch (e) {
														// ignore
													}
												}
												
												// 기간 포맷팅
										let periodText = '-';
										if (item.period && Array.isArray(item.period) && item.period.length > 0) {
											const periods = item.period.map((p: any) => {
												if (p.start && p.end) {
													return `${formatDateStr(p.start)} ~ ${formatDateStr(p.end)}`;
												}
												return '';
											}).filter((p: string) => p !== '');
											periodText = periods.length > 0 ? periods.join(', ') : '-';
										}
												
												// 1박요금 포맷팅
												const formatPrice = (v: any) => {
													if (!v || v === '') return '0';
													const num = parseInt(String(v).replace(/,/g, ''), 10);
													return isNaN(num) ? String(v) : num.toLocaleString('ko-KR');
												};
												const currency = item.currency || '';
												const dayChangeCost = formatPrice(item.dayChangeCost);
												const dayAddCost = formatPrice(item.dayAddCost);
										const parts: string[] = [];
										if (dayChangeCost !== '0') parts.push(`변경: ${currency}${dayChangeCost}`);
										if (dayAddCost !== '0') parts.push(`추가: ${currency}${dayAddCost}`);
										const priceText = parts.length > 0 ? parts.join(' / ') : `${currency}0`;
												
												return (
													<tr key={`${idx}-${itemIdx}`} style={{
														backgroundColor: isHighlighted ? '#e3f2fd' : (idx % 2 === 0 ? '#fff' : '#f8f9fa'),
														border: isHighlighted ? '2px solid #5fb7ef' : '1px solid transparent',
														boxShadow: isHighlighted ? '0 0 0 1px #5fb7ef' : 'none'
													}}>
													{itemIdx === 0 && (
															<>
															<td rowSpan={parsedList.length} style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle'}}>
																	{(() => {
																		const type = (cost.reserveType || '').toString().trim();
																		if (!type) return '-';
																		if (type === 'earlyPeriod') return '얼리버드';
																		if (type === 'default') return '기본';
																		return type;
																	})()}
																</td>
															<td rowSpan={parsedList.length} style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle'}}>
																	{reservePeriodText}
																</td>
															</>
														)}
														<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
															{periodText}
														</td>
														<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
															{item.roomType || '-'}
														</td>
														<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
															{item.minimumDay || '-'}
														</td>
														<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
															{item.currency || '-'}
														</td>
														<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
															{priceText}
														</td>
														<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
															{item.notice || '-'}
														</td>
													</tr>
												);
											});
										}
									} catch (e) {
										// ignore
									}
								}
				
								
								// 풀빌라 구조 (기존 로직)
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
													const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
													const first = defaultsArr[0];
													if (first && first.period) {
														const periodArr = Array.isArray(first.period) ? first.period : [];
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
													const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
													const first = defaultsArr[0];
													if (first && typeof first === 'object') {
														const preStayRaw = (first.preStay ?? '').toString();
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
													const defaultsArr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
													const roomList = defaultsArr.flatMap((def: any) =>
														Array.isArray(def.costByRoomType) ? def.costByRoomType : []
													);
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
																if (isPoolVilla) {
																	if (rt.twoTwoDayCost) parts.push(`2+2: ${formatPrice(rt.twoTwoDayCost)}`);
																	if (rt.oneThreeDayCost) parts.push(`1+3: ${formatPrice(rt.oneThreeDayCost)}`);
																	if (rt.threeDayCost && rt.threeDayCost !== '') parts.push(`3only: ${formatPrice(rt.threeDayCost)}`);
																	if (rt.fourDayCost) parts.push(`4only: ${formatPrice(rt.fourDayCost)}`);
																} else {
																	if (rt.twoTwoDayCost) parts.push(`2박: ${formatPrice(rt.twoTwoDayCost)}`);
																	if (rt.oneThreeDayCost) parts.push(`3박: ${formatPrice(rt.oneThreeDayCost)}`);
																	if (rt.threeDayCost) parts.push(`3일: ${formatPrice(rt.threeDayCost)}`);
																	if (rt.fourDayCost) parts.push(`4박: ${formatPrice(rt.fourDayCost)}`);
																}
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

interface HotelPriceInfo_PoolvillaProps {
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
	// 오른쪽 패널( RestHotelCost )에서 선택한 룸타입/박수 정보(팩요금용)
	externalRoomType?: string;
	externalPeriodType?: string;
}

export default function HotelPriceInfo_Poolvilla({
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
	onPriceUpdate,
	externalRoomType,
	externalPeriodType
}: HotelPriceInfo_PoolvillaProps) {
	const exchangeRate = useRecoilValue(recoilExchangeRate);
	// Recoil에서 여행기간 가져오기
	const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
	
	const usdRate = useMemo(() => {
		const raw = exchangeRate?.USDsend_KRW_tts;
		const rawStr = raw !== undefined && raw !== null ? String(raw) : '';
		const num = parseFloat(rawStr.replace(/,/g, ''));
		return isNaN(num) ? 0 : num;
	}, [exchangeRate]);
	
	
	// 조합 규칙 정의 (향후 추가를 위해 상단에 별도 정의)
	const comboRules = [
		{ key: 'resortPool_1_3', resortNights: 1, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 0 },
		{ key: 'resortPool_2_2', resortNights: 2, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 0 },
		{ key: 'resortPool_3_2', resortNights: 3, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 1 },
		{ key: 'resortPool_4_2', resortNights: 4, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 2 },
		{ key: 'resortPool_2_3', resortNights: 2, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 1 },
		{ key: 'resortPool_3_3', resortNights: 3, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 2 },
		// 추가 조합: 리조트 5박 + 풀빌라 2박, 리조트 4박 + 풀빌라 3박
		// (리조트 dayAddCost * 2) + 풀빌라 twoTwoDayCost
		{ key: 'resortPool_5_2', resortNights: 5, poolNights: 2, baseKey: 'twoTwoDayCost', extraTimes: 2 },
		// (리조트 dayAddCost * 3) + 풀빌라 oneThreeDayCost
		{ key: 'resortPool_4_3', resortNights: 4, poolNights: 3, baseKey: 'oneThreeDayCost', extraTimes: 3 }
	];

	// 숫자 포맷터
	const formatNumber = (n: number) => n.toLocaleString('ko-KR');
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
	
	// 문자열 금액 -> number
	const parseAmount = (v: any): number => {
		if (v === null || v === undefined) return 0;
		const num = parseInt(String(v).replace(/,/g, ''), 10);
		return isNaN(num) ? 0 : num;
	};

	// nights 문자열 -> number (예: "2박" -> 2)
	const parseNights = (str: string | undefined): number => {
		if (!str) return 0;
		const m = str.match(/(\d+)/);
		return m ? parseInt(m[1], 10) : 0;
	};

	// 가격 텍스트에서 숫자와 통화 추출
	const parsePriceFromText = (text: string) => {
		if (!text) return { num: 0, currency: '₩' };
		const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
		const currencyMatch = text.match(/₩|\$/);
		return {
			num: isNaN(num) ? 0 : num,
			currency: currencyMatch ? currencyMatch[0] : '₩'
		};
	};

	// 검색 관련 상태 (각 호텔별로 관리)
	const [hotelReserveDate, setHotelReserveDate] = useState<string>(today);
	const [hotelSearchDateStart, setHotelSearchDateStart] = useState<string>('');
	const [hotelSearchDateEnd, setHotelSearchDateEnd] = useState<string>('');
	const [hotelSelectedRoomType, setHotelSelectedRoomType] = useState<string>('');
	const [hotelSelectedPeriodType, setHotelSelectedPeriodType] = useState<string>('');
	const [hotelHighlightedCosts, setHotelHighlightedCosts] = useState<Set<number>>(new Set());

	// travelPeriod를 파싱하여 날짜 범위 설정
	useEffect(() => {
		console.log('📅 travelPeriod 파싱 시작:', customerInfo.travelPeriod);
		if (customerInfo.travelPeriod) {
			const travelPeriod = customerInfo.travelPeriod.trim();
			
			// "YYYY-MM-DD ~ YYYY-MM-DD" 형식인 경우
			if (travelPeriod.includes('~')) {
				const parts = travelPeriod.split('~').map(part => part.trim());
				console.log('📅 날짜 범위 파싱:', parts);
				if (parts.length === 2) {
					const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
					if (dateRegex.test(parts[0]) && dateRegex.test(parts[1])) {
						console.log('✅ 날짜 범위 설정:', parts[0], '~', parts[1]);
						setHotelSearchDateStart(parts[0]);
						setHotelSearchDateEnd(parts[1]);
					} else {
						console.warn('⚠️ 날짜 형식이 올바르지 않음:', parts);
					}
				}
			} else {
				// 단일 날짜인 경우
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (dateRegex.test(travelPeriod)) {
					console.log('✅ 단일 날짜 설정:', travelPeriod);
					setHotelSearchDateStart(travelPeriod);
					setHotelSearchDateEnd(travelPeriod);
				} else {
					console.warn('⚠️ 날짜 형식이 올바르지 않음:', travelPeriod);
				}
			}
		} else {
			console.log('⚠️ travelPeriod가 없음');
		}
	}, [customerInfo.travelPeriod]);

	// 예약일자 초기값을 Recoil에서 가져오기
	useEffect(() => {
		if (customerInfo.reserveDate) {
			setHotelReserveDate(customerInfo.reserveDate);
		}
	}, [customerInfo.reserveDate]);
	const [hotelFinalSearchResult, setHotelFinalSearchResult] = useState<{
		reserveType: string;
		reservePeriod: string;
		roomType: string;
		priceText: string;
	} | null>(null);


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

	// 조합 요금 계산 (리조트 + 풀빌라 전용)
	const comboPriceText = useMemo(() => {
		if (!priceModalData?.productScheduleData) return '';
		let scheduleData: any[] = [];
		try {
			scheduleData = JSON.parse(priceModalData.productScheduleData);
		} catch {
			return '';
		}
		if (!Array.isArray(scheduleData) || scheduleData.length === 0) return '';

		const first = scheduleData[0];
		const second = scheduleData[1];

		// 리조트 단독 4박 (리조트만 있는 경우) 처리
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
								(hotelSelectedRoomType &&
									roomList.find((r: any) => r.roomType === hotelSelectedRoomType)) ||
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

		const resortNights = parseNights(first.dayNight);
		const poolNights = parseNights(second.dayNight);

		const rule = comboRules.find(
			(r) => r.resortNights === resortNights && r.poolNights === poolNights
		);
		if (!rule) return '';

		// 해당 순서의 호텔 cost 데이터 추출
		const resortCost = scheduledHotels.find((h) => h.hotelSort === '리조트')?.hotelCost;
		const poolCost = scheduledHotels.find((h) => h.hotelSort === '풀빌라')?.hotelCost;
		if (!resortCost || !poolCost) return '';
		// 풀빌라 기본 요금 추출
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
						(hotelSelectedRoomType &&
							roomList.find((r: any) => r.roomType === hotelSelectedRoomType)) ||
						roomList[0];
					poolCurrency = room.currency || '';
					poolBase = parseAmount(room[rule.baseKey]);
					poolRoomType = room.roomType || '';
				}
			}
		} catch (e) {
			console.error('풀빌라 기본 요금 파싱 오류', e);
		}
		if (poolBase === 0) return '';

		// 리조트 추가요금 추출 (dayAddCost 사용)
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
	}, [priceModalData?.productScheduleData, scheduledHotels, comboRules, hotelSelectedRoomType]);

	// 조합 요금 계산 결과를 부모 컴포넌트에 전달
	useEffect(() => {
		if (comboPriceText && onPriceUpdate) {
			const { num: priceNum } = parsePriceFromText(comboPriceText);
			if (priceNum > 0) {
				onPriceUpdate(priceNum);
			}
		}
	}, [comboPriceText, onPriceUpdate]);



	// 룸타입 목록 추출 (공통)
	const extractRoomTypes = (costInputArr: any[]) => {
		const roomTypes = new Set<string>();
		costInputArr.forEach((cost: any) => {
			try {
				const inputDefaultRaw = cost.inputDefault
					? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault)
					: null;
				const defaultsArr = Array.isArray(inputDefaultRaw) ? inputDefaultRaw : (inputDefaultRaw ? [inputDefaultRaw] : []);
				defaultsArr.forEach((def: any) => {
					if (def && def.costByRoomType && Array.isArray(def.costByRoomType)) {
						def.costByRoomType.forEach((rt: any) => {
							if (rt.roomType) roomTypes.add(rt.roomType);
						});
					}
				});
			} catch (e) {
				// ignore
			}
		});
		return Array.from(roomTypes);
	};

	// 현재 선택된 룸타입을 포함하고, 요금 데이터가 있는 호텔을 우선으로 검색 대상 선택
	const getTargetHotelForSearch = () => {
		if (scheduledHotels.length === 0) return null;
		const withCost = scheduledHotels.filter(
			(h) => h.hotelCost?.costInput && h.hotelCost.costInput.length > 0
		);
		if (withCost.length === 0) return null;
		if (!hotelSelectedRoomType) return withCost[0];
		for (const h of withCost) {
			const types = extractRoomTypes(h.hotelCost?.costInput ?? []);
			if (types.includes(hotelSelectedRoomType)) {
				return h;
			}
		}
		return withCost[0];
	};

	// 🔗 외부(오른쪽 패널)에서 선택한 룸타입/박수와 동기화 (팩요금 전용)
	useEffect(() => {
		// external 값이 없으면 아무 것도 하지 않음
		if (!externalRoomType && !externalPeriodType) return;

		// 룸타입/기간타입 상태를 외부 값으로 동기화
		if (externalRoomType) {
			setHotelSelectedRoomType(externalRoomType);
		}
		if (externalPeriodType) {
			setHotelSelectedPeriodType(externalPeriodType);
		}

		// 현재 선택된 룸타입을 포함하는 호텔을 대상으로 자동 검색 실행
		const target = getTargetHotelForSearch();
		if (target?.hotelCost) {
			// 리조트/풀빌라 조합 규칙을 사용하는 검색 로직
			handleHotelSearch(target.hotelCost, target.hotelSort === '리조트');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [externalRoomType, externalPeriodType]);

	// 호텔 검색
	const handleHotelSearch = (hotelCost: any, isResort: boolean = false) => {
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
		} | null = null;

		// 콤보 선택(리조트+풀빌라 조합) 시 풀빌라 요금으로 계산
		const tryComboResult = () => {
			if (!hotelSelectedPeriodType || !hotelSelectedPeriodType.includes('+')) return null;
			const parts = hotelSelectedPeriodType.split('+').map((p) => parseInt(p, 10));
			if (parts.length !== 2 || parts.some((n) => isNaN(n))) return null;
			const [resortN, poolN] = parts;
			const rule = comboRules.find((r) => r.resortNights === resortN && r.poolNights === poolN);
			if (!rule) return null;

			const resortCost = scheduledHotels.find((h) => h.hotelSort === '리조트')?.hotelCost;
			const poolCost = scheduledHotels.find((h) => h.hotelSort === '풀빌라')?.hotelCost;
			if (!resortCost || !poolCost) return null;

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
							(hotelSelectedRoomType &&
								roomList.find((r: any) => r.roomType === hotelSelectedRoomType)) ||
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
		};

		const comboResult = tryComboResult();
		if (comboResult) {
			setHotelHighlightedCosts(highlighted);
			setHotelFinalSearchResult(comboResult);
			return;
		}

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

			if (hotelSearchDateStart && hotelSearchDateEnd) {
				try {
					const inputDefaultRaw = cost.inputDefault
						? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault)
						: null;
					const defaultsArr = Array.isArray(inputDefaultRaw) ? inputDefaultRaw : (inputDefaultRaw ? [inputDefaultRaw] : []);
					if (isResort && defaultsArr.length > 0) {
						// 리조트 구조: inputDefault가 배열 또는 단일 객체
						let hasMatchingPeriod = false;
						const searchStartDate = new Date(hotelSearchDateStart);
						const searchEndDate = new Date(hotelSearchDateEnd);
						
						for (const item of defaultsArr) {
							if (item.period && Array.isArray(item.period)) {
								for (const periodItem of item.period) {
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
							}
							if (hasMatchingPeriod) break;
						}
						
						if (!hasMatchingPeriod) {
							matches = false;
						}
					} else if (!isResort && defaultsArr.length > 0) {
						// 풀빌라 구조: inputDefault 안의 period가 선택일자 (실제 숙박 기간)
						let hasMatchingPeriod = false;
						const searchStartDate = new Date(hotelSearchDateStart);
						const searchEndDate = new Date(hotelSearchDateEnd);
						
						for (const def of defaultsArr) {
							if (def.period && Array.isArray(def.period)) {
								for (const periodItem of def.period) {
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
					const inputDefaultRaw = cost.inputDefault
						? (typeof cost.inputDefault === 'string' ? JSON.parse(cost.inputDefault) : cost.inputDefault)
						: null;
					const defaultsArr = Array.isArray(inputDefaultRaw) ? inputDefaultRaw : (inputDefaultRaw ? [inputDefaultRaw] : []);
					if (isResort && defaultsArr.length > 0) {
						// 리조트 구조: inputDefault가 배열 또는 단일 객체
						const matchingItem = defaultsArr.find((item: any) => {
							if (hotelSelectedRoomType && item.roomType !== hotelSelectedRoomType) {
								return false;
							}
							return true;
						});

						if (matchingItem) {
							highlighted.add(idx);
							if (!finalResult) {
								const currency = matchingItem.currency || '';
								const formatPrice = (v: any) => {
									if (!v || v === '') return '0';
									const num = parseInt(String(v).replace(/,/g, ''), 10);
									return isNaN(num) ? String(v) : num.toLocaleString('ko-KR');
								};
								const dayChangeCost = formatPrice(matchingItem.dayChangeCost);
								const dayAddCost = formatPrice(matchingItem.dayAddCost);
								const priceText = `${currency}${dayChangeCost} / ${currency}${dayAddCost}`;
								
								finalResult = {
									reserveType: cost.reserveType === 'earlyPeriod' ? '얼리버드' : cost.reserveType === 'default' ? '기본' : cost.reserveType || '-',
									reservePeriod: formatReservePeriod(cost.reservePeriod),
									roomType: matchingItem.roomType || '-',
									priceText: priceText
								};
							}
						}
					} else if (!isResort && defaultsArr.length > 0) {
						// 풀빌라 구조: costByRoomType 배열
						const allRooms = defaultsArr.flatMap((def: any) =>
							Array.isArray(def.costByRoomType) ? def.costByRoomType : []
						);
						const matchingRoom = allRooms.find((rt: any) => {
							if (hotelSelectedRoomType && rt.roomType !== hotelSelectedRoomType) {
								return false;
							}
							
							if (hotelSelectedPeriodType) {
								let hasPeriod = false;
								if (hotelSelectedPeriodType === '2+2' && rt.twoTwoDayCost) hasPeriod = true;
								if (hotelSelectedPeriodType === '1+3' && rt.oneThreeDayCost) hasPeriod = true;
								if (hotelSelectedPeriodType === '3' && rt.threeDayCost && rt.threeDayCost !== '') hasPeriod = true;
								if (hotelSelectedPeriodType === '4' && rt.fourDayCost) hasPeriod = true;
								
								if (!hasPeriod) {
									return false;
								}
							}
							return true;
						});

						if (matchingRoom) {
							highlighted.add(idx);
							if (!finalResult) {
								const currency = matchingRoom.currency || '';
								const formatPrice = (v: any) => {
									if (!v) return '';
									const num = parseInt(String(v).replace(/,/g, ''), 10);
									const formatted = isNaN(num) ? String(v) : num.toLocaleString('ko-KR');
									const suffix = currency === '₩' ? '원' : '';
									return `${currency}${formatted}${suffix}`;
								};
								let priceText = '';
								if (hotelSelectedPeriodType === '2+2' && matchingRoom.twoTwoDayCost) {
									priceText = `2+2: ${formatPrice(matchingRoom.twoTwoDayCost)}`;
								} else if (hotelSelectedPeriodType === '1+3' && matchingRoom.oneThreeDayCost) {
									priceText = `1+3: ${formatPrice(matchingRoom.oneThreeDayCost)}`;
								} else if (hotelSelectedPeriodType === '3' && matchingRoom.threeDayCost && matchingRoom.threeDayCost !== '') {
									priceText = `3only: ${formatPrice(matchingRoom.threeDayCost)}`;
								} else if (hotelSelectedPeriodType === '4' && matchingRoom.fourDayCost) {
									priceText = `4only: ${formatPrice(matchingRoom.fourDayCost)}`;
								} else {
									const parts: string[] = [];
									if (matchingRoom.twoTwoDayCost) parts.push(`2+2: ${formatPrice(matchingRoom.twoTwoDayCost)}`);
									if (matchingRoom.oneThreeDayCost) parts.push(`1+3: ${formatPrice(matchingRoom.oneThreeDayCost)}`);
									if (matchingRoom.threeDayCost && matchingRoom.threeDayCost !== '') parts.push(`3only: ${formatPrice(matchingRoom.threeDayCost)}`);
									if (matchingRoom.fourDayCost) parts.push(`4only: ${formatPrice(matchingRoom.fourDayCost)}`);
									priceText = parts.join(' / ');
								}
								
								finalResult = {
									reserveType: cost.reserveType === 'earlyPeriod' ? '얼리버드' : cost.reserveType === 'default' ? '기본' : cost.reserveType || '-',
									reservePeriod: formatReservePeriod(cost.reservePeriod),
									roomType: matchingRoom.roomType || '-',
									priceText: priceText
								};
							}
						}
					}
				} catch (e) {
					// ignore
				}
			} else {
				if (matches) {
					highlighted.add(idx);
				}
			}
		});

		setHotelHighlightedCosts(highlighted);
		setHotelFinalSearchResult(finalResult);
	};

	// 랜드사 요금 정보 디버깅
	useEffect(() => {
		console.log('랜드사 요금 정보:', {
			landCommissionTotal,
			landDiscountDefaultTotal,
			landDiscountSpecialTotal,
			landCurrency,
			priceModalData: priceModalData?.landCompany
		});
	}, [landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency, priceModalData?.landCompany]);

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

	// 조합 요금이 변경될 때마다 부모 컴포넌트에 가격 업데이트
	useEffect(() => {
		if (comboPriceText && onPriceUpdate) {
			const { num: priceNum } = parsePriceFromText(comboPriceText);
			if (priceNum > 0) {
				// 판매가 계산 (랜드사 수수료/할인 포함)
				const { currency } = parsePriceFromText(comboPriceText);
				const commissionAdj = convertLandAmount(landCommissionTotal, currency);
				const defaultAdj = convertLandAmount(landDiscountDefaultTotal, currency);
				const specialAdj = convertLandAmount(landDiscountSpecialTotal, currency);
				const saleNum = Math.max(0, priceNum + commissionAdj - defaultAdj - specialAdj);
				onPriceUpdate(saleNum);
			}
		}
	}, [comboPriceText, onPriceUpdate, landCommissionTotal, landDiscountDefaultTotal, landDiscountSpecialTotal, landCurrency, usdRate]);

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
					<strong>조합 요금(리조트+풀빌라):</strong> {comboPriceText}
				</div>
			)}
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
							<HotelCostList_Poolvilla
								hotelCost={hotelCost}
								title={hotelSort || `호텔${idx + 1}`}
								highlightedCosts={hotelHighlightedCosts}
								isPoolVilla={hotelSort === '풀빌라'}
								isResort={hotelSort === '리조트'}
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
								gap: '12px',
								flexWrap: 'wrap',
								alignItems: 'center'
							}}>
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

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>룸타입</span>
								{(() => {
									const allCostInputs = scheduledHotels.flatMap(({ hotelCost }) => hotelCost?.costInput ?? []);
									const roomTypes = extractRoomTypes(allCostInputs);
									return (
										<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
											{roomTypes.length === 0 ? (
												<span style={{color: '#999', fontSize: '14px'}}>룸타입이 없습니다.</span>
											) : roomTypes.map((rt) => (
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
									);
								})()}

								<span style={{color: '#666', fontSize: '16px', fontWeight: 600}}>기간타입</span>
								<div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
									{comboRules.map((rule) => {
										const label = `${rule.resortNights}+${rule.poolNights}`;
										const active = hotelSelectedPeriodType === label;
										return (
											<button
												key={rule.key}
												onClick={() => setHotelSelectedPeriodType(active ? '' : label)}
												style={{
													padding: '6px 12px',
													borderRadius: '4px',
													border: `1px solid ${active ? '#5fb7ef' : '#ddd'}`,
													backgroundColor: active ? '#5fb7ef' : '#fff',
													color: active ? '#fff' : '#333',
													cursor: 'pointer',
													fontSize: '16px',
													fontWeight: active ? '600' : '400'
												}}
											>
												{label}
											</button>
										);
									})}
								</div>

								<button
									onClick={() => {
										const target = getTargetHotelForSearch();
										if (target?.hotelCost) {
											handleHotelSearch(target.hotelCost, target.hotelSort === '리조트');
										}
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
									<div>
										<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>요금:</span>
										<span style={{fontWeight: 500}}>{hotelFinalSearchResult.priceText}</span>
									</div>
									{(() => {
										const { num: baseNum, currency } = parsePriceFromText(hotelFinalSearchResult.priceText || '');
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
											<div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd'}}>
												<div style={{marginBottom: '8px'}}>
													<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>기본 요금:</span>
													<span style={{fontWeight: 500}}>{currency}{formatNumber(baseNum)}{suffix}</span>
												</div>
												{commissionAdj > 0 && (
													<div style={{marginBottom: '8px', color: '#333'}}>
														<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>랜드사 수수료:</span>
														<span style={{fontWeight: 500}}>+{currency}{formatNumber(commissionAdj)}{suffix}</span>
													</div>
												)}
												{(defaultAdj > 0 || specialAdj > 0) && (
													<div style={{marginBottom: '8px', color: '#28a745'}}>
														<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>네고 할인:</span>
														<span style={{fontWeight: 500}}>
															-{currency}{formatNumber(defaultAdj + specialAdj)}{suffix}
														</span>
													</div>
												)}
												<div style={{
													marginTop: '8px',
													paddingTop: '8px',
													borderTop: '1px solid #5fb7ef'
												}}>
													<span style={{fontWeight: 600, color: '#666', marginRight: '8px'}}>판매가:</span>
													<span style={{fontWeight: 700, fontSize: '18px', color: '#5fb7ef'}}>{saleText}</span>
												</div>
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