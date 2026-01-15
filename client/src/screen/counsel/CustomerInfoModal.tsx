import React, { useState, useEffect } from 'react';
import './CustomerInfoModal.scss';
import { useRecoilState } from 'recoil';
import { recoilCustomerInfoFormData } from '../../RecoilStore';
import { DateBoxSingle } from '../../boxs/DateBoxSingle'; 
import { DateBoxSingleTime } from '../../boxs/DateBoxSingleTime';
import { DateBoxDouble } from '../../boxs/DateBoxDouble';

interface CustomerInfoModalProps {
  onStart: () => void;
  onClose: () => void;
}

export default function CustomerInfoModal({ onStart, onClose }: CustomerInfoModalProps) {
  const [formData, setFormData] = useRecoilState(recoilCustomerInfoFormData);
  const [isComposing, setIsComposing] = React.useState<{ [key: string]: boolean }>({});
  
  // 여행기간 날짜 상태 및 모달 상태
  const [travelDateStart, setTravelDateStart] = useState<Date | null>(null);
  const [travelDateEnd, setTravelDateEnd] = useState<Date | null>(null);

  // travelPeriodStart와 travelPeriodEnd를 파싱하여 날짜 설정
  useEffect(() => {
    if (formData.travelPeriodStart) {
      try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(formData.travelPeriodStart.trim())) {
          setTravelDateStart(new Date(formData.travelPeriodStart.trim()));
        }
      } catch {
        setTravelDateStart(null);
      }
    } else {
      setTravelDateStart(null);
    }

    if (formData.travelPeriodEnd) {
      try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(formData.travelPeriodEnd.trim())) {
          setTravelDateEnd(new Date(formData.travelPeriodEnd.trim()));
        }
      } catch {
        setTravelDateEnd(null);
      }
    } else {
      setTravelDateEnd(null);
    }
  }, [formData.travelPeriodStart, formData.travelPeriodEnd]);

  // weddingDate가 없으면 오늘 날짜로 초기화
  useEffect(() => {
    if (!formData.weddingDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      setFormData(prev => ({
        ...prev,
        weddingDate: todayStr
      }));
    }
  }, [formData.weddingDate, setFormData]);


  const handleThemeChange = (theme: string) => {
    setFormData(prev => ({
      ...prev,
      theme: prev.theme.includes(theme)
        ? prev.theme.filter(t => t !== theme)
        : [...prev.theme, theme]
    }));
  };

  const handleCheckboxChange = (category: 'travelStyle' | 'flightStyle' | 'accommodationPreference', value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item: string) => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleCompositionStart = (e: React.CompositionEvent<HTMLInputElement>) => {
    const name = e.currentTarget.name;
    setIsComposing(prev => ({ ...prev, [name]: true }));
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const name = e.currentTarget.name;
    setIsComposing(prev => ({ ...prev, [name]: false }));
    // 조합 종료 후 값 처리
    handleInputChange(e as any, true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, forceProcess: boolean = false) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // 조합 중일 때는 필터링하지 않음 (한글 입력 중)
    if (!forceProcess && isComposing[name]) {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      return;
    }
    
    let processedValue = value;
    
    // 고객명 필드는 문자만 허용 (한글, 영문, 공백)
    if (name === 'customer1Name' || name === 'customer2Name') {
      processedValue = value.replace(/[^가-힣a-zA-Z\s]/g, '');
    }
    
    // 연락처 필드는 숫자와 하이픈만 허용
    if (name === 'customer1Phone' || name === 'customer2Phone') {
      processedValue = value.replace(/[^0-9-]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleReset = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    setFormData({
      theme: ['honeymoon'],
      customer1Name: '',
      customer1Phone: '',
      customer2Name: '',
      customer2Phone: '',
      destination: '',
      weddingDate: '',
      travelPeriodStart: '',
      travelPeriodEnd: '',
      reserveDate: todayStr,
      travelStyle: [],
      flightStyle: [],
      accommodationPreference: [],
      wantsAndNeeds: '',
      selfTicketing: false,
      beforeTicketing: false
    });

    setTravelDateStart(null);
    setTravelDateEnd(null);
  };

  return (
    <div className='customer-info-modal-overlay' onClick={onClose}>
      <div className='customer-info-modal' onClick={(e) => e.stopPropagation()}>
        <div className='customer-info-modal-content'>
          <h1>고객 정보</h1>
          
          <div className='modal-form-body'>
            {/* 여행 목적 */}
            <div className='form-section'>
              <div className='theme-checkboxes'>
                <label className='theme-checkbox'>
                  <input
                    type='checkbox'
                    checked={formData.theme.includes('honeymoon')}
                    onChange={() => handleThemeChange('honeymoon')}
                  />
                  <span>허니문</span>
                </label>
                <label className='theme-checkbox'>
                  <input
                    type='checkbox'
                    checked={formData.theme.includes('family')}
                    onChange={() => handleThemeChange('family')}
                  />
                  <span>가족여행</span>
                </label>
                <label className='theme-checkbox'>
                  <input
                    type='checkbox'
                    checked={formData.theme.includes('fit')}
                    onChange={() => handleThemeChange('fit')}
                  />
                  <span>FIT</span>
                </label>
                <label className='theme-checkbox'>
                  <input
                    type='checkbox'
                    checked={formData.theme.includes('corporate')}
                    onChange={() => handleThemeChange('corporate')}
                  />
                  <span>기업/워크샵</span>
                </label>
              </div>
            </div>

            {/* 고객 정보 - 첫 번째 */}
            <div className='form-section'>
              <div className='form-row'>
                <div className='input-group'>
                  <input
                    type='text'
                    name='customer1Name'
                    value={formData.customer1Name}
                    onChange={handleInputChange}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder='고객명'
                  />
                </div>
                <div className='input-group'>
                  <input
                    type='tel'
                    name='customer1Phone'
                    value={formData.customer1Phone}
                    onChange={handleInputChange}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder='연락처'
                  />
                </div>
              </div>
            </div>

            {/* 고객 정보 - 두 번째 */}
            <div className='form-section'>
              <div className='form-row'>
                <div className='input-group'>
                  <input
                    type='text'
                    name='customer2Name'
                    value={formData.customer2Name}
                    onChange={handleInputChange}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder='고객명'
                  />
                </div>
                <div className='input-group'>
                  <input
                    type='tel'
                    name='customer2Phone'
                    value={formData.customer2Phone}
                    onChange={handleInputChange}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    placeholder='연락처'
                  />
                </div>
              </div>
            </div>

            {/* 관심여행지, 결혼예정일, 여행기간 */}
            <div className='form-section'>
              <div className='input-group full-width'>
                <input
                  type='text'
                  name='destination'
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder='관심여행지'
                />
              </div>
            </div>


            {/* 예약일자 */}
            <div className='form-section' style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <div className='input-group' style={{width: '30%'}}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333'
                  }}
                >
                  결혼예정일
                </label>
                <DateBoxSingle
                  width={'100%'}
                  date={formData.weddingDate ? new Date(formData.weddingDate) : new Date()}
                  setSelectDate={(dateStr: string) => {
                    if (dateStr) {
                      setFormData(prev => ({
                        ...prev,
                        weddingDate: dateStr
                      }));
                    }
                  }}
                />
              </div>
              <div className='input-group ' style={{width: '40%'}}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333'
                  }}
                >
                  여행일자
                </label>
                <DateBoxDouble
                  dateStart={travelDateStart}
                  dateEnd={travelDateEnd}
                  setSelectStartDate={(dateStr: string) => {
                    if (dateStr) {
                      setTravelDateStart(new Date(dateStr));
                      // travelPeriodStart 업데이트
                      setFormData(prev => ({
                        ...prev,
                        travelPeriodStart: dateStr
                      }));
                    }
                  }}
                  setSelectEndDate={(dateStr: string) => {
                    if (dateStr) {
                      setTravelDateEnd(new Date(dateStr));
                      // travelPeriodEnd 업데이트
                      setFormData(prev => ({
                        ...prev,
                        travelPeriodEnd: dateStr
                      }));
                    }
                  }}
                />
              </div>
              <div className='input-group' style={{width: '30%'}}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333'
                  }}
                >
                  예약일자
                </label>
                <DateBoxSingle
                  width={'100%'}
                  date={formData.reserveDate ? new Date(formData.reserveDate) : new Date()}
                  setSelectDate={(dateStr: string) => {
                    if (dateStr) {
                      setFormData(prev => ({
                        ...prev,
                        reserveDate: dateStr
                      }));
                    }
                  }}
                />
              </div>
            </div>


            {/* 여행 스타일 */}
            <div className='form-section'>
              <label className='section-label'>여행 스타일</label>
              <div className='checkbox-grid'>
                {['관광', '휴양', '체험', '경기/관광', '맛집탐방', '핫플 방문', '쇼핑', '프라이빗 투어', '스냅촬영&포토스팟'].map((item) => (
                  <label key={item} className='checkbox-item'>
                    <input
                      type='checkbox'
                      checked={formData.travelStyle.includes(item)}
                      onChange={() => handleCheckboxChange('travelStyle', item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 항공 스타일 */}
            <div className='form-section'>
              <label className='section-label'>항공 스타일</label>
              <div className='checkbox-grid'>
                {['직항', '경유', '상관없음'].map((item) => (
                  <label key={item} className='checkbox-item'>
                    <input
                      type='checkbox'
                      checked={formData.flightStyle.includes(item)}
                      onChange={() => handleCheckboxChange('flightStyle', item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 숙소 선호도 */}
            <div className='form-section'>
              <label className='section-label'>숙소 선호도</label>
              <div className='checkbox-grid'>
                {['가성비', '가심비', '위치', '뷰', '럭셔리', '자연과 조화', '로맨틱 분위기', '부티크 스타일'].map((item) => (
                  <label key={item} className='checkbox-item'>
                    <input
                      type='checkbox'
                      checked={formData.accommodationPreference.includes(item)}
                      onChange={() => handleCheckboxChange('accommodationPreference', item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Wants & Needs */}
            <div className='form-section'>
              <label className='section-label'>wants & needs</label>
              <textarea
                name='wantsAndNeeds'
                value={formData.wantsAndNeeds}
                onChange={handleInputChange}
                placeholder='원하시는 사항을 입력해주세요'
                rows={4}
                className='textarea-input'
              />
            </div>

            {/* 발권 옵션 */}
            <div className='form-section'>
              <div className='form-row'>
                <label className='checkbox-item'>
                  <input
                    type='checkbox'
                    name='selfTicketing'
                    checked={formData.selfTicketing}
                    onChange={handleInputChange}
                  />
                  <span>본인발권</span>
                </label>
                <label className='checkbox-item'>
                  <input
                    type='checkbox'
                    name='beforeTicketing'
                    checked={formData.beforeTicketing}
                    onChange={handleInputChange}
                  />
                  <span>발권전</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className='modal-footer'>
            <button className='shortcut-button' onClick={onClose}>
              닫기
            </button>
            <button className='shortcut-button' onClick={handleReset}>
              초기화
            </button>
            <button className='start-button' onClick={onStart}>
              저장후 계속
            </button>
          </div>
        </div>
      </div>

     
    </div>
  );
}
