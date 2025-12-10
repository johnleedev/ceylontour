import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import TripPage from "./1trip/TourTripPage";
import HotelPage from "./3hotel/TourHotelPage";
import SchedulePage from "./2schedule/TourScheduleRecommend";
import FlightPage from "./4flight/TourFlightPage";
import EstimatePage from "./5estimate/TourEstimatePage";

import TourHotelPageHC from "./3hotel/TourHotelPageHC";

export default function TourRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<TripPage />}/>
        <Route path="/hotel" element={<HotelPage />}/>
        <Route path="/schedule" element={<SchedulePage />}/>
        <Route path="/flight" element={<FlightPage />}/>
        <Route path="/estimate" element={<EstimatePage />}/>

        <Route path="/hotelhc" element={<TourHotelPageHC />}/>
      </Routes>
    </div>
  );
  
}
