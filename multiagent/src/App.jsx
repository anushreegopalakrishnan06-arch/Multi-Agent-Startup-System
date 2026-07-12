import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import EditProfile from "./pages/EditProfile";
import Home from "./pages/home";
import Validation from "./pages/validation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/validation" element={<Validation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;