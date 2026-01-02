import { useState } from "react";
import "./Main.scss";
import Header from "../../component/Header";
import RatingBoard from "../../common/RatingBoard";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import MainImageData from "../../common/MainImageData";
import CommonImagesData from "../../common/CommonImageData";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { HiOutlineArrowLongLeft, HiOutlineArrowLongRight } from "react-icons/hi2";
import icon_instar from '../../lastimages/bottomInfo/instar.png';
import icon_kakao from '../../lastimages/bottomInfo/kakao.png';
import icon_blog from '../../lastimages/bottomInfo/blog.png';
import Footer from "../../component/Footer";

export interface IBgObj {
  title: string;
  subtitle: string;
  imagePath: string;
}

export default function Main() {

  const [selectId, setSelectId] = useState(0);
  const bgObjs = [
    { title: "사무이 럭셔리 콜라보",
      subtitle: "콘래드2박 + 반얀트리2박",
      imagePath: MainImageData.mainImage1 },
    { title: "사무이 럭셔리 콜라보",
      subtitle: "콘래드2박 + 반얀트리2박",
      imagePath: MainImageData.mainImage2 },
    { title: "사무이 럭셔리 콜라보",
      subtitle: "콘래드2박 + 반얀트리2박",
      imagePath: MainImageData.mainImage3 },
    { title: "사무이 럭셔리 콜라보",
      subtitle: "콘래드2박 + 반얀트리2박",
      imagePath: MainImageData.mainImage4 },
  ];

  const [category, setCategory] = useState<"best" | "europe">("best");
  const categorysObj = {
    best: [
      { id: 0, title: "발리", subtitle: "Bali", imagePath: CommonImagesData.Image_bali },
      { id: 1, title: "몰디브", subtitle: "Maldives", imagePath: CommonImagesData.Image_maldives },
      { id: 2, title: "칸쿤", subtitle: "Cancun", imagePath: CommonImagesData.Image_cancun },
      { id: 3, title: "푸켓/카오락", subtitle: "Phuket", imagePath: CommonImagesData.Image_phuket },
      { id: 4, title: "모리셔스", subtitle: "Mauritius", imagePath: CommonImagesData.Image_morisus },
      { id: 5, title: "호주", subtitle: "Australia", imagePath: CommonImagesData.Image_aus },
      { id: 6, title: "하와이", subtitle: "Hawaii", imagePath: CommonImagesData.Image_hawaii },
      { id: 7, title: "나트랑", subtitle: "Nha Trang", imagePath: CommonImagesData.Image_nhatrang },
      { id: 8, title: "두바이", subtitle: "Dubai", imagePath: CommonImagesData.Image_dubai },
      { id: 9, title: "괌/사이판", subtitle: "Guam/Saipan", imagePath: CommonImagesData.Image_guam },
    ],
    europe: [
      { id: 0, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 1, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 2, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 3, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 4, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 5, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 6, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 7, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 8, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
      { id: 9, title: "프랑스", subtitle: "France", imagePath: CommonImagesData.Image_france },
    ],
  };
  const spots = categorysObj[category];


  const promotionObjs = [
    { id: 0, title: "사무이 풀빌라 콜라보", subtitle: "풀빌라3박 x 풀빌라 2박",
      price: 1590000, dueDate: "2024-12-31", imagePath: CommonImagesData.hotel_12 },
    { id: 1, title: "발리 최저가 기획 상품", subtitle: "리조트3박 x 풀빌라 2박",
      price: 1590000, dueDate: "2024-12-31", imagePath: CommonImagesData.hotel_13 },
    { id: 2, title: "몰디브 올인크루시브", subtitle: "풀빌라3박 x 풀빌라 2박",
      price: 1590000, dueDate: "2024-12-31", imagePath: CommonImagesData.hotel_14 }
  ];

  const WhatDoyouWTD = [
    {name:"유럽여행", img: MainImageData.whatDoyou1}, 
    {name:"휴양지", img: MainImageData.whatDoyou2}, 
    {name:"여행지미리보기", img: MainImageData.whatDoyou3}, 
    {name:"견적문의", img: MainImageData.whatDoyou4}, 
    {name:"맞춤여행", img: MainImageData.whatDoyou5}
  ]

  const ceylonProduct = [
    {name:"푸켓", img: MainImageData.ceylonProduct1}, 
    {name:"이태리 남부 투어", img: MainImageData.ceylonProduct2}, 
    {name:"사무이", img: MainImageData.ceylonProduct3}, 
    {name:"파리+스페인", img: MainImageData.ceylonProduct4}
  ]

  const recommendObjs = [
    { id: 0, title: "반얀트리", location: "태국/푸켓", rating: 4.76, imagePath: CommonImagesData.hotel_01 },
    { id: 1, title: "뮬리아", location: "베트남/푸꾸옥", rating: 3.24, imagePath: CommonImagesData.hotel_02 },
    { id: 2, title: "알릴라 울루와트", location: "발리/꾸따", rating: 4.33, imagePath: CommonImagesData.hotel_03 },
    { id: 3, title: "콘레드", location: "태국/코사무이", rating: 2.51, imagePath: CommonImagesData.hotel_04 },
  ];

  const reviewObjs = [
    { id: 0, username: "홍*동", imagePath: MainImageData.review1, 
      title: "좋은 추억 가득한 하와이 신혼여행", description: "너무 좋았던  허니문을 실론투어에서 다녀왔어요 잊을 수 없는 여행... " },
    { id: 1, username: "홍*동", imagePath: MainImageData.review2,
      title: "좋은 추억 가득한 신혼여행", description: "너무 좋았던  허니문을 실론투어에서 다녀왔어요 잊을 수 없는 여행... " },
    { id: 2, username: "홍*동", imagePath: MainImageData.review3,
      title: "또 가고 싶은 푸켓여행", description: "너무 좋았던  허니문을 실론투어에서 다녀왔어요 잊을 수 없는 여행... " },
    { id: 3, username: "홍*동", imagePath: MainImageData.review4,
      title: "좋은 추억 가득한 신혼여행", description: "너무 좋았던  허니문을 실론투어에서 다녀왔어요 잊을 수 없는 여행... " },
    { id: 4, username: "홍*동", imagePath: MainImageData.review5,
      title: "행복한 발리여행", description: "너무 좋았던  허니문을 실론투어에서 다녀왔어요 잊을 수 없는 여행... " },
    { id: 5, username: "홍*동", imagePath: MainImageData.review6,
      title: "멋진 추억 가득 스위스&이탈리아에서 ", description: "너무 좋았던  허니문을 실론투어에서 다녀왔어요 잊을 수 없는 여행... " }
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

  const [toUser, setToUser] = useState('발리');

  const formatKrDate = (date: string) => {
    const dateParts = date.split("-");
    if (dateParts.length !== 3) {
      throw new Error("Invalid date format. Expected format: YYYY-MM-DD");
    }
    const year = dateParts[0];
    const month = +dateParts[1];
    const day = +dateParts[2];
    return `${year}년 ${month}월 ${day}일`;
  };
  const getDueDate = (dueDate: string) => {
    const dueDateToDate = new Date(dueDate);
    const currentDate = new Date();
    const timeDiff = dueDateToDate.getTime() - currentDate.getTime();
    const dayCoef = 1000 * 60 * 60 * 24;
    const dateDiff = Math.ceil(timeDiff / dayCoef);
    return dateDiff < 0 ? "종료" : `D-${dateDiff}`;
  };
  
  return (
    <div className="main">
      <Header />

      <section className="main__section__wrapper">
        <div
          className="main__bg__image"
          style={{ backgroundImage: `url(${bgObjs[selectId].imagePath})` }}
        />
        <div className="main__contents__wrapper">
          <div className="main_search__bar___wrapper">
            <div className="main_search__box">
              <IoLocationOutline className="main_search__text"/>
              <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="main_search__select" aria-label="여행지 선택">
                { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="main_search__bar"></div>

            <div className="main_search__box">
              <LuCalendarDays className="main_search__text"/>
              <div className="main_search__select">

              </div>
            </div>
            <div className="main_search__box">
              <button className="main_search__btn" type="button" aria-label="검색">
                Go
              </button>
            </div>
          </div>
          <div className="main__bg__contents__wrapper">
            <div className="web__wrapper">
              <span className="web__wrapper__title">{bgObjs[selectId].title}</span>
              <span className="web__wrapper__subtitle">{bgObjs[selectId].subtitle}</span>
            </div>
            <div className="mobile__wrapper">
              <span className="mobile__title">내가 꿈꾸는 허니문</span>
              <span className="mobile__subtitle">실론투어 여행 전문가가 설계해 드리는 상력한 허니문</span>
            </div>
          </div>
          <div className="bg__select__btns__wrapper">
            <div className="select__btns">
              <HiOutlineArrowLongLeft onClick={() => handleClickBtn("left")} size={20}/>
            </div>
            <div className="select__indicator">
              <span>{selectId + 1}</span>
              <div className="select__btns_ver_bar"></div>
              <span>{bgObjs.length}</span>
            </div>
            <div className="select__btns">
              <HiOutlineArrowLongRight onClick={() => handleClickBtn("right")} size={20}/>
            </div>
          </div>
        </div>
        <div className="bg__selector__wrapper">
          {bgObjs.map((bgObj, idx) => (
            <div
              key={bgObj.imagePath}
              className={`${idx === selectId ? "bg__select " : ""}image__wrapper`}
              onClick={() => setSelectId(idx)}
            >
              <img src={bgObj.imagePath} />
            </div>
          ))}
        </div>
        {/* <div className="mobile__search__bar__wrapper">
          <div className="mobile__search__bar__title">
           <span>WHERE</span> DO YOU <br></br>
           WANT TO <span>Go</span>?
          </div>
          <div className="mobile__search__input__container">
            <div className="mobile__search__input__wrapper">
              <input type="text" placeholder="어디로 가고 싶으세요?"/>
              <IoLocationOutline color="#333" size={25}/>
            </div>
            <div className="mobile__search__btn__wapper">
              Let's go
            </div>
          </div>
        </div> */}
      </section>


      {/* <section className="main_best__section__wrapper">
        <div className="category__selector__wrapper">
          <div
            className={`category__bar ${
              category === "best" ? "on" : ""
            }`}
            onClick={() => setCategory("best")}
          >
            베스트휴양지
          </div>
          <div
            className={`category__bar ${
              category === "europe" ? "on" : ""
            }`}
            onClick={() => setCategory("europe")}
          >
            유럽
          </div>
        </div>
        <div className="spot__cards__wrapper">    
          {spots.map((spot) => (
            <div className="spot__card__wrapper" key={spot.id}>
              <div className="spot__card__imagebox"
                style={{
                  backgroundImage: `url(${spot.imagePath}),
                  linear-gradient(to top, rgba(0, 0, 0, 0.56), rgba(9, 9, 9, 0))`,
                }}
              >
                <span className="spot__subtitle">{spot.subtitle}</span>
                <span className="spot__title">{spot.title}</span>
              </div>
              <span className="spot___bottom__text">즐길거리 등을 적는 곳입니다. 현지에서 하는 유명한 것들, 재미있는 체험 등</span>
            </div>
          ))}
        </div>
        <MobileCardWrapper>
          {spots.map((spot) => (
            <SpotCard key={spot.id} {...spot} />
          ))}
        </MobileCardWrapper>
      </section> */}


      {/* <section
        className="main_promotion__section__wrapper"
        style={{ backgroundImage: `url(${MainImageData.promotion_bg})` }}
      >
        <div className="promotion__header__wrapper">
          <div className="promotion__title">
            <span className="promotion__top__title">Best</span>
            <div className="promotion__main__title">
              <span>시즌 추천 프로모션</span>
            </div>
            <div className="promotion__mobile__title">
              <span className="color__orange">Best</span>
              <span>시즌 추천 프로모션</span>
            </div>
          </div>
          <div className="promotion__desc">
            <span>실론투어의 여행전문가가</span>
            <span>추천해 드리는 상품</span>
          </div>
        </div>
        <div className="promotion__cards__wrapper">
          {promotionObjs.map((obj) => (
            <div className="promotion__card__container" key={obj.id}>
              <div className="promotion__image__wrapper">
                <img src={obj.imagePath} />
              </div>
              <div className="promotion__info__wrapper">
                <div className="promotion__info">
                  <span className="promotion__info__title">{obj.title}</span>
                  <span className="promotion__info__subtitle">{obj.subtitle}</span>
                  <span className="promotion__duedate">
                    {`[프로모션 기간 ${formatKrDate(obj.dueDate)}까지]`}
                  </span>
                </div>
                <div className="duedate__box__wrapper">
                  <div className="duedate__box__btn">
                    {getDueDate(obj.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <MobileCardWrapper>
          {promotionObjs.map((obj) => (
            <div key={obj.id} className="promotion__mobile__card__wrapper">
              <RecommendCard
                location={obj.location}
                rating={obj.rating}
                imagePath={obj.imagePath}
                tourId={obj.tourId}
                title={obj.resort}
              />
            </div>
          ))}
        </MobileCardWrapper>
      </section> */}


      <section className="main_question__section__wrapper">
        <div className="question__section__cover">
          <div className="question__textbox">
            <p className="question__text_Main">WHAT</p>
            <p className="question__text_Main">DO YOU</p>
            <p className="question__text_Main">WANT TO DO?</p>
            <p className="question__text_sub">실론투어와 함께 쉽고 스마트하게 여행을 만들어보세요</p>
          </div>
          <div className="main_question__imagesbox">
            {
               WhatDoyouWTD.map((item:any, index:any)=>{
                return (
                  <div className="question_spot__card__wrapper" key={index}>
                    <div className="question_spot__card__imagebox"
                      style={{
                        backgroundImage: `url(${item.img})`
                      }}
                    >
                      <span className="question_spot__title">{item.name}</span>
                    </div>
                    <div className="question_spot___bottom__text">
                      <span>실론투어의 유럽전문가와 함께 만드는 일정</span>  
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </section>


      <section className="main_recommend__section__wrapper">
        <div className="recommend__top__wrapper">
          <div className="recommend__top__title">
            <p className="recommend__top__title_main">CEYLON PRODUCT</p>
            <p className="recommend__top__title_sub">추천상품 미리가기</p>
          </div>
          <div className="recommend__top__cardbox_cover">
          {
            ceylonProduct.map((item:any, index:any)=>{
              return (
                <div className="recommend__top__cardbox" key={index}>
                  <div className="recommend__top__image__wrapper">
                    <img src={item.img} />
                  </div>
                  <div className="recommend__top__info__wrapper">
                    <span className="recommend__top__info__title">{item.name}</span>
                    <span className="recommend__top__info__notice">프로모션에 대한 소개글을 적는 곳입니다. 지역과 혜택들을 적는 곳</span>
                  </div>
                </div>
              )
            })
          }
          </div>
        </div>
        <div className="recommend__bottom__wrapper">
          <div className="recommend_bottom__title">
            <span className="strong_bottom__title">PROMOTION</span>
          </div>
          <span className="recommend_bottom__subtitle">여행전문가가 추천하는 여행지</span>
        </div>
        <div className="recommend_bottom__cards__wrapper">
          {
            recommendObjs.map((item:any, index:any) => (
              <div className="recommend__card__wrapper">
                <div className="recommend__image__wrapper">
                  <img src={item.imagePath} alt="temp" />
                </div>
                <span className="recommend__card__title">{item.title}</span>
                <div className="recommend__card__info">
                  <span>{item.location}</span>
                  <div className="recommend__rating__wrapper">
                    <RatingBoard ratingSize={20} rating={item.rating} />
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </section>


      <section className="main_join__section__wrapper">
        <div className="join__image__wrapper">
          <img src={MainImageData.member_bg} />
        </div>
        <div className="join__info__wrapper">
          <div className="join__info">
            <span>실론투어 멤버가 되다</span>
            <p>
              회원들께는 할인된 회원 요금, 현금화해서 사용가능한 포인트 적리브
              무료숙박 같은 다양한 외원 혜택을 누릴 수 있습니다.
            </p>
            <button className="detail__btn">
              <p className="detail__btn_text">자세히 보기</p>
              <IoIosArrowForward color="#fff"/>
            </button>
          </div>
        </div>
      </section>

      <section className="review__section__wrapper">
        <div className="review__header__wrapper">
          <span className="review__title">review</span>
          <span className="review__subtitle">실론투어와 함께 행복한 추억나누기</span>
        </div>
        <div className="review__cards__wrapper">
          {reviewObjs.map((obj) => (
            <div className="grid__item review__card__wrapper" key={obj.id} >
              <div className="review__bg__image">
                <img src={obj.imagePath} />
              </div>
              <div className="review__info__container">
                <span className="review__title">{obj.title}</span>
                <div className="review__info__wrapper">
                  <span className="review__info__desc">{obj.description}</span>
                  <span className="review__info__username">{obj.username}</span>
                </div>
              </div>
              <div className="review__image__wrapper">
                <img src={obj.imagePath} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bottomInfo__section__wrapper">
        <div className="bottomInfo__cover">
          <div className="bottomInfo__left_box">
            <h3>실론투어 고객센터</h3>
            <div className="bottomInfo__left_box_textrow">
              <h4>문의시간</h4>
              <p>AM 9:00 ~ PM 7:00</p>
            </div>
            <div className="bottomInfo__left_box_textrow">
              <h4>점심시간</h4>
              <p>PM 12:00 ~ PM 1:00</p>
            </div>
            <div className="bottomInfo__left_box_textrow">
              <h4>정기휴무</h4>
              <p>수요일</p>
            </div>
          </div>
          <div className="bottomInfo__center_box">
            <p>실론투어 대표번호</p>
            <h3>1522-0047</h3>
          </div>
          <div className="bottomInfo__right_box">
            <div className="bottomInfo__right_box_icon">
              <img src={icon_instar}/>
            </div>
            <div className="bottomInfo__right_box_icon">
              <img src={icon_kakao}/>
            </div>
            <div className="bottomInfo__right_box_icon">
              <img src={icon_blog}/>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
