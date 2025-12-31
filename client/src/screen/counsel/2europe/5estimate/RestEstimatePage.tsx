import React, { useState, useEffect, useMemo } from 'react';
import './RestEstimatePage.scss';
import hotel1 from '../../../lastimages/counselrest/estimate/hotel1.png';
import hotel2 from '../../../lastimages/counselrest/estimate/hotel2.png';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import { ImLocation } from 'react-icons/im';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { 
  recoilCustomerInfoFormData, 
  recoilSelectedHotelData, 
  recoilSelectedScheduleData 
} from '../../../../RecoilStore';

export default function RestEstimatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  
  // Recoil에서 데이터 가져오기
  const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
  const selectedHotelData = useRecoilValue(recoilSelectedHotelData);
  const selectedScheduleData = useRecoilValue(recoilSelectedScheduleData);

  // 여행 형태 라벨 변환
  const getThemeLabel = (theme: string[]) => {
    if (!theme || theme.length === 0) return '';
    const themeMap: { [key: string]: string } = {
      'honeymoon': '허니문',
      'family': '가족여행',
      'fit': 'FIT',
      'corporate': '기업/워크샵'
    };
    return themeMap[theme[0]] || theme[0];
  };

  // 고객명 가져오기
  const getCustomerName = () => {
    return customerInfo.customer1Name || customerInfo.customer2Name || '고객';
  };

  // 호텔 정보를 formSections 형식으로 변환
  const getHotelsForForm = () => {
    if (!selectedHotelData.scheduleCards || selectedHotelData.scheduleCards.length === 0) {
      return [];
    }
    return selectedHotelData.scheduleCards.map((card: any) => ({
      name: card.title || '호텔명',
      nights: (selectedHotelData.selectedNights?.[card.id] || card.nights || ''),
      roomType: selectedHotelData.selectedRoomTypes?.[card.id] || card.badge || ''
    }));
  };

  // 호텔 아이템 생성
  const hotelItems = useMemo(() => {
    if (!selectedHotelData.scheduleCards || selectedHotelData.scheduleCards.length === 0) {
      return [];
    }
    
    return selectedHotelData.scheduleCards.map((card: any, index: number) => {
      // 호텔 이미지 가져오기 (이미지 배열이 있다면 첫 번째 이미지 사용)
      let hotelImage = index === 0 ? hotel1 : hotel2;
      if (selectedHotelData.hotelInfo?.imageNamesAllView) {
        try {
          const images = JSON.parse(selectedHotelData.hotelInfo.imageNamesAllView);
          if (images && images.length > 0) {
            hotelImage = `${AdminURL}/images/hotelimages/${images[0].imageName}`;
          }
        } catch (e) {
          console.error('Failed to parse hotel images:', e);
        }
      }

      // 평점 계산
      const rating = selectedHotelData.hotelInfo?.tripAdviser || selectedHotelData.hotelInfo?.customerScore || '0';
      const ratingNum = parseFloat(rating);
      const stars = '★'.repeat(Math.floor(ratingNum));

      return {
        id: index + 1,
        image: hotelImage,
        name: card.title || selectedHotelData.hotelInfo?.hotelNameKo || '호텔명',
        rating: stars || '★★★★★',
        roomType: selectedHotelData.selectedRoomTypes?.[card.id] || card.badge || '객실',
        nights: selectedHotelData.selectedNights?.[card.id] 
          ? `${selectedHotelData.selectedNights[card.id]}박`
          : card.nights || '',
        description: (
          <>
            {selectedHotelData.hotelInfo?.hotelAddress || '호텔 설명이 없습니다.'}
          </>
        ),
      };
    });
  }, [selectedHotelData]);

  // formSections 동적 생성
  const formSections = useMemo(() => {
    const sections: any[] = [
      {
        label: '상품명',
        value: selectedHotelData.productInfo?.productName || selectedScheduleData.productInfo?.productName || '상품명',
        type: 'simple',
      },
      {
        label: '성명',
        value: getCustomerName(),
        type: 'simple',
      },
      {
        label: '연락처',
        value: customerInfo.customer1Phone || customerInfo.customer2Phone || '',
        type: 'simple',
      },
      {
        label: '여행형태',
        value: getThemeLabel(customerInfo.theme),
        type: 'simple',
      },
      {
        label: '여행기간',
        value: customerInfo.travelPeriod || selectedHotelData.travelPeriod || selectedHotelData.periodText || '여행기간',
        type: 'simple',
      },
      {
        label: '예약일자',
        value: customerInfo.reserveDate || selectedHotelData.reserveDate || '',
        type: 'simple',
      },
      {
        label: '관심여행지',
        value: customerInfo.destination || '',
        type: 'simple',
      },
      {
        label: '결혼예정일',
        value: customerInfo.weddingDate || '',
        type: 'simple',
      },
    ];

    // 항공 정보가 있다면 추가
    if (selectedScheduleData.selectedSchedule?.airlineData) {
      const airlineData = selectedScheduleData.selectedSchedule.airlineData;
      const scheduleDetailData = selectedScheduleData.selectedSchedule.scheduleDetailData || [];
      
      // 첫 번째 날짜에서 항공편 정보 추출
      const firstDay = scheduleDetailData[0];
      const airlineItems = firstDay?.scheduleDetail?.filter((item: any) => item.sort === 'airline' && item.airlineData) || [];
      
      if (airlineItems.length > 0) {
        const flights = airlineItems.map((item: any) => {
          const airline = item.airlineData;
          return {
            airline: airline.airlineName || '',
            flightNumber: airline.airlineCode || '',
            departure: airline.depart ? `${airline.depart} (${airline.departTime?.slice(0, 2) || ''}:${airline.departTime?.slice(2, 4) || ''})` : '',
            arrival: airline.arrive ? `${airline.arrive} (${airline.arriveTime?.slice(0, 2) || ''}:${airline.arriveTime?.slice(2, 4) || ''})` : ''
          };
        });
        
        sections.push({
      label: '이용항공',
      type: 'airline',
          flights: flights,
        });
      }
    }

    // 호텔 정보
    const hotels = getHotelsForForm();
    if (hotels.length > 0) {
      sections.push({
      label: '이용호텔',
      type: 'hotel',
        hotels: hotels,
      });
    }

    // 변경사항 (wants & needs)
    if (customerInfo.wantsAndNeeds) {
      sections.push({
      label: '변경사항',
      value: (
        <>
            {customerInfo.wantsAndNeeds.split('\n').map((line: string, index: number, arr: string[]) => (
              <React.Fragment key={index}>
                {line}
                {index < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </>
      ),
        type: 'multiline',
      });
    }

    return sections;
  }, [customerInfo, selectedHotelData, selectedScheduleData]);

 
  
  useEffect(() => {
    
    console.log('fetchScheduleData');
  }, []);




  return (
    <div className="rest-estimatePage">
      <div className="rest-estimate-content">
        {/* 왼쪽 영역 */}
        <div className="rest-left-section">
          <div className="rest-estimate-header">
            <h1 className="rest-text-wrapper">
              {selectedHotelData.productInfo?.productName || selectedScheduleData.productInfo?.productName || '상품명'}
            </h1>
          </div>

          <div className="rest-hotel-list-section">
            <h1 className="rest-text-wrapper-2">호텔구성</h1>
            <div className="rest-hotel-items">
              {hotelItems.length > 0 ? hotelItems.map((hotel) => (
                <div key={hotel.id} className="rest-hotel-item">
                  <img className="rest-hotel-image" alt={hotel.name} src={hotel.image} />
                  <div className="rest-hotel-info" style={{ padding: '10px' }}>
                    <div className="rest-hotel-name-rating">
                      <div className="rest-p">
                        <div className="rest-text-wrapper" style={{ fontSize: '20px' }}>{hotel.name}</div>
                      </div>
                      <div className="rest-text-wrapper-7">{hotel.rating}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-instance" : "p"}>
                      <div className="rest-text-wrapper design-component-instance-node"  style={{ fontSize: '18px' }}>{hotel.roomType}</div>
                    </div>
                    <div className="p">
                      <div className="rest-text-wrapper"  style={{ fontSize: '18px' }}>{hotel.nights}</div>
                    </div>
                    <div className="p">
                      <div className="rest-text-wrapper"  style={{ fontSize: '18px' }}>{hotel.description}</div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rest-hotel-item">
                  <div className="rest-text-wrapper">담긴 호텔 정보가 없습니다.</div>
                </div>
              )}
            </div>
          </div>

          <div className="rest-schedule-section">
            <h1 className="rest-text-wrapper-2">일정표</h1>

            <div className="rest-schedule-tab-content-left">
              {selectedScheduleData.selectedSchedule ? (
                // 저장된 일정이 있으면 해당 일정만 표시
                <ScheduleRederBox 
                  id={selectedScheduleData.selectedSchedule?.id || stateProps?.id} 
                  scheduleInfo={selectedScheduleData.selectedSchedule}
                />
              ) : (
                <ScheduleRederBox id={stateProps?.id} />
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="rest-right-section">
          <div className="rest-estimate-sidebar">

          <div className="rest-estimate-form">
            {formSections.map((section, index) => (
              <div key={index} className="rest-form-section">
                <div className="rest-form-label-wrapper">
                  <div className="rest-form-label">{section.label}</div>
                </div>


                {section.type === 'multiline' || section.type === 'simple' && (
                  <div className="rest-p">
                    <div className="rest-form-value">{section.value}</div>
                  </div>
                )}

                {section.type === 'airline' && section.flights && (
                  <div className="rest-flight-info-wrapper">
                    {section.flights.map((flight: any, index: number) => (
                      <p key={index} className="rest-flight-info">
                        <span className="rest-text-wrapper-24">{flight.airline} </span>
                        <span className="rest-text-wrapper-25">{flight.flightNumber}</span>
                        <span className="rest-text-wrapper-24">
                          &nbsp;&nbsp;출발: {flight.departure} → 도착: {flight.arrival}
                        </span>
                      </p>
                    ))}
                  </div>
                )}

                {section.type === 'hotel' && section.hotels && (
                  <div className="rest-hotel-info-wrapper">
                    {section.hotels.map((hotel: any, index: number) => (
                      <div key={index} className="p">
                        <div className="rest-text-wrapper">{hotel.name}</div>
                      </div>
                    ))}
                    <div className="rest-hotel-nights">
                      {section.hotels.map((hotel: any, index: number) => (
                        <div key={index} className="rest-hotel-night">
                          {hotel.nights}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rest-estimate-summary">
            <div className="rest-summary-item">
              <div className="rest-text-wrapper-11">기본요금 (1인)</div>
              <p className="rest-price-element">
                <span className="rest-span" style={{ fontSize: '18px' }} >
                  {selectedHotelData.priceInfo?.pricePerPerson 
                    ? `${selectedHotelData.priceInfo.pricePerPerson.toLocaleString()}원`
                    : '원'}
                </span>
              </p>
            </div>
 
            <img className="rest-vector-5" alt="Vector" src="/img/vector-336.svg" />

            <div className="rest-summary-item total">
              <div className="rest-text-wrapper-13">총요금</div>
              <div
                className="rest-text-wrapper-18"
                style={{ fontSize: '22px', fontWeight: 800 }}
              >
                {selectedHotelData.priceInfo?.totalPrice 
                  ? `${selectedHotelData.priceInfo.totalPrice.toLocaleString()}원`
                  : selectedScheduleData.totalPrice 
                    ? `${selectedScheduleData.totalPrice.toLocaleString()}원`
                    : '5,200,000원'}
              </div>
            </div>

            <div className="rest-summary-footer">
              <div className="rest-text-wrapper-16">항공료불포함</div>
              <div className="rest-text-wrapper-19">
                성인 {selectedHotelData.priceInfo?.guestCount || selectedScheduleData.guestCount || 2}
              </div>
            </div>

            <div className="rest-summary-actions">
              <div className="rest-action-button action-button-secondary">
                <div className="rest-rectangle-11" />
                <div className="rest-text-wrapper-10">보내기</div>
              </div>
              <div className="rest-action-button action-button-primary">
                <div className="rest-rectangle-10" />
                <div className="rest-text-wrapper-9" style={{ color: '#fff' }}>상품 선택하기</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

