import "../MainPage.scss";
import { useCallback, useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import ProductImageData from "../..//common/ProductImageData";
import CommonImageData from "../..//common/CommonImageData";
import RatingBoard from "../..//common/RatingBoard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL } from "../../../MainURL";
import { useEffect } from "react";
import { ScheduleDataProps, ScheduleNameDataProps } from "./TourInterfaceData";

export default function TourMainPage() {

  const [refresh, setRefresh] = useState<boolean>(false);
  const [categoryMenu, setCategoryMenu] = useState('유럽추천상품');

  // 리스트 가져오기 ------------------------------------------------------

  const [viewList, setViewList] = useState<ScheduleNameDataProps[]>([]);
  const [orignList, setOrignList] = useState<ScheduleNameDataProps[]>([]);
  const fetchPosts = async () => {
    const res = await axios.get(`${AdminURL}/producttour/gettourschedulenames`)
    if (res.data !== false) {
      const copy = [...res.data].map((item) => {
        try {
          // tourNation이 JSON 문자열인 경우 파싱하여 + 로 연결
          const nations = JSON.parse(item.tourNation);
          return {
            ...item,
            filteredTourNation: Array.isArray(nations) ? nations.join('+') : item.tourNation
          };
        } catch (e) {
          // 파싱 실패시 원본 그대로 반환
          return item;
        }
      });
      
      console.log('copy', copy);
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

  
  let navigate = useNavigate();
  

  const hotelObjs22 = [
    { id: 0, title: "파드라 리조트", rating: 3, image: CommonImageData.hotel_01,
      address: { contury: "인도네시아", state: "발리", city: "쿠타", detailAddress: "Sauthon Road"} },
    { id: 1, title: "더 카욘 정글 리조트 우붓", rating: 4, image: CommonImageData.hotel_02,
      address: { contury: "인도네시아", state: "발리", city: "쿠타", detailAddress: "Sauthon Road"} },
    { id: 2, title: "아야나 풀빌라", rating: 5, image: CommonImageData.hotel_03,
      address: { contury: "인도네시아", state: "발리", city: "쿠타", detailAddress: "Sauthon Road"}}
  ]


  // -----------------------------------------------------------------------------------------------------------------------
  const [toUser, setToUser] = useState('발리');
  const [category, setCategory] = useState('resortinfo');
  const [categoryBtn, setCategoryBtn] = useState('recommend');
  const [sidebar, setSidebar] = useState('전체');

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
        <img className="bg__image" src={ProductImageData.paris} alt="temp" />
      </div>

      <div className="tour_detail_category__menu__section__wrapper">
        <div className="tour_detail_category__menu__content">
            {
              ["유럽추천상품", "프랑스", "이탈리아", "스위스", "오스트리아", "스페인", "동유럽", "포르투갈", "크로아티아", "산토리니", "북유럽"]
              .map((item:any, index:any)=>{
                return (
                  <div className={`category__menu-item ? ${categoryMenu === item ? 'on' : ''}`} 
                    key={index} onClick={()=>{
                      if (item === "유럽추천상품") {
                        setViewList(orignList);
                      } else {
                        const copy = [...orignList];
                        const filtered = copy.filter((e:any) => {
                          // tourNation이 "프랑스+스위스" 형태의 문자열이므로 includes로 확인
                          return e.filteredTourNation && e.filteredTourNation.includes(item);
                        });
                        setViewList(filtered);
                      }
                      setCategoryMenu(item);
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
        
        <div className="tour_detail_hotel__list__wrapper">

          {/* <div className="tour_detail_pb-2">
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
          </div> */}

          <div className="tour_detail_category__items__wrapper">
            {
              viewList.map((cityObj:ScheduleNameDataProps) => {
                // inputImage가 JSON 문자열이므로 파싱
                let imageUrl = ProductImageData.paris; // 기본 이미지
                try {
                  const images = JSON.parse(cityObj.inputImage);
                  if (images && images.length > 0) {
                    imageUrl = images[0];
                  }
                } catch (e) {
                  console.error('이미지 파싱 에러:', e);
                }

                return (
                  <div key={cityObj.id}>
                    <div className="tour_detail_card__wrapper"
                      onClick={()=>{
                        window.scrollTo(0, 0);
                        navigate(`/tour/list/`, { state: { cityObj } });
                      }}
                    >
                      <div className="tour_detail_image__wrapper">
                        <img src={`${AdminURL}/lastimages/nationimages/${imageUrl}`} alt={cityObj.id.toString()} />
                      </div>
                      <span className="tour_detail_card__title">{cityObj.filteredTourNation}</span>
                    </div>
                  </div>
                );
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
