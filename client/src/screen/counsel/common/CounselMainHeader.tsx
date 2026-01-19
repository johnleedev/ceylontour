import React, { useState, useEffect } from 'react';
import './CounselMainHeader.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilCounselFormData, recoilUserInfo } from '../../../RecoilStore';
import logoImage from '../../images/counsel/logo.png';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import CounselMenuModal from './CounselMenuModal';

const CounselMainHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const counselFormData = useRecoilValue(recoilCounselFormData);
  const userInfo = useRecoilValue(recoilUserInfo);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // 검색 기능 구현
      console.log('검색어:', searchValue);
    }
  };

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    // 메뉴가 열릴 때 body 스크롤 막기
    if (newMenuState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const formatTravelInfo = () => {
    if (!counselFormData.customerName && !counselFormData.destination) {
      return '';
    }
    
    const customer = counselFormData.customerName || '고객';
    const theme = counselFormData.theme || '허니문';
    const destination = counselFormData.destination || '목적지';
    const date = counselFormData.travelDate || '';
    const duration = counselFormData.duration ? ` (${counselFormData.duration})` : '';
    
    return `${customer}, ${destination} ${theme} ${date}${duration}`;
  };

  return (
    <div className="counsel-header">
      <div className="header-container">

        <div className="header-left">
          {/* 로고 */}
          <div className="header-logo" onClick={() => navigate('/counsel')}>
            <img src={logoImage} alt="CEYLON TOUR" />
          </div>

          {/* 여행 정보 표시 */}
          {counselFormData.customerName && (
            <div className="header-travel-info">
              {formatTravelInfo()}
            </div>
          )}
        </div>

        {/* 사용자 이름 + 서치바 */}
        <div className="header-search-wrapper">
          {userInfo.name !== '' && (
            <div className="header-user-name">
              <span>{userInfo.name}님 환영합니다.</span>
            </div>
          )}
          <div className="header-search">
            <form onSubmit={handleSearch} className="search-form">
              <HiMagnifyingGlass className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>
          </div>
        </div>

        {/* 햄버거버튼 */}
        <button 
          className={`header-hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
       
      </div>

      {/* 전체 화면 모달 */}
      <CounselMenuModal
        isOpen={isMenuOpen}
        onClose={closeMenu}
      />
    </div>
  );
};

export default CounselMainHeader;
