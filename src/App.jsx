import {Routes, Route} from "react-router-dom";

import Signup from "./Pages/Signup/Signup";
import Login from "./Pages/Login/Login";
import './Theme/Global.css'

function Sponsor() {
  return <h1>Sponsor Page</h1>;
}

function SME() {
  return <h1>SME Page</h1>;
}

function NGO() {
  return <h1>NGO Page</h1>;
}

function App() {
  return (
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sponsor" element={<Sponsor/>} />
        <Route path="/sme" element={<SME />} />
        <Route path="/ngo" element={<NGO />} />
    </Routes>
    
  );
  
}

export default App
