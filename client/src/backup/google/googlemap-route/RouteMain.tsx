import React, { useState } from 'react';
import {createRoot} from 'react-dom/client';

import {APIProvider, Map} from '@vis.gl/react-google-maps';

import {RoutesApi} from './routes-api';
import ControlPanel from './control-panel';
import Route from './components/route';

import './RouteMain.css';

// @ts-ignore
const API_KEY: string = 'AIzaSyBAenBGKjoyyltFgnLDK_HXt7tHjHaYEs8';
// We use an "apiClient", in this case a glorified wrapper around a fetch-request
const apiClient = new RoutesApi(API_KEY);

const routeOrigin = {lng: 9.9004303, lat: 53.588241};
const routeDestination = {lng: 13.43765, lat: 52.52967};

// timestamp for tomorrow at 3pm UTC
const timestamp = Math.ceil(Date.now() / 86_400_000) * 86_400_000 + 900_000;
const departureTime = new Date(timestamp).toISOString();

const appearance = {
  walkingPolylineColor: '#000',
  defaultPolylineColor: '#7c7c7c',
  stepMarkerFillColor: '#333333',
  stepMarkerBorderColor: '#000000'
};

// for all options, see https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes#request-body
const routeOptions = {
  travelMode: 'TRANSIT',
  departureTime,
  computeAlternativeRoutes: false,
  units: 'METRIC'
};

const mapOptions = {
  mapId: '49ae42fed52588c3',
  defaultCenter: {lat: 22, lng: 0},
  defaultZoom: 2,
  gestureHandling: 'greedy',
  disableDefaultUI: true
};

const RouteMain = ({ onRouteStepsChange }: { onRouteStepsChange?: (steps: any[]) => void }) => {
  const [routeSteps, setRouteSteps] = useState<any[]>([]);

  const handleRouteStepsChange = (steps: any[]) => {
    setRouteSteps(steps);
    if (onRouteStepsChange) {
      onRouteStepsChange(steps);
    }
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <Map className={'route-api-example'} {...mapOptions}>
        <Route
          apiClient={apiClient}
          origin={routeOrigin}
          destination={routeDestination}
          routeOptions={routeOptions}
          appearance={appearance}
          onRouteStepsChange={handleRouteStepsChange}
        />
      </Map>

      <ControlPanel />
    </APIProvider>
  );
};
export default RouteMain;
