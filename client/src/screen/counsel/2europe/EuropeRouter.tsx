import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import EuropeTripPage from "./1trip/EuropeTripPage";
import EuropeCityPage from "./2city/EuropeCityPage";
import EuropeCityDetail from "./2city/EuropeCityDetail";
import EuropeScheduleRecommend from "./3schedule/EuropeScheduleRecommend";



export default function TourRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<EuropeTripPage />}/>
        <Route path="/city" element={<EuropeCityPage />}/>
        <Route path="/citydetail" element={<EuropeCityDetail />}/>
        <Route path="/schedulerecommend" element={<EuropeScheduleRecommend />}/>

        
      </Routes>
    </div>
  );
  
}
