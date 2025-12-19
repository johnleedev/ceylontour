import React from 'react';
import './EuropeScheduleCustom.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle565 from '../../../lastimages/counselrest/hotel/detail/rectangle-565.png';
import rectangle76 from '../../../lastimages/counselrest/hotel/detail/rectangle-76.png';
import rectangle582 from '../../../lastimages/counselrest/hotel/detail/rectangle-582.png';
import rectangle584 from '../../../lastimages/counselrest/hotel/detail/rectangle-584.png';
import rectangle581 from '../../../lastimages/counselrest/hotel/detail/rectangle-581.png';
import rectangle665 from '../../../lastimages/counselrest/hotel/detail/rectangle-665.png';
import rectangle664 from '../../../lastimages/counselrest/hotel/detail/rectangle-664.png';
import rectangle585 from '../../../lastimages/counselrest/hotel/detail/rectangle-585.png';
import rectangle663 from '../../../lastimages/counselrest/hotel/detail/rectangle-663.png';
import rectangle580 from '../../../lastimages/counselrest/hotel/detail/rectangle-580.png';
import rectangle662 from '../../../lastimages/counselrest/hotel/detail/rectangle-662.png';
import rectangle661 from '../../../lastimages/counselrest/hotel/detail/rectangle-661.png';
import rectangle619 from '../../../lastimages/counselrest/hotel/detail/rectangle-619.png';
import rectangle600 from '../../../lastimages/counselrest/hotel/detail/rectangle-600.png';
import rectangle601 from '../../../lastimages/counselrest/hotel/detail/rectangle-601.png';
import rectangle673 from '../../../lastimages/counselrest/hotel/detail/rectangle-673.png';
import rectangle674 from '../../../lastimages/counselrest/hotel/detail/rectangle-674.png';
import rectangle675 from '../../../lastimages/counselrest/hotel/detail/rectangle-675.png';
import rectangle676 from '../../../lastimages/counselrest/hotel/detail/rectangle-676.png';
import rectangle677 from '../../../lastimages/counselrest/hotel/detail/rectangle-677.png';
import vector105 from '../../../lastimages/counselrest/hotel/detail/vector-105.svg';
import reviewimage from '../../../lastimages/counselrest/hotel/detail/review.png';
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { recoilSelectedScheduleData } from '../../../../RecoilStore';

// 일정표 우측 패널 카드용 이미지 (투어 전용)
import scheduleImg1 from '../../../lastimages/counseltour/schedule/image1.png';
import scheduleImg2 from '../../../lastimages/counseltour/schedule/image2.png';
import scheduleImg3 from '../../../lastimages/counseltour/schedule/image3.png';
import scheduleImg4 from '../../../lastimages/counseltour/schedule/image4.png';


