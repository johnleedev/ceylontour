import React from 'react';
import './EuropeCityDetail.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle76 from '../../../lastimages/counselrest/hotel/detail/rectangle-76.png';
import rectangle665 from '../../../lastimages/counselrest/hotel/detail/rectangle-665.png';
import rectangle664 from '../../../lastimages/counselrest/hotel/detail/rectangle-664.png';
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
import reviewimage from '../../../lastimages/counselrest/hotel/detail/review.png';
import RatingBoard from '../../../common/RatingBoard';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import Image_morisus from '../../../lastimages/counselrest/trip/mapimage.png';
import GoogleMap from '../../../common/GoogleMap';


export default function EuropeCityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ID = queryParams.get("id");
  const NATION = queryParams.get("nation");

  const [cityInfo, setCityInfo] = React.useState<any | null>(null);
  const [imageNotice, setImageNotice] = React.useState<any[]>([]); // 소개
  const [imageGuide, setImageGuide] = React.useState<any[]>([]); // 가이드투어
  const [imageEnt, setImageEnt] = React.useState<any[]>([]); // 입장/체험
  const [imageEvent, setImageEvent] = React.useState<any[]>([]); // 경기/공연
  const [imageCafe, setImageCafe] = React.useState<any[]>([]); // 레스토랑/카페
  const [products, setProducts] = React.useState<any[]>([]);



  useEffect(() => {
    const fetchHotelInfo = async () => {
      if (!ID) return;
      
      try {
        const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${ID}`);
        if (res.data) {
          const copy = [...res.data][0];
          setCityInfo(copy);
        } else {
          setCityInfo(null);
        }
        const response = await axios.get(`${AdminURL}/ceylontour/getschedulenation/${NATION}`);
        if (response.data) {
          const copy = [...response.data];
          setProducts(copy);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('나라별 여행상품을 가져오는 중 오류 발생:', error);
        setCityInfo(null);
        setProducts([]);
      }
    };

    fetchHotelInfo();
  }, [ID, NATION]);

  // schedule 데이터 파싱 및 그룹화 (도시 기준, EuropeTripPage와 동일한 로직)
  const getGroupedSchedules = () => {
    // 국가명을 사용 (EuropeTripPage와 동일하게 selectedCity 대신 nationName 사용)
    const selectedNation = cityInfo?.nation || '';
    if (!selectedNation || !products || products.length === 0) return {};

    const schedules = products.map((item: any) => {
      let nations: string[] = [];
      try {
        nations = JSON.parse(item.nation || '[]');
      } catch (e) {
        nations = [];
      }

      let periodData = { periodNight: '', periodDay: '' };
      try {
        periodData = JSON.parse(item.tourPeriodData || '{}');
      } catch (e) {
        periodData = { periodNight: '', periodDay: '' };
      }

      return {
        id: item.id || 0,
        nation: nations,
        tourPeriodData: periodData,
        tourmapImage: item.tourmapImage || '',
        productScheduleData: item.productScheduleData || '',
        productName: item.productName || ''
      };
    });

    // 필터링 (EuropeTripPage와 동일한 로직)
    let filtered = schedules;
    
    // 검색 필터
    if (scheduleSearch.trim()) {
      filtered = filtered.filter((s: any) => 
        s.productName.toLowerCase().includes(scheduleSearch.toLowerCase())
      );
    }

    // 탭 필터 (EuropeTripPage와 동일한 로직, 국가명으로 비교)
    if (!selectedNation) return {};
    
    if (scheduleFilter.includes('온니')) {
      filtered = filtered.filter((s: any) => s.nation.length === 1 && s.nation[0] === selectedNation);
    } else if (scheduleFilter.includes('외 1개국')) {
      filtered = filtered.filter((s: any) => s.nation.length === 2 && s.nation.includes(selectedNation));
    } else if (scheduleFilter.includes('외 2개국')) {
      filtered = filtered.filter((s: any) => s.nation.length === 3 && s.nation.includes(selectedNation));
    } else if (scheduleFilter.includes('외 3개국')) {
      filtered = filtered.filter((s: any) => s.nation.length === 4 && s.nation.includes(selectedNation));
    }

    // 그룹화 (nation 배열을 기준으로, EuropeTripPage와 동일)
    const grouped: { [key: string]: any[] } = {};
    filtered.forEach((schedule: any) => {
      const key = schedule.nation.join(' + ');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });

    return grouped;
  };

  const btnSolids = [
    { text: '소개' },
    { text: '기본사진' },
    { text: '가이드투어' },
    { text: '입장/체험' },
    { text: '경기/공연' },
    { text: '레스토랑/카페' }
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'info' | 'product'>('info');
  const [showRightPanel, setShowRightPanel] = React.useState(false);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  const [scheduleFilter, setScheduleFilter] = React.useState('전체');
  const [scheduleSearch, setScheduleSearch] = React.useState('');

  useEffect(() => {
    if (cityInfo) {
      
      // 도시 이미지 파싱 (탭별로 분리)
      try {
        const noticeImages = JSON.parse(cityInfo.imageNamesNotice || '[]');
        setImageNotice(Array.isArray(noticeImages) ? noticeImages : []);
      } catch (e) {
        setImageNotice([]);
      }

      try {
        const guideImages = JSON.parse(cityInfo.imageNamesGuide || '[]');
        setImageGuide(Array.isArray(guideImages) ? guideImages : []);
      } catch (e) {
        setImageGuide([]);
      } 

      try {
        const entImages = JSON.parse(cityInfo.imageNamesEnt || '[]');
        setImageEnt(Array.isArray(entImages) ? entImages : []);
      } catch (e) {
        setImageEnt([]);
      }

      try {
        const eventImages = JSON.parse(cityInfo.imageNamesEvent || '[]');
        setImageEvent(Array.isArray(eventImages) ? eventImages : []);
      } catch (e) {
        setImageEvent([]);
      }

      try {
        const cafeImages = JSON.parse(cityInfo.imageNamesCafe || '[]');
        setImageCafe(Array.isArray(cafeImages) ? cafeImages : []);
      } catch (e) {
        setImageCafe([]);
      }

      // 도시 관련 상품 가져오기
      if (cityInfo.city) {
        // fetchCityProducts(cityInfo.city);
      }
    }
  }, [cityInfo]);

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!cityInfo) {
    return null;
  }

  // 현재 탭에 따른 이미지 리스트
  const getCurrentImages = () => {
    if (activeTab === 0) return []
    if (activeTab === 1) return imageNotice; 
    if (activeTab === 2) return imageGuide; 
    if (activeTab === 3) return imageEnt; 
    if (activeTab === 4) return imageEvent;
    return imageCafe;
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // 헤더에 사용할 첫 번째 이미지 가져오기
  const getHeaderImage = () => {
    if (imageNotice && imageNotice.length > 0) {
      const firstImage = imageNotice[0];
      const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
      if (imageName) {
        return `${AdminURL}/images/cityimages/${imageName}`;
      }
    }
    return rectangle580; // 기본 이미지
  };



 
  const highlightItems = [
    { image: rectangle76, title: '주요 명소' },
    { image: rectangle78, title: '문화 유산' },
    { image: rectangle76, title: '맛집 추천' },
    { image: rectangle78, title: '쇼핑 명소' },
    { image: rectangle76, title: '야경 명소' },
  ];

  const benefitItems = [
    {
      title: '주요 명소',
      text: '도시의 대표적인 관광 명소와 역사적 장소',
      image: rectangle76,
    },
    {
      title: '문화 유산',
      text: '유네스코 세계문화유산과 박물관',
      image: rectangle78,
    },
    {
      title: '맛집 추천',
      text: '현지 맛집과 미슐랭 레스토랑',
      image: rectangle76,
    },
    {
      title: '쇼핑 명소',
      text: '명품 쇼핑몰과 현지 시장',
      image: rectangle619,
    },
  ];


  return (
    <div className="EuropeCityDetail">
      {/* 상단 헤더 이미지 */}
      <div className="city-header-image">
        <img
          className="header-image-media"
          alt="도시 메인 이미지"
          src={getHeaderImage()}
        />
        {/* 어두운 overlay */}
        <div className="header-image-overlay"></div>
        {/* 도시 제목 정보 (이미지 중앙에 표시) */}
        <div className="city-title-overlay">
          <div className="city-title-content">
            <div className="text-title">{cityInfo?.cityKo || '도시명'}</div>
            <div className="text-subtitle">
              {cityInfo?.cityEn || ''}
            </div>
            <div className="text-location">
              <p>{cityInfo?.nation || ''}</p>
              <IoIosArrowForward />
              <p>{cityInfo?.cityKo || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 왼쪽 상단 뒤로가기 버튼 */}
      <button
        type="button"
        className="left-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoIosArrowBack />
      </button>

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

      <div className={`city-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 왼쪽 영역: 기존 내용 */}
        <div className="left-section">
          <div className="city-center-wrapper">

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
                {cityInfo?.weather && (
                  <span className="weather-text">{cityInfo.weather.split('\n')[0]}</span>
                )}
              </div>
            </div>

            {/* 소개 탭일 때는 도시 정보 표시, 나머지 탭은 이미지 표시 */}
            {activeTab === 0 ? (
              <>
                {/* 도시 소개 섹션 */}
                <div className="city-intro-section">
                  <div className="city-intro-tagline">
                    유럽의 아름다운 문화와 역사를 경험할 수 있는 최고의 여행지
                  </div>
                  <div className="city-intro-name">
                    {cityInfo?.cityEn || cityInfo?.cityKo || '도시명'}
                  </div>
                  <div className="city-intro-description">
                    <p>중세 시대의 건축물과 현대적인 시설이 조화롭게 어우러져 있어 방문객들에게 잊을 수 없는 추억을 선사합니다.</p>
                    <p>특히 구시가지는 유네스코 세계문화유산으로 지정되어 있어 역사적 가치가 높습니다.</p>
                    <p>다양한 문화 행사와 축제가 연중 개최되어 활기찬 분위기를 자랑합니다.</p>
                  </div>
                </div>

                <div className="highlight-section">
                  <div className="section-title">핵심 포인트</div>
                  <div className="highlight-list">
                    {highlightItems.map(({ image, title }) => (
                      <div className="highlight-item" key={title}>
                        <div className="highlight-image-wrap">
                          <img src={image} alt={title} />
                        </div>
                        <div className="highlight-item-title">{title}</div>
                        <div className="highlight-item-desc">
                          도시의 주요 관광 명소와 문화적 가치
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`benefit-section`}>
                  <div className="section-title">베네핏 & 포함사항</div>
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

                <div className="location-info-section">
                  <div className="section-title">위치</div>
                  <div className="location-content-wrapper">
                     <div className="location-map-placeholder">
                        <GoogleMap />
                      </div>
                  </div>
                </div>

                <div className="city-basic-images">
                  <img src={`${AdminURL}/images/citymapinfo/${cityInfo.courseImage}`} alt={cityInfo.cityKo} />
                </div>

                {/* 각 탭의 첫 번째 이미지 미리보기 */}
                <div className="tab-preview-images">
                  {/* 가이드투어 탭 첫 번째 이미지 */}
                  {imageNotice && imageNotice.length > 0 && (() => {
                    const firstImage = imageNotice[0];
                    const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
                    const isVideo = isVideoFile(imageName);
                    return (
                      <div key="guide-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={typeof firstImage === 'object' && firstImage.title ? firstImage.title : '가이드투어 이미지'}
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {imageGuide && imageGuide.length > 0 && (() => {
                    const firstImage = imageGuide[0];
                    const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
                    const isVideo = isVideoFile(imageName);
                    return (
                      <div key="guide-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={typeof firstImage === 'object' && firstImage.title ? firstImage.title : '가이드투어 이미지'}
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 입장/체험 탭 첫 번째 이미지 */}
                  {imageEnt && imageEnt.length > 0 && (() => {
                    const firstImage = imageEnt[0];
                    const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
                    const isVideo = isVideoFile(imageName);
                    return (
                      <div key="ent-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={typeof firstImage === 'object' && firstImage.title ? firstImage.title : '입장/체험 이미지'}
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 경기/공연 탭 첫 번째 이미지 */}
                  {imageEvent && imageEvent.length > 0 && (() => {
                    const firstImage = imageEvent[0];
                    const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
                    const isVideo = isVideoFile(imageName);
                    return (
                      <div key="event-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={typeof firstImage === 'object' && firstImage.title ? firstImage.title : '경기/공연 이미지'}
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 레스토랑/카페 탭 첫 번째 이미지 */}
                  {imageCafe && imageCafe.length > 0 && (() => {
                    const firstImage = imageCafe[0];
                    const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
                    const isVideo = isVideoFile(imageName);
                    return (
                      <div key="cafe-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={typeof firstImage === 'object' && firstImage.title ? firstImage.title : '레스토랑/카페 이미지'}
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </>
            ) : (
              <div className="photo-gallery">
                {(() => {
                  const images = getCurrentImages();
                  if (images && images.length > 0) {
                    return images.map((img: any, index: number) => {
                      const imageName = typeof img === 'string' ? img : img.imageName;
                      const title = typeof img === 'object' && img.title ? img.title : '';
                      const isVideo = isVideoFile(imageName);
                      
                      if (isVideo) {
                        return (
                          <div key={index} className="photo-main">
                            <video
                              className="photo-main-image"
                              controls
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={index} className="photo-main">
                          <img
                            className="photo-main-image"
                            alt={title || `도시 이미지 ${index + 1}`}
                            src={`${AdminURL}/images/cityimages/${imageName}`}
                          />
                        </div>
                      );
                    });
                  }
                  return (
                    <div className="photo-main">
                      <img
                        className="photo-main-image"
                        alt="메인 이미지"
                        src={rectangle580}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 영역: 실론투어 베네핏 및 상품 목록 */}
        {showRightPanel && (
          <div className="right-section">
            {/* 탭 컨텐츠 */}
            <div className="right-tab-content">
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
                    className={`right-tab-button right-tab-info ${activeRightTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('info')}
                  >
                    도시정보
                  </button>
                  <button
                    type="button"
                    className={`right-tab-button right-tab-product ${activeRightTab === 'product' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('product')}
                  >
                    여행상품
                  </button>
                </div>
              </div>
              {activeRightTab === 'info' && (
                <div className="detail-info-content">
                  <div className="detail-main-image">
                    {(() => {
                      // basicinfoImage 우선, 없으면 inputImage의 첫 번째 이미지 사용
                      if (cityInfo?.basicinfoImage) {
                        return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={`${AdminURL}/images/citymapinfo/${cityInfo.basicinfoImage}`} />;
                      }
                      if (cityInfo?.inputImage) {
                        try {
                          const images = JSON.parse(cityInfo.inputImage || '[]');
                          const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : Image_morisus;
                          return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={`${AdminURL}/images/citycustomimages/${mainImage}`} />;
                        } catch (e) {
                          return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={Image_morisus} />;
                        }
                      }
                      return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={Image_morisus} />;
                    })()}
                  </div>
                  <div className="detail-info-grid">
                    {(() => {
                      // timezoneInfo 파싱
                      try {
                        const timezoneInfo = cityInfo?.timezoneInfo ? JSON.parse(cityInfo.timezoneInfo) : null;
                        if (timezoneInfo?.timeDifference) {
                          return (
                            <div className="info-item">
                              <div className="info-label">시차</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  <span className="info-strong">{timezoneInfo.timeDifference}</span>
                                </div>
                                {timezoneInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {timezoneInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // visaInfo 파싱
                      try {
                        const visaInfo = cityInfo?.visaInfo ? JSON.parse(cityInfo.visaInfo) : null;
                        if (visaInfo?.info) {
                          return (
                            <div className="info-item">
                              <div className="info-label">비자</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {visaInfo.info}
                                </div>
                                {visaInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {visaInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // languageInfo 파싱
                      try {
                        const languageInfo = cityInfo?.languageInfo ? JSON.parse(cityInfo.languageInfo) : null;
                        if (languageInfo?.languages && Array.isArray(languageInfo.languages) && languageInfo.languages.length > 0) {
                          return (
                            <div className="info-item">
                              <div className="info-label">언어</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">{languageInfo.languages.join(', ')}</div>
                                {languageInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {languageInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // additionalInfo에서 로밍 정보 파싱
                      try {
                        const additionalInfo = cityInfo?.additionalInfo ? JSON.parse(cityInfo.additionalInfo) : null;
                        if (additionalInfo?.휴대폰 && Array.isArray(additionalInfo.휴대폰) && additionalInfo.휴대폰.length > 0) {
                          return (
                            <div className="info-item">
                              <div className="info-label">로밍</div>
                              <div className="info-value">
                                {additionalInfo.휴대폰[0]}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // exrateInfo 파싱
                      try {
                        const exrateInfo = cityInfo?.exrateInfo ? JSON.parse(cityInfo.exrateInfo) : null;
                        if (exrateInfo?.exchangeRate) {
                          return (
                            <div className="info-item">
                              <div className="info-label">화폐</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {exrateInfo.exchangeRate}
                                </div>
                                {exrateInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {exrateInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // tipInfo 파싱
                      try {
                        const tipInfo = cityInfo?.tipInfo ? JSON.parse(cityInfo.tipInfo) : null;
                        if (tipInfo?.info) {
                          return (
                            <div className="info-item">
                              <div className="info-label">팁매너</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {tipInfo.info}
                                </div>
                                {tipInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {tipInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // plugInfo 파싱
                      try {
                        const plugInfo = cityInfo?.plugInfo ? JSON.parse(cityInfo.plugInfo) : null;
                        if (plugInfo?.voltage) {
                          return (
                            <div className="info-item">
                              <div className="info-label">전압</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">{plugInfo.voltage}</div>
                                {plugInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {plugInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // priceInfo 파싱
                      try {
                        const priceInfo = cityInfo?.priceInfo ? JSON.parse(cityInfo.priceInfo) : null;
                        if (priceInfo?.priceLevel) {
                          return (
                            <div className="info-item">
                              <div className="info-label">물가</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {priceInfo.priceLevel}
                                </div>
                                {priceInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {priceInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // weatherInfo 파싱
                      try {
                        const weatherInfo = cityInfo?.weatherInfo ? JSON.parse(cityInfo.weatherInfo) : null;
                        if (weatherInfo && (weatherInfo.minTemp || weatherInfo.maxTemp || (weatherInfo.details && Array.isArray(weatherInfo.details) && weatherInfo.details.length > 0))) {
                          return (
                            <div className="info-item">
                              <div className="info-label">날씨</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {(weatherInfo.minTemp || weatherInfo.maxTemp) && (
                                  <div className="info-value">
                                    최저 : {weatherInfo.minTemp || '-'}, 최고 : {weatherInfo.maxTemp || '-'}
                                  </div>
                                )}
                                {weatherInfo.details && Array.isArray(weatherInfo.details) && weatherInfo.details.length > 0 && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {weatherInfo.details.map((line: string, index: number) => (
                                      <React.Fragment key={index}>
                                        {line}
                                        {index < weatherInfo.details.length - 1 && <br />}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // caution 또는 additionalInfo에서 주의사항 파싱
                      if (cityInfo?.caution && cityInfo.caution.trim() !== '') {
                        return (
                          <div className="info-item">
                            <div className="info-label">주의사항</div>
                            <div className="info-multiline">
                              {cityInfo.caution.split('\n').map((line: string, index: number) => (
                                <p key={index} className="info-text">{line}</p>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {(() => {
                      // additionalInfo 파싱
                      try {
                        const additionalInfo = cityInfo?.additionalInfo ? JSON.parse(cityInfo.additionalInfo) : null;
                        if (!additionalInfo) return null;

                        const sections: Array<{ title: string; content: string[] }> = [];

                        // 영업시간
                        if (additionalInfo.businessHours && Array.isArray(additionalInfo.businessHours) && additionalInfo.businessHours.length > 0) {
                          sections.push({ title: '영업시간', content: additionalInfo.businessHours });
                        }

                        // 가격 정보
                        if (additionalInfo.prices && Array.isArray(additionalInfo.prices) && additionalInfo.prices.length > 0) {
                          sections.push({ title: '가격 정보', content: additionalInfo.prices });
                        }

                        // 물
                        if (additionalInfo.물 && Array.isArray(additionalInfo.물) && additionalInfo.물.length > 0) {
                          sections.push({ title: '물', content: additionalInfo.물 });
                        }

                        // 인터넷 사용
                        if (additionalInfo['인터넷 사용'] && Array.isArray(additionalInfo['인터넷 사용']) && additionalInfo['인터넷 사용'].length > 0) {
                          sections.push({ title: '인터넷 사용', content: additionalInfo['인터넷 사용'] });
                        }

                        // 전화 사용
                        if (additionalInfo.phone && Array.isArray(additionalInfo.phone) && additionalInfo.phone.length > 0) {
                          sections.push({ title: '전화 사용', content: additionalInfo.phone });
                        }

                        // 우편
                        if (additionalInfo.우편 && Array.isArray(additionalInfo.우편) && additionalInfo.우편.length > 0) {
                          sections.push({ title: '우편', content: additionalInfo.우편 });
                        }

                        // ATM
                        if (additionalInfo.atm && Array.isArray(additionalInfo.atm) && additionalInfo.atm.length > 0) {
                          sections.push({ title: 'ATM', content: additionalInfo.atm });
                        }

                        // 카드/현금 사용
                        if (additionalInfo.cardCashUsage && Array.isArray(additionalInfo.cardCashUsage) && additionalInfo.cardCashUsage.length > 0) {
                          sections.push({ title: '카드/현금 사용', content: additionalInfo.cardCashUsage });
                        }

                        // 화장실
                        if (additionalInfo.restroom && Array.isArray(additionalInfo.restroom) && additionalInfo.restroom.length > 0) {
                          sections.push({ title: '화장실', content: additionalInfo.restroom });
                        }

                        // 흡연/음주
                        if (additionalInfo.smokingDrinking && Array.isArray(additionalInfo.smokingDrinking) && additionalInfo.smokingDrinking.length > 0) {
                          sections.push({ title: '흡연/음주', content: additionalInfo.smokingDrinking });
                        }

                        // 예절
                        if (additionalInfo.etiquette && Array.isArray(additionalInfo.etiquette) && additionalInfo.etiquette.length > 0) {
                          sections.push({ title: '예절', content: additionalInfo.etiquette });
                        }

                        if (sections.length === 0) return null;

                        return (
                          <div className="info-item">
                            <div className="info-label">추가정보</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {sections.map((section, sectionIndex) => (
                                <div key={sectionIndex}>
                                  <div className="info-value" style={{ marginBottom: '4px' }}>
                                    {section.title}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#999' }}>
                                    {section.content.map((item: string, itemIndex: number) => (
                                      <div key={itemIndex} style={{ marginBottom: itemIndex < section.content.length - 1 ? '8px' : '0' }}>
                                        {item.split('\\n').map((line: string, lineIndex: number) => (
                                          <React.Fragment key={lineIndex}>
                                            {line}
                                            {lineIndex < item.split('\\n').length - 1 && <br />}
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        // 파싱 실패 시 무시
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}

              {activeRightTab === 'product' && (
                <div className="schedule-list-container">
                  {/* 국가 제목 (EuropeTripPage와 동일) */}
                  <h2 className="selected-nation-title">{cityInfo?.nation || cityInfo?.cityKo || ''}</h2>

                  {/* 탭 네비게이션 (EuropeTripPage와 동일하게 국가명 사용) */}
                  <div className="schedule-tabs">
                    {(() => {
                      const selectedNation = cityInfo?.nation || '';
                      return ['전체', `${selectedNation}온니`, `${selectedNation}외 1개국`, `${selectedNation}외 2개국`, `${selectedNation}외 3개국`].map((tab) => (
                        <button
                          key={tab}
                          className={`schedule-tab ${scheduleFilter === tab ? 'active' : ''}`}
                          onClick={() => setScheduleFilter(tab)}
                        >
                          {tab}
                        </button>
                      ));
                    })()}
                  </div>

                  {/* 검색바 */}
                  <div className="schedule-search">
                    <input
                      type="text"
                      placeholder="상품검색"
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      className="schedule-search-input"
                    />
                    <button className="schedule-search-btn">🔍</button>
                  </div>

                  {/* Schedule 리스트 */}
                  <div className="schedule-sections">
                    {Object.keys(getGroupedSchedules()).length === 0 ? (
                      <div className="no-schedules">일정이 없습니다.</div>
                    ) : (
                      Object.entries(getGroupedSchedules()).map(([groupKey, schedules]) => (
                        <div key={groupKey} className="schedule-section">
                          <div className="schedule-section-header">{groupKey}</div>
                          {schedules.map((schedule: any, index) => {
                            const periodText = schedule.tourPeriodData.periodNight && schedule.tourPeriodData.periodDay
                              ? `${schedule.tourPeriodData.periodNight} ${schedule.tourPeriodData.periodDay}`
                              : '';
                            
                            // 상세 정보는 productName에서 추출하거나 nation 배열을 기반으로 생성
                            const detailText = schedule.productName || schedule.nation.join(' + ');

                            return (
                              <div 
                                key={index} 
                                className="schedule-item"
                                onClick={() => {
                                  if (schedule.id) {
                                    navigate(`/counsel/europe/schedulerecommend`, { state: schedule });
                                    window.scrollTo(0, 0);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="schedule-item-content">
                                  <h4 className="schedule-item-title">
                                   {schedule.nation.join(' + ')} {periodText}
                                  </h4>
                                  <p className="schedule-item-detail">{detailText}</p>
                                </div>
                                {index === 0 && groupKey === (cityInfo?.nation || '') && (
                                  <button className="schedule-item-badge recommend">추천상품</button>
                                )}
                                {index === 0 && groupKey.includes('스위스') && (
                                  <button className="schedule-item-badge special">특가상품</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
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

