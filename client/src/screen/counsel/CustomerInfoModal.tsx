import React, { useState } from 'react';
import './CustomerInfoModal.scss';

interface CustomerInfoModalProps {
  onStart: () => void;
  onClose: () => void;
}

export default function CustomerInfoModal({ onStart, onClose }: CustomerInfoModalProps) {
  const [formData, setFormData] = useState({
    theme: ['honeymoon'],
    customer1Name: '',
    customer1Phone: '',
    customer2Name: '',
    customer2Phone: '',
    destination: '',
    weddingDate: '',
    travelPeriod: '',
    travelStyle: [] as string[],
    flightStyle: [] as string[],
    accommodationPreference: [] as string[],
    wantsAndNeeds: '',
    selfTicketing: false,
    beforeTicketing: false
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
                  <label>고객명</label>
                  <input
                    type='text'
                    name='customer1Name'
                    value={formData.customer1Name}
                    onChange={handleInputChange}
                    placeholder='고객명'
                  />
                </div>
                <div className='input-group'>
                  <label>연락처</label>
                  <input
                    type='tel'
                    name='customer1Phone'
                    value={formData.customer1Phone}
                    onChange={handleInputChange}
                    placeholder='연락처'
                  />
                </div>
              </div>
            </div>

            {/* 고객 정보 - 두 번째 */}
            <div className='form-section'>
              <div className='form-row'>
                <div className='input-group'>
                  <label>고객명</label>
                  <input
                    type='text'
                    name='customer2Name'
                    value={formData.customer2Name}
                    onChange={handleInputChange}
                    placeholder='고객명'
                  />
                </div>
                <div className='input-group'>
                  <label>연락처</label>
                  <input
                    type='tel'
                    name='customer2Phone'
                    value={formData.customer2Phone}
                    onChange={handleInputChange}
                    placeholder='연락처'
                  />
                </div>
              </div>
            </div>

            {/* 관심여행지, 결혼예정일, 여행기간 */}
            <div className='form-section'>
              <div className='input-group full-width'>
                <label>관심여행지</label>
                <input
                  type='text'
                  name='destination'
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder='관심여행지'
                />
              </div>
            </div>

            <div className='form-section'>
              <div className='form-row'>
                <div className='input-group'>
                  <label>결혼예정일</label>
                  <div className='input-with-icon'>
                    <input
                      type='text'
                      name='weddingDate'
                      value={formData.weddingDate}
                      onChange={handleInputChange}
                      placeholder='결혼예정일'
                    />
                    <span className='calendar-icon'>📅</span>
                  </div>
                </div>
                <div className='input-group'>
                  <label>여행기간</label>
                  <div className='input-with-icon'>
                    <input
                      type='text'
                      name='travelPeriod'
                      value={formData.travelPeriod}
                      onChange={handleInputChange}
                      placeholder='여행기간'
                    />
                    <span className='calendar-icon'>📅</span>
                  </div>
                </div>
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
              바로가기
            </button>
            <button className='start-button' onClick={onStart}>
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
