import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import TripPage from "./1trip/TourTripPage";
import HotelPage from "./3hotel/TourHotelPage";
import ScheduleRecommend from "./2schedule/TourScheduleRecommend";
import ScheduleCustom from "./2schedule/TourScheduleCustom";
import FlightPage from "./4flight/TourFlightPage";
import EstimatePage from "./5estimate/TourEstimatePage";


export default function TourRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<TripPage />}/>
        <Route path="/hotel" element={<HotelPage />}/>
        <Route path="/schedulerecommend" element={<ScheduleRecommend />}/>
        <Route path="/schedulecustom" element={<ScheduleCustom />}/>
        <Route path="/flight" element={<FlightPage />}/>
        <Route path="/estimate" element={<EstimatePage />}/>

        
      </Routes>
    </div>
  );
  
}
