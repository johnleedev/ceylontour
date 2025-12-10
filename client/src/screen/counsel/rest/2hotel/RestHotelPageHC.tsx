import React, { useState, useEffect, useMemo } from 'react';
import './RestHotelPage.scss';
import { useNavigate } from 'react-router-dom';
import rectangle42 from '../../../lastimages/counselrest/hotel/rectangle-42.png';
import rectangle42_3 from '../../../lastimages/counselrest/hotel/rectangle-42-3.png';
import rectangle42_5 from '../../../lastimages/counselrest/hotel/rectangle-42-5.png';
import rectangle42_6 from '../../../lastimages/counselrest/hotel/rectangle-42-6.png';
import rectangle42_8 from '../../../lastimages/counselrest/hotel/rectangle-42-8.png';
import rectangle42_9 from '../../../lastimages/counselrest/hotel/rectangle-42-9.png';
import rectangle42_11 from '../../../lastimages/counselrest/hotel/rectangle-42-11.png';
import rectangle42_12 from '../../../lastimages/counselrest/hotel/rectangle-42-12.png';
import rectangle42_14 from '../../../lastimages/counselrest/hotel/rectangle-42-14.png';
import rectangle42_15 from '../../../lastimages/counselrest/hotel/rectangle-42-15.png';
import { AdminURL } from '../../../../MainURL';

export default function RestHotelPageHC () {
  const navigate = useNavigate();


  type HotelCard = {
    className: string;
    text: string;
    rectangle: string;
  };

  const hotelCards: HotelCard[] = [
    { className: 'view', text: '세인트레지스', rectangle: rectangle42 },
    { className: 'component-305', text: '세인트레지스', rectangle: rectangle42_3 },
    { className: 'component-305-instance', text: '노보텔', rectangle: rectangle42_5 },
    { className: 'view-2', text: '반얀트리', rectangle: rectangle42_6 },
    { className: 'view-3', text: '반얀트리', rectangle: rectangle42_8 },
    { className: 'view-4', text: '콘래드', rectangle: rectangle42_9 },
    { className: 'view-5', text: '아야나', rectangle: rectangle42_11 },
    { className: 'view-6', text: '세인트레지스', rectangle: rectangle42_12 },
    { className: 'view-7', text: '반얀트리', rectangle: rectangle42_14 },
    { className: 'view-8', text: '콘래드', rectangle: rectangle42_15 },
  ];


  const areaFilters = [
    { label: '전체', active: true },
    { label: '쿠타', active: false },
    { label: '스미냑', active: false },
    { label: '우붓', active: false },
    { label: '짱구', active: false },
  ];

  const typeFilters = [
    { label: '전체', active: true },
    { label: '선투숙', active: false },
    { label: '풀빌라', active: false },
    { label: '평점순', active: false },
    { label: '가격순', active: false },
    { label: '예약순', active: false },
  ];

  return (
    <div className="div-wrapper-screen">
      <div className="hotel-header">
        <div className="hotel-header-left">
          <h1 className="hotel-header-title">발리</h1>
          <p className="hotel-header-subtitle">
            단순한 숙박지가 아니라 머무는 것 자체가 여행입니다
          </p>
        </div>

        <div className="hotel-header-search">
          <form className="hotel-search-form">
            <input
              className="hotel-search-input"
              type="text"
            />
            <button type="submit" className="hotel-search-button">
              <span className="hotel-search-icon">🔍</span>
            </button>
          </form>
        </div>
      </div>

      <div className="navbar-wrapper">
        <div className="navbar">
          {areaFilters.map((item, index) => (
            <React.Fragment key={`area-${item.label}`}>
              <button
                type="button"
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                {item.label}
              </button>
              {index < areaFilters.length - 1 && <span className="nav-separator" />}
            </React.Fragment>
          ))}
        </div>

        <div className="navbar-2">
          {typeFilters.map((item, index) => (
            <React.Fragment key={`type-${item.label}`}>
              <button
                type="button"
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                {item.label}
              </button>
              {index < typeFilters.length - 1 && (
                <span className="nav-separator" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      

      <div className="hotel-card-grid">
        {hotelCards.map((card, index) => (
          <div
            key={`${card.className}-${index}`}
            className={`div-wrapper ${card.className}`}
            onClick={() => {
              navigate('/counsel/rest/hoteldetail');
            }}
          >
            <div className="card-image-wrap">
              <img
                className="card-image"
                alt={card.text}
                src={card.rectangle}
              />
            </div>
            <div className="card-body">
              <div className="hotel-name">{card.text}</div>
              <div className="hotel-location-row">
                <span className="hotel-location">발리/스미냑</span>
                <span className="hotel-stars">★★★★★</span>
              </div>
              <p className="promo-text">
                [프로모션 기간 2024년 12월 31일까지]
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-wrapper-nav-destination">여행지</div>

      <div className="text-wrapper-nav-schedule">일정</div>

      <div className="text-wrapper-nav-hotel">호텔</div>

      <div className="text-wrapper-nav-estimate">견적</div>

      <div className="text-wrapper-nav-flight">항공</div>

      <div className="rectangle-nav-indicator" />
    </div>
  );
};


