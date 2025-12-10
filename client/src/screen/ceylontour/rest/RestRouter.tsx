import Header from "../../component/Header";
import { Route, Routes } from "react-router-dom";
import RestMain from "./RestMain";
import RestDetail from "./pages/ResortDetail";



export default function RestRouter() {
  return (
    <div>
      <Header />
      <Routes >
        <Route path="/main" element={<RestMain />}/>
        <Route path="/detail" element={<RestDetail />}/>
      </Routes>
    </div>
  );
  
}
