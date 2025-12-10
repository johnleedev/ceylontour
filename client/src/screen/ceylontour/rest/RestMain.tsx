import "../MainPage.scss";
import { useCallback, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import TourImageData from "../../common/ProductImageData";
import CommonImageData from "../../common/CommonImageData";
import RatingBoard from "../../common/RatingBoard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL } from "../../../MainURL";
import { useEffect } from "react";
import { HotelDataProps } from "./RestInterfaceData";


export default function RestMain() {
  
  let navigate = useNavigate();
  const categoryObjs = [
    { idx: 0, title: "전체" },
    { idx: 1, title: "쿠타" },
    { idx: 2, title: "스미낙" },
    { idx: 3, title: "잠바란" },
    { idx: 4, title: "우붓" },
  ];
  const hotelObjs22 = [
    { id: 0, title: "파드라 리조트", rating: 3, image: CommonImageData.hotel_01,
      address: { contury: "인도네시아", state: "발리", city: "쿠타", detailAddress: "Sauthon Road"} },
    { id: 1, title: "더 카욘 정글 리조트 우붓", rating: 4, image: CommonImageData.hotel_02,
      address: { contury: "인도네시아", state: "발리", city: "쿠타", detailAddress: "Sauthon Road"} },
    { id: 2, title: "아야나 풀빌라", rating: 5, image: CommonImageData.hotel_03,
      address: { contury: "인도네시아", state: "발리", city: "쿠타", detailAddress: "Sauthon Road"}}
  ]


  const [toUser, setToUser] = useState('발리');
  const [category, setCategory] = useState('resortinfo');
  const [categoryMenu, setCategoryMenu] = useState('휴양지추천상품');
  const [categoryBtn, setCategoryBtn] = useState('recommend');
  const [sidebar, setSidebar] = useState('전체');

  // -----------------------------------------------------------------------------------------------------------------------

  const [refresh, setRefresh] = useState<boolean>(false);

	// 리스트 가져오기 ------------------------------------------------------
	
  const [viewList, setViewList] = useState<HotelDataProps[]>([]);
  const [orignList, setOrignList] = useState<HotelDataProps[]>([]);
  const fetchPosts = async () => {
    const res = await axios.get(`${AdminURL}/productrest/getresthotelall`)
    if (res.data !== false) {
			const copy = [...res.data]
      setOrignList(copy);
      setViewList(copy);
    } else {
			setViewList([])
      setOrignList([]);
		}
  };

	useEffect(() => {
		fetchPosts();
	}, [refresh]);  



  return (
    <div className="tour_detail_">

      <div className="tour_detail_search__bar___wrapper">
        <div className="tour_detail_search__box">
          <IoLocationOutline className="tour_detail_search__text"/>
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="tour_detail_search__select">
            { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
              <option key={index} value={option.value}>발리</option>
            ))}
          </select>
        </div>
        <div className="tour_detail_search__bar"></div>
        <div className="tour_detail_search__box">
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="tour_detail_search__select">
            { ['대서양','인도양','남미'].map((option:any, index:any) => (
              <option key={index} value={option.value}>전체</option>
            ))}
          </select>
        </div>
        <div className="tour_detail_search__bar"></div>
        <div className="tour_detail_search__box">
          <LuCalendarDays className="tour_detail_search__text"/>
          <div className="tour_detail_search__select">

          </div>
        </div>
        <div className="tour_detail_search__bar"></div>
        <div className="tour_detail_search__box">
          <HiOutlineBuildingOffice2 className="tour_detail_search__text"/>
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="tour_detail_search__select">
            { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
              <option key={index} value={option.value}>리조트</option>
            ))}
          </select>
        </div>
        <div className="tour_detail_search__box">
          <div className="tour_detail_search__btn">
            찾기
          </div>
        </div>
      </div>

      <div className="tour__header__section__wrapper">
        <img className="bg__image" src={CommonImageData.hotel_07} alt="temp" />
      </div>

      <div className="tour_detail_category__menu__section__wrapper">
        <div className="tour_detail_category__menu__content">
            {
              ["휴양지추천상품", "괌", "멕시코", "모리셔스", "몰디브", "베트남", "아랍에미레이트", "인도네시아", "태국", "필리핀", "하와이", "호주"]
              .map((item:any, index:any)=>{
                return (
                  <div className={`category__menu-item ? ${categoryMenu === item ? 'on' : ''}`} 
                    key={index} onClick={()=>{
                      setCategoryMenu(item);
                      const copy = [...orignList];
                      const result = copy.filter((e:HotelDataProps) => e.nation === item);
                      setViewList(result);
                    }}
                  >
                    <div className={`category__menu-face ${categoryMenu !== '' ? 'on' : ''}`} >{item}</div>
                    <div className={`category__menu-face2 ${categoryMenu === item ? 'on' : ''}`}> </div>
                  </div>
                )
              })
            }
        </div>
      </div>

      {/* 중간 리스트 섹션 -------------------------------------------------------------------------------------------------- */}
      
      <div className="tour_detail_category__section__wrapper">
        
        <div className="tour_detail_category__selectorBtn__box">
          <div
            className={`tour_detail_category__Btn ${
              categoryBtn === "recommend" ? "on" : ""
            }`}
            onClick={() => setCategoryBtn("recommend")}
          >
            추천 풀빌라
          </div>
          <div
            className={`tour_detail_category__Btn ${
              categoryBtn === "early" ? "on" : ""
            }`}
            onClick={() => setCategoryBtn("early")}
          >
            얼리버드 프로모션
          </div>
          <div
            className={`tour_detail_category__Btn ${
              categoryBtn === "family" ? "on" : ""
            }`}
            onClick={() => setCategoryBtn("family")}
          >
            가족여행 추천 리조트
          </div>
          <div
            className={`tour_detail_category__Btn ${
              categoryBtn === "stay" ? "on" : ""
            }`}
            onClick={() => setCategoryBtn("stay")}
          >
            우붓 스테이
          </div>
        </div>


        <div className="tour_detail_hotel__list__wrapper">

          <div className="tour_detail_pb-2">
            <div className={"tour_detail_sidebar__wrapper"}>
              {categoryObjs.map(({ idx, title }) => (
                <span
                  key={idx}
                  className={sidebar === title ? "selected__sidebar" :  ""}
                  onClick={() => {
                    setSidebar(title)
                  }}
                >
                  {title}
                </span>
              ))}
            </div>
          </div>

          <div className="tour_detail_category__items__wrapper">
            {
              viewList.slice(0, 8).map((hotelObj: HotelDataProps) => {

                const imageNamesAllViewCopy = hotelObj.imageNamesAllView ? JSON.parse(hotelObj.imageNamesAllView) : [];
              
                return (
                
                  <div key={hotelObj.id}>
                    <div className="tour_detail_card__wrapper"
                      onClick={()=>{
                        window.scrollTo(0, 0);
                        navigate(`/rest/detail?id=${hotelObj.id}&nation=${hotelObj.nation}&city=${hotelObj.city}`);
                      }}
                    >
                      <div className="tour_detail_image__wrapper">
                        <img src={`${AdminURL}/lastimages/hotelimages/${imageNamesAllViewCopy.length > 0 ? imageNamesAllViewCopy[0].imageName : null}`} alt="temp" />
                      </div>
                      <span className="tour_detail_card__title">{hotelObj.hotelNameKo}</span>
                      <div className="tour_detail__card__info">
                        {hotelObj.city}/{hotelObj.hotelLocation}
                        <div className="tour_detail__rating__wrapper">
                          <RatingBoard rating={parseInt(hotelObj.customerScore)} />
                        </div>  
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      {/* 하단 리스트 섹션 -------------------------------------------------------------------------------------------------- */}
      <div className="tour_bottom_best__section__wrapper">
        <div className="section__header__wrapper">
          <div className="section__title">
            <span>Best</span>
            <div className="section__main__title">
              <span>실론투어</span>
              <span>휴양지</span>
            </div>
            <div className="section__mobile__title">
              <span>올인크루시브</span>
              <span>리조트</span>
            </div>
          </div>
          <div className="section__desc">
            <span>여행전문가가 추천하는</span>
            <span>최고의 휴식</span>
          </div>
        </div>
        <div className="promotion__cards__wrapper">
          {hotelObjs22.slice(0,3).map((obj) => (
             <div className="recommend__card__wrapper">
              <div className="recommend__image__wrapper">
                <img src={obj.image} alt="temp" />
              </div>
              <span className="recommend__card__title">{obj.title}</span>
              <div className="recommend__card__info">
                <span>
                  {obj.address.state}/{obj.address.city}
                </span>
                <div className="recommend__rating__wrapper">
                  <RatingBoard rating={obj.rating} />
                </div>
              </div>

            </div>
          ))}
        </div>
    
      </div>

    </div>
  );
}
