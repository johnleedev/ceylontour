import React, { useState, useEffect } from 'react';
import './CustomerInfoModal.scss';
import { useRecoilState } from 'recoil';
import { recoilCustomerInfoFormData } from '../../RecoilStore';
import ModalDateInput from './ModalDateInput';
import { DateBoxSingle } from '../../boxs/DateBoxSingle'; 
import { DateBoxSingleTime } from '../../boxs/DateBoxSingleTime';

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
  const [showDateModal, setShowDateModal] = useState(false);

  // travelPeriod를 파싱하여 날짜 설정
  useEffect(() => {
    if (formData.travelPeriod) {
      const travelPeriod = formData.travelPeriod.trim();
      
      // "YYYY-MM-DD ~ YYYY-MM-DD" 형식인 경우
      if (travelPeriod.includes('~')) {
        const parts = travelPeriod.split('~').map(part => part.trim());
        if (parts.length === 2) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(parts[0]) && dateRegex.test(parts[1])) {
            const startDate = new Date(parts[0]);
            const endDate = new Date(parts[1]);
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              setTravelDateStart(startDate);
              setTravelDateEnd(endDate);
            }
          }
        }
      } else {
        // 단일 날짜인 경우
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(travelPeriod)) {
          const date = new Date(travelPeriod);
          if (!isNaN(date.getTime())) {
            setTravelDateStart(date);
            setTravelDateEnd(date);
          }
        }
      }
    }
  }, [formData.travelPeriod]);

  // 날짜 변경 핸들러 (ModalDateInput에서 호출)
  const handleDateChange = (startDateStr: string, endDateStr: string) => {
    if (startDateStr && endDateStr) {
      if (startDateStr === endDateStr) {
        setFormData(prev => ({
          ...prev,
          travelPeriod: startDateStr
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          travelPeriod: `${startDateStr} ~ ${endDateStr}`
        }));
      }
      setTravelDateStart(new Date(startDateStr));
      setTravelDateEnd(new Date(endDateStr));
    } else if (startDateStr) {
      setFormData(prev => ({
        ...prev,
        travelPeriod: startDateStr
      }));
      setTravelDateStart(new Date(startDateStr));
      setTravelDateEnd(null);
    } else {
      setFormData(prev => ({
        ...prev,
        travelPeriod: ''
      }));
      setTravelDateStart(null);
      setTravelDateEnd(null);
    }
  };

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

            <div className='form-section'>
              <div className='form-row'>
                <div className='input-group'>
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
                  <div className='input-with-icon'>
                    <input
                      type='text'
                      name='travelPeriod'
                      value={formData.travelPeriod}
                      onChange={handleInputChange}
                      onClick={() => setShowDateModal(true)}
                      placeholder='여행기간'
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <span className='calendar-icon'>📅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 예약일자 */}
            <div className='form-section'>
              <div className='input-group full-width'>
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
            <button className='start-button' onClick={onStart}>
              저장후 계속
            </button>
          </div>
        </div>
      </div>

      {/* 날짜 선택 모달 */}
      <ModalDateInput
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        dateStart={travelDateStart}
        dateEnd={travelDateEnd}
        onDateChange={handleDateChange}
      />
    </div>
  );
}
