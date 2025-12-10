import React, { useState } from 'react';
import './TourFlightPage.scss';
import AirlineData from '../../../AirlineData';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMagnifyingGlass } from "react-icons/fa6";
import flightIcon from '../../../images/counsel/rest/flight/flightIcon.png';
import personIcon from '../../../images/counsel/rest/flight/person.png';
import chairIcon from '../../../images/counsel/rest/flight/chair.png';

export default function TourFlightPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;


  const [selectedAirlineIndex, setSelectedAirlineIndex] = useState<number>(0);
  const [flightType, setFlightType] = useState<string>('직항');
  const [journeyType, setJourneyType] = useState<string>('round-trip');

  // 항공편 데이터
  const manageAirline = [
    {
      flightType: 'direct',
      departFlight: {
        id: 'KE001',
        airlineName: 'KE 대한항공',
        depart: '인천',
        arrive: '발리',
        departTime: '1740',
        arriveTime: '2240'
      },
      arriveFlight: {
        id: 'KE002',
        airlineName: 'KE 대한항공',
        depart: '발리',
        arrive: '인천',
        departTime: '0140',
        arriveTime: '0840'
      }
    },
    {
      flightType: 'direct',
      departFlight: {
        id: 'OZ001',
        airlineName: 'OZ 아시아나항공',
        depart: '인천',
        arrive: '발리',
        departTime: '0900',
        arriveTime: '1500'
      },
      arriveFlight: {
        id: 'OZ002',
        airlineName: 'OZ 아시아나항공',
        depart: '발리',
        arrive: '인천',
        departTime: '1600',
        arriveTime: '2300'
      }
    },
    {
      flightType: 'transit',
      departFlight1: {
        id: 'TG001',
        airlineName: 'TG 타이항공',
        depart: '인천',
        arrive: '방콕',
        departTime: '2200',
        arriveTime: '0200'
      },
      departFlight2: {
        id: 'TG002',
        airlineName: 'TG 타이항공',
        depart: '방콕',
        arrive: '발리',
        departTime: '0800',
        arriveTime: '1100'
      },
      arriveFlight1: {
        id: 'TG003',
        airlineName: 'TG 타이항공',
        depart: '발리',
        arrive: '방콕',
        departTime: '1200',
        arriveTime: '1500'
      },
      arriveFlight2: {
        id: 'TG004',
        airlineName: 'TG 타이항공',
        depart: '방콕',
        arrive: '인천',
        departTime: '0100',
        arriveTime: '0700'
      }
    }
  ];

  return (
    <div className="tour-flight-page">
      {/* 메인 컨텐츠 */}
      <div className="tour-flight-main">
        {/* 좌측 패널 - 항공사별 일정표 */}
        <div className="tour-left-panel">
          <div className="tour-panel-content">
            
            <div className="tour-hotel-title-wrapper">
              <div className="tour-hotel-title">
                <div className="tour-text-title">파리 + 스위스 + 이태리 5박 7일</div>
              </div>
            </div>

            {/* 항공사별 일정표 */}
            <div className="tour-resort_detail_schedule__byairline__wrapper">
              <div className="tour-resort_detail_schedule_header__wrapper">
                <span className="tour-header__main">항공사별 일정표</span>
                <div className="tour-sidebar__wrapper">
                  <span className={flightType === '직항' ? "selected__sidebar" : ""}
                    onClick={() => {
                      setFlightType('직항');
                      setSelectedAirlineIndex(0);
                    }}
                  >직항</span>
                  <span className={flightType === '경유' ? "selected__sidebar" : ""}
                    onClick={() => {
                      setFlightType('경유');
                      setSelectedAirlineIndex(0);
                    }}
                  >경유</span>
                </div>
              </div>
              {manageAirline
                .filter(airline => {
                  if (flightType === '직항') return airline.flightType === 'direct';
                  if (flightType === '경유') return airline.flightType === 'transit';
                  return true;
                })
                .map((item, index) => {
                  const isDirectFlight = item.flightType === 'direct';
                  
                  if (isDirectFlight) {
                    // 직항항공편
                    const airlineWord = item.departFlight?.airlineName?.slice(0, 2) || '';
                    const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                    const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                    return (
                      <div className="tour-flight__item__wrapper" key={index}>
                        <div className="tour-airline__wrapper">
                          {airlineImage && <img src={airlineImage} alt="airline" />}
                          <span>{item.departFlight?.airlineName}</span>
                        </div>
                        <div className="tour-flight__schedule__wrapper">
                          <div className="tour-flight__schedule_row">
                            <span>{item.departFlight?.depart}</span>
                            <span>출발</span>
                            <span>({item.departFlight?.departTime?.slice(0, 2)}:{item.departFlight?.departTime?.slice(2, 4)})</span>
                            <span>-</span>
                            <span>{item.departFlight?.arrive}</span>
                            <span>도착</span>
                            <span>({item.departFlight?.arriveTime?.slice(0, 2)}:{item.departFlight?.arriveTime?.slice(2, 4)})</span>
                          </div>
                        </div>
                        <div className="tour-flight__fare-text">
                          <span className="tour-fare-label">항공료</span>
                          <span className="tour-fare-amount">990,000원</span>
                        </div>
                      </div>
                    );
                  } else {
                    // 경유항공편
                    const airlineWord = item.departFlight1?.airlineName?.slice(0, 2) || '';
                    const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                    const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                    return (
                      <div className="tour-flight__item__wrapper" key={index}>
                        <div className="tour-airline__wrapper">
                          {airlineImage && <img src={airlineImage} alt="airline" />}
                          <span>{item.departFlight1?.airlineName}</span>
                        </div>
                        <div className="tour-flight__schedule__wrapper">
                          <div className="tour-flight__schedule_row">
                            <div className="tour-flight__schedule">
                              <span>{item.departFlight1?.depart}</span>
                              <span>출발</span>
                              <span>({item.departFlight1?.departTime?.slice(0, 2)}:{item.departFlight1?.departTime?.slice(2, 4)})</span>
                              <span>-</span>
                              <span>{item.departFlight1?.arrive}</span>
                              <span>도착</span>
                              <span>({item.departFlight1?.arriveTime?.slice(0, 2)}:{item.departFlight1?.arriveTime?.slice(2, 4)})</span>
                            </div>
                            <div className="tour-flight__schedule">
                              <span>{item.departFlight2?.depart}</span>
                              <span>출발</span>
                              <span>({item.departFlight2?.departTime?.slice(0, 2)}:{item.departFlight2?.departTime?.slice(2, 4)})</span>
                              <span>-</span>
                              <span>{item.departFlight2?.arrive}</span>
                              <span>도착</span>
                              <span>({item.departFlight2?.arriveTime?.slice(0, 2)}:{item.departFlight2?.arriveTime?.slice(2, 4)})</span>
                            </div>
                          </div>
                        </div>
                        <div className="tour-flight__fare-text">
                          <span className="tour-fare-label">항공료</span>
                          <span className="tour-fare-amount">900,000원</span>
                        </div>
                      </div>
                    );
                  }
                })
              }
            </div>
          </div>
        </div>

        {/* 우측 패널 - 선택된 항공편 상세 정보 */}
        <div className="tour-right-panel">
          <div className="flight-search-component">
            {/* 헤더 */}
            <div className="flight-search-header">
              <h2 className="flight-search-title">항공</h2>
              
              {/* 체크박스 영역 */}
              <div className="flight-checkbox-group">
                <label className="flight-checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">고객발권</span>
                </label>
                <div className="checkbox-divider"></div>
                <label className="flight-checkbox-item">
                  <input type="checkbox" />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">예약대행</span>
                </label>
              </div>
            </div>

            {/* 검색 바 */}
            <div className="flight-search-bar">
              <FaMagnifyingGlass className="search-icon" />
              <input type="text" placeholder="검색" className="search-input" />
            </div>

            {/* 여정 타입 선택 */}
            <div className="flight-type-selector">
              <button 
                className={`flight-type-btn ${journeyType === 'round-trip' ? 'active' : ''}`}
                onClick={() => setJourneyType('round-trip')}
              >
                왕복
              </button>
              <button 
                className={`flight-type-btn ${journeyType === 'one-way' ? 'active' : ''}`}
                onClick={() => setJourneyType('one-way')}
              >
                편도
              </button>
              <button 
                className={`flight-type-btn ${journeyType === 'multi-city' ? 'active' : ''}`}
                onClick={() => setJourneyType('multi-city')}
              >
                다구간
              </button>
            </div>

            {/* 여정1 카드 */}
            <div className="flight-journey-card">
              <div className="journey-label">여정1</div>
              <div className="journey-content">
                <div className="airport-section">
                  <div className="airport-code">ICN</div>
                  <div className="airport-name">인천</div>
                </div>
                <div className="flight-path">
                  <img className="flight-path-line" alt="경로" src="/img/vector-378.svg" />
                  <div className="flight-path-icon">
                    <img className="airplane-icon" alt="비행기" src={flightIcon} />
                  </div>
                </div>
                <div className="airport-section">
                  <div className="airport-code">To</div>
                  <div className="airport-name">도착지</div>
                </div>
              </div>
              <div className="journey-date">
                <span className="date-label">날짜</span>
              </div>
            </div>

            {/* 여정2 카드 - 왕복일 때만 표시 */}
            {journeyType === 'round-trip' && (
              <div className="flight-journey-card">
                <div className="journey-label">여정2</div>
                <div className="journey-content">
                  <div className="airport-section">
                    <div className="airport-code">From</div>
                    <div className="airport-name">출발지</div>
                  </div>
                  <div className="flight-path">
                    <img className="flight-path-line" alt="경로" src="/img/vector-378.svg" />
                    <div className="flight-path-icon">
                      <img className="airplane-icon" alt="비행기" src={flightIcon} />
                    </div>
                  </div>
                  <div className="airport-section">
                    <div className="airport-code">ICN</div>
                    <div className="airport-name">인천</div>
                  </div>
                </div>
                <div className="journey-date">
                  <span className="date-label">날짜</span>
                </div>
                <button className="add-journey-btn">
                  <span>여정 추가</span>
                  <span className="add-icon">+</span>
                </button>
              </div>
            )}

            {/* 승객 수 카드 */}
            <div className="flight-option-card">
              <div className="option-label">승객 수</div>
              <div className="option-value-group">
                <span className="option-value">성인 2명</span>
                <img className="option-icon" alt="승객" src={personIcon} />
              </div>
            </div>

            {/* 좌석 등급 카드 */}
            <div className="flight-option-card">
              <div className="option-label">좌석 등급</div>
              <div className="option-value-group">
                <span className="option-value">일반석</span>
                <img className="option-icon" alt="좌석" src={chairIcon} />
              </div>
            </div>

            {/* 검색 버튼 */}
            <div className="flight-search-button-wrapper">
              <button className="flight-search-button">
                검색
              </button>
              <button className="flight-search-button"
                onClick={() => {
                  navigate('/counsel/tour/estimate', { state: stateProps });
                  window.scrollTo(0, 0);
                }}
              >
                견적보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

