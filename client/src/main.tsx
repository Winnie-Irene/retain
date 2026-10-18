import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import { App } from "./App";
import "@fontsource/pinyon-script/400.css";
import "@fontsource/jost/300.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element was not found");
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-sans)",
                background: "var(--paper)",
                border: "1px solid var(--rule-strong)",
                color: "var(--ink)",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);