import React, { useState, useEffect, useRef } from 'react';
import './Header.scss';
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import logo_white from '../lastimages/logo_white.png'
import logo_blue from '../lastimages/logo_blue.png'
import person from '../lastimages/person.png'

const Header: React.FC = () => {
  
  let navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const menus = [
    { title: "휴양지", url:"/rest/main", links: [] },
    { title: "유럽", url:"/tour/main", links: [] },
    { title: "여행지 미리가기", url:"/", links: [] },
    { title: "여행후기", url:"/", links: [] },
    // { title: "견적서만들기", url:"/estimate", links: [] },
    // { title: "견적서고객용", url:"/user", links: [] },
  ];

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<{ [key: number]: boolean }>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMenuHovered, setIsMenuHovered] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [panelPaddingLeft, setPanelPaddingLeft] = useState<number>(40);

  const toggleMenu = () => {
      const newMenuState = !menuOpen;
      setMenuOpen(newMenuState);
      // 메뉴가 열릴 때 body 스크롤 막기
      if (newMenuState) {
        document.body.classList.add('scr-none');
      } else {
        document.body.classList.remove('scr-none');
      }
  };

  const toggleMobileMenu = (index: number) => {
      setMobileMenuOpen((prevState) => ({
          ...prevState,
          [index]: !prevState[index],
      }));
  };

  useEffect(() => {
		const copy = sessionStorage.getItem('userName');
    if (copy !== null && copy !== undefined) {
      setIsLogin(true);
    }
	}, []);

  // 컴포넌트 언마운트 시 스크롤 방지 클래스 제거
  useEffect(() => {
    return () => {
      document.body.classList.remove('scr-none');
    };
  }, []);  

  const handleLogout = async () => {
    sessionStorage.clear();
    alert('로그아웃 되었습니다.')
    navigate('/');
    window.location.reload();
  };

  

  return (
    <div className={`header ${activeIndex !== null ? 'on' : ''}`}>
      <div className="header-content">
        <div
          className="container header-content-container"
          ref={containerRef}
          onMouseLeave={()=>{ setActiveIndex(null); }}
        >
            
            <div className="header-logo" 
              onClick={()=>{navigate('/')}}
            >
              <img src={activeIndex !== null ? logo_blue : logo_white} />
            </div>

            <div
              className="header-menu"
              style={{ borderBottom: (activeIndex === 0 || activeIndex === 1) ? '1px solid transparent' : undefined }}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
            >
              {
                menus.map((item:any, index:any) => (
                  <div className={`menu-item ${activeIndex === index ? 'on' : ''}`} key={index}
                    onMouseEnter={(e)=>{
                      setActiveIndex(index);
                      const containerRect = containerRef.current?.getBoundingClientRect();
                      const face = (e.currentTarget as HTMLElement).querySelector('.menu-face') as HTMLElement | null;
                      const basisRect = (face ?? (e.currentTarget as HTMLElement)).getBoundingClientRect();
                      if (containerRect) {
                        const left = Math.max(0, basisRect.left - containerRect.left);
                        setPanelPaddingLeft(left);
                      }
                    }}
                  >
                      <div className={`menu-face ${activeIndex !== null ? 'on' : ''}`} onClick={()=>{navigate(item.url)}}>{item.title}</div>
                      <div className={`menu-face2 ${activeIndex === index ? 'on' : ''}`}> </div>
                  </div>
                ))
              }
              <div style={{width:'2px', height:'15px', margin:'0 15px', backgroundColor: activeIndex !== null ? '#333' : '#fff'}}></div>
              {
                  isLogin 
                  ?
                  <div className={`header-button_wrap ${activeIndex !== null ? 'on' : ''}`}>
                    <div className="header-button"
                      // onClick={handleLogout}
                    >로그아웃</div>
                    <div className="header-button"
                      // onClick={()=>{
                      //   stOrFa === 'student' 
                      //   ? navigate('/mypage')
                      //   : navigate('/mypage/faculty')
                      // }}
                    >마이페이지</div>
                  </div>
                  :
                  <div className={`header-button_wrap ${activeIndex !== null ? 'on' : ''}`}>
                    <div className="header-button"
                      // onClick={()=>{navigate('/login');}}
                    >로그인</div>
                    <div className="header-button" 
                      // onClick={()=>{navigate('/logister');}}
                    >회원가입</div>
                    <div className="header-button" 
                      onClick={()=>{navigate('/counsel');}}
                    >상담페이지</div>
                  </div>
                }
            </div>

              {(activeIndex === 0 || activeIndex === 1) && (
                <div className="header-hover-line"></div>
              )}

              {/* Hover Depth2 panel (like reference site) */}
              <div
                className={`depth2-panel ${activeIndex !== null ? 'on' : ''}`}
                onMouseEnter={()=>{/* keep open */}}
                onMouseLeave={()=>{setActiveIndex(null)}}
                style={{ paddingLeft: `${panelPaddingLeft}px` }}
              >
                {activeIndex === 0 && (
                  <ul className="depth2-list">
                    <li><button type="button">발리</button></li>
                    <li><button type="button">하와이</button></li>
                    <li><button type="button">몰디브</button></li>
                    <li><button type="button">칸쿤</button></li>
                    <li><button type="button">태국</button></li>
                    <li><button type="button">베트남</button></li>
                    <li><button type="button">아일랜드</button></li>
                  </ul>
                )}
                {activeIndex === 1 && (
                  <ul className="depth2-list">
                    <li><button type="button">프랑스</button></li>
                    <li><button type="button">이태리</button></li>
                    <li><button type="button">스위스</button></li>
                    <li><button type="button">스페인</button></li>
                    <li><button type="button">체코</button></li>
                    <li><button type="button">오스트리아</button></li>
                    <li><button type="button">영국</button></li>
                    <li><button type="button">그리스</button></li>
                    <li><button type="button">헝가리</button></li>
                  </ul>
                )}
              </div>


             {/* <div className={`header-hamburger_menu ${menuOpen ? 'header-hamburger_menu--open' : ''}`}>
              <div className="header-hamburger_icon" onClick={toggleMenu}></div>
              <div className="header-mobile_menu">
                  <div className="mobile_menu-inner">
                      {
                        isLogin 
                        ?
                        <div className="mobile_menu-top">
                          <span className="mobile_menu-announce">{sessionStorage.getItem('userName')}님 환영합니다.</span>
                          <div className="mobile_menu-button_wrap">
                              <div className="header-button" onClick={handleLogout}>로그아웃</div>
                              <div className="header-button" onClick={()=>{navigate("/mypage"); toggleMenu();}}>마이페이지</div>
                          </div>
                        </div>
                        :
                        <div className="mobile_menu-top">
                          <span className="mobile_menu-announce">로그인해 주세요</span>
                          <div className="mobile_menu-button_wrap">
                              <div className="header-button" onClick={()=>{navigate("/login"); toggleMenu();}}>로그인</div>
                              <div className="header-button" onClick={()=>{navigate("/logister"); toggleMenu();}}>회원가입</div>
                          </div>
                        </div>
                      }
                      
                      <div className="mobile_menu-list">
                          {
                            menus.map((item:any, index:any) => (
                              <div className={`mobile_menu-item ${mobileMenuOpen[index] ? 'mobile_menu-item--open' : ''}`} 
                                key={index} 
                                onClick={() => toggleMobileMenu(index)}
                                >
                                  <div className="mobile_menu-item_inner">
                                      <div className={`mobile_menu-face ${mobileMenuOpen[index] ? 'mobile_menu-face--open' : ''}`}>
                                          <div className="mobile_menu-face_text" onClick={()=>{navigate(item.url); toggleMenu();}}>{item.title}</div>
                                          <div className="mobile_menu-face_icon"></div>
                                      </div>
                                      <div className="mobile_menu-body">
                                          {
                                            item.links.map((subItem:any, subIndex:any) => (
                                              <div className="mobile_menu-part" onClick={()=>{navigate(subItem.subUrl); toggleMenu();}} key={subIndex}>{subItem.title}</div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
            </div> */}

            <div className={`header-hamburger_menu ${menuOpen ? 'header-hamburger_menu--open' : ''} ${isMenuHovered ? 'menu-hovered' : ''}`}>
              <div className="gnb-btn">
                <button type="button" title="전체메뉴열기" onClick={toggleMenu}>
                  <div id="nav-icon" className={menuOpen ? 'open' : ''}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </button>
              </div>
              {/* 전체 메뉴 */}
              <div className={`gnb-all ${menuOpen ? 'open' : ''}`}>
                  <div className="alllogo" onClick={()=>{navigate('/'); toggleMenu();}}></div>
                  <ul>
                      <li>
                          <h3>휴양지</h3>
                          <ul>
                              <li><button type="button" onClick={()=>{navigate('/rest/bali'); toggleMenu();}}>발리</button></li>
                              <li><button type="button" onClick={()=>{navigate('/rest/hawaii'); toggleMenu();}}>하와이</button></li>
                              <li><button type="button" onClick={()=>{navigate('/rest/maldives'); toggleMenu();}}>몰디브</button></li>
                              <li><button type="button" onClick={()=>{navigate('/rest/cancun'); toggleMenu();}}>칸쿤</button></li>
                              <li><button type="button" onClick={()=>{navigate('/rest/thailand'); toggleMenu();}}>태국</button></li>
                              <li><button type="button" onClick={()=>{navigate('/rest/vietnam'); toggleMenu();}}>베트남</button></li>
                              <li><button type="button" onClick={()=>{navigate('/rest/ireland'); toggleMenu();}}>아일랜드</button></li>
                          </ul>
                      </li>
                      <li>
                          <h3>유럽</h3>
                          <ul>
                              <li><button type="button" onClick={()=>{navigate('/tour/italy'); toggleMenu();}}>이태리</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/switzerland'); toggleMenu();}}>스위스</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/spain'); toggleMenu();}}>스페인</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/czech'); toggleMenu();}}>체코</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/austria'); toggleMenu();}}>오스트리아</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/uk'); toggleMenu();}}>영국</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/greece'); toggleMenu();}}>그리스</button></li>
                              <li><button type="button" onClick={()=>{navigate('/tour/hungary'); toggleMenu();}}>헝가리</button></li>
                          </ul>
                      </li>
                      <li>
                          <h3>여행지미리가기</h3>
                          <ul>
                              <li><button type="button" onClick={()=>{navigate('/'); toggleMenu();}}>일정과 여행지정보 알려드려요</button></li>
                          </ul>
                      </li>
                      <li>
                          <h3>여행후기</h3>
                          <ul>
                              <li><button type="button" onClick={()=>{navigate('/'); toggleMenu();}}>실론투어 이용후기보기</button></li>
                          </ul>
                      </li>
                  </ul>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
