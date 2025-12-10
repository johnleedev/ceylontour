import Header from "../..//component/Header";
import { Route, Routes } from "react-router-dom";
import TourMain from "./TourMain";
import NationList from "./pages/NationList";
import TourDetail from "./pages/TourDetail";
import Footer from "../..//component/Footer";


export default function TourRouter() {
  return (
    <div>
      <Header />
      <Routes >
        <Route path="/main" element={<TourMain />}/>
        <Route path="/list" element={<NationList />}/>
        <Route path="/detail" element={<TourDetail />}/>
      </Routes>
      <Footer />
    </div>
  );
  
}
