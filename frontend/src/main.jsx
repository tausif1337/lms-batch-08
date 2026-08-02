// This is the very first file that runs.
// It finds the empty <div id="root"> in index.html and puts our app inside it.

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// BrowserRouter is what lets the app have pages with different addresses,
// like /teachers and /courses.
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
