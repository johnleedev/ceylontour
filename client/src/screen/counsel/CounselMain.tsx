import React, { useState, useEffect } from 'react';
import './CounselMain.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import { recoilCounselFormData, recoilUserInfo } from '../../RecoilStore';
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import CounselMainHeader from './common/CounselMainHeader';
import CustomerInfoModal from './CustomerInfoModal';
import axios from 'axios';
import { AdminURL } from '../../MainURL';

interface CounselForm {
  theme: string[];
  customer1Name: string;
  customer1Phone: string;
  customer2Name: string;
  customer2Phone: string;
  destination: string;
  travelPeriod: string;
  needs: string;
  selfTicketing: boolean;
  beforeTicketing: boolean;
}

export default function CounselMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const [counselFormData, setCounselFormData] = useRecoilState(recoilCounselFormData);
  const userInfo = useRecoilValue(recoilUserInfo);
  const [formData, setFormData] = useState<CounselForm>({
    theme: ['honeymoon'],
    customer1Name: '',
    customer1Phone: '',
    customer2Name: '',
    customer2Phone: '',
    destination: '',
    travelPeriod: '',
    needs: '',
    selfTicketing: false,
    beforeTicketing: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<CounselForm>>({});
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [showEstimateList, setShowEstimateList] = useState(false);
  const [estimateList, setEstimateList] = useState<any[]>([]);
  const [filterUserName, setFilterUserName] = useState<string | null>(null);
  const [loadingEstimateList, setLoadingEstimateList] = useState(false);

  const travelDestinations = [
    {
      id: 'rest',
      name: '휴양지',
      image: require('../images/counsel/main/mainCard1.png'),
    },
    {
      id: 'europe',
      name: '유럽',
      image: require('../images/counsel/main/mainCard2.png'),
    },
    {
      id: 'america',
      name: '미주',
      image: require('../images/counsel/main/mainCard3.png'),
    },
    {
      id: 'australia',
      name: '호주',
      image: require('../images/counsel/main/mainCard4.png'),
    },
    {
      id: 'multi',
      name: '다구간',
      image: require('../images/counsel/main/mainCard5.png'),
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<CounselForm> = {};

    if (!formData.customer1Name.trim()) {
      newErrors.customer1Name = '고객1 성함을 입력해주세요';
    }

    if (!formData.customer1Phone.trim()) {
      newErrors.customer1Phone = '고객1 연락처를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThemeChange = (theme: string) => {
    setFormData(prev => {
      if (prev.theme.includes(theme)) {
        // Remove the theme if already selected
        return { ...prev, theme: prev.theme.filter(t => t !== theme) };
      } else {
        // Add the theme
        return { ...prev, theme: [...prev.theme, theme] };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name as keyof CounselForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const calculateDuration = (dateRange: string): string => {
    if (!dateRange) return '0박 0일';
    
    // Extract dates from format like "2025-12-30 ~ 2026-01-12"
    const dates = dateRange.split('~').map(d => d.trim());
    if (dates.length !== 2) return '0박 0일';
    
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '0박 0일';
    
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = diffDays - 1;
    
    return `${nights}박 ${diffDays}일`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('상담 신청 데이터:', formData);
      
      // Get the first theme (허니문, 가족여행, FIT, etc.)
      const themeLabel = formData.theme[0] === 'honeymoon' ? '허니문' :
                        formData.theme[0] === 'family' ? '가족여행' :
                        formData.theme[0] === 'fit' ? 'FIT' :
                        formData.theme[0] === 'corporate' ? '기업/워크샵' : '허니문';
      
      // Calculate duration from travelPeriod
      const duration = calculateDuration(formData.travelPeriod);
      
      // Save to Recoil store
      setCounselFormData({
        customerName: formData.customer1Name || '고객',
        theme: themeLabel,
        destination: formData.destination,
        travelDate: formData.travelPeriod,
        duration: duration
      });
      
      setSubmitStatus('success');
      
      setFormData({
        theme: ['honeymoon'],
        customer1Name: '',
        customer1Phone: '',
        customer2Name: '',
        customer2Phone: '',
        destination: '',
        travelPeriod: '',
        needs: '',
        selfTicketing: false,
        beforeTicketing: false
      });
      setErrors({});
      
      // 성공 후 폼 닫기
      setTimeout(() => {
        setShowConsultForm(false);
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToDestination = (destination: string) => {
    // '휴양지' 클릭 시 '/counsel/rest'로 이동
    if (destination === 'rest') {
      navigate('/counsel/rest');
      return;
    }
    // '관광지' 클릭 시 '/counsel/tour'로 이동
    if (destination === 'europe') {
      navigate('/counsel/europe/');
      return;
    }
    if (destination === 'america') {
      navigate('/counsel/america');
      return;
    }
    if (destination === 'australia') {
      navigate('/counsel/australia');
      return;
    }
    
    // 기타 목적지는 기존 로직 유지
    setFormData(prev => ({
      ...prev,
      destination: destination
    }));
    setShowConsultForm(true);
  };

  const handleDestinationClick = (destination: string) => {
    // 모달 열기
    setSelectedDestination(destination);
    setShowCustomerModal(true);
  };

  const handleStartClick = () => {
    // 모달 닫기
    setShowCustomerModal(false);
    
    // 선택된 destination으로 페이지 전환
    if (selectedDestination) {
      navigateToDestination(selectedDestination);
      setSelectedDestination(null);
    }
  };

  // 예약 리스트 가져오기
  const fetchEstimateList = async (userName?: string | null) => {
    try {
      setLoadingEstimateList(true);
      const params: any = {};
      if (userName) {
        // userName으로 필터링하는 경우 - 서버에서 userName 필드로 필터링
        // 현재 서버 API에는 userName 필터가 없으므로 클라이언트에서 필터링
      }
      const response = await axios.get(`${AdminURL}/ceylontour/getEstimateList`, { params });
      
      if (response.data && Array.isArray(response.data)) {
        let filteredList = response.data;
        if (userName) {
          filteredList = response.data.filter((item: any) => item.userName === userName);
        }
        setEstimateList(filteredList);
      } else {
        setEstimateList([]);
      }
    } catch (error) {
      console.error('예약 리스트 가져오기 오류:', error);
      setEstimateList([]);
    } finally {
      setLoadingEstimateList(false);
    }
  };

  // 리스트 섹션 클릭 핸들러
  const handleListSectionClick = () => {
    const newShowState = !showEstimateList;
    setShowEstimateList(newShowState);
    
    if (newShowState && estimateList.length === 0) {
      // 처음 열 때만 데이터 가져오기
      fetchEstimateList(filterUserName);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (userName: string | null) => {
    setFilterUserName(userName);
    fetchEstimateList(userName);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 날짜만 포맷팅 (YYYY-MM-DD)
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 예약 정보 클릭 핸들러
  const handleEstimateClick = (estimate: any) => {
    if (!estimate.id) return;
    
    // productType에 따라 다른 경로로 이동
    if (estimate.productType === 'rest') {
      navigate(`/counsel/rest/estimate?estimateId=${estimate.id}`);
    } else if (estimate.productType === 'tour') {
      navigate(`/counsel/europe/estimate?estimateId=${estimate.id}`);
    }
    window.scrollTo(0, 0);
  };

  // location.state에서 리스트 열기 정보 확인
  useEffect(() => {
    const state = location.state as { openEstimateList?: boolean } | null;
    if (state?.openEstimateList) {
      setShowEstimateList(true);
      // 리스트가 비어있으면 데이터 가져오기
      if (estimateList.length === 0) {
        fetchEstimateList(filterUserName);
      }
      // state 초기화 (뒤로가기 시 다시 열리지 않도록)
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <div className="counsel-main">
      <CounselMainHeader />
      {/* Hero Section */}
      <div className="counsel-hero">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-subtitle">실론투어 여행전문가와 함께하는</p>
            <h1 className="hero-title">Creating a Travel Schedule</h1>
          </div>
          
          {/* Destination Cards */}
          <div className="destination-cards">
            {travelDestinations.map((destination) => (
              <div 
                key={destination.id}
                className="destination-card"
                onClick={() => handleDestinationClick(destination.id)}
              >
                <div className="card-image">
                  <img src={destination.image} alt={destination.name} />
                </div>
                <div className="card-content">
                  <h3>{destination.name}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* List Section */}
          <div className="list-section"
            onClick={handleListSectionClick}
          >
            <h2 className="list-title">List</h2>
            <div 
              className={`chevron-down ${showEstimateList ? 'open' : ''}`}
              
            >
              <IoIosArrowDown />
            </div>
          </div>

          {/* Estimate List */}
          {showEstimateList && (
            <div className="estimate-list-container">
              {/* Filter Buttons */}
              <div className="estimate-filter-buttons">
                <button
                  className={`filter-btn ${filterUserName === null ? 'active' : ''}`}
                  onClick={() => handleFilterChange(null)}
                >
                  전체
                </button>
                {userInfo.name && (
                  <button
                    className={`filter-btn ${filterUserName === userInfo.name ? 'active' : ''}`}
                    onClick={() => handleFilterChange(userInfo.name)}
                  >
                    {userInfo.name}
                  </button>
                )}
              </div>

              {/* Estimate List */}
              {loadingEstimateList ? (
                <div className="estimate-list-loading">로딩 중...</div>
              ) : estimateList.length === 0 ? (
                <div className="estimate-list-empty">예약 정보가 없습니다.</div>
              ) : (
                <div className="estimate-table-wrapper">
                  <table className="estimate-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>예약일/출발일</th>
                        <th>등급</th>
                        <th>성명</th>
                        <th>연락처</th>
                        <th style={{ width: '50%' }}>여행상품</th>
                        {/* <th>여행기간</th>
                        <th>총요금</th>
                        <th>방문경로</th>
                        <th>담당자</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {estimateList.map((estimate: any, index: number) => (
                        <tr key={estimate.id} onClick={() => handleEstimateClick(estimate)}>
                          <td>{estimate.id || index + 1}</td>
                          <td>
                            <div className="date-cell">
                              <span className="date-reservation">{estimate.createdAt ? formatDateOnly(estimate.createdAt) : '-'}</span>
                              <span className="date-departure">{estimate.travelPeriodStart || '-'}</span>
                            </div>
                          </td>
                          <td>-</td>
                          <td>
                            {estimate.customer1Name || ''}
                            {estimate.customer2Name && `, ${estimate.customer2Name}`}
                          </td>
                          <td>
                            {estimate.customer1Phone || ''}
                            {estimate.customer2Phone && `, ${estimate.customer2Phone}`}
                          </td>
                          <td style={{ width: '50%' }}>{estimate.productName || '-'}</td>
                          {/* <td>
                            {estimate.travelPeriodStart && estimate.travelPeriodEnd
                              ? `${estimate.travelPeriodStart} ~ ${estimate.travelPeriodEnd}`
                              : '-'}
                          </td>
                          <td>{estimate.totalPrice ? `${estimate.totalPrice.toLocaleString()}원` : '-'}</td>
                          <td>-</td>
                          <td>{estimate.userName || '-'}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Info Modal */}
      {showCustomerModal && (
        <CustomerInfoModal
          onStart={handleStartClick}
          onClose={() => {
            setShowCustomerModal(false);
            setSelectedDestination(null);
          }}
        />
      )}
     
    </div>
  );
}