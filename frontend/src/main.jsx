import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// This is where the whole app starts.
//
// index.html has an empty <div id="root">. React finds it and draws
// everything inside it. BrowserRouter wraps App so that the pages can
// switch when the address changes.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
