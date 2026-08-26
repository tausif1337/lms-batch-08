import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// Which page shows for which address.
//
// Each page checks for itself whether the visitor is allowed to see it, so
// there is nothing clever going on here - it is a plain list.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* "*" means anything that did not match a line above. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
