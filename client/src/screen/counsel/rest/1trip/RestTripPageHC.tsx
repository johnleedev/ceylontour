import React, { useState, useEffect } from 'react';
import './RestTripPage.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate } from 'react-router-dom';
import Image_bali from '../../../lastimages/counselrest/trip/image.png';
import Image_phuket from '../../../lastimages/counselrest/trip/image-1.png';
import Image_guam from '../../../lastimages/counselrest/trip/image-2.png';
import Image_maldives from '../../../lastimages/counselrest/trip/image-3.png';
import Image_nhatrang from '../../../lastimages/counselrest/trip/image-4.png';
import Image_hawaii from '../../../lastimages/counselrest/trip/image-5.png';
import Image_dubai from '../../../lastimages/counselrest/trip/image-6.png';
import Image_france from '../../../lastimages/counselrest/trip/image-7.png';
import Image_ireland from '../../../lastimages/counselrest/trip/image-8.png';
import Image_thailand from '../../../lastimages/counselrest/trip/image-9.png';
import Image_vietnam from '../../../lastimages/counselrest/trip/image-10.png';
import Image_aus from '../../../lastimages/counselrest/trip/image-11.png';
import Image_morisus from '../../../lastimages/counselrest/trip/mapimage.png';
import DetailMapImage from '../../../lastimages/counselrest/trip/detailmap.jpg';
import WorldMapImage from '../../../images/counsel/worldmap.jpg';


interface Destination {
  id: string;
  name: string;
  image: string;
  selected: boolean;
  departure: string[];
  airTime: string;
  scheduleCount: number;
  rawData?: any;
}


