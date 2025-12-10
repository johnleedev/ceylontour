import React from 'react';
import './TourScheduleCustom.scss';
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
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';


export default function TourScheduleCustom() {
  const navigate = useNavigate();
  const location = useLocation();
  // const stateProps = location.state;


  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);


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

  useEffect(() => {
    
  }, []);

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    // setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!hotelInfo) {
    return null;
  }

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
                <div className="text-title">{hotelInfo?.hotelNameKo || '호텔명'}</div>
                <div className="text-subtitle">
                  {hotelInfo?.hotelNameEn || ''}
                </div>
                <RatingBoard
                  rating={
                    hotelInfo && (hotelInfo.tripAdviser || hotelInfo.customerScore)
                      ? parseFloat(hotelInfo.tripAdviser || hotelInfo.customerScore)
                      : 0
                  }
                />

                <div className="text-location">
                  <p>{hotelInfo?.nation || ''}</p>
                  <IoIosArrowForward />
                  <p>{hotelInfo?.city || ''}</p>
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

        {/* 오른쪽 영역: 실론투어 베네핏 및 하루 일정 */}
        {showRightPanel && (
          <div className="right-section">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>

            {/* 탭 컨테이너 */}
            <div className="right-tab-container">
              <div className="right-tab-left">
                <button
                  type="button"
                  className={`right-tab-button right-tab-schedule ${activeRightTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('schedule')}
                >
                  이호텔에서의 하루
                </button>
                <button
                  type="button"
                  className={`right-tab-button right-tab-benefit ${activeRightTab === 'benefit' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('benefit')}
                >
                  실론투어 베네핏
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="right-tab-content">
              {activeRightTab === 'benefit' && (
                <div className="benefit-card-section">
                  {/* 실론투어 베네핏 탭은 현재 별도 콘텐츠 없음 */}
                </div>
              )}

              {activeRightTab === 'schedule' && (
                <div className="daily-schedule-section">
                  {/* MORNING 섹션 */}
                  <div className="schedule-time-block morning-block">
                    <div className="time-header">
                      <span className="time-label">MORNING</span>
                      <span className="time-range">— 아침 루틴 (08:00~11:00)</span>
                    </div>

                    {/* 실론투어 베네핏 옵션 */}
                    <div className="benefit-options">
                      {morningBenefitOptions.map((option, index) => (
                        <React.Fragment key={index}>
                          <div className={`benefit-option ${option.type}-option`}>
                            <div className="option-label">{option.label}</div>
                            <img 
                              className="option-image" 
                              alt={option.optionImageAlt} 
                              src={option.optionImage} 
                            />
                            <div className="option-content">
                              <div className="option-title">{option.firstTitle}</div>
                            </div>
                            <img 
                              className="schedule-image" 
                              alt={option.scheduleImageAlt} 
                              src={option.scheduleImage} 
                            />
                            <div className="option-content">
                              <div className="option-title">{option.secondTitle}</div>
                            </div>
                          </div>

                          {index === 0 && (
                            <div className="tip-box">
                              <div className="tip-icon">
                                <img alt="Tip" src={vector105} />
                              </div>
                              <div className="tip-content">
                                <span className="tip-label">TIP</span>
                                <p className="tip-text">
                                  &quot;점심 이후 바로 스파 이동 → 동선 최소화&quot;
                                </p>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* LUNCH 섹션 */}
                  <div className="schedule-time-block lunch-block">
                    <div className="time-header">
                      <span className="time-label">LUNCH</span>
                      <span className="time-range">— 점심 (11:30~13:30)</span>
                    </div>

                    {/* 핵심 경험 섹션 */}
                    <div className="experience-section">
                      <div className="experience-label">핵심 경험</div>
                      <div className="experience-images">
                        {experienceItems.map((item, index) => (
                          <React.Fragment key={index}>
                            <img 
                              className="experience-image" 
                              alt={item.imageAlt} 
                              src={item.image} 
                            />
                            <div className="experience-item">
                              <div className="experience-title">{item.title}</div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

