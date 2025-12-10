import React, { useState, useEffect, useMemo, useRef } from 'react';
import './TourScheduleRecommend.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImLocation } from 'react-icons/im';
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import axios from 'axios';

import rectangle675 from '../../../lastimages/counselrest/hotel/detail/rectangle-675.png';
import rectangle676 from '../../../lastimages/counselrest/hotel/detail/rectangle-676.png';
import rectangle677 from '../../../lastimages/counselrest/hotel/detail/rectangle-677.png';

// 일정표 우측 패널 카드용 이미지 (투어 전용)
import scheduleImg1 from '../../../lastimages/counseltour/schedule/image1.png';
import scheduleImg2 from '../../../lastimages/counseltour/schedule/image2.png';
import scheduleImg3 from '../../../lastimages/counseltour/schedule/image3.png';
import scheduleImg4 from '../../../lastimages/counseltour/schedule/image4.png';



const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
   
  
  const [mainTab, setMainTab] = useState<string>('일정미리보기');
  const [activeRightTab, setActiveRightTab] = useState<'included' | 'optional'>('included');
  const [summaryMainTab, setSummaryMainTab] = useState<
    '가이드투어' | '입장/체험' | '공연/경기' | '식사/카페' | '스냅촬영' | '쇼핑'
  >('가이드투어');
  const [summarySubTab, setSummarySubTab] = useState<'익스커션' | '강습/클래스' | '스파/마사지' | '스냅촬영' | '차량/가이드' | '편의사항'>('익스커션');
  
 

  const [loading, setLoading] = useState<boolean>(true);
  const [productName, setProductName] = useState<string>('');
  const [scheduleDetail, setScheduleDetail] = useState<any>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);
  const [cityInfoMap, setCityInfoMap] = useState<Record<string, any>>({});
  const [loadingCityInfo, setLoadingCityInfo] = useState<boolean>(false);
  const previewContentRef = useRef<HTMLDivElement>(null);

  
  
  // productScheduleData에서 도시 목록 추출
  const cities = React.useMemo(() => {
    if (!stateProps?.productScheduleData) return [];
    try {
      const scheduleData = JSON.parse(stateProps.productScheduleData);
      if (Array.isArray(scheduleData)) {
        const cityList = scheduleData
          .map((item: any) => item.city)
          .filter((city: string) => city && city.trim() !== '');
        // 중복 제거
        return Array.from(new Set(cityList));
      }
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
    }
    return [];
  }, [stateProps?.productScheduleData]);

  // 각 도시 정보 가져오기
  const fetchCityInfo = async (cityName: string) => {
    try {
      const response = await axios.get(`${AdminURL}/ceylontour/getcityinfobycity/${cityName}`);
      if (response.data && response.data !== false && response.data.length > 0) {
        // 첫 번째 항목을 도시 정보로 사용
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error(`${cityName} 도시 정보를 가져오는 중 오류 발생:`, error);
      return null;
    }
  };

  // 모든 도시 정보 가져오기
  useEffect(() => {
    const fetchAllCityInfo = async () => {
      if (cities.length === 0) return;
      
      setLoadingCityInfo(true);
      const cityInfoPromises = cities.map(async (city: string) => {
        const info = await fetchCityInfo(city);
        return { city, info };
      });

      try {
        const results = await Promise.all(cityInfoPromises);
        const infoMap: Record<string, any> = {};
        results.forEach(({ city, info }) => {
          if (info) {
            infoMap[city] = info;
          }
        });
        setCityInfoMap(infoMap);
      } catch (error) {
        console.error('도시 정보를 가져오는 중 오류 발생:', error);
      } finally {
        setLoadingCityInfo(false);
      }
    };

    fetchAllCityInfo();
  }, [cities]);

  // 첫 번째 도시를 기본값으로 설정
  const [selectedCity, setSelectedCity] = useState<string>('');

  // stateProps가 변경되면 첫 번째 도시를 선택
  useEffect(() => {
    if (stateProps?.productScheduleData && cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  }, [stateProps?.productScheduleData, cities]);

  // 도시 탭 변경 시 이미지 최상단으로 스크롤
  useEffect(() => {
    if (previewContentRef.current) {
      previewContentRef.current.scrollTop = 0;
    }
  }, [selectedCity]);

  // 하이라이트 탭 카드 데이터 (RestSchedulePage와 동일한 구조)
  const highlightItems = [
    { id: 1, title: '포토스팟에서 인생샷', image: rectangle675 },
    { id: 2, title: '일출보기 투어', image: rectangle676 },
    { id: 3, title: '우붓 명소 맞춤 투어', image: rectangle677 },
    { id: 4, title: '포토스팟에서 인생샷', image: rectangle675 },
    { id: 5, title: '일출보기 투어', image: rectangle676 },
    { id: 6, title: '우붓 명소 맞춤 투어', image: rectangle677 },
  ];





  return (
    <div className="schedule-page">
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

      {/* 메인 컨텐츠 */}
      <div className={`schedule-main ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 좌측 패널 - 일정 선택 */}
        <div className="left-panel">
          <div className="panel-content">
            {/* 패널 헤더 */}
            <div className="panel-header">
              <h2>{productName}</h2>
            </div>

            <div></div>

            {/* 메인 탭 버튼들 */}
            <div className="main-tab-buttons">
              <button 
                className={`main-tab-btn ${mainTab === '일정미리보기' ? 'active' : ''}`}
                onClick={() => setMainTab('일정미리보기')}
              >
                일정미리보기
              </button>
              <button 
                className={`main-tab-btn ${mainTab === '여행루트' ? 'active' : ''}`}
                onClick={() => setMainTab('여행루트')}
              >
                여행루트
              </button>
              <button 
                className={`main-tab-btn ${mainTab === '일정표' ? 'active' : ''}`}
                onClick={() => setMainTab('일정표')}
              >
                일정표
              </button>
            </div>

            {/* 도시 탭 버튼들 - 일정미리보기 탭일 때만 표시 */}
            {mainTab === '일정미리보기' && cities.length > 0 && (
              <div className="city-tab-buttons-left">
                {cities.map((city: string) => (
                  <button
                    key={city}
                    className={`city-tab-btn-left ${selectedCity === city ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            {/* 탭별 콘텐츠 렌더링 */}
            {mainTab === '일정미리보기' && (
              <div className="preview-content" ref={previewContentRef}>
                {(() => {
                  const currentCityInfo = selectedCity ? cityInfoMap[selectedCity] : null;
                  const courseImage = currentCityInfo?.courseImage;
                  
                  if (courseImage) {
                    return (
                      <img 
                        src={`${AdminURL}/images/citymapinfo/${courseImage}`} 
                        alt="일정 미리보기" 
                        className="preview-image"
                      />
                    );
                  }
                  
                  return (
                    <div className="preview-no-image">
                      이미지가 없습니다
                    </div>
                  );
                })()}
              </div>  
            )}

            {mainTab === '여행루트' && (
              <div className="route-content">
                <img 
                  src={`${AdminURL}/images/tourmapinfo/${stateProps?.tourmapImage}`} 
                  alt="여행 루트" 
                  className="route-image"
                />
              </div>
            )}

            {/* 일정표 탭 콘텐츠 */}
            {mainTab === '일정표' && (
              <div className="schedule-tab-content-left">
                <ScheduleRederBox id={stateProps?.id} />
              </div>
            )}

            

          </div>
        </div>

        {/* 우측 패널 - 좌측 메인 탭에 따라 다른 내용 */}
        {showRightPanel && mainTab === '일정미리보기' && (
          <div className="right-panel">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>
            <div className="panel-content">
              {/* 도시 탭 버튼들 (기존 내용) */}
              <div className="city-tab-buttons">
                <button 
                  className={`city-tab-btn ${selectedCity === '파리' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('파리')}
                >
                  파리
                </button>
                <button 
                  className={`city-tab-btn ${selectedCity === '니스' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('니스')}
                >
                  니스
                </button>
                <button 
                  className={`city-tab-btn ${selectedCity === '루베른' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('루베른')}
                >
                  루베른
                </button>
                <button 
                  className={`city-tab-btn ${selectedCity === '인터라겐' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('인터라겐')}
                >
                  인터라겐
                </button>
              </div>

              {/* 탭 컨테이너 (기존: 포함일정 / 선택일정) */}
              <div className="right-tab-container">
                <div className="right-tab-left">
                  <button
                    type="button"
                    className={`right-tab-button ${activeRightTab === 'included' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('included')}
                  >
                    포함일정
                  </button>
                  <button
                    type="button"
                    className={`right-tab-button ${activeRightTab === 'optional' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('optional')}
                  >
                    선택일정/추가일정
                  </button>
                </div>
              </div>

              {/* 탭 컨텐츠 (기존 내용) */}
              <div className="right-tab-content">
                {activeRightTab === 'included' && (
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

                {activeRightTab === 'optional' && (
                  <div className="benefit-card-section">
                    {/* 선택일정/추가일정 탭 콘텐츠는 추후 추가 예정 */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showRightPanel && mainTab === '여행루트' && (
          <div className="right-panel">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>
            <div className="panel-content">
              <div className="right-route-summary">
                <h3>여행루트 요약</h3>
                <p>좌측 여행루트 이미지를 기준으로 도시별 이동 동선과 핵심 포인트 요약이 들어갈 영역입니다.</p>
              </div>
            </div>
          </div>
        )}

        {showRightPanel && mainTab === '일정표' && (
          <div className="right-panel" style={{flexDirection:'column'}}>
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>
            <div className="schedule-right-section">
              <div className="city-tab-buttons">
                <button 
                  className={`city-tab-btn ${selectedCity === '파리' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('파리')}
                >
                  파리
                </button>
                <button 
                  className={`city-tab-btn ${selectedCity === '니스' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('니스')}
                >
                  니스
                </button>
                <button 
                  className={`city-tab-btn ${selectedCity === '루베른' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('루베른')}
                >
                  루베른
                </button>
                <button 
                  className={`city-tab-btn ${selectedCity === '인터라겐' ? 'active' : ''}`}
                  onClick={() => setSelectedCity('인터라겐')}
                >
                  인터라겐
                </button>
              </div>
              {/* RestSchedulePage 일정표 탭 우측 요약 카드와 동일한 구조 */}
              <div className="right-tab-content schedule-summary-content">
                <div className="summary-card">
                  <div className="summary-header">
                    <div className="summary-main-tabs">
                      {['가이드투어','입장/체험','공연/경기','식사/카페','스냅촬영','쇼핑'].map(label => (
                        <button
                          key={label}
                          className={`summary-main-tab ${summaryMainTab === label ? 'active' : ''}`}
                          onClick={() => setSummaryMainTab(label as typeof summaryMainTab)}
                        >
                          {label}
                        </button>
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
                          // TODO: 담기 동작 필요 시 구현
                        }}
                      >
                        담기
                      </button>
                      <button
                        className="cost-schedule-btn"
                        onClick={() => {
                          navigate('/counsel/tour/hotel', { state: stateProps });
                          window.scrollTo(0, 0);
                        }}
                      >
                        호텔바로가기
                      </button>
                    </div>
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

export default SchedulePage;
