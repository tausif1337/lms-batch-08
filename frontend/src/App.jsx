import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      {/* The one public page. Everything else needs a token. */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Nested guards: the outer one wants a token, the inner one wants the
          admin role. Matches /api/register/, which is behind IsAdmin. A
          teacher or student typing this URL is sent back to /. */}
      <Route
        path="/register"
        element={
          <ProtectedRoute>
            <ProtectedRoute role="admin">
              <Register />
            </ProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
