import React, { useState, useEffect } from 'react';
import './TourEstimatePage.scss';
import hotel1 from '../../../lastimages/counselrest/estimate/hotel1.png';
import hotel2 from '../../../lastimages/counselrest/estimate/hotel2.png';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import { ImLocation } from 'react-icons/im';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TourEstimatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  console.log('stateProps', stateProps);

  const formSections = [
    {
      label: '상품명',
      value: '[발리] 코트메이어트1박+우붓포시즌2박+세인트레지스오션풀빌라3박',
      type: 'simple',
    },
    {
      label: '성명',
      value: '홍길동',
      type: 'simple',
    },
    {
      label: '여행형태',
      value: '허니문',
      type: 'simple',
    },
    {
      label: '여행기간',
      value: '3월 2일(월) ~ 3월 7일(화)',
      type: 'simple',
    },
    {
      label: '이용항공',
      type: 'airline',
      flights: [
        {
          airline: '대한항공',
          flightNumber: 'TK0021',
          departure: '2025.07.03(수)',
          arrival: '2025.07.03(수)',
        },
        {
          airline: '대한항공',
          flightNumber: 'TK0021',
          departure: '2025.07.07(화)',
          arrival: '2025.07.07(화)',
        },
      ],
    },
    {
      label: '이용호텔',
      type: 'hotel',
      hotels: [
        { name: '코트야드 호텔', nights: '2박' },
        { name: '포시즌 호텔', nights: '1박' },
        { name: '세인트레지스 호텔', nights: '2박' },
      ],
    },
    {
      label: '변경사항',
      value: (
        <>
          요청사항에 대해서 적는 곳입니다.
          <br />
          요청사항요청사항에 대해서 적는 곳입니다.
          <br />
          요청사항에 대해서 적는 곳입니다.
        </>
      ),
      type: 'multiline',
    },
  ];

  const hotelItems = [
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
            <h1 className="tour-text-wrapper">파리 + 스위스 + 이태리 5박 7일</h1>
          </div>

          <div className="tour-hotel-list-section">
            <h1 className="tour-text-wrapper-2">호텔구성</h1>
            <div className="tour-hotel-items">
              {hotelItems.map((hotel) => (
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
              ))}
            </div>
          </div>

          <div className="tour-schedule-section">
            <h1 className="tour-text-wrapper-2">일정표</h1>

            <div className="tour-schedule-tab-content-left">
             <ScheduleRederBox id={stateProps?.schedule?.id} />
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
                    {section.flights.map((flight, index) => (
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
                    {section.hotels.map((hotel, index) => (
                      <div key={index} className={index === 0 ? "p p-23" : index === 1 ? "p p-24" : "p p-25"}>
                        <div className="tour-text-wrapper p-18">{hotel.name}</div>
                      </div>
                    ))}
                    <div className="tour-hotel-nights">
                      {section.hotels.map((hotel, index) => (
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

