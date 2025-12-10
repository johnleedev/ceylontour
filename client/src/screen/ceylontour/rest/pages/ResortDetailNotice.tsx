import "./ResortDetail.scss";
import { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { AdminURL } from "../../../../MainURL";
import { HotelDataProps } from "../RestInterfaceData";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';


export default function ResortDetailNotice(
  { 
    hotelInfo, imageNamesAllView, imageNamesRoomView, imageNamesEtcView, imageAll, hotelRoomTypes 
  }: { 
    hotelInfo?: HotelDataProps, imageNamesAllView?: any, imageNamesRoomView?: any, imageNamesEtcView?: any, imageAll?: any, hotelRoomTypes?: any 
  }
) {

  const [selectedRoomType, setSelectedRoomType] = useState<any>(hotelRoomTypes?.[0]?.roomTypeName);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  

  return (
    <div className="resort_detail_page">

      {/* 호텔 이미지 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_image__selector__wrapper">
        <div className="images__grid__wrapper">
          {imageAll?.slice(0, 3).map((image: any, idx: number) => (
            <div key={idx}>
              <img src={`${AdminURL}/lastimages/hotelimages/${image.imageName}`} alt="hotel view" />
              {idx === 2 && imageAll && imageAll.length > 3 && (
                <div className="show__all__btn" onClick={() => {}}>
                  <span>사진 모두 보기</span>
                  <span>{`+${imageAll.length - 3}`}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 호텔 정보 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_info__items__wrapper resort_page_mx__section">
        <div className={"only-web"}>
          <span className="item__title">룸타입</span>
          <ul>
            {hotelRoomTypes?.map((item: any, idx: number) => (
              <li key={idx}>
                <label htmlFor={item.roomTypeName}>
                  <input type="radio" id={item.roomTypeName} checked={item.roomTypeName === selectedRoomType} 
                    onChange={() => setSelectedRoomType(item.roomTypeName)} />
                  <span className={item.roomTypeName === selectedRoomType ? "select__room__type" : ""}>
                    {item.roomTypeName}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">고객 베네핏</span>
          <ul>
            {/* {hotelInfo.hotelBenefit.map((item: any, idx: number) => (
              <li key={idx} className="item__title_text">- {item}</li>
            ))} */}
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">호텔 위치</span>
          <ul>
            <li key="address" className="item__title_text">{`주소 : ${hotelInfo?.hotelAddress}`}</li>
            {/* {hotelInfo.nearby.map(({ distance, name }, idx) => (
              <li key={idx} className="item__title_text">{`${distance} - ${name}`}</li>
            ))} */}
            <div className="map__view__btn">
              <FaLocationDot />
              <span>호텔 위치 보기</span>
            </div>
          </ul>
        </div>
      </div>

      {/* 호텔 상세이미지 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_resort__info__image__wrapper">
        <div className="only-web web__image__wrapper resort_page_mx__section">
          <img alt="temp" src={`${AdminURL}/lastimages/hoteldetailimages/test.jpg`} />
        </div>
      </div>

      {/* 호텔 상세 탭 및 이미지 스와이프 영역 ------------------------------------------------------------------------------------------------------------------------ */}
      <section className="d-w-full hotel_detail mt-100">
        <div className="item_box_s">
          <div className="tab_type">
            <ul className="tab-in">
              <li 
                className={`menu-item ${activeTab === 0 ? 'on' : ''}`}
                onClick={() => setActiveTab(0)}
              >
                <span className={`menu-face ${activeTab === 0 ? 'on' : ''}`}>View</span>
                <div className={`menu-face2 ${activeTab === 0 ? 'on' : ''}`}></div>
              </li>
              <li 
                className={`menu-item ${activeTab === 1 ? 'on' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                <span className={`menu-face ${activeTab === 1 ? 'on' : ''}`}>Rooms</span>
                <div className={`menu-face2 ${activeTab === 1 ? 'on' : ''}`}></div>
              </li>
              <li 
                className={`menu-item ${activeTab === 2 ? 'on' : ''}`}
                onClick={() => setActiveTab(2)}
              >
                <span className={`menu-face ${activeTab === 2 ? 'on' : ''}`}>Facilities </span>
                <div className={`menu-face2 ${activeTab === 2 ? 'on' : ''}`}></div>
              </li>
            </ul>
          </div>
          
          <div className="hotel_photo_view">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination',
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
              className="hotel-swiper"
            >
              {imageNamesAllView && imageNamesAllView.map((image: any, idx: number) => (
                <SwiperSlide key={idx}>
                  <div className="photo">
                    <img src={`${AdminURL}/lastimages/hotelimages/${image.imageName}`} alt="hotel view" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
      
            
          </div>
          
          <div className="hotel_photo_text">
            <p className="bold">
              <b>{hotelInfo?.hotelNameKo} - {hotelInfo?.hotelNameEn}에서 경험하는 세계 최고 서비스</b>
            </p>
            <p>
              {hotelInfo?.hotelNotice}
            </p>
          </div>
        </div>
      </section>
      
    </div>
  );
}
