import React from "react";
import ReactDOM from "react-dom/client";
// Dimuat sebelum index.css agar gaya kustom kita bisa menimpa gaya bawaan library
import "react-day-picker/style.css";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "./context/ToastProvider";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
