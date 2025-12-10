import "./TourDetail.scss";
import { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { AdminURL } from "../../../../MainURL";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';


export default function TourDetailNotice(
  { 
    tourInfo
  }: { 
    tourInfo?: any
  }
) {

  const [activeTab, setActiveTab] = useState<number>(0);
  
  

  return (
    <div className="resort_detail_page">

      {/* 관광지 정보 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_info__items__wrapper resort_page_mx__section">
        <div className={"only-web"}>
          <span className="item__title">여행 개요</span>
          <ul>
            <li className="item__title_text">{tourInfo?.scheduleOutline || "일정 개요가 없습니다."}</li>
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">랜드사</span>
          <ul>
            <li className="item__title_text">{tourInfo?.landCompany || "-"}</li>
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">상품 타입</span>
          <ul>
            <li className="item__title_text">{tourInfo?.applyPackage || "-"}</li>
          </ul>
        </div>
      </div>

      {/* 관광지 상세 텍스트 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_resort__info__image__wrapper">
        <div className="only-web web__image__wrapper resort_page_mx__section">
          <div className="hotel_photo_text" style={{padding: '40px 0'}}>
            <p className="bold">
              <b>{tourInfo?.productName}</b>
            </p>
            <p style={{marginTop: '20px', whiteSpace: 'pre-wrap'}}>
              {tourInfo?.scheduleOutline || "상세 설명이 없습니다."}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

