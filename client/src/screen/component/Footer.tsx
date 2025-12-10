import React from 'react';
import './footer.scss';
import logo_footer from '../lastimages/logo_white.png';
import { useNavigate } from 'react-router-dom';

export default function Footer(props: any) {
  let navigate = useNavigate();

  return (
    <>
      <div className="bottom_gnb">
        <ul>
          <li><button type="button">회사소개</button></li>
          <li><button type="button">오시는길</button></li>
          <li><button type="button">개인정보취급방침</button></li>
          <li><button type="button">여행자약관</button></li>
          <li><button type="button" onClick={() => navigate('/admin')}>관리자</button></li>
        </ul>
      </div>

      <footer id="footer">
        <div id="footerInner" className="clearfix">
          <article id="footerBottom">
            <div className="area clearfix">
              {/* 푸터 하단 왼쪽 */}
              <article className="footer-left-con">
                <span className="foot-logo">
                  <img src={logo_footer} alt="실론투어" />
                </span>
              </article>
              {/* 푸터 하단 오른쪽 */}
              <article className="footer-right-con">
                <div className="footer-address">
                  <div className="footer-address-txt">
                    <p>주소 : 대구광역시 동덕로 36-19 송죽빌딩 4층</p>
                    <p>
                      <span>TEL : 053-216-8275</span> <em></em>
                    </p>
                    <p>대표: 조동희, 관리책임자: 조수환</p>
                    <p>사업자 등록번호: 504-81-67308</p>
                  </div>
                </div>
                <div className="footer-copyright">
                  &copy; Copyrightⓒ비마이게스트. All Rights Reserved
                </div>
              </article>
            </div>
          </article>
        </div>
      </footer>
    </>
  );
}
