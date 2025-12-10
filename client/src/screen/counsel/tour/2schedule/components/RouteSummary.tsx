import React from 'react';
import './RouteSummary.scss';

interface RouteSummaryProps {
  routeSteps: any[];
}

interface RouteSummaryData {
  totalDistance: number;
  totalDuration: number;
  modeStats: { [key: string]: { count: number; distance: number; duration: number } };
  stepCount: number;
}

const RouteSummary: React.FC<RouteSummaryProps> = ({ routeSteps }) => {
  // 경로 요약 정보 계산
  const calculateRouteSummary = (steps: any[]): RouteSummaryData | null => {
    if (!steps || steps.length === 0) return null;

    let totalDistance = 0;
    let totalDuration = 0;
    const modeStats: { [key: string]: { count: number; distance: number; duration: number } } = {};

    steps.forEach(step => {
      const distance = step.distanceMeters || 0;
      const duration = step.staticDuration ? parseInt(step.staticDuration.replace('s', '')) : 0;
      const mode = step.travelMode;

      totalDistance += distance;
      totalDuration += duration;

      if (!modeStats[mode]) {
        modeStats[mode] = { count: 0, distance: 0, duration: 0 };
      }
      modeStats[mode].count += 1;
      modeStats[mode].distance += distance;
      modeStats[mode].duration += duration;
    });

    return {
      totalDistance: totalDistance,
      totalDuration: totalDuration,
      modeStats: modeStats,
      stepCount: steps.length
    };
  };

  const routeSummary = calculateRouteSummary(routeSteps);

  if (!routeSummary) return null;

  return (
    <div className="route-summary-info">
      <h4>경로 요약</h4>
      <div className="summary-stats">
        <div className="summary-item">
          <div className="summary-icon">📏</div>
          <div className="summary-content">
            <div className="summary-label">총 거리</div>
            <div className="summary-value">
              {(routeSummary.totalDistance / 1000).toFixed(1)} km
            </div>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">⏱️</div>
          <div className="summary-content">
            <div className="summary-label">총 소요시간</div>
            <div className="summary-value">
              {Math.floor(routeSummary.totalDuration / 3600)}시간 {Math.floor((routeSummary.totalDuration % 3600) / 60)}분
            </div>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">🛣️</div>
          <div className="summary-content">
            <div className="summary-label">경로 단계</div>
            <div className="summary-value">
              {routeSummary.stepCount}단계
            </div>
          </div>
        </div>
      </div>
      <div className="mode-breakdown">
        <h5>이동 수단별 통계</h5>
        <div className="mode-stats">
          {Object.entries(routeSummary.modeStats).map(([mode, stats]) => (
            <div key={mode} className="mode-stat-item">
              <div className="mode-icon">
                {mode === 'WALK' ? '🚶' : 
                 mode === 'TRANSIT' ? '🚌' : 
                 mode === 'DRIVE' ? '🚗' : '📍'}
              </div>
              <div className="mode-info">
                <div className="mode-name">
                  {mode === 'WALK' ? '도보' : 
                   mode === 'TRANSIT' ? '대중교통' : 
                   mode === 'DRIVE' ? '자동차' : mode}
                </div>
                <div className="mode-details">
                  <span>{stats.count}회</span>
                  <span>{(stats.distance / 1000).toFixed(1)}km</span>
                  <span>{Math.floor(stats.duration / 60)}분</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteSummary;
