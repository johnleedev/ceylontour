import React, { useState, useEffect } from 'react';
import './RestEstimatePage.scss';
import hotel1 from '../../../lastimages/counselrest/estimate/hotel1.png';
import hotel2 from '../../../lastimages/counselrest/estimate/hotel2.png';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import { ImLocation } from 'react-icons/im';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RestEstimatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  
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
    <div className="rest-estimatePage">
      <div className="rest-estimate-content">
        {/* 왼쪽 영역 */}
        <div className="rest-left-section">
          <div className="rest-estimate-header">
            <h1 className="rest-text-wrapper">코트아드메리어1박 + 우붓 포시즌2박 + 세인트레지스 오션풀빌라 3박</h1>
          </div>

          <div className="rest-hotel-list-section">
            <h1 className="rest-text-wrapper-2">호텔구성</h1>
            <div className="rest-hotel-items">
              {hotelItems.map((hotel) => (
                <div key={hotel.id} className="rest-hotel-item">
                  <img className="rest-hotel-image" alt={hotel.name} src={hotel.image} />
                  <div className="rest-hotel-info">
                    <div className="rest-hotel-name-rating">
                      <div className="rest-p p-3">
                        <div className="rest-text-wrapper p-4">{hotel.name}</div>
                      </div>
                      <div className="rest-text-wrapper-7">{hotel.rating}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-instance" : "p p-2"}>
                      <div className="rest-text-wrapper design-component-instance-node">{hotel.roomType}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-10" : "p p-12"}>
                      <div className="rest-text-wrapper p-11">{hotel.nights}</div>
                    </div>
                    <div className={hotel.id === 1 ? "p p-7" : "p p-9"}>
                      <div className="rest-text-wrapper p-8">{hotel.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rest-schedule-section">
            <h1 className="rest-text-wrapper-2">일정표</h1>

            <div className="rest-schedule-tab-content-left">
             <ScheduleRederBox id={stateProps.id} />
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
                  <div className="rest-p p-28">
                    <div className="rest-form-value">{section.value}</div>
                  </div>
                )}

                {section.type === 'airline' && section.flights && (
                  <div className="rest-flight-info-wrapper">
                    {section.flights.map((flight, index) => (
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
                    {section.hotels.map((hotel, index) => (
                      <div key={index} className={index === 0 ? "p p-23" : index === 1 ? "p p-24" : "p p-25"}>
                        <div className="rest-text-wrapper p-18">{hotel.name}</div>
                      </div>
                    ))}
                    <div className="rest-hotel-nights">
                      {section.hotels.map((hotel, index) => (
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
                <span className="rest-span"> 2,600,000원</span>
              </p>
            </div>

            <div className="rest-summary-item">
              <div className="rest-text-wrapper-12">변경요금</div>
              <p className="rest-price-element">
                <span className="rest-span"> + 150,000원</span>
              </p>
            </div>

            <img className="rest-vector-5" alt="Vector" src="/img/vector-336.svg" />

            <div className="rest-summary-item total">
              <div className="rest-text-wrapper-13">총요금</div>
              <div className="rest-text-wrapper-18">5,200,000원</div>
            </div>

            <div className="rest-summary-footer">
              <div className="rest-text-wrapper-16">항공료불포함</div>
              <div className="rest-text-wrapper-19">성인 2</div>
            </div>

            <div className="rest-summary-actions">
              <div className="rest-action-button action-button-secondary">
                <div className="rest-rectangle-11" />
                <div className="rest-text-wrapper-10">보내기</div>
              </div>
              <div className="rest-action-button action-button-primary">
                <div className="rest-rectangle-10" />
                <div className="rest-text-wrapper-9">상품 선택하기</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

