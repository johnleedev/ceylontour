import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AdminURL } from '../../../../MainURL';
import { format } from 'date-fns';
import PriceHotelSelected from './NewPriceHotelSelected';
import HotelPriceInfo_Poolvilla from './NewHotelPrice_Poolvilla';
import HotelPriceInfo_PerDay from './NewHotelPrice_PerDay';
import HotelPriceInfo_MinimunStay from './NewHotelPrice_MinimunStay';

interface PriceModalDataProps {
	productName: string;
	tourLocation?: string;
	tourPeriodData?: string;
	productScheduleData?: string;
	landCompany?: string;
	costType?: string;
}

interface ModalHotelPriceManageProps {
	isOpen: boolean;
	onClose: () => void;
	priceModalData: PriceModalDataProps | null;
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

export default function ModalHotelPriceManage({ isOpen, onClose, priceModalData }: ModalHotelPriceManageProps) {

	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [selectedHotels, setSelectedHotels] = useState<SelectedHotelItem[]>([]);
	const today = format(new Date(), 'yyyy-MM-dd');
	const [landCommissionText, setLandCommissionText] = useState<string>('');
	const [landDiscountDefaultText, setLandDiscountDefaultText] = useState<string>('');
	const [landDiscountSpecialText, setLandDiscountSpecialText] = useState<string>('');
	const [landCommissionTotal, setLandCommissionTotal] = useState<number>(0);
	const [landDiscountDefaultTotal, setLandDiscountDefaultTotal] = useState<number>(0);
	const [landDiscountSpecialTotal, setLandDiscountSpecialTotal] = useState<number>(0);
	const [landCurrency, setLandCurrency] = useState<string>('₩');
	// 선택된 호텔의 요금 정보 (순서대로 최대 4개)
	const [hotel1Cost, setHotel1Cost] = useState<any>(null);
	const [hotel2Cost, setHotel2Cost] = useState<any>(null);
	const [hotel3Cost, setHotel3Cost] = useState<any>(null);
	const [hotel4Cost, setHotel4Cost] = useState<any>(null);
	const [isLoadingCost, setIsLoadingCost] = useState(false);

	// 랜드사 수수료/네고 정보 가져오기
	const fetchLandCommission = async () => {
		if (!priceModalData?.landCompany || priceModalData.landCompany === '전체' || !priceModalData.tourLocation) {
			setLandCommissionText('');
			setLandDiscountDefaultText('');
			setLandDiscountSpecialText('');
			setLandCommissionTotal(0);
			setLandDiscountDefaultTotal(0);
			setLandDiscountSpecialTotal(0);
			setLandCurrency('₩');
			return;
		}
		try {
			const res = await axios.get(`${AdminURL}/landcompany/getlandcompanyone/${priceModalData.tourLocation}/${priceModalData.landCompany}`);
			if (res.data && Array.isArray(res.data) && res.data.length > 0) {
				const lc = res.data[0];
				const currency = lc.applyCurrency || '₩';
				setLandCurrency(currency || '₩');
				let commissionParsed: any[] = [];
				let discountDefaultParsed: any[] = [];
				let discountSpecialParsed: any[] = [];
				let commissionTotal = 0;
				let discountDefaultTotal = 0;
				let discountSpecialTotal = 0;
				try {
					commissionParsed = typeof lc.commission === 'string' ? JSON.parse(lc.commission) : (Array.isArray(lc.commission) ? lc.commission : []);
				} catch {
					commissionParsed = [];
				}
				try {
					discountDefaultParsed = typeof lc.discountDefault === 'string' ? JSON.parse(lc.discountDefault) : (Array.isArray(lc.discountDefault) ? lc.discountDefault : []);
				} catch {
					discountDefaultParsed = [];
				}
				try {
					discountSpecialParsed = typeof lc.discountSpecial === 'string' ? JSON.parse(lc.discountSpecial) : (Array.isArray(lc.discountSpecial) ? lc.discountSpecial : []);
				} catch {
					discountSpecialParsed = [];
				}
				if (Array.isArray(commissionParsed) && commissionParsed.length > 0) {
					const fmt = (v: any) => {
						const num = parseInt(String(v).replace(/,/g, ''), 10);
						return isNaN(num) ? String(v ?? '') : num.toLocaleString('ko-KR');
					};
					const parts = commissionParsed.map((item: any) => {
						const sort = item.sort || '-';
						const person = item.personNum || '';
						const charge = fmt(item.charge);
						const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
						if (!isNaN(chargeNum)) commissionTotal += chargeNum;
						const chargeText = charge ? `${currency}${charge}` : '-';
						return `${sort}${person ? `/${person}` : ''}: ${chargeText}`;
					});
					setLandCommissionText(parts.join(' / '));
				} else {
					setLandCommissionText('');
				}
				setLandCommissionTotal(commissionTotal);
				if (Array.isArray(discountDefaultParsed) && discountDefaultParsed.length > 0) {
					const fmt = (v: any) => {
						const num = parseInt(String(v).replace(/,/g, ''), 10);
						return isNaN(num) ? String(v ?? '') : num.toLocaleString('ko-KR');
					};
					const parts = discountDefaultParsed.map((item: any) => {
						const sort = item.sort || '-';
						const person = item.personNum || '';
						const charge = fmt(item.charge);
						const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
						if (!isNaN(chargeNum)) discountDefaultTotal += chargeNum;
						const chargeText = charge ? `${currency}${charge}` : '-';
						return `${sort}${person ? `/${person}` : ''}: ${chargeText}`;
					});
					setLandDiscountDefaultText(parts.join(' / '));
				} else {
					setLandDiscountDefaultText('');
				}
				setLandDiscountDefaultTotal(discountDefaultTotal);
				if (Array.isArray(discountSpecialParsed) && discountSpecialParsed.length > 0) {
					const fmt = (v: any) => {
						const num = parseInt(String(v).replace(/,/g, ''), 10);
						return isNaN(num) ? String(v ?? '') : num.toLocaleString('ko-KR');
					};
					const parts = discountSpecialParsed.map((item: any) => {
						const sort = item.sort || '-';
						const person = item.personNum || '';
						const charge = fmt(item.charge);
						const chargeNum = parseInt(String(item.charge || '').replace(/,/g, ''), 10);
						if (!isNaN(chargeNum)) discountSpecialTotal += chargeNum;
						const chargeText = charge ? `${currency}${charge}` : '-';
						return `${sort}${person ? `/${person}` : ''}: ${chargeText}`;
					});
					setLandDiscountSpecialText(parts.join(' / '));
				} else {
					setLandDiscountSpecialText('');
				}
				setLandDiscountSpecialTotal(discountSpecialTotal);
			} else {
				setLandCommissionText('');
				setLandDiscountDefaultText('');
				setLandDiscountSpecialText('');
				setLandCommissionTotal(0);
				setLandDiscountDefaultTotal(0);
				setLandDiscountSpecialTotal(0);
				setLandCurrency('₩');
			}
		} catch (e) {
			console.error('랜드사 수수료 정보 가져오기 오류:', e);
			setLandCommissionText('');
			setLandDiscountDefaultText('');
			setLandDiscountSpecialText('');
			setLandCommissionTotal(0);
			setLandDiscountDefaultTotal(0);
			setLandDiscountSpecialTotal(0);
			setLandCurrency('₩');
		}
	};

	// 선택된 호텔들의 요금 정보 가져오기
	const fetchSelectedHotelsCosts = async (selectedHotelsData?: SelectedHotelItem[]) => {
		setIsLoadingCost(true);
		try {
			const hotels = selectedHotelsData || selectedHotels;
			
			// 순서대로 호텔 수집 (최대 4개)
			const hotelsToFetch: { index: number; hotel: HotelItem; hotelSort: string }[] = [];
			hotels.forEach((item) => {
				if (item.hotel && item.index < 4) {
					hotelsToFetch.push({
						index: item.index + 1,
						hotel: item.hotel,
						hotelSort: item.hotelSort
					});
				}
			});
			
			// 인덱스 순서대로 정렬
			hotelsToFetch.sort((a, b) => a.index - b.index);
			
			// 각 호텔의 요금 정보 가져오기
			const costPromises = hotelsToFetch.map(async ({ index, hotel, hotelSort }) => {
				try {
					const costInputRes = await axios.post(`${AdminURL}/hotel/gethotelcostbyfilters`, {
						postId: hotel.id,
						dateStart: '',
						dateEnd: '',
						reserveDate: today,
						landCompany: priceModalData?.landCompany && priceModalData.landCompany !== '전체' ? priceModalData.landCompany : ''
					});
					
					const costInputData = costInputRes.data && costInputRes.data !== false 
						? (Array.isArray(costInputRes.data) ? costInputRes.data : [costInputRes.data])
						: [];
					
					return {
						index,
						hotel,
						hotelSort,
						costInput: costInputData
					};
				} catch (error) {
					console.error(`호텔${index} 요금 정보 가져오기 오류:`, error);
					return {
						index,
						hotel,
						hotelSort,
						costInput: []
					};
				}
			});
			
			const costs = await Promise.all(costPromises);
			
			// 인덱스별로 상태 업데이트
			costs.forEach(({ index, hotel, costInput }) => {
				const hotelCostData = {
					hotel,
					costInput
				};
				
				if (index === 1) {
					setHotel1Cost(hotelCostData);
				} else if (index === 2) {
					setHotel2Cost(hotelCostData);
				} else if (index === 3) {
					setHotel3Cost(hotelCostData);
				} else if (index === 4) {
					setHotel4Cost(hotelCostData);
				}
			});
			
			// 사용되지 않는 인덱스는 null로 설정
			const usedIndices = costs.map(c => c.index);
			if (!usedIndices.includes(1)) setHotel1Cost(null);
			if (!usedIndices.includes(2)) setHotel2Cost(null);
			if (!usedIndices.includes(3)) setHotel3Cost(null);
			if (!usedIndices.includes(4)) setHotel4Cost(null);
		} catch (error) {
			console.error('호텔 요금 정보 가져오기 오류:', error);
		} finally {
			setIsLoadingCost(false);
		}
	};

	// 모달이 열릴 때 초기화
	useEffect(() => {
		if (isOpen && priceModalData) {
			setHotel1Cost(null);
			setHotel2Cost(null);
			setHotel3Cost(null);
			setHotel4Cost(null);
			setCurrentStep(1);
			setSelectedHotels([]);
			fetchLandCommission();
		}
	}, [isOpen, priceModalData]);
	

	if (!isOpen || !priceModalData) return null;

	return (
		<div className='Modal'>
			<div className='modal-backcover' onClick={onClose}></div>
			<div className='modal-maincover' onClick={(e) => e.stopPropagation()}>
				<div style={{
					backgroundColor: '#fff',
					borderRadius: '8px',
					padding: '30px',
					minWidth: '1000px',
					width: '90vw',
					maxHeight: '90vh',
					position: 'relative',
					overflow: 'auto'
				}}>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px',
						paddingBottom: '15px',
						borderBottom: '2px solid #e0e0e0'
					}}>
						<h2 style={{margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333'}}>호텔별 요금</h2>
						<button
							onClick={onClose}
							style={{
								background: 'none',
								border: 'none',
								fontSize: '24px',
								cursor: 'pointer',
								color: '#999',
								padding: '0',
								width: '30px',
								height: '30px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							×
						</button>
					</div>
					<div style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
						<p style={{width: '50px', fontSize: '14px', color: '#666', fontWeight: '500', marginRight: '20px'}}>상품명</p>
						<p style={{fontSize: '16px', color: '#333', fontWeight: 'bold'}}>{priceModalData.productName}</p>
					</div>
					{priceModalData.tourLocation && (
						<div style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
							<p style={{width: '50px', fontSize: '14px', color: '#666', fontWeight: '500', marginRight: '20px'}}>도시</p>
							<p style={{fontSize: '16px', color: '#333', fontWeight: 'bold', marginRight: '20px'}}>{priceModalData.tourLocation}</p>
						</div>
					)}
					{priceModalData.landCompany && (
						<div style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
							<p style={{width: '50px', fontSize: '14px', color: '#666', fontWeight: '500', marginRight: '20px'}}>랜드사</p>
							<p style={{fontSize: '16px', color: '#333', fontWeight: 'bold', marginRight: '20px'}}>{priceModalData.landCompany}</p>
						</div>
					)}
					{priceModalData.landCompany && (
						<div style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
							<p style={{width: '50px', fontSize: '14px', color: '#666', fontWeight: '500', marginRight: '20px'}}>수수료</p>
							<p style={{fontSize: '16px', color: '#333', fontWeight: 'bold', marginRight: '20px'}}>
								{landCommissionText || '정보 없음'}
							</p>
						</div>
					)}
					{priceModalData.landCompany && (
						<div style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
							<p style={{width: '50px', fontSize: '14px', color: '#666', fontWeight: '500', marginRight: '20px'}}>기본네고</p>
							<p style={{fontSize: '16px', color: '#333', fontWeight: 'bold', marginRight: '20px'}}>
								{landDiscountDefaultText || '정보 없음'}
							</p>
						</div>
					)}
					{priceModalData.landCompany && (
						<div style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
							<p style={{width: '50px', fontSize: '14px', color: '#666', fontWeight: '500', marginRight: '20px'}}>특별네고</p>
							<p style={{fontSize: '16px', color: '#333', fontWeight: 'bold', marginRight: '20px'}}>
								{landDiscountSpecialText || '정보 없음'}
							</p>
						</div>
					)}
					
					{/* 1단계: 호텔 선택하기 */}
					{currentStep === 1 && (
						<PriceHotelSelected
							priceModalData={priceModalData}
							onNext={(selectedHotelsData) => {
								setSelectedHotels(selectedHotelsData);
								setCurrentStep(2);
								fetchSelectedHotelsCosts(selectedHotelsData);
							}}
						/>
					)}

					{/* 2단계: 호텔 요금 정보 */}
					{currentStep === 2 && (
						priceModalData.costType === '팩요금' ? (
							<HotelPriceInfo_Poolvilla
								hotel1Cost={hotel1Cost}
								hotel2Cost={hotel2Cost}
								hotel3Cost={hotel3Cost}
								hotel4Cost={hotel4Cost}
								isLoadingCost={isLoadingCost}
								priceModalData={priceModalData}
								onBack={() => setCurrentStep(1)}
								today={today}
								landCommissionTotal={landCommissionTotal}
								landDiscountDefaultTotal={landDiscountDefaultTotal}
								landDiscountSpecialTotal={landDiscountSpecialTotal}
								landCurrency={landCurrency}
							/>
						) : priceModalData.costType === '미니멈스테이' ? (
							<HotelPriceInfo_MinimunStay
								hotel1Cost={hotel1Cost}
								hotel2Cost={hotel2Cost}
								hotel3Cost={hotel3Cost}
								hotel4Cost={hotel4Cost}
								isLoadingCost={isLoadingCost}
								priceModalData={priceModalData}
								onBack={() => setCurrentStep(1)}
								today={today}
								landCommissionTotal={landCommissionTotal}
								landDiscountDefaultTotal={landDiscountDefaultTotal}
								landDiscountSpecialTotal={landDiscountSpecialTotal}
								landCurrency={landCurrency}
							/>
						) : (
							<HotelPriceInfo_PerDay
								hotel1Cost={hotel1Cost}
								hotel2Cost={hotel2Cost}
								hotel3Cost={hotel3Cost}
								hotel4Cost={hotel4Cost}
								isLoadingCost={isLoadingCost}
								priceModalData={priceModalData}
								onBack={() => setCurrentStep(1)}
								today={today}
								landCommissionTotal={landCommissionTotal}
								landDiscountDefaultTotal={landDiscountDefaultTotal}
								landDiscountSpecialTotal={landDiscountSpecialTotal}
								landCurrency={landCurrency}
							/>
						)
					)}

					<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '25px'}}>
						<button
							onClick={onClose}
							style={{
								padding: '10px 20px',
								backgroundColor: '#5fb7ef',
								color: '#fff',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500'
							}}
						>
							확인
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}