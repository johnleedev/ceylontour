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

interface PriceHotelSelectedProps {
	priceModalData: PriceModalDataProps | null;
	initialSelectedHotels?: { [key: string]: HotelItem | null };
	onNext: (selectedHotels: { [key: string]: HotelItem | null }) => void;
}

export default function PriceHotelSelected({ priceModalData, initialSelectedHotels, onNext }: PriceHotelSelectedProps) {
	const [allHotels, setAllHotels] = useState<HotelItem[]>([]);
	const [filteredHotelList, setFilteredHotelList] = useState<HotelItem[]>([]);
	const [isLoadingHotels, setIsLoadingHotels] = useState(false);
	const [selectedHotelType, setSelectedHotelType] = useState<'호텔' | '리조트' | '풀빌라' | null>(null);
	const [showHotelList, setShowHotelList] = useState(false);
	const [selectedHotelForType, setSelectedHotelForType] = useState<{ [key: string]: HotelItem | null }>(
		initialSelectedHotels || {
			'호텔': null,
			'리조트': null,
			'풀빌라': null
		}
	);

	// productScheduleData에서 필요한 호텔 타입 추출
	const getRequiredHotelTypes = () => {
		if (!priceModalData?.productScheduleData) return [];
		
		try {
			const scheduleData = JSON.parse(priceModalData.productScheduleData);
			if (!Array.isArray(scheduleData) || scheduleData.length === 0) return [];
			
			// productScheduleData는 [{ hotelSort: '리조트', dayNight: '3' }, { hotelSort: '풀빌라', dayNight: '2' }] 형태의 배열
			// 모든 hotelSort 값을 수집 (중복 제거)
			const hotelTypes = new Set<string>();
			for (const item of scheduleData) {
				if (item.hotelSort && typeof item.hotelSort === 'string') {
					hotelTypes.add(item.hotelSort);
				}
			}
			
			return Array.from(hotelTypes);
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
				const res = await axios.get(`${AdminURL}/hotel/gethotelcity/${priceModalData.tourLocation}`);
				if (res.data && res.data !== false) {
					// 배열인지 확인하고, 배열이 아니면 배열로 변환
					hotels = Array.isArray(res.data) ? res.data : [res.data];
				}
			} else {
				// 도시가 없으면 전체 호텔 가져오기
				const res = await axios.get(`${AdminURL}/hotel/gethotelsall`);
				if (res.data && res.data !== false) {
					// 배열인지 확인하고, 배열이 아니면 배열로 변환
					hotels = Array.isArray(res.data) ? res.data : [res.data];
				}
			}

			setAllHotels(hotels);
			setFilteredHotelList([]);
			
			// 리조트가 필요하고 아직 선택되지 않은 경우 랜덤으로 선택
			const requiredTypes = getRequiredHotelTypes();
			if (requiredTypes.includes('리조트') && !selectedHotelForType['리조트']) {
				const resortHotels = hotels.filter((hotel: HotelItem) => 
					hotel.hotelType === '리조트' || hotel.hotelSort === '리조트'
				);
				
				if (resortHotels.length > 0) {
					// 랜덤으로 하나 선택
					const randomResort = resortHotels[Math.floor(Math.random() * resortHotels.length)];
					setSelectedHotelForType(prev => ({
						...prev,
						'리조트': randomResort
					}));
				}
			}
		} catch (error) {
			console.error('호텔 리스트 가져오기 오류:', error);
			setAllHotels([]);
			setFilteredHotelList([]);
		} finally {
			setIsLoadingHotels(false);
		}
	};

	// 호텔 타입별 필터링
	const handleHotelTypeClick = (type: '호텔' | '리조트' | '풀빌라') => {
		setSelectedHotelType(type);
		setShowHotelList(true);
		
		// allHotels가 배열인지 확인
		if (!Array.isArray(allHotels)) {
			console.error('allHotels is not an array:', allHotels);
			setFilteredHotelList([]);
			return;
		}
		
		const filtered = allHotels.filter((hotel: HotelItem) => {
			return hotel.hotelType === type;
		});
		
		setFilteredHotelList(filtered);
	};

	// 모달이 열릴 때 호텔 리스트 로딩 및 초기 선택된 호텔 설정
	useEffect(() => {
		if (priceModalData) {
			setSelectedHotelType(null);
			setShowHotelList(false);
			setFilteredHotelList([]);
			
			// initialSelectedHotels가 있으면 사용하고, 없으면 초기값으로 설정
			if (initialSelectedHotels) {
				setSelectedHotelForType(initialSelectedHotels);
			} else {
				setSelectedHotelForType({
					'호텔': null,
					'리조트': null,
					'풀빌라': null
				});
			}
			
			fetchHotels();
		}
	}, [priceModalData, initialSelectedHotels]);

	const requiredHotelTypes = getRequiredHotelTypes();

	const handleNext = () => {
		// 선택된 호텔이 있는지 확인
		const hasSelectedHotel = requiredHotelTypes.some(type => selectedHotelForType[type]);
		
		if (!hasSelectedHotel) {
			alert('호텔을 선택해주세요.');
			return;
		}
		
		// 부모 컴포넌트로 선택된 호텔 정보 전달
		onNext(selectedHotelForType);
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
				{/* 동적으로 호텔 타입별 입력창 생성 */}
				{requiredHotelTypes.map((hotelType) => (
					<div key={hotelType} style={{
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						flex: 1,
						minWidth: '300px'
					}}>
						<span style={{
							fontSize: '16px',
							color: '#666',
							fontWeight: '500',
							whiteSpace: 'nowrap',
							width: '80px'
						}}>
							{hotelType}:
						</span>
						<button
							onClick={() => handleHotelTypeClick(hotelType as '호텔' | '리조트' | '풀빌라')}
							style={{
								padding: '8px 16px',
								borderRadius: '4px',
								border: `1px solid ${selectedHotelType === hotelType ? '#5fb7ef' : '#ddd'}`,
								backgroundColor: selectedHotelType === hotelType ? '#5fb7ef' : '#fff',
								color: selectedHotelType === hotelType ? '#fff' : '#333',
								cursor: 'pointer',
								fontSize: '16px',
								fontWeight: selectedHotelType === hotelType ? '600' : '400',
								transition: 'all 0.2s',
								whiteSpace: 'nowrap'
							}}
						>
							{hotelType}
						</button>
						{selectedHotelForType[hotelType] ? (
							<div style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								padding: '8px 12px',
								border: '1px solid #5fb7ef',
								borderRadius: '4px',
								backgroundColor: '#e3f2fd',
								flex: 1,
								minWidth: '200px'
							}}>
								<span style={{
									fontSize: '16px',
									color: '#333',
									fontWeight: '500'
								}}>
									{selectedHotelForType[hotelType]?.hotelNameKo}
								</span>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setSelectedHotelForType(prev => ({ ...prev, [hotelType]: null }));
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
										justifyContent: 'center'
									}}
								>
									×
								</button>
							</div>
						) : (
							<div style={{
								flex: 1,
								padding: '8px 12px',
								border: '1px solid #ddd',
								borderRadius: '4px',
								backgroundColor: '#f8f9fa',
								color: '#999',
								fontSize: '16px',
								minWidth: '200px'
							}}>
								호텔을 선택하세요
							</div>
						)}
					</div>
				))}
				
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
						whiteSpace: 'nowrap'
					}}
				>
					다음
				</button>
			</div>
			
			{/* 호텔 리스트 표시 */}
			{showHotelList && (
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
					) : filteredHotelList.length === 0 ? (
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
								{filteredHotelList.map((hotel: HotelItem, index: number) => {
									const isSelected = selectedHotelType && selectedHotelForType[selectedHotelType]?.id === hotel.id;
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
										if (selectedHotelType) {
											setSelectedHotelForType(prev => ({
												...prev,
												[selectedHotelType]: hotel
											}));
											setShowHotelList(false);
											setSelectedHotelType(null);
										}
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