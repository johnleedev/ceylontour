import React, { useState, useEffect } from 'react';
import './TourHotelPage.scss';
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

// 호텔 페이지 이미지
import HotelImage1 from '../../../lastimages/counseltour/hotel/image.png';
import HotelImage2 from '../../../lastimages/counseltour/hotel/image-2.png';
import HotelImage3 from '../../../lastimages/counseltour/hotel/image-3.png';
import HotelImage4 from '../../../lastimages/counseltour/hotel/image-4.png';
import HotelImage5 from '../../../lastimages/counseltour/hotel/image-5.png';
import StarIcon from '../../../lastimages/counseltour/hotel/star-4-5.svg';
import LocationIcon from '../../../lastimages/counseltour/hotel/vector-301-5.svg';
import VectorIcon364 from '../../../lastimages/counseltour/hotel/vector-364.svg';
import VectorIcon367 from '../../../lastimages/counseltour/hotel/vector-367.svg';
import SearchIcon from '../../../lastimages/counseltour/hotel/vector.svg';

// 오른쪽 패널 상세 정보 이미지
import StarIconDetail from '../../../lastimages/counseltour/hotel/rightsection/star-4.svg';
import LocationIconDetail from '../../../lastimages/counseltour/hotel/rightsection/vector-301.svg';
import DropdownIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-302.svg';
import DateIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-337.svg';
import WifiIcon from '../../../lastimages/counseltour/hotel/rightsection/vector.svg';
import PoolIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-1.svg';
import FitnessIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-2.svg';
import ShuttleIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-3.svg';
import FacilityIcon5 from '../../../lastimages/counseltour/hotel/rightsection/vector-5.svg';
import FacilityIcon6 from '../../../lastimages/counseltour/hotel/rightsection/vector-6.svg';
import FacilityIconLayer from '../../../lastimages/counseltour/hotel/rightsection/layer-1.svg';
import FacilityIcon8 from '../../../lastimages/counseltour/hotel/rightsection/vector-8.svg';
import FacilityIcon10 from '../../../lastimages/counseltour/hotel/rightsection/vector-10.svg';
import FacilityIcon11 from '../../../lastimages/counseltour/hotel/rightsection/vector-11.svg';
import FacilityIconFrame from '../../../lastimages/counseltour/hotel/rightsection/frame.svg';
import MediaImage from '../../../lastimages/counseltour/hotel/rightsection/rectangle-585.png';
import VideoIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-235.svg';
import PhotoIcon1 from '../../../lastimages/counseltour/hotel/rightsection/vector-236.svg';
import PhotoIcon2 from '../../../lastimages/counseltour/hotel/rightsection/vector-237.svg';


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


