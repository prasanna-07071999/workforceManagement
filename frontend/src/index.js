import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { LoaderProvider } from "./context/LoaderContext";

ReactDOM.render(
  <React.StrictMode>
    <LoaderProvider> 
      <App />
    </LoaderProvider>
  </React.StrictMode>,
  document.getElementById("root")
);