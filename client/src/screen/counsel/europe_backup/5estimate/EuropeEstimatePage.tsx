import React, { useState, useEffect, useMemo } from 'react';
import './EuropeEstimatePage.scss';
import hotel1 from '../../../lastimages/counselrest/estimate/hotel1.png';
import hotel2 from '../../../lastimages/counselrest/estimate/hotel2.png';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import { ImLocation } from 'react-icons/im';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilCustomerInfoFormData, recoilSelectedHotelData, recoilSelectedScheduleData } from '../../../../RecoilStore';

export default function EuropeEstimatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  console.log('stateProps', stateProps);

  const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
  const selectedHotelData = useRecoilValue(recoilSelectedHotelData);
  const selectedScheduleData = useRecoilValue(recoilSelectedScheduleData);

  // 테마 레이블 변환
  const getThemeLabel = (themes: string[]) => {
    const themeMap: Record<string, string> = {
      honeymoon: '허니문',
      family: '가족여행',
      friends: '친구여행',
      solo: '혼자여행',
      business: '비즈니스'
    };
    return themes.map(t => themeMap[t] || t).join(', ') || '일반';
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
      name: card.title || selectedHotelData.hotelInfo?.hotelNameKo || '호텔명',
      nights: card.nights || ''
    }));
  };

  // 호텔 아이템 생성
  const hotelItems = useMemo(() => {
    if (!selectedHotelData.scheduleCards || selectedHotelData.scheduleCards.length === 0) {
      return [];
    }
    
    return selectedHotelData.scheduleCards.map((card: any, index: number) => {
      // 호텔 이미지 가져오기
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
      const levelNum = selectedHotelData.hotelInfo?.hotelLevel && !isNaN(parseInt(selectedHotelData.hotelInfo.hotelLevel, 10))
        ? parseInt(selectedHotelData.hotelInfo.hotelLevel, 10)
        : 4;
      const stars = '★'.repeat(levelNum);

      // 룸 타입 가져오기
      let roomType = '객실';
      if (selectedHotelData.hotelInfo?.hotelRoomTypes) {
        try {
          const roomTypes = JSON.parse(selectedHotelData.hotelInfo.hotelRoomTypes);
          if (roomTypes && roomTypes.length > 0) {
            roomType = roomTypes[0].roomTypeName || '객실';
          }
        } catch (e) {
          console.error('Failed to parse room types:', e);
        }
      }

      return {
        id: index + 1,
        image: hotelImage,
        name: card.title || selectedHotelData.hotelInfo?.hotelNameKo || '호텔명',
        rating: stars || '★★★★',
        roomType: roomType,
        nights: card.nights || '',
        description: (
          <>
            {selectedHotelData.hotelInfo?.hotelIntro || selectedHotelData.hotelInfo?.hotelAddress || '호텔 설명이 없습니다.'}
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
        value: selectedHotelData.productInfo?.productName || selectedScheduleData.productInfo?.productName || stateProps?.productName || '상품명',
      type: 'simple',
    },
    {
      label: '성명',
        value: getCustomerName(),
      type: 'simple',
    },
    {
      label: '여행형태',
        value: getThemeLabel(customerInfo.theme),
      type: 'simple',
    },
    {
      label: '여행기간',
        value: customerInfo.travelPeriod || selectedHotelData.periodText || '여행기간',
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
  }, [customerInfo, selectedHotelData, selectedScheduleData, stateProps]);

  const staticHotelItems = [
    {
      id: 1,
      image: hotel1,
      name: '코트야드 호텔',
      rating: '★★★★',
      roomType: '스위트룸',
      nights: '2박',
      description: (
          <>
            내용을 적는 곳입니다.
            <br />
            내용을 적는 곳입니다.내용을 적는 곳입니다.
            <br />
            내용을 적는 곳입니다.
            <br />
            내용을 적는 곳입니다.
          </>
      ),
    },
    {
      id: 2,
      image: hotel2,
      name: '아야나오션뷰 풀빌라',
      rating: '★★★★★',
      roomType: '오션 풀빌라',
      nights: '2박',
      description: (
          <>
            내용을 적는 곳입니다.
            <br />
            내용을 적는 곳입니다.내용을 적는 곳입니다.
            <br />
            내용을 적는 곳입니다.
            <br />
            내용을 적는 곳입니다.
          </>
      ),
    },
  ];

 
  
  useEffect(() => {
    
    console.log('fetchScheduleData');
  }, []);




  return (
    <div className="tour-estimatePage">
      <div className="tour-estimate-content">
        {/* 왼쪽 영역 */}
        <div className="tour-left-section">
          <div className="tour-estimate-header">
            <h1 className="tour-text-wrapper">
              {selectedHotelData.productInfo?.productName || selectedScheduleData.productInfo?.productName || stateProps?.productName || '상품명'}
            </h1>
          </div>

          <div className="tour-hotel-list-section">
            <h1 className="tour-text-wrapper-2">호텔구성</h1>
            <div className="tour-hotel-items">
              {hotelItems && hotelItems.length > 0 ? (
                hotelItems.map((hotel) => (
                <div key={hotel.id} className="tour-hotel-item">
                  <img className="tour-hotel-image" alt={hotel.name} src={hotel.image} />
                  <div className="tour-hotel-info">
                    <div className="tour-hotel-name-rating">
                      <div className="tour-p p-3">
                        <div className="tour-text-wrapper p-4">{hotel.name}</div>
                      </div>
                      <div className="tour-text-wrapper-7">{hotel.rating}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-instance" : "p p-2"}>
                      <div className="tour-text-wrapper design-component-instance-node">{hotel.roomType}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-10" : "p p-12"}>
                      <div className="tour-text-wrapper p-11">{hotel.nights}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-7" : "p p-9"}>
                      <div className="tour-text-wrapper p-8">{hotel.description}</div>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="empty-message">담긴 호텔 정보가 없습니다.</div>
              )}
            </div>
          </div>

          <div className="tour-schedule-section">
            <h1 className="tour-text-wrapper-2">일정표</h1>

            <div className="tour-schedule-tab-content-left">
              {selectedScheduleData.selectedSchedule ? (
                // 저장된 일정이 있으면 해당 일정만 표시
                <ScheduleRederBox 
                  id={selectedScheduleData.selectedSchedule?.id || stateProps?.id || stateProps?.schedule?.id} 
                  scheduleInfo={selectedScheduleData.selectedSchedule}
                />
              ) : (
                <ScheduleRederBox id={stateProps?.id || stateProps?.schedule?.id} />
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="tour-right-section">
          <div className="tour-estimate-sidebar">

          <div className="tour-estimate-form">
            {formSections.map((section, index) => (
              <div key={index} className="tour-form-section">
                <div className="tour-form-label-wrapper">
                  <div className="tour-form-label">{section.label}</div>
                </div>


                {section.type === 'multiline' || section.type === 'simple' && (
                  <div className="tour-p p-28">
                    <div className="tour-form-value">{section.value}</div>
                  </div>
                )}

                {section.type === 'airline' && section.flights && (
                  <div className="tour-flight-info-wrapper">
                    {section.flights.map((flight: any, index: number) => (
                      <p key={index} className="tour-flight-info">
                        <span className="tour-text-wrapper-24">{flight.airline} </span>
                        <span className="tour-text-wrapper-25">{flight.flightNumber}</span>
                        <span className="tour-text-wrapper-24">
                          &nbsp;&nbsp;출발: {flight.departure} → 도착: {flight.arrival}
                        </span>
                      </p>
                    ))}
                  </div>
                )}

                {section.type === 'hotel' && section.hotels && (
                  <div className="tour-hotel-info-wrapper">
                    {section.hotels.map((hotel: any, index: number) => (
                      <div key={index} className={index === 0 ? "p p-23" : index === 1 ? "p p-24" : "p p-25"}>
                        <div className="tour-text-wrapper p-18">{hotel.name}</div>
                      </div>
                    ))}
                    <div className="tour-hotel-nights">
                      {section.hotels.map((hotel: any, index: number) => (
                        <div key={index} className="tour-hotel-night">
                          {hotel.nights}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="tour-estimate-summary">
            <div className="tour-summary-item">
              <div className="tour-text-wrapper-11">기본요금 (1인)</div>
              <p className="tour-price-element">
                <span className="tour-span"> 2,600,000원</span>
              </p>
            </div>

            <div className="tour-summary-item">
              <div className="tour-text-wrapper-12">변경요금</div>
              <p className="tour-price-element">
                <span className="tour-span"> + 150,000원</span>
              </p>
            </div>

            <img className="tour-vector-5" alt="Vector" src="/img/vector-336.svg" />

            <div className="tour-summary-item total">
              <div className="tour-text-wrapper-13">총요금</div>
              <div className="tour-text-wrapper-18">5,200,000원</div>
            </div>

            <div className="tour-summary-footer">
              <div className="tour-text-wrapper-16">항공료불포함</div>
              <div className="tour-text-wrapper-19">성인 2</div>
            </div>

            <div className="tour-summary-actions">
              <div className="tour-action-button action-button-secondary">
                <div className="tour-rectangle-11" />
                <div className="tour-text-wrapper-10">보내기</div>
              </div>
              <div className="tour-action-button action-button-primary">
                <div className="tour-rectangle-10" />
                <div className="tour-text-wrapper-9">상품 선택하기</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

