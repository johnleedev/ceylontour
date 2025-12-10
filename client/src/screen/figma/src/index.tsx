import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ComponentScreen } from "./screens/ComponentScreen";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ComponentScreen />
  </StrictMode>,
);