export default function TourHotelPageHC () {
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

  // 호텔 카드 데이터
  const hotelCards = [
    {
      id: 1,
      title: '르 메트로폴리탄',
      price: '290,000원~',
      description: '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.',
      image: HotelImage1,
      location: '프랑스',
      city: '파리',
      rating: 4,
      isSelected: true,
      personCount: '1인',
      vectorIcon: VectorIcon367
    },
    {
      id: 2,
      title: '르 메트로폴리탄',
      price: '230,000원~',
      description: '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.',
      image: HotelImage2,
      location: '프랑스',
      city: '파리',
      rating: 4,
      isSelected: false,
      personCount: '1인',
      vectorIcon: VectorIcon364
    },
    {
      id: 3,
      title: '르 메트로폴리탄',
      price: '170,000원~',
      description: '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.',
      image: HotelImage2,
      location: '프랑스',
      city: '파리',
      rating: 4,
      isSelected: false,
      personCount: '1인',
      vectorIcon: VectorIcon364
    },
    {
      id: 4,
      title: '르 메트로폴리탄',
      price: '230,000원~',
      description: '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.',
      image: HotelImage3,
      location: '프랑스',
      city: '파리',
      rating: 4,
      isSelected: false,
      personCount: '1인',
      vectorIcon: VectorIcon367
    },
    {
      id: 5,
      title: '르 메트로폴리탄',
      price: '390,000원~',
      description: '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.',
      image: HotelImage4,
      location: '프랑스',
      city: '파리',
      rating: 4,
      isSelected: false,
      personCount: '1인',
      vectorIcon: VectorIcon367
    },
    {
      id: 6,
      title: '르 메트로폴리탄',
      price: '420,000원~',
      description: '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.',
      image: HotelImage5,
      location: '프랑스',
      city: '파리',
      rating: 4,
      isSelected: false,
      personCount: '1인',
      vectorIcon: VectorIcon367
    }
  ];

  // 지역 필터 탭 데이터
  const regionTabs = [
    { id: 'paris', label: '파리', isActive: true },
    { id: 'nice', label: '니스', isActive: false },
    { id: 'lucerne', label: '루체른', isActive: false },
    { id: 'interlaken', label: '인터라켄', isActive: false }
  ];

  // 카테고리 필터 데이터
  const categoryFilters = [
    { id: 'all', label: '전체' },
    { id: 'eiffel', label: '에펠탑뷰' },
    { id: 'champs', label: '상제리제거리' },
    { id: 'zone4', label: '4구역' }
  ];

  return (
    <div className="tour-hotel-page-wrapper">
      <div className="tour-hotel-container detail-open">
        {/* 왼쪽 영역: 헤더 + 나라 리스트 */}
        <div className="left-section">
          <div className="hotel-list-wrapper">
            {/* 헤더 */}
            <div className="hotel-header">
              <h1 className="element">파리 + 스위스 + 이태리&nbsp;&nbsp;5박 7일</h1>

              {/* 카테고리 필터 */}
              <div className="frame">
                {categoryFilters.map((filter, index) => (
                  <React.Fragment key={filter.id}>
                    {index > 0 && <div className="rectangle" />}
                    <div className={filter.id === 'all' ? 'text-wrapper' : 'div'}>
                      {filter.label}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 검색 영역 */}
            <div className="search-section">
              <div className="search-input-wrapper">
                <img className="search-icon" alt="Search" src={SearchIcon} />
                <input type="text" className="search-input" placeholder="Search" />
                <div className="search-divider" />
              </div>
            </div>

            {/* 지역 필터 탭 */}
            <div className="region-tabs">
              {regionTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`region-tab ${tab.isActive ? 'active' : ''}`}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            {/* 호텔 카드 리스트 */}
            <div className="hotel-cards-list">
              {hotelCards.map((hotel) => (
                <div
                  key={hotel.id}
                  className={`hotel-card ${hotel.isSelected ? 'selected' : ''}`}
                >
                  <img className="hotel-image" alt={hotel.title} src={hotel.image} />
                  
                  <div className="hotel-card-content">
                    <div className="hotel-card-header">
                      <h3 className="hotel-title">{hotel.title}</h3>
                      <div className="hotel-price">{hotel.price}</div>
                    </div>

                    <p className="hotel-description">{hotel.description}</p>

                    <div className="hotel-info">
                      <div className="hotel-rating">
                        {[...Array(4)].map((_, i) => (
                          <img
                            key={i}
                            className="star-icon"
                            alt="Star"
                            src={StarIcon}
                          />
                        ))}
                      </div>

                      <div className="hotel-location">
                        <span className="location-text">
                          {hotel.location}&nbsp;&nbsp;&nbsp;&nbsp; {hotel.city}
                        </span>
                        <img
                          className="location-icon"
                          alt="Location"
                          src={LocationIcon}
                        />
                      </div>
                    </div>

                    <div className="hotel-card-footer">
                      <img
                        className="hotel-vector-icon"
                        alt="Vector"
                        src={hotel.vectorIcon}
                      />
                      <span className="hotel-person-count">{hotel.personCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 상세 정보 */}
        <div className="right-section">
          <div className="hotel-detail-wrapper">
            {/* 호텔 헤더 */}
            <div className="hotel-detail-header">
              <div className="hotel-header-left">
                <div className="hotel-detail-title">Sheraton Parisgrand</div>
                
                <div className="hotel-detail-rating">
                  <img className="star" alt="Star" src={StarIconDetail} />
                  <img className="star" alt="Star" src={StarIconDetail} />
                  <img className="star" alt="Star" src={StarIconDetail} />
                  <img className="star" alt="Star" src={StarIconDetail} />
                  <img className="star" alt="Star" src={StarIconDetail} />
                </div>

                <div className="hotel-detail-location">
                  <span>프랑스 &gt; 파리</span>
                </div>
              </div>

              <div className="hotel-header-right">
                <button className="media-button-header">
                  <img className="media-icon" alt="Vector" src={VideoIcon} />
                  <span>동영상보기</span>
                </button>
                <button className="media-button-header">
                  <div className="media-icon-group">
                    <img className="media-icon" alt="Vector" src={PhotoIcon1} />
                    <img className="media-icon" alt="Vector" src={PhotoIcon2} />
                  </div>
                  <span>호텔사진보기</span>
                </button>
              </div>
            </div>

            {/* 호텔 메인 이미지 */}
            <div className="media-section">
              <img
                className="media-image"
                alt="Hotel"
                src={MediaImage}
              />
            </div>

            {/* 호텔 위치 */}
            <div className="location-section">
              <button className="location-button">
                <span>호텔 위치 보기</span>
              </button>
              <p className="location-address">10 Pl. de Mexico, 75116 Paris, 프랑스</p>
              <div className="location-distances">
                <p>28km - 발리국제공항 (차량 약 20분)</p>
                <p>2km - 울루와뚜 (차량 10분)</p>
                <p>1.5km - 우붓 (도보 5분)</p>
              </div>
            </div>

            {/* 호텔 소개 */}
            <div className="description-section">
              <p className="description-text">
                발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
                스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
                설비를 갖춘 다섯 성급 리조트입니다
                <br />
                전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
                열자마자 물속으로 직접 들어갈 수도 있는 독보적인 설계를 갖추고 있어
                &quot;바다 위의 리조트&quot;라고 불릴 만큼 특별한 휴식을 제공합니다.
              </p>
            </div>

            {/* 추천포인트 */}
            <div className="recommendations-section">
              <div className="recommendations-title">최고의 위치</div>
              <p className="recommendations-text">
                여행중의 특별한 휴식
                <br />
                인피니티풀의 휴식
              </p>
            </div>

            {/* 부대시설 */}
            <div className="facilities-section">
              <div className="facilities-grid">
                <div className="facility-item">
                  <img className="facility-icon" alt="Wifi" src={WifiIcon} />
                  <span>와이파이</span>
                </div>
                <div className="facility-item">
                  <img className="facility-icon" alt="Pool" src={PoolIcon} />
                  <span>수영장</span>
                </div>
                <div className="facility-item">
                  <img className="facility-icon" alt="Fitness" src={FitnessIcon} />
                  <span>피트니스클럽</span>
                </div>
                <div className="facility-item">
                  <img className="facility-icon" alt="Shuttle" src={ShuttleIcon} />
                  <span>무료셔틀</span>
                </div>
              </div>
            </div>

            {/* 예약 카드 */}
            <div className="booking-card">
              <div className="booking-field">
                <div className="booking-label">날짜</div>
                <div className="booking-input">
                  <img className="date-icon" alt="Calendar" src={DateIcon} />
                </div>
              </div>

              <div className="booking-field">
                <div className="booking-label">룸타입</div>
                <div className="booking-input">
                  <span className="booking-input-text">룸타입</span>
                  <img className="booking-option-icon" alt="Vector" src={DropdownIcon} />
                </div>
              </div>

              <div className="booking-field">
                <div className="booking-label">인원</div>
                <div className="booking-counter">
                  <button className="counter-btn">-</button>
                  <span className="counter-value">2명</span>
                  <button className="counter-btn">+</button>
                </div>
              </div>

              <div className="booking-price-info">
                <span className="price-per-night">190,000원 /1박</span>
              </div>

              <div className="booking-field">
                <div className="booking-label">박수</div>
                <div className="booking-counter">
                  <button className="counter-btn">-</button>
                  <span className="counter-value">2박</span>
                  <button className="counter-btn">+</button>
                </div>
              </div>

              <div className="booking-total">
                <div className="total-label">총요금</div>
                <div className="total-amount">₩380,000</div>
              </div>

              <button className="select-button">선택</button>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
};


