
import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
// import SmeDash from "./Components/SmeDash/SmeDash";
import NgoDash from "./Components/NgoDash/NgoDash";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        {/* <Route index element={<SmeDash/>} /> */}
           {/* <Route path="/" element={<Signup />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route index element={<NgoDash/>} />

      </Route>
    </Routes>
  );
}

export default App;

// import {Routes, Route} from "react-router-dom";

// import HomePage from "./Pages/HomePage/HomePage"
// import Signup from "./Pages/Signup/Signup";
// import Login from "./Pages/Login/Login";
// import './Theme/Global.css'

// function Sponsor() {
//   return <h1>Sponsor Page</h1>;
// }

// function SME() {
//   return <h1>SME Page</h1>;
// }

// function NGO() {
//   return <h1>NGO Page</h1>;
// }





// function App() {
//   return (
//       <Routes>
//            <Route path="/" element={<HomePage />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/sponsor" element={<Sponsor/>} />
//         <Route path="/sme" element={<SME />} />
//         <Route path="/ngo" element={<NGO />} />