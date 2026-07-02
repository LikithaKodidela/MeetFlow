import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";
import HomeComponent from "./pages/home.jsx";
import History from "./pages/history.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import withAuth from "./utils/withAuth";

// Protect the video meeting room — user must be logged in to join
const ProtectedVideoMeet = withAuth(VideoMeet);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/home"  element={<HomeComponent />} />
          <Route path="/history" element={<History/>} />
          <Route path='/:url' element={<ProtectedVideoMeet />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
