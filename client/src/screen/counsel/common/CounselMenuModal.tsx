import React, { useState, useEffect } from 'react';
import './CounselMainHeader.scss';
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import { AdminURL } from '../../../MainURL';

interface MenuItem {
  id: string;
  name: string;
  path: string;
}

interface Destination {
  id: string;
  name: string;
  image?: string;
  rawData?: any;
}

interface CounselMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 메뉴 항목 (모든 헤더에서 공통으로 사용)
const menuItems: MenuItem[] = [
  { id: 'rest', name: '휴양지', path: '/counsel/rest' },
  { id: 'tour', name: '유럽', path: '/counsel/tour' },
  { id: 'america', name: '미주', path: '/counsel' },
  { id: 'australia', name: '호주', path: '/counsel' },
  { id: 'estimate', name: '견적내기', path: '/counsel' },
  { id: 'list', name: '리스트', path: '/counsel' },
  { id: 'account', name: '계정', path: '/counsel' },
];


const CounselMenuModal: React.FC<CounselMenuModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string>('');

  // 모달이 열릴 때 항상 첫 번째 메뉴를 기본 선택 (어느 헤더에서 열리든 동일하게 동작)
  useEffect(() => {
    if (isOpen && menuItems.length > 0) {
      // 항상 첫 번째 메뉴('rest')를 기본 선택
      setActiveMenuId(menuItems[0].id);
    } else if (!isOpen) {
      // 모달이 닫히면 초기화
      setActiveMenuId('');
      setDestinations([]);
    }
  }, [isOpen, menuItems]);

  // 메뉴에 따라 데이터 가져오기
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeMenuId === 'rest') {
          // 휴양지: 도시 목록 가져오기
          const response = await fetch(`${AdminURL}/ceylontour/getcitylistrest`);
          if (!response.ok) {
            throw new Error('데이터를 가져오는데 실패했습니다.');
          }
          const data = await response.json();
          
          const formattedDestinations: Destination[] = Array.isArray(data) 
            ? data
                .filter((item: any) => {
                  return item.isView === 'true' && item.locationType === '휴양지';
                })
                .map((item: any) => {
                  let imageUrl = '';
                  try {
                    const images = JSON.parse(item.inputImage || '[]');
                    if (Array.isArray(images) && images.length > 0 && images[0]) {
                      imageUrl = images[0];
                    }
                  } catch (e) {
                    // 파싱 실패 시 기본값 사용
                  }

                  return {
                    id: String(item.id),
                    name: item.cityKo || item.nation || '',
                    image: imageUrl, // 이미지 파일명만 저장
                    rawData: item
                  };
                })
            : [];
          
          // 중복 제거
          const uniqueDestinations = formattedDestinations.reduce((acc: Destination[], current: Destination) => {
            const existingIndex = acc.findIndex(item => item.name === current.name);
            if (existingIndex === -1) {
              acc.push(current);
            } else {
              if (parseInt(current.id) < parseInt(acc[existingIndex].id)) {
                acc[existingIndex] = current;
              }
            }
            return acc;
          }, []);
          
          setDestinations(uniqueDestinations);
        } else if (activeMenuId === 'tour') {
          // 유럽: 국가 목록 가져오기
          const locationType = '유럽';
          const nationResponse = await fetch(`${AdminURL}/ceylontour/getnationlisttour/${locationType}`);
          if (!nationResponse.ok) {
            throw new Error('데이터를 가져오는데 실패했습니다.');
          }
          const nationData = await nationResponse.json();
          
          const nationDestinations: Destination[] = Array.isArray(nationData) 
            ? nationData
                .filter((nation: any) => {
                  return nation.isView === 'true';
                })
                .map((nation: any) => {
                  let imageUrl = '';
                  try {
                    const nationImages = JSON.parse(nation.inputImage || '[]');
                    if (Array.isArray(nationImages) && nationImages.length > 0 && nationImages[0]) {
                      imageUrl = nationImages[0];
                    }
                  } catch (e) {
                    // 파싱 실패 시 기본값 사용
                  }

                  return {
                    id: String(nation.id),
                    name: nation.nationKo || '',
                    image: imageUrl, // 이미지 파일명만 저장
                    rawData: nation
                  };
                })
            : [];
          
          setDestinations(nationDestinations);
        } else {
          // 다른 메뉴는 빈 화면 표시
          setDestinations([]);
        }
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, activeMenuId]);

  return (
    <div className={`fullscreen-modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-logo-wrapper">
            <div className="modal-logo" onClick={() => { navigate('/counsel'); onClose(); }}>
              <div className="logo-text">
                <span className="logo-main">CEYLON TOUR</span>
              </div>
              <div className="logo-tagline">honeymoon and vacation</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-sidebar">
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`sidebar-nav-item ${activeMenuId === item.id ? 'active' : ''}`}
                  onClick={() => { 
                    setActiveMenuId(item.id);
                    // navigate는 하지 않고 모달 내에서만 메뉴 전환
                  }}
                >
                  <span className="nav-item-text">{item.name}</span>
                  {activeMenuId === item.id && (
                    <IoIosArrowForward className="nav-arrow" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="modal-main-content">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>로딩 중...</div>
            ) : destinations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>데이터가 없습니다.</div>
            ) : (
              <div className="destinations-grid">
                {destinations.map((destination) => {
                  // RestTripPage와 EuropeTripPage와 동일한 방식으로 이미지 경로 구성
                  const imageFolder = activeMenuId === 'rest' ? 'cityimages' : 'nationimages';
                  const imagePath = destination.image 
                    ? `${AdminURL}/images/${imageFolder}/${destination.image}`
                    : '';
                  
                  return (
                    <div
                      key={destination.id}
                      className="destination-item"
                      onClick={() => {
                        // 여행지 클릭 시 처리
                        if (activeMenuId === 'rest') {
                          // 휴양지: RestTripPage로 이동
                          navigate('/counsel/rest');
                        } else if (activeMenuId === 'tour') {
                          // 유럽: EuropeTripPage로 이동
                          navigate('/counsel/europe');
                        }
                        onClose();
                      }}
                    >
                      <div className="destination-image">
                        <img 
                          src={imagePath} 
                          alt={destination.name}
                          className="image"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: imagePath ? 'block' : 'none'
                          }}
                          onError={(e) => {
                            // 이미지 로드 실패 시 플레이스홀더 표시
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                          onLoad={(e) => {
                            // 이미지 로드 성공 시 플레이스홀더 숨기기
                            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'none';
                            }
                          }}
                        />
                        <div 
                          className="destination-placeholder"
                          style={{
                            display: imagePath ? 'none' : 'flex'
                          }}
                        >
                          {destination.name}
                        </div>
                      </div>
                      <div className="destination-name">{destination.name}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselMenuModal;
