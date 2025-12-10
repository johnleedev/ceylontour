import Header from "../../component/Header";
import { Route, Routes } from "react-router-dom";
import EstimateCustomer from "./EstimateCustomer";




export default function MainUserPage() {


  return (
    <div>
      <Header />
      <Routes >
        <Route path="/" element={<EstimateCustomer />}/>
      </Routes>
    </div>
  );
  
}