export default function RestTripPageHC () {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'highlight' | 'entry'>('info');
  const [isSingleCity, setIsSingleCity] = useState(true);
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isDetailMapOpen, setIsDetailMapOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'recommend' | 'create'>('recommend');

  // 나라 데이터
  const nations = [
    { id: 1, name: '발리', image: Image_bali, airTime: '6시간', imageClass: 'image', textClass: 'text-wrapper-21', elementClass: 'element-3', departureClass: 'text-wrapper-7' },
    { id: 2, name: '푸켓', image: Image_phuket, airTime: '7시간', imageClass: 'image-2', textClass: 'text-wrapper-22', elementClass: 'element-4', departureClass: 'text-wrapper-8' },
    { id: 3, name: '괌', image: Image_guam, airTime: '7시간', imageClass: 'image-3', textClass: 'text-wrapper-23', elementClass: 'element-5', departureClass: 'text-wrapper-9' },
    { id: 4, name: '몰디브', image: Image_maldives, airTime: '13시간', imageClass: 'image-4', textClass: 'text-wrapper-24', elementClass: 'element-6', departureClass: 'text-wrapper-10' },
    { id: 5, name: '카오락', image:  Image_thailand, airTime: '13시간', imageClass: 'image-5', textClass: 'text-wrapper-25', elementClass: 'element-7', departureClass: 'text-wrapper-11' },
    { id: 6, name: '모리셔스', image: Image_aus, airTime: '13시간', imageClass: 'image-6', textClass: 'text-wrapper-26', elementClass: 'element-8', departureClass: 'text-wrapper-12' },
    { id: 7, name: '칸쿤', image: Image_nhatrang, airTime: '12시간', imageClass: 'image-7', textClass: 'text-wrapper-27', elementClass: 'element-9', departureClass: 'text-wrapper-13' },
    { id: 8, name: '나트랑', image: Image_hawaii, airTime: '12시간', imageClass: 'image-8', textClass: 'text-wrapper-28', elementClass: 'element-10', departureClass: 'text-wrapper-14' },
    { id: 9, name: '두바이', image: Image_dubai, airTime: '12시간', imageClass: 'image-9', textClass: 'text-wrapper-29', elementClass: 'element-11', departureClass: 'text-wrapper-15' },
    { id: 10, name: '사무이', image: Image_france, airTime: '8시간 30분', imageClass: 'image-10', textClass: 'text-wrapper-30', elementClass: 'element-12', departureClass: 'text-wrapper-16' },
    { id: 11, name: '하와이', image: Image_ireland, airTime: '8시간 30분', imageClass: 'image-11', textClass: 'text-wrapper-31', elementClass: 'element-13', departureClass: 'text-wrapper-17' },
    { id: 12, name: '푸꾸옥', image: Image_vietnam, airTime: '8시간 30분', imageClass: 'image-12', textClass: 'text-wrapper-32', elementClass: 'element-14', departureClass: 'text-wrapper-18' },
  ];

  const highlightItems = [
    { id: 1, title: '포토스팟에서 인생샷', image: Image_bali },
    { id: 2, title: '일출보기 투어', image: Image_phuket },
    { id: 3, title: '우붓 명소 맞춤 투어', image: Image_guam },
    { id: 4, title: '우붓 정글탐험', image: Image_maldives },
  ];

  const locationType = '휴양지'
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${AdminURL}/ceylontour/getnationlist/${locationType}`);
      
      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();

     
      // API 응답 데이터를 Destination 형식으로 변환
      const formattedDestinations: Destination[] = Array.isArray(data) 
        ? data
            .filter((item: any) => {
              // isView가 'true'이고 schedule이 존재하며 빈 배열이 아닌 것만 필터링
              return item.isView === 'true' && 
                     item.schedule && 
                     Array.isArray(item.schedule) && 
                     item.schedule.length > 0;
            })
            .map((item: any) => {
              // inputImage 파싱 (JSON 배열 문자열)
              let imageUrl = require('../../../lastimages/nations/img_aus.png'); // 기본 이미지
              try {
                const images = JSON.parse(item.inputImage || '[]');
                if (Array.isArray(images) && images.length > 0 && images[0]) {
                  imageUrl = images[0];
                }
              } catch (e) {
                // 파싱 실패 시 기본 이미지 사용
              }

              // schedule 개수 계산
              const scheduleCount = Array.isArray(item.schedule) ? item.schedule.length : 0;

              return {
                id: String(item.id),
                name: item.nationKo || '',
                image: imageUrl,
                selected: false,
                departure: ['인천', '김포'], // API에 없으므로 기본값
                airTime: '7시간 30분', // API에 없으므로 기본값
                scheduleCount: scheduleCount,
                rawData: item // 원본 데이터 저장
              };
            })
        : [];
      

    } catch (error) {
      console.error('나라 리스트를 가져오는 중 오류 발생:', error);
      // 에러 발생 시 빈 배열 설정
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
  }, []);



    



  return (
    <div className="trip-page-wrapper">
      <div className={`trip-container ${selectedNation ? 'detail-open' : ''}`}>
        {/* 왼쪽 영역: 헤더 + 나라 리스트 */}
        <div className="left-section">
          {/* 헤더 영역 */}
          <div className="trip-header">
            <div className="header-buttons">
              <button 
                className={`btn-tap ${activeButton === 'recommend' ? 'active' : ''}`}
                onClick={() => setActiveButton('recommend')}
              >
                추천일정
              </button>
              <button 
                className={`btn-tap ${activeButton === 'create' ? 'active' : ''}`}
                onClick={() => setActiveButton('create')}
              >
                일정만들기
              </button>
            </div>
            <div className="header-filters">
              <div className="filter-left">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isSingleCity}
                    onChange={(e) => {
                      setIsSingleCity(e.target.checked);
                      if (e.target.checked) setIsMultiCity(false);
                    }}
                  />
                  <span className="filter-item">싱글시티</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isMultiCity}
                    onChange={(e) => {
                      setIsMultiCity(e.target.checked);
                      if (e.target.checked) setIsSingleCity(false);
                    }}
                  />
                  <span className="filter-item">멀티시티</span>
                </label>
              </div>
              <div className="filter-right">
                <button
                  type="button"
                  className="worldmap-button"
                  onClick={() => setIsWorldMapOpen(true)}
                >
                  세계지도 보기
                </button>
              </div>
            </div>
          </div>

          {/* 나라 리스트 */}
          <div className="nation-list-section">
            <div className="nation-grid">
              {nations.map((nation) => (
                <div 
                  key={nation.id} 
                  className={`nation-card ${selectedNation === nation.name ? 'selected' : ''}`}
                  onClick={() =>
                    setSelectedNation(
                      selectedNation === nation.name ? null : nation.name
                    )
                  }
                >
                  <div className="nation-image-container">
                    <img className={nation.imageClass} alt={nation.name} src={nation.image} />
                  </div>
                  <div className="nation-info">
                    <div className='nation-name'>{nation.name}</div>
                    <p className='nation-airTime'>
                      <span className="text-wrapper-airtime-label">비행시간 약 </span>
                      <span className="text-wrapper-airtime-value">{nation.airTime}</span>
                    </p>
                    <div className='nation-departure'>인천출발ㅣ부산출발</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 상세 정보 */}
        {selectedNation && (
          <div className="right-section">
            <div className="detail-section">
          <div className="detail-card">
            <div className="detail-header">
              <h2 className="detail-title">발리</h2>
              <div className="detail-subtitle">신들의 휴양지</div>
              {/* <p className="detail-description">
                에메랄드빛 바다와 신비로운 사원이 어우러진 휴양지, 발리.
                <br />
                자연과 예술, 힐링이 함께하는 천상의 섬으로 특별한 여행을 선사합니다.
              </p> */}
            </div>

            <div className="detail-tabs">
              <div className="tab-container">
                <div className="tab-left">
                  <button
                    type="button"
                    className={`tab-button text-wrapper-tab-info ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    기본정보
                  </button>
                  <button
                    type="button"
                    className={`tab-button text-wrapper-tab-highlight ${activeTab === 'highlight' ? 'active' : ''}`}
                    onClick={() => setActiveTab('highlight')}
                  >
                    하이라이트
                  </button>
                  <button
                    type="button"
                    className={`tab-button text-wrapper-tab-entry ${activeTab === 'entry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entry')}
                  >
                    입출국 안내
                  </button>
                  <button
                    type="button"
                    className="tab-button text-wrapper-tab-map"
                    onClick={() => setIsDetailMapOpen(true)}
                  >
                    상세지도
                  </button>
                </div>
                <button type="button" className="tab-product-button"
                  onClick={() => navigate(`/counsel/rest/hotel`)}
                >
                  상품보기
                </button>
              </div>
            </div>

           

         

            <div className="detail-content">
              {activeTab === 'info' && (
                <>
                  <div className="detail-main-image">
                    <img className="image-detail-main" alt="Image" src={Image_morisus} />
                  </div>
                  <div className="detail-info-grid">
                    <div className="info-item">
                      <div className="info-label">시차</div>
                      <div className="info-value">
                        <span className="info-strong">-1시간</span>
                        <span className="info-sub"> (한국: 3시 → 발리: 2시)</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">비자</div>
                      <div className="info-value">
                        도착비자 (VOS : Visa On Arrival) : $ 35
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">언어</div>
                      <div className="info-value">인도네시아어, 발리어</div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">로밍</div>
                      <div className="info-value">
                        국내 로밍서비스 이용, 현지 유심 이용, 호텔 내 와이파이
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">화폐</div>
                      <div className="info-value">
                        화폐단위는 루피아(RP) / 1루피아 = 약 1,000원
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">팁매너</div>
                      <div className="info-value">
                        호텔 내 매너팁 U$2, 스파/마사지 1시간 당 U$2 (1인)
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">전압</div>
                      <div className="info-value">220V</div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">날씨</div>
                      <div className="info-value info-multiline">
                        발리의 1년 평균기온은 24~34℃ 정도의 고온다습한 열대몬순 기후이다.
                        <br />
                        건기는 4월~9월, 우기는 10월~3월이지만 스콜이 한두 번 지나가는 정도이고
                        쾌적하고 휴양하기 좋은 시기이다.
                        <br />
                        ※ 자외선 차단제 (선크림 등) 꼭 준비해야 함.
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-label">주의사항</div>
                      <div className="info-multiline">
                        <p className="info-text">주의사항에 대해서 적는 곳입니다.</p>
                        <p className="info-text">
                          주의사항에 대해서 적는 곳입니다. 주의사항에 대해서 적는 곳입니다.
                        </p>
                        <p className="info-text">주의사항에 대해서 적는 곳입니다.</p>
                        <p className="info-text">주의사항에 대해서 적는 곳입니다.</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="detail-button"
                    onClick={() => navigate(`/counsel/rest/hotel`)}
                  >
                    <div className="group-product-button">
                      <div className="rectangle-product-button" />
                      <div className="text-wrapper-product-button">상품보기</div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'entry' && (
                <div className="entry-guide">
                  <div className="entry-section">
                    <div className="entry-row">
                      <div className="entry-label">공항</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">비행시간</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">시차</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>
                  <div className="entry-section">
                    <div className="entry-section-title">입국 전 준비사항</div>
                    <div className="entry-row">
                      <div className="entry-label">여권</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">비자</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">백신/건강</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">사전 입출국 신청방법</div>
                    <div className="entry-row">
                      <div className="entry-label">비자</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">입국신고서</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">검역신고</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">세관신고</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">현지 입국 절차</div>
                    <div className="entry-row">
                      <div className="entry-label">입국심사/검역</div>
                      <div className="entry-value">
                        입국심사 / 세관신고서 작성 (한국인/기내/입국장)
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">입국장 동선</div>
                      <div className="entry-value">
                        입국심사 후 수하물 찾기 → 세관검사 → 출구
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">수하물 수령</div>
                      <div className="entry-value">
                        현지 입국 안내 오디오 또는 가이드 안내에 따라 이동
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">현지 가이드 미팅</div>
                      <div className="entry-value">
                        입국장으로 나와 가이드 미팅 후 이동
                      </div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">세관신고 면세범위</div>
                    <div className="entry-row">
                      <div className="entry-label">주류</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">담배</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">현금</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">중요서류 등</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">귀국 절차</div>
                    <div className="entry-row">
                      <div className="entry-label">탑승수속, 출국심사</div>
                      <div className="entry-value">
                        출국시간 2시간~3시간 전 공항 도착 후 진행
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">면세 환급</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">휴대품 신고</div>
                      <div className="entry-value">
                        입국 시 800달러, 주류 1병, 담배 200개비, 향수 60ml
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'highlight' && (
                <div className="highlight-grid">
                  {highlightItems.map((item) => (
                    <div key={item.id} className="highlight-card">
                      <div className="highlight-image-wrap">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="highlight-title">{item.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
        )}
      </div>

      {isWorldMapOpen && (
        <div
          className="worldmap-modal-overlay"
          onClick={() => setIsWorldMapOpen(false)}
        >
          <div
            className="worldmap-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="worldmap-close"
              onClick={() => setIsWorldMapOpen(false)}
            >
              ×
            </button>
            <img src={WorldMapImage} alt="세계 지도" />
          </div>
        </div>
      )}

      {isDetailMapOpen && (
        <div
          className="worldmap-modal-overlay"
          onClick={() => setIsDetailMapOpen(false)}
        >
          <div
            className="worldmap-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="worldmap-close"
              onClick={() => setIsDetailMapOpen(false)}
            >
              ×
            </button>
            <img src={DetailMapImage} alt="상세 지도" />
          </div>
        </div>
      )}
    </div>
  );
};


