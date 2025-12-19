import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import EuropeTripPage from "./1trip/EuropeTripPage";
import EuropeHotelPage from "./3hotel/EuropeHotelPage";
import EuropeScheduleRecommend from "./2schedule/EuropeScheduleRecommend";
import EuropeScheduleCustom from "./2schedule/EuropeScheduleCustom";
import EuropeFlightPage from "./4flight/EuropeFlightPage";
import EuropeEstimatePage from "./5estimate/EuropeEstimatePage";


export default function TourRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<EuropeTripPage />}/>
        <Route path="/hotel" element={<EuropeHotelPage />}/>
        <Route path="/schedulerecommend" element={<EuropeScheduleRecommend />}/>
        <Route path="/schedulecustom" element={<EuropeScheduleCustom />}/>
        <Route path="/flight" element={<EuropeFlightPage />}/>
        <Route path="/estimate" element={<EuropeEstimatePage />}/>

        
      </Routes>
    </div>
  );
  
}
