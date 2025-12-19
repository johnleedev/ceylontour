import React, { useState } from 'react';
import './CounselMain.scss';
import { useRecoilState } from 'recoil';
import { recoilCounselFormData } from '../../RecoilStore';
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import CounselMainHeader from './common/CounselMainHeader';
import CustomerInfoModal from './CustomerInfoModal';

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
  const [counselFormData, setCounselFormData] = useRecoilState(recoilCounselFormData);
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
          <div className="list-section">
            <h2 className="list-title">List</h2>
            <div className="chevron-down"><IoIosArrowDown /></div>
          </div>
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