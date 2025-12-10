import React from 'react';
import './RouteDetails.scss';

interface RouteDetailsProps {
  routeSteps: any[];
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ routeSteps }) => {
  if (routeSteps.length === 0) return null;

  return (
    <div className="route-steps-info">
      <h4>경로 상세 정보</h4>
      <div className="route-steps-container">
        {routeSteps.map((step, index) => (
          <div key={index} className="route-step-item">
            <div className="step-header">
              <span className="step-number">{index + 1}</span>
              <span className="step-mode">
                {step.travelMode === 'WALK' ? '🚶 도보' : 
                 step.travelMode === 'TRANSIT' ? '🚌 대중교통' : 
                 step.travelMode === 'DRIVE' ? '🚗 자동차' : step.travelMode}
              </span>
              <span className="step-distance">{step.localizedValues?.distance?.text || '거리 정보 없음'}</span>
              <span className="step-duration">{step.localizedValues?.staticDuration?.text || '시간 정보 없음'}</span>
            </div>
            <div className="step-instruction">
              {step.navigationInstruction?.instructions || '지시사항 없음'}
            </div>
            {step.transitDetails && (
              <div className="transit-details">
                <div className="transit-line">
                  {step.transitDetails.transitLine?.nameShort || step.transitDetails.transitLine?.name}
                  {step.transitDetails.transitLine?.color && (
                    <span 
                      className="transit-color" 
                      style={{backgroundColor: step.transitDetails.transitLine.color}}
                    ></span>
                  )}
                </div>
                <div className="transit-stops">
                  <span>출발: {step.transitDetails.stopDetails?.departureStop?.name}</span>
                  <span>도착: {step.transitDetails.stopDetails?.arrivalStop?.name}</span>
                </div>
                <div className="transit-times">
                  <span>출발시간: {step.transitDetails.localizedValues?.departureTime?.time?.text}</span>
                  <span>도착시간: {step.transitDetails.localizedValues?.arrivalTime?.time?.text}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteDetails;