export default function EuropeScheduleCustom() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;

  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);


  // 선택된 나라의 관련 여행상품(일정) 조회
  const fetchNationProducts = async (nationCopy:string) => {
    try {
      const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city: 'seoul' });
      if (response.data) {
        const copy = [...response.data];
        console.log('copy', copy);
        setProducts(copy);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('나라별 여행상품을 가져오는 중 오류 발생:', error);
      setProducts([]);
    }
  };

  const divWrappers = [
    { text: '#누사두아 최고급리조트' },
    { text: '#버틀러 서비스' },
    { text: '#프라이빗 비치' },
    { text: '#허니문' },
    { text: '#가족 모두 만족도 1위급' },
  ];

  const btnSolids = [
    { text: '전경' },
    { text: '객실' },
    { text: '부대시설' }
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [showRightPanel, setShowRightPanel] = React.useState(false);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [summaryMainTab, setSummaryMainTab] = React.useState<
    '가이드투어' | '입장/체험' | '공연/경기' | '식사/카페' | '스냅촬영' | '쇼핑'
  >('가이드투어');
  const [selectedSchedule, setSelectedSchedule] = React.useState<any | null>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = React.useState<number>(0);
  const setSelectedScheduleData = useSetRecoilState(recoilSelectedScheduleData);

  // stateProps에서 선택된 도시 목록 추출
  useEffect(() => {
    if (stateProps?.selectedCities && stateProps.selectedCities.length > 0) {
      setSelectedCity(stateProps.selectedCities[0]);
    }
  }, [stateProps]);

  useEffect(() => {
    console.log('TourScheduleCustom stateProps:', stateProps);
    
    // stateProps에서 호텔 정보가 있으면 설정
    if (stateProps?.hotelInfo) {
      setHotelInfo(stateProps.hotelInfo);
      setLoading(false);
    } else {
      // 호텔 정보가 없어도 페이지는 렌더링하도록
      setLoading(false);
    }
  }, [stateProps]);

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    // setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 로딩 중일 때는 기본 레이아웃 표시
  if (loading) {
    return (
      <div className="TourScheduleCustom">
        <div className="loading-message">로딩 중...</div>
      </div>
    );
  }

  // 호텔 정보가 없어도 기본 레이아웃은 표시
  // hotelInfo가 null일 수 있으므로 옵셔널 체이닝 사용

  // MORNING 섹션의 베네핏 옵션 데이터
  const morningBenefitOptions = [
    {
      type: 'main',
      label: '메인제안',
      optionImage: rectangle600,
      optionImageAlt: '레스토랑 점심',
      firstTitle: '리조트 내 레스토랑 점심',
      scheduleImage: rectangle601,
      scheduleImageAlt: '아침 루틴 1',
      secondTitle: '메뉴 예시, 분위기 설명',
    },
    {
      type: 'select',
      label: '선택 옵션',
      optionImage: rectangle673,
      optionImageAlt: '룸서비스 런치',
      firstTitle: '룸서비스 런치',
      scheduleImage: rectangle674,
      scheduleImageAlt: '아침 루틴 2',
      secondTitle: '주변 유명 맛집 픽업 포함(고객 선택 시 추가 요금)',
    },
  ];

  // LUNCH 섹션의 경험 아이템 데이터
  const experienceItems = [
    {
      image: rectangle675,
      imageAlt: '핵심 경험 1',
      title: '스파 60~90min',
    },
    {
      image: rectangle676,
      imageAlt: '핵심 경험 2',
      title: '시그니처 트리트먼트 설명',
    },
    {
      image: rectangle677,
      imageAlt: '핵심 경험 3',
      title: '프라이빗 풀빌라 투숙 시 에프터눈 티 서빙',
    },
  ];

  // 현재 탭에 따른 이미지 리스트 (전경 / 객실 / 부대시설)
  const getCurrentImages = () => {
    if (activeTab === 0) return imageAllView; // 전경
    if (activeTab === 1) return imageRoomView; // 객실
    return imageEtcView; // 수영장/다이닝/기타 → 부대시설 이미지 공통 사용
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  const highlightItems = [
    { image: rectangle661, title: '초럭셔리 체험' },
    { image: rectangle662, title: '버틀러 시스템' },
    { image: rectangle663, title: '프라이빗 비치' },
    { image: rectangle664, title: '턴다운 서비스' },
    { image: rectangle665, title: '허니문 인기' },
  ];

  const benefitItems = [
    {
      title: '초럭셔리 체험',
      text: '세계적 평가의 St. Regis 브랜드 & 발리 최고급 서비스',
      image: rectangle76,
    },
    {
      title: '버틀러 시스템',
      text: '짐 언패킹, 패킹, 커피/티 서비스 예약대행',
      image: rectangle78,
    },
    {
      title: '턴다운 서비스',
      text: '매일 밤 방을 편안하게 정리해주는 감동 포인트',
      image: rectangle76,
    },
    {
      title: '프라이빗 비치',
      text: '게이티드 누사두아의 조용하고 품격 높은 해변',
      image: rectangle619,
    },
  ];

  const reviewItems = [
    {
      id: 1,
      title: '후기제목을 적는 곳입니다',
      rating: 5.0,
      image: reviewimage,
      text: `발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
설비를 갖춘 다섯 성급 리조트입니다.
전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
열자마자 행복....`
    },
    {
      id: 2,
      title: '후기제목을 적는 곳입니다',
      rating: 5.0,
      image: reviewimage,
      text: `발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
설비를 갖춘 다섯 성급 리조트입니다.
전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
열자마자 행복....`
    },
  ];

  return (
    <div className="TourScheduleCustom">
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

      <div className={`hotel-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 왼쪽 영역: 기존 내용 */}
        <div className="left-section">
          <div className="custom-center-wrapper">
            <div className="custom-title-wrapper">
              <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <div className="custom-title">
                <div className="text-title">{hotelInfo?.hotelNameKo || '일정 커스터마이징'}</div>
                <div className="text-subtitle">
                  {hotelInfo?.hotelNameEn || (stateProps?.selectedCities?.join(', ') || '')}
                </div>
                {hotelInfo && (
                <RatingBoard
                  rating={
                    hotelInfo && (hotelInfo.tripAdviser || hotelInfo.customerScore)
                      ? parseFloat(hotelInfo.tripAdviser || hotelInfo.customerScore)
                      : 0
                  }
                />
                )}

                <div className="text-location">
                  {hotelInfo ? (
                    <>
                  <p>{hotelInfo?.nation || ''}</p>
                  <IoIosArrowForward />
                  <p>{hotelInfo?.city || ''}</p>
                    </>
                  ) : (
                    <>
                      <p>선택된 도시: {stateProps?.selectedCities?.join(', ') || '없음'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="tag-wrapper-container">
              {divWrappers.map(({ text }, index) => (
                <div key={index} className="tag-wrapper">
                  <div>{text}</div>
                </div>
              ))}
            </div> */}

            <div className="room-container-wrapper">
              <div className="room-container-left">
                {btnSolids.map(({ text }, index) => (
                  <button
                    key={text}
                    type="button"
                    className={`roomtabsort ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <div className="room-container-right">
                {roomTypes.map((room: any, index: number) => (
                  <React.Fragment key={room.roomTypeName || index}>
                    <span className="roomtype-text">{room.roomTypeName}</span>
                    {index < roomTypes.length - 1 && (
                      <span className="roomtype-separator"></span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="photo-gallery">
              <div className="photo-main">
                {(() => {
                  const images = getCurrentImages();
                  if (images && images.length > 0) {
                    const main = images[selectedMainImageIndex];
                    const isVideo = isVideoFile(main.imageName);
                    
                    if (isVideo) {
                      return (
                        <video
                          className="photo-main-image"
                          controls
                          src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                        >
                          브라우저가 비디오 태그를 지원하지 않습니다.
                        </video>
                      );
                    }
                    
                    return (
                      <img
                        className="photo-main-image"
                        alt={main.title || '메인 이미지'}
                        src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                      />
                    );
                  }
                  return (
                    <img
                      className="photo-main-image"
                      alt="메인 이미지"
                      src={rectangle580}
                    />
                  );
                })()}
              </div>

              <div className="photo-thumbnails">
                {getCurrentImages().map((img: any, index: number) => {
                  const isVideo = isVideoFile(img.imageName);
                  return (
                    <div
                      className={`photo-thumbnail ${selectedMainImageIndex === index ? 'active' : ''} ${isVideo ? 'video-thumbnail' : ''}`}
                      key={index}
                      onClick={() => setSelectedMainImageIndex(index)}
                    >
                      {isVideo ? (
                        <div className="thumbnail-video-wrapper">
                          <video
                            className="thumbnail-video"
                            src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                            muted
                            preload="metadata"
                          />
                          <div className="video-play-icon">▶</div>
                        </div>
                      ) : (
                        <img
                          src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                          alt={img.title || `썸네일 ${index + 1}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="location-info">
              <div className="section-titlebox">
                <span className="location-title">호텔위치</span>
                <span className="text-wrapper-11">호텔 위치 보기</span>
              </div>

              <p className="text-wrapper-10">
                {hotelInfo?.hotelAddress || ''}
              </p>

              <div className="flexcontainer">
                <p className="text">
                  <span className="span">누사두아 게이티드 지역의 고급 라인업</span>
                </p>

                <p className="text">
                  <span className="span">공항 → 20~25분</span>
                </p>

                <p className="text">
                  <span className="span">발리 컬렉션 쇼핑센터 → 차량 5분</span>
                </p>

                <p className="text">
                  <span className="span">
                    주변: 무려프 비치클럽·워터블로우·BTDC 산책로
                  </span>
                </p>
              </div>
            </div>

            <div className="highlight-section">
              <div className="highlight-title">핵심 포인트</div>
              <div className="highlight-list">
                {highlightItems.map(({ image, title }) => (
                  <div className="highlight-item" key={title}>
                    <div className="highlight-image-wrap">
                      <img src={image} alt={title} />
                    </div>
                    <div className="highlight-item-title">{title}</div>
                    <div className="highlight-item-desc">
                      세계적 평가의 St. Regis 브랜드 &amp; 발리 최고급 서비스
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`benefit-section`}>
              <div className="div-wrapper">
                <div className="text-wrapper">베네핏 포함사항</div>
              </div>
      
              <div className="benefit-items">
                {benefitItems.map(({ title, text, image }, index) => (
                  <div key={title} className="benefit-item">
                    <img className="rectangle" alt="Rectangle" src={image} />
                    <div className={`benefit-card benefit-card-${index + 1}`}>
                      <div className="benefit-title">{title}</div>
                      <div className="benefit-text">{text}</div>
                    </div>
                    <div className={`benefit-ribbon benefit-ribbon-${index + 1}`}>
                      실론투어
                      <br />
                      단독특전2
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='component'>
              {/* 후기 및 평점 섹션 */}
              <div className="review-section">
                <h2 className="section-title">후기 및 평점</h2>
                
                <div className="review-list">
                  {reviewItems.map((review) => (
                    <div key={review.id} className="review-item">
                      <img className="review-image" alt="후기 이미지" src={review.image} />
                      <div className="review-content">
                        <div className="review-header">
                          <h3 className="review-title">{review.title}</h3>
                          <div className="review-rating">
                            <RatingBoard rating={review.rating} />
                          </div>
                        </div>
                        
                        <p className="review-text">
                          {review.text.split('\n').map((line, index, arr) => (
                            <React.Fragment key={index}>
                              {line}
                              {index < arr.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 여행상품 섹션 */}
              <div className="product-section">
                <h2 className="section-title">여행상품</h2>
                
                <div className="product-list">
                  {products.length === 0 ? (
                    <div className="empty-message">연관된 여행상품이 없습니다.</div>
                  ) : (
                    products.map((product: any) => {
                      // 헤더 텍스트
                      const headerText =
                        product.headerText ||
                        `${product.nation || ''} 추천상품`;
                      
                      // 상품명
                      const productName =
                        product.productName ||
                        product.scheduleName ||
                        product.hotelNameKo ||
                        '';
                      
                      // 기간 정보 (tourPeriodData 파싱)
                      let periodText = '';
                      if (product.tourPeriodData) {
                        try {
                          const periodData = JSON.parse(product.tourPeriodData);
                          const night = periodData.periodNight || '';
                          const day = periodData.periodDay || '';
                          periodText = `${night} ${day}`.trim();
                        } catch (e) {
                          periodText = '';
                        }
                      }

                      const badgeType = product.badgeType || 'recommend';
                      const badgeText = product.badgeText || '추천상품';

                      return (
                        <div
                          key={product.id}
                          className="product-item"
                          onClick={() => {
                            navigate(`/counsel/rest/hotelcost`, { state : {hotelInfo: hotelInfo, productInfo: product}});
                            window.scrollTo(0, 0);
                          }}
                        >
                          <div className="product-header">
                            <span className="product-header-text">{headerText}</span>
                          </div>
                          <div className="product-content">
                            <p className="product-name">
                              {productName}
                              {periodText && (
                                <span className="product-period">&nbsp;{periodText}</span>
                              )}
                            </p>
                            <div className="product-badge-wrapper">
                              <div className={`product-badge badge-${badgeType}`}>
                                <span>{badgeText}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 일정표 요약 카드 (TourScheduleRecommend와 동일) */}
        {showRightPanel && (
          <div className="right-section" style={{flexDirection:'column'}}>
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
                {stateProps?.selectedCities?.map((city: string) => (
                <button
                    key={city}
                    className={`city-tab-btn ${selectedCity === city ? 'active' : ''}`}
                    onClick={() => setSelectedCity(city)}
                >
                    {city}
                </button>
                ))}
              </div>
              {/* TourScheduleRecommend 일정표 탭 우측 요약 카드와 동일한 구조 */}
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
                          if (!selectedSchedule) {
                            alert('항공편을 선택해주세요.');
                            return;
                          }

                          // 선택된 항공편의 일정 정보 추출
                          const airlineData = selectedSchedule.airlineData;
                          const scheduleDetailData = selectedSchedule.scheduleDetailData || [];

                          setSelectedScheduleData({
                            productInfo: {
                              id: stateProps?.id,
                              productName: stateProps?.productName,
                              scheduleSort: stateProps?.scheduleSort,
                              costType: stateProps?.costType,
                              tourPeriodData: stateProps?.tourPeriodData,
                              includeNote: stateProps?.includeNote,
                              notIncludeNote: stateProps?.notIncludeNote,
                              productScheduleData: stateProps?.productScheduleData
                            },
                            scheduleDetails: {
                              airlineData: airlineData,
                              scheduleList: [selectedSchedule],
                              selectedIndex: selectedScheduleIndex
                            },
                            selectedSchedule: selectedSchedule,
                            selectedItems: [],
                            totalPrice: 100000,
                            guestCount: 2
                          });
                          alert('일정이 담겼습니다.');
                        }}
                      >
                        일정담기
                      </button>
                      <button
                        className="cost-schedule-btn"
                        onClick={() => {
                          navigate('/counsel/europe/hotel', { state: stateProps });
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

