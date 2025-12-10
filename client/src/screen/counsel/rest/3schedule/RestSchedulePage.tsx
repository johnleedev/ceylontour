import React, { useState } from 'react';
import './RestSchedulePage.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import nationnotice from '../../../lastimages/counselrest/schedule/nationnotice.png';
import rectangle675 from '../../../lastimages/counselrest/hotel/detail/rectangle-675.png';
import rectangle676 from '../../../lastimages/counselrest/hotel/detail/rectangle-676.png';
import rectangle677 from '../../../lastimages/counselrest/hotel/detail/rectangle-677.png';
import scheduleImg1 from '../../../lastimages/counselrest/schedule/image.png';
import scheduleImg2 from '../../../lastimages/counselrest/schedule/image-1.png';
import scheduleImg3 from '../../../lastimages/counselrest/schedule/image-2.png';
import scheduleImg4 from '../../../lastimages/counselrest/schedule/image-3.png';
import { useEffect } from 'react';

export default function RestSchedulePage() {

  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;

  const [mainTab, setMainTab] = useState<string>('일정미리보기');
  const [productInfo, setProductInfo] = useState<any | null>(null);
  const [activeButton, setActiveButton] = useState<'recommend' | 'create'>('recommend');
  const [activeRightTab, setActiveRightTab] = useState<'highlight' | 'ubud' | 'resort' | 'review'>('highlight');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [summaryMainTab, setSummaryMainTab] = useState<'상세일정' | '항공' | '식사' | '계약특전'>('상세일정');
  const [summarySubTab, setSummarySubTab] = useState<'익스커션' | '강습/클래스' | '스파/마사지' | '스냅촬영' | '차량/가이드' | '편의사항'>('익스커션');

  useEffect(() => {
    setProductInfo(stateProps);
    console.log('stateProps', stateProps);
  }, [stateProps]);


  // 하이라이트 탭 카드 데이터 (RestTripPage 하이라이트 카드와 동일한 구조)
  const highlightItems = [
    { id: 1, title: '포토스팟에서 인생샷', image: rectangle675 },
    { id: 2, title: '일출보기 투어', image: rectangle676 },
    { id: 3, title: '우붓 명소 맞춤 투어', image: rectangle677 },
    { id: 4, title: '포토스팟에서 인생샷', image: rectangle675 },
    { id: 5, title: '일출보기 투어', image: rectangle676 },
    { id: 6, title: '우붓 명소 맞춤 투어', image: rectangle677 },
  ];
  
 

  
  return (
    <div className="RestSchedulePage">
      {/* 오른쪽 패널 토글 버튼 */}
      {!showRightPanel && (
        <button
          type="button"
          className="right-panel-toggle-btn"
          onClick={() => setShowRightPanel(true)}
        >
          <IoIosArrowBack />
        </button>
      )}

      <div className={`schedule-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 왼쪽 영역: 기존 내용 */}
        <div className="schedule-left-section">

          <div className="schedule-center-wrapper">
           
            <div className="hotel-title-wrapper">
              <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <div className="hotel-title">
                <div className="text-title">{productInfo?.productName || ''}</div>
              </div>
            </div>

            <div className="header-buttons">
              <button 
                className={`btn-tap ${activeButton === 'recommend' ? 'active' : ''}`}
                onClick={() => setActiveButton('recommend')}
              >
                여행지 미리가기
              </button>
              <button 
                className={`btn-tap ${activeButton === 'create' ? 'active' : ''}`}
                onClick={() => setActiveButton('create')}
              >
                일정표
              </button>
            </div>

            {/* 여행지 미리가기 탭 콘텐츠 */}
            {activeButton === 'recommend' && (
            <div className="nationnotice-image">
              <img src={nationnotice} alt="국가 공지사항" />
            </div>
            )}

            {/* 일정표 탭 콘텐츠 */}
            {activeButton === 'create' && (
              <div className="schedule-tab-content-left">
                <ScheduleRederBox id={stateProps.id} />
              </div>
            )}
            
          </div>
          
          
        </div>

        {/* 오른쪽 영역: 탭에 따라 다른 내용 표시 */}
        {showRightPanel && activeButton === 'recommend' && (
          <div className="schedule-right-section">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>

            {/* 탭 컨테이너 (기존: 여행지 미리가기 전용) */}
            <div className="right-tab-container">
              <div className="right-tab-left">
                <button
                  type="button"
                  className={`right-tab-button ${activeRightTab === 'highlight' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('highlight')}
                >
                  하이라이트
                </button>
                <button
                  type="button"
                  className={`right-tab-button ${activeRightTab === 'ubud' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('ubud')}
                >
                  우붓
                </button>
                <button
                  type="button"
                  className={`right-tab-button ${activeRightTab === 'resort' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('resort')}
                >
                  리조트
                </button>
                <button
                  type="button"
                  className={`right-tab-button ${activeRightTab === 'review' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('review')}
                >
                  후기/평점
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 (기존 내용) */}
            <div className="right-tab-content">
              {activeRightTab === 'highlight' && (
                <div className="highlight-grid">
                  {highlightItems.map((item) => (
                    <div key={item.id} className="highlight-card">
                      <div className="highlight-image-wrap">
                        <img src={item.image} alt={item.title} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeRightTab === 'ubud' && (
                <div className="benefit-card-section">
                  {/* 우붓 탭 콘텐츠는 추후 추가 예정 */}
                </div>
              )}

              {activeRightTab === 'resort' && (
                <div className="benefit-card-section">
                  {/* 리조트 탭 콘텐츠는 추후 추가 예정 */}
                </div>
              )}

              {activeRightTab === 'review' && (
                <div className="benefit-card-section">
                  {/* 후기/평점 탭 콘텐츠는 추후 추가 예정 */}
                </div>
              )}
            </div>
          </div>
        )}

        {showRightPanel && activeButton === 'create' && (
          <div className="schedule-right-section">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>

            {/* 일정표 탭 전용 요약 카드 */}
            <div className="right-tab-content schedule-summary-content">
              <div className="summary-card">
                <div className="summary-header">
                  <div className="summary-header-top">
                    <span className="summary-day">1일차</span>
                    <span className="summary-date">2025-03-02(일)</span>
                  </div>
                  <div className="summary-main-tabs">
                    <button
                      className={`summary-main-tab ${summaryMainTab === '상세일정' ? 'active' : ''}`}
                      onClick={() => setSummaryMainTab('상세일정')}
                    >
                      상세일정
                    </button>
                    <button
                      className={`summary-main-tab ${summaryMainTab === '항공' ? 'active' : ''}`}
                      onClick={() => setSummaryMainTab('항공')}
                    >
                      항공
                    </button>
                    <button
                      className={`summary-main-tab ${summaryMainTab === '식사' ? 'active' : ''}`}
                      onClick={() => setSummaryMainTab('식사')}
                    >
                      식사
                    </button>
                    <button
                      className={`summary-main-tab ${summaryMainTab === '계약특전' ? 'active' : ''}`}
                      onClick={() => setSummaryMainTab('계약특전')}
                    >
                      계약특전
                    </button>
                  </div>
                  <div className="summary-sub-tabs">
                    {['익스커션','강습/클래스','스파/마사지','스냅촬영','차량/가이드','편의사항'].map(label => (
                      <span
                        key={label}
                        className={`sub-tab ${summarySubTab === label ? 'active' : ''}`}
                        onClick={() => setSummarySubTab(label as typeof summarySubTab)}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="summary-grid">
                  <div className="summary-item">
                    <img className="summary-item-image" alt="익스커션 1" src={scheduleImg1} />
                    <div className="summary-item-content">
                      <p className="summary-item-title">
                        단독차량 투어 파리 완전 개인일정 차량 가이드
                      </p>
                      <div className="summary-item-rating">★ 5.0</div>
                      <div className="summary-item-price-row">
                        <span className="summary-item-price">50,000 원</span>
                        <span className="summary-item-unit">/1인</span>
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <img className="summary-item-image" alt="익스커션 2" src={scheduleImg2} />
                    <div className="summary-item-content">
                      <p className="summary-item-title">파리시내 및 근교 맞춤투어 VIP가이드</p>
                      <div className="summary-item-rating">★ 5.0</div>
                      <div className="summary-item-price-row">
                        <span className="summary-item-price">50,000 원</span>
                        <span className="summary-item-unit">/1인</span>
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <img className="summary-item-image" alt="익스커션 3" src={scheduleImg3} />
                    <div className="summary-item-content">
                      <p className="summary-item-title">
                        단독 프라이빗투어, 공항픽업+야경투어
                      </p>
                      <div className="summary-item-rating">★ 5.0</div>
                      <div className="summary-item-price-row">
                        <span className="summary-item-price">50,000 원</span>
                        <span className="summary-item-unit">/1인</span>
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <img className="summary-item-image" alt="익스커션 4" src={scheduleImg4} />
                    <div className="summary-item-content">
                      <p className="summary-item-title">
                        단독차량 투어 파리 완전 개인일정 차량 가이드
                      </p>
                      <div className="summary-item-rating">★ 5.0</div>
                      <div className="summary-item-price-row">
                        <span className="summary-item-price">50,000 원</span>
                        <span className="summary-item-unit">/1인</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="summary-footer">
                  <div className="summary-footer-top">선택된 세부일정 제목</div>
                  <div className="summary-footer-bottom">
                    <div className="summary-footer-left">
                      <div className="summary-footer-field">날짜</div>
                      <div className="summary-footer-field">선택상품</div>
                      <div className="summary-footer-field price-field">￦ 50,000 /1인</div>
                      <div className="summary-footer-field">- 2명 +</div>
                    </div>
                    <div className="summary-footer-right">
                      <div className="summary-total-label">총요금</div>
                      <div className="summary-total-price">￦100,000</div>
                    </div>
                  </div>
                  <div className="cost-schedule-btn-wrapper">
                    <button
                      className="cost-schedule-btn"
                      onClick={() => {
                        
                      }}
                    >
                      담기
                    </button>
                    <button
                      className="cost-schedule-btn"
                      onClick={() => {
                        navigate('/counsel/rest/flight', { state: productInfo });
                        window.scrollTo(0, 0);
                      }}
                    >
                      다음
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

