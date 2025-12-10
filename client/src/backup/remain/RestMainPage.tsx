import "./MainPage.scss";
import { useCallback, useState } from "react";
import { IoIosArrowForward , IoIosArrowBack } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import RatingBoard from "../../screen/common/RatingBoard";
import CommonImageData from "../../screen/common/CommonImageData";
import { useNavigate } from "react-router-dom";

export default function RestMainPage() {

  let navigate = useNavigate();
  const [selectId, setSelectId] = useState(0);

  const bgObjs = [
    { title: "발리 풀빌라 프로모션",
      subtitle: "특별한 가격으로 만나는 완벽한 풀빌라",
      imagePath: CommonImageData.hotel_07 },
    { title: "발리 풀빌라 프로모션",
      subtitle: "특별한 가격으로 만나는 완벽한 풀빌라",
      imagePath: CommonImageData.hotel_12 },
    { title: "발리 풀빌라 프로모션",
      subtitle: "특별한 가격으로 만나는 완벽한 풀빌라",
      imagePath: CommonImageData.hotel_13 },
    { title: "발리 풀빌라 프로모션",
      subtitle: "특별한 가격으로 만나는 완벽한 풀빌라",
      imagePath: CommonImageData.hotel_14 }
  ];
  const tourData = [
    { id: 0, title: "발리", subtitle: "Bali", imagePath: CommonImageData.Image_bali,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 1, title: "몰디브", subtitle: "Maldives", imagePath: CommonImageData.Image_maldives,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 2, title: "칸쿤", subtitle: "Cancun", imagePath: CommonImageData.Image_cancun,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 3, title: "푸켓/카오락", subtitle: "Phuket", imagePath: CommonImageData.Image_phuket,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 4, title: "모리셔스", subtitle: "Mauritius", imagePath: CommonImageData.Image_morisus,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 5, title: "호주", subtitle: "Australia", imagePath: CommonImageData.Image_aus,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 6, title: "하와이", subtitle: "Hawaii", imagePath: CommonImageData.Image_hawaii,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 7, title: "나트랑", subtitle: "Nha Trang", imagePath: CommonImageData.Image_nhatrang,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 8, title: "두바이", subtitle: "Dubai", imagePath: CommonImageData.Image_dubai,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
    { id: 9, title: "괌/사이판", subtitle: "Guam/Saipan", imagePath: CommonImageData.Image_guam,
      desc: "즐길거리 등을 적는 곳입니다. 현지에서 하는 것, 유명한 장소, 재미있는 체험 등" },
  ];


  
  const handleClickBtn = (dir: "left" | "right") => {
    setSelectId((prev) => {
      if (dir === "left") {
        return selectId === 0 ? bgObjs.length - 1 : --prev;
      } else {
        return selectId + 1 === bgObjs.length ? 0 : ++prev;
      }
    }); 
  }
  const handleClick = (idx: number) => {
    setSelectId(idx);
  };


  // -----------------------------------------------------------------------------------------------------------------------
  const [toUser, setToUser] = useState('발리');

  return (
    <div className="tour_main">
      
      {/* 검색창 -------------------------------------------------------------------------------------------------- */}
      <div className="tour_main_search__bar___wrapper">
        <div className="tour_main_search__box">
          <IoLocationOutline className="tour_main_search__text"/>
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="tour_main_search__select">
            { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
              <option key={index} value={option.value}>발리</option>
            ))}
          </select>
        </div>
        <div className="tour_main_search__bar"></div>
        <div className="tour_main_search__box">
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="tour_main_search__select">
            { ['대서양','인도양','남미'].map((option:any, index:any) => (
              <option key={index} value={option.value}>전체</option>
            ))}
          </select>
        </div>
        <div className="tour_main_search__bar"></div>
        <div className="tour_main_search__box">
          <LuCalendarDays className="tour_main_search__text"/>
          <div className="tour_main_search__select">

          </div>
        </div>
        <div className="tour_main_search__bar"></div>
        <div className="tour_main_search__box">
          <HiOutlineBuildingOffice2 className="tour_main_search__text"/>
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="tour_main_search__select">
            { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
              <option key={index} value={option.value}>리조트</option>
            ))}
          </select>
        </div>
        <div className="tour_main_search__box">
          <div className="tour_main_search__btn">
            찾기
          </div>
        </div>
      </div>

      {/* 상단 메인 섹션 -------------------------------------------------------------------------------------------------- */}
      <div className="tour_main_main__section__wrapper">
        <div
          className="bg__image__wrapper"
          style={{ backgroundImage: `url(${bgObjs[selectId].imagePath})` }}
        />
        <div className="contents__wrapper">
          <div className="bg__contents__wrapper">
            <div className="web__wrapper">
              <span className="web__wrapper_title">{bgObjs[selectId].title}</span>
              <span className="web__wrapper_subtitle">{bgObjs[selectId].subtitle}</span>
            </div>
            <div className="mobile__wrapper">
              <span className="mobile__title">내가 꿈꾸는 허니문</span>
              <span className="mobile__subtitle">실론투어 여행 전문가가 설계해 드리는 상력한 허니문</span>
            </div>
          </div>
          
        </div>
        <div className="bg__select__btns__wrapper">
          <div className="select__indicator">
            <span>{selectId + 1}</span>
            <span style={{margin:'0 5px'}}>/</span>
            <span>{bgObjs.length}</span>
          </div>
          <div className="select__btns">
            <IoIosArrowBack onClick={() => handleClickBtn("left")} size={20}/>
            <div className="select__btns_ver_bar"></div>
            <IoIosArrowForward onClick={() => handleClickBtn("right")} size={20}/>
          </div>
        </div>
        <div className="bg__selector__wrapper">
          {bgObjs.map((bgObj, idx) => (
            <div
              key={bgObj.imagePath}
              className={`${idx === selectId ? "bg__select " : ""}image__wrapper`}
              onClick={() => handleClick(idx)}
            >
              <img src={bgObj.imagePath} />
            </div>
          ))}
        </div>
      </div>

      {/* 중간 리스트 섹션 -------------------------------------------------------------------------------------------------- */}
      <div className="tour_main_tour__section__wrapper">
        <div className="spot__cards">
          {tourData.map((itemObj:any, index:any) => (
            <div key={index} className="spot__card__wrapper_box"
              onClick={()=>{
                window.scrollTo(0, 0);
                navigate("/products/tourdetail");
              }}
            >
              <div className="spot__card__wrapper"
                style={{ backgroundImage: `url(${itemObj.imagePath})` }}
              >
                <span className="spot__subtitle">{itemObj.subtitle}</span>
                <span className="spot__title">{itemObj.title}</span>
              </div>
              <span className="font__desc">{itemObj.desc}</span>
            </div>
          ))}
        </div>
      </div>

     

    </div>
  );
}
