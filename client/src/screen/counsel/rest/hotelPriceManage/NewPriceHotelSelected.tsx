import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AdminURL } from '../../../../MainURL';

interface PriceModalDataProps {
	productName: string;
	tourLocation?: string;
	tourPeriodData?: string;
	productScheduleData?: string;
	landCompany?: string;
}

interface HotelItem {
	id: number;
	hotelNameKo: string;
	hotelNameEn: string;
	nation: string;
	city: string;
	hotelSort: string;
	hotelType?: string;
	isView: string;
	hasCostData?: boolean;
	costLandCompanies?: string[];
	costPriceRange?: {
		min: number;
		max: number;
		currency: string;
	};
	costDetails?: {
		period: string;
		roomType: string;
		price: string;
	}[];
}

interface SelectedHotelItem {
	index: number;
	hotelSort: string;
	dayNight?: string;
	hotel: HotelItem | null;
}

interface PriceHotelSelectedProps {
	priceModalData: PriceModalDataProps | null;
	onNext: (selectedHotels: SelectedHotelItem[]) => void;
}

export default function PriceHotelSelected({ priceModalData, onNext }: PriceHotelSelectedProps) {
	const [allHotels, setAllHotels] = useState<HotelItem[]>([]);
	const [filteredHotelLists, setFilteredHotelLists] = useState<{ [index: number]: HotelItem[] }>({});
	const [isLoadingHotels, setIsLoadingHotels] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [showHotelList, setShowHotelList] = useState(false);
	const [selectedHotels, setSelectedHotels] = useState<SelectedHotelItem[]>([]);

	// productScheduleData에서 순서대로 호텔 정보 추출 (중복 허용)
	const getScheduleItems = (): Array<{ index: number; hotelSort: string; dayNight?: string }> => {
		if (!priceModalData?.productScheduleData) return [];
		
		try {
			const scheduleData = JSON.parse(priceModalData.productScheduleData);
			if (!Array.isArray(scheduleData) || scheduleData.length === 0) return [];
			
			// productScheduleData는 [{ hotelSort: '리조트', dayNight: '3' }, { hotelSort: '풀빌라', dayNight: '2' }] 형태의 배열
			// 순서대로 반환 (최대 4개, 중복 허용)
			return scheduleData.slice(0, 4).map((item: any, index: number) => ({
				index,
				hotelSort: item.hotelSort || '',
				dayNight: item.dayNight
			}));
		} catch (e) {
			console.error('productScheduleData 파싱 오류:', e);
			return [];
		}
	};

	// 호텔 리스트 가져오기
	const fetchHotels = async () => {
		if (!priceModalData) return;
		
		setIsLoadingHotels(true);
		try {
			let hotels: any[] = [];
			
			// 도시가 있으면 해당 도시의 호텔만 가져오기
			if (priceModalData.tourLocation) {
				const res = await axios.get(`${AdminURL }/hotel/gethotelcity/${priceModalData.tourLocation}`);
				if (res.data && res.data !== false) {
					hotels = res.data;
				}
			} else {
				// 도시가 없으면 전체 호텔 가져오기
				const res = await axios.get(`${AdminURL }/hotel/gethotelsall`);
				if (res.data && res.data !== false) {
					hotels = res.data;
				}
			}

			setAllHotels(hotels);
			setFilteredHotelLists({});
		} catch (error) {
			console.error('호텔 리스트 가져오기 오류:', error);
			setAllHotels([]);
			setFilteredHotelLists({});
		} finally {
			setIsLoadingHotels(false);
		}
	};

	// 호텔 타입별 필터링 (각 인덱스별로 별도의 리스트 관리)
	const handleHotelTypeClick = (index: number, hotelSort: string) => {
		setSelectedIndex(index);
		setShowHotelList(true);
		
		// 해당 인덱스에 대한 필터링된 리스트가 없으면 생성
		if (!filteredHotelLists[index]) {
			const filtered = allHotels.filter((hotel: HotelItem) => {
				if (!hotel.hotelType) return false;
				// hotelType이 '리조트 풀빌라'처럼 공백으로 구분된 문자열일 수 있으므로 포함 여부 확인
				const hotelTypes = hotel.hotelType.split(' ').filter(Boolean);
				return hotelTypes.includes(hotelSort);
			});
			
			setFilteredHotelLists(prev => ({
				...prev,
				[index]: filtered
			}));
		}
	};

	// 모달이 열릴 때 호텔 리스트 로딩
	useEffect(() => {
		if (priceModalData) {
			setSelectedIndex(null);
			setShowHotelList(false);
			setFilteredHotelLists({});
			const scheduleItems = getScheduleItems();
			setSelectedHotels(scheduleItems.map(item => ({ ...item, hotel: null })));
			fetchHotels();
		}
	}, [priceModalData]);

	const scheduleItems = getScheduleItems();

	const handleNext = () => {
		// 선택된 호텔이 있는지 확인
		const hasSelectedHotel = selectedHotels.some(item => item.hotel !== null);
		
		if (!hasSelectedHotel) {
			alert('호텔을 선택해주세요.');
			return;
		}
		
		// 부모 컴포넌트로 선택된 호텔 정보 전달
		onNext(selectedHotels);
	};

	return (
		<div style={{
			marginTop: '30px',
			paddingTop: '20px',
			borderTop: '2px solid #e0e0e0'
		}}>
			<h3 style={{
				margin: '0 0 20px 0',
				fontSize: '18px',
				fontWeight: 'bold',
				color: '#333'
			}}>
				1단계: 호텔 선택하기
			</h3>
			
			{/* 호텔 입력창 한 줄로 배치 */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '15px',
				marginBottom: '20px',
				flexWrap: 'wrap'
			}}>
				{/* productScheduleData 순서대로 호텔 선택창 생성 (중복 허용) */}
				{scheduleItems.map((item) => {
					const selectedHotel = selectedHotels.find(sh => sh.index === item.index)?.hotel;
					return (
						<div key={item.index} style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							flexWrap: 'nowrap'
						}}>
							<span style={{
								fontSize: '16px',
								color: '#666',
								fontWeight: '500',
								whiteSpace: 'nowrap'
							}}>
								{item.hotelSort} {item.index + 1}:
							</span>
							<button
								onClick={() => handleHotelTypeClick(item.index, item.hotelSort)}
								style={{
									padding: '8px 16px',
									borderRadius: '4px',
									border: `1px solid ${selectedIndex === item.index ? '#5fb7ef' : '#ddd'}`,
									backgroundColor: selectedIndex === item.index ? '#5fb7ef' : '#fff',
									color: selectedIndex === item.index ? '#fff' : '#333',
									cursor: 'pointer',
									fontSize: '16px',
									fontWeight: selectedIndex === item.index ? '600' : '400',
									transition: 'all 0.2s',
									whiteSpace: 'nowrap'
								}}
							>
								{item.hotelSort}
							</button>
							{selectedHotel ? (
								<div style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									padding: '8px 12px',
									border: '1px solid #5fb7ef',
									borderRadius: '4px',
									backgroundColor: '#e3f2fd',
									minWidth: '200px',
									maxWidth: '250px'
								}}>
									<span style={{
										fontSize: '16px',
										color: '#333',
										fontWeight: '500',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap'
									}}>
										{selectedHotel.hotelNameKo}
									</span>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setSelectedHotels(prev => 
												prev.map(sh => sh.index === item.index ? { ...sh, hotel: null } : sh)
											);
										}}
										style={{
											background: 'none',
											border: 'none',
											color: '#dc3545',
											cursor: 'pointer',
											fontSize: '16px',
											padding: '0',
											width: '20px',
											height: '20px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0
										}}
									>
										×
									</button>
								</div>
							) : (
								<div style={{
									padding: '8px 12px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									backgroundColor: '#f8f9fa',
									color: '#999',
									fontSize: '16px',
									minWidth: '200px',
									maxWidth: '250px'
								}}>
									호텔을 선택하세요
								</div>
							)}
						</div>
					);
				})}
				
				{/* 다음 버튼 */}
				<button
					onClick={handleNext}
					style={{
						padding: '10px 24px',
						borderRadius: '4px',
						border: '1px solid #5fb7ef',
						backgroundColor: '#5fb7ef',
						color: '#fff',
						cursor: 'pointer',
						fontSize: '16px',
						fontWeight: '600',
						whiteSpace: 'nowrap',
						marginLeft: 'auto'
					}}
				>
					다음
				</button>
			</div>
			
			{/* 호텔 리스트 표시 (선택된 인덱스에 해당하는 리스트만 표시) */}
			{showHotelList && selectedIndex !== null && (
				<div style={{
					marginTop: '20px',
					border: '1px solid #e0e0e0',
					borderRadius: '4px',
					maxHeight: '400px',
					overflowY: 'auto'
				}}>
					{isLoadingHotels ? (
						<div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
							호텔 리스트를 불러오는 중...
						</div>
					) : !filteredHotelLists[selectedIndex] || filteredHotelLists[selectedIndex].length === 0 ? (
						<div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
							선택한 타입의 호텔이 없습니다.
						</div>
					) : (
						<table style={{width: '100%', borderCollapse: 'collapse'}}>
							<thead>
								<tr style={{background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 1}}>
									<th style={{width: '5%', padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px', fontWeight: '600'}}>NO</th>
									<th style={{width: '20%', padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px', fontWeight: '600'}}>호텔명</th>
									<th style={{width: '15%', padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px', fontWeight: '600'}}>국가/도시</th>
									<th style={{width: '10%', padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px', fontWeight: '600'}}>타입</th>
									<th style={{width: '10%', padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px', fontWeight: '600'}}>구분</th>
								</tr>
							</thead>
							<tbody>
								{filteredHotelLists[selectedIndex].map((hotel: HotelItem, index: number) => {
									const isSelected = selectedHotels.find(sh => sh.index === selectedIndex)?.hotel?.id === hotel.id;
									return (
									<tr key={hotel.id} style={{
										backgroundColor: isSelected ? '#e3f2fd' : (index % 2 === 0 ? '#fff' : '#f8f9fa'),
										cursor: 'pointer',
										transition: 'background-color 0.2s',
										border: isSelected ? '2px solid #5fb7ef' : '1px solid transparent'
									}}
									onMouseEnter={(e) => {
										if (!isSelected) {
											e.currentTarget.style.backgroundColor = '#e3f2fd';
										}
									}}
									onMouseLeave={(e) => {
										if (!isSelected) {
											e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa';
										}
									}}
									onClick={() => {
										// 호텔 선택
										setSelectedHotels(prev => 
											prev.map(sh => sh.index === selectedIndex ? { ...sh, hotel } : sh)
										);
										setShowHotelList(false);
										setSelectedIndex(null);
									}}
									>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px'}}>{hotel.id}</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'left', fontSize: '16px'}}>
											<div style={{fontWeight: '500'}}>{hotel.hotelNameKo}</div>
											{hotel.hotelNameEn && (
												<div style={{fontSize: '16px', color: '#666', marginTop: '2px'}}>{hotel.hotelNameEn}</div>
											)}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px'}}>
											{hotel.nation}/{hotel.city}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px'}}>
											{hotel.hotelType || '-'}
										</td>
										<td style={{padding: '10px', border: '1px solid #e0e0e0', textAlign: 'center', fontSize: '16px'}}>
											{hotel.hotelSort || '-'}
										</td>
									</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>
			)}
		</div>
	);
}